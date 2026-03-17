import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          });

          console.log('Service Worker registered successfully:', registration);

          // Handle service worker updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // New content is available, refresh to update
                    console.log('New content is available; please refresh.');
                  } else {
                    // Content is cached for offline use
                    console.log('Content is cached for offline use.');
                  }
                }
              });
            }
          });

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener('message', (event) => {
            console.log('Message from service worker:', event.data);
            
            if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
              // Handle notification click navigation
              const { url, data } = event.data;
              
              if (url && url !== window.location.pathname) {
                window.location.href = url;
              }
              
              // You can also dispatch custom events here for in-app handling
              if (data) {
                const customEvent = new CustomEvent('notificationClick', {
                  detail: data
                });
                window.dispatchEvent(customEvent);
              }
            }
          });

        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      });
    } else {
      console.log('Service Workers are not supported');
    }

    // Handle app updates and refresh - with loop prevention
    const handleControllerChange = () => {
      // Prevent reload loops by checking sessionStorage
      const lastReload = sessionStorage.getItem('sw-reload-time');
      const now = Date.now();
      
      if (lastReload && now - parseInt(lastReload) < 5000) {
        // Don't reload if we reloaded less than 5 seconds ago
        console.log('Skipping reload to prevent loop');
        return;
      }
      
      sessionStorage.setItem('sw-reload-time', now.toString());
      window.location.reload();
    };

    navigator.serviceWorker?.addEventListener('controllerchange', handleControllerChange);

  }, []);

  // This component doesn't render anything
  return null;
}