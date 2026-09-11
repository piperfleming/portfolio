#!/usr/bin/env node
/**
 * Freeze commits that GitHub will never credit to app/data/local-contributions.json.
 *
 * GitHub credits a commit to an account only when the commit's author email is
 * verified on that account AND that account can access the repository. A long
 * run of work was authored as piperf@stanford.edu (the global git user.email)
 * inside repos the piperfleming account cannot see, so GitHub credits it to
 * nobody — it is absent from every calendar the site fetches.
 *
 * Granting access afterwards does NOT fix it: contributions are tallied when a
 * push is processed and are not recomputed retroactively (verified 2026-09-11 —
 * read then write access on Core-VC/missed-deals produced no recount after 40
 * minutes). Re-authoring and force-pushing *does* work, but that rewrites
 * history on other people's repos. So these commits are counted here, straight
 * off the commit objects on disk.
 *
 * One of these repos is not even on GitHub (the cs193t site lives on a Stanford
 * AFS remote), so no GitHub-side fix could ever reach it.
 *
 * Only piperf@stanford.edu is counted. Commits authored as piper@corevc.com are
 * already credited to piper-cloud and captured in core-contributions.json;
 * counting them here too would double them on the wall. Same for
 * peepfleming@gmail.com, which sandpiper-dot is credited for live.
 *
 * Usage:  node scripts/snapshot-local.mjs [--force]
 */

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { homedir } from "node:os";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "app", "data", "local-contributions.json");

/** Only this identity is uncredited. See the note above before adding more. */
const EMAIL = "piperf@stanford.edu";

/** How far back to read. The site trims to its own rolling window anyway. */
const YEARS_BACK = 3;

/**
 * Repos whose commits GitHub does not credit, matched against the origin remote.
 * Deliberately an allowlist: every other repo on this machine is already
 * credited, and including one would double-count it.
 */
const UNCREDITED = [
  "Core-VC/missed-deals",
  "Core-VC/ariadne",
  "Core-VC/fintech-radar",
  "termlesstooth/ultron",
  "termlesstooth/lp_platform",
  "cs193t", // Stanford AFS remote, never on GitHub
];

const sh = (cmd) => {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
};

const since = new Date();
since.setUTCFullYear(since.getUTCFullYear() - YEARS_BACK);
const SINCE = since.toISOString().slice(0, 10);

const clones = sh(
  `find ${homedir()} -maxdepth 7 -type d -name .git ` +
    `-not -path "*/node_modules/*" -not -path "*/Library/*" ` +
    `-not -path "*/.Trash/*" -not -path "*/vendor/*" 2>/dev/null | sed 's|/\\.git$||'`,
)
  .split("\n")
  .filter(Boolean);

if (clones.length === 0) {
  console.error("Found no git clones to read. Refusing to write an empty snapshot.");
  process.exit(1);
}

/**
 * slug -> Map<sha, date>. Keying on the SHA collapses duplicate clones of the
 * same repo, which this machine has (neural-news and political-agents are each
 * checked out twice at different revisions) — summing per directory would
 * double-count them.
 */
const bySlug = new Map();

for (const path of clones) {
  const url = sh(`git -C "${path}" config --get remote.origin.url`);
  if (!url) continue;

  const slug = url
    .replace(/^git@[^:]+:/, "")
    .replace(/^https?:\/\/[^/]+\//, "")
    .replace(/\.git$/, "");

  const match = UNCREDITED.find((u) => slug === u || slug.includes(u));
  if (!match) continue;

  // Commits only count on the default branch, so mirror that here.
  let ref = sh(`git -C "${path}" symbolic-ref --short refs/remotes/origin/HEAD`);
  if (!ref || !sh(`git -C "${path}" rev-parse --verify -q ${ref}`)) {
    ref = ["origin/main", "origin/master", "main", "master"].find((r) =>
      sh(`git -C "${path}" rev-parse --verify -q ${r}`),
    );
  }
  if (!ref) {
    console.warn(`  ! ${slug}: no default branch found, skipping`);
    continue;
  }

  const log = sh(
    `git -C "${path}" log ${ref} --since=${SINCE} --author=${EMAIL} --format='%H %ad' --date=short`,
  );
  if (!log) continue;

  if (!bySlug.has(match)) bySlug.set(match, new Map());
  const commits = bySlug.get(match);
  for (const line of log.split("\n").filter(Boolean)) {
    const [sha, date] = line.split(" ");
    commits.set(sha, date);
  }
}

const days = {};
for (const commits of bySlug.values()) {
  for (const date of commits.values()) days[date] = (days[date] ?? 0) + 1;
}

const sorted = Object.fromEntries(Object.entries(days).sort(([a], [b]) => a.localeCompare(b)));
const newTotal = Object.values(sorted).reduce((a, b) => a + b, 0);

const repos = [...bySlug.entries()]
  .map(([slug, commits]) => ({ slug, commits: commits.size }))
  .sort((a, b) => b.commits - a.commits);

for (const r of repos) console.log(`  ${r.slug}: ${r.commits}`);

const missing = UNCREDITED.filter((u) => !bySlug.has(u));
if (missing.length) {
  console.warn(`\n  ! no clone found for: ${missing.join(", ")}`);
  console.warn("    This method reads commit objects off disk — a repo with no local clone is invisible to it.");
}

// Same guard as snapshot-core.mjs: a missing or moved clone makes a repo silently
// vanish from the count, which would quietly erase history this file exists to keep.
let priorTotal = 0;
try {
  priorTotal = Object.values(JSON.parse(readFileSync(OUT, "utf8")).days ?? {}).reduce((a, b) => a + b, 0);
} catch {
  // No snapshot yet.
}

if (newTotal < priorTotal && !process.argv.includes("--force")) {
  console.error(
    `\nRefusing to overwrite: existing snapshot has ${priorTotal} commits, this run ` +
      `found only ${newTotal}. A clone has probably been moved or deleted. ` +
      `Re-run with --force if the smaller number is genuinely correct.`,
  );
  process.exit(1);
}

writeFileSync(
  OUT,
  JSON.stringify(
    { source: "local git history", email: EMAIL, capturedAt: new Date().toISOString(), repos, days: sorted },
    null,
    2,
  ) + "\n",
);

console.log(`\nWrote ${Object.keys(sorted).length} active days (${newTotal} commits) to ${OUT}`);
