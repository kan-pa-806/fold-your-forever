import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "ink";
  full?: boolean;
};

export function FoldButton({ variant = "primary", full, className, ...props }: Props) {
  return (
    <button
      {...props}
      className={cn(
        "press inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-6 text-sm font-medium tracking-wide disabled:cursor-not-allowed disabled:opacity-45",
        full && "w-full",
        variant === "primary" &&
          "bg-coral text-primary-foreground shadow-[0_14px_30px_-16px_var(--coral)] hover:brightness-[1.03]",
        variant === "ink" && "bg-ink text-parchment shadow-lift hover:brightness-110",
        variant === "ghost" && "glass text-ink hover:bg-white/70",
        className,
      )}
    />
  );
}
