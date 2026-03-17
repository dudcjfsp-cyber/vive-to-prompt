# Thread Handoff Rules

This document defines the default operating rule for closing substantial implementation threads and preparing the next one cleanly.

Use this guide when:
- code changed in a meaningful way
- tests were added or updated
- long-term context or handoff docs were updated
- a product or engine boundary was clarified and the next boundary should stay narrow

Do not use this guide for:
- casual Q&A only
- brainstorming threads with no concrete boundary resolved
- short check-ins where no code, tests, or docs changed

## Core Rule

When a thread includes substantial implementation, validation, refactor, or product-surface work, prepare a short `Next Thread Prompt` before closing the thread.

If the thread changed the effective baseline, update the relevant docs first so the next prompt reflects documented truth rather than stale conversation memory.

## When A Next Thread Prompt Is Required

Treat it as required when one or more of these is true:
- code was changed
- tests were added or updated
- long-term context or handoff docs were updated
- one product boundary was resolved and the next boundary should remain intentionally narrow

## When It Can Be Skipped

It is usually safe to skip when all of these are true:
- the thread was mainly Q&A or reflection
- no code changed
- no tests changed
- no baseline docs changed
- there is no clear follow-up implementation boundary to preserve

## Required Inputs

Before writing the `Next Thread Prompt`, reread only the baseline docs needed for the current repo state:
- `docs/long-term-context.md`
- `docs/vibe-to-prompt-context.md`
- `docs/handoff/latest.md`
- `AGENTS.md`

Read additional docs only if the just-finished work directly changed their boundary.

## What The Next Thread Prompt Must Contain

Keep it short enough to paste directly into a new thread, but include:
- the docs to read first
- the current repo interpretation
- what was already completed in the current thread
- exactly one recommended next boundary
- what should not be reopened
- key validation points for that next boundary
- any required end-of-thread summary shape when relevant

## Quality Rules

- prefer one clearly recommended next boundary
- do not reopen already-settled architecture unless the current thread exposed a real regression
- reflect the latest documented and committed baseline
- keep the prompt practical, not ceremonial
- avoid turning handoff into a changelog dump

## Handoff Summary Checklist

When the thread warrants a handoff, summarize:
- why the just-finished work was not a loop
- what became more prompt-first
- what became more usable or more learnable
- what is still transitional compatibility
- why another thread is or is not needed

## Boundary Health Check

To reduce context drift across new implementation threads, include one short boundary-health status at the end of substantial threads.

Use this stoplight status:
- `Green`: the work stayed at thin output polish or boundary reinforcement, produced clear user-visible value, and did not noticeably deepen dependence on spec-shaped internals
- `Yellow`: the work is still shippable in the current lane, but the same failure pattern is repeating or exception rules are starting to accumulate
- `Red`: the current lane is no longer healthy; additional copy/output polish would mostly compensate for an upstream seam that now needs to be split more directly

Use this 4-line format:
- `Boundary health: Green | Yellow | Red`
- `This thread type: thin output polish | boundary reinforcement | upstream split needed`
- `Why:`
  one short sentence explaining whether the work still stayed in the output/adapter layer or is now leaning on spec-shaped upstream behavior
- `Next move:`
  one short sentence choosing between one more thin pass, a boundary change next thread, or stopping copy polish now

Default operating rule:
- if the same lexical/product-feature wording mismatch repeats across 2-3 threads, treat that as at least `Yellow`
- if the renderer starts acting like a spec translator rather than a prompt-output layer, treat that as `Red`
- if the issue remains local, output-facing, and visibly improves copyability without adding broad new interpretation logic, it can remain `Green`

## Decision Rule For Narrow Follow-Up Work

If several follow-up ideas exist, choose the one that best satisfies at least two of these:
- makes the product more prompt-first
- creates visible user value
- reduces a real remaining engine blocker

If a candidate is mostly internal cleanup, do not turn it into the default next-thread boundary.
