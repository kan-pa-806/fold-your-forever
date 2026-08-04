import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";

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

  const paintCover = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const { width, height } = wrap.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#E3D9C9");
    grad.addColorStop(0.5, "#D2C6B4");
    grad.addColorStop(1, "#E8DFD2");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(47,43,39,0.05)";
    for (let i = 0; i < 900; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 1.4, 1.4);
    }
  }, []);

  useEffect(() => {
    if (!done) paintCover();
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
    ctx.arc(clientX - rect.left, clientY - rect.top, 26, 0, Math.PI * 2);
    ctx.fill();
    checks.current++;
    if (checks.current % 8 === 0 && progress() > 0.42) finish();
  };

  const finish = () => {
    if (done) return;
    setDone(true);
    onRevealed();
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {children}
      </motion.div>
    );
  }

  return (
    <div ref={wrapRef} className="relative overflow-hidden rounded-[26px]">
      <div aria-hidden className="pointer-events-none select-none blur-[2px]">
        {children}
      </div>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        onPointerDown={(e) => {
          drawing.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          scratch(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => drawing.current && scratch(e.clientX, e.clientY)}
        onPointerUp={() => (drawing.current = false)}
        onPointerLeave={() => (drawing.current = false)}
      />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
        <p className="font-display text-2xl text-ink">Someone left you something.</p>
        <p className="text-xs tracking-wide text-ink-soft">Scratch gently to reveal.</p>
      </div>
      <button
        type="button"
        onClick={finish}
        className="press absolute bottom-3 right-3 rounded-full bg-white/70 px-3 py-2 text-[11px] tracking-wide text-ink-soft"
      >
        Reveal it for me
      </button>
    </div>
  );
}
