import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Mic } from "lucide-react";

import { AppShell } from "@/components/fold/AppShell";
import { MemoryDetail } from "@/components/fold/MemoryDetail";
import { formatClock, formatDay, useFold, type Capsule } from "@/lib/fold-store";

export const Route = createFileRoute("/vault")({
  head: () => ({
    meta: [
      { title: "Our little archive — 11:FOLD Memory Vault" },
      {
        name: "description",
        content:
          "Every folded capsule you and your person have kept: polaroids, whispers and handwritten notes in one quiet timeline.",
      },
      { property: "og:title", content: "Our little archive — 11:FOLD Memory Vault" },
      {
        property: "og:description",
        content: "A timeline of everything worth keeping, folded together.",
      },
    ],
  }),
  component: VaultPage,
});

function VaultPage() {
  const state = useFold();
  const [open, setOpen] = useState<Capsule | null>(null);

  return (
    <AppShell>
      <div className="px-5 pt-8">
        <h1 className="font-display text-[34px] text-ink">Our little archive.</h1>
        <p className="mt-1 text-sm text-ink-soft">Everything worth keeping, folded together.</p>

        {state.capsules.length === 0 ? (
          <div className="glass mt-8 rounded-[26px] p-7 text-center">
            <p className="font-display text-2xl text-ink">Your story starts here.</p>
            <p className="mt-1 text-sm text-ink-soft">Every little moment will have a place.</p>
          </div>
        ) : (
          <ol className="relative mt-8 space-y-6 border-l border-ink/10 pl-5">
            {state.capsules.map((c, i) => (
              <motion.li
                key={c.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.3) }}
              >
                <span
                  aria-hidden
                  className="absolute -left-[5px] mt-6 h-2.5 w-2.5 rounded-full bg-coral"
                />
                <button
                  type="button"
                  onClick={() => setOpen(c)}
                  className="press paper grain w-full rounded-[22px] p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-[0.22em] text-ink-soft">
                      {formatDay(c.date)}
                    </span>
                    <span
                      className="font-display grid h-7 w-7 place-items-center rounded-full text-[11px] text-parchment"
                      style={{
                        background:
                          "radial-gradient(circle at 32% 28%, oklch(0.62 0.15 27), oklch(0.44 0.13 25))",
                      }}
                    >
                      {(c.author === "me" ? state.name : state.partner).slice(0, 1)}
                    </span>
                  </div>
                  {c.photo ? (
                    <div className="paper mt-3 -rotate-1 rounded-[5px] p-1.5">
                      <img
                        src={c.photo}
                        alt={c.caption || "Memory photograph"}
                        loading="lazy"
                        className="aspect-[4/3] w-full rounded-[3px] object-cover"
                      />
                    </div>
                  ) : null}
                  <p className="font-hand mt-3 text-2xl text-ink">
                    {c.caption || c.note.slice(0, 36)}
                  </p>
                  {c.voice ? (
                    <p className="mt-2 flex items-center gap-1.5 text-[11px] tracking-wide text-ink-soft">
                      <Mic size={12} /> Voice memo • {formatClock(c.voice)}
                    </p>
                  ) : null}
                </button>
              </motion.li>
            ))}
          </ol>
        )}
      </div>

      <AnimatePresence>
        {open ? (
          <MemoryDetail
            capsule={open}
            partner={state.partner}
            me={state.name}
            onClose={() => setOpen(null)}
          />
        ) : null}
      </AnimatePresence>
    </AppShell>
  );
}
