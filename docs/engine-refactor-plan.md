# Engine Refactor Plan

## Goal
Refactor the engine only as far as needed to support a real `Vibe-to-Prompt` learning-track direction inside the broader `Vibe Studio` vision without breaking the remaining compatibility harnesses.

## Workspace Definition
This copied repository is no longer tracking the original `Vibe-to-Spec V2` product-validation lane.
It is now tracking two linked goals:
- prompt-first product transition
- prompt-structuring learning-track clarification
- reusable engine extraction for future renderers

The spec renderer and spec app remain useful here, but only as:
- compatibility wrappers
- regression harnesses
- source assets for tests and comparison

## Refactor Policy
During this phase:
- preserve the current spec app public result shape where compatibility still matters
- preserve prompt-first app behavior
- prefer extraction and delegation over rewrites
- prefer explicit handoffs over hidden coupling
- stop when the next step becomes mostly internal neatness

## Phase 1: Intent Contract Foundation
Status: complete enough for current work

Delivered:
- `docs/intent-ir.md`
- `engine/contracts/intentIr.js`
- `engine/contracts/specIntentFieldMap.js`
- `engine/intent/deriveIntentIr.js`

What it achieved:
- intent IR became explicit
- spec aliases became explicit
- future prompt or architecture work has a shared semantic contract

What still remains true:
- intent IR is still derived after spec-shaped normalization

## Phase 2: Spec Facade Separation
Status: completed

Delivered:
- `engine/facades/spec/transmuteSpecFacade.js`
- thinner public wrapper usage in `engine/graph/transmuteEngine.js`

What it achieved:
- spec-only result assembly moved behind an explicit spec facade
- the spec app public result shape stayed stable
- `transmuteEngine.js` no longer had to directly own all spec result assembly concerns

## Phase 3: Provider / Model Runtime Separation
Status: completed

Delivered:
- `engine/runtime/modelRuntime.js`

What it achieved:
- provider normalization
- model discovery
- optimal-model selection
- provider transport / text generation

These are now shared runtime concerns instead of being embedded in the same spec-shaped facade.

## Phase 4: Shared Renderer Runtime Handoff
Status: completed

Delivered:
- `engine/runtime/buildRendererRuntimeHandoff.js`
- shared usage inside result-building paths

What it achieved:
- explicit handoff containing:
  - `sourceVibe`
  - `parsedOutput`
  - `normalizedDraft`
  - `validationReport`
  - `intentIr`
  - `meta`
  - `model`
- a prompt renderer can now depend on a shared handoff rather than spec markdown artifacts

## Phase 5: Minimum Prompt Renderer Contract
Status: completed

Delivered:
- `engine/renderers/prompt/promptTechniqueRegistry.js`
- `engine/renderers/prompt/promptRenderer.js`
- `engine/pipeline/buildPromptTransmuteResult.js`
- `engine/facades/prompt/transmutePromptFacade.js`
- prompt-facing export from `engine/graph/transmuteEngine.js`

What it achieved:
- `transmuteVibeToPrompt(...)` now exists
- rewrite modes exist:
  - `pass_through`
  - `light_refine`
  - `structured_refine`
- prompt output now carries:
  - `final_prompt`
  - `applied_techniques`
  - `skipped_techniques`
  - `selection_signals`
  - `rewrite_rationale`
  - `validation`

## Phase 6: Prompt-First App Contract Migration
Status: in progress, but already usable

Delivered:
- prompt-first app shell
- prompt-first runtime config
- prompt metadata exposed in the main result surface
- prompt output derived or consumed as the primary displayed result
- rewrite rationale summary and validation summary exposed in the main result surface
- prompt readiness now explained through summary/reason metadata instead of raw warnings alone

Current visible state:
- one active prompt-first app surface
- one natural-language input
- a pre-submit input stage now stays visually simpler, and the result/workbench surface appears only after generation starts
- one prompt-oriented result surface
- the success-state result hierarchy now leads with final prompt, immediate use/review judgment, and rewrite-why summary before secondary supporting cards
- visible rationale for why the prompt was shaped that way
- clearer review-state trust signaling when the prompt should be checked before use
- prompt-first mode now rejects missing prompt-renderer output instead of silently rebuilding it from spec compatibility data
- prompt review-needed output can now seed the clarify loop through renderer-side validation question metadata
- app-side validation consumption now runs through one prompt-first adapter instead of letting controller/result-panel paths read raw validation sources independently

What remains transitional:
- internal compatibility helpers still mention spec-era concepts
- some engine/app helper names still reflect the old repo history
- spec compatibility state still exists behind the prompt-first surface

## Current Technical Judgment
The biggest completed boundary work is enough for a real prompt-first prototype.
The biggest remaining engine coupling is now upstream of the prompt renderer:
- spec-shaped normalization still feeds the current intent/validation path
- prompt-policy / experiment wiring still reflects spec-era policy history

The biggest remaining product-cleanup risk is different:
- continuing to rename internal spec-era helpers without changing user-visible behavior would likely become refactor looping

## Current Target Shape
### Short-term target
- `input -> structured generation/runtime -> normalized handoff -> prompt renderer -> prompt-first UI`
- spec compatibility may remain behind the scenes while this contract stabilizes

### Mid-term target
- `input -> explicit analysis -> shared intent/runtime handoff -> renderers(prompt/spec/architecture)`

### Long-term target
- `input -> intent IR -> planning -> renderer family -> validation`

## What To Prioritize Next
Only continue refactoring if the next step clearly improves one of these:
- removes spec-shaped coupling that still blocks prompt-first execution
- makes the prompt renderer less dependent on spec normalization
- improves validation on prompt output itself
- makes another renderer easier to add

Prefer product-side work when it improves:
- prompt-first surface clarity
- user-visible rationale
- prompt-output trust and readability
- user understanding of why a prompt is ready to use or needs review first
- review-state trust signals or warning language in the result surface
- explanation labels that would otherwise mislead users about what the engine signal actually means

## What To Avoid Next
Do not default to these in the next thread:
- broad internal renaming of spec-era leftovers
- large technique-taxonomy expansion
- whole-engine redesign
- full removal of every compatibility path in one pass
- architecture work that is not yet justified by a prompt-renderer blocker

## Stop Signal For This Refactor Lane
Pause refactoring when the next candidate is mostly about:
- internal naming cleanup
- moving already-thin helpers again
- shrinking files without exposing a clearer handoff
- changing implementation shape without improving prompt-first UX or renderer reuse

That stop signal is now much closer than it was before the prompt renderer existed.

## Suggested Next Thread Boundary
Choose only one of these in a new thread:
1. make prompt question metadata consumption explicit at one thin UI/controller boundary
2. remove one remaining real spec-shaped engine blocker upstream of prompt rendering
3. only if a genuinely new product misunderstanding appears after the current hierarchy rule, reopen the broader result-stage information architecture boundary

Do not mix both unless there is a direct blocker.


