export const showNotification = (title: string, body: string, tag: string = 'app-notification') => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const options: any = {
      body,
      icon: 'https://cdn-icons-png.flaticon.com/512/192/192161.png',
      badge: 'https://cdn-icons-png.flaticon.com/512/192/192161.png',
      vibrate: [200, 100, 200, 100, 200],
      tag,
      renotify: true,
      requireInteraction: true,
      timestamp: Date.now(),
      actions: [
        { action: 'open', title: 'Open App' }
      ]
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, options);
      });
    } else {
      new Notification(title, options);
    }
  }
};

export const requestNotificationPermission = () => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
};
