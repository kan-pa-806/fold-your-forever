import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Check, Copy, Settings as SettingsIcon, Image as ImageIcon, Mic, PenLine } from "lucide-react";

import { AppShell } from "@/components/fold/AppShell";
import { Logo } from "@/components/fold/Logo";
import { FoldButton } from "@/components/fold/FoldButton";
import { ScratchCard } from "@/components/fold/ScratchCard";
import { VoiceCassette } from "@/components/fold/VoiceCassette";
import {
  DEMO_CODE,
  completeOnboarding,
  formatLongDay,
  markOpened,
  partnerWhisper,
  todaysCapsule,
  useFold,
} from "@/lib/fold-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "11:FOLD — Fold today into forever" },
      {
        name: "description",
        content:
          "A private space for two. Capture a photo, a whisper and a handwritten note, fold it into a letter and seal it for your person.",
      },
      { property: "og:title", content: "11:FOLD — Fold today into forever" },
      {
        property: "og:description",
        content: "A private space for two. Capture a photo, a whisper and a handwritten note, fold it into a letter and seal it for your person.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const state = useFold();
  if (!state.onboarded) {
    return (
      <AppShell nav={false}>
        <Journey />
      </AppShell>
    );
  }
  return (
    <AppShell>
      <Home />
    </AppShell>
  );
}

/* ------------------------------ onboarding ------------------------------ */

function Journey() {
  const [step, setStep] = useState<"welcome" | "name" | "pair" | "paired">("welcome");
  const [name, setName] = useState("Kanika");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [busy, setBusy] = useState<"none" | "generate" | "join">("none");
  const [error, setError] = useState<string | null>(null);

  // Realtime: the host waits here until a partner joins their room.
  useEffect(() => {
    if (!room || room.status !== "waiting") return;
    let cancelled = false;
    const unsubscribe = subscribeToRoom(room.id, (next) => {
      if (cancelled) return;
      setRoom(next);
      if (next.status === "paired") setStep("paired");
    });
    // Safety net in case the realtime event is missed.
    const poll = window.setInterval(async () => {
      const fresh = await fetchRoom(room.id);
      if (!cancelled && fresh?.status === "paired") {
        setRoom(fresh);
        setStep("paired");
      }
    }, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
      unsubscribe();
    };
  }, [room]);

  const handleGenerate = async () => {
    setError(null);
    setBusy("generate");
    try {
      setRoom(await createRoom(name));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy("none");
    }
  };

  const handleJoin = async () => {
    setError(null);
    setBusy("join");
    try {
      const joined = await joinRoom(code, name);
      setRoom(joined);
      setStep("paired");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not join that room.");
    } finally {
      setBusy("none");
    }
  };

  const partner = room ? partnerNameOf(room) : "Your person";


  return (
    <div className="flex min-h-full flex-col px-7 py-12">
      <AnimatePresence mode="wait">
        {step === "welcome" ? (
          <motion.section
            key="welcome"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            className="flex flex-1 flex-col justify-between"
          >
            <Logo size="md" />
            <div>
              <div aria-hidden className="drift mb-10 flex gap-2">
                <span
                  className="paper block h-14 w-14 rotate-6 rounded-[4px]"
                  style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 68%)" }}
                />
                <span
                  className="paper block h-14 w-14 -rotate-3 rounded-[4px]"
                  style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
                />
              </div>
              <h1 className="font-display text-[42px] leading-[1.08] text-ink">
                Some moments deserve more than a message.
              </h1>
              <p className="mt-4 max-w-[300px] text-sm leading-relaxed text-ink-soft">
                Turn little moments into something you can keep.
              </p>
            </div>
            <div>
              <FoldButton full variant="ink" onClick={() => setStep("name")}>
                Begin Your Story →
              </FoldButton>
              <p className="mt-4 text-center text-[11px] tracking-[0.2em] text-ink-soft">
                FOLD TODAY INTO FOREVER
              </p>
            </div>
          </motion.section>
        ) : null}

        {step === "name" ? (
          <motion.section
            key="name"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            className="flex flex-1 flex-col justify-center"
          >
            <h2 className="font-display text-4xl text-ink">What should we call you?</h2>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Your name"
              className="font-hand mt-8 w-full border-b border-ink/20 bg-transparent pb-2 text-4xl text-ink focus:border-coral focus:outline-none"
            />
            <FoldButton className="mt-10" full onClick={() => setStep("pair")}>
              Continue
            </FoldButton>
          </motion.section>
        ) : null}

        {step === "pair" ? (
          <motion.section
            key="pair"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            className="flex flex-1 flex-col justify-center"
          >
            <h2 className="font-display text-4xl leading-tight text-ink">
              Who are you folding memories for?
            </h2>
            <p className="mt-3 text-sm text-ink-soft">
              Connect with your person using a private Soul Code.
            </p>

            <div className="glass mt-7 rounded-3xl p-5 text-center">
              <p className="text-[11px] tracking-[0.2em] text-ink-soft">YOUR SOUL CODE</p>
              <p className="font-display mt-2 text-3xl tracking-[0.24em] text-ink">{DEMO_CODE}</p>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(DEMO_CODE);
                  setCopied(true);
                }}
                className="press mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-white/70 px-4 text-xs text-ink"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy code"}
              </button>
            </div>

            <p className="mt-6 text-center text-[11px] tracking-[0.2em] text-ink-soft">
              OR ENTER PARTNER&rsquo;S CODE
            </p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="FOLD-••••"
              aria-label="Partner Soul Code"
              className="font-display mt-3 w-full rounded-2xl border border-white/60 bg-white/50 py-4 text-center text-2xl tracking-[0.24em] text-ink placeholder:text-ink-soft/50 focus:outline-none"
            />
            <FoldButton
              className="mt-6"
              full
              disabled={code.replace(/\s/g, "") !== DEMO_CODE}
              onClick={() => setStep("paired")}
            >
              Connect
            </FoldButton>
            <p className="mt-3 text-center text-[11px] text-ink-soft">
              Demo code: {DEMO_CODE}
            </p>
          </motion.section>
        ) : null}

        {step === "paired" ? (
          <motion.section
            key="paired"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-1 flex-col items-center justify-center text-center"
          >
            <div className="relative flex h-28 items-center justify-center">
              <motion.span
                initial={{ x: -60, rotate: -18, opacity: 0 }}
                animate={{ x: -8, rotate: -6, opacity: 1 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="paper absolute h-16 w-16"
                style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
              />
              <motion.span
                initial={{ x: 60, rotate: 18, opacity: 0 }}
                animate={{ x: 8, rotate: 6, opacity: 1 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="absolute h-16 w-16 bg-coral/70"
                style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }}
              />
            </div>
            <h2 className="font-display mt-8 text-4xl text-ink">Soul connection made.</h2>
            <p className="mt-3 text-sm text-ink-soft">
              You and Albatross now share one quiet little space.
            </p>
            <FoldButton className="mt-10" variant="ink" onClick={() => completeOnboarding(name)}>
              Enter Our Space →
            </FoldButton>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* --------------------------------- home --------------------------------- */

function Home() {
  const state = useFold();
  const navigate = useNavigate();
  const today = todaysCapsule(state);
  const whisper = partnerWhisper(state);

  return (
    <div className="px-5 pt-7">
      <header className="flex items-center justify-between">
        <div>
          <Logo size="sm" />
          <p className="mt-1 text-[11px] tracking-[0.18em] text-ink-soft">
            {formatLongDay(new Date()).toUpperCase()}
          </p>
        </div>
        <Link
          to="/settings"
          aria-label="Settings"
          className="press glass grid h-11 w-11 place-items-center rounded-full text-ink"
        >
          <SettingsIcon size={17} strokeWidth={1.6} />
        </Link>
      </header>

      <section className="mt-8">
        <h1 className="font-display text-[38px] leading-[1.05] text-ink">Today, worth keeping.</h1>
        <p className="mt-2 text-sm text-ink-soft whitespace-pre-line">
          Leave something for {state.partner}
          {"\n"}.
        </p>
      </section>

      <section className="glass-strong mt-6 rounded-[28px] p-5">
        <p className="text-[11px] tracking-[0.2em] text-ink-soft">DAILY CAPSULE</p>

        {today ? (
          <>
            <p className="font-display mt-3 text-2xl text-ink">Today&rsquo;s capsule is sealed ✓</p>
            <p className="font-hand mt-1 text-2xl text-ink-soft">
              {today.caption || today.note.slice(0, 40)}
            </p>
            <FoldButton
              className="mt-5"
              full
              variant="ghost"
              onClick={() => navigate({ to: "/vault" })}
            >
              View in the vault
            </FoldButton>
          </>
        ) : (
          <>
            <div className="mt-4 flex items-end gap-3">
              <div className="paper flex h-24 w-20 -rotate-3 flex-col items-center justify-center rounded-[6px] text-ink-soft">
                <ImageIcon size={18} strokeWidth={1.4} />
                <span className="mt-1 text-[9px] tracking-widest">PHOTO</span>
              </div>
              <div className="paper flex h-20 w-20 rotate-2 flex-col items-center justify-center rounded-[6px] text-ink-soft">
                <Mic size={18} strokeWidth={1.4} />
                <span className="mt-1 text-[9px] tracking-widest">VOICE</span>
              </div>
              <div className="paper flex h-24 w-20 -rotate-1 flex-col items-center justify-center rounded-[6px] text-ink-soft">
                <PenLine size={18} strokeWidth={1.4} />
                <span className="mt-1 text-[9px] tracking-widest">NOTE</span>
              </div>
            </div>
            <p className="font-display mt-5 text-2xl text-ink">Today is still unwritten.</p>
            <p className="text-sm text-ink-soft">Leave a little piece of it here.</p>
            <FoldButton className="mt-4" full onClick={() => navigate({ to: "/create" })}>
              Create Today&rsquo;s Capsule
            </FoldButton>
          </>
        )}
      </section>

      <section className="mt-7">
        <p className="text-[11px] tracking-[0.2em] text-ink-soft">FROM {state.partner.toUpperCase()}</p>
        <div className="mt-3">
          {whisper ? (
            <ScratchCard onRevealed={() => markOpened(whisper.id)}>
              <div className="paper grain rounded-[26px] p-5">
                {whisper.photo ? (
                  <div className="paper mb-4 rotate-[-1.5deg] rounded-[6px] p-2">
                    <img
                      src={whisper.photo}
                      alt={whisper.caption}
                      loading="lazy"
                      className="aspect-[4/3] w-full rounded-[3px] object-cover"
                    />
                    <p className="font-hand mt-1 text-xl text-ink">{whisper.caption}</p>
                  </div>
                ) : null}
                <p className="font-hand text-[25px] leading-[1.4] text-ink">{whisper.note}</p>
                {whisper.voice ? (
                  <div className="mt-4">
                    <VoiceCassette seconds={whisper.voice} readOnly />
                  </div>
                ) : null}
              </div>
            </ScratchCard>
          ) : (
            <div className="glass rounded-[26px] p-6 text-center">
              <p className="font-display text-2xl text-ink">Nothing from your person yet.</p>
              <p className="mt-1 text-sm text-ink-soft">
                Maybe they&rsquo;re folding something for you.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
