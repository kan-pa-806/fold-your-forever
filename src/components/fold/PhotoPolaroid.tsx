import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ImagePlus, RefreshCw, X } from "lucide-react";

type Props = {
  photo: string | null;
  caption: string;
  onPhoto: (v: string | null) => void;
  onCaption: (v: string) => void;
};

export function PhotoPolaroid({ photo, caption, onPhoto, onCaption }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  const read = (file?: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      onPhoto(String(reader.result));
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    read(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ rotate: -1.6 }}
        whileHover={{ rotate: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className="paper relative w-full max-w-[290px] rounded-[10px] p-3 pb-14"
        style={{ boxShadow: "0 22px 44px -26px rgba(47,43,39,0.7)" }}
      >
        <span
          aria-hidden
          className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2 rounded-[2px] bg-white/55 backdrop-blur-sm"
          style={{ boxShadow: "0 2px 6px -3px rgba(47,43,39,.5)" }}
        />
        <div
          className={`relative aspect-square w-full overflow-hidden rounded-[4px] bg-[oklch(0.9_0.012_85)] transition-shadow ${
            dragOver ? "ring-2 ring-coral" : ""
          }`}
        >
          <AnimatePresence mode="wait">
            {photo ? (
              <motion.img
                key={photo.slice(0, 40)}
                src={photo}
                alt={caption || "Your memory photograph"}
                loading="lazy"
                initial={{ y: -24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 90, damping: 17 }}
                className="h-full w-full object-cover"
              />
            ) : (
              <motion.button
                key="empty"
                type="button"
                onClick={() => inputRef.current?.click()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full w-full flex-col items-center justify-center gap-2 text-ink-soft"
              >
                <ImagePlus size={26} strokeWidth={1.3} />
                <span className="font-hand text-xl text-ink-soft">
                  {loading ? "Placing it in…" : "Add a little moment."}
                </span>
                <span className="text-[11px] tracking-wide">Tap, or drop a photo here</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="Choose a photograph"
          onChange={(e: ChangeEvent<HTMLInputElement>) => read(e.target.files?.[0])}
        />

        <input
          value={caption}
          onChange={(e) => onCaption(e.target.value)}
          maxLength={44}
          placeholder="Write a tiny caption…"
          aria-label="Photo caption"
          className="font-hand absolute inset-x-4 bottom-3 h-9 w-[calc(100%-2rem)] border-none bg-transparent text-center text-2xl text-ink placeholder:text-ink-soft/60 focus:outline-none"
        />
      </motion.div>

      {photo ? (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="press glass flex min-h-[44px] items-center gap-2 rounded-2xl px-4 text-xs text-ink"
          >
            <RefreshCw size={14} /> Replace
          </button>
          <button
            type="button"
            onClick={() => onPhoto(null)}
            className="press glass flex min-h-[44px] items-center gap-2 rounded-2xl px-4 text-xs text-ink"
          >
            <X size={14} /> Remove
          </button>
        </div>
      ) : null}
    </div>
  );
}
