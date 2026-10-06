import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { AppShell } from "@/components/fold/AppShell";
import { Logo } from "@/components/fold/Logo";


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
          <Row label="Status" value={state.isPartnerOnline ? "Partner is Online" : "Partner is Away"} />
        </Section>

        <Section title="FEELINGS & RESONANCE">
          <Row label="Your current mood" value={`${state.myMood.emoji} ${state.myMood.label}`} />
          <Row label={`${state.partner}'s mood`} value={`${state.partnerMood.emoji} ${state.partnerMood.label}`} />
        </Section>

        <Section title="MEMORIES & CONVERSATION">
          <Link
            to="/chat"
            className="flex min-h-[56px] items-center justify-between py-3 text-sm text-ink"
          >
            Private 1-on-1 Chat <ChevronRight size={16} className="text-ink-soft" />
          </Link>
          <Link
            to="/vault"
            className="flex min-h-[56px] items-center justify-between py-3 text-sm text-ink"
          >
            Memory Vault <ChevronRight size={16} className="text-ink-soft" />
          </Link>
          <Row label="Capsule history" value={`${state.capsules.length} folded`} />
          <Row label="Chat messages" value={`${state.messages.length} whispered`} />
        </Section>

        <Section title="ENVELOPE HISTORY">
          <Link
            to="/history/$box"
            params={{ box: "sent" }}
            className="flex min-h-[56px] items-center justify-between py-3 text-sm text-ink"
          >
            <span>Sent envelopes by me</span>
            <span className="flex items-center gap-2 text-ink-soft">
              {state.capsules.filter((c) => c.author === "me").length}
              <ChevronRight size={16} />
            </span>
          </Link>
          <Link
            to="/history/$box"
            params={{ box: "received" }}
            className="flex min-h-[56px] items-center justify-between py-3 text-sm text-ink"
          >
            <span>Received envelopes</span>
            <span className="flex items-center gap-2 text-ink-soft">
              {state.capsules.filter((c) => c.author === "partner").length}
              <ChevronRight size={16} />
            </span>
          </Link>
        </Section>




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
