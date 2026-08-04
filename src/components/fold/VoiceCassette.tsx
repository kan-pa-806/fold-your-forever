import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Mic, Play, Pause, Trash2, Square } from "lucide-react";
import { formatClock } from "@/lib/fold-store";

type Props = {
  seconds: number | null;
  onChange?: (v: number | null) => void;
  readOnly?: boolean;
};

const BARS = Array.from({ length: 28 }, (_, i) => i);

export function VoiceCassette({ seconds, onChange, readOnly }: Props) {
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [position, setPosition] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => void (timer.current && clearInterval(timer.current)), []);

  const clear = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  const startRecording = () => {
    if (readOnly) return;
    setRecording(true);
    setElapsed(0);
    timer.current = setInterval(() => setElapsed((e) => Math.min(e + 0.1, 120)), 100);
  };

  const stopRecording = () => {
    if (!recording) return;
    clear();
    setRecording(false);
    onChange?.(Math.max(1, Math.round(elapsed)));
  };

  const togglePlay = () => {
    if (!seconds) return;
    if (playing) {
      clear();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    setPosition(0);
    timer.current = setInterval(() => {
      setPosition((p) => {
        if (p + 0.1 >= seconds) {
          clear();
          setPlaying(false);
          return 0;
        }
        return p + 0.1;
      });
    }, 100);
  };

  const spinning = recording || playing;
  const display = recording ? elapsed : playing ? position : (seconds ?? 0);

  return (
    <div className="glass rounded-[26px] p-5">
      <div className="flex items-center justify-between">
        <p className="font-display text-xl text-ink">Voice memo</p>
        <span className="rounded-full bg-white/60 px-3 py-1 font-mono text-[11px] tracking-widest text-ink-soft">
          {formatClock(display)}
        </span>
      </div>

      {/* cassette body */}
      <div
        className="mt-4 rounded-[18px] border border-white/60 p-4"
        style={{
          background: "linear-gradient(160deg, oklch(0.95 0.012 85), oklch(0.88 0.016 80))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.7), 0 14px 28px -22px rgba(47,43,39,.9)",
        }}
      >
        <div className="flex items-center justify-center gap-6">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="relative grid h-16 w-16 place-items-center rounded-full border border-white/70 bg-[oklch(0.97_0.008_85)]"
              style={{ boxShadow: "inset 0 2px 8px rgba(47,43,39,.18)" }}
            >
              <div
                className="h-10 w-10 rounded-full border-[3px] border-ink/25"
                style={{
                  animation: spinning ? "reel-spin 1.6s linear infinite" : undefined,
                  background:
                    "conic-gradient(from 0deg, transparent 0 12%, rgba(47,43,39,.22) 12% 14%, transparent 14% 37%, rgba(47,43,39,.22) 37% 39%, transparent 39% 62%, rgba(47,43,39,.22) 62% 64%, transparent 64% 87%, rgba(47,43,39,.22) 87% 89%, transparent 89%)",
                }}
              />
            </div>
          ))}
        </div>

        {/* waveform */}
        <div className="mt-4 flex h-12 items-center justify-center gap-[3px] rounded-xl bg-white/45 px-3">
          {BARS.map((b) => {
            const active = spinning;
            const base = 6 + ((b * 37) % 26);
            return (
              <motion.span
                key={b}
                className="w-[3px] rounded-full bg-ink/35"
                animate={{ height: active ? [base * 0.4, base, base * 0.55] : base * 0.4 }}
                transition={{
                  duration: 0.7 + (b % 5) * 0.08,
                  repeat: active ? Infinity : 0,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
                style={{ height: base * 0.4 }}
              />
            );
          })}
        </div>
      </div>

      {!seconds && !recording ? (
        <div className="mt-4 text-center">
          <p className="font-hand text-2xl text-ink">Leave a little whisper.</p>
          <button
            type="button"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            onKeyDown={(e) => e.key === "Enter" && startRecording()}
            onKeyUp={(e) => e.key === "Enter" && stopRecording()}
            className="press mt-3 inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-ink px-6 text-sm text-parchment"
          >
            <Mic size={16} /> Hold to Record
          </button>
        </div>
      ) : null}

      {recording ? (
        <div className="mt-4 text-center">
          <p className="text-xs tracking-widest text-coral">RECORDING…</p>
          <button
            type="button"
            onClick={stopRecording}
            className="press mt-3 inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-coral px-6 text-sm text-primary-foreground"
          >
            <Square size={14} /> Stop
          </button>
        </div>
      ) : null}

      {seconds && !recording ? (
        <div className="mt-4">
          <p className="text-center text-xs tracking-widest text-ink-soft">
            {readOnly ? "SOME THINGS SOUND BETTER IN THEIR VOICE" : "VOICE MEMO SAVED"}
          </p>
          <div className="mt-3 flex justify-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? "Pause voice memo" : "Play voice memo"}
              className="press inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-ink px-6 text-sm text-parchment"
            >
              {playing ? <Pause size={15} /> : <Play size={15} />} {playing ? "Pause" : "Play"}
            </button>
            {!readOnly && onChange ? (
              <button
                type="button"
                onClick={() => {
                  clear();
                  setPlaying(false);
                  onChange(null);
                }}
                aria-label="Delete voice memo"
                className="press glass inline-flex min-h-[48px] items-center gap-2 rounded-2xl px-5 text-sm text-ink"
              >
                <Trash2 size={15} /> Delete
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
