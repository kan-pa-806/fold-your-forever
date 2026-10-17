import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/fold/AppShell";
import { CoupleGames } from "@/components/fold/CoupleGames";
import { Sparkles, HeartHandshake } from "lucide-react";

export const Route = createFileRoute("/games")({
  validateSearch: (search: Record<string, unknown>): { gameId?: string } => ({
    gameId: typeof search.gameId === "string" ? search.gameId : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Games & Fun Corner — 11:FOLD" },
      {
        name: "description",
        content:
          "Interactive couples questions and connection prompts to build intimacy, laughter, and deeper romance.",
      },
      { property: "og:title", content: "Games & Fun Corner — 11:FOLD" },
      {
        property: "og:description",
        content: "Couples interactive questions, romantic prompts, and fun corner.",
      },
    ],
  }),
  component: GamesPage,
});

function GamesPage() {
  const { gameId } = Route.useSearch();

  return (
    <AppShell desktopWide>
      <div className="px-5 pt-7 pb-10">
        <header className="mb-6">
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-coral" />
            <span className="text-[10px] tracking-[0.24em] text-coral font-medium uppercase">
              FOR TWO SOULS
            </span>
          </div>
          <h1 className="font-display mt-1 text-[36px] text-ink leading-tight">
            Games &amp; Fun Corner.
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Romantic, deep, and communication-building questions to spark close conversations.
          </p>
        </header>

        <CoupleGames initialGameId={gameId} />
      </div>
    </AppShell>
  );
}
