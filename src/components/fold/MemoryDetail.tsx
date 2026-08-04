import { motion } from "motion/react";
import { X } from "lucide-react";
import { formatDay, type Capsule } from "@/lib/fold-store";
import { VoiceCassette } from "./VoiceCassette";

export function MemoryDetail({
  capsule,
  partner,
  me,
  onClose,
}: {
  capsule: Capsule;
  partner: string;
  me: string;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 overflow-y-auto bg-[oklch(0.27_0.008_70/0.35)] p-4 backdrop-blur-md"
    >
      <motion.article
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 110, damping: 20 }}
        className="paper grain mx-auto mt-6 max-w-[360px] rounded-[26px] p-5 pb-8"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] tracking-[0.2em] text-ink-soft">
            {formatDay(capsule.date)}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close memory"
            className="press grid h-11 w-11 place-items-center rounded-full bg-white/70 text-ink"
          >
            <X size={16} />
          </button>
        </div>

        {capsule.photo ? (
          <div className="paper mt-4 rotate-[-1.2deg] rounded-[8px] p-2 pb-10">
            <img
              src={capsule.photo}
              alt={capsule.caption || "Memory photograph"}
              loading="lazy"
              className="aspect-square w-full rounded-[4px] object-cover"
            />
            <p className="font-hand absolute mt-2 text-2xl text-ink">{capsule.caption}</p>
          </div>
        ) : null}

        <p className="font-hand mt-8 text-[25px] leading-[1.45] text-ink">{capsule.note}</p>

        {capsule.voice ? (
          <div className="mt-5">
            <VoiceCassette seconds={capsule.voice} readOnly />
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-4">
          <span className="text-xs text-ink-soft">
            Folded by {capsule.author === "me" ? me : partner}
          </span>
          <span
            className="font-display grid h-9 w-9 place-items-center rounded-full text-xs text-parchment"
            style={{
              background:
                "radial-gradient(circle at 32% 28%, oklch(0.62 0.15 27), oklch(0.44 0.13 25))",
            }}
          >
            {(capsule.author === "me" ? me : partner).slice(0, 1)}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="press mt-6 h-12 w-full rounded-2xl bg-ink text-sm text-parchment"
        >
          Close Memory
        </button>
      </motion.article>
    </motion.div>
  );
}
