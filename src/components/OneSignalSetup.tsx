import { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';

// OneSignal App ID
const ONESIGNAL_APP_ID = '0b9f4b28-d83e-4398-9625-134704d6aae8';

export const OneSignalSetup = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initOneSignal = async () => {
      if (initialized) return;
      
      try {
        await OneSignal.init({
          appId: ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
        });

        setInitialized(true);
        console.log('OneSignal initialized successfully');

        // Listen for subscription changes
        OneSignal.Notifications.addEventListener('permissionChange', async (permission) => {
          console.log('Permission changed:', permission);
          if (permission) {
            const playerId = await OneSignal.User.PushSubscription.id;
            console.log('OneSignal Player ID:', playerId);
          }
        });

      } catch (error) {
        console.error('OneSignal initialization error:', error);
      }
    };

    initOneSignal();
  }, [initialized]);

  return null;
};

// Hook to use OneSignal features
export const useOneSignal = () => {
  const requestPermission = async () => {
    try {
      await OneSignal.Notifications.requestPermission();
      return true;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  const setExternalUserId = async (phoneNumber: string) => {
    try {
      await OneSignal.login(phoneNumber);
      console.log('External user ID set:', phoneNumber);
    } catch (error) {
      console.error('Error setting external user ID:', error);
    }
  };

  const addTag = async (key: string, value: string) => {
    try {
      await OneSignal.User.addTag(key, value);
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  const getPlayerId = async () => {
    try {
      return await OneSignal.User.PushSubscription.id;
    } catch (error) {
      console.error('Error getting player ID:', error);
      return null;
    }
  };

  return {
    requestPermission,
    setExternalUserId,
    addTag,
    getPlayerId,
  };
};

export default OneSignalSetup;
