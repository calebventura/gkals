/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ revision: string | null; url: string }>;
};

type ExtendedNotificationOptions = NotificationOptions & {
  actions?: Array<{ action: string; title: string }>;
  renotify?: boolean;
  requireInteraction?: boolean;
};

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("push", (event) => {
  const payload = event.data?.json() ?? {};
  const title = payload.title ?? "Gkals";
  const body =
    payload.body ?? "Tu habito sigue pendiente. Deja de aplazarlo y terminalo.";

  const options: ExtendedNotificationOptions = {
    body,
    badge: "/icons/icon-192.png",
    icon: "/icons/icon-192.png",
    tag: payload.tag ?? "habit-reminder",
    renotify: true,
    requireInteraction: true,
    data: {
      url: payload.url ?? "/",
      habitId: payload.habitId
    },
    actions: [
      {
        action: "open",
        title: "Abrir"
      }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url ?? "/", self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client && client.url === targetUrl) {
            return client.focus();
          }
        }

        return self.clients.openWindow(targetUrl);
      })
  );
});
