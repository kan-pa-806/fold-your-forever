import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BottomNavigation } from "./BottomNavigation";

export function AppShell({
  children,
  nav = true,
  className,
}: {
  children: ReactNode;
  nav?: boolean;
  className?: string;
}) {
  return (
    <div className="app-gradient flex min-h-[100dvh] w-full items-center justify-center md:p-10">
      <div
        className={cn(
          "app-gradient grain relative flex h-[100dvh] w-full flex-col overflow-hidden md:h-[880px] md:w-[412px] md:rounded-[44px] md:border md:border-white/60 md:shadow-device",
        )}
      >
        {/* atmospheric blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-coral/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-1/3 h-56 w-56 rounded-full bg-teal/20 blur-3xl"
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
