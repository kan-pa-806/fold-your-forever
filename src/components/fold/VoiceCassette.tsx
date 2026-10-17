import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "motion/react";
import { Mic, Play, Pause, Trash2, Square, AlertCircle, Volume2 } from "lucide-react";
import { formatClock } from "@/lib/fold-store";

type Props = {
  seconds: number | null;
  onChange?: (v: number | null) => void;
  audioUrl?: string | null;
  onAudioChange?: (blob: Blob | null, url: string | null) => void;
  readOnly?: boolean;
};

const BARS = Array.from({ length: 28 }, (_, i) => i);

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

export function VoiceCassette({
  seconds,
  onChange,
  audioUrl: initialAudioUrl,
  onAudioChange,
  readOnly,
}: Props) {
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [position, setPosition] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialAudioUrl ?? null);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const synthCtxRef = useRef<AudioContext | null>(null);

  // Sync initial audioUrl if prop updates
  useEffect(() => {
    if (initialAudioUrl !== undefined) {
      setAudioUrl(initialAudioUrl);
    }
  }, [initialAudioUrl]);

  // Clean up all resources on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = "";
      }
      if (synthCtxRef.current) {
        void synthCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  // Start real microphone recording using MediaRecorder API
  const startRecording = async () => {
    if (readOnly) return;
    setMicError(null);

    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setMicError("Microphone recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalMime = recorder.mimeType || mimeType || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: finalMime });
        
        // Clean previous object URL if any
        if (audioUrl && audioUrl.startsWith("blob:")) {
          URL.revokeObjectURL(audioUrl);
        }

        const newUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(newUrl);

        const durationSeconds = Math.max(
          1,
          Math.round((Date.now() - startTimeRef.current) / 1000),
        );
        onChange?.(durationSeconds);
        onAudioChange?.(audioBlob, newUrl);

        // Turn off microphone hardware stream cleanly
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      };

      // Request data in periodic chunks to ensure chunks are received reliably
      recorder.start(250);
      startTimeRef.current = Date.now();
      setRecording(true);
      setElapsed(0);

      timerRef.current = setInterval(() => {
        const diff = (Date.now() - startTimeRef.current) / 1000;
        setElapsed(Math.min(diff, 120));
        if (diff >= 120) {
          stopRecording();
        }
      }, 100);
    } catch (err: unknown) {
      console.error("[VoiceCassette] Microphone permission error:", err);
      const error = err as { name?: string; message?: string };
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setMicError("Microphone permission was denied. Please allow microphone access to record.");
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        setMicError("No microphone was detected on this device.");
      } else {
        setMicError("Could not access microphone: " + (error.message || "Unknown error"));
      }
      setRecording(false);
      clearTimer();
    }
  };

  // Stop recording and finalize audio
  const stopRecording = useCallback(() => {
    clearTimer();
    setRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        if (mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.requestData();
        }
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.error("[VoiceCassette] Error stopping recorder:", err);
      }
    }
  }, []);

  // Playback synth tones for demo capsules without audio file
  const playSynthesizedVoice = (duration: number) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      synthCtxRef.current = ctx;

      // Play soft warm harmonic chords mimicking a voice hum
      const freqs = [220, 277.18, 329.63, 440];
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.connect(gainNode);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      });

      gainNode.connect(ctx.destination);
    } catch {
      /* ignore audio context restrictions */
    }
  };

  // Play / Pause real recorded audio or synthesized fallback
  const togglePlay = () => {
    const totalSecs = seconds ?? (audioUrl ? 1 : 0);
    if (!totalSecs && !audioUrl) return;

    if (playing) {
      clearTimer();
      setPlaying(false);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      if (synthCtxRef.current) {
        void synthCtxRef.current.close().catch(() => {});
        synthCtxRef.current = null;
      }
      return;
    }

    setPlaying(true);
    setPosition(0);

    if (audioUrl) {
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio(audioUrl);
      } else {
        audioElementRef.current.src = audioUrl;
      }

      const audio = audioElementRef.current;
      audio.currentTime = 0;

      audio.ontimeupdate = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setPosition(audio.currentTime);
        }
      };

      audio.onended = () => {
        setPlaying(false);
        setPosition(0);
        clearTimer();
      };

      audio.onerror = (e) => {
        console.warn("[VoiceCassette] Audio playback error, falling back to timer", e);
        if (totalSecs) {
          playSynthesizedVoice(totalSecs);
        }
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("[VoiceCassette] Autoplay prevented or failed:", err);
          if (totalSecs) {
            playSynthesizedVoice(totalSecs);
          }
        });
      }
    } else {
      // Fallback for demo capsules: synth sound + visual progress
      playSynthesizedVoice(totalSecs);
    }

    startTimeRef.current = Date.now();
    clearTimer();
    timerRef.current = setInterval(() => {
      setPosition((p) => {
        if (audioElementRef.current && audioUrl && !audioElementRef.current.paused) {
          return audioElementRef.current.currentTime;
        }
        if (p + 0.1 >= totalSecs) {
          clearTimer();
          setPlaying(false);
          return 0;
        }
        return p + 0.1;
      });
    }, 100);
  };

  const deleteVoice = () => {
    clearTimer();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = "";
    }
    setPlaying(false);
    setAudioUrl(null);
    setPosition(0);
    setElapsed(0);
    onChange?.(null);
    onAudioChange?.(null, null);
  };

  const spinning = recording || playing;
  const display = recording ? elapsed : playing ? position : (seconds ?? 0);

  return (
    <div className="glass rounded-[26px] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="font-display text-xl text-ink">Voice memo</p>
          {audioUrl ? (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-700 font-medium">
              <Volume2 size={11} /> Real Audio
            </span>
          ) : null}
        </div>
        <span className="rounded-full bg-white/60 px-3 py-1 font-mono text-[11px] tracking-widest text-ink-soft">
          {formatClock(display)}
        </span>
      </div>

      {/* Cassette body */}
      <div
        className="mt-4 rounded-[18px] border border-white/60 p-4 transition-all"
        style={{
          background: "linear-gradient(160deg, oklch(0.95 0.012 85), oklch(0.88 0.016 80))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,.7), 0 14px 28px -22px rgba(47,43,39,.9)",
        }}
      >
        <div className="flex items-center justify-center gap-6">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="relative grid h-16 w-16 place-items-center rounded-full border border-white/70 bg-[oklch(0.97_0.008_85)] shadow-inner"
              style={{ boxShadow: "inset 0 2px 8px rgba(47,43,39,.18)" }}
            >
              <div
                className="h-10 w-10 rounded-full border-[3px] border-ink/25 transition-transform"
                style={{
                  animation: spinning ? "reel-spin 1.4s linear infinite" : undefined,
                  background:
                    "conic-gradient(from 0deg, transparent 0 12%, rgba(47,43,39,.25) 12% 14%, transparent 14% 37%, rgba(47,43,39,.25) 37% 39%, transparent 39% 62%, rgba(47,43,39,.25) 62% 64%, transparent 64% 87%, rgba(47,43,39,.25) 87% 89%, transparent 89%)",
                }}
              />
            </div>
          ))}
        </div>

        {/* Dynamic Waveform */}
        <div className="mt-4 flex h-12 items-center justify-center gap-[3px] rounded-xl bg-white/45 px-3">
          {BARS.map((b) => {
            const active = spinning;
            const base = 6 + ((b * 37) % 26);
            return (
              <motion.span
                key={b}
                className={`w-[3px] rounded-full transition-colors ${
                  recording ? "bg-coral" : "bg-ink/35"
                }`}
                animate={{
                  height: active
                    ? [base * 0.35, Math.min(42, base * (recording ? 1.4 : 1.1)), base * 0.5]
                    : base * 0.35,
                }}
                transition={{
                  duration: 0.5 + (b % 5) * 0.08,
                  repeat: active ? Infinity : 0,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
                style={{ height: base * 0.35 }}
              />
            );
          })}
        </div>
      </div>

      {/* Permission or hardware error */}
      {micError ? (
        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-destructive/10 px-3.5 py-2.5 text-xs text-destructive">
          <AlertCircle size={15} className="shrink-0" />
          <span>{micError}</span>
        </div>
      ) : null}

      {/* Ready state: record buttons */}
      {!seconds && !recording && !readOnly ? (
        <div className="mt-4 text-center">
          <p className="font-hand text-2xl text-ink">Leave a little whisper.</p>
          <div className="mt-3 flex justify-center gap-2">
            <button
              type="button"
              onClick={startRecording}
              className="press inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-ink px-6 text-sm text-parchment shadow-soft hover:bg-ink/90"
            >
              <Mic size={16} /> Record Voice Memo
            </button>
          </div>
          <p className="mt-2 text-[11px] text-ink-soft">
            Tap once to start recording your whisper
          </p>
        </div>
      ) : null}

      {/* Recording in progress */}
      {recording ? (
        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-widest text-coral">
            <span className="h-2 w-2 rounded-full bg-coral animate-ping" />
            <span>RECORDING MIC… {formatClock(elapsed)}</span>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="press mt-3 inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-coral px-7 text-sm font-medium text-white shadow-lift hover:brightness-105"
          >
            <Square size={14} fill="currentColor" /> Stop &amp; Save
          </button>
        </div>
      ) : null}

      {/* Saved / Playback state */}
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
              className="press inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-ink px-6 text-sm text-parchment shadow-soft hover:bg-ink/90"
            >
              {playing ? <Pause size={15} /> : <Play size={15} />}
              {playing ? "Pause" : "Play Whisper"}
            </button>
            {!readOnly && onChange ? (
              <button
                type="button"
                onClick={deleteVoice}
                aria-label="Delete voice memo"
                className="press glass inline-flex min-h-[48px] items-center gap-2 rounded-2xl px-5 text-sm text-ink hover:text-destructive"
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

