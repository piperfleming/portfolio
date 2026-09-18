<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Portfolio

Project instructions for any coding agent. Global preferences are inherited automatically from
`~/.agent-shared/AGENTS.md` — do not repeat them here. The block above is generated; edit only
below it.

Durable knowledge *learned* about this project goes in `.ai/memory/`, not here. Instructions belong
in this file; discoveries belong in memory. Read `.ai/memory/MEMORY.md` first — this project's
memory carries a lot of hard-won detail (especially the GitHub contribution-graph attribution work)
that is expensive to re-derive.

## What this is

Piper's personal portfolio for job applications and general presence. Next.js 16.2.6 / React 19 /
Tailwind 4, deployed on Railway (auto-deploys from `main` via the GitHub integration).

**Keep content first-person.** No third-person references to Piper.

## Build, run, test

```sh
npm install
npm run build        # run with the sandbox disabled — next/font/google needs network
npm run lint
```

There is no test suite.

## Required validation before calling work done

**Verify rendering changes by building and grepping the prerendered HTML** at
`.next/server/app/index.html` (the page is fully static). That confirms real production output —
classes, ids, hrefs — and is more reliable than replicating logic in a throwaway script.

Do not try to verify in a browser: `npm run dev` binds port 3000 but every request times out
(`next/font/google` can't reach the network under the sandbox), and the Chrome extension refuses
`localhost` outright. For anything that genuinely needs a click, ask Piper.

## Architecture boundaries

- `app/` — the Next.js app. Sections are components; `app/lib/github.ts` owns the contribution graph.
- `app/data/*.json` — committed frozen snapshots of contribution data. Generated, not hand-edited.
- `scripts/snapshot-local.mjs` — regenerates `local-contributions.json`. Read
  `.ai/memory/project-portfolio-state.md` before touching it; it has two double-counting traps.
- `public/` — images and video assets.

## Gotchas

- **Never `source .env.local`** — it breaks on unquoted values and echoes token values. Use
  `node --env-file=.env.local`.
- **Pushing uses a different GitHub account than the machine default.** Check `gh auth status`
  against this repo's owner before pushing, and switch back afterward — the active account is a
  machine-global setting.
- **Full-bleed decorative overlays need `pointer-events-none`.** An `absolute inset-0` sibling
  paints above non-positioned content regardless of DOM order and will swallow every click in the
  section. This already broke the whole hero once.
- **The Oracle images are deliberately swapped** relative to their captions. Looks like a bug;
  isn't. Don't "fix" it without asking.
