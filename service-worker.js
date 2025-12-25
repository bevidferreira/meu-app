self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

self.addEventListener('message', event => {
  if (event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, delay } = event.data;

    setTimeout(() => {
      self.registration.showNotification(title, { body, tag: title });
    }, delay);
  }
});

// NOVO: faz abrir/focar o site ao clicar na notificação
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Se já houver uma aba aberta, foca nela
      for (const client of clientList) {
        if (client.url.includes('/index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      // Senão abre uma nova aba com o site
      if (clients.openWindow) {
        return clients.openWindow('/index.html');
      }
    })
  );
});
