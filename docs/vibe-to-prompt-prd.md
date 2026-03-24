# Vibe-to-Prompt PRD

## Document Status
- Status: Draft refined into working PRD
- Last updated: 2026-03-24
- Scope: current product contract for this repository

## 1. Product Definition

### One-line definition
`Vibe-to-Prompt` helps non-experts turn a rough natural-language request into a usable prompt while learning one reusable prompt-writing pattern from their own input.

### Product category
This product is not a generic prompt generator and not a requirements-spec authoring tool.

It is a prompt-structuring learning track inside the broader `Vibe Studio` direction.

### Product promise
The product should let a user:
- enter one rough request in everyday language
- receive one primary prompt result
- understand what changed and why
- learn one reusable way to ask better next time

## 2. Why This Product Exists

### Core problem
Many non-technical users can describe what they want, but cannot reliably phrase that request in a way that produces stable AI output.

Most tools solve this by either:
- generating an answer without teaching the user anything
- or forcing the user into a form-filling workflow that feels like writing a spec

This product exists to avoid both failures.

### Intended value
The value is not only speed.

The value is:
- a usable prompt now
- a clearer mental model for the next attempt
- less dependence on black-box prompting over time

## 3. Target Users

### Primary user
Non-CS learners, non-developers, and everyday AI beginners who:
- already know what outcome they want
- do not know how to phrase a strong prompt consistently
- want a practical result first
- will learn structure if the learning clearly improves the outcome

### User motivation
The user is not trying to become a prompt engineer.
The user wants to get better results without feeling forced into jargon, templates, or expert workflows.

## 4. Product Positioning

### What this product is
- a prompt-writing coach with immediate practical output
- a prompt-structuring learning tool
- a prompt-first experience with optional deeper explanation

### What this product is not
- not a spec-first planning product
- not a multi-workspace educational maze
- not a diagnostic console for engine internals
- not a generator that only emits a final answer and moves on

## 5. Non-Negotiable Product Principles

### Principle 1: Prompt-first, but not generator-only
The final prompt is the primary result.
However, the product fails if the user only copies it and learns nothing reusable.

### Principle 2: Learning must improve the next attempt
Learning content is only valuable if it helps the user write a better next prompt.

Explanations that only justify the system's behavior are not sufficient.

### Principle 3: No spec-shaped user contract
The interface must not make common users feel like they are filling out a product requirements document.

If a prompt-learning surface starts to feel like requirements capture, feature planning, or structured documentation authoring, it is drifting off-track.

### Principle 4: One primary flow
The current product contract remains:
- one natural-language input
- one primary prompt result
- one explanation layer around that result

This must stay simpler than a workspace tool or multi-mode authoring environment.

### Principle 5: Explanations are layered, not dumped
The product should show:
- what changed
- why it changed
- what the user can reuse next time

It should not force users to parse low-level internal trace to gain that understanding.

## 6. Experience Contract

### Core experience
The user should feel:
- "I can just type what I want."
- "I got a prompt I can use now."
- "I understand what was weak in my original wording."
- "I learned one small pattern I can reuse next time."

### Experience anti-contract
The user should not feel:
- "I need to fill in a formal structure before I can begin."
- "This is secretly a spec-writing tool."
- "The system is showing me its internals instead of helping me write."
- "I only got a prompt, but I still do not know how to do this myself."

### Experience success test
After one successful run, the user should be able to answer:
1. What prompt did the tool produce?
2. Why did it change my wording?
3. What can I phrase better myself next time?

If question 3 cannot be answered, the experience is still too generator-heavy.

## 7. Primary User Flow

### Step 1: Input
The user writes one rough request in natural language.

The input stage should:
- feel lightweight
- avoid expert terminology
- avoid multi-path branching as the primary UX
- avoid fixed spec-like forms
- never require the user to pre-structure the request before a first result is available

### Step 2: Structuring
The system determines whether the request can pass through, needs light refinement, or needs more structured refinement.

This step is an engine decision, but the user-facing explanation must stay plain-language.

### Step 3: Result
The product returns one primary prompt result.

The top of the result must answer in this order:
1. the final prompt
2. whether it is ready now or needs review
3. what changed and why
4. what the user can reuse next time

### Step 4: Improvement loop
If the prompt is not ready, the product asks a small number of high-leverage questions.

Those questions must explain:
- why the question matters
- what part of the prompt will improve if the user answers

The review flow must feel like coaching, not error handling.

## 8. Output Contract

### Ready-to-use state
When the system judges the prompt ready:
- the final prompt must appear first
- the readiness judgment must be obvious
- the explanation must stay short
- one reusable lesson must remain visible
- that reusable lesson should preferably include a phrasing pattern, not only a technique label

The user should be able to:
- copy immediately
- or spend a few seconds learning one better prompt pattern

### Review-before-use state
When the system judges the prompt not yet reliable enough:
- the user must clearly understand why
- the next action must be close to the warning
- the follow-up questions must be short and concrete
- each question must feel tied to a better prompt, not a missing form field

### Compression rule
Short, simple, ready outputs should not expand into heavy scaffolding.

The final prompt must read like a usable prompt, not like a hidden template or internal engine artifact.

## 9. Learning Contract

### What the user should learn
The product should help users learn:
- how to make the task clearer
- how to signal audience, tone, and context when needed
- how to lock output shape when ambiguity is risky
- how to include important instructions and boundaries without turning the request into a spec
- when no extra structure is needed

### What counts as learning
Learning is successful when the product gives the user:
- one reusable phrasing pattern
- one understandable reason for the rewrite
- one visible change between rough vibe and structured prompt

### What does not count as learning
These do not count as sufficient learning value:
- a long trace of internal signals
- a list of technique names without practical reuse value
- engine diagnostics without wording guidance
- generic advice detached from the user's own input

## 10. Prompt-Native Interaction Rules

### Show transformations, not forms
The product should prefer:
- before/after phrasing guidance
- rewritten lines
- prompt-native examples
- short reusable pattern templates
- optional suggestion-based scaffolds instead of required fields

The product should avoid:
- rigid slot-filling as the dominant interaction
- spec terminology as the main UX language
- forcing users to define every dimension before getting help

### Show externalized structure, not hidden reasoning
The product may reveal prompt structure.
It should not expose chain-of-thought or imitate raw internal reasoning as the learning surface.

The useful thing to show is the structure of a stronger prompt, not the model's internal thought transcript.

## 11. Technique Presentation Rules

### Role of techniques
Techniques exist to teach reusable prompt patterns, not to decorate the result with system vocabulary.

### Visible technique limit
At primary weight, the product should usually surface at most three techniques.

### Each visible technique must answer
1. What is this technique doing?
2. Why was it needed for this input?
3. How could the user phrase this more explicitly next time?

### Technique display order
When possible, each technique should be presented in this order:
1. plain-language effect
2. why it mattered for this specific input
3. one reusable phrasing pattern
4. the technique label

If the label comes first and the reusable pattern is missing, the card is drifting toward metadata again.

### Technique failure mode
If techniques appear only as labels or counts, they are still metadata, not learning objects.

## 12. Clarification Question Rules

### Good clarification questions
A good clarification question:
- asks for one missing piece that materially improves the prompt
- explains why that information matters
- makes the improvement feel immediate and concrete
- appears in a small set, usually no more than one to three visible questions at a time

### Bad clarification questions
A bad clarification question:
- feels like a form field
- asks for too much at once
- sounds like requirements capture
- does not show how the answer improves the prompt

## 13. Information Architecture Rules

### Must remain primary
- final prompt
- ready now vs review first judgment
- immediate next action
- one short explanation of the rewrite
- one reusable next-time pattern

### Must remain secondary
- deep trace
- full signal lists
- skipped techniques
- extended validation detail in ready states

### Structural warning
If a short input produces a screen that feels like review work even in a ready state, the IA has drifted away from the product promise.

## 14. Explicit Non-Goals For This Repo

This repo is not currently trying to be:
- a full prompt technique encyclopedia
- a spec authoring workflow
- a product-planning assistant
- a multi-surface workspace system
- a general "AI does everything" app shell

## 15. Near-Term Product Decisions

### Decision 1
When utility and learning compete, keep the prompt first but do not remove the reusable lesson.

### Decision 2
When explanation density and clarity compete, prefer one strong lesson over many weak cards.

### Decision 3
When prompt-native guidance and spec-shaped structure compete, choose prompt-native guidance.

### Decision 4
When a deeper refactor does not improve the visible experience contract, it should not be prioritized.

## 16. Success Criteria

### User-facing success
The product is successful if a user can:
- get a usable prompt quickly
- understand why the wording was changed
- improve their next request with at least one reusable pattern

### Product-shape success
The product is successful if it feels more like:
- a prompt-learning tool with immediate payoff

and less like:
- a black-box generator
- a spec workflow
- a trace-heavy debugging surface

## 17. Evaluation Questions

Every major UX or product change should be judged against these questions:
1. Does this make the product feel more prompt-native?
2. Does this help the user phrase better prompts next time?
3. Does this avoid drifting into spec-first interaction?
4. Does this keep the final prompt easy to find and use?
5. Does this explanation earn its screen space?

If the answer to questions 2 or 3 is no, the change is probably misaligned.

## 18. Current Strategic Read

The correct direction for this repository is:
- not pure auto-generator
- not pure static technique library
- but a hybrid prompt-learning track where generated output remains useful and learning remains explicit

The product should therefore behave like:
- "Use this prompt now"
- plus
- "Here is one prompt-writing move you can reuse next time"

That is the working experience contract for this repo.
