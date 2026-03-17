import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // VAPID public key - in production, this should come from environment
  const vapidPublicKey = 'BH7Mmf2sdMdnYGKvFhPgXXf6gT8f7bI1HbPpLfoqKLh4EIH5dKjKTjRVp8_9KJJM8gp2K8rGsrPg3YrXJkKxvks';

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setSubscription(subscription);
      setIsSubscribed(!!subscription);
    } catch (err) {
      console.error('Error checking subscription status:', err);
      setError('Failed to check subscription status');
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      setError('Failed to request permission');
      return false;
    }
  };

  const subscribeToNotifications = async (phoneNumber: string): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setError('Notification permission denied');
        setIsLoading(false);
        return false;
      }

      // Register service worker
      await registerServiceWorker();

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Convert VAPID key to Uint8Array
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to push notifications
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: new Uint8Array(convertedVapidKey)
      });

      // Save subscription to database
      const subscriptionData: PushSubscriptionData = pushSubscription.toJSON() as PushSubscriptionData;
      
      const { error: dbError } = await supabase
        .from('user_push_subscriptions')
        .upsert({
          phone_number: phoneNumber,
          endpoint: subscriptionData.endpoint,
          p256dh_key: subscriptionData.keys.p256dh,
          auth_key: subscriptionData.keys.auth,
          user_agent: navigator.userAgent,
          is_active: true
        }, {
          onConflict: 'phone_number,endpoint'
        });

      if (dbError) {
        console.error('Error saving subscription:', dbError);
        setError('Failed to save subscription');
        setIsLoading(false);
        return false;
      }

      setSubscription(pushSubscription);
      setIsSubscribed(true);
      setIsLoading(false);
      
      console.log('Push notification subscription successful');
      return true;

    } catch (err) {
      console.error('Error subscribing to push notifications:', err);
      setError(`Failed to subscribe: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
      return false;
    }
  };

  const unsubscribeFromNotifications = async (phoneNumber: string): Promise<boolean> => {
    if (!subscription) {
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Unsubscribe from push manager
      await subscription.unsubscribe();

      // Update database to mark as inactive
      const { error: dbError } = await supabase
        .from('user_push_subscriptions')
        .update({ is_active: false })
        .eq('phone_number', phoneNumber)
        .eq('endpoint', subscription.endpoint);

      if (dbError) {
        console.error('Error updating subscription status:', dbError);
      }

      setSubscription(null);
      setIsSubscribed(false);
      setIsLoading(false);
      
      return true;

    } catch (err) {
      console.error('Error unsubscribing from push notifications:', err);
      setError('Failed to unsubscribe');
      setIsLoading(false);
      return false;
    }
  };

  const registerServiceWorker = async (): Promise<ServiceWorkerRegistration> => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
        
        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;
        
        return registration;
      } catch (err) {
        console.error('Service Worker registration failed:', err);
        throw new Error('Failed to register service worker');
      }
    } else {
      throw new Error('Service Worker not supported');
    }
  };

  const sendTestNotification = async (phoneNumber: string) => {
    try {
      const response = await supabase.functions.invoke('send-push-notifications', {
        body: {
          phoneNumber: phoneNumber,
          notification: {
            title: '🎉 Test Notification',
            body: 'Push notifications are working! You\'ll receive loan reminders here.',
            icon: '/favicon.ico',
            tag: 'test-notification',
            data: {
              url: '/apply',
              test: true
            }
          }
        }
      });

      if (response.error) {
        throw response.error;
      }

      return true;
    } catch (err) {
      console.error('Error sending test notification:', err);
      setError('Failed to send test notification');
      return false;
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscription,
    isLoading,
    error,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    sendTestNotification,
    requestPermission
  };
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}