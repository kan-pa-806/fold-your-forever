import { supabase } from "@/integrations/supabase/client";

export type Room = {
  id: string;
  code: string;
  status: string;
  host_device: string;
  host_name: string | null;
  guest_device: string | null;
  guest_name: string | null;
};

const DEVICE_KEY = "fold11.device.v1";

export function deviceId() {
  try {
    let id = window.localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

/** FOLD-XXXX where XXXX is 4 alphanumerics. */
export const CODE_PATTERN = /^FOLD-[A-Z0-9]{4}$/;

export function normalizeCode(raw: string) {
  const cleaned = raw.trim().toUpperCase().replace(/\s+/g, "");
  const body = cleaned.replace(/^FOLD-?/, "").replace(/[^A-Z0-9]/g, "");
  return body ? `FOLD-${body.slice(0, 4)}` : "";
}

export function isValidCode(raw: string) {
  return CODE_PATTERN.test(normalizeCode(raw));
}

/** Creates a new room with a unique FOLD-XXXX code and 'waiting' status. */
export async function createRoom(hostName: string): Promise<Room> {
  const { data, error } = await supabase.rpc("fold_create_room", {
    p_device: deviceId(),
    p_name: hostName,
  });
  if (error || !data) throw new Error(error?.message ?? "Could not create a room.");
  return data as unknown as Room;
}

/** Matches an existing waiting room by code and pairs both partners. */
export async function joinRoom(code: string, guestName: string): Promise<Room> {
  const normalized = normalizeCode(code);
  if (!CODE_PATTERN.test(normalized)) {
    throw new Error("Soul Codes look like FOLD-1608.");
  }
  const { data, error } = await supabase.rpc("fold_join_room", {
    p_code: normalized,
    p_device: deviceId(),
    p_name: guestName,
  });
  if (error || !data) throw new Error(error?.message ?? "Could not join that room.");
  return data as unknown as Room;
}

export async function fetchRoom(id: string): Promise<Room | null> {
  const { data } = await supabase.rpc("fold_get_room", { p_id: id, p_device: deviceId() });
  return (data as unknown as Room | null) ?? null;
}

/** Name of the other person in the room, from this device's perspective. */
export function partnerNameOf(room: Room) {
  const me = deviceId();
  const other = room.host_device === me ? room.guest_name : room.host_name;
  return (other ?? "").trim() || "Your person";
}
