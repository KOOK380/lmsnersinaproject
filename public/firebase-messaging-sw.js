// Scripts for firebase and firebase messaging
self.importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
self.importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Try to self-initialize Firebase by fetching Settings API
async function initFirebaseInSW() {
  try {
    const response = await fetch('/api/settings');
    const settings = await response.json();
    const sFirebase = settings.find(s => s.key === "FIREBASE_CONFIG");
    if (sFirebase) {
      const config = JSON.parse(sFirebase.value);
      if (config.enabled && config.apiKey && config.projectId) {
        firebase.initializeApp(config);
        const messaging = firebase.messaging();
        
        // Register the background message handler
        messaging.onBackgroundMessage((payload) => {
          console.log('[firebase-messaging-sw.js] Received background message ', payload);
          const notificationTitle = payload.notification?.title || 'New Notification';
          const notificationOptions = {
            body: payload.notification?.body || '',
            icon: '/icon.png',
            data: payload.data || {}
          };
          self.registration.showNotification(notificationTitle, notificationOptions);
        });
        console.log('[firebase-messaging-sw.js] Firebase Messaging initialized successfully.');
      }
    }
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Failed to self-initialize Firebase:', error);
  }
}

// Kick off initialization
initFirebaseInSW();

self.addEventListener('push', function(event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const notificationTitle = data.notification ? data.notification.title : "New Notification";
      const notificationOptions = {
        body: data.notification ? data.notification.body : "",
        icon: '/icon.png',
        data: data.data || {}
      };

      event.waitUntil(
        self.registration.showNotification(notificationTitle, notificationOptions)
      );
    } catch (e) {
      // Fallback if event data is not JSON or is in an unexpected format
      try {
        const text = event.data.text();
        event.waitUntil(
          self.registration.showNotification("New Notification", {
            body: text,
            icon: '/icon.png'
          })
        );
      } catch (err) {
        console.error("Failed to parse push event:", err);
      }
    }
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
