import { type RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { deviceId } from "./room";
import {
  type ChatMessage,
  type Capsule,
  receiveChatMessage,
  receiveCapsule,
  markOpened,
  setPartnerMood,
  updateMessageStatus,
  applyMessageReaction,
  removeChatMessage,
  setPartnerTyping,
  setPartnerOnline,
} from "./fold-store";

let currentChannel: RealtimeChannel | null = null;
let activeRoomId: string | null = null;
let typingTimeout: ReturnType<typeof setTimeout> | null = null;

export function getRealtimeChannel(roomId: string, userName?: string): RealtimeChannel {
  if (currentChannel && activeRoomId === roomId) {
    return currentChannel;
  }

  if (currentChannel) {
    void supabase.removeChannel(currentChannel);
    currentChannel = null;
  }

  activeRoomId = roomId;
  const myDeviceId = deviceId();

  const channel = supabase.channel(`chat-room-${roomId}`, {
    config: {
      broadcast: { self: false },
      presence: { key: myDeviceId },
    },
  });

  // 1. Real-time Message broadcast (WhatsApp-style instant delivery)
  channel.on(
    "broadcast",
    { event: "message" },
    ({ payload }: { payload: ChatMessage & { senderDevice: string } }) => {
      if (payload.senderDevice === myDeviceId) return;

      const receivedMsg: ChatMessage = {
        ...payload,
        author: "partner",
        status: "delivered",
      };

      receiveChatMessage(receivedMsg);

      // Instantly notify sender that message was delivered
      void channel.send({
        type: "broadcast",
        event: "status",
        payload: { messageId: receivedMsg.id, status: "delivered", senderDevice: myDeviceId },
      });
    },
  );

  // 1b. Real-time Letter / Capsule broadcast (Instant delivery of letters, notes & polaroids)
  channel.on(
    "broadcast",
    { event: "capsule" },
    ({ payload }: { payload: Capsule & { senderDevice: string } }) => {
      if (payload.senderDevice === myDeviceId) return;
      receiveCapsule(payload);
    },
  );

  // 1c. Real-time Capsule Opened broadcast (sync scratch/reveal state instantly)
  channel.on(
    "broadcast",
    { event: "capsule_opened" },
    ({ payload }: { payload: { capsuleId: string; senderDevice: string } }) => {
      if (payload.senderDevice === myDeviceId) return;
      markOpened(payload.capsuleId, false);
    },
  );

  // 1d. Real-time Mood Broadcast (updates atmosphere theme for both partners)
  channel.on(
    "broadcast",
    { event: "mood" },
    ({ payload }: { payload: { type: any; note?: string; senderDevice: string } }) => {
      if (payload.senderDevice === myDeviceId) return;
      setPartnerMood(payload.type, payload.note);
    },
  );

  // 1e. Real-time Game Turn broadcast (2-player interactive turn-based notification & state)
  channel.on(
    "broadcast",
    { event: "game_turn" },
    ({ payload }: { payload: { gameId: string; gameTitle: string; moveData: any; nextPlayer: string; senderDevice: string } }) => {
      if (payload.senderDevice === myDeviceId) return;
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("fold:game_turn", {
            detail: payload,
          }),
        );
        window.dispatchEvent(
          new CustomEvent("fold:notification", {
            detail: {
              type: "game",
              title: `🎮 ${payload.gameTitle}: Ready!`,
              message: `${payload.nextPlayer === "Kanika" ? "Jignesh" : "Your partner"} is live in ${payload.gameTitle}!`,
              gameId: payload.gameId,
            },
          }),
        );
      }
    },
  );

  // 1f. Real-time In-Game Quick Chat broadcast (isolated strictly within game session)
  channel.on(
    "broadcast",
    { event: "in_game_chat" },
    ({ payload }: { payload: { gameId: string; sender: string; text: string; reaction?: string; id: string; timestamp: number; senderDevice: string } }) => {
      if (payload.senderDevice === myDeviceId) return;
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("fold:in_game_chat", {
            detail: payload,
          }),
        );
      }
    },
  );

  // 1g. Universal Live Room Game Lobby Presence (Invite, Join & Both Connected Sync)
  channel.on(
    "broadcast",
    { event: "game_presence" },
    ({ payload }: { payload: { gameId: string; gameTitle: string; sender: string; action: "joined" | "left" | "ping"; senderDevice: string } }) => {
      if (payload.senderDevice === myDeviceId) return;
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("fold:game_presence", {
            detail: payload,
          }),
        );
        if (payload.action === "joined") {
          window.dispatchEvent(
            new CustomEvent("fold:notification", {
              detail: {
                type: "game",
                title: `🎮 ${payload.sender} joined ${payload.gameTitle}!`,
                message: "Tap to jump in and play live together 🟢",
                gameId: payload.gameId,
              },
            }),
          );
        }
      }
    },
  );

  // 1h. Global Fast Real-Time Game State Sync (instant zero-latency moves without turn locks)
  channel.on(
    "broadcast",
    { event: "game_state" },
    ({ payload }: { payload: { gameId: string; stateData: any; sender: string; senderDevice: string } }) => {
      if (payload.senderDevice === myDeviceId) return;
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("fold:game_state", {
            detail: payload,
          }),
        );
      }
    },
  );

  // 2. Real-time Typing indicators
  channel.on(
    "broadcast",
    { event: "typing" },
    ({ payload }: { payload: { isTyping: boolean; senderDevice: string } }) => {
      if (payload.senderDevice === myDeviceId) return;
      setPartnerTyping(payload.isTyping);

      if (typingTimeout) clearTimeout(typingTimeout);
      if (payload.isTyping) {
        typingTimeout = setTimeout(() => {
          setPartnerTyping(false);
        }, 3000);
      }
    },
  );

  // 3. Real-time Status updates (read receipts / double blue/coral checks)
  channel.on(
    "broadcast",
    { event: "status" },
    ({ payload }: { payload: { messageId: string; status: "delivered" | "read"; senderDevice: string } }) => {
      if (payload.senderDevice === myDeviceId) return;
      updateMessageStatus(payload.messageId, payload.status);
    },
  );

  // 4. Real-time Reaction updates
  channel.on(
    "broadcast",
    { event: "reaction" },
    ({ payload }: { payload: { messageId: string; emoji: string; senderDevice: string } }) => {
      if (payload.senderDevice === myDeviceId) return;
      applyMessageReaction(payload.messageId, payload.emoji, "partner");
    },
  );

  // 5. Real-time Delete message
  channel.on(
    "broadcast",
    { event: "delete" },
    ({ payload }: { payload: { messageId: string; senderDevice: string } }) => {
      if (payload.senderDevice === myDeviceId) return;
      removeChatMessage(payload.messageId);
    },
  );

  // 6. Presence tracking (live online / away status)
  channel.on("presence", { event: "sync" }, () => {
    const state = channel.presenceState();
    const presenceKeys = Object.keys(state);
    const otherUsers = presenceKeys.filter((k) => k !== myDeviceId);
    setPartnerOnline(otherUsers.length > 0);
  });

  channel.subscribe((status) => {
    if (status === "SUBSCRIBED") {
      void channel.track({
        user: userName || "Partner",
        onlineAt: new Date().toISOString(),
      });
    }
  });

  currentChannel = channel;
  return channel;
}

/**
 * Broadcast an outgoing message instantly to the partner over Supabase Realtime
 */
export async function broadcastChatMessage(roomId: string, message: ChatMessage) {
  const channel = getRealtimeChannel(roomId);
  const myDeviceId = deviceId();

  await channel.send({
    type: "broadcast",
    event: "message",
    payload: {
      ...message,
      senderDevice: myDeviceId,
    },
  });
}

/**
 * Broadcast an outgoing folded letter / capsule instantly to the partner over Supabase Realtime
 */
export async function broadcastCapsule(roomId: string, capsule: Capsule) {
  const channel = getRealtimeChannel(roomId);
  const myDeviceId = deviceId();

  await channel.send({
    type: "broadcast",
    event: "capsule",
    payload: {
      ...capsule,
      senderDevice: myDeviceId,
    },
  });
}

/**
 * Broadcast typing indicator to the partner
 */
export function broadcastTyping(roomId: string, isTyping: boolean) {
  const channel = getRealtimeChannel(roomId);
  const myDeviceId = deviceId();

  void channel.send({
    type: "broadcast",
    event: "typing",
    payload: { isTyping, senderDevice: myDeviceId },
  });
}

/**
 * Broadcast message read receipt
 */
export function broadcastMessageRead(roomId: string, messageId: string) {
  const channel = getRealtimeChannel(roomId);
  const myDeviceId = deviceId();

  void channel.send({
    type: "broadcast",
    event: "status",
    payload: { messageId, status: "read", senderDevice: myDeviceId },
  });
}

/**
 * Broadcast message reaction
 */
export function broadcastReaction(roomId: string, messageId: string, emoji: string) {
  const channel = getRealtimeChannel(roomId);
  const myDeviceId = deviceId();

  void channel.send({
    type: "broadcast",
    event: "reaction",
    payload: { messageId, emoji, senderDevice: myDeviceId },
  });
}

/**
 * Broadcast message deletion
 */
export function broadcastDeleteMessage(roomId: string, messageId: string) {
  const channel = getRealtimeChannel(roomId);
  const myDeviceId = deviceId();

  void channel.send({
    type: "broadcast",
    event: "delete",
    payload: { messageId, senderDevice: myDeviceId },
  });
}

/**
 * Broadcast capsule scratch / opened event so both partners unlock in real-time
 */
export function broadcastCapsuleOpened(roomId: string, capsuleId: string) {
  const channel = getRealtimeChannel(roomId);
  const myDeviceId = deviceId();

  void channel.send({
    type: "broadcast",
    event: "capsule_opened",
    payload: { capsuleId, senderDevice: myDeviceId },
  });
}

/**
 * Broadcast user mood change so partner's space instantly re-themes and syncs
 */
export function broadcastMood(roomId: string, moodInfo: { type: string; note?: string }) {
  const channel = getRealtimeChannel(roomId);
  const myDeviceId = deviceId();

  void channel.send({
    type: "broadcast",
    event: "mood",
    payload: { ...moodInfo, senderDevice: myDeviceId },
  });
}

/**
 * Broadcast turn-based game action to notify partner and update game state live
 */
export function broadcastGameTurn(
  roomId: string,
  turnData: { gameId: string; gameTitle: string; moveData: any; nextPlayer: string },
) {
  const channel = getRealtimeChannel(roomId);
  const myDeviceId = deviceId();

  void channel.send({
    type: "broadcast",
    event: "game_turn",
    payload: { ...turnData, senderDevice: myDeviceId },
  });
}

/**
 * Broadcast in-game chat/reaction strictly within active game session
 */
export function broadcastInGameChat(
  roomId: string,
  chatData: { gameId: string; sender: string; text: string; reaction?: string; id: string; timestamp: number },
) {
  const channel = getRealtimeChannel(roomId);
  const myDeviceId = deviceId();

  void channel.send({
    type: "broadcast",
    event: "in_game_chat",
    payload: { ...chatData, senderDevice: myDeviceId },
  });
}

/**
 * Universal Game Room Presence: sends 'joined', 'left', or 'ping' to announce lobby entry
 */
export function broadcastGamePresence(
  roomId: string,
  presence: { gameId: string; gameTitle: string; sender: string; action: "joined" | "left" | "ping" },
) {
  const channel = getRealtimeChannel(roomId);
  const myDeviceId = deviceId();

  void channel.send({
    type: "broadcast",
    event: "game_presence",
    payload: { ...presence, senderDevice: myDeviceId },
  });
}

/**
 * Fast Realtime Game State: broadcast board updates, taps, scores, and interactions instantly
 */
export function broadcastGameState(
  roomId: string,
  payload: { gameId: string; stateData: any; sender: string },
) {
  const channel = getRealtimeChannel(roomId);
  const myDeviceId = deviceId();

  void channel.send({
    type: "broadcast",
    event: "game_state",
    payload: { ...payload, senderDevice: myDeviceId },
  });
}

/**
 * Unsubscribe and clean up channel
 */
export function leaveRealtimeChat() {
  if (currentChannel) {
    void supabase.removeChannel(currentChannel);
    currentChannel = null;
    activeRoomId = null;
  }
}
