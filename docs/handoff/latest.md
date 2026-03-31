# Session Handoff (Latest)

- Updated: 2026-03-31
- Repo: `C:\Users\dudcj\OneDrive\바탕 화면\바이브투프롬프트-engine`
- Branch: `main`
- Scope: prompt-first product transition, reusable engine extraction, PRD-aligned active-surface refinement

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
- those checks previously confirmed that the main remaining success-state mismatch was no longer email scaffold leakage but an upstream `intentIr.delivery.must_haves` seam feeding product-requirement wording into non-email prompt copy
- that upstream seam is now normalized earlier in `engine/intent/deriveIntentIr.js`, so repeated input-field/button/preview/copy/share/list-detail/publish-style wording is less likely to reach the prompt-facing result in the first place
- focused renderer tests now lock this compact success-state boundary for summary, planning, marketing, and announcement-style `ready_to_use` prompts
- focused handoff and prompt-pipeline regressions now also include literal summary, announcement, planning, and marketing inputs where product-feature wording appears directly in `must_haves`
- future substantial threads should now also end with a short `Boundary health` stoplight status so repeated copy-polish work does not drift past the point where an upstream seam should be split instead
- real dev-server verification had previously shown renderer-only normalization was insufficient because live prompt output still inherited spec-style feature wording through `intentIr.delivery.must_haves`
- the current thread then fixed that seam in the shared intent-IR path instead of adding one more renderer-only patch
- current boundary health after that upstream fix is `Green`
- a later live manual-validation thread then resolved one concrete prompt-output coherence boundary instead of reopening broad output polish:
  - `review_before_use` clarification questions now prioritize concrete missing information such as maintenance type, schedule, impact scope, travel duration, interests, and budget when refinement did not materially change the final prompt
  - review-state rationale now explicitly says when structure judgments were made but the final prompt still stayed close to the source input
  - short/common inputs with no concrete follow-up need are no longer pushed into review only because refinement did not materially land
  - `ready_to_use` outputs that compact back to the original prompt now downgrade rewrite mode and suppress overclaimed technique/rationale metadata instead of pretending a stronger rewrite happened
  - focused renderer and prompt-first UI source tests now lock both review-state and success-state coherence for that path
- manual dev-server checks in the current thread confirmed the new baseline across:
  - maintenance notice input
  - Tokyo travel planning input
  - short PM interview-prep input
  and those checks showed the main remaining follow-up boundary is no longer prompt-output coherence itself but question-metadata consumption
- a follow-up boundary-reinforcement thread then resolved that question-metadata consumption gap on the active prompt-first review path:
  - prompt-first validation question merging now prefers canonical metadata-backed question-detail objects before raw string fallback
  - active clarify consumption now carries stable `question_id` identity derived from `intent_key` / `reason_code` / `missing_information` instead of relying on question-text equality alone
  - the active `ExperiencedWorkspace` review UI now renders question-detail objects directly and binds answer state through `question_id` with question-text fallback for transitional compatibility
  - wording changes to a review question no longer need to break `why_this_question`, `prompt_improvement`, or visible question ordering on the active prompt-first coaching surface
- the current thread then stayed inside that same review boundary only long enough to close two live regressions exposed by manual validation:
  - maintenance notice and Tokyo travel review outputs no longer incorrectly pass as `ready_to_use` when the final prompt is materially transformed but still leaves generic placeholder inputs behind
  - renderer-side review validation now turns those placeholder-style prompts back into `review_before_use` with concrete metadata-backed follow-up questions for maintenance type, schedule, impact scope, interests, and budget
  - review-state final-prompt scaffold labels and instructional copy now render in Korean instead of mixing `Original request`, `Task`, `Output format`, or `Suggested workflow` into the visible prompt
  - focused renderer and prompt-pipeline regressions now lock both the restored maintenance/travel review behavior and the Korean scaffold output contract
  - a follow-up thin output-polish pass then removed the separate `추천 진행 순서` scaffold block from the review-state final prompt body without touching review judgment, follow-up question quality, or question-metadata consumption
  - focused renderer and prompt-pipeline regressions still keep maintenance/travel review cases in `review_before_use` with the same concrete follow-up question order after that local prompt-body change
  - later fresh live manual validation then exposed one new boundary split:
    - direct natural-language maintenance input such as `서비스 점검 안내문 작성해줘` could still regress to `ready_to_use`
    - that path could also reintroduce spec-like CRUD/publication wording such as 수정/삭제/게시/공개 여부 into the visible prompt body
  - the current thread then reinforced exactly that maintenance validation boundary without reopening question-metadata work or broad result-surface design:
    - direct natural-language maintenance input no longer escapes to `ready_to_use` while generic placeholder-style maintenance wording remains
    - partially grounded maintenance input such as `서비스 점검 안내문 작성해줘. 오늘 밤 11시부터 새벽 1시까지 로그인과 결제 기능이 점검 대상이야` now stays in `review_before_use` but narrows follow-up to the still-missing maintenance type instead of re-asking schedule or impact scope
    - prompt validation now treats direct maintenance input, CRUD/publication wording, and compacted pass-through cases as one prompt-output review boundary rather than silently dropping placeholder review when compaction returns close to the source vibe
    - focused renderer regressions now lock direct maintenance review, CRUD/publication review preservation, and partial-grounding maintenance question narrowing
    - full renderer regression runs now pass again after restoring the settled travel question wording during the same boundary pass
  - fresh manual validation at the end of the thread then exposed the next narrow regression:
    - non-maintenance announcement requests such as `카페 오픈 안내문 써줘. 이번 주 토요일 오전 10시에 오픈하고 선착순 이벤트도 같이 알려줘` can still inherit a maintenance follow-up question
    - that false positive appears when broad maintenance detection meets spec-like management wording such as 등록/수정 기능
    - the next thread should therefore target maintenance-detection overreach, not reopen the now-restored direct-maintenance review leak

### Cleanup already performed
- deploy/managed API paths were removed from this repo copy
- archive and clearly non-current docs were removed
- placeholder support files were removed
- spec-era app surface is no longer the primary UX

### Product-contract and active-surface work completed
- a working product contract now exists in `docs/vibe-to-prompt-prd.md`
- that PRD now makes the current product contract explicit:
  - not a generic prompt generator
  - not a spec-authoring workflow
  - but a hybrid prompt-learning track with one prompt result plus one reusable next-time lesson
- the active `ExperiencedWorkspace` surface now aligns more closely with that contract by:
  - keeping the final prompt first
  - keeping the ready/review judgment first-class
  - reframing the main rewrite summary around "what changed and why"
  - surfacing one reusable next-time phrasing pattern in `ready_to_use` states
  - surfacing `why_this_question` and `prompt_improvement` directly inside the active review question flow
  - removing review-question provenance chips that exposed internal validation/source labels on the active coaching surface
  - removing one remaining source-derived `coaching_focus` sentence from the active review question cards so the visible card keeps coaching guidance without echoing internal provenance phrasing
  - keeping deeper trace content collapsed as secondary detail
- focused source/helper tests were updated for that surface contract
- build verification also passed after the PRD-aligned surface changes

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
- the active review question cards now keep prompt-improvement coaching visible without surfacing internal provenance labels or source-derived coaching sentences such as validation-source phrasing
- the active prompt-first clarify path now consumes stable question-detail identity rather than using question-string matching as the primary join key for metadata and answers
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
- renderer-focused lexical normalization is no longer the main remaining blocker by itself
- one previously confirmed live blocker is now reduced: shared intent-IR normalization rewrites one repeated `핵심_기능.필수` seam before prompt rendering, so live `ready_to_use` prompts are less likely to collapse back into app-feature checklists for short/common non-email inputs
- focused tests exist for the prompt renderer and prompt-first UI source paths
- live review-state and success-state explanation cards now stay materially closer to what the final prompt actually did in the tested maintenance, travel, and PM cases
- active review questions now preserve intent and coaching metadata through stable detail identity even when their wording changes, and maintenance/travel review outputs no longer regress through placeholder-style prompts or mixed English scaffold labels
- the active review-state final prompt no longer inserts a separate workflow-style `추천 진행 순서` block, so the copyable prompt reads less like an engine scaffold while keeping the rest of the review structure intact

### What is still transitional
- intent IR still depends on spec-shaped normalization upstream
- `normalizeStandardOutput` is still spec-shaped
- some internal helpers and compatibility state still use spec-era naming
- spec compatibility paths still exist behind the prompt-first product surface
- upstream `validation_report` still exists as a compatibility/support signal beneath the prompt-first validation contract
- some compatibility surfaces still retain question-string arrays and fallback answer lookup around the now-stable active question-detail contract
- review-state final prompt bodies can still read more like a structured scaffold than a fully prompt-first execution prompt
- maintenance detection can still overfire on non-maintenance announcement requests when broad 안내문/관리 wording is present alongside spec-shaped compatibility text

### What is no longer the main blocker
- adding a prompt renderer from scratch
- exposing rewrite and readiness rationale in the UI
- separating provider/model runtime from the old spec facade
- review-state prompt/explanation/question coherence for the concrete maintenance and travel cases already validated in the live surface
- success-state overclaim for short/common PM-style inputs where the final prompt effectively stayed pass-through after compaction
- active prompt-first review/clarify consumption depending on brittle question-string matching for metadata joins
- mixed English scaffold labels inside the visible Korean review-state final prompt
- the direct-maintenance `ready_to_use` leak and placeholder-review drop for partially grounded maintenance inputs

### What is now the main loop risk
The next low-value trap is internal cleanup that mostly renames or reshuffles spec-era leftovers without improving:
- prompt-first UX
- prompt-output validation
- renderer reuse
- removal of a real remaining engine blocker

The other rising loop risk is continuing one-more-copy-polish work on prompt bodies after the direct-maintenance leak was already fixed and the next confirmed issue is now non-maintenance false positives in maintenance detection.
That would risk treating a domain-detection boundary as if it were only a copy problem.
The clearer next risk is hiding overbroad maintenance matching behind more local wording tweaks.

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
1. narrow maintenance detection so non-maintenance announcement requests such as `카페 오픈 안내문 써줘...` no longer receive maintenance-only follow-up questions
2. keep the direct-maintenance review boundary, partial-grounding question narrowing, travel review behavior, and short/common ready behavior locked while making that change
3. stop if the fix starts turning into a broad domain-classification redesign or another generic wording-polish pass

## Work To Avoid In The Immediate Next Thread
Avoid choosing a new thread for:
- internal renaming only
- broad cleanup of spec-era names with no user or engine benefit
- 25+ technique taxonomy expansion
- full intent-analysis redesign
- multi-renderer studio architecture work
- relitigating prompt-signal thresholds through copy-only tweaks unless a real product misunderstanding persists
- reopening the just-compressed success-state explanation density without a concrete new failure beyond a newly confirmed prompt-output regression
- reopening the new input-stage / result-stage split unless manual validation finds a real regression
- polishing the same email success-state copy again before broader regression testing proves it is still the main failure pattern
- reintroducing review-question provenance chips or other internal source labels on the active coaching surface unless manual validation proves users need them
- reopening prompt question metadata consumption or the travel review recovery boundary when the fresh regression is isolated to direct-input maintenance behavior

## Suggested Start Prompt For The Next Thread
```text
Before starting work, read only these docs and use them as the current source of truth:

- AGENTS.md
- docs/long-term-context.md
- docs/vibe-to-prompt-context.md
- docs/vibe-to-prompt-prd.md
- docs/handoff/latest.md

Current repo interpretation:
- This repo is a Vibe-to-Prompt learning-track workspace and reusable engine-extraction workspace.
- The active contract is one natural-language input, one final prompt result, and one explanation layer.
- The current product is prompt-first and learning-oriented, not a spec-authoring workflow.

What the previous thread already completed:
- active review question consumption now uses stable question-detail metadata rather than brittle question-string matching
- maintenance-notice and Tokyo-travel review outputs no longer bypass review when the final prompt still leaves placeholder-style inputs behind
- review-state prompt scaffold labels now render in Korean rather than mixing English template headings into the visible final prompt
- the review-state final prompt body no longer includes a separate `추천 진행 순서` workflow block, so the copied prompt reads a bit more prompt-first without changing review judgment or question order
- direct natural-language maintenance input such as `서비스 점검 안내문 작성해줘` no longer regresses to `ready_to_use` while generic CRUD/publication wording remains
- partially grounded maintenance input now keeps `review_before_use` but narrows follow-up questions to only the still-missing maintenance type instead of re-asking schedule or impact
- full prompt renderer regression tests pass after locking that boundary and restoring the settled travel question wording
- do not reopen settled review-question metadata, travel review recovery, direct-maintenance ready leak, or success-state coherence boundaries

Recommended next boundary:
- trace why non-maintenance announcement requests can still trigger maintenance-only follow-up questions and close exactly that detection boundary

Exact task:
- explain why `카페 오픈 안내문 써줘. 이번 주 토요일 오전 10시에 오픈하고 선착순 이벤트도 같이 알려줘` is still receiving the maintenance question `점검 유형은 정기 점검인가요, 긴급 점검인가요?`
- identify whether the false positive comes from overly broad maintenance detection, spec-like management wording in compatibility text, or one renderer-side seam
- fix exactly one narrow boundary so non-maintenance 안내문 requests no longer inherit maintenance follow-up questions without reopening the restored maintenance review leak or broad result-surface design

Do not reopen:
- review-state prompt/explanation/question coherence for the already-restored travel case
- prompt question metadata consumption
- success-state prompt/explanation coherence for the validated short/common cases
- the resolved direct-maintenance `ready_to_use` regression and partial-grounding maintenance question narrowing
- the resolved `intentIr.delivery.must_haves` wording seam
- the already-settled result-stage hierarchy and collapsed-detail structure

Validation points:
- `카페 오픈 안내문 써줘. 이번 주 토요일 오전 10시에 오픈하고 선착순 이벤트도 같이 알려줘` must no longer surface maintenance-only follow-up questions
- `오늘 밤 서비스 점검 공지 써줘. 로그인은 안 되고 결제는 지연될 수 있어` and `서비스 점검 안내문 작성해줘. 오늘 밤 11시부터 새벽 1시까지 로그인과 결제 기능이 점검 대상이야` must keep their current maintenance review judgment and narrowed follow-up behavior
- `도쿄 2박 3일 일정 짜줘` and the validated short/common ready cases must keep their current concrete follow-up questions and readiness judgment
- stop if the fix starts spreading into broad domain-classification redesign instead of one traced regression boundary

End the thread with:
- why this work was not a loop
- what became more prompt-first
- what is still transitional compatibility
- why another thread is or is not needed
- Boundary health: Green | Yellow | Red
- This thread type: thin output polish | boundary reinforcement | upstream split needed
- Why: one sentence
- Next move: one sentence
```

Boundary health: Yellow
This thread type: boundary reinforcement
Why:
the direct-maintenance leak is now closed, but repeated maintenance-wording exceptions show the detection boundary is still slightly too broad and should be narrowed before more copy polish
Next move:
open one more narrow thread for non-maintenance maintenance-detection false positives, then stop if that fix starts turning into domain-classification redesign
