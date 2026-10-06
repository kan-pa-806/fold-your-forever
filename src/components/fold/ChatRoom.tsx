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
  ArrowDown,
  Sparkles,
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
import { cn } from "@/lib/utils";

const QUICK_EMOJIS = ["🤍", "🥰", "✨", "🫂", "🥺", "🌸"];

export function ChatRoom() {
  const state = useFold();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const recordInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const voiceInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll on new message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages.length, state.isPartnerTyping]);

  // Clean voice timers
  useEffect(() => {
    return () => {
      if (recordInterval.current) clearInterval(recordInterval.current);
      if (voiceInterval.current) clearInterval(voiceInterval.current);
    };
  }, []);

  // Voice recording simulation
  const startRecording = () => {
    setRecording(true);
    setRecordSecs(0);
    recordInterval.current = setInterval(() => {
      setRecordSecs((s) => s + 1);
    }, 1000);
  };

  const stopAndSendRecording = () => {
    if (!recording) return;
    if (recordInterval.current) clearInterval(recordInterval.current);
    setRecording(false);
    const secs = Math.max(1, recordSecs);
    sendChatMessage({
      type: "voice",
      voiceSeconds: secs,
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            text: replyingTo.text || (replyingTo.type === "photo" ? "Photo" : "Voice whisper"),
            type: replyingTo.type,
          }
        : null,
    });
    setReplyingTo(null);
    setRecordSecs(0);
  };

  const cancelRecording = () => {
    if (recordInterval.current) clearInterval(recordInterval.current);
    setRecording(false);
    setRecordSecs(0);
  };

  // Play voice message playback simulation
  const togglePlayVoice = (msg: ChatMessage) => {
    if (!msg.voiceSeconds) return;
    if (playingVoiceId === msg.id) {
      if (voiceInterval.current) clearInterval(voiceInterval.current);
      setPlayingVoiceId(null);
      setVoiceProgress(0);
      return;
    }
    if (voiceInterval.current) clearInterval(voiceInterval.current);
    setPlayingVoiceId(msg.id);
    setVoiceProgress(0);
    voiceInterval.current = setInterval(() => {
      setVoiceProgress((p) => {
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
    sendChatMessage({
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
    setPhotoPreview(null);
    setCaption("");
    setReplyingTo(null);
  };

  // Send text message
  const handleSend = () => {
    if (!text.trim()) return;
    sendChatMessage({
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
    setText("");
    setReplyingTo(null);
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
                {state.partner}
              </h2>
              <span className="text-sm">{state.partnerMood.emoji}</span>
            </div>
            <p className="flex items-center gap-1 text-[11px] text-ink-soft">
              {state.isPartnerTyping ? (
                <span className="flex items-center gap-1 text-coral font-medium animate-pulse">
                  <span>typing a thought…</span>
                </span>
              ) : state.isPartnerOnline ? (
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
            <span>{state.partnerMood.label}</span>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 space-y-4 px-4 py-6">
        <div className="text-center">
          <span className="rounded-full bg-white/40 px-3 py-1 text-[10px] tracking-[0.16em] text-ink-soft">
            END-TO-END INTIMATE · ONLY THE TWO OF YOU
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
                {msg.type === "voice" && msg.voiceSeconds ? (
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
                              : msg.voiceSeconds,
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
                      <CheckCheck size={12} className="text-coral" />
                    ) : (
                      <Check size={12} />
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
                    onClick={() => deleteChatMessage(msg.id)}
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
                      onClick={() => {
                        toggleMessageReaction(msg.id, em);
                        setShowEmojiPickerFor(null);
                      }}
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
            <span className="text-xs font-medium">Recording whisper…</span>
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
              className="press rounded-xl bg-coral px-3 py-1.5 text-xs text-primary-foreground font-medium"
            >
              Send Whisper
            </button>
          </div>
        </div>
      ) : null}

      {/* Bottom Chat Input Bar */}
      <div className="glass-strong border-t border-white/50 p-3 pb-4">
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
              onChange={(e) => setText(e.target.value)}
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
