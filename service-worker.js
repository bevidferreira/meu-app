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

  const repoURL = 'https://bevidferreira.github.io/meu-app/'; // <<< Troca pelo teu link GitHub Pages

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Se já houver aba aberta do app, foca nela
      for (const client of clientList) {
        if (client.url.startsWith(repoURL) && 'focus' in client) {
          return client.focus();
        }
      }
      // Senão abre uma nova aba
      if (clients.openWindow) {
        return clients.openWindow(repoURL);
      }
    })
  );
});
