import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const STAGE_COPY = [
  "Folding your little moment…",
  "Folding your little moment…",
  "Folding your little moment…",
  "Folding your little moment…",
  "Ready to seal.",
];

export function LetterFold({ note, onDone }: { note: string; onDone: () => void }) {
  const [stage, setStage] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const step = reduce ? 260 : 900;
    const timers = [1, 2, 3, 4].map((s) => setTimeout(() => setStage(s), step * s));
    const finish = setTimeout(onDone, step * 4 + 900);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finish);
    };
  }, [onDone, reduce]);

  const spring = { type: "spring" as const, stiffness: 60, damping: 18, mass: 1.1 };
  const panel =
    "absolute paper border border-white/60" + " " + "shadow-[0_16px_30px_-24px_rgba(47,43,39,.9)]";

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div style={{ perspective: 1400 }} className="grid place-items-center">
        <motion.div
          className="relative h-[330px] w-[248px]"
          animate={{ scale: stage >= 4 ? 0.92 : 1, rotateX: stage >= 4 ? 8 : 0 }}
          transition={spring}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* letter face */}
          <div className="paper grain absolute inset-0 rounded-[6px] p-5">
            <p className="font-hand text-[21px] leading-8 text-ink/85">
              {note || "Dear you…"}
            </p>
          </div>

          {/* bottom fold */}
          <motion.div
            className={`${panel} inset-x-0 bottom-0 h-[38%] rounded-b-[6px]`}
            style={{ transformOrigin: "top center", transformStyle: "preserve-3d" }}
            animate={{ rotateX: stage >= 1 ? -168 : 0 }}
            transition={spring}
          />
          {/* left fold */}
          <motion.div
            className={`${panel} inset-y-0 left-0 w-[27%] rounded-l-[6px]`}
            style={{ transformOrigin: "right center", transformStyle: "preserve-3d" }}
            animate={{ rotateY: stage >= 2 ? 166 : 0 }}
            transition={spring}
          />
          {/* right fold */}
          <motion.div
            className={`${panel} inset-y-0 right-0 w-[27%] rounded-r-[6px]`}
            style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
            animate={{ rotateY: stage >= 2 ? -166 : 0 }}
            transition={spring}
          />
          {/* top flap */}
          <motion.div
            className={`${panel} inset-x-0 top-0 h-[34%] rounded-t-[6px]`}
            style={{ transformOrigin: "bottom center", transformStyle: "preserve-3d" }}
            animate={{ rotateX: stage >= 3 ? 164 : 0 }}
            transition={spring}
          >
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-full opacity-40"
              style={{
                background:
                  "linear-gradient(180deg, transparent 55%, rgba(47,43,39,.12) 100%)",
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      <motion.p
        key={stage >= 4 ? "ready" : "folding"}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display mt-8 text-2xl text-ink"
      >
        {STAGE_COPY[stage]}
      </motion.p>
    </div>
  );
}
