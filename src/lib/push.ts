import { supabase } from "@/integrations/supabase/client";
import { deviceId } from "@/lib/room";

const WORKER = "/push-sw.js";
let cachedRegistration: ServiceWorkerRegistration | null = null;

function base64ToBytes(value: string) {
  const padded = `${value}${"=".repeat((4 - (value.length % 4)) % 4)}`;
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

/**
 * Register service worker and keep reference active.
 */
export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(WORKER);
    cachedRegistration = registration;
    return registration;
  } catch (err) {
    console.warn("[Push] Service worker registration error:", err);
    return null;
  }
}

/**
 * Request notification permissions from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }

  if (Notification.permission === "default") {
    return await Notification.requestPermission();
  }

  return Notification.permission;
}

/**
 * Show an instant notification (works both in foreground and in background/minimized).
 */
export async function showBackgroundNotification(options: {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  try {
    let reg = cachedRegistration;
    if (!reg && "serviceWorker" in navigator) {
      reg = (await navigator.serviceWorker.getRegistration(WORKER)) ?? null;
      if (!reg) {
        reg = await registerPushServiceWorker();
      }
    }

    if (reg) {
      // Use service worker to show notification (reliable in background & when minimized)
      await reg.showNotification(options.title, {
        body: options.body,
        icon: "/favicon.png",
        badge: "/favicon.png",
        tag: options.tag || "fold-notification",
        data: { url: options.url || "/" },
      });
      return;
    }
  } catch (err) {
    console.warn("[Push] Error showing notification via SW, falling back to Notification API:", err);
  }

  // Fallback to standard Window Notification
  try {
    new Notification(options.title, {
      body: options.body,
      icon: "/favicon.png",
    });
  } catch {
    /* ignore */
  }
}

/**
 * Enable Web Push subscriptions with backend if VAPID key is configured,
 * and activate service worker.
 */
export async function enablePush(roomId: string): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  const permission = await requestNotificationPermission();
  if (permission !== "granted") return false;

  const registration = await registerPushServiceWorker();
  if (!registration) return false;

  const publicKey = import.meta.env["VITE_VAPID_PUBLIC_KEY"];
  if (!publicKey || !("PushManager" in window)) {
    // Service worker is registered and Notification permission is active!
    return true;
  }

  try {
    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64ToBytes(publicKey),
      }));

    const json = subscription.toJSON();
    const p256dh = json.keys?.["p256dh"];
    const auth = json.keys?.["auth"];
    if (!json.endpoint || !p256dh || !auth) return true;

    await supabase.rpc("fold_save_push_subscription", {
      p_room: roomId,
      p_device: deviceId(),
      p_endpoint: json.endpoint,
      p_p256dh: p256dh,
      p_auth: auth,
    });
    return true;
  } catch (err) {
    console.warn("[Push] VAPID registration notice:", err);
    return true;
  }
}