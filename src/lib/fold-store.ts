import { useEffect, useSyncExternalStore } from "react";

import rain from "@/assets/memory-rain.jpg";
import coffee from "@/assets/memory-coffee.jpg";
import sunset from "@/assets/memory-sunset.jpg";
import walk from "@/assets/memory-walk.jpg";

export type Capsule = {
  id: string;
  date: string; // ISO date string
  author: "me" | "partner";
  photo: string | null;
  caption: string;
  note: string;
  voice: number | null; // seconds
  status: "draft" | "sealed" | "sent" | "opened";
};

export type Prefs = {
  notifications: boolean;
  sound: boolean;
  haptics: boolean;
  animations: boolean;
};

export type FoldState = {
  onboarded: boolean;
  name: string;
  partner: string;
  soulCode: string;
  capsules: Capsule[];
  prefs: Prefs;
};

export const DEMO_CODE = "FOLD-7K29";

const day = (offset: number) => {
  const d = new Date();
  d.setHours(9, 12, 0, 0);
  d.setDate(d.getDate() - offset);
  return d.toISOString();
};

const initialState: FoldState = {
  onboarded: false,
  name: "Kanika",
  partner: "Jignesh",
  soulCode: DEMO_CODE,
  prefs: { notifications: true, sound: true, haptics: true, animations: true },
  capsules: [
    {
      id: "partner-today",
      date: day(0),
      author: "partner",
      photo: rain,
      caption: "Rainy evening.",
      note: "I saw this today and thought of you. The whole street smelled like the night we missed our train.",
      voice: 18,
      status: "sent",
    },
    {
      id: "m-1",
      date: day(2),
      author: "partner",
      photo: coffee,
      caption: "Coffee before class.",
      note: "Two sugars, like you take it. I keep ordering for two by accident.",
      voice: 12,
      status: "opened",
    },
    {
      id: "m-2",
      date: day(5),
      author: "me",
      photo: sunset,
      caption: "That tiny sunset.",
      note: "It lasted four minutes. I stood there for all of them, wishing you were beside me.",
      voice: 24,
      status: "opened",
    },
    {
      id: "m-3",
      date: day(9),
      author: "me",
      photo: walk,
      caption: "Sunday walk.",
      note: "You held my hand the entire way and neither of us said anything. Best conversation of the week.",
      voice: null,
      status: "opened",
    },
    {
      id: "m-4",
      date: day(14),
      author: "partner",
      photo: null,
      caption: "The day we couldn't stop laughing.",
      note: "My ribs still hurt. Whatever that was, let us do it again soon.",
      voice: 31,
      status: "opened",
    },
  ],
};

const KEY = "fold11.state.v2";

let state: FoldState = initialState;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function setState(patch: Partial<FoldState>) {
  state = { ...state, ...patch };
  persist();
  emit();
}

export function getState() {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

let hydrated = false;
function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FoldState;
      state = { ...initialState, ...parsed, prefs: { ...initialState.prefs, ...parsed.prefs } };
      emit();
    }
  } catch {
    /* ignore */
  }
}

export function useFold() {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => initialState,
  );
  useEffect(hydrate, []);
  return snapshot;
}

/* ---------- actions ---------- */

export function completeOnboarding(name: string) {
  setState({ onboarded: true, name: name.trim() || "You" });
}

export function addCapsule(capsule: Omit<Capsule, "id" | "date" | "author" | "status">) {
  const entry: Capsule = {
    ...capsule,
    id: `c-${Date.now()}`,
    date: new Date().toISOString(),
    author: "me",
    status: "sent",
  };
  setState({ capsules: [entry, ...state.capsules] });
  return entry;
}

export function markOpened(id: string) {
  setState({
    capsules: state.capsules.map((c) => (c.id === id ? { ...c, status: "opened" } : c)),
  });
}

export function updatePrefs(patch: Partial<Prefs>) {
  setState({ prefs: { ...state.prefs, ...patch } });
}

export function resetSpace() {
  state = initialState;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  emit();
}

/* ---------- selectors & helpers ---------- */

export const isSameDay = (a: string, b: Date) => {
  const d = new Date(a);
  return (
    d.getDate() === b.getDate() &&
    d.getMonth() === b.getMonth() &&
    d.getFullYear() === b.getFullYear()
  );
};

export const todaysCapsule = (s: FoldState) =>
  s.capsules.find((c) => c.author === "me" && isSameDay(c.date, new Date())) ?? null;

export const partnerWhisper = (s: FoldState) =>
  s.capsules.find((c) => c.author === "partner" && c.status === "sent") ?? null;

export const formatDay = (iso: string) =>
  new Date(iso)
    .toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    .toUpperCase();

export const formatLongDay = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

export const formatClock = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
