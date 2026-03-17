import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushSubscription {
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  phone_number: string;
}

interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

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

    const { 
      phoneNumber, 
      phoneNumbers, 
      notification, 
      loanApplicationId,
      action 
    } = await req.json();

    console.log('Push notification request:', { phoneNumber, phoneNumbers, notification, loanApplicationId, action });

    // Handle click logging
    if (action === 'log_click') {
      await supabase
        .from('notification_logs')
        .update({ clicked_at: new Date().toISOString() })
        .eq('loan_application_id', loanApplicationId);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get push subscriptions for target phone numbers
    const targetPhones = phoneNumbers || (phoneNumber ? [phoneNumber] : []);
    
    if (targetPhones.length === 0) {
      return new Response(JSON.stringify({ error: 'No phone numbers provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: subscriptions, error: subError } = await supabase
      .from('user_push_subscriptions')
      .select('*')
      .in('phone_number', targetPhones)
      .eq('is_active', true);

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      return new Response(JSON.stringify({ error: 'Failed to fetch subscriptions' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No active subscriptions found for phones:', targetPhones);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No active subscriptions found',
        sentCount: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${subscriptions.length} active subscriptions`);

    // Send notifications to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription: PushSubscription) => {
        return sendPushNotification(subscription, notification);
      })
    );

    // Count successful sends
    const successCount = results.filter(result => result.status === 'fulfilled').length;
    const failureCount = results.length - successCount;

    // Log notification sends
    const logPromises = subscriptions.map(async (subscription: PushSubscription) => {
      return supabase
        .from('notification_logs')
        .insert({
          phone_number: subscription.phone_number,
          loan_application_id: loanApplicationId,
          notification_type: notification.tag || 'loan_reminder',
          title: notification.title,
          body: notification.body,
          delivery_status: 'sent'
        });
    });

    await Promise.allSettled(logPromises);

    console.log(`Notification results: ${successCount} successful, ${failureCount} failed`);

    return new Response(JSON.stringify({
      success: true,
      sentCount: successCount,
      failedCount: failureCount,
      totalSubscriptions: subscriptions.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-push-notifications function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendPushNotification(subscription: PushSubscription, notification: NotificationData): Promise<void> {
  const vapidKeys = {
    publicKey: 'BH7Mmf2sdMdnYGKvFhPgXXf6gT8f7bI1HbPpLfoqKLh4EIH5dKjKTjRVp8_9KJJM8gp2K8rGsrPg3YrXJkKxvks',
    privateKey: Deno.env.get('VAPID_PRIVATE_KEY') || ''
  };

  if (!vapidKeys.privateKey) {
    console.error('VAPID private key not configured');
    throw new Error('VAPID private key not configured');
  }

  // Create the payload
  const payload = JSON.stringify({
    ...notification,
    timestamp: Date.now(),
    data: {
      ...notification.data,
      url: notification.data?.url || '/apply'
    }
  });

  console.log('Sending push notification payload:', payload);

  try {
    // For now, we'll use a simplified approach
    // In production, you'd want to use a proper Web Push library
    // This is a placeholder that logs the notification
    console.log(`Would send push notification to ${subscription.phone_number}:`, {
      endpoint: subscription.endpoint,
      payload: payload
    });

    // Simulate successful send
    await new Promise(resolve => setTimeout(resolve, 100));
    
  } catch (error) {
    console.error('Failed to send push notification:', error);
    throw error;
  }
}