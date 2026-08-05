import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { AppShell } from "@/components/fold/AppShell";
import { Logo } from "@/components/fold/Logo";
import { EnvelopeHistory } from "@/components/fold/EnvelopeHistory";

import { FoldButton } from "@/components/fold/FoldButton";
import { resetSpace, updatePrefs, useFold, type Prefs } from "@/lib/fold-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Our space — 11:FOLD settings" },
      {
        name: "description",
        content:
          "Manage your Soul Code, connection, memory vault and the small preferences that keep 11:FOLD calm.",
      },
      { property: "og:title", content: "Our space — 11:FOLD settings" },
      {
        property: "og:description",
        content: "Soul Code, connection status, vault and preferences for your private space.",
      },
    ],
  }),
  component: SettingsPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <p className="text-[11px] tracking-[0.22em] text-ink-soft">{title}</p>
      <div className="glass mt-3 divide-y divide-ink/5 rounded-[24px] px-4">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex min-h-[56px] items-center justify-between py-3">
      <span className="text-sm text-ink">{label}</span>
      {value ? <span className="text-sm text-ink-soft">{value}</span> : null}
    </div>
  );
}

function Toggle({
  label,
  name,
  checked,
}: {
  label: string;
  name: keyof Prefs;
  checked: boolean;
}) {
  return (
    <div className="flex min-h-[56px] items-center justify-between py-3">
      <span className="text-sm text-ink">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => updatePrefs({ [name]: !checked } as Partial<Prefs>)}
        className={`press relative h-7 w-12 rounded-full transition-colors ${
          checked ? "bg-coral" : "bg-ink/15"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-parchment shadow transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function SettingsPage() {
  const state = useFold();

  return (
    <AppShell>
      <div className="px-5 pt-8">
        <Logo size="sm" />
        <h1 className="font-display mt-4 text-[34px] text-ink">Our space.</h1>

        <Section title="OUR SPACE">
          <Row label="Partner" value={state.partner} />
          <Row label="Soul Code" value={state.soulCode} />
          <Row label="Connection" value="Paired · Private" />
        </Section>

        <Section title="MEMORIES">
          <Link
            to="/vault"
            className="flex min-h-[56px] items-center justify-between py-3 text-sm text-ink"
          >
            Memory Vault <ChevronRight size={16} className="text-ink-soft" />
          </Link>
          <Row label="Capsule history" value={`${state.capsules.length} folded`} />
        </Section>

        <EnvelopeHistory
          title="SENT ENVELOPES BY ME"
          capsules={state.capsules.filter((c) => c.author === "me")}
          empty="You haven't folded anything yet."
        />

        <EnvelopeHistory
          title={`RECEIVED ENVELOPES BY ${state.partner.toUpperCase()}`}
          capsules={state.capsules.filter((c) => c.author === "partner")}
          empty="Nothing from your person yet."
        />


        <Section title="PREFERENCES">
          <Toggle label="Notifications" name="notifications" checked={state.prefs.notifications} />
          <Toggle label="Sound" name="sound" checked={state.prefs.sound} />
          <Toggle label="Haptic feedback" name="haptics" checked={state.prefs.haptics} />
          <Toggle label="Animations" name="animations" checked={state.prefs.animations} />
        </Section>

        <Section title="ACCOUNT">
          <Row label="Profile" value={state.name} />
          <Row label="Privacy" value="Only the two of you" />
        </Section>

        <FoldButton className="mb-4 mt-8" full variant="ghost" onClick={resetSpace}>
          Sign out
        </FoldButton>
      </div>
    </AppShell>
  );
}
