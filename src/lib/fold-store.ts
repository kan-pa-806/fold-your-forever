import { useEffect, useSyncExternalStore } from "react";

import rain from "@/assets/memory-rain.jpg";
import coffee from "@/assets/memory-coffee.jpg";
import sunset from "@/assets/memory-sunset.jpg";
import walk from "@/assets/memory-walk.jpg";

export type MoodType = "happy" | "loved" | "calm" | "sad" | "angry" | "missing";

export type MoodInfo = {
  type: MoodType;
  emoji: string;
  label: string;
  note?: string | undefined;
  updatedAt: string;
};

export const MOODS: Record<MoodType, { emoji: string; label: string; desc: string; tone: string }> = {
  happy: { emoji: "😊", label: "Happy", desc: "warm & playful", tone: "feeling radiant & smiling" },
  loved: { emoji: "🥰", label: "Loved", desc: "soft romantic glow", tone: "held close in heart" },
  calm: { emoji: "😌", label: "Calm", desc: "peaceful & grounded", tone: "quiet and tranquil" },
  sad: { emoji: "😔", label: "Sad", desc: "soft muted comfort", tone: "needs a warm hug" },
  angry: { emoji: "😤", label: "Angry", desc: "subtle deep flame", tone: "working through a storm" },
  missing: { emoji: "🤍", label: "Missing", desc: "dreamy nostalgic ache", tone: "wishing you were here" },
};

export type ChatReaction = {
  emoji: string;
  by: "me" | "partner";
};

export type ChatMessage = {
  id: string;
  author: "me" | "partner";
  senderName: string;
  timestamp: string; // ISO date
  type: "text" | "photo" | "voice";
  text?: string | undefined;
  photo?: string | null | undefined;
  caption?: string | undefined;
  voiceSeconds?: number | undefined;
  reactions: ChatReaction[];
  replyTo?: {
    id: string;
    senderName: string;
    text?: string | undefined;
    type: "text" | "photo" | "voice";
  } | null | undefined;
  status: "sent" | "delivered" | "read";
  isFolded?: boolean | undefined;
};

export type Capsule = {
  id: string;
  date: string; // ISO date string
  author: "me" | "partner";
  photo: string | null;
  caption: string;
  note: string;
  voice: number | null; // seconds
  status: "draft" | "sealed" | "sent" | "opened";
  mood?: MoodType | undefined;
  foldedFromChatId?: string | undefined;
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
  roomId: string | null;
  myMood: MoodInfo;
  partnerMood: MoodInfo;
  isPartnerOnline: boolean;
  isPartnerTyping: boolean;
  capsules: Capsule[];
  messages: ChatMessage[];
  draftFoldFromChat: ChatMessage | null;
  prefs: Prefs;
};

export const DEMO_CODE = "FOLD-7K29";

const day = (offset: number) => {
  const d = new Date();
  d.setHours(9, 12, 0, 0);
  d.setDate(d.getDate() - offset);
  return d.toISOString();
};

const initialMyMood: MoodInfo = {
  type: "calm",
  emoji: "😌",
  label: "Calm",
  updatedAt: day(0),
};

const initialPartnerMood: MoodInfo = {
  type: "loved",
  emoji: "🥰",
  label: "Loved",
  updatedAt: day(0),
};

const initialMessages: ChatMessage[] = [
  {
    id: "msg-1",
    author: "partner",
    senderName: "Albatross",
    timestamp: day(1),
    type: "text",
    text: "Thinking about that quiet coffee place with the rain tapping on the window.",
    reactions: [{ emoji: "🤍", by: "me" }],
    status: "read",
  },
  {
    id: "msg-2",
    author: "me",
    senderName: "Kanika",
    timestamp: day(1),
    type: "text",
    text: "I kept the receipt from that day in my sketchbook.",
    reactions: [{ emoji: "🥰", by: "partner" }],
    status: "read",
  },
  {
    id: "msg-3",
    author: "partner",
    senderName: "Albatross",
    timestamp: day(0),
    type: "photo",
    photo: rain,
    caption: "The walk home tonight smelled like rain and tea.",
    reactions: [{ emoji: "✨", by: "me" }],
    status: "read",
  },
  {
    id: "msg-4",
    author: "me",
    senderName: "Kanika",
    timestamp: day(0),
    type: "text",
    text: "Wish I was walking next to you under that huge broken umbrella.",
    reactions: [],
    status: "read",
  },
  {
    id: "msg-5",
    author: "partner",
    senderName: "Albatross",
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    type: "voice",
    voiceSeconds: 14,
    reactions: [{ emoji: "🤍", by: "me" }],
    status: "read",
  },
  {
    id: "msg-6",
    author: "partner",
    senderName: "Albatross",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    type: "text",
    text: "Whenever you read this, take a deep breath. You're my favorite human.",
    reactions: [],
    status: "read",
  },
];

const initialState: FoldState = {
  onboarded: false,
  name: "Kanika",
  partner: "Albatross",
  soulCode: DEMO_CODE,
  roomId: null,
  myMood: initialMyMood,
  partnerMood: initialPartnerMood,
  isPartnerOnline: true,
  isPartnerTyping: false,
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
      mood: "loved",
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
      mood: "calm",
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
      mood: "missing",
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
      mood: "happy",
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
      mood: "happy",
    },
  ],
  messages: initialMessages,
  draftFoldFromChat: null,
  prefs: { notifications: true, sound: true, haptics: true, animations: true },
};

const KEY = "fold11.state.v3";

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
      state = {
        ...initialState,
        ...parsed,
        myMood: parsed.myMood ?? initialMyMood,
        partnerMood: parsed.partnerMood ?? initialPartnerMood,
        messages: parsed.messages && parsed.messages.length > 0 ? parsed.messages : initialMessages,
        prefs: { ...initialState.prefs, ...parsed.prefs },
      };
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

export function completeOnboarding(
  name: string,
  room?: { id: string; code: string; partner: string },
) {
  setState({
    onboarded: true,
    name: name.trim() || "You",
    ...(room ? { roomId: room.id, soulCode: room.code, partner: room.partner } : {}),
  });
}

export function setMyMood(type: MoodType, note?: string) {
  const meta = MOODS[type];
  const myMood: MoodInfo = {
    type,
    emoji: meta.emoji,
    label: meta.label,
    note,
    updatedAt: new Date().toISOString(),
  };
  setState({ myMood });
}

export function setPartnerMood(type: MoodType, note?: string) {
  const meta = MOODS[type];
  const partnerMood: MoodInfo = {
    type,
    emoji: meta.emoji,
    label: meta.label,
    note,
    updatedAt: new Date().toISOString(),
  };
  setState({ partnerMood });

  // Trigger real-time notification
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("fold:notification", {
        detail: {
          type: "mood",
          title: `Feeling: ${meta.emoji} ${meta.label}`,
          message: `${state.partner} is now feeling ${meta.label.toLowerCase()} in your shared space.`,
        },
      }),
    );
  }
}

export function togglePartnerOnline() {
  setState({ isPartnerOnline: !state.isPartnerOnline });
}

export function setPartnerTyping(typing: boolean) {
  setState({ isPartnerTyping: typing });
}

export function sendChatMessage(payload: {
  type: "text" | "photo" | "voice";
  text?: string | undefined;
  photo?: string | null | undefined;
  caption?: string | undefined;
  voiceSeconds?: number | undefined;
  replyTo?: ChatMessage["replyTo"];
}) {
  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    author: "me",
    senderName: state.name,
    timestamp: new Date().toISOString(),
    type: payload.type,
    text: payload.text,
    photo: payload.photo,
    caption: payload.caption,
    voiceSeconds: payload.voiceSeconds,
    reactions: [],
    replyTo: payload.replyTo,
    status: "sent",
  };

  setState({
    messages: [...state.messages, newMsg],
  });

  // Simulated partner interaction: auto mark delivered & read, subtle reply if partner is online
  if (state.isPartnerOnline) {
    setTimeout(() => {
      setState({
        messages: state.messages.map((m) =>
          m.id === newMsg.id ? { ...m, status: "read" } : m,
        ),
      });

      // Partner sends a gentle response notification after a moment
      const partnerReplies = [
        "Reading your words and smiling over here.",
        "I'm keeping this close to my heart.",
        "You always know what to say.",
        "Holding you in my thoughts today.",
      ];
      const randomReply = partnerReplies[Math.floor(Math.random() * partnerReplies.length)]!;
      
      const partnerMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        author: "partner",
        senderName: state.partner,
        timestamp: new Date().toISOString(),
        type: "text",
        text: randomReply,
        reactions: [{ emoji: "🤍", by: "partner" }],
        status: "delivered",
      };

      setState({
        messages: [...state.messages, partnerMsg],
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("fold:notification", {
            detail: {
              type: "chat",
              title: `💬 New message from ${state.partner}`,
              message: randomReply,
              chatId: partnerMsg.id,
            },
          }),
        );
      }
    }, 4000);
  }

  return newMsg;
}

export function receivePartnerCapsule(capsule: Omit<Capsule, "id" | "date" | "author" | "status"> & { mood?: MoodType }) {
  const entry: Capsule = {
    ...capsule,
    id: `c-partner-${Date.now()}`,
    date: new Date().toISOString(),
    author: "partner",
    status: "sent",
    mood: capsule.mood || state.partnerMood.type,
  };

  setState({
    capsules: [entry, ...state.capsules],
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("fold:notification", {
        detail: {
          type: "fold",
          title: `💌 You received a new FOLD from ${state.partner}`,
          message: capsule.caption || (capsule.note ? capsule.note.slice(0, 50) + "…" : "A quiet folded envelope waiting for you."),
          capsuleId: entry.id,
        },
      }),
    );
  }
}

export function deleteChatMessage(id: string) {
  setState({
    messages: state.messages.filter((m) => m.id !== id),
  });
}

export function toggleMessageReaction(messageId: string, emoji: string) {
  setState({
    messages: state.messages.map((m) => {
      if (m.id !== messageId) return m;
      const existingIdx = m.reactions.findIndex(
        (r) => r.emoji === emoji && r.by === "me",
      );
      if (existingIdx >= 0) {
        return {
          ...m,
          reactions: m.reactions.filter((_, idx) => idx !== existingIdx),
        };
      }
      return {
        ...m,
        reactions: [...m.reactions, { emoji, by: "me" }],
      };
    }),
  });
}

export function setDraftFoldFromChat(msg: ChatMessage | null) {
  setState({ draftFoldFromChat: msg });
}

export function addCapsule(
  capsule: Omit<Capsule, "id" | "date" | "author" | "status"> & {
    mood?: MoodType | undefined;
    foldedFromChatId?: string | undefined;
  },
) {
  const entry: Capsule = {
    ...capsule,
    id: `c-${Date.now()}`,
    date: new Date().toISOString(),
    author: "me",
    status: "sent",
    mood: capsule.mood || state.myMood.type,
  };

  // If folded from chat, mark the message as folded
  let updatedMessages = state.messages;
  if (capsule.foldedFromChatId) {
    updatedMessages = state.messages.map((m) =>
      m.id === capsule.foldedFromChatId ? { ...m, isFolded: true } : m,
    );
  }

  setState({
    capsules: [entry, ...state.capsules],
    messages: updatedMessages,
    draftFoldFromChat: null,
  });

  // Partner receives the fold in simulated paired space, or dispatches confirmation
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("fold:notification", {
        detail: {
          type: "fold",
          title: `💌 You sealed a new FOLD for ${state.partner}`,
          message: entry.caption || entry.note.slice(0, 50),
          capsuleId: entry.id,
        },
      }),
    );
  }

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
