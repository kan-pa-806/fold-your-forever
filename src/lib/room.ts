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

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function randomCode() {
  let out = "";
  for (let i = 0; i < 4; i += 1) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return `FOLD-${out}`;
}

/** Creates a new room with a unique code and 'waiting' status. */
export async function createRoom(hostName: string): Promise<Room> {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const { data, error } = await supabase
      .from("rooms")
      .insert({
        code: randomCode(),
        status: "waiting",
        host_device: deviceId(),
        host_name: hostName || null,
      })
      .select()
      .single();

    if (!error && data) return data as Room;
    if (error && error.code !== "23505") throw new Error(error.message);
  }
  throw new Error("Could not generate a free Soul Code. Please try again.");
}

/** Matches an existing waiting room by code and pairs both partners. */
export async function joinRoom(code: string, guestName: string): Promise<Room> {
  const normalized = code.trim().toUpperCase();

  const { data: found, error: findError } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", normalized)
    .maybeSingle();

  if (findError) throw new Error(findError.message);
  if (!found) throw new Error("No room found with that Soul Code.");
  if (found.status !== "waiting") throw new Error("That room is already paired.");
  if (found.host_device === deviceId()) throw new Error("That's your own code — share it instead.");

  const { data, error } = await supabase
    .from("rooms")
    .update({
      status: "paired",
      guest_device: deviceId(),
      guest_name: guestName || null,
      paired_at: new Date().toISOString(),
    })
    .eq("id", found.id)
    .eq("status", "waiting")
    .select()
    .single();

  if (error || !data) throw new Error(error?.message ?? "Someone just took that room.");
  return data as Room;
}

export async function fetchRoom(id: string): Promise<Room | null> {
  const { data } = await supabase.from("rooms").select("*").eq("id", id).maybeSingle();
  return (data as Room | null) ?? null;
}

/** Realtime subscription for a single room row. Returns an unsubscribe fn. */
export function subscribeToRoom(id: string, onChange: (room: Room) => void) {
  const channel = supabase
    .channel(`room-${id}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${id}` },
      (payload) => onChange(payload.new as Room),
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/** Name of the other person in the room, from this device's perspective. */
export function partnerNameOf(room: Room) {
  const me = deviceId();
  const other = room.host_device === me ? room.guest_name : room.host_name;
  return (other ?? "").trim() || "Your person";
}
