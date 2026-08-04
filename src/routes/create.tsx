import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/fold/AppShell";
import { FoldButton } from "@/components/fold/FoldButton";
import { PhotoPolaroid } from "@/components/fold/PhotoPolaroid";
import { VoiceCassette } from "@/components/fold/VoiceCassette";
import { HandwrittenNote } from "@/components/fold/HandwrittenNote";
import { LetterFold } from "@/components/fold/LetterFold";
import { WaxSeal } from "@/components/fold/WaxSeal";
import { addCapsule, useFold } from "@/lib/fold-store";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create today's capsule — 11:FOLD" },
      {
        name: "description",
        content:
          "Add a photograph, a whispered voice memo and a handwritten note, then fold and seal today's capsule for your person.",
      },
      { property: "og:title", content: "Create today's capsule — 11:FOLD" },
      {
        property: "og:description",
        content: "Photo, voice, handwriting — folded into a letter and sealed with wax.",
      },
    ],
  }),
  component: CreatePage,
});

type Stage = "canvas" | "preview" | "folding" | "seal" | "sent";

function CreatePage() {
  const state = useFold();
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("canvas");
  const [photo, setPhoto] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [note, setNote] = useState("");
  const [voice, setVoice] = useState<number | null>(null);

  const ready = Boolean(note.trim() || photo || voice);

  const send = () => {
    addCapsule({ photo, caption, note, voice });
    setStage("sent");
  };

  return (
    <AppShell nav={stage === "canvas"}>
      <div className="px-5 pt-7">
        <AnimatePresence mode="wait">
          {stage === "canvas" ? (
            <motion.div key="canvas" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button
                type="button"
                onClick={() => navigate({ to: "/" })}
                className="press glass grid h-11 w-11 place-items-center rounded-full text-ink"
                aria-label="Back to our space"
              >
                <ArrowLeft size={17} />
              </button>
              <h1 className="font-display mt-5 text-[34px] leading-[1.1] text-ink">
                Today in a little piece of paper.
              </h1>
              <p className="mt-2 text-sm text-ink-soft">
                Three small things. Take your time with them.
              </p>

              <div className="mt-8 space-y-8">
                <PhotoPolaroid
                  photo={photo}
                  caption={caption}
                  onPhoto={setPhoto}
                  onCaption={setCaption}
                />
                <VoiceCassette seconds={voice} onChange={setVoice} />
                <HandwrittenNote value={note} onChange={setNote} />
              </div>

              <FoldButton
                className="mb-4 mt-8"
                full
                disabled={!ready}
                onClick={() => setStage("preview")}
              >
                Preview this memory
              </FoldButton>
            </motion.div>
          ) : null}

          {stage === "preview" ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="pb-6"
            >
              <p className="text-[11px] tracking-[0.2em] text-ink-soft">YOUR LETTER</p>
              <div className="paper grain mt-4 rounded-[24px] p-5">
                {photo ? (
                  <div className="paper mb-4 -rotate-1 rounded-[6px] p-2">
                    <img
                      src={photo}
                      alt={caption || "Today's photograph"}
                      className="aspect-square w-full rounded-[3px] object-cover"
                    />
                    <p className="font-hand mt-1 text-xl text-ink">{caption}</p>
                  </div>
                ) : null}
                <p className="font-hand text-[25px] leading-[1.42] text-ink">
                  {note || "Dear you…"}
                </p>
                {voice ? (
                  <p className="mt-4 text-xs tracking-widest text-ink-soft">
                    VOICE MEMO • {String(Math.floor(voice / 60)).padStart(2, "0")}:
                    {String(voice % 60).padStart(2, "0")}
                  </p>
                ) : null}
              </div>
              <FoldButton className="mt-6" full variant="ink" onClick={() => setStage("folding")}>
                Fold This Memory
              </FoldButton>
              <FoldButton className="mt-3" full variant="ghost" onClick={() => setStage("canvas")}>
                Keep editing
              </FoldButton>
            </motion.div>
          ) : null}

          {stage === "folding" ? (
            <motion.div key="fold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LetterFold note={note} onDone={() => setStage("seal")} />
            </motion.div>
          ) : null}

          {stage === "seal" ? (
            <motion.div key="seal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="font-display text-center text-3xl text-ink">Seal it for your person.</h2>
              <WaxSeal onSealed={send} />
            </motion.div>
          ) : null}

          {stage === "sent" ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center pt-10 text-center"
            >
              <div
                className="paper grain relative h-[150px] w-[230px] rotate-[-2deg] rounded-[10px]"
                style={{ boxShadow: "0 26px 50px -30px rgba(47,43,39,.9)" }}
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-[52%]"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,.6), rgba(47,43,39,.06))",
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  }}
                />
                <span
                  className="font-display absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-parchment"
                  style={{
                    background:
                      "radial-gradient(circle at 32% 28%, oklch(0.62 0.15 27), oklch(0.44 0.13 25))",
                  }}
                >
                  11
                </span>
              </div>
              <h2 className="font-display mt-9 text-[32px] leading-tight text-ink">
                A little piece of today is on its way.
              </h2>
              <p className="mt-3 text-xs tracking-[0.18em] text-ink-soft">
                {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} ·
                SEALED · WAITING TO BE OPENED
              </p>
              <p className="mt-2 text-sm text-ink-soft">For {state.partner}</p>
              <FoldButton className="mt-10" variant="ink" onClick={() => navigate({ to: "/" })}>
                Back to Our Space
              </FoldButton>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
