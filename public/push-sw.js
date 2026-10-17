self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// 1. Remote Push notifications
self.addEventListener("push", (event) => {
  let data = { title: "11:FOLD", body: "You received a new whispered moment! 💌", url: "/" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    // Keep default payload
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/favicon.png",
      badge: "/favicon.png",
      tag: data.tag || "fold-notification",
      data: { url: data.url || "/" },
      vibrate: [150, 80, 150],
      renotify: true,
    }),
  );
});

// 2. Client-triggered background notifications (via postMessage)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, icon, url, tag } = event.data;
    event.waitUntil(
      self.registration.showNotification(title || "11:FOLD", {
        body: body || "A moment from your person waiting for you.",
        icon: icon || "/favicon.png",
        badge: "/favicon.png",
        tag: tag || "fold-notification",
        data: { url: url || "/" },
        vibrate: [150, 80, 150],
        renotify: true,
      }),
    );
  }
});

// 3. User clicked the notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          if (client.url && client.navigate) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    }),
  );
});