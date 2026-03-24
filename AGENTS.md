# Agent Guide

This file is the top-level routing guide for repo-specific instructions.
Use it to decide which focused document to read, not as a catch-all dumping ground for every detailed rule.

## Baseline Context

When starting or resuming product or engine work, read these first:
- `docs/long-term-context.md`
- `docs/vibe-to-prompt-context.md`
- `docs/vibe-to-prompt-prd.md`
- `docs/handoff/latest.md`

Use those docs as the current baseline for:
- how to interpret this repository
- what product direction is active
- which boundaries were already resolved
- what is still transitional compatibility

## UX Evaluation

When judging:
- result density
- explanation usefulness
- `ready_to_use` vs `review_needed` readability
- whether the product feels like a prompt-learning tool or only a generator

read:
- `docs/ux-evaluation-personas.md`

## Thread Handoff

When finishing a substantial implementation, validation, or refactor thread, read:
- `docs/thread-handoff-rules.md`

Use that document to decide:
- whether a next-thread prompt is required
- when handoff can be skipped
- what a clean follow-up prompt should contain

## Top-Level Priorities

- keep the product prompt-first
- prefer user-visible improvement and reusable boundaries over internal neatness alone
- do not reopen already-settled boundaries without a real regression or blocker
- avoid making short-input success states feel like review workflows
- keep detailed guidance in focused docs rather than expanding this file into a mixed-purpose manual
