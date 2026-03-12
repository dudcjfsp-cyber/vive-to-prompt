# Vibe-to-Prompt Engine Workspace
Repository seed: copied from `Vibe-to-Spec V2`
Status: reusable engine extraction workspace
Updated: 2026-03-12

## One-line definition
This repository is a working space for extracting a reusable engine from `Vibe-to-Spec V2` and preparing the first `Vibe-to-Prompt` renderer without rewriting the whole system at once.

## What this repo is for
- isolate engine boundaries that materially unblock future renderers
- keep the existing spec app as a temporary reference renderer and verification harness
- preserve useful validation assets, tests, and long-term product context
- prepare a narrow path toward a prompt renderer prototype

## What this repo is not for
- polishing the spec app as the primary product surface
- deployment-first or operations-first work
- whole-engine redesign in one thread
- preserving spec-era support assets that do not help the next renderer

## Current priority order
1. Keep the shared engine contracts and runtime clean.
2. Reduce remaining spec-only surface area that blocks a prompt renderer.
3. Attach the first `Vibe-to-Prompt` renderer on top of the extracted runtime handoff.

## Keep as core
- `engine/*` and focused engine tests
- `shared/*`
- `docs/long-term-context.md`
- `docs/engine-refactor-plan.md`
- `docs/intent-ir.md`
- `docs/handoff/latest.md`
- `docs/refactor-stop-checklist.md`
- the current app only while it still serves as a regression harness

## Current working structure
```text
/engine
  /contracts
  /execution
  /facades
  /graph
  /intent
  /pipeline
  /renderers
  /runtime
  /validation

/ui
  /app           temporary spec harness until the prompt renderer replaces it

/docs
  active decision records for engine extraction and renderer preparation
```

## Useful commands
```bash
npm test
npm run build
npm run dev
```

The current app should be treated as a temporary harness, not as the long-term product surface.
