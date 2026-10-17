import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";

type Props = {
  children: ReactNode;
  onRevealed: () => void;
  revealed?: boolean;
};

export function ScratchCard({ children, onRevealed, revealed = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const checks = useRef(0);
  const [done, setDone] = useState(revealed);

  // Sync state if external revealed prop changes (e.g. from partner's realtime reveal or store)
  useEffect(() => {
    if (revealed) {
      setDone(true);
    }
  }, [revealed]);

  const paintCover = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const { width, height } = wrap.getBoundingClientRect();
    if (width === 0 || height === 0) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Elegant warm silver-gold parchment scratch foil
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#E7DFD3");
    grad.addColorStop(0.3, "#D5C8B4");
    grad.addColorStop(0.7, "#E2D7C7");
    grad.addColorStop(1, "#D0C2AE");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle stationery grain flecks
    ctx.fillStyle = "rgba(47,43,39,0.06)";
    for (let i = 0; i < 1100; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 1.5, 1.5);
    }
  }, []);

  useEffect(() => {
    if (!done) {
      paintCover();
      const observer = new ResizeObserver(() => {
        if (!done) paintCover();
      });
      if (wrapRef.current) observer.observe(wrapRef.current);
      return () => observer.disconnect();
    }
  }, [paintCover, done]);

  const progress = () => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    for (let i = 3; i < data.length; i += 40) {
      if (data[i] === 0) clear++;
    }
    return clear / (data.length / 40);
  };

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(clientX - rect.left, clientY - rect.top, 32, 0, Math.PI * 2);
    ctx.fill();
    checks.current++;
    if (checks.current % 5 === 0 && progress() > 0.28) finish();
  };

  const finish = () => {
    if (done) return;
    setDone(true);
    onRevealed();
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className="relative w-full min-h-[220px] overflow-hidden rounded-[28px] border border-white/60 shadow-lift"
    >
      {/* Blurred underneath content taking full natural height */}
      <div
        aria-hidden
        className="pointer-events-none w-full select-none overflow-hidden blur-[7px] brightness-95 opacity-80"
      >
        {children}
      </div>

      {/* Interactive scratch foil canvas overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none cursor-grab active:cursor-grabbing z-10"
        onPointerDown={(e) => {
          drawing.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          scratch(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => drawing.current && scratch(e.clientX, e.clientY)}
        onPointerUp={() => (drawing.current = false)}
        onPointerLeave={() => (drawing.current = false)}
      />

      {/* Floating Call to Action */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/70 shadow-soft text-coral mb-3 backdrop-blur-sm">
          <Sparkles size={20} />
        </div>
        <p className="font-display text-2xl text-ink leading-tight">
          Someone left you something.
        </p>
        <p className="mt-1 text-xs tracking-wide text-ink-soft">
          Scratch gently with your finger or cursor to reveal
        </p>
      </div>

      {/* Quick Reveal button for accessibility */}
      <button
        type="button"
        onClick={finish}
        className="press absolute bottom-3 right-3 z-30 rounded-full bg-white/80 px-3.5 py-1.5 text-[11px] font-medium tracking-wide text-ink-soft shadow-sm hover:text-ink backdrop-blur-md border border-white/60"
      >
        Tap to reveal ✨
      </button>
    </div>
  );
}
