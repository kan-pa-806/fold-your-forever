import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Send,
  Image as ImageIcon,
  Mic,
  Smile,
  CheckCheck,
  Check,
  Reply,
  Trash2,
  FolderHeart,
  X,
  Play,
  Pause,
  AlertCircle,
} from "lucide-react";

import {
  useFold,
  sendChatMessage,
  deleteChatMessage,
  toggleMessageReaction,
  setDraftFoldFromChat,
  formatClock,
  type ChatMessage,
} from "@/lib/fold-store";
import {
  getRealtimeChannel,
  broadcastChatMessage,
  broadcastTyping,
  broadcastMessageRead,
  broadcastReaction,
  broadcastDeleteMessage,
} from "@/lib/realtime-chat";
import { cn } from "@/lib/utils";

const QUICK_EMOJIS = ["🤍", "🥰", "✨", "🫂", "🥺", "🌸"];

function getSupportedMimeType(): string {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") return "";
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/aac",
    "audio/ogg;codecs=opus",
    "audio/wav",
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

export function ChatRoom() {
  const state = useFold();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const recordInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const voiceInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const synthCtxRef = useRef<AudioContext | null>(null);
  const recordStartRef = useRef<number>(0);

  const effectiveRoomId = state.roomId || state.soulCode || "fold-private-room";

  // 1. Initialize Supabase Realtime Channel for instant WhatsApp-style sync
  useEffect(() => {
    const channel = getRealtimeChannel(effectiveRoomId, state.name);

    // Automatically mark all partner's unread messages as read
    const unreadPartnerMsgs = state.messages.filter(
      (m) => m.author === "partner" && m.status !== "read",
    );
    unreadPartnerMsgs.forEach((m) => {
      broadcastMessageRead(effectiveRoomId, m.id);
    });

    return () => {
      if (typingDebounce.current) clearTimeout(typingDebounce.current);
    };
  }, [effectiveRoomId, state.name, state.messages]);

  // Auto-scroll on new message or typing indicator
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages.length, state.isPartnerTyping]);

  // Clean audio resources
  useEffect(() => {
    return () => {
      if (recordInterval.current) clearInterval(recordInterval.current);
      if (voiceInterval.current) clearInterval(voiceInterval.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      if (synthCtxRef.current) {
        void synthCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Real microphone recording with MediaRecorder
  const startRecording = async () => {
    setMicError(null);
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setMicError("Microphone not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      mediaStreamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalMime = recorder.mimeType || mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: finalMime });
        const voiceUrl = URL.createObjectURL(audioBlob);

        const calculatedSecs = Math.max(1, Math.round((Date.now() - recordStartRef.current) / 1000));
        const newMsg = sendChatMessage({
          type: "voice",
          voiceSeconds: calculatedSecs,
          voiceUrl,
          replyTo: replyingTo
            ? {
                id: replyingTo.id,
                senderName: replyingTo.senderName,
                text: replyingTo.text || (replyingTo.type === "photo" ? "Photo" : "Voice whisper"),
                type: replyingTo.type,
              }
            : null,
        });

        // Broadcast voice note instantly over Supabase Realtime
        void broadcastChatMessage(effectiveRoomId, newMsg);

        setReplyingTo(null);
        setRecordSecs(0);

        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }
      };

      recorder.start(200);
      recordStartRef.current = Date.now();
      setRecording(true);
      setRecordSecs(0);

      recordInterval.current = setInterval(() => {
        setRecordSecs((s) => s + 1);
      }, 1000);
    } catch (err: unknown) {
      console.error("[ChatRoom] Microphone permission error:", err);
      const error = err as { name?: string };
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setMicError("Microphone permission denied. Allow mic access to whisper.");
      } else {
        setMicError("Could not access microphone.");
      }
      setRecording(false);
      if (recordInterval.current) clearInterval(recordInterval.current);
    }
  };

  const stopAndSendRecording = () => {
    if (!recording) return;
    if (recordInterval.current) clearInterval(recordInterval.current);
    setRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        if (mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.requestData();
        }
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error("[ChatRoom] Error stopping recorder:", err);
      }
    }
  };

  const cancelRecording = () => {
    if (recordInterval.current) clearInterval(recordInterval.current);
    setRecording(false);
    setRecordSecs(0);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
  };

  // Play voice message playback (real audio or synthesized pleasant chime)
  const togglePlayVoice = (msg: ChatMessage) => {
    if (!msg.voiceSeconds && !msg.voiceUrl) return;

    if (playingVoiceId === msg.id) {
      if (voiceInterval.current) clearInterval(voiceInterval.current);
      if (audioElementRef.current) audioElementRef.current.pause();
      if (synthCtxRef.current) {
        void synthCtxRef.current.close().catch(() => {});
        synthCtxRef.current = null;
      }
      setPlayingVoiceId(null);
      setVoiceProgress(0);
      return;
    }

    if (voiceInterval.current) clearInterval(voiceInterval.current);
    if (audioElementRef.current) audioElementRef.current.pause();
    if (synthCtxRef.current) {
      void synthCtxRef.current.close().catch(() => {});
      synthCtxRef.current = null;
    }

    setPlayingVoiceId(msg.id);
    setVoiceProgress(0);

    if (msg.voiceUrl) {
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio(msg.voiceUrl);
      } else {
        audioElementRef.current.src = msg.voiceUrl;
      }

      const audio = audioElementRef.current;
      audio.currentTime = 0;

      audio.ontimeupdate = () => {
        if (audio.currentTime) setVoiceProgress(audio.currentTime);
      };

      audio.onended = () => {
        setPlayingVoiceId(null);
        setVoiceProgress(0);
        if (voiceInterval.current) clearInterval(voiceInterval.current);
      };

      audio.play().catch(() => {
        /* fallback to timer */
      });
    } else {
      // Gentle chime fallback for seeded demo voice
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        synthCtxRef.current = ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(329.63, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (msg.voiceSeconds || 5));
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + (msg.voiceSeconds || 5));
      } catch {
        /* ignore */
      }
    }

    voiceInterval.current = setInterval(() => {
      setVoiceProgress((p) => {
        if (audioElementRef.current && msg.voiceUrl) {
          return audioElementRef.current.currentTime;
        }
        if (p >= (msg.voiceSeconds ?? 10)) {
          if (voiceInterval.current) clearInterval(voiceInterval.current);
          setPlayingVoiceId(null);
          return 0;
        }
        return p + 0.2;
      });
    }, 200);
  };

  // Image handling
  const handlePhotoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const sendPhoto = () => {
    if (!photoPreview) return;
    const newMsg = sendChatMessage({
      type: "photo",
      photo: photoPreview,
      caption: caption.trim() || undefined,
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            text: replyingTo.text || (replyingTo.type === "photo" ? "Photo" : "Voice whisper"),
            type: replyingTo.type,
          }
        : null,
    });

    // Broadcast photo instantly to partner
    void broadcastChatMessage(effectiveRoomId, newMsg);

    setPhotoPreview(null);
    setCaption("");
    setReplyingTo(null);
  };

  // Send text message (WhatsApp-style instant broadcast)
  const handleSend = () => {
    if (!text.trim()) return;

    const newMsg = sendChatMessage({
      type: "text",
      text: text.trim(),
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            text: replyingTo.text || (replyingTo.type === "photo" ? "Photo" : "Voice whisper"),
            type: replyingTo.type,
          }
        : null,
    });

    // Broadcast immediately over Supabase Realtime WebSocket
    void broadcastChatMessage(effectiveRoomId, newMsg);

    setText("");
    setReplyingTo(null);
    broadcastTyping(effectiveRoomId, false);
  };

  // Typing event with debounce
  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    broadcastTyping(effectiveRoomId, true);
    if (typingDebounce.current) clearTimeout(typingDebounce.current);
    typingDebounce.current = setTimeout(() => {
      broadcastTyping(effectiveRoomId, false);
    }, 1500);
  };

  // Reaction handling
  const handleReaction = (msgId: string, emoji: string) => {
    toggleMessageReaction(msgId, emoji);
    broadcastReaction(effectiveRoomId, msgId, emoji);
    setShowEmojiPickerFor(null);
  };

  // Delete message handling
  const handleDelete = (msgId: string) => {
    deleteChatMessage(msgId);
    broadcastDeleteMessage(effectiveRoomId, msgId);
  };

  // "Fold this moment" action
  const handleFoldMoment = (msg: ChatMessage) => {
    setDraftFoldFromChat(msg);
    navigate({ to: "/create" });
  };

  return (
    <div className="flex h-full flex-col">
      {/* Intimate Chat Header */}
      <div className="glass-strong sticky top-0 z-20 flex items-center justify-between border-b border-white/50 px-5 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span
              className="font-display grid h-10 w-10 place-items-center rounded-full text-sm font-semibold text-parchment shadow-soft"
              style={{
                background:
                  "radial-gradient(circle at 32% 28%, oklch(0.62 0.15 27), oklch(0.44 0.13 25))",
              }}
            >
              {state.partner.slice(0, 1)}
            </span>
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white transition-all",
                state.isPartnerOnline ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" : "bg-ink/30",
              )}
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-display text-lg leading-tight text-ink">
                {state?.partner || "Partner"}
              </h2>
              <span className="text-sm">{state?.partnerMood?.emoji || "🥰"}</span>
            </div>
            <p className="flex items-center gap-1 text-[11px] text-ink-soft">
              {state?.isPartnerTyping ? (
                <span className="flex items-center gap-1 text-coral font-medium animate-pulse">
                  <span>typing a thought…</span>
                </span>
              ) : state?.isPartnerOnline ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>online in our space</span>
                </>
              ) : (
                <span>resting nearby</span>
              )}
            </p>
          </div>
        </div>

        {/* Partner mood pill */}
        <div className="flex items-center gap-2">
          <div className="glass rounded-full px-3 py-1 text-[11px] text-ink-soft">
            <span>{state?.partnerMood?.label || "Loved"}</span>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 space-y-4 px-4 py-6 overflow-y-auto">
        <div className="text-center">
          <span className="rounded-full bg-white/40 px-3 py-1 text-[10px] tracking-[0.16em] text-ink-soft">
            END-TO-END INTIMATE · SUPABASE REALTIME ACTIVE
          </span>
        </div>

        {state.messages.map((msg) => {
          const isMe = msg.author === "me";
          const isMenuOpen = activeMenuId === msg.id;

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex flex-col group", isMe ? "items-end" : "items-start")}
            >
              {/* Reply Reference header */}
              {msg.replyTo ? (
                <div
                  className={cn(
                    "mb-1 flex items-center gap-1.5 text-[11px] text-ink-soft/80 px-2",
                    isMe ? "justify-end" : "justify-start",
                  )}
                >
                  <Reply size={11} className="-scale-x-100" />
                  <span>
                    Replied to {msg.replyTo.senderName}: &ldquo;{msg.replyTo.text?.slice(0, 24)}…&rdquo;
                  </span>
                </div>
              ) : null}

              <div
                className={cn(
                  "relative max-w-[85%] rounded-[24px] p-3.5 transition-all md:max-w-[70%]",
                  isMe
                    ? "rounded-tr-md bg-ink text-parchment shadow-lift"
                    : "rounded-tl-md paper grain text-ink shadow-soft",
                  msg.isFolded && "ring-1 ring-coral/50",
                )}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setActiveMenuId(isMenuOpen ? null : msg.id);
                }}
              >
                {/* Folded badge */}
                {msg.isFolded ? (
                  <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-coral/20 px-2.5 py-0.5 text-[10px] font-medium text-coral">
                    <FolderHeart size={10} />
                    <span>Sealed in Vault</span>
                  </div>
                ) : null}

                {/* Photo message */}
                {msg.type === "photo" && msg.photo ? (
                  <div className="overflow-hidden rounded-[16px]">
                    <img
                      src={msg.photo}
                      alt={msg.caption || "Shared moment"}
                      className="max-h-[260px] w-full rounded-[14px] object-cover"
                    />
                    {msg.caption ? (
                      <p className={cn("mt-2 text-sm", isMe ? "text-parchment" : "text-ink")}>
                        {msg.caption}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {/* Voice message */}
                {msg.type === "voice" && (msg.voiceSeconds || msg.voiceUrl) ? (
                  <div className="flex items-center gap-3 py-1 min-w-[190px]">
                    <button
                      type="button"
                      onClick={() => togglePlayVoice(msg)}
                      className={cn(
                        "press grid h-10 w-10 shrink-0 place-items-center rounded-full transition-colors",
                        isMe ? "bg-white text-ink" : "bg-ink text-parchment",
                      )}
                      aria-label="Play whisper"
                    >
                      {playingVoiceId === msg.id ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={isMe ? "text-parchment/80" : "text-ink-soft"}>
                          Whisper Memo
                        </span>
                        <span className="font-mono text-[10px]">
                          {formatClock(
                            playingVoiceId === msg.id
                              ? Math.floor(voiceProgress)
                              : (msg.voiceSeconds ?? 0),
                          )}
                        </span>
                      </div>
                      {/* wave progress */}
                      <div className="mt-1.5 flex h-3 items-center gap-[2px]">
                        {Array.from({ length: 18 }).map((_, idx) => {
                          const active =
                            playingVoiceId === msg.id &&
                            (voiceProgress / (msg.voiceSeconds ?? 10)) * 18 >= idx;
                          return (
                            <span
                              key={idx}
                              className={cn(
                                "h-full w-[3px] rounded-full transition-all",
                                active
                                  ? "bg-coral scale-y-110"
                                  : isMe
                                    ? "bg-white/30"
                                    : "bg-ink/20",
                              )}
                              style={{
                                height: `${Math.max(25, (idx * 37) % 100)}%`,
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Interactive Multiplayer Game Card in Chat (Plato Style) */}
                {msg.type === "game" && msg.gameData ? (
                  <div className="rounded-2xl bg-white/95 p-3.5 border border-ink/10 shadow-soft text-ink">
                    <div className="flex items-center justify-between pb-2 border-b border-ink/5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-coral/15 text-lg">
                          {msg.gameData.gameIcon || "🎮"}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold leading-tight text-ink">
                            {msg.gameData.gameTitle}
                          </h4>
                          <span className="text-[10px] text-ink-soft">
                            Plato Live Match
                          </span>
                        </div>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          msg.gameData.actionType === "invite"
                            ? "bg-coral text-white animate-pulse"
                            : msg.gameData.actionType === "turn"
                              ? "bg-amber-400 text-ink"
                              : "bg-emerald-500 text-white",
                        )}
                      >
                        {msg.gameData.actionType === "invite" ? "🎮 Game Invite" : msg.gameData.actionType}
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-relaxed text-ink/90 font-medium">
                      {msg.gameData.summary}
                    </p>

                    {msg.gameData.nextTurnPlayer ? (
                      <p className="mt-1 text-[11px] text-coral font-medium">
                        Current Turn: <strong>{msg.gameData.nextTurnPlayer}</strong>
                      </p>
                    ) : null}

                    <button
                      type="button"
                      onClick={() =>
                        navigate({
                          to: "/games",
                          search: { gameId: msg.gameData.gameId },
                        })
                      }
                      className="press mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-coral to-rose-500 py-2.5 text-xs font-bold text-white shadow-soft hover:brightness-105 transition-all"
                    >
                      <Sparkles size={14} />
                      <span>Accept &amp; Join Live Room</span>
                      <span>→</span>
                    </button>
                  </div>
                ) : null}

                {/* Text message */}
                {msg.type === "text" ? (
                  <p className="text-[14.5px] leading-relaxed break-words whitespace-pre-wrap">
                    {msg.text}
                  </p>
                ) : null}

                {/* Timestamp & read status */}
                <div
                  className={cn(
                    "mt-1.5 flex items-center justify-end gap-1 text-[10px]",
                    isMe ? "text-parchment/65" : "text-ink-soft",
                  )}
                >
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  {isMe ? (
                    msg.status === "read" ? (
                      <CheckCheck size={13} className="text-coral" />
                    ) : msg.status === "delivered" ? (
                      <CheckCheck size={13} className="text-white/70" />
                    ) : (
                      <Check size={12} className="text-white/60" />
                    )
                  ) : null}
                </div>

                {/* Reaction badge strip */}
                {msg.reactions.length > 0 ? (
                  <div className="absolute -bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 shadow-soft border border-white/80">
                    {msg.reactions.map((r, i) => (
                      <span key={i} className="text-xs">
                        {r.emoji}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Message Quick Action toolbar */}
              <div
                className={cn(
                  "mt-1.5 flex items-center gap-1 px-1 transition-opacity",
                  isMenuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100 md:opacity-60",
                )}
              >
                {/* Emoji reactions */}
                <button
                  type="button"
                  onClick={() =>
                    setShowEmojiPickerFor(showEmojiPickerFor === msg.id ? null : msg.id)
                  }
                  className="press glass grid h-7 w-7 place-items-center rounded-full text-ink-soft hover:text-ink text-xs"
                  title="React with feeling"
                >
                  <Smile size={13} />
                </button>

                {/* Reply */}
                <button
                  type="button"
                  onClick={() => setReplyingTo(msg)}
                  className="press glass grid h-7 w-7 place-items-center rounded-full text-ink-soft hover:text-ink"
                  title="Reply to message"
                >
                  <Reply size={13} />
                </button>

                {/* Fold this moment action */}
                <button
                  type="button"
                  onClick={() => handleFoldMoment(msg)}
                  className="press glass flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] text-ink hover:text-coral font-medium"
                  title="Turn into a sealed FOLD memory"
                >
                  <FolderHeart size={12} className="text-coral" />
                  <span>Fold this moment</span>
                </button>

                {/* Delete if own message */}
                {isMe ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(msg.id)}
                    className="press glass grid h-7 w-7 place-items-center rounded-full text-ink-soft hover:text-destructive"
                    title="Delete message"
                  >
                    <Trash2 size={12} />
                  </button>
                ) : null}
              </div>

              {/* Quick emoji popover */}
              {showEmojiPickerFor === msg.id ? (
                <div className="mt-1 flex items-center gap-1 rounded-full bg-white/90 p-1 shadow-lift border border-white">
                  {QUICK_EMOJIS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => handleReaction(msg.id, em)}
                      className="press rounded-full p-1 text-sm hover:scale-125 transition-transform"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              ) : null}
            </motion.div>
          );
        })}

        {/* Partner is typing indicator */}
        {state.isPartnerTyping ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-2xl bg-white/60 px-4 py-2 text-xs text-ink-soft w-fit"
          >
            <span className="font-medium text-ink">{state.partner}</span> is writing to you…
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-coral animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-coral animate-bounce delay-100" />
              <span className="h-1.5 w-1.5 rounded-full bg-coral animate-bounce delay-200" />
            </span>
          </motion.div>
        ) : null}

        <div ref={endRef} />
      </div>

      {/* Reply banner preview */}
      {replyingTo ? (
        <div className="mx-4 mb-2 flex items-center justify-between rounded-2xl bg-white/70 px-4 py-2 border border-white/60">
          <div className="text-xs">
            <span className="font-medium text-ink">
              Replying to {replyingTo.senderName}
            </span>
            <p className="line-clamp-1 text-ink-soft">
              {replyingTo.text || (replyingTo.type === "photo" ? "Photo moment" : "Voice memo")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReplyingTo(null)}
            className="press text-ink-soft hover:text-ink"
          >
            <X size={15} />
          </button>
        </div>
      ) : null}

      {/* Mic permission warning */}
      {micError ? (
        <div className="mx-4 mb-2 flex items-center gap-2 rounded-2xl bg-destructive/10 px-3.5 py-2 text-xs text-destructive">
          <AlertCircle size={14} className="shrink-0" />
          <span>{micError}</span>
        </div>
      ) : null}

      {/* Photo draft modal/sheet */}
      <AnimatePresence>
        {photoPreview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mx-4 mb-3 rounded-3xl bg-white/80 p-3 shadow-device border border-white"
          >
            <div className="relative">
              <img
                src={photoPreview}
                alt="Upload preview"
                className="max-h-[180px] w-full rounded-2xl object-cover"
              />
              <button
                type="button"
                onClick={() => setPhotoPreview(null)}
                className="press absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white"
              >
                <X size={15} />
              </button>
            </div>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a thought to this photograph…"
              className="mt-3 w-full rounded-xl bg-white/60 px-3 py-2 text-xs text-ink placeholder:text-ink-soft/60 focus:outline-none"
            />
            <button
              type="button"
              onClick={sendPhoto}
              className="press mt-3 w-full rounded-2xl bg-ink py-2.5 text-xs text-parchment font-medium"
            >
              Send Photo to {state.partner}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Voice recording floating state */}
      {recording ? (
        <div className="mx-4 mb-3 flex items-center justify-between rounded-2xl bg-coral/15 px-4 py-3 border border-coral/30">
          <div className="flex items-center gap-2 text-coral">
            <span className="h-2.5 w-2.5 rounded-full bg-coral animate-ping" />
            <span className="text-xs font-medium">Recording microphone…</span>
            <span className="font-mono text-xs">{formatClock(recordSecs)}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelRecording}
              className="press text-xs text-ink-soft hover:text-ink px-2 py-1"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={stopAndSendRecording}
              className="press rounded-xl bg-coral px-3 py-1.5 text-xs text-primary-foreground font-medium shadow-soft"
            >
              Send Whisper
            </button>
          </div>
        </div>
      ) : null}

      {/* Bottom Chat Input Bar - padded above bottom navigation bar */}
      <div className="glass-strong border-t border-white/50 p-3 pb-24 md:pb-24 transition-all">
        <div className="flex items-center gap-2">
          {/* Photo attach button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="press glass grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink hover:text-coral"
            title="Send photo"
          >
            <ImageIcon size={18} strokeWidth={1.6} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoSelect}
          />

          {/* Voice record button */}
          <button
            type="button"
            onClick={recording ? stopAndSendRecording : startRecording}
            className={cn(
              "press grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors",
              recording ? "bg-coral text-white" : "glass text-ink hover:text-coral",
            )}
            title="Record voice whisper"
          >
            <Mic size={18} strokeWidth={1.6} />
          </button>

          {/* Text input */}
          <div className="relative flex-1">
            <textarea
              value={text}
              onChange={handleTextChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder={`Whisper to ${state.partner}…`}
              className="w-full resize-none rounded-[22px] border border-white/70 bg-white/60 px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-coral"
            />
          </div>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim()}
            className={cn(
              "press grid h-11 w-11 shrink-0 place-items-center rounded-full transition-all",
              text.trim()
                ? "bg-ink text-parchment shadow-soft"
                : "bg-ink/10 text-ink/30 cursor-not-allowed",
            )}
            title="Send"
          >
            <Send size={16} strokeWidth={1.8} className="translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
