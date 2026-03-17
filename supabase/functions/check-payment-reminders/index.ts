import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ONESIGNAL_APP_ID = '0b9f4b28-d83e-4398-9625-134704d6aae8';
const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Checking for payment reminders...');

    // Get loans with repayment due in the next 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: dueLoans, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('disbursement_status', 'completed')
      .eq('repayment_status', 'pending')
      .lte('repayment_date', threeDaysFromNow.toISOString())
      .gte('repayment_date', today.toISOString());

    if (error) {
      console.error('Error fetching due loans:', error);
      throw error;
    }

    console.log(`Found ${dueLoans?.length || 0} loans due soon`);

    const notifications = [];

    for (const loan of dueLoans || []) {
      const repaymentDate = new Date(loan.repayment_date);
      const daysUntilDue = Math.ceil((repaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      let title = '';
      let message = '';

      if (daysUntilDue === 0) {
        title = '⚠️ Payment Due Today!';
        message = `Your loan repayment of KSh ${Number(loan.repayment_amount).toLocaleString()} is due today. Please pay to avoid penalties.`;
      } else if (daysUntilDue === 1) {
        title = '⏰ Payment Due Tomorrow';
        message = `Your loan repayment of KSh ${Number(loan.repayment_amount).toLocaleString()} is due tomorrow.`;
      } else {
        title = '📅 Payment Reminder';
        message = `Your loan repayment of KSh ${Number(loan.repayment_amount).toLocaleString()} is due in ${daysUntilDue} days.`;
      }

      // Send notification via OneSignal
      const notificationPayload = {
        app_id: ONESIGNAL_APP_ID,
        headings: { en: title },
        contents: { en: message },
        url: 'https://www.shwarimpesa.co.ke/apply',
        include_aliases: {
          external_id: [loan.phone_number]
        },
        target_channel: "push",
      };

      try {
        const response = await fetch('https://onesignal.com/api/v1/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
          },
          body: JSON.stringify(notificationPayload),
        });

        const result = await response.json();
        console.log(`Notification sent to ${loan.phone_number}:`, result);

        // Log to database
        await supabase.from('notification_logs').insert({
          phone_number: loan.phone_number,
          title: title,
          body: message,
          notification_type: 'payment_reminder',
          delivery_status: response.ok ? 'sent' : 'failed',
          loan_application_id: loan.id,
        });

        notifications.push({
          phone: loan.phone_number,
          status: response.ok ? 'sent' : 'failed',
          loan_id: loan.id
        });

      } catch (notifError) {
        console.error(`Failed to send notification to ${loan.phone_number}:`, notifError);
        notifications.push({
          phone: loan.phone_number,
          status: 'error',
          loan_id: loan.id
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      checked: dueLoans?.length || 0,
      notifications 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in check-payment-reminders:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
