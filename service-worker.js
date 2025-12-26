// service-worker.js

// Cache para app (opcional, se quiseres offline completo)
const CACHE_NAME = 'app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Adicione outros recursos que precisa cache
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/')) {
          return client.focus();
        }
      }
      return clients.openWindow('/');
    })
  );

  clients.matchAll({ includeUncontrolled: true }).then(clients => {
    clients.forEach(c => c.postMessage({
      type: 'TASK_SEEN',
      taskId: parseInt(event.notification.tag.replace('task-', ''))
    }));
  });
});

// --- Interação do usuário na notificação ---
self.addEventListener('notificationclick', event => {
  event.notification.close();

  // Focar ou abrir a aba do app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/')) {
          return client.focus();
        }
      }
      return clients.openWindow('/');
    })
  );

  // Aqui poderias mandar mensagem para a aba marcar tarefa como "visto"
  // Exemplo: event.notification.tag contém o taskId
  clients.matchAll({ includeUncontrolled: true }).then(clients => {
    clients.forEach(c => c.postMessage({
      type: 'TASK_SEEN',
      taskId: parseInt(event.notification.tag.replace('task-', ''))
    }));
  });
});

// --- Limpeza cache antigo (opcional) ---
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
