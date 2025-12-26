self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  self.clients.claim();
});

self.addEventListener('message', e => {
  if (e.data.type === 'SHOW_NOTIFICATION') {
    const task = e.data.task;

    self.registration.showNotification(`Tarefa: ${task.title}`, {
      body: task.desc || 'Hora da tarefa!',
      tag: 'task-' + task.id,
      data: { taskId: task.id }
    });
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        if (clients.length > 0) {
          clients[0].postMessage({
            type: 'TASK_SEEN',
            taskId: e.notification.data.taskId
          });
          clients[0].focus();
        }
      })
  );
});
