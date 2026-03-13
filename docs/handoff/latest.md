# Session Handoff (Latest)

- Updated: 2026-03-13
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

The other rising loop risk is polishing the same prompt-result surface repeatedly after rewrite rationale and validation-readiness summaries are already visible.

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

## Recommended Next Thread Types
Only start a new thread if the goal is clearly one of these:
1. explicitly redefine the long-term product declaration around `Vibe Studio` as a learning platform and `Vibe-to-Prompt` as a learning track
2. decide whether prompt techniques should become first-class teachable surfaces rather than only result metadata
3. only after that strategic clarification, choose whether prompt question metadata or one remaining upstream engine blocker is truly the best next boundary

## Work To Avoid In The Immediate Next Thread
Avoid choosing a new thread for:
- internal renaming only
- broad cleanup of spec-era names with no user or engine benefit
- 25+ technique taxonomy expansion
- full intent-analysis redesign
- multi-renderer studio architecture work
- relitigating prompt-signal thresholds through copy-only tweaks unless a real product misunderstanding persists
- reopening the new input-stage / result-stage split unless manual validation finds a real regression

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
- Spec renderer and spec-shaped normalization still remain as compatibility paths, but they are not the main product direction.
- The previous thread already exposed rewrite rationale summary and validation summary on the main result surface.
- The previous thread also centralized app-side validation consumption behind one prompt-first adapter, so do not reopen that boundary unless you find a real regression.

Thread goal:
- Prefer the next boundary candidate in this order:
  1. prompt question metadata consumption boundary
  2. prompt renderer upstream validation-ready handoff boundary
  3. broader result-stage information architecture only if a genuinely new mismatch appears after the current hierarchy rule
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
- If you choose the question metadata boundary, keep it thin: the goal is to make the app read question metadata more explicitly, not to do copy polish or broad UI redesign.
- The broader result-stage architecture boundary has now been used to clarify primary output vs immediate action vs supporting trace. Do not reopen it for copy-only polish.
- If neither product boundary clears the entry rule, only then inspect one upstream validation-ready handoff blocker.

At the end, always summarize:
- why this thread was not a loop
- what became more prompt-first
- what is still transitional compatibility
- why another thread is or is not needed
```
