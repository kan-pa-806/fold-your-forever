import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Check, HeartHandshake, SmilePlus } from "lucide-react";
import { useFold, setMyMood, setPartnerMood, MOODS, type MoodType } from "@/lib/fold-store";
import { cn } from "@/lib/utils";

export function MoodSelector({
  minimal = false,
  className,
}: {
  minimal?: boolean;
  className?: string;
}) {
  const state = useFold();
  const [open, setOpen] = useState(false);
  const [partnerSheet, setPartnerSheet] = useState(false);
  const [customNote, setCustomNote] = useState("");

  const currentMood = state.myMood || { type: "calm" as MoodType, emoji: "😌", label: "Calm" };
  const currentPartnerMood = state.partnerMood || { type: "loved" as MoodType, emoji: "🥰", label: "Loved" };

  const handleSelectMyMood = (type: MoodType) => {
    setMyMood(type, customNote.trim() || undefined);
    setOpen(false);
    setCustomNote("");
  };

  const handleSelectPartnerMood = (type: MoodType) => {
    setPartnerMood(type);
    setPartnerSheet(false);
  };

  if (minimal) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "press glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-ink transition-all",
          className,
        )}
        title="Change your feeling"
      >
        <span className="text-base leading-none">{currentMood.emoji}</span>
        <span className="font-medium">{currentMood.label}</span>
      </button>
    );
  }

  return (
    <div className={cn("glass-strong rounded-[28px] p-5 transition-all duration-500", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-coral" />
          <span className="text-[11px] font-medium tracking-[0.2em] text-ink-soft">
            HOW WE&rsquo;RE FEELING
          </span>
        </div>
        <span className="text-[10px] tracking-widest text-ink-soft/70">
          LIVE RESONANCE
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {/* My mood card */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="press paper grain relative flex flex-col items-start rounded-[22px] p-4 text-left transition-all hover:ring-1 hover:ring-coral/40"
        >
          <div className="flex w-full items-center justify-between">
            <span className="text-[10px] tracking-[0.16em] text-ink-soft">
              YOU ({state.name})
            </span>
            <SmilePlus size={13} className="text-ink-soft/70" />
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-3xl filter drop-shadow-sm">{currentMood.emoji}</span>
            <div>
              <p className="font-display text-xl leading-tight text-ink">
                {currentMood.label}
              </p>
              <p className="text-[10px] text-ink-soft">
                {MOODS[currentMood.type]?.desc || "peaceful"}
              </p>
            </div>
          </div>
          {currentMood.note ? (
            <p className="font-hand mt-2 line-clamp-1 text-sm text-ink-soft">
              &ldquo;{currentMood.note}&rdquo;
            </p>
          ) : null}
          <div className="mt-3 flex items-center gap-1.5 text-[10px] tracking-wide text-coral font-medium">
            <span>Tap to change</span>
            <span>→</span>
          </div>
        </button>

        {/* Partner mood card */}
        <button
          type="button"
          onClick={() => setPartnerSheet(true)}
          className="press paper grain relative flex flex-col items-start rounded-[22px] p-4 text-left transition-all hover:ring-1 hover:ring-coral/40"
        >
          <div className="flex w-full items-center justify-between">
            <span className="text-[10px] tracking-[0.16em] text-ink-soft">
              {state.partner.toUpperCase()}
            </span>
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                state.isPartnerOnline ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" : "bg-ink/30",
              )}
            />
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-3xl filter drop-shadow-sm">{currentPartnerMood.emoji}</span>
            <div>
              <p className="font-display text-xl leading-tight text-ink">
                {currentPartnerMood.label}
              </p>
              <p className="text-[10px] text-ink-soft">
                {MOODS[currentPartnerMood.type]?.desc || "connected"}
              </p>
            </div>
          </div>
          {currentPartnerMood.note ? (
            <p className="font-hand mt-2 line-clamp-1 text-sm text-ink-soft">
              &ldquo;{currentPartnerMood.note}&rdquo;
            </p>
          ) : null}
          <div className="mt-3 flex items-center gap-1.5 text-[10px] tracking-wide text-ink-soft">
            <HeartHandshake size={11} />
            <span>Shared with you</span>
          </div>
        </button>
      </div>

      {/* Mood prompt banner */}
      <div className="mt-3.5 flex items-center justify-between rounded-xl bg-white/40 px-3.5 py-2 text-xs text-ink-soft">
        <span className="truncate">
          {state.name} is feeling <strong className="text-ink">{currentMood.label}</strong> {currentMood.emoji}
        </span>
        <span className="ml-2 shrink-0 text-[10px] tracking-wider text-ink-soft/80">
          • {state.partner} can feel this
        </span>
      </div>

      {/* Modal: Select My Mood */}
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[oklch(0.27_0.008_70/0.4)] p-4 backdrop-blur-md"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 24, stiffness: 220 }}
              className="paper grain w-full max-w-[360px] rounded-[32px] p-6 shadow-device"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <span className="text-[10px] tracking-[0.24em] text-ink-soft">YOUR STATE OF HEART</span>
                <h3 className="font-display mt-1 text-2xl text-ink">
                  How are you feeling right now?
                </h3>
                <p className="mt-1 text-xs text-ink-soft">
                  {state.partner} will sense your quiet mood in this space.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2.5">
                {(Object.entries(MOODS) as [MoodType, (typeof MOODS)[MoodType]][]).map(
                  ([key, val]) => {
                    const active = currentMood.type === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectMyMood(key)}
                        className={cn(
                          "press flex flex-col items-center justify-center rounded-2xl p-3 text-center transition-all",
                          active
                            ? "bg-white shadow-soft ring-2 ring-coral"
                            : "bg-white/40 hover:bg-white/70",
                        )}
                      >
                        <span className="text-3xl">{val.emoji}</span>
                        <span className="font-display mt-1.5 text-base text-ink">
                          {val.label}
                        </span>
                        <span className="mt-0.5 text-[9px] text-ink-soft line-clamp-1">
                          {val.desc}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>

              <div className="mt-4">
                <input
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Optional quiet note for your person…"
                  className="font-hand w-full rounded-2xl border border-ink/10 bg-white/50 px-4 py-2.5 text-lg text-ink placeholder:text-ink-soft/60 focus:border-coral focus:outline-none"
                  maxLength={60}
                />
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="press glass flex-1 rounded-2xl py-3 text-xs text-ink-soft"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Modal: Partner Mood (for demo & pairing testing) */}
      <AnimatePresence>
        {partnerSheet ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[oklch(0.27_0.008_70/0.4)] p-4 backdrop-blur-md"
            onClick={() => setPartnerSheet(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="paper grain w-full max-w-[360px] rounded-[32px] p-6 shadow-device"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <span className="text-[10px] tracking-[0.24em] text-ink-soft">PARTNER SIMULATION</span>
                <h3 className="font-display mt-1 text-2xl text-ink">
                  {state.partner}&rsquo;s Feeling
                </h3>
                <p className="mt-1 text-xs text-ink-soft">
                  Simulate {state.partner}&rsquo;s live mood to see how the shared space shifts.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2.5">
                {(Object.entries(MOODS) as [MoodType, (typeof MOODS)[MoodType]][]).map(
                  ([key, val]) => {
                    const active = currentPartnerMood.type === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectPartnerMood(key)}
                        className={cn(
                          "press flex flex-col items-center justify-center rounded-2xl p-3 text-center transition-all",
                          active
                            ? "bg-white shadow-soft ring-2 ring-coral"
                            : "bg-white/40 hover:bg-white/70",
                        )}
                      >
                        <span className="text-3xl">{val.emoji}</span>
                        <span className="font-display mt-1.5 text-base text-ink">
                          {val.label}
                        </span>
                        <span className="mt-0.5 text-[9px] text-ink-soft line-clamp-1">
                          {val.desc}
                        </span>
                      </button>
                    );
                  },
                )}
              </div>

              <button
                type="button"
                onClick={() => setPartnerSheet(false)}
                className="press glass mt-5 w-full rounded-2xl py-3 text-xs text-ink-soft"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
