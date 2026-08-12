import { cn } from "@/lib/utils";
import logoAsset from "@/assets/fold-logo.png.asset.json";

export function Logo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const px = size === "lg" ? 96 : size === "md" ? 52 : 34;
  const scale = size === "lg" ? "text-4xl" : size === "md" ? "text-2xl" : "text-base";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <img
        src={logoAsset.url}
        alt="11:FOLD logo"
        width={px}
        height={px}
        className="rounded-full object-cover"
        style={{ width: px, height: px }}
      />
      <span className={cn("font-display tracking-[0.14em] text-ink", scale)}>
        <span className="font-light">11</span>
        <span className="font-medium">FOLD</span>
      </span>
    </span>
  );
}
