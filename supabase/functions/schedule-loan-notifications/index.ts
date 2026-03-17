import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting scheduled loan notification check...');

    // Get pending loan applications that haven't been notified recently
    const { data: pendingLoans, error: loansError } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('payment_status', 'pending')
      .eq('qualification_status', 'qualified')
      .order('created_at', { ascending: false });

    if (loansError) {
      console.error('Error fetching pending loans:', loansError);
      throw loansError;
    }

    if (!pendingLoans || pendingLoans.length === 0) {
      console.log('No pending loans found');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No pending loans to notify',
        processedCount: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${pendingLoans.length} pending loans`);

    // Check recent notifications to avoid spam
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: recentNotifications, error: notifError } = await supabase
      .from('notification_logs')
      .select('phone_number, loan_application_id')
      .gte('sent_at', oneHourAgo)
      .in('notification_type', ['loan_reminder', 'savings-reminder', 'processing-reminder']);

    if (notifError) {
      console.error('Error fetching recent notifications:', notifError);
    }

    // Create a set of recently notified combinations
    const recentlyNotified = new Set(
      (recentNotifications || []).map(n => `${n.phone_number}-${n.loan_application_id}`)
    );

    // Filter loans that haven't been notified recently
    const loansToNotify = pendingLoans.filter(loan => {
      const key = `${loan.phone_number}-${loan.id}`;
      return !recentlyNotified.has(key);
    });

    console.log(`${loansToNotify.length} loans need notifications (${pendingLoans.length - loansToNotify.length} recently notified)`);

    if (loansToNotify.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'All eligible loans have been notified recently',
        processedCount: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Group loans by phone number to send one notification per user
    const loansByPhone = new Map();
    loansToNotify.forEach(loan => {
      const phone = loan.phone_number;
      if (!loansByPhone.has(phone)) {
        loansByPhone.set(phone, []);
      }
      loansByPhone.get(phone).push(loan);
    });

    // Send notifications for each phone number
    let successCount = 0;
    let failureCount = 0;

    for (const [phoneNumber, loans] of loansByPhone) {
      try {
        // Take the most recent loan for this phone number
        const latestLoan = loans[0];
        
        // Check payment status to determine which step they're on
        const { data: payments, error: paymentsError } = await supabase
          .from('mpesa_payments')
          .select('*')
          .eq('phone_number', phoneNumber)
          .eq('payment_status', 'COMPLETED')
          .order('created_at', { ascending: false });
        
        if (paymentsError) {
          console.error('Error fetching payments:', paymentsError);
        }
        
        // Calculate total amount paid
        const totalPaid = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;
        const totalRequired = Number(latestLoan.excise_duty_amount);
        
        // Estimate savings amount (60-70% of total) and processing fee (30-40%)
        const estimatedSavings = Math.round(totalRequired * 0.65);
        const estimatedProcessingFee = totalRequired - estimatedSavings;
        
        // Calculate time since loan was approved
        const createdAt = new Date(latestLoan.created_at);
        const hoursSinceCreated = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60));
        
        // Determine notification message based on payment status
        let title = '';
        let body = '';
        let paymentType = '';
        
        if (totalPaid === 0) {
          // No payments made - notify for savings deposit
          paymentType = 'savings';
          title = '💰 Deposit Your Savings to Get Loan!';
          body = `Hi ${latestLoan.full_name}, deposit savings of Ksh ${estimatedSavings.toLocaleString()} to proceed with your Ksh ${latestLoan.loan_amount_requested.toLocaleString()} loan.`;
          
          if (hoursSinceCreated >= 24) {
            title = '⏰ Don\'t Miss Your Loan!';
            body = `Your Ksh ${latestLoan.loan_amount_requested.toLocaleString()} loan is waiting. Deposit savings now to continue.`;
          } else if (hoursSinceCreated >= 4) {
            title = '🔔 Savings Deposit Required';
            body = `Hi ${latestLoan.full_name}, complete your savings deposit of Ksh ${estimatedSavings.toLocaleString()} to proceed with your loan.`;
          }
        } else if (totalPaid < totalRequired) {
          // Savings paid, processing fee pending
          paymentType = 'processing';
          title = '💳 Complete Processing Fee!';
          body = `Almost there! Pay processing fee of Ksh ${estimatedProcessingFee.toLocaleString()} to receive your Ksh ${latestLoan.loan_amount_requested.toLocaleString()} loan.`;
          
          if (hoursSinceCreated >= 24) {
            title = '⏰ Final Step - Processing Fee!';
            body = `You\'re one step away! Complete processing fee payment to get your Ksh ${latestLoan.loan_amount_requested.toLocaleString()} loan instantly.`;
          } else if (hoursSinceCreated >= 4) {
            title = '🔔 Processing Fee Reminder';
            body = `Hi ${latestLoan.full_name}, complete your processing fee of Ksh ${estimatedProcessingFee.toLocaleString()} to receive your loan.`;
          }
        } else {
          // Both payments complete - skip notification
          console.log(`Loan ${latestLoan.id} has completed all payments, skipping notification`);
          continue;
        }

        // Create notification data
        const notification = {
          title: title,
          body: body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: paymentType === 'savings' ? 'savings-reminder' : 'processing-reminder',
          requireInteraction: true,
          actions: [
            {
              action: 'pay-now',
              title: paymentType === 'savings' ? '💰 Deposit Now' : '💳 Pay Now',
              icon: '/favicon.ico'
            },
            {
              action: 'dismiss',
              title: 'Later'
            }
          ],
          data: {
            url: '/apply',
            loanId: latestLoan.id,
            phoneNumber: phoneNumber,
            amount: paymentType === 'savings' ? estimatedSavings : estimatedProcessingFee,
            loanAmount: latestLoan.loan_amount_requested,
            paymentType: paymentType,
            timestamp: Date.now()
          }
        };

        // Send push notification
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-push-notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({
            phoneNumber: phoneNumber,
            notification: notification,
            loanApplicationId: latestLoan.id
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`Notification sent to ${phoneNumber}:`, result);
          successCount++;
        } else {
          console.error(`Failed to send notification to ${phoneNumber}:`, await response.text());
          failureCount++;
        }

      } catch (error) {
        console.error(`Error sending notification to ${phoneNumber}:`, error);
        failureCount++;
      }
    }

    console.log(`Notification batch complete: ${successCount} successful, ${failureCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      processedCount: loansByPhone.size,
      successCount,
      failureCount,
      totalPendingLoans: pendingLoans.length,
      eligibleForNotification: loansToNotify.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in schedule-loan-notifications function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});