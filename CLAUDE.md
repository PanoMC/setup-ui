# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`setup-ui` is the **first-run installation wizard** for the Pano platform — the multi-step flow
(language, database, admin account, …) shown before a site is set up. It is a **SvelteKit 2 +
Svelte 5** app (`@sveltejs/adapter-node`, Vite, Bun) and, like the other front-ends, is **launched
and reverse-proxied by the `pano-web-platform` backend** rather than served standalone (see
`../CLAUDE.md` and the backend's `UIManager`). The backend's `SetupManager.isSetupDone()` gate is
what decides whether this UI is shown at all.

This is the smallest of the front-ends: JS-with-JSDoc, SCSS compiled outside Vite, no `@panomc/sdk`
bundle, and no premium/license machinery.

## Commands

```bash
bun install                 # postinstall copies Bootstrap assets (scripts/copy-bootstrap.js)
bun run dev                 # Vite dev on 0.0.0.0:3002
bun run dev:ui              # dev + concurrent `sass --watch` (use when editing SCSS)
bun run build               # production SSR build
bun run build:ui            # one-shot SCSS → static/style.css
bun run lint                # prettier -c
bun run format              # prettier --write
```

## Key things to know

- **API base is `/api`** (the public, pre-setup API), proxied in dev via `VITE_API_URL` in `.env`.
  Run against a local backend with `init-ui = true` in the platform's `config.conf`.
- Routes are `step-1` … `step-4` plus a `setup-api` endpoint and a fallback; components in
  `src/lib/components/`, pages in `src/lib/pages/`.
- SCSS lives in `src/styles/`; Vite does not compile it — use `dev:ui`/`build:ui`.
- Releases are automated by **semantic-release** on `alpha`/`beta`/`main` → use **conventional
  commits**. Versions are pinned by the backend in its `ui-releases.yml`.

Use Svelte 5 runes for new code; i18n via `svelte-i18n`.
