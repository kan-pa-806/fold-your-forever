import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Mic, Search, Image as ImageIcon, MessageSquareQuote, Sparkles, Filter } from "lucide-react";

import { AppShell } from "@/components/fold/AppShell";
import { MemoryDetail } from "@/components/fold/MemoryDetail";
import { formatClock, formatDay, useFold, MOODS, type Capsule, type MoodType } from "@/lib/fold-store";
import { cn } from "@/lib/utils";

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

type FilterType = "all" | "photos" | "notes" | "voices" | "chat";

function VaultPage() {
  const state = useFold();
  const [open, setOpen] = useState<Capsule | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [selectedMood, setSelectedMood] = useState<MoodType | "all">("all");

  const filteredCapsules = useMemo(() => {
    return state.capsules.filter((c) => {
      // Search filter
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.caption.toLowerCase().includes(q) ||
        c.note.toLowerCase().includes(q) ||
        (c.mood && c.mood.toLowerCase().includes(q));

      if (!matchSearch) return false;

      // Type filter
      if (activeFilter === "photos" && !c.photo) return false;
      if (activeFilter === "voices" && !c.voice) return false;
      if (activeFilter === "notes" && !c.note) return false;
      if (activeFilter === "chat" && !c.foldedFromChatId) return false;

      // Mood filter
      if (selectedMood !== "all" && c.mood !== selectedMood) return false;

      return true;
    });
  }, [state.capsules, search, activeFilter, selectedMood]);

  return (
    <AppShell desktopWide>
      <div className="px-5 pt-8 pb-10">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] tracking-[0.24em] text-coral font-medium">
              OUR SHARED ARCHIVE
            </span>
            <h1 className="font-display text-[36px] text-ink leading-tight">
              Our little archive.
            </h1>
            <p className="mt-0.5 text-sm text-ink-soft">
              Everything worth keeping, folded together. ({state.capsules.length} memories)
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 space-y-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by words, emotions or captions…"
              className="w-full rounded-2xl border border-white/70 bg-white/60 py-3 pl-11 pr-4 text-xs text-ink placeholder:text-ink-soft/60 focus:bg-white focus:outline-none focus:ring-1 focus:ring-coral"
            />
          </div>

          {/* Quick Filter chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {(
              [
                { id: "all", label: "All Folds" },
                { id: "photos", label: "📷 Photos" },
                { id: "voices", label: "🎙️ Whispers" },
                { id: "notes", label: "✍️ Notes" },
                { id: "chat", label: "💌 From Chat" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={cn(
                  "press shrink-0 rounded-full px-3.5 py-1.5 font-medium transition-all",
                  activeFilter === f.id
                    ? "bg-ink text-parchment shadow-soft"
                    : "glass text-ink-soft hover:text-ink",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Mood filter pill strip */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
            <button
              type="button"
              onClick={() => setSelectedMood("all")}
              className={cn(
                "press shrink-0 rounded-full px-2.5 py-1 transition-all",
                selectedMood === "all"
                  ? "bg-coral text-white font-medium"
                  : "bg-white/40 text-ink-soft hover:bg-white/70",
              )}
            >
              All Moods
            </button>
            {(Object.entries(MOODS) as [MoodType, (typeof MOODS)[MoodType]][]).map(
              ([k, v]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSelectedMood(selectedMood === k ? "all" : k)}
                  className={cn(
                    "press shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-all",
                    selectedMood === k
                      ? "bg-coral text-white font-medium"
                      : "bg-white/40 text-ink-soft hover:bg-white/70",
                  )}
                >
                  <span>{v.emoji}</span>
                  <span>{v.label}</span>
                </button>
              ),
            )}
          </div>
        </div>

        {/* Capsule Timeline */}
        {filteredCapsules.length === 0 ? (
          <div className="glass mt-8 rounded-[28px] p-8 text-center">
            <p className="font-display text-2xl text-ink">
              {search || activeFilter !== "all" || selectedMood !== "all"
                ? "No folded moments match this filter."
                : "Your story starts here."}
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              Every whisper and letter between you and {state.partner} will have its place.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCapsules.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.25) }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(c)}
                  className="press paper grain relative w-full rounded-[24px] p-4 text-left shadow-soft hover:shadow-lift transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] tracking-[0.22em] text-ink-soft">
                        {formatDay(c.date)}
                      </span>
                      {c.mood ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[10px] text-ink font-medium">
                          <span>{MOODS[c.mood]?.emoji}</span>
                          <span>{MOODS[c.mood]?.label}</span>
                        </span>
                      ) : null}
                    </div>

                    <span
                      className="font-display grid h-7 w-7 place-items-center rounded-full text-[11px] text-parchment shadow-sm"
                      style={{
                        background:
                          "radial-gradient(circle at 32% 28%, oklch(0.62 0.15 27), oklch(0.44 0.13 25))",
                      }}
                    >
                      {(c.author === "me" ? state.name : state.partner).slice(0, 1)}
                    </span>
                  </div>

                  {c.photo ? (
                    <div className="paper mt-3 -rotate-1 rounded-[6px] p-1.5 shadow-sm">
                      <img
                        src={c.photo}
                        alt={c.caption || "Memory photograph"}
                        loading="lazy"
                        className="aspect-[4/3] w-full rounded-[4px] object-cover"
                      />
                    </div>
                  ) : null}

                  <p className="font-hand mt-3 text-2xl text-ink leading-snug">
                    {c.caption || c.note.slice(0, 42)}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-ink/5 pt-2 text-[11px] text-ink-soft">
                    {c.voice ? (
                      <span className="flex items-center gap-1">
                        <Mic size={12} className="text-coral" /> Whisper • {formatClock(c.voice)}
                      </span>
                    ) : (
                      <span>Folded letter</span>
                    )}

                    {c.foldedFromChatId ? (
                      <span className="flex items-center gap-1 text-coral font-medium text-[10px]">
                        <MessageSquareQuote size={11} /> From chat
                      </span>
                    ) : null}
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
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
