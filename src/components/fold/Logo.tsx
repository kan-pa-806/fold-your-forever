import { cn } from "@/lib/utils";

export function FoldLogoIcon({ size = 38, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      aria-hidden="true"
    >
      {/* Outer subtle shadow & warm parchment seal base */}
      <circle cx="22" cy="22" r="21" fill="oklch(0.973 0.008 85)" stroke="oklch(0.27 0.008 70 / 0.14)" strokeWidth="1.2" />
      <circle cx="22" cy="22" r="18" fill="url(#fold-bg)" stroke="oklch(0.775 0.077 30 / 0.3)" strokeDasharray="2 2" strokeWidth="0.8" />
      
      {/* Origami folded envelope geometric silhouette forming stylized F */}
      {/* Vertical spine */}
      <path
        d="M14 11.5 H28.5 C29.5 11.5 30 12.5 29.4 13.2 L24.5 19.5 H19 V32.5 C19 33.3 18.2 34 17.5 34 C16.7 34 16 33.3 16 32.5 V13.5 C16 12.4 16.9 11.5 18 11.5 Z"
        fill="oklch(0.27 0.008 70)"
      />
      {/* Envelope flap folded triangle (forming top bar of F) */}
      <path
        d="M17 12 L28 12 L22.5 19.2 Z"
        fill="url(#flap-grad)"
        stroke="oklch(1 0 0 / 0.6)"
        strokeWidth="0.5"
      />
      {/* Middle folded letter bar of F with wax accent */}
      <path
        d="M18.5 20.8 H26.5 C27.3 20.8 27.8 21.6 27.3 22.3 L25 25 H18.5 V20.8 Z"
        fill="oklch(0.775 0.077 30)"
        opacity="0.95"
      />
      {/* Tiny wax seal gem in the fold */}
      <circle cx="21" cy="23" r="1.8" fill="oklch(0.53 0.14 25)" />

      <defs>
        <radialGradient id="fold-bg" cx="30%" cy="25%" r="85%">
          <stop offset="0%" stopColor="oklch(0.99 0.005 85)" />
          <stop offset="100%" stopColor="oklch(0.935 0.015 85)" />
        </radialGradient>
        <linearGradient id="flap-grad" x1="17" y1="12" x2="28" y2="19.2" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="oklch(0.775 0.077 30)" />
          <stop offset="100%" stopColor="oklch(0.68 0.09 32)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({
  className,
  size = "md",
  showText = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}) {
  const px = size === "lg" ? 54 : size === "md" ? 38 : 28;
  const scale = size === "lg" ? "text-3xl" : size === "md" ? "text-2xl" : "text-base";

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <FoldLogoIcon size={px} />
      {showText && (
        <span className={cn("font-display tracking-[0.16em] text-ink", scale)}>
          <span className="font-light">11:</span>
          <span className="font-semibold text-coral">FOLD</span>
        </span>
      )}
    </span>
  );
}
