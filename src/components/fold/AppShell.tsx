import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BottomNavigation } from "./BottomNavigation";
import { NotificationManager } from "./NotificationManager";
import { useFold } from "@/lib/fold-store";

export function AppShell({
  children,
  nav = true,
  className,
  desktopWide = false,
}: {
  children: ReactNode;
  nav?: boolean;
  className?: string;
  desktopWide?: boolean;
}) {
  const state = useFold();
  // Ambient atmosphere combines user and partner moods, with partner mood taking subtle priority or fallback to myMood
  const activeMood = state.myMood?.type || "calm";

  return (
    <div
      data-mood={activeMood}
      className="app-gradient flex min-h-[100dvh] w-full items-center justify-center transition-colors duration-700 md:p-6 lg:p-10"
    >
      <NotificationManager />

      <div
        className={cn(
          "app-gradient grain relative flex h-[100dvh] w-full flex-col overflow-hidden transition-all duration-700 md:h-[900px] md:rounded-[44px] md:border md:border-white/60 md:shadow-device",
          desktopWide ? "md:max-w-[760px] lg:max-w-[860px]" : "md:w-[420px] lg:w-[430px]",
        )}
      >
        {/* atmospheric dynamic mood blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-28 -top-24 h-72 w-72 rounded-full blur-3xl transition-all duration-1000"
          style={{ background: "var(--mood-blob-1)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-1/3 h-64 w-64 rounded-full blur-3xl transition-all duration-1000"
          style={{ background: "var(--mood-blob-2)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-10 left-1/4 h-52 w-52 rounded-full blur-3xl opacity-60 transition-all duration-1000"
          style={{ background: "var(--mood-glow)" }}
        />

        <div
          className={cn(
            "relative z-10 flex-1 overflow-y-auto overscroll-contain",
            nav ? "pb-28" : "pb-6",
            className,
          )}
        >
          {children}
        </div>
        {nav ? <BottomNavigation /> : null}
      </div>
    </div>
  );
}
