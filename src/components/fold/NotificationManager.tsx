import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "@tanstack/react-router";
import { X, Sparkles, MessageCircleHeart } from "lucide-react";
import { useFold, type Capsule } from "@/lib/fold-store";
import { MemoryDetail } from "./MemoryDetail";
import { FoldLogoIcon } from "./Logo";

type ActiveToast = {
  id: string;
  type: "fold" | "chat" | "mood";
  title: string;
  message: string;
  capsuleId?: string | undefined;
  chatId?: string | undefined;
  timestamp: number;
};

export function NotificationManager() {
  const state = useFold();
  const navigate = useNavigate();
  const [activeToast, setActiveToast] = useState<ActiveToast | null>(null);
  const [openedCapsule, setOpenedCapsule] = useState<Capsule | null>(null);

  // Subscribe to real-time events through store mutations
  useEffect(() => {
    // Listen for custom dispatch events inside window for seamless in-app reactive triggers
    const handleNotification = (e: Event) => {
      const customEvent = e as CustomEvent<{
        type: "fold" | "chat" | "mood";
        title: string;
        message: string;
        capsuleId?: string;
        chatId?: string;
      }>;
      const detail = customEvent.detail;
      if (!detail) return;

      const toast: ActiveToast = {
        id: `toast-${Date.now()}`,
        type: detail.type,
        title: detail.title,
        message: detail.message,
        capsuleId: detail.capsuleId,
        chatId: detail.chatId,
        timestamp: Date.now(),
      };

      setActiveToast(toast);

      // Play soft sound cue if enabled
      if (state.prefs?.sound && typeof window !== "undefined") {
        try {
          const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
          osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.3);
        } catch {
          /* ignore */
        }
      }

      // Browser web notification if permitted
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        try {
          new Notification(detail.title, {
            body: detail.message,
            icon: "/favicon.svg",
          });
        } catch {
          /* ignore */
        }
      }
    };

    window.addEventListener("fold:notification", handleNotification);
    return () => {
      window.removeEventListener("fold:notification", handleNotification);
    };
  }, [state.prefs?.sound]);

  // Auto-dismiss after 6.5s
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 6500);
    return () => clearTimeout(timer);
  }, [activeToast]);

  const handleToastClick = () => {
    if (!activeToast) return;
    const { type, capsuleId } = activeToast;
    setActiveToast(null);

    if (type === "fold" && capsuleId) {
      const found = state.capsules.find((c) => c.id === capsuleId);
      if (found) {
        setOpenedCapsule(found);
        return;
      }
      navigate({ to: "/vault" });
    } else if (type === "chat") {
      navigate({ to: "/chat" });
    } else if (type === "mood") {
      navigate({ to: "/" });
    }
  };

  return (
    <>
      <aside aria-label="Notifications" className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-4">
        <AnimatePresence>
          {activeToast ? (
            <motion.div
              key={activeToast.id}
              role="alert"
              aria-live="polite"
              initial={{ y: -45, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -25, opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              onClick={handleToastClick}
              className="pointer-events-auto glass-strong relative flex w-full max-w-[390px] cursor-pointer items-center gap-3 rounded-2xl border border-white/80 p-3.5 shadow-lift backdrop-blur-xl transition-all hover:scale-[1.01]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-soft">
                {activeToast.type === "fold" ? (
                  <FoldLogoIcon size={24} />
                ) : activeToast.type === "chat" ? (
                  <MessageCircleHeart size={20} className="text-coral" />
                ) : (
                  <Sparkles size={18} className="text-coral" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-ink leading-tight">
                  {activeToast.title}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-ink-soft">
                  {activeToast.message}
                </p>
                <span className="mt-1 block text-[9px] tracking-wider text-coral font-medium">
                  {activeToast.type === "fold" ? "TAP TO OPEN ENVELOPE →" : "TAP TO VIEW →"}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveToast(null);
                }}
                className="press -mr-1 -mt-1 grid h-7 w-7 place-items-center rounded-full text-ink-soft hover:bg-white/50 hover:text-ink"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </aside>

      {/* Direct envelope modal view when notification is clicked */}
      <AnimatePresence>
        {openedCapsule ? (
          <MemoryDetail
            capsule={openedCapsule}
            partner={state.partner}
            me={state.name}
            onClose={() => setOpenedCapsule(null)}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

export function triggerNotification(detail: {
  type: "fold" | "chat" | "mood";
  title: string;
  message: string;
  capsuleId?: string;
  chatId?: string;
}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("fold:notification", { detail }));
}
