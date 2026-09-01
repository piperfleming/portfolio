import { unstable_cache } from "next/cache";
import coreSnapshot from "../data/core-contributions.json";

/**
 * Merged GitHub contribution data across all of my accounts.
 *
 * School + personal are fetched live from GitHub's GraphQL API. Core VC is read
 * from a committed snapshot (app/data/core-contributions.json) because that
 * account is deprovisioned after 2026-09-11 and its token stops working — the
 * snapshot is trimmed to the rolling window like any other source, so the Core
 * tail shrinks naturally instead of vanishing the day the token dies.
 */

export const WINDOW_DAYS = 365;

type LiveAccount = { label: string; login: string; tokenEnv: string };

const LIVE_ACCOUNTS: LiveAccount[] = [
  { label: "School", login: "piperfleming", tokenEnv: "GITHUB_TOKEN_SCHOOL" },
  { label: "Personal", login: "sandpiper-dot", tokenEnv: "GITHUB_TOKEN_PERSONAL" },
];

const SNAPSHOT_LABEL = "Core VC";

export type Day = { date: string; count: number };

export type ContributionData = {
  /** 53 columns of 7 days, Sunday-first, oldest week first. Null = outside the window. */
  weeks: (Day | null)[][];
  total: number;
  /** Counts that split the non-zero days into four shade buckets. */
  thresholds: [number, number, number];
  /** Labels of the accounts that actually returned data. */
  sources: string[];
  start: string;
  end: string;
};

const iso = (d: Date) => d.toISOString().slice(0, 10);

const CONTRIBUTIONS_QUERY = `
  query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

async function fetchAccount(
  account: LiveAccount,
  from: Date,
  to: Date,
): Promise<Record<string, number> | null> {
  const token = process.env[account.tokenEnv];
  if (!token) {
    console.warn(`[github] ${account.tokenEnv} not set — skipping ${account.login}`);
    return null;
  }

  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: CONTRIBUTIONS_QUERY,
        variables: {
          login: account.login,
          from: from.toISOString(),
          to: to.toISOString(),
        },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`[github] ${account.login}: HTTP ${res.status}`);
      return null;
    }

    const json = await res.json();
    if (json.errors?.length) {
      console.warn(`[github] ${account.login}: ${json.errors[0].message}`);
      return null;
    }

    const weeks =
      json.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
    if (!weeks) {
      console.warn(`[github] ${account.login}: no calendar in response`);
      return null;
    }

    const days: Record<string, number> = {};
    for (const week of weeks) {
      for (const day of week.contributionDays) {
        days[day.date] = day.contributionCount;
      }
    }
    return days;
  } catch (err) {
    console.warn(`[github] ${account.login}: fetch failed`, err);
    return null;
  }
}

/** Quartile boundaries over the non-zero days, so the shades adapt to my actual volume. */
function shadeThresholds(counts: number[]): [number, number, number] {
  const nonZero = counts.filter((c) => c > 0).sort((a, b) => a - b);
  if (nonZero.length === 0) return [1, 2, 3];
  const at = (q: number) =>
    Math.max(1, nonZero[Math.min(nonZero.length - 1, Math.floor(nonZero.length * q))]);
  const [a, b, c] = [at(0.25), at(0.5), at(0.75)];
  // Keep the buckets strictly increasing even when the distribution is flat.
  return [a, Math.max(b, a + 1), Math.max(c, b + 2)];
}

async function buildContributions(): Promise<ContributionData | null> {
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);

  const windowStart = new Date(end);
  windowStart.setUTCDate(windowStart.getUTCDate() - (WINDOW_DAYS - 1));
  windowStart.setUTCHours(0, 0, 0, 0);

  // Pad back to the preceding Sunday so the grid columns are whole weeks.
  const gridStart = new Date(windowStart);
  gridStart.setUTCDate(gridStart.getUTCDate() - gridStart.getUTCDay());

  const results = await Promise.all(
    LIVE_ACCOUNTS.map(async (a) => ({
      label: a.label,
      days: await fetchAccount(a, windowStart, end),
    })),
  );

  const merged: Record<string, number> = {};
  const sources: string[] = [];

  for (const { label, days } of results) {
    if (!days) continue;
    sources.push(label);
    for (const [date, count] of Object.entries(days)) {
      merged[date] = (merged[date] ?? 0) + count;
    }
  }

  const snapshotDays = coreSnapshot.days as Record<string, number>;
  let snapshotUsed = 0;
  for (const [date, count] of Object.entries(snapshotDays)) {
    if (date < iso(windowStart) || date > iso(end)) continue;
    merged[date] = (merged[date] ?? 0) + count;
    snapshotUsed += count;
  }
  if (snapshotUsed > 0) sources.push(SNAPSHOT_LABEL);

  if (sources.length === 0) return null;

  const weeks: (Day | null)[][] = [];
  const cursor = new Date(gridStart);
  let total = 0;
  const counts: number[] = [];

  while (cursor <= end) {
    const week: (Day | null)[] = [];
    for (let i = 0; i < 7; i++) {
      const date = iso(cursor);
      if (cursor < windowStart || cursor > end) {
        week.push(null);
      } else {
        const count = merged[date] ?? 0;
        week.push({ date, count });
        total += count;
        counts.push(count);
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
  }

  return {
    weeks,
    total,
    thresholds: shadeThresholds(counts),
    sources,
    start: iso(windowStart),
    end: iso(end),
  };
}

const cachedContributions = unstable_cache(
  async () => {
    const data = await buildContributions();
    // Throw rather than return null: unstable_cache persists return values to
    // disk (and that cache can survive across deploys), so caching a failure
    // would hide the section for six hours after a transient GitHub outage or
    // a build that ran without tokens. Rejections aren't cached.
    if (!data) throw new Error("[github] no contribution sources available");
    return data;
  },
  ["github-contributions"],
  { revalidate: 21600, tags: ["github-contributions"] }, // 6 hours
);

export async function getContributions(): Promise<ContributionData | null> {
  try {
    return await cachedContributions();
  } catch (err) {
    console.warn(err instanceof Error ? err.message : err);
    return null;
  }
}
