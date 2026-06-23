// TRACE Service Worker — Web Push
self.addEventListener('push', event => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'TRACE', {
      body:  data.body  ?? '',
      icon:  '/icon-192.png',
      badge: '/icon-192.png',
      tag:   data.tag   ?? 'trace-notif',
      data:  data.url   ?? '/',
      vibrate: [200, 100, 200],
      actions: data.actions ?? [],
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data ?? '/';
  event.waitUntil(clients.openWindow(url));
});

self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
