# Intent IR Draft

## Purpose
This document defines the current engine-level intermediate representation for reusable intent analysis.

The goal is to keep the engine reusable across:
- `Vibe-to-Spec`
- `Vibe-to-Prompt`
- `Vibe-to-Architecture`
- future `Vibe Studio` renderers

This is still an internal contract, not the final public API.

## Core Rule
The engine should keep moving toward:
- `natural language -> intent IR -> renderer output`

Not toward:
- `natural language -> spec-only output forever`

## Draft Shape
```js
{
  version: 1,
  source_vibe: string,
  summary: string,
  intent: {
    target_user: string,
    usage_moment: string,
    user_job: string,
    problem_context: string,
    success_signal: string,
  },
  delivery: {
    roles: [{ name: string, description: string }],
    must_haves: string[],
    nice_to_haves: string[],
    input_fields: [{ name: string, description: string }],
    permissions: [{ name: string, description: string }],
  },
  analysis: {
    risks: string[],
    assumptions: string[],
    missing_information: string[],
    clarification_questions: string[],
  },
  signals: {
    confidence: 'low' | 'medium' | 'high',
    needs_clarification: boolean,
    severity: string,
    warning_count: number,
    blocking_issue_count: number,
  }
}
```

## Why This Shape Still Matters
This structure keeps the reusable layer focused on semantic understanding instead of presentation.

It is:
- more reusable than `standard_output`
- more structured than raw natural language
- easier to share across renderers than markdown artifacts

## What Belongs Here
Keep only information that other renderers may reasonably reuse.

Good candidates:
- user goal
- target user
- core job to be done
- constraints and risks
- missing information
- clarification signals
- confidence and validation-related signals

## What Does Not Belong Here
Do not place renderer-specific or UI-specific details here.

Avoid putting in:
- markdown layout decisions
- result-panel open state
- spec-only artifact names
- persona-specific UI framing copy
- renderer-only compatibility hacks

## Current Mapping In This Repo
The current implementation still derives intent IR from spec-shaped normalized data and validation output.
That means it is still a transitional architecture, not the final upstream analysis stage.

Current stage:
- `natural language -> model JSON -> shared runtime handoff -> intent IR -> renderer output`

Where the handoff is currently built:
- `engine/runtime/buildRendererRuntimeHandoff.js`

What currently feeds it:
- parsed model output
- normalized spec-shaped draft
- validation report
- field alias mapping
- source vibe

## Important Current Truth
The first prompt renderer already consumes this IR indirectly through an explicit shared handoff.
That is a major step forward.

Today the prompt renderer no longer needs to depend on:
- `artifacts.dev_spec_md`
- `artifacts.nondev_spec_md`
- `artifacts.master_prompt`

Instead, it relies on the renderer-runtime handoff and builds prompt-specific output from there.

## Prompt Renderer Transition Rule
For the current `Vibe-to-Prompt` implementation:
- it is acceptable that intent IR still comes after spec-shaped normalization
- it is not acceptable to hide that IR only inside spec result assembly

The current minimum acceptable handoff is:
- `sourceVibe`
- `parsedOutput`
- `normalizedDraft`
- `validationReport`
- `intentIr`
- `meta`
- `model`

That contract is now explicit.

## Current Prompt-Renderer Uses
The prompt renderer currently uses the shared handoff to support:
- rewrite-mode selection
- applied-technique selection
- skipped-technique reporting
- prompt validation notes
- rewrite rationale summaries and reason codes
- validation-readiness summaries and reason codes
- user-readable warning messages when validation says review is needed
- prompt explanation metadata in the app

This means intent IR is already valuable beyond spec rendering, even before a deeper analysis rewrite.

Renderer-level clarification guidance may also be derived from this handoff.
For example, `prompt_output.validation.suggested_questions` can now be built from intent/analysis signals without moving that UI-facing metadata into the IR itself.

## Near-Term Boundary Rule
Until analysis is split out earlier:
- let renderers consume intent-shaped data through explicit handoffs
- let transitional spec-shaped normalization remain internal
- keep generation/runtime concerns separate from intent contract design
- do not let renderer formatting needs redefine the IR shape
- do not move UI compatibility state into the IR

## Near-Term Uses
This contract already helps with:
- refactoring the engine safely
- building prompt-renderer output contracts
- explaining prompt decisions in the UI
- explaining prompt readiness and review signals in the UI
- moving validation warnings closer to prompt-output language instead of spec-era wording
- making validation more intent-aware
- preparing future renderers without hardcoding spec artifacts

## Next Steps
1. Keep the current IR stable while prompt-first product work continues.
2. Keep using explicit runtime handoffs instead of hidden spec-only assembly paths.
3. Improve validation against both intent IR and prompt output.
4. Move intent derivation earlier only when the prompt renderer proves a concrete need.
5. Avoid letting spec compatibility concerns redefine the shared contract.
