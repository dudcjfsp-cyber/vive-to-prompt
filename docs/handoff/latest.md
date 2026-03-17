# Session Handoff (Latest)

- Updated: 2026-03-17
- Repo: `C:\Users\dudcj\OneDrive\바탕 화면\바이브투프롬프트-engine`
- Branch: `main`
- Scope: prompt-first product transition, reusable engine extraction, compatibility-harness cleanup

## Current Working Definition
This repository is now best understood as:
- a `Vibe-to-Prompt` learning-track workspace
- a reusable engine extraction workspace copied from `Vibe-to-Spec V2`

The original working `Vibe-to-Spec V2` repository is already preserved elsewhere.
This repo no longer needs to protect every old spec-era surface.

The current discussion also clarified a stronger long-term reading:
- `Vibe Studio` should likely be interpreted as the umbrella learning platform
- `Vibe-to-Spec`, `Vibe-to-Prompt`, and `Vibe-to-Architecture` are better understood as focused learning tracks or modules inside that platform
- this repo is therefore not only a prompt-generation workspace; it is a candidate proving ground for the prompt-structuring learning track

## What Changed In This Session Arc
### Engine boundary work completed
- spec-only facade responsibility moved behind `engine/facades/spec/transmuteSpecFacade.js`
- provider/model runtime moved behind `engine/runtime/modelRuntime.js`
- shared runtime handoff was made explicit in `engine/runtime/buildRendererRuntimeHandoff.js`
- prompt renderer path was added through:
  - `engine/renderers/prompt/promptRenderer.js`
  - `engine/pipeline/buildPromptTransmuteResult.js`
  - `engine/facades/prompt/transmutePromptFacade.js`
- public prompt entrypoint is now available from `engine/graph/transmuteEngine.js`

### App/product transition completed enough for use
- the active app shell is now prompt-first
- persona selection is no longer the active product entry flow
- first entry now uses a simpler input-stage shell instead of showing the full result/workbench layout immediately
- the current result/workbench surface now appears only after the user submits input
- the primary surface is now:
  - one natural-language input
  - one prompt-oriented result surface
  - visible rationale for prompt structure
- the current success-state result hierarchy now leads with:
  - the final prompt
  - an immediate ready-to-use vs review-first judgment
  - a short rewrite-why summary
  before source input and other supporting explanation cards
- prompt metadata shown in the UI now includes:
  - rewrite mode
  - applied technique count
  - applied techniques
  - skipped techniques when present
  - validation notes
  - human-readable selection-signal rationale
  - rewrite rationale summary with supporting reasons
  - validation-readiness summary with supporting reasons
- `review_before_use` state now surfaces a dedicated trust card with immediate review actions and clarification cues
- prompt-first controller mode now requires real `prompt_output` from the prompt renderer instead of silently deriving it from spec-shaped fallback data
- prompt review-needed output can now carry prompt-native clarification questions through `prompt_output.validation.suggested_questions`
- the guided clarify loop can now consume prompt validation questions, not only `validation_report.suggested_questions`
- the app now derives one prompt-first validation contract for controller, result-panel, and clarify planning instead of letting each path read raw validation sources separately
- the active prompt-first result surface now localizes technique labels and technique explanations into Korean
- the `safe_to_pass_through` signal is now presented as "원문만으로도 결과 편차가 낮은가" to match the product's conservative judgment more honestly
- the first-entry placeholder now uses a more everyday non-builder example so the product reads less like a spec-design tool
- `ready_to_use` success-state now compresses the default visible explanation into:
  - final prompt
  - readiness judgment
  - one short learning narrative
  - up to 3 representative techniques
  with deeper source/technique/signal/validation trace moved into collapsed detail
- `zero_shot_pass_through` remains an engine technique for real pass-through cases, but it no longer appears as a misleading skipped-technique item when refinement was actually used
- short/common `ready_to_use` outputs now compact the final prompt body by omitting empty scaffold sections and internal workflow/finalizing blocks when no review signal is present
- compact `ready_to_use` prompt copy now also removes `Original request:` and other template-style section scaffolds when the prompt is already ready to use
- compact email-writing success-state prompts now translate some spec-like requirements into writing-friendly constraints so the copied prompt reads less like a product spec
- broader short/common regression checks were also run across summary, marketing, announcement, and planning-style inputs
- those checks confirmed that the main remaining success-state mismatch is no longer email scaffold leakage; it is non-email prompt copy drifting into product-requirement wording such as input fields, buttons, preview, copy features, or feature-list language
- the compact success-state path now rewrites some of that UI/product phrasing into more prompt-facing execution lines for non-email short/common prompts
- focused renderer tests now lock this compact success-state boundary for summary, planning, marketing, and announcement-style `ready_to_use` prompts
- the latest thin normalization pass now also strips more literal product-feature shell wording such as input fields, buttons, save/list management, CRUD-like controls, and template-provision phrasing from non-email short/common `ready_to_use` constraint lines
- focused renderer regressions now include more literal everyday failure patterns for summary, announcement, planning, and marketing inputs where product-feature wording appears directly in `must_haves`
- future substantial threads should now also end with a short `Boundary health` stoplight status so repeated copy-polish work does not drift past the point where an upstream seam should be split instead

### Cleanup already performed
- deploy/managed API paths were removed from this repo copy
- archive and clearly non-current docs were removed
- placeholder support files were removed
- spec-era app surface is no longer the primary UX

## Current Technical Judgment
### What is now solid
- prompt renderer exists
- prompt runtime handoff exists
- model runtime exists
- prompt-first app shell exists
- pre-submit entry and post-submit result stages are now separated at the shell level
- rewrite rationale and validation-readiness rationale are visible in the main UI
- prompt validation now carries summary/reason metadata and user-facing warning language
- the main result UI now distinguishes review-needed output with a dedicated trust card instead of leaving the signal buried in warning lists
- the active result-stage now makes primary vs secondary information more explicit by putting prompt, use judgment, and rewrite-why first
- prompt-first app control flow now rejects missing prompt-renderer output instead of masking it with spec fallback assembly
- prompt review signals can now drive follow-up clarification questions through prompt-native validation metadata
- prompt-first validation consumption is now centralized behind one app-side adapter instead of split between raw `prompt_output.validation` and raw `validation_report` reads
- the active prompt-first explanation cards now read more naturally in Korean without changing engine behavior
- the broader success-state result hierarchy is now better defined as:
  - final prompt first
  - use/review judgment next
  - immediate follow-up questions near that judgment when review is needed
  - rewrite-why summary before lower trace cards
  - source input, techniques, selection signals, and validation notes as supporting trace
- `ready_to_use` success-state now carries a clearer compression rule:
  - one short effect-first learning narrative
  - representative techniques capped at 3
  - deeper trace only when expanded
- short/common `ready_to_use` final prompts now read less like engine scaffolds and more like copyable execution prompts
- compact writing-task prompts can now normalize some spec-flavored constraints into more usable prompt-facing wording
- broader manual checks now prove that the success-state hierarchy and representative-technique compression remain stable across several short/common prompt types
- the remaining quality gap is now mostly lexical normalization of non-email product-spec wording inside compact success-state constraint lines
- that remaining lexical gap is narrower now because obvious app-feature wording is more often rewritten into prompt-facing execution lines or dropped when it is pure admin/management scaffolding
- focused tests exist for the prompt renderer and prompt-first UI source paths

### What is still transitional
- intent IR still depends on spec-shaped normalization upstream
- `normalizeStandardOutput` is still spec-shaped
- some internal helpers and compatibility state still use spec-era naming
- spec compatibility paths still exist behind the prompt-first product surface
- upstream `validation_report` still exists as a compatibility/support signal beneath the prompt-first validation contract

### What is no longer the main blocker
- adding a prompt renderer from scratch
- exposing rewrite and readiness rationale in the UI
- separating provider/model runtime from the old spec facade

### What is now the main loop risk
The next low-value trap is internal cleanup that mostly renames or reshuffles spec-era leftovers without improving:
- prompt-first UX
- prompt-output validation
- renderer reuse
- removal of a real remaining engine blocker

The other rising loop risk is polishing the same success-state surface repeatedly after explanation compression and prompt-body compaction are already in place.
That broader regression step has now been done.
The new loop risk is continuing copy-only tweaks after the remaining issue has become a clearly separate non-email constraint-normalization boundary.
After the latest thin pass, the next loop risk is broadening this same lane into generalized upstream cleanup instead of stopping once copied short/common prompts no longer read like app feature specs.

## Current Product Surface Summary
The app should now be understood as:
- prompt-first by default
- simpler on first entry, denser only after submission
- explanation-first in its result surface
- still carrying hidden compatibility paths for spec-oriented internals

But this should now be held alongside an unresolved strategic question:
- whether the long-term identity is "prompt generator"
- or "prompt-structuring learning track inside Vibe Studio"

The current discussion leans strongly toward the latter.

The main user-facing promise is now:
- "Give one natural-language input and receive a final prompt plus the reason it was structured that way, and whether it is ready to use or needs review first."

That promise is still accurate for the current repo state.
It may no longer be the best long-term top-level product declaration.

## Current Strategic Comparison
The current discussion narrowed the likely product-shape options to three:

### 1. Auto-generator first
- shape:
  - user enters one vibe
  - the system generates one final prompt
  - explanations mainly justify the result after the fact
- strengths:
  - immediate practical value
  - easiest story for a prompt-first prototype
  - aligns well with the existing engine/result surface
- weaknesses:
  - learning value can remain passive
  - users may copy the result without internalizing the structure
  - differentiation from other generation tools remains weaker

### 2. Technique-library first
- shape:
  - users learn from explicit prompt-technique cards
  - each card can expose when to use it, before/after examples, and copyable markdown patterns
  - generated output becomes optional or secondary
- strengths:
  - much clearer learning value
  - fits the long-term "reveal structure, do not hide it" philosophy strongly
  - many surfaces can work without API dependence
- weaknesses:
  - weaker immediate payoff for a user's own live input
  - puts more selection burden on the learner
  - risks drifting away from the existing prompt-renderer value already built

### 3. Hybrid learning track
- shape:
  - generated prompt output still exists
  - but techniques become first-class teachable surfaces rather than only metadata
  - the system can show why a technique was used, when to reuse it manually, and what a reusable template looks like
- strengths:
  - preserves immediate utility while increasing teachability
  - best bridge from the current repo state toward the broader `Vibe Studio` learning-platform direction
  - lets the engine support learning without remaining a pure black-box generator
- weaknesses:
  - easier to make muddled if the learning surface and generation surface are not clearly separated
  - can become too dense unless the UI has a clear primary/secondary structure

Current lean from this discussion:
- the long-term direction appears closer to `hybrid learning track` than pure auto-generator
- pure technique-library direction remains attractive for learning value, but it would be a larger product pivot

## Current API Interpretation
The discussion also clarified a more precise role for API usage:

- API should no longer be assumed to be the mandatory center of the product's value
- API is most justified where the product provides:
  - personalized technique recommendation
  - live transformation of a user's own vibe
  - follow-up clarification questions
  - comparative feedback on why a structure changed
- API is less necessary for:
  - static technique cards
  - reusable markdown examples
  - copyable pattern libraries
  - explainers about when a technique fits or does not fit

Current recommended interpretation:
- treat API as an optional personalization and feedback layer
- do not treat API dependence as the defining identity of the platform
- future learning surfaces should ideally provide real value even when no live API call is made

## Recommended Next Thread Types
Only start a new thread if the goal is clearly one of these:
1. if repeated failures still persist, choose one explicit non-email short success-state constraint-normalization boundary rather than reopening the whole success-state IA
2. otherwise, move to prompt question metadata consumption boundary
3. or inspect one remaining upstream engine blocker only if that product boundary no longer clears the entry rule

## Work To Avoid In The Immediate Next Thread
Avoid choosing a new thread for:
- internal renaming only
- broad cleanup of spec-era names with no user or engine benefit
- 25+ technique taxonomy expansion
- full intent-analysis redesign
- multi-renderer studio architecture work
- relitigating prompt-signal thresholds through copy-only tweaks unless a real product misunderstanding persists
- reopening the just-compressed success-state explanation density without a concrete new failure beyond the now-confirmed non-email prompt-body wording gap
- reopening the new input-stage / result-stage split unless manual validation finds a real regression
- polishing the same email success-state copy again before broader regression testing proves it is still the main failure pattern

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
- The original Vibe-to-Spec V2 product repo is preserved elsewhere.
- The active UX is one natural-language input, one final prompt result, and an explanation of why it was structured that way.
- The previous thread already separated the first-entry input stage from the post-submit result stage.
- The previous thread already moved the success-state result hierarchy so the final prompt, use/review judgment, and rewrite-why summary are what users read first.
- The previous thread already compressed `ready_to_use` explanation density into one short learning narrative, representative techniques capped at 3, and collapsed detail trace.
- The previous thread also hid `zero_shot_pass_through` from skipped-technique display when refinement was actually used.
- The previous thread also compacted short/common `ready_to_use` final prompt bodies so empty scaffold sections and meta workflow blocks no longer dominate the copyable result.
- The previous thread also removed `Original request:` from compact success-state prompt copy and rewrote some spec-like email constraints into more writing-friendly prompt constraints.
- Spec renderer and spec-shaped normalization still remain as compatibility paths, but they are not the main product direction.
- The previous thread already exposed rewrite rationale summary and validation summary on the main result surface.
- The previous thread also centralized app-side validation consumption behind one prompt-first adapter, so do not reopen that boundary unless you find a real regression.

Thread goal:
- Prefer the next boundary candidate in this order:
  1. broader short/common manual regression checks across multiple input types
  2. one still-misleading final-prompt scaffold only if manual testing shows a remaining real mismatch
  3. prompt question metadata consumption boundary
  4. prompt renderer upstream validation-ready handoff boundary
- Choose exactly one boundary.
- Do not mix both.

Thread entry rule:
- First judge the current candidate work against these three questions:
  - Does it make the product more prompt-first?
  - Does it create visible user value?
  - Does it reduce a real remaining engine blocker?
- If it is mostly internal cleanup, stop and explain why.
- Pick exactly one real engine blocker or one real prompt-first UX improvement.

Boundary guidance:
- If you choose the remaining final-prompt scaffold boundary, keep it thin: remove only one still-misleading label or block from `ready_to_use` copyable output without broad renderer redesign.
- If you choose the question metadata boundary, keep it thin: the goal is to make the app read question metadata more explicitly, not to do copy polish or broad UI redesign.
- The broader result-stage architecture boundary has now been used to clarify primary output vs immediate action vs supporting trace. Do not reopen it for copy-only polish.
- If neither product boundary clears the entry rule, only then inspect one upstream validation-ready handoff blocker.

At the end, always summarize:
- why this thread was not a loop
- what became more prompt-first
- what is still transitional compatibility
- why another thread is or is not needed
```
