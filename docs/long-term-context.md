# Long-Term Context

## Why This Document Exists
This document captures the stable long-term intent behind the project so new AI threads do not need the same background explanation every time.

Use this as the default product context for planning, implementation, review, and refactoring decisions.

## Project Family Identity
The long-term product family is still:
1. `Vibe Studio`
2. `Vibe-to-Spec`
3. `Vibe-to-Prompt`
4. `Vibe-to-Architecture`

The long-term asset is the reusable engine shared across those products.

The family should now be interpreted less as a loose list of separate generation tools and more as:
- `Vibe Studio` as the umbrella learning platform
- `Vibe-to-Spec`, `Vibe-to-Prompt`, and `Vibe-to-Architecture` as focused learning tracks or modules inside that broader platform
- future review-oriented tracks or modules if they later become justified

## Stable Philosophy
The creator still cares about:
- non-CS learners
- non-developer users
- practical vibe coders
- users who want fast success without becoming dependent on black-box prompting

That educational philosophy remains stable across the product family.
The product should reveal structure, not hide it.
The long-term goal is not only to help users get an output faster.
It is to help them learn how to create better structure themselves without becoming dependent on a black-box generator.

## Important Shift For This Repository
This repository is no longer the primary `Vibe-to-Spec V2` product repo.
The original working `Vibe-to-Spec V2` repo is preserved elsewhere.

This repo is now being used as:
- a `Vibe-to-Prompt` track workspace inside the broader `Vibe Studio` direction
- a reusable engine extraction workspace

That changes the default decision filter inside this repo.

Inside this workspace, do not optimize for preserving every spec-era product decision.
Optimize for:
- prompt-first product clarity
- prompt-structuring learning value
- reusable engine boundaries
- visible explanation of prompt-structuring decisions
- keeping only the compatibility surface that still protects engine validation

## Current Product Intent In This Repo
The primary user experience in this repo should now be:
- one natural-language input
- one prompt-oriented output
- one explanation surface that shows why the prompt took its final shape

But the longer-term identity of that experience should be:
- a prompt-structuring training loop, not only a prompt-generation utility
- a surface that helps users learn when and why structure changes
- a bridge toward the broader `Vibe Studio` learning platform

The product should visibly answer:
- what prompt was produced
- whether the engine used pass-through or refinement
- which techniques were applied
- how many techniques were applied
- why that rewrite mode was chosen in plain language
- whether the prompt looks ready to use or needs review first
- what validation or warning signals influenced the result

Over time, the product should also make it easier for users to learn:
- when a technique is appropriate
- what changed between a raw vibe and a structured prompt
- how to reuse or adapt those structures themselves later

The product should no longer be organized primarily around:
- spec artifacts as the main output
- beginner / experienced / major as the primary UX architecture
- multiple user-level workspaces as the main product framing

## Long-Term Engine Direction
The engine should still grow toward:
- `natural language -> intent IR -> planning/handoff -> renderer output`

Not toward:
- `natural language -> spec-only contract forever`

The reusable target shape is still:
1. input normalization
2. structured generation / execution
3. intent analysis
4. shared runtime handoff
5. renderer layer
6. validation and feedback

## Current Engine Reality
As of 2026-03-17 in this repo:
- spec-only facade logic has been separated into a spec facade
- provider/model runtime has been separated into a shared runtime service
- a shared renderer runtime handoff exists
- a prompt facade and prompt renderer exist
- the app shell now uses a prompt-first single surface
- prompt metadata is visible in the UI by default
- rewrite rationale and validation rationale are now exposed on the active prompt-first surface
- `review_before_use` now shows a clearer review-first trust signal with immediate follow-up actions in the main result surface
- app-facing validation consumption now goes through a prompt-first adapter instead of asking each UI path to read raw validation sources directly
- the `ready_to_use` success-state explanation layer is now compressed by default into:
  - final prompt
  - readiness judgment
  - one short learning narrative
  - up to 3 representative techniques
  with deeper trace moved into collapsed secondary detail
- short/common `ready_to_use` prompt output can now compact the final prompt body by:
  - removing empty scaffold sections
  - removing internal workflow/finalizing blocks when no review signal is present
  - removing `Original request:` from compact success-state copy
  - replacing template-style section headers with lighter prompt-facing structure such as `조건:` and `출력 형식:`
  - rewriting some spec-shaped email `must_haves` into writing-friendly constraints so the copied prompt reads less like a product spec
- broader short/common prompt checks now also confirm one upstream seam fix:
  - `intentIr.delivery.must_haves` can now normalize repeated spec-style feature wording into more prompt-native constraint lines before renderer output
  - summary, marketing, announcement, and planning-style prompt paths now keep more of that live output out of UI/feature-checklist wording before the final prompt is assembled
- `zero_shot_pass_through` remains a real pass-through technique, but it no longer appears as a misleading skipped-technique item when refinement was actually used

What is still transitional:
- intent IR is still derived after spec-shaped normalization
- `normalizeStandardOutput` is still spec-shaped upstream of the prompt renderer
- some internal service/state names still reflect spec-era compatibility concerns
- the spec renderer and spec app remain as reference harnesses, not the primary product direction

## Current Mission Of This Workspace
The current mission is no longer "make the best spec app."
It is:
- turn the copied repo into a credible `Vibe-to-Prompt` learning-track workspace
- keep the engine reusable for later renderers
- keep spec-era surfaces only where they still provide compatibility or regression value
- clarify how this repo could later fit under the broader `Vibe Studio` learning-platform direction

Prioritize:
- prompt-first UX clarity
- visible learning value around prompt structuring
- explanation-first result surfaces
- shared runtime contracts that future renderers can consume
- validation that explains the produced prompt
- reducing visible dependence on spec-only artifacts in app code

De-prioritize:
- preserving persona/workspace splits
- polishing deploy or managed-API paths
- spec-era product copy that no longer supports the prompt product
- deep internal cleanup that does not reduce user-visible spec-first behavior

## Current Product Rules
### 1. One input, one result surface
The product should converge on:
- one input box
- one prompt result surface
- one explanation layer

This should be treated as the current delivery shape for the prompt track, not as proof that the long-term platform must stay a single-output generator product.

### 2. Explanation must be first-class
The value is not only the final prompt.
The value is also the visible rationale:
- rewrite mode
- applied techniques
- skipped techniques when useful
- validation notes
- short explanation of selection signals
- short rewrite rationale summary with supporting reasons
- short validation-readiness summary with supporting reasons
- user-readable warning language when the prompt needs review

That explanation layer should increasingly function as training material, not only as post-hoc justification for engine behavior.

After generation succeeds, the result-stage hierarchy should remain:
- final prompt first
- immediate ready-to-use vs review-first judgment next
- immediate follow-up action near that judgment when review is needed
- short rewrite-why summary before deeper trace details
- source input, technique trace, selection signals, and validation notes as secondary context

For `ready_to_use` success-state by default, the visible explanation should now compress toward:
- one short effect-first learning narrative
- representative techniques at primary weight, capped to 3
- deeper trace details only when expanded

The final prompt body itself should also avoid reading like an engine scaffold when the request is short and already usable.
For short/common success-state prompts, prefer compact prompt-like wording over spec-like section scaffolding.

This should still feel like one explanation surface around one prompt result, not several competing outputs.

### 3. Transitional compatibility is allowed
It is acceptable for the engine to keep using spec-shaped normalization internally for now.
But that should remain an implementation detail, not the user-facing contract.

### 4. Refactors must remove a real blocker
If a refactor does not make:
- future renderer reuse easier
- prompt-first behavior clearer
- validation more explainable
- spec-only coupling smaller

then it is probably not the best next investment.

## Quality Bar For Work In This Repo
A change is good if it improves one or more of these without harming reusability:
- prompt-first product clarity
- explanation quality
- intent understanding
- ambiguity handling
- validation quality
- renderer separation
- generation/runtime separation

A change is risky if it:
- re-centers the product around spec artifacts
- keeps persona-based UX as the main contract
- hides prompt-structuring reasons from the user
- deepens spec-only assumptions inside shared engine paths
- spends a thread on internal neatness with little user or engine payoff

## Decision Filter For Future Work
When evaluating any feature, refactor, or cleanup in this repo, ask:
1. Does this make the app feel more like `Vibe-to-Prompt`?
2. Does this reduce visible dependence on spec-only contracts?
3. Does this make the explanation layer clearer for users?
4. Would a future renderer reuse this boundary?
5. Is this work user-visible or engine-reuse-visible, rather than only internally cleaner?

## Guidance For Future AI Threads
Assume the following unless the user says otherwise:
- the repo is now prompt-first
- the original `Vibe-to-Spec V2` product is already safe elsewhere
- the spec renderer/app are reference assets, not the product center
- prompt metadata and rationale should be visible by default
- one input and one result surface is the desired UX direction
- deeper refactoring should stop when it becomes mostly internal cleanup

If a proposed change solves a local issue but makes prompt-first direction less clear, do not default to it.
If a proposed change improves prompt-first clarity or renderer reuse, it is likely aligned.

## Current Snapshot
As of 2026-03-17:
- prompt renderer exists and is tested
- prompt runtime handoff exists and is tested
- model runtime extraction exists and is tested
- prompt-first app shell exists
- first entry now has a simpler input-stage shell, and the existing result/workbench surface appears only after submission
- prompt rationale is visible in the main result surface
- rewrite rationale summary and validation summary are visible in the main result surface
- the success-state result surface now puts the final prompt first, followed by readiness and rewrite-why summary, with source input and supporting notes pushed lower as secondary context
- prompt validation now carries summary/reason metadata instead of only raw warnings
- prompt validation warnings are being pushed toward more user-readable prompt-output messaging
- `review_before_use` now shows a clearer review-first trust signal with immediate follow-up actions in the main result surface
- prompt-first controller mode now requires actual `prompt_output` instead of silently synthesizing it from spec fallback results
- prompt review-needed output can now surface prompt-native clarification questions that feed the clarify loop
- app-side controller/result-panel/clarify paths now share one prompt-first validation contract instead of independently deriving from raw validation sources
- technique names and technique explanations shown on the active prompt-first surface now read in Korean
- the pass-through safety signal is now labeled in a way that better matches "result stability" rather than "the model can probably handle it"
- the active success-state now compresses explanation density by default:
  - one short learning narrative
  - representative techniques capped at 3
  - deeper source/technique/validation trace moved into collapsed detail
- short/common `ready_to_use` results now compact the final prompt body instead of always exposing empty `Role/Task/Context` scaffolding and meta workflow blocks
- compact `ready_to_use` prompts now also avoid `Original request:` and other explicit template labels when the result is already ready to use
- compact email-writing success-state prompts can now rewrite spec-flavored constraints into more copyable writing constraints
- focused regression checks now also cover short/common summary, marketing, announcement, and planning-style success-state prompts so non-email compact copy does not immediately fall back to email-like or UI-scaffold wording
- `zero_shot_pass_through` no longer shows up as a skipped-technique distraction when the engine actually chose refinement
- compatibility spec paths still exist beneath the surface
- the next risk area is overextending the same success-state polish lane once the remaining problem becomes broader non-email constraint normalization rather than one more thin scaffold fix
- the next useful boundary after this thread is either:
  - prompt question metadata consumption
  - or one other upstream blocker only if real prompt output still exposes a concrete PRD violation outside the resolved `must_haves` seam
