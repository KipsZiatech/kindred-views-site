// Service Worker for Push Notifications
const CACHE_NAME = 'shwari-mpesa-v1';

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/apply',
        '/payment'
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Push event - handle incoming push notifications
self.addEventListener('push', event => {
  console.log('Push event received:', event);
  
  let notificationData = {
    title: 'Shwari M-Pesa',
    body: 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'loan-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'pay-now',
        title: 'Pay Now',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    data: {
      url: '/apply',
      timestamp: Date.now()
    }
  };

  // Parse notification data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData,
        data: {
          ...notificationData.data,
          ...pushData.data
        }
      };
    } catch (e) {
      console.error('Error parsing push data:', e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Notification click event - handle user interactions
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data || {};
  
  // Log click event to analytics
  if (notificationData.loanId) {
    fetch('https://xxfybuqajtejzthyszam.supabase.co/functions/v1/send-push-notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4ZnlidXFhanRlanp0aHlzemFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTk3MDIsImV4cCI6MjA2OTg3NTcwMn0.aoIuzjssllzRnlDQRHTc3hfT8IF3y3XW7qkYHHt8p_M'
      },
      body: JSON.stringify({
        action: 'log_click',
        loanId: notificationData.loanId,
        clickAction: action || 'open'
      })
    }).catch(console.error);
  }

  if (action === 'dismiss') {
    return; // Just close the notification
  }

  // Determine URL based on action
  let url = '/';
  if (action === 'pay-now' || notificationData.url) {
    url = notificationData.url || '/payment';
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Check if a window is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            action: action,
            url: url,
            data: notificationData
          });
          return;
        }
      }
      
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('Background sync event:', event.tag);
  
  if (event.tag === 'loan-application-sync') {
    event.waitUntil(
      // Handle offline loan applications when connection is restored
      syncLoanApplications()
    );
  }
});

async function syncLoanApplications() {
  // Implementation for syncing offline loan applications
  console.log('Syncing loan applications...');
}

// Handle messages from main thread
self.addEventListener('message', event => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});