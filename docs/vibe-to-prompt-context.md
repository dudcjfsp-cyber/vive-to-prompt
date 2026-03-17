# Vibe-to-Prompt Context

## Why This File Exists
This file captures the current product-direction reset for this copied repository.

Use this file when a new thread needs the current `Vibe-to-Prompt` intent without re-importing old `Vibe-to-Spec V2` assumptions.

This file does not replace the protected long-term context documents.
It narrows the working interpretation for this repository right now.

## Repository Working Identity
This repository started as a copy of the already-working `Vibe-to-Spec V2` codebase.

It is now being used as:
- a `Vibe-to-Prompt` learning-track workspace
- a reusable engine extraction workspace

The original `Vibe-to-Spec V2` repository is already preserved elsewhere and is not the main risk surface here.

Within the broader long-term direction, this repo should now be read as:
- one track inside the larger `Vibe Studio` learning-platform direction
- not merely another standalone prompt-generation tool

## Current Product Intent
The target experience is now:
- one natural-language input box
- one prompt-oriented output as the primary result
- visible explanation of how and why the prompt was structured

That current shape should be treated as a delivery mechanism for the prompt track, not the final identity of the track itself.
The deeper goal is to help users learn prompt structuring, not only to hand them a finished prompt.

The product should answer:
- what prompt was produced
- which techniques were applied
- how many techniques were applied
- why pass-through or refinement was chosen
- whether the prompt looks ready to use or needs review first
- what validation or warning signals influenced the result

The product should increasingly also answer:
- what changed from the original vibe
- when a technique is worth reusing manually
- how a user can internalize that structure instead of depending on the engine forever

## UX Direction
### Input
- one natural-language input field
- no user-level branching as a primary UX requirement
- no separate beginner / experienced / major entry path as a product requirement

### Output
- a single prompt-first result surface
- prompt metadata visible by default
- explanation-oriented UI preferred over spec artifact panels

### Result-Stage Hierarchy
After generation, the prompt-first surface should answer in this order:
1. what final prompt the user can actually copy
2. whether it is ready to use or needs review first
3. what the user should do immediately next when review is needed
4. why this rewrite mode was chosen
5. deeper trace context such as source input, techniques, selection signals, and validation notes

This means the broader result-stage contract is not only "prompt first."
It is also:
- one primary output
- one immediate trust/action layer
- one supporting explanation layer

Secondary trace information is still valuable, but it should not outrank the prompt itself or the next action the user needs to take.

### Explanation Layer
The educational value should come from:
- rewrite mode
- applied techniques
- skipped techniques when useful
- validation or warning notes
- short explanation of whether the prompt is ready to use or needs review first
- short rationale for the produced prompt shape
- human-readable selection-signal summaries

Over time, techniques should be teachable objects in the experience, not only hidden engine decisions surfaced after generation.

It should not depend on:
- spec markdown as the main teaching surface
- persona-based workspace switching
- V2 learning-mode copy as the main framing

## Engine Interpretation
The engine is still allowed to use transitional spec-shaped normalization internally where necessary.

But the product-facing goal is now:
- prompt-first output
- prompt-structuring training value
- renderer-neutral engine handoff underneath
- shrinking exposure of spec-only contracts in app code

The engine should increasingly be treated as an assistive layer for feedback, comparison, and guided structuring rather than the sole star of the product experience.

Transitional rule:
- spec outputs may remain as temporary harness or compatibility data
- spec outputs should stop being the primary app contract as soon as prompt-first flow is stable

## What Is Still Useful From The Old Repo
- shared engine runtime and handoff work
- prompt renderer prototype and tests
- validation helpers
- intent IR work, even if still partially derived from spec-shaped normalization
- spec renderer and spec app as hidden compatibility or regression coverage

## What Should No Longer Drive Decisions
- preserving the educational V2 workspace split
- preserving persona-specific product copy
- keeping beginner / experienced / major as the main information architecture
- treating spec artifacts as the main output users come for

## Current State Snapshot
As of 2026-03-17:
- prompt renderer exists
- prompt-first controller branching exists
- the active app shell is prompt-first
- the first-entry screen now stays input-focused until the user submits, instead of showing the full result/workbench layout immediately
- the active app surface no longer depends on persona selection
- rewrite rationale summary and validation summary are visible in the main result UI
- `review_before_use` is surfaced with a dedicated trust card and immediate review guidance in the main result UI
- after generation succeeds, the active result surface now leads with the final prompt, then immediate use/review judgment, then a short rewrite-why summary before supporting context cards
- prompt metadata is visible in the main result UI
- human-readable selection-signal rationale is visible in the main result UI
- prompt-first mode now requires renderer-provided prompt_output instead of silently backfilling it from spec output
- prompt validation can now provide prompt-native clarification questions for review-needed results
- app-side controller/result-panel/clarify paths now share one prompt-first validation contract instead of independently reading raw validation sources
- applied / skipped technique cards on the active prompt-first surface now read in Korean
- the pass-through safety signal label now describes likely result stability instead of implying "just paste the original input"
- `ready_to_use` success-state now defaults to a thinner explanation layer:
  - one short learning narrative
  - up to 3 representative techniques at primary weight
  - deeper trace moved into collapsed detail
- short/common `ready_to_use` prompt output now compacts the final prompt body so empty scaffold sections and meta workflow/finalizing blocks do not dominate the copyable result
- compact `ready_to_use` copy now also removes `Original request:` and other template-style success-state scaffolds when the prompt is already ready to use
- compact email-writing prompts can now translate some spec-flavored `must_haves` into writing-friendly constraints so the copied result reads more like a real prompt than a feature checklist
- broader manual checks now confirm that the remaining short/common mismatch is mostly in non-email success-state copy:
  - some summary, marketing, announcement, and planning prompts can still drift toward product-feature wording such as input fields, buttons, preview, or copy features
  - the compact success-state path now rewrites some of that UI/product phrasing into more prompt-facing execution lines
- `zero_shot_pass_through` is no longer shown as a skipped-technique item when refinement was actually used
- spec compatibility paths still remain internally

So the repository is currently best described as:
- `prompt-first transition substantially in place`
- not yet fully free of spec-shaped internals
- still earlier than the broader `Vibe Studio` learning-platform framing

## Emerging Strategic Interpretation
The current discussion suggests a stronger long-term reading:
- `Vibe Studio` is the umbrella learning platform
- `Vibe-to-Prompt` is a prompt-structuring learning track within that platform
- auto-generated prompt output is useful, but it should not remain the only or final expression of value

This does not yet force an immediate UI rewrite in this repo.
It does change the interpretation of future work:
- more weight should go to reusable learning surfaces
- more weight should go to teachable technique presentation
- less weight should go to acting like a black-box prompt tool that simply emits a final answer

## Current Thread: Good Work To Continue
These remain valid in the same thread if they directly support the current product intent.

1. Improve the visible explanation quality of the prompt result surface.
2. Reduce visible dependence on spec-first naming in active UI paths.
3. Improve prompt-output validation messages shown to users.
4. Remove one remaining compatibility path only when its blast radius is understood.
5. Strengthen review-state trust signals without reopening large architecture work.
6. If repeated failures still remain after the broader manual checks, keep the next prompt-body work thin and limited to non-email short success-state constraint normalization.

## Current Thread: Work To Avoid
These should not be pushed further in the same thread unless they become a direct blocker.

1. Large technique-registry expansion toward 25 or 70+ techniques.
2. Full intent-analysis redesign upstream of normalization.
3. Generalized multi-product studio architecture.
4. Major design-system rewrite unrelated to prompt-first validation.
5. Internal cleanup that mostly renames spec-era helpers without changing user-visible behavior.
6. Reintroducing deployment, managed API, or product-ops cleanup as priority work.
7. Repeated micro-copy polish on the same prompt surface after rewrite and validation rationale are already visible.

## Next-Thread Boundary
Move to a new thread when the work changes from:
- prompt-first product reshaping
- UI/controller simplification
- app-contract migration toward `prompt_output`
- thin `ready_to_use` output compaction
- focused regression checking across multiple short/common success-state inputs

into:
- new information-architecture decisions
- large engine-stage redesign
- broad technique-system research and taxonomy work
- complete removal of remaining spec harnesses

Reason:
- those steps become decision-heavy scope changes
- they carry higher context drift risk
- they are more likely to create loopy internal cleanup if mixed with current-thread work

## Practical Decision Rule
If a task makes the app feel more like:
- one input
- one simple entry stage before generation
- one prompt result
- one explanation surface

then it probably belongs in the current thread.

If a task mainly makes the engine internally prettier without reducing spec-first behavior in the product, it is probably not the best current investment.

## Suggested Start Prompt For The Next Thread
```text
Before starting work, read only these docs and use them as the current source of truth.

Current docs:
- docs/long-term-context.md
- docs/engine-refactor-plan.md
- docs/intent-ir.md
- docs/handoff/latest.md
- docs/refactor-stop-checklist.md
- docs/vibe-to-prompt-context.md

Current repo assumptions:
- This repo is a Vibe-to-Prompt workspace and a reusable engine-extraction workspace.
- The original Vibe-to-Spec V2 repo is preserved elsewhere.
- The current product goal is one input, one final prompt result, and one explanation layer.
- Spec-shaped normalization and some compatibility paths still remain internally.
- The previous thread already surfaced rewrite rationale summary and validation summary in the main UI.
- The current result-stage hierarchy already treats final prompt, use/review judgment, immediate follow-up action, and rewrite-why as the primary reading path.
- The previous thread already compressed `ready_to_use` explanation density into one short learning narrative, representative techniques capped at 3, and collapsed detail trace.
- The previous thread also hid `zero_shot_pass_through` from skipped-technique display when refinement was actually used.
- The previous thread also compacted short/common `ready_to_use` final prompt bodies so empty scaffold sections and meta workflow blocks do not dominate the copyable result.
- The previous thread also removed `Original request:` from compact success-state prompt copy and rewrote some spec-like email constraints into more writing-friendly prompt constraints.
- The previous thread also centralized app-side validation consumption behind one prompt-first adapter, so do not reopen that boundary unless you find a real regression.

Thread goal:
- First judge the candidate against these three questions:
  - Does it make the product more prompt-first?
  - Does it create visible user value?
  - Does it reduce a real remaining engine blocker?
- If it is mostly internal cleanup, stop and explain why.
- Prefer the next boundary candidate in this order:
  1. broader short/common manual regression checks across multiple input types
  2. one remaining final-prompt compaction mismatch only if those checks expose a real repeated failure
  3. prompt question metadata consumption boundary
  4. prompt renderer upstream validation-ready handoff boundary
- Pick exactly one boundary and resolve only that.

Boundary rule:
- Do not reopen the result-stage hierarchy boundary for copy-only polish once prompt, trust/action, rewrite-why, and compressed success-state explanation are already the primary reading order.
- If you choose the remaining final-prompt compaction boundary, keep it thin: remove only one still-misleading scaffold or label from `ready_to_use` copyable output without redesigning renderer logic broadly.
- If you choose the question metadata boundary, keep it thin: make the app read `intent_key` / `source` / `reason_code` more explicitly without turning the thread into copy polish or broad UI redesign.
- Only inspect the upstream validation-ready handoff if the metadata boundary does not pass the entry rule.

At the end, always summarize:
- why this work was not a loop
- what became more prompt-first
- what is still transitional compatibility
- why a follow-up thread is or is not needed
```
