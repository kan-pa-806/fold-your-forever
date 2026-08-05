import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import { FoldButton } from "@/components/fold/FoldButton";

type Placed = { id: number; glyph: string; x: number; y: number; rotate: number };

const GLYPHS = ["11", "♡", "✶"];

export function WaxSeal({ onSealed }: { onSealed: () => void }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);

  const place = (glyph: string) => {
    if (done) return;
    // seals always snap neatly onto the dotted target; extras fan out a touch
    const i = placed.length;
    const ring = i === 0 ? 0 : 22;
    const angle = (i - 1) * (Math.PI / 3);
    const x = i === 0 ? 0 : Math.round(Math.cos(angle) * ring);
    const y = i === 0 ? 0 : Math.round(Math.sin(angle) * ring);
    setPlaced((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), glyph, x, y, rotate: i === 0 ? 0 : (i % 2 ? 8 : -8) },
    ]);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(18);
  };

  const isNearTarget = (point: { x: number; y: number }) => {
    const rect = targetRef.current?.getBoundingClientRect();
    if (!rect) return false;
    const d = Math.hypot(
      point.x - (rect.left + rect.width / 2),
      point.y - (rect.top + rect.height / 2),
    );
    return d < 110;
  };

  const finish = () => {
    setDone(true);
    setTimeout(onSealed, 700);
  };

  return (
    <div className="flex flex-col items-center gap-8 py-6">
      {/* envelope */}
      <motion.div
        animate={placed.length ? { rotate: [0, -0.8, 0.6, 0], y: [0, 2, 0] } : {}}
        transition={{ duration: 0.45 }}
        className="paper grain relative h-[190px] w-[268px] rounded-[10px] border border-white/60"
        style={{ boxShadow: "0 26px 50px -30px rgba(47,43,39,.9)" }}
      >
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[52%]"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,.65), rgba(47,43,39,.07))",
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          }}
        />
        <div
          ref={targetRef}
          className={`absolute left-1/2 top-[48%] grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-dashed transition-colors ${
            dragging ? "border-coral" : "border-ink/20"
          }`}
        >
          {placed.length === 0 ? (
            <span className="text-[10px] tracking-widest text-ink-soft">HERE</span>
          ) : null}
        </div>

        {/* placed seals live above the target so they never unmount on re-drop */}
        <AnimatePresence>
          {placed.map((p) => (
            <motion.div
              key={p.id}
              initial={{ scale: 1.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 14 }}
              className="pointer-events-none absolute left-1/2 top-[48%]"
              style={{
                transform: `translate(-50%,-50%) translate(${p.x}px, ${p.y}px) rotate(${p.rotate}deg)`,
              }}
            >
              <Stamp glyph={p.glyph} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {!done ? (
        <div className="glass w-full max-w-[300px] rounded-3xl p-4 text-center">
          <p className="text-[11px] tracking-widest text-ink-soft">WAX TRAY</p>
          <div className="mt-3 flex items-center justify-center gap-5">
            {GLYPHS.map((glyph) => (
              <motion.button
                key={glyph}
                type="button"
                drag
                dragSnapToOrigin
                dragMomentum={false}
                whileDrag={{ scale: 1.12, rotate: -6 }}
                onDragStart={() => setDragging(true)}
                onDragEnd={(_, info) => {
                  setDragging(false);
                  if (isNearTarget(info.point)) place(glyph, info.point);
                }}
                onClick={() => place(glyph)}
                aria-label={`Place the ${glyph} wax seal on the envelope`}
                className="cursor-grab touch-none active:cursor-grabbing"
              >
                <Stamp glyph={glyph} />
              </motion.button>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-soft">
            {dragging
              ? "Almost there…"
              : placed.length
                ? `${placed.length} seal${placed.length > 1 ? "s" : ""} placed — add more or seal it.`
                : "Drag a seal onto the envelope — or tap it."}
          </p>
          {placed.length ? (
            <div className="mt-3 flex gap-2">
              <FoldButton
                className="flex-1"
                variant="ghost"
                onClick={() => setPlaced((prev) => prev.slice(0, -1))}
              >
                Undo
              </FoldButton>
              <FoldButton className="flex-1" variant="ink" onClick={finish}>
                Seal it
              </FoldButton>
            </div>
          ) : null}
        </div>
      ) : (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl text-ink"
        >
          Sealed for your person.
        </motion.p>
      )}
    </div>
  );
}

function Stamp({ glyph = "11" }: { glyph?: string }) {
  return (
    <span
      className="font-display grid h-14 w-14 place-items-center rounded-full text-lg tracking-widest text-parchment"
      style={{
        background: "radial-gradient(circle at 32% 28%, oklch(0.62 0.15 27), oklch(0.44 0.13 25))",
        boxShadow:
          "inset 0 2px 6px rgba(255,255,255,.35), inset 0 -4px 10px rgba(0,0,0,.35), 0 10px 20px -12px rgba(47,43,39,.9)",
      }}
    >
      {glyph}
    </span>
  );
}
