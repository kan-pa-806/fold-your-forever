import { useRef } from "react";

type Props = { value: string; onChange: (v: string) => void };

const MAX = 420;

export function HandwrittenNote({ value, onChange }: Props) {
  const history = useRef<string[]>([]);

  const set = (next: string) => {
    history.current.push(value);
    onChange(next.slice(0, MAX));
  };

  return (
    <div className="paper grain relative overflow-hidden rounded-[24px] p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-ink/5"
        style={{ boxShadow: "0 1px 0 rgba(255,255,255,.8)" }}
      />
      <p className="font-display text-xl text-ink">Write what you don&rsquo;t want to text.</p>
      <textarea
        value={value}
        onChange={(e) => set(e.target.value)}
        placeholder="Dear you…"
        aria-label="Handwritten love note"
        rows={6}
        className="font-hand mt-3 w-full resize-none border-none bg-transparent text-[26px] leading-[1.45] text-ink placeholder:text-ink-soft/55 focus:outline-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0 37px, rgba(47,43,39,.07) 37px 38px)",
          lineHeight: "38px",
        }}
      />
      <div className="mt-2 flex items-center justify-between text-[11px] tracking-wide text-ink-soft">
        <div className="flex gap-3">
          <button
            type="button"
            className="press min-h-[36px] underline-offset-4 hover:underline"
            onClick={() => {
              const prev = history.current.pop();
              if (prev !== undefined) onChange(prev);
            }}
          >
            Undo
          </button>
          <button
            type="button"
            className="press min-h-[36px] underline-offset-4 hover:underline"
            onClick={() => set("")}
          >
            Clear
          </button>
        </div>
        <span>
          {value.length}/{MAX}
        </span>
      </div>
    </div>
  );
}
