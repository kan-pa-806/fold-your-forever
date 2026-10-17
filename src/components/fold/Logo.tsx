import { cn } from "@/lib/utils";

/**
 * Icon #11: Romantic Compass Style Logo in Warm Pastel Tones
 * Features:
 * - Vintage romance navigation compass ring in warm cream/parchment
 * - Four-point starry needle pointing to 'Forever' / 'Us'
 * - Delicate rose gold / pastel coral compass star
 * - Center heart gem wax seal with ambient glowing aura
 * - Miniature degree tick marks & celestial sparkle accents
 */
export function FoldLogoIcon({ size = 44, className }: { size?: number; className?: string }) {
  return (
    <div
      className={cn("relative inline-flex items-center justify-center shrink-0 select-none", className)}
      style={{ width: size, height: size }}
    >
      {/* Ambient warm glowing aura */}
      <div
        className="absolute inset-0 rounded-full blur-md opacity-75 transition-all duration-700 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.78 0.13 25 / 0.5) 0%, oklch(0.85 0.08 55 / 0.25) 55%, transparent 100%)",
        }}
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 filter drop-shadow-[0_2px_8px_rgba(235,110,105,0.28)]"
        aria-hidden="true"
      >
        <defs>
          {/* Warm cream/beige background circle */}
          <radialGradient id="compass-bg" cx="30%" cy="25%" r="85%">
            <stop offset="0%" stopColor="#FFFDF9" />
            <stop offset="55%" stopColor="#FBF4EA" />
            <stop offset="100%" stopColor="#F3E5D4" />
          </radialGradient>

          {/* Compass Rose Gold Gradient (North/Primary star points) */}
          <linearGradient id="needle-primary" x1="28" y1="8" x2="28" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F68C8C" />
            <stop offset="50%" stopColor="#E26D77" />
            <stop offset="100%" stopColor="#C95163" />
          </linearGradient>

          {/* Soft Pastel Amber/Gold Gradient (Secondary points & accents) */}
          <linearGradient id="needle-secondary" x1="12" y1="28" x2="44" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FBC07D" />
            <stop offset="50%" stopColor="#F69D66" />
            <stop offset="100%" stopColor="#E27355" />
          </linearGradient>

          {/* Compass Center Heart Wax Seal Glow */}
          <radialGradient id="compass-heart-seal" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFE294" />
            <stop offset="60%" stopColor="#FFA726" />
            <stop offset="100%" stopColor="#E65100" />
          </radialGradient>
        </defs>

        {/* Outer Vintage Compass Frame */}
        <circle cx="28" cy="28" r="26" fill="url(#compass-bg)" stroke="#EAD5BE" strokeWidth="1.4" />
        <circle cx="28" cy="28" r="23" fill="none" stroke="#F1C5BB" strokeWidth="0.8" strokeDasharray="2.5 2.5" opacity="0.85" />
        <circle cx="28" cy="28" r="20" fill="none" stroke="#E6BEAF" strokeWidth="0.6" opacity="0.5" />

        {/* Compass Cardinal Tick Marks (N, S, E, W & diagonals) */}
        <line x1="28" y1="5" x2="28" y2="8" stroke="#D3757D" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="28" y1="48" x2="28" y2="51" stroke="#D3757D" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="5" y1="28" x2="8" y2="28" stroke="#D3757D" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="48" y1="28" x2="51" y2="28" stroke="#D3757D" strokeWidth="1.4" strokeLinecap="round" />

        {/* Diagonal Subtle Ticks */}
        <line x1="12" y1="12" x2="14" y2="14" stroke="#E6A89B" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
        <line x1="44" y1="12" x2="42" y2="14" stroke="#E6A89B" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
        <line x1="12" y1="44" x2="14" y2="42" stroke="#E6A89B" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
        <line x1="44" y1="44" x2="42" y2="42" stroke="#E6A89B" strokeWidth="1" strokeLinecap="round" opacity="0.7" />

        {/* 8-Point Compass Rose Star */}
        {/* Secondary diagonal petals */}
        <path d="M28 28 L37 19 L28 25 L19 19 Z" fill="#FDE1D3" stroke="#F1B6A8" strokeWidth="0.5" />
        <path d="M28 28 L37 37 L28 31 L19 37 Z" fill="#FDE1D3" stroke="#F1B6A8" strokeWidth="0.5" />
        <path d="M28 28 L19 19 L25 28 L19 37 Z" fill="#F8CBB9" stroke="#ECA090" strokeWidth="0.5" />
        <path d="M28 28 L37 19 L31 28 L37 37 Z" fill="#F8CBB9" stroke="#ECA090" strokeWidth="0.5" />

        {/* Primary Compass Needle (East-West) */}
        <path d="M28 28 L11 28 L28 25 Z" fill="url(#needle-secondary)" />
        <path d="M28 28 L11 28 L28 31 Z" fill="#E27355" opacity="0.8" />
        <path d="M28 28 L45 28 L28 25 Z" fill="url(#needle-secondary)" />
        <path d="M28 28 L45 28 L28 31 Z" fill="#E27355" opacity="0.8" />

        {/* Primary Compass Needle (North-South: Heart Guides You Home) */}
        {/* North Pointer */}
        <path d="M28 28 L28 9 L25 28 Z" fill="url(#needle-primary)" />
        <path d="M28 28 L28 9 L31 28 Z" fill="#B63F52" />
        {/* South Pointer */}
        <path d="M28 28 L28 47 L25 28 Z" fill="url(#needle-primary)" />
        <path d="M28 28 L28 47 L31 28 Z" fill="#B63F52" />

        {/* Center Compass Wax Seal Ring */}
        <circle cx="28" cy="28" r="6.2" fill="url(#compass-heart-seal)" stroke="#FFF" strokeWidth="1.2" />

        {/* Center Romantic Heart Seal inside Compass */}
        <path
          d="M28 30.5 C26.2 28.5 25 27 25 26.1 C25 25.2 25.6 24.6 26.5 24.6 C27.1 24.6 27.7 25.1 28 25.5 C28.3 25.1 28.9 24.6 29.5 24.6 C30.4 24.6 31 25.2 31 26.1 C31 27 29.8 28.5 28 30.5 Z"
          fill="#FFF"
        />

        {/* Sparkle 1: North Direction Star */}
        <path d="M28 3 Q28 6 30 6 Q28 6 28 9 Q28 6 26 6 Q28 6 28 3 Z" fill="#FFA726" />

        {/* Sparkle 2: Celestial Corner Star */}
        <path d="M43 10 Q43 12 45 12 Q43 12 43 14 Q43 12 41 12 Q43 12 43 10 Z" fill="#FFB74D" opacity="0.9" />
      </svg>
    </div>
  );
}

/**
 * Redesigned Whimsical App Logo for "11:Folds"
 * Featuring prominent, high-quality, elegant serif typography ("bhari", rich, and artisanal).
 */
export function Logo({
  className,
  size = "md",
  showText = true,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}) {
  const px = size === "lg" ? 56 : size === "md" ? 44 : 34;

  return (
    <span className={cn("inline-flex items-center gap-3 select-none group", className)}>
      <FoldLogoIcon size={px} />
      {showText && (
        <span className="flex flex-col justify-center leading-none">
          <span className="flex items-baseline tracking-normal">
            {/* Whimsical, Roman/Serif "11:" */}
            <span
              className={cn(
                "font-serif font-normal italic tracking-wider text-ink/75 transition-colors group-hover:text-ink",
                size === "lg" ? "text-2xl" : size === "md" ? "text-xl" : "text-base",
              )}
              style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif" }}
            >
              11:
            </span>

            {/* "Folds" in a prominent, rich ("bhari"), whimsical, elegant serif */}
            <span
              className={cn(
                "font-bold tracking-[0.14em] uppercase transition-all duration-300",
                size === "lg" ? "text-3xl" : size === "md" ? "text-2xl" : "text-lg",
              )}
              style={{
                fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
                background: "linear-gradient(135deg, #2D2424 0%, #D85A68 55%, #B83B4F 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                filter: "drop-shadow(0 1px 1px rgba(216,90,104,0.18))",
              }}
            >
              Folds
            </span>

            {/* Tiny romantic heart sparkle mark */}
            <span className="ml-1 text-[10px] text-coral animate-pulse select-none">✦</span>
          </span>

          {/* Artisanal cursive micro-subline */}
          <span
            className={cn(
              "font-hand italic text-ink-soft/80 tracking-wide mt-0.5",
              size === "lg" ? "text-xs" : size === "md" ? "text-[11px]" : "text-[9.5px]",
            )}
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            our forever space
          </span>
        </span>
      )}
    </span>
  );
}

