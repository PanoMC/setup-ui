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

<!-- pano-design-guidelines:start -->
## Panel design guidelines

Before designing or changing any panel UI (pages, components, modals, alerts, forms…), read
`design/README.md` and then **only** the topic file it points to for what you are building. These
rules are mandatory. Do not load every file in `design/`.
<!-- pano-design-guidelines:end -->

<!-- pano-agent-guide:start -->
## Agent guide

You are in a **Pano panel UI** repo. The panel is not themed and its pages are not named views; the guide matters here when you touch what plugins and the API share with the panel.

Read `agent-guide/README.md` first, then **only** the topic file it points to for your task. Decide from the
request and the code; ask only where the guide says a wrong guess is costly. `agent-guide/` is a synced copy: edit it
in `theme-core/agent-guide/` (repo `PanoMC/sdk`) and run `bun scripts/sync-agent-guide.js` there.

The three rules you will break first:

1. Core panel endpoints are `/api/v1/panel/...`; a plugin panel endpoint is `/api/plugins/<pluginId>/panel/...`, not below the panel base (`plugin-api.md`).
2. Lists are read from `items` and pages from `page`; errors from `error.code` (`plugin-api.md`).
3. Plugin panel pages are registered in code (`pano.ui.page.register`) and follow `design/README.md` (`plugin-panel-ui.md`).
<!-- pano-agent-guide:end -->
