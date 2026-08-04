import { cn } from "@/lib/utils";

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const scale = size === "lg" ? "text-5xl" : size === "md" ? "text-2xl" : "text-base";
  return (
    <span
      className={cn(
        "font-display inline-flex items-center gap-1.5 tracking-[0.14em] text-ink",
        scale,
        className,
      )}
    >
      <span className="font-light">11</span>
      <span aria-hidden className="flex flex-col justify-center gap-[3px]">
        <span
          className="block bg-coral"
          style={{
            width: size === "lg" ? 7 : 4,
            height: size === "lg" ? 7 : 4,
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
          }}
        />
        <span
          className="block bg-teal"
          style={{
            width: size === "lg" ? 7 : 4,
            height: size === "lg" ? 7 : 4,
            clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
          }}
        />
      </span>
      <span className="font-medium">FOLD</span>
    </span>
  );
}
