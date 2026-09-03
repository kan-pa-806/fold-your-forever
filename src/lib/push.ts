import { supabase } from "@/integrations/supabase/client";
import { deviceId } from "@/lib/room";

const WORKER = "/push-sw.js";

function base64ToBytes(value: string) {
  const padded = `${value}${"=".repeat((4 - (value.length % 4)) % 4)}`;
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export async function enablePush(roomId: string) {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return false;
  }
  const publicKey = import.meta.env["VITE_VAPID_PUBLIC_KEY"];
  if (!publicKey) return false;

  const permission = Notification.permission === "default"
    ? await Notification.requestPermission()
    : Notification.permission;
  if (permission !== "granted") return false;

  const registration = await navigator.serviceWorker.register(WORKER);
  const existing = await registration.pushManager.getSubscription();
  const subscription = existing ?? await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64ToBytes(publicKey),
  });
  const json = subscription.toJSON();
  const p256dh = json.keys?.["p256dh"];
  const auth = json.keys?.["auth"];
  if (!json.endpoint || !p256dh || !auth) return false;

  const { error } = await supabase.rpc("fold_save_push_subscription", {
    p_room: roomId,
    p_device: deviceId(),
    p_endpoint: json.endpoint,
    p_p256dh: p256dh,
    p_auth: auth,
  });
  if (error) throw new Error(error.message);
  return true;
}