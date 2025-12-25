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
      self.registration.showNotification(title, { body });
    }, delay);
  }
});
