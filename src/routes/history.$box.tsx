import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { AppShell } from "@/components/fold/AppShell";
import { EnvelopeHistory } from "@/components/fold/EnvelopeHistory";
import { useFold } from "@/lib/fold-store";

export const Route = createFileRoute("/history/$box")({
  head: () => ({
    meta: [
      { title: "Envelope history — 11:FOLD" },
      {
        name: "description",
        content:
          "Browse the envelopes you folded and the ones you received, grouped by today, yesterday and month.",
      },
      { property: "og:title", content: "Envelope history — 11:FOLD" },
      {
        property: "og:description",
        content: "Sent and received envelopes, kept in their own quiet timelines.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { box } = useParams({ from: "/history/$box" });
  const state = useFold();
  const received = box === "received";

  const capsules = state.capsules.filter((c) =>
    received ? c.author === "partner" : c.author === "me",
  );

  return (
    <AppShell>
      <div className="px-5 pt-8">
        <Link
          to="/settings"
          className="press inline-flex items-center gap-1 text-[12px] tracking-[0.14em] text-ink-soft"
        >
          <ChevronLeft size={16} /> OUR SPACE
        </Link>

        <h1 className="font-display mt-4 text-[34px] text-ink">
          {received ? "Received envelopes." : "Sent envelopes."}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {received
            ? `Everything ${state.partner} folded for you.`
            : "Everything you folded and sent."}
        </p>

        <EnvelopeHistory
          bare
          capsules={capsules}
          empty={
            received ? "Nothing from your person yet." : "You haven't folded anything yet."
          }
        />
      </div>
    </AppShell>
  );
}
