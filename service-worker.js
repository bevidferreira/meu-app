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

// --- Notificações programadas ---
let scheduledNotifications = []; // {id, title, body, time, taskId}

// Recebe mensagens da página principal
self.addEventListener('message', event => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'SCHEDULE_NOTIFICATION') {
    const { title, body, delay, taskId } = data;
    const notifyTime = Date.now() + delay;
    scheduledNotifications.push({ title, body, time: notifyTime, taskId });
  }
});

// Função para disparar notificações
async function triggerNotifications() {
  const now = Date.now();
  const due = scheduledNotifications.filter(n => n.time <= now);
  
  for (const n of due) {
    self.registration.showNotification(n.title, {
      body: n.body,
      icon: '/icon.png', // opcional
      badge: '/badge.png', // opcional
      tag: `task-${n.taskId}`, // evita duplicados
      renotify: true,
    });
  }
  
  // Remove notificações disparadas
  scheduledNotifications = scheduledNotifications.filter(n => n.time > now);
}

// Loop eficiente: verifica a cada 15 segundos
setInterval(triggerNotifications, 15000);

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
