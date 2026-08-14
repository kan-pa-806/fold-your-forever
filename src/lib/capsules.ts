import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { deviceId } from "@/lib/room";

export type Capsule = {
  id: string;
  room_id: string;
  sender_device: string;
  sender_name: string | null;
  photo_url: string | null;
  caption: string;
  note: string;
  voice_url: string | null;
  voice_seconds: number | null;
  opened_at: string | null;
  created_at: string;
};

/** A capsule with browser-ready media links and a "who wrote it" flag. */
export type FoldCapsule = Capsule & {
  mine: boolean;
  photo: string | null;
  voice: string | null;
};

const BUCKET = "capsule-media";
const YEAR = 60 * 60 * 24 * 365;

async function signAll(paths: string[]) {
  const map = new Map<string, string>();
  const unique = [...new Set(paths.filter(Boolean))];
  if (unique.length === 0) return map;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(unique, YEAR);
  data?.forEach((row) => {
    if (row.path && row.signedUrl) map.set(row.path, row.signedUrl);
  });
  return map;
}

export async function uploadMedia(roomId: string, file: Blob, extension: string) {
  const path = `${roomId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}

export async function listCapsules(roomId: string): Promise<FoldCapsule[]> {
  const { data, error } = await supabase.rpc("fold_list_capsules", {
    p_room: roomId,
    p_device: deviceId(),
  });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as unknown as Capsule[];
  const signed = await signAll(rows.flatMap((r) => [r.photo_url, r.voice_url].filter(Boolean) as string[]));
  const me = deviceId();
  return rows.map((r) => ({
    ...r,
    mine: r.sender_device === me,
    photo: r.photo_url ? (signed.get(r.photo_url) ?? null) : null,
    voice: r.voice_url ? (signed.get(r.voice_url) ?? null) : null,
  }));
}

export async function sendCapsule(input: {
  roomId: string;
  senderName: string;
  photoPath: string | null;
  caption: string;
  note: string;
  voicePath: string | null;
  voiceSeconds: number | null;
}) {
  const { data, error } = await supabase.rpc("fold_send_capsule", {
    p_room: input.roomId,
    p_device: deviceId(),
    p_name: input.senderName,
    p_photo: input.photoPath,
    p_caption: input.caption,
    p_note: input.note,
    p_voice: input.voicePath,
    p_voice_seconds: input.voiceSeconds,
  });
  if (error) throw new Error(error.message);
  return data as unknown as Capsule;
}

export async function markOpened(id: string) {
  await supabase.rpc("fold_mark_opened", { p_id: id, p_device: deviceId() });
}

/** Realtime signal: fires when the *other* partner sends something. */
export function subscribeToRoomEvents(roomId: string, onPartnerSend: () => void) {
  const me = deviceId();
  const channel = supabase
    .channel(`capsule-events-${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "capsule_events",
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        const row = payload.new as { sender_device: string };
        if (row.sender_device !== me) onPartnerSend();
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Loads the room's capsules and keeps them fresh in realtime.
 * `sent` = written by this device, `received` = written by the partner.
 */
export function useCapsules(roomId: string | null, onIncoming?: () => void) {
  const [capsules, setCapsules] = useState<FoldCapsule[]>([]);
  const [loading, setLoading] = useState(Boolean(roomId));
  const incoming = useRef(onIncoming);
  incoming.current = onIncoming;

  const refresh = useCallback(async () => {
    if (!roomId) {
      setCapsules([]);
      setLoading(false);
      return;
    }
    try {
      setCapsules(await listCapsules(roomId));
    } catch {
      /* offline or not a member yet */
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    void refresh();
    if (!roomId) return;
    const unsubscribe = subscribeToRoomEvents(roomId, () => {
      incoming.current?.();
      void refresh();
    });
    return unsubscribe;
  }, [roomId, refresh]);

  return {
    capsules,
    loading,
    refresh,
    sent: capsules.filter((c) => c.mine),
    received: capsules.filter((c) => !c.mine),
  };
}
