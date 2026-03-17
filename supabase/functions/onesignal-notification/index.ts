import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ONESIGNAL_APP_ID = '0b9f4b28-d83e-4398-9625-134704d6aae8';
const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  type: 'loan_approved' | 'payment_due' | 'loan_disbursed' | 'payment_reminder' | 'custom';
  phone_number?: string;
  external_id?: string;
  title?: string;
  message?: string;
  data?: Record<string, string>;
  loan_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: NotificationPayload = await req.json();
    console.log('Notification request received:', payload);

    let title = payload.title;
    let message = payload.message;
    let url = 'https://www.shwarimpesa.co.ke/';

    // Set default messages based on notification type
    switch (payload.type) {
      case 'loan_approved':
        title = title || '🎉 Loan Approved!';
        message = message || 'Great news! Your loan application has been approved. Complete the payment to receive your funds.';
        url = 'https://www.shwarimpesa.co.ke/payment';
        break;
      case 'loan_disbursed':
        title = title || '💰 Loan Disbursed!';
        message = message || 'Your loan has been sent to your M-Pesa. Check your phone for the confirmation.';
        break;
      case 'payment_due':
        title = title || '⏰ Payment Due Soon';
        message = message || 'Your loan repayment is due soon. Please ensure you have sufficient funds.';
        url = 'https://www.shwarimpesa.co.ke/apply';
        break;
      case 'payment_reminder':
        title = title || '📅 Friendly Reminder';
        message = message || 'Don\'t forget about your upcoming loan repayment. Stay on track!';
        url = 'https://www.shwarimpesa.co.ke/apply';
        break;
      case 'custom':
        // Use provided title and message
        break;
    }

    // Build OneSignal notification payload
    const notificationPayload: Record<string, any> = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: message },
      url: url,
      data: payload.data || {},
    };

    // Target specific user by external_id (phone number) or send to all
    if (payload.external_id || payload.phone_number) {
      notificationPayload.include_aliases = {
        external_id: [payload.external_id || payload.phone_number]
      };
      notificationPayload.target_channel = "push";
    } else {
      // Send to all subscribed users (for broadcasts)
      notificationPayload.included_segments = ['Subscribed Users'];
    }

    console.log('Sending notification to OneSignal:', JSON.stringify(notificationPayload));

    // Send notification via OneSignal API
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(notificationPayload),
    });

    const result = await response.json();
    console.log('OneSignal response:', JSON.stringify(result));

    if (!response.ok) {
      console.error('OneSignal API error:', result);
      return new Response(JSON.stringify({ error: result }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Log notification to database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from('notification_logs').insert({
      phone_number: payload.phone_number || payload.external_id || 'broadcast',
      title: title,
      body: message,
      notification_type: payload.type,
      delivery_status: 'sent',
      loan_application_id: payload.loan_id || null,
    });

    return new Response(JSON.stringify({ 
      success: true, 
      notification_id: result.id,
      recipients: result.recipients 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
