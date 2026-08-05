import { Link } from "@tanstack/react-router";
import { formatDay, type Capsule } from "@/lib/fold-store";

function bucketOf(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  if (d >= startOfToday) return "Today";
  if (d >= startOfYesterday) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function group(capsules: Capsule[]) {
  const sorted = [...capsules].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  const map = new Map<string, Capsule[]>();
  for (const c of sorted) {
    const key = bucketOf(c.date);
    const list = map.get(key);
    if (list) list.push(c);
    else map.set(key, [c]);
  }
  return [...map.entries()];
}

export function EnvelopeHistory({
  title,
  capsules,
  empty,
}: {
  title: string;
  capsules: Capsule[];
  empty: string;
}) {
  const groups = group(capsules);

  return (
    <section className="mt-7">
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] tracking-[0.22em] text-ink-soft">{title}</p>
        <span className="text-[11px] text-ink-soft">{capsules.length}</span>
      </div>

      {groups.length === 0 ? (
        <div className="glass mt-3 rounded-[24px] px-4 py-5 text-sm text-ink-soft">{empty}</div>
      ) : (
        <div className="mt-3 space-y-4">
          {groups.map(([label, items]) => (
            <div key={label}>
              <p className="font-display px-1 text-sm text-ink-soft">{label}</p>
              <div className="glass mt-2 divide-y divide-ink/5 rounded-[24px] px-4">
                {items.map((c) => (
                  <Link
                    key={c.id}
                    to="/vault"
                    className="flex min-h-[60px] items-center gap-3 py-3"
                  >
                    {c.photo ? (
                      <img
                        src={c.photo}
                        alt={c.caption || "Capsule photograph"}
                        className="h-10 w-10 rounded-[8px] object-cover"
                      />
                    ) : (
                      <span
                        className="font-display grid h-10 w-10 place-items-center rounded-full text-xs text-parchment"
                        style={{
                          background:
                            "radial-gradient(circle at 32% 28%, oklch(0.62 0.15 27), oklch(0.44 0.13 25))",
                        }}
                      >
                        11
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">
                        {c.caption || c.note || "A folded letter"}
                      </span>
                      <span className="block text-[11px] tracking-[0.14em] text-ink-soft">
                        {formatDay(c.date)} · {c.status.toUpperCase()}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
