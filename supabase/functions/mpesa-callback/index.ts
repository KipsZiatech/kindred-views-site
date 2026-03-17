import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Function to send Telegram notification
async function sendTelegramNotification(
  supabase: any,
  paymentDetails: {
    amount: number;
    mpesaReceiptNumber: string;
    phoneNumber: string;
    customerName: string;
  }
) {
  const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('Telegram credentials not configured, skipping notification');
    return;
  }

  try {
    // Get today's date range for daily sum
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // Fetch all completed payments for today to calculate sum
    const { data: todayPayments, error: paymentsError } = await supabase
      .from('mpesa_payments')
      .select('amount')
      .eq('payment_status', 'COMPLETED')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    if (paymentsError) {
      console.error('Error fetching today payments:', paymentsError);
    }

    const dailyTotal = (todayPayments || []).reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const transactionCount = todayPayments?.length || 0;

    const timeStr = today.toLocaleTimeString('en-KE', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });

    // Format the real-time notification message
    let message = `🔔 *NEW PAYMENT RECEIVED*\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 *Amount: KES ${paymentDetails.amount.toLocaleString()}*\n`;
    message += `👤 Customer: ${paymentDetails.customerName}\n`;
    message += `📱 Phone: ${paymentDetails.phoneNumber}\n`;
    message += `🧾 Receipt: ${paymentDetails.mpesaReceiptNumber}\n`;
    message += `🕐 Time: ${timeStr}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `📊 *TODAY'S SUMMARY*\n`;
    message += `💵 Total: KES ${dailyTotal.toLocaleString()}\n`;
    message += `📝 Transactions: ${transactionCount}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `\n_Ziada Loans System_`;

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResponse.ok) {
      console.error('Telegram API error:', telegramResult);
    } else {
      console.log('Telegram notification sent successfully');
    }
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const callbackData = await req.json()
    console.log('M-Pesa callback received:', JSON.stringify(callbackData, null, 2))

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Extract callback data
    const stkCallback = callbackData.Body?.stkCallback
    if (!stkCallback) {
      console.error('Invalid callback format')
      return new Response('OK', { status: 200 })
    }

    const checkoutRequestId = stkCallback.CheckoutRequestID
    const resultCode = stkCallback.ResultCode
    const resultDesc = stkCallback.ResultDesc

    console.log(`Processing callback for ${checkoutRequestId}: ${resultCode} - ${resultDesc}`)

    // If payment was successful (ResultCode = 0)
    if (resultCode === 0) {
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || []
      
      // Extract payment details
      let amount = 0
      let mpesaReceiptNumber = ''
      let transactionDate = ''
      let phoneNumber = ''

      callbackMetadata.forEach((item: any) => {
        switch (item.Name) {
          case 'Amount':
            amount = item.Value
            break
          case 'MpesaReceiptNumber':
            mpesaReceiptNumber = item.Value
            break
          case 'TransactionDate':
            transactionDate = item.Value
            break
          case 'PhoneNumber':
            phoneNumber = item.Value
            break
        }
      })

      // Extract customer name from the main callback data if available
      const customerName = stkCallback.CustomerName || 'Unknown'

      console.log('Payment successful:', { amount, mpesaReceiptNumber, transactionDate, phoneNumber, customerName })

      // Update the payment record
      const { error: updateError } = await supabase
        .from('mpesa_payments')
        .update({
          transaction_code: mpesaReceiptNumber,
          verified_at: new Date().toISOString(),
          mpesa_message: `STK Push payment confirmed - Receipt: ${mpesaReceiptNumber}, Amount: ${amount}, Date: ${transactionDate}`,
          payment_date: new Date(transactionDate?.toString().replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6')).toISOString(),
          payment_status: 'COMPLETED',
          phone_number: phoneNumber,
          customer_name: customerName
        })
        .eq('checkout_request_id', checkoutRequestId)

      if (updateError) {
        console.error('Failed to update payment record:', updateError)
        
        // If update failed, try to insert a new record
        const { error: insertError } = await supabase
          .from('mpesa_payments')
          .insert({
            transaction_code: mpesaReceiptNumber,
            amount: amount,
            paybill_number: '4139425',
            account_name: 'Shwari M-Pesa',
            verified_at: new Date().toISOString(),
            mpesa_message: `STK Push payment confirmed - Receipt: ${mpesaReceiptNumber}, Amount: ${amount}, Date: ${transactionDate}`,
            payment_date: new Date(transactionDate?.toString().replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6')).toISOString(),
            checkout_request_id: checkoutRequestId,
            payment_status: 'COMPLETED',
            phone_number: phoneNumber,
            customer_name: customerName
          })

        if (insertError) {
          console.error('Failed to insert payment record:', insertError)
        }
      }

      // Send real-time Telegram notification for successful payment
      await sendTelegramNotification(supabase, {
        amount,
        mpesaReceiptNumber,
        phoneNumber: phoneNumber.toString(),
        customerName
      });

    } else {
      console.log(`Payment failed or cancelled: ${resultDesc}`)
      
      // Update the payment record to mark as failed
      const { error: updateError } = await supabase
        .from('mpesa_payments')
        .update({
          mpesa_message: `STK Push failed - ${resultDesc}`,
          verified_at: null,
          payment_status: 'FAILED'
        })
        .eq('checkout_request_id', checkoutRequestId)

      if (updateError) {
        console.error('Failed to update failed payment record:', updateError)
      }
    }

    // Always return success to M-Pesa
    return new Response('OK', { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })

  } catch (error) {
    console.error('Callback processing error:', error)
    return new Response('OK', { 
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
})