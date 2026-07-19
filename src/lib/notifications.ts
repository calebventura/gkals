import { supabase } from "./supabase";

export function supportsPushNotifications() {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    Boolean(import.meta.env.VITE_VAPID_PUBLIC_KEY)
  );
}

export function isInstalledPwa() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean(navigator.standalone))
  );
}

export async function registerPushSubscription(userId: string) {
  if (!supportsPushNotifications()) {
    throw new Error("Este navegador no tiene push configurado para la app.");
  }

  if (!supabase) {
    throw new Error("Supabase no esta configurado.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Permiso de notificaciones rechazado.");
  }

  const registration = await navigator.serviceWorker.ready;
  const existingSubscription = await registration.pushManager.getSubscription();
  const subscription =
    existingSubscription ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY!)
    }));

  const subscriptionJson = subscription.toJSON() as {
    keys?: {
      auth?: string;
      p256dh?: string;
    };
  };

  const { error } = await supabase.from("notification_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      keys: {
        auth: subscriptionJson.keys?.auth ?? "",
        p256dh: subscriptionJson.keys?.p256dh ?? ""
      },
      user_agent: navigator.userAgent
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    throw error;
  }

  return subscription;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}
