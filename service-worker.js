const CACHE_NAME = 'app-cache-v2';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Recebe tarefas para agendar
self.addEventListener('message', event => {
  const data = event.data;
  if (!data || data.type !== 'SCHEDULE_NOTIFICATION') return;

  const { id, title, body, time } = data.task;
  const delay = time - Date.now();
  if (delay <= 0) return;

  setTimeout(() => {
    self.registration.showNotification(title, {
      body,
      tag: `task-${id}`,
      renotify: true,
      requireInteraction: true
    });
  }, delay);
});

// Clique na notificação
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const taskId = parseInt(event.notification.tag.replace('task-', ''));

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      if (list.length > 0) return list[0].focus();
      return clients.openWindow('/');
    })
  );

  // informa a página que foi vista
  clients.matchAll({ includeUncontrolled: true }).then(clients => {
    clients.forEach(c =>
      c.postMessage({ type: 'TASK_SEEN', taskId })
    );
  });
});
