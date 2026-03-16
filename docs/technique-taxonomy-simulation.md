# Technique Taxonomy Simulation

## Why This File Exists

This file is a visual planning aid for future prompt-technique expansion work.

It is not an implementation spec yet.
It is a simulation document for checking:
- whether the idea is learnable for non-developers
- whether the UI stays readable
- whether the engine can grow from 8 representative techniques to 25 detailed techniques without overwhelming the user

Use this file before writing code.

## Core Principle

Keep this structure:

- `8 visible`
- `25 addressable`

Meaning:
- users learn the product through 8 representative techniques
- the engine may internally choose from up to 25 detailed techniques
- the UI should not expose all 25 at equal weight by default

In short:

- `8 techniques = learning grammar`
- `25 techniques = engine vocabulary`

## Current 8 Representative Techniques

These remain the public-facing learning backbone.

1. `zero_shot_pass_through`
2. `goal_clarification`
3. `role_assignment`
4. `constraint_expansion`
5. `output_format_lock`
6. `context_structuring`
7. `step_decomposition`
8. `quality_checklist_injection`

## Proposed 25 Detailed Techniques

### 1. Preserve

Representative:
- `zero_shot_pass_through`

Detailed:
- `zero_shot_pass_through`
- `source_vibe_preservation`

### 2. Goal Clarity

Representative:
- `goal_clarification`

Detailed:
- `goal_clarification`
- `success_target_reframing`
- `deliverable_definition`

### 3. Framing

Representative:
- `role_assignment`

Detailed:
- `role_assignment`
- `audience_targeting`
- `persona_framing`

### 4. Constraints

Representative:
- `constraint_expansion`

Detailed:
- `constraint_expansion`
- `must_have_extraction`
- `boundary_condition_lock`
- `risk_guardrail_injection`

### 5. Format

Representative:
- `output_format_lock`

Detailed:
- `output_format_lock`
- `schema_lock`
- `example_shape_hint`

### 6. Context

Representative:
- `context_structuring`

Detailed:
- `context_structuring`
- `timing_context_block`
- `problem_background_block`
- `stakeholder_context_block`

### 7. Planning

Representative:
- `step_decomposition`

Detailed:
- `step_decomposition`
- `workflow_staging`
- `priority_ordering`

### 8. Validation

Representative:
- `quality_checklist_injection`

Detailed:
- `quality_checklist_injection`
- `assumption_disclosure_check`
- `tradeoff_check`
- `execution_reality_check`

### 9. Exploratory Family

These do not need to become new top-level public techniques immediately.
They can remain sub-techniques mapped under the existing 8.

Detailed:
- `perspective_expansion`
- `alternative_generation`
- `assumption_challenge`
- `analogy_transfer`
- `diverge_then_validate`

## Recommended Mapping

### Best Default Mapping

- `perspective_expansion` -> `context_structuring`
- `alternative_generation` -> `step_decomposition`
- `assumption_challenge` -> `goal_clarification`
- `analogy_transfer` -> `context_structuring`
- `diverge_then_validate` -> `quality_checklist_injection`

Why:
- users still see familiar high-level technique names
- the engine gains richer internal behavior
- exploratory structure can be taught later without forcing new vocabulary too early

## Simulation A

### Flat 25 Visible Techniques

This is the risky version.

Result surface might feel like:

```text
Applied techniques (7)
- goal_clarification
- role_assignment
- audience_targeting
- schema_lock
- perspective_expansion
- alternative_generation
- tradeoff_check
```

Why this is risky:
- looks like engine trace
- hard to learn from
- hard to scan
- too many terms for beginners

### Persona Review

`Practical Learner`
- sees depth, but does not know what to study first
- may feel the product is smart, but not necessarily teachable

`Everyday AI User`
- likely stops reading
- may not understand why this much technique detail is necessary

Verdict:
- bad default UX
- not recommended

## Simulation B

### 8 Visible + Sub-Techniques Hidden By Default

This is the strongest candidate.

Result surface might feel like:

```text
Applied prompt techniques
- Goal clarification
- Role assignment
- Output format lock

More detail
- Goal clarification
  - assumption_challenge
  - success_target_reframing
- Output format lock
  - schema_lock
```

Why this works:
- users first learn the big idea
- detailed techniques exist when curiosity is higher
- the screen remains readable

### Persona Review

`Practical Learner`
- good for learning
- can build a mental model from large to small

`Everyday AI User`
- can ignore details and still succeed
- does not feel forced into prompt-engineering terminology

Verdict:
- best balance
- recommended default structure

## Simulation C

### 8 Visible + 1 Short Learning Narrative

Instead of exposing sub-technique ids, show one short sentence.

Example:

```text
Why this prompt got structured this way
The engine first clarified the goal, then expanded missing constraints, and finally locked the output into an email-ready structure.
```

Optional detail:

```text
Learn more
- Missing assumptions were challenged before finalizing the prompt.
- Several possible response shapes were considered, then narrowed to the most actionable one.
```

Why this works:
- teaches effect instead of jargon
- reduces cognitive load
- keeps the screen useful for non-technical users

### Persona Review

`Practical Learner`
- strong learning value
- may still want optional drill-down later

`Everyday AI User`
- much easier to accept
- feels helpful instead of academic

Verdict:
- very good
- especially strong for `ready_to_use` states

## Simulation D

### Success State With Visible Technique Compression

Example input:

```text
신규 가입자에게 보내는 환영 이메일 프롬프트 만들어줘
```

Possible surface:

```text
[Final prompt]
[Copy]

[Ready to use]
This prompt is ready to use now.

[Why it changed]
The request was short, so the system clarified the goal, added audience framing, and locked the answer into an email-ready format.

[Applied techniques]
3 core techniques used
- Goal clarification
- Role assignment
- Output format lock

[See detailed technique trace]
2 more detailed moves were used internally
```

Why this is good:
- the prompt stays primary
- the learning layer exists
- the detailed engine vocabulary is still available

## Simulation E

### Review-Needed State With Exploratory Family

Example input:

```text
새로운 서비스 아이디어 좀 생각해줘
```

Possible surface:

```text
[Prompt draft]

[Needs review before use]
Some key structure is still missing.

[What to improve]
- target audience
- success condition
- response format

[Why these questions matter]
The request is broad, so the system first explored multiple possible directions, then tried to narrow them into one usable structure.

[Applied techniques]
- Goal clarification
- Context structuring
- Quality checklist injection

[Advanced detail]
Exploratory sub-techniques were used:
- perspective_expansion
- alternative_generation
- diverge_then_validate
```

Why this is better than showing all 25:
- exploratory detail appears only when ambiguity is high
- advanced users can learn more
- beginners are not overwhelmed by default

## UX/UI Rules

If the system grows to 25 detailed techniques, keep these UI rules.

### Rule 1

Never show more than 3 applied techniques at primary visual weight.

### Rule 2

In `ready_to_use`, show:
- final prompt
- readiness
- one short why summary
- 3 representative techniques max

### Rule 3

In `review_needed`, allow:
- more visible reasoning
- a short explanation of why certain technique families were needed
- optional drill-down into detailed technique trace

### Rule 4

Do not show raw detailed ids as the main learning layer.

Bad:

```text
alternative_generation
assumption_challenge
tradeoff_check
```

Better:

```text
possible directions were widened first, then checked against practical constraints
```

### Rule 5

Teach reusable ideas, not internal logs.

Bad:
- "This engine applied 7 techniques."

Better:
- "This prompt became more useful because the goal, audience, and output shape were all made explicit."

## Learning Recommendation

For non-developers and beginners, the best teaching order is:

1. what changed
2. why it changed
3. which representative technique explains that change
4. only then which detailed sub-technique supported it

This means:
- effect first
- concept second
- taxonomy last

## Recommended Direction

If this product later expands to 25 detailed techniques, the most reasonable path is:

1. keep 8 representative techniques as the public learning layer
2. expand the engine internally to 12-15 detailed techniques first
3. validate whether the UI still feels readable
4. only then expand toward 20-25
5. reveal detailed techniques only in:
   - advanced drill-down
   - review-needed states
   - technique learning views

## Final Recommendation

Best current strategy:

- do not turn 25 techniques into the default visible UI
- do not use `천재적 사고` as a product-facing label
- extract exploratory structure as internal sub-techniques
- keep the user-facing layer centered on the current representative 8
- teach effects and reusable structure before naming the advanced pattern
