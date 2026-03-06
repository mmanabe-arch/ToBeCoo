// Personal OS Service Worker
// Handles push messages forwarded from the main app via postMessage

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// Receive messages from the main app and show notifications
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SHOW_NOTIFICATION') {
    const { title, body } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: '/icon.svg',
        badge: '/icon.svg',
        vibrate: [100, 50, 100],
      })
    );
  }
});

// Handle push events (for future server-side push)
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Personal OS', {
      body: data.body || '',
      icon: '/icon.svg',
      badge: '/icon.svg',
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      const client = clients.find(c => c.url.includes(self.location.origin));
      if (client) return client.focus();
      return self.clients.openWindow('/');
    })
  );
});
