import { createFileRoute } from "@tanstack/react-router";
import { buildPushPayload, type PushSubscription, type VapidKeys } from "@block65/webcrypto-web-push";
import { z } from "zod";

const input = z.object({
  capsuleId: z.string().uuid(),
  roomId: z.string().uuid(),
  senderDevice: z.string().min(1).max(128),
});

export const Route = createFileRoute("/api/public/push")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = input.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: "Invalid notification request." }, { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: capsule } = await supabaseAdmin
          .from("capsules")
          .select("id, room_id, sender_device")
          .eq("id", parsed.data.capsuleId)
          .eq("room_id", parsed.data.roomId)
          .eq("sender_device", parsed.data.senderDevice)
          .maybeSingle();
        if (!capsule) return Response.json({ error: "Capsule not found." }, { status: 404 });

        const { data: subscriptions } = await supabaseAdmin
          .from("push_subscriptions")
          .select("endpoint, p256dh, auth")
          .eq("room_id", parsed.data.roomId)
          .neq("device_id", parsed.data.senderDevice);

        const vapid: VapidKeys = {
          subject: process.env["VAPID_SUBJECT"],
          publicKey: process.env["VAPID_PUBLIC_KEY"],
          privateKey: process.env["VAPID_PRIVATE_KEY"],
        };
        const message = {
          data: JSON.stringify({
            title: "11:FOLD",
            body: "You received a new Love Letter! 💌",
            url: "/",
          }),
          options: { ttl: 60 * 60, urgency: "normal" as const },
        };
        const results = await Promise.allSettled((subscriptions ?? []).map(async (row) => {
          const subscription: PushSubscription = {
            endpoint: row.endpoint,
            expirationTime: null,
            keys: { p256dh: row.p256dh, auth: row.auth },
          };
          const payload = await buildPushPayload(message, subscription, vapid);
          const body = new ArrayBuffer(payload.body.byteLength);
          new Uint8Array(body).set(payload.body);
          const headers = new Headers();
          Object.entries(payload.headers).forEach(([key, value]) => {
            if (value !== undefined) headers.set(key, value);
          });
          const response = await fetch(subscription.endpoint, {
            method: payload.method,
            headers,
            body,
          });
          if (!response.ok && (response.status === 404 || response.status === 410)) {
            await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", row.endpoint);
          }
        }));
        return Response.json({ sent: results.filter((result) => result.status === "fulfilled").length });
      },
    },
  },
});