# Refactor Stop Checklist

## Why This Document Exists
This document exists to prevent the project from getting stuck in endless internal refactoring.

The goal is not to keep splitting modules forever.
The goal is to remove real blockers, prove reusable handoffs, and then move forward through product validation or the next real renderer boundary.

## Core Rule
Keep refactoring while it removes a real future-engine or prompt-product constraint.
Stop refactoring when it mostly improves local neatness without improving:
- renderer reuse
- prompt-first UX clarity
- validation quality
- engine extensibility

## Good Reasons To Continue Refactoring
Continue only if the next extraction clearly improves one or more of these:
- future renderer reuse
- generation/runtime reuse
- analysis boundary clarity
- validation boundary clarity
- testability of a real engine handoff
- reduction of spec-only assumptions inside shared engine paths
- reduction of prompt-first blockers that are still hidden behind compatibility code

## Warning Signs Of Refactor Looping
The thread may be looping if:
- files are getting smaller, but handoffs are not getting clearer
- new helpers exist but users do not see a more prompt-first product
- the next step is explained as "cleaner" rather than "less coupled" or "more explainable"
- future renderer onboarding would still touch the same number of engine areas
- tests mostly track renames instead of proving a clearer boundary
- the work no longer changes prompt-first UX or real engine reuse
- the same prompt-result surface keeps receiving copy-level polish after rewrite and validation rationale are already visible

## Current Loop-Risk Signal In This Repo
As of 2026-03-12, loop risk is higher than before because:
- a prompt renderer already exists
- a shared runtime handoff already exists
- the active app shell is already prompt-first
- the main remaining candidates are increasingly internal compatibility cleanup

That means the next refactor must clear a much higher bar than before.

## Stop Conditions
Lower refactor priority and move to product validation or one carefully chosen next boundary when at least 3 of these are true:
- a future renderer already has a usable shared handoff
- structured generation/runtime concerns are reusable without spec-only facade wiring
- the active app surface is already prompt-first
- the next refactor candidate improves aesthetics more than extensibility
- focused tests already cover the current boundary
- real product work is no longer blocked by the current structure

## Per-Thread Entry Checklist
Before starting a refactor thread, confirm:
1. Does this step remove a real blocker for future renderers or prompt-first UX?
2. Can this thread stay focused on one boundary only?
3. Can the boundary be described as a stage handoff, not just a helper extraction?
4. Can the current compatibility contract stay stable where it still matters?
5. Can we prove the boundary with focused tests?

## Per-Thread Exit Checklist
At the end of a refactor thread, confirm:
1. Can the extracted responsibility be described in one sentence?
2. Is the data handoff clearer than before?
3. Would a future renderer reuse this boundary?
4. Is less responsibility left inside the remaining compatibility facade?
5. Did visible behavior stay stable where intended?
6. Is the next step still structural, or are we now entering diminishing returns?

## Recommended Pace From The Current State
From the current repo state, the best next work is usually one of:
1. a user-visible prompt-first improvement
2. prompt-output validation quality or trust-signal improvement
3. one remaining real engine blocker removal

Avoid defaulting to:
- internal naming cleanup only
- broad compatibility-state reshuffling
- large taxonomy expansion before product need proves it

## Practical Decision Rule
If the next refactor does not make a future renderer easier to add, a prompt-first surface easier to trust, or a shared handoff easier to test, it is probably not the best next investment.
