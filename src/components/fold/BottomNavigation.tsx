import { Link, useRouterState } from "@tanstack/react-router";
import { Home, MessageCircleHeart, PenLine, Archive, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/chat", label: "Chat", Icon: MessageCircleHeart },
  { to: "/create", label: "Fold", Icon: PenLine },
  { to: "/vault", label: "Vault", Icon: Archive },
  { to: "/settings", label: "Space", Icon: Settings },
] as const;

export function BottomNavigation() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      aria-label="Primary"
      className="glass-strong absolute inset-x-3 bottom-3 z-20 flex items-center justify-between rounded-3xl px-2 py-2"
    >
      {items.map(({ to, label, Icon }) => {
        const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "press flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] tracking-wide transition-colors",
              active ? "bg-white/70 text-ink" : "text-ink-soft hover:text-ink",
            )}
          >
            <Icon size={18} strokeWidth={1.6} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
