#!/usr/bin/env node
/**
 * Freeze the Core VC account's contribution history to app/data/core-contributions.json.
 *
 * The piper-cloud account is deprovisioned after 2026-09-11, so its token stops
 * working and its contributions can no longer be fetched live. Run this BEFORE
 * that date. The site merges this file into the rolling 365-day window, so the
 * Core tail shrinks naturally over the following year instead of disappearing
 * the moment the token dies.
 *
 * Usage:  GITHUB_TOKEN_CORE=ghp_xxx node scripts/snapshot-core.mjs
 *   (or just `node --env-file=.env.local scripts/snapshot-core.mjs`)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const LOGIN = "piper-cloud";
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "app", "data", "core-contributions.json");

const token = process.env.GITHUB_TOKEN_CORE;
if (!token) {
  console.error("GITHUB_TOKEN_CORE is not set.");
  process.exit(1);
}

const QUERY = `
  query($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks { contributionDays { date contributionCount } }
        }
      }
    }
  }
`;

// GitHub only serves one year per query, so walk back year by year.
const YEARS_BACK = 3;
const days = {};
let total = 0;

for (let i = 0; i < YEARS_BACK; i++) {
  const to = new Date();
  to.setUTCFullYear(to.getUTCFullYear() - i);
  const from = new Date(to);
  from.setUTCFullYear(from.getUTCFullYear() - 1);
  from.setUTCDate(from.getUTCDate() + 1);

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: QUERY,
      variables: { login: LOGIN, from: from.toISOString(), to: to.toISOString() },
    }),
  });

  if (!res.ok) {
    console.error(`HTTP ${res.status} — ${await res.text()}`);
    process.exit(1);
  }

  const json = await res.json();
  if (json.errors?.length) {
    console.error(json.errors.map((e) => e.message).join("\n"));
    process.exit(1);
  }

  const calendar = json.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) {
    console.error("No contribution calendar returned — check the token's scopes.");
    process.exit(1);
  }

  for (const week of calendar.weeks) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > 0) days[day.date] = day.contributionCount;
    }
  }

  total += calendar.totalContributions;
  console.log(`  ${from.toISOString().slice(0, 10)} → ${to.toISOString().slice(0, 10)}: ${calendar.totalContributions}`);
}

const sorted = Object.fromEntries(Object.entries(days).sort(([a], [b]) => a.localeCompare(b)));

// Never trade a good snapshot for a worse one. If the account has been
// deprovisioned or the token has lost org access, GitHub can answer with a
// valid-but-empty calendar instead of an error — writing that would silently
// erase the history this file exists to preserve.
const newTotal = Object.values(sorted).reduce((a, b) => a + b, 0);
let priorTotal = 0;
try {
  const prior = JSON.parse(readFileSync(OUT, "utf8"));
  priorTotal = Object.values(prior.days ?? {}).reduce((a, b) => a + b, 0);
} catch {
  // No usable snapshot yet — anything is an improvement.
}

if (newTotal < priorTotal && !process.argv.includes("--force")) {
  console.error(
    `Refusing to overwrite: existing snapshot has ${priorTotal} contributions, ` +
      `this run returned only ${newTotal}. The token has probably lost access. ` +
      `Re-run with --force if the smaller number is genuinely correct.`,
  );
  process.exit(1);
}

writeFileSync(
  OUT,
  JSON.stringify({ username: LOGIN, capturedAt: new Date().toISOString(), days: sorted }, null, 2) + "\n",
);

console.log(`\nWrote ${Object.keys(sorted).length} active days (${total} contributions) to ${OUT}`);
console.log("If this total looks low, the token is probably missing private-contribution access or org SSO authorization.");
