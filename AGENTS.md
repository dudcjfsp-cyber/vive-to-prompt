# UX Evaluation Agent Guide

This file defines the default internal evaluation persona for UX and product-surface reviews in this repository.

Use this guide when:
- judging whether a result surface feels too dense or too thin
- deciding whether an explanation helps or overwhelms
- checking whether `Vibe-to-Prompt` reads like a learning tool rather than only a generator
- reviewing `review_needed` or `ready_to_use` result states

Do not treat this as a product feature spec or a runtime persona system.
This is an internal evaluation lens for AI threads and design/code review.

## Evaluator Personas

### Primary Core Persona

#### Name
`Practical Learner`

#### Role
- default product-direction evaluator
- use when judging whether the product balances utility and learning well

#### Profile
- works in planning, operations, marketing, or adjacent practical knowledge work
- is not trying to become a prompt engineer
- wants a usable result quickly
- is willing to learn structure if the learning is clearly connected to better output
- loses patience when the interface explains too much before showing what to use

#### Default Expectations
- wants to find the final prompt first
- wants a quick answer to "Can I use this now?"
- will read explanation only if it helps them act or improve the next prompt
- accepts extra detail in `review_needed` states more than in `ready_to_use` states
- prefers one clear next action over many equally weighted panels

#### Default Frustrations
- too many cards with equal visual weight
- explanation that feels like audit output instead of help
- educational copy that does not change what the user should do next
- seeing deep rationale before understanding whether the output is usable
- being asked to read the whole system instead of the one thing needed right now

### Secondary Baseline Persona

#### Name
`Everyday AI User`

#### Role
- default over-density and accessibility evaluator
- use when judging whether a common user can succeed without caring much about prompt craft

#### Profile
- uses AI for everyday requests like email drafts, travel help, summaries, planning, or casual work support
- does not want to study prompting unless there is an obvious payoff
- values speed, clarity, and confidence over depth
- may appreciate one short explanation, but will skip long rationale by default

#### Default Expectations
- wants the tool to feel immediately usable
- wants the final answer or prompt to be easy to copy
- wants "use now" vs "needs review" to be obvious at a glance
- wants optional help, not mandatory reading

#### Default Frustrations
- long screens after short inputs
- explanation that feels more complex than the original task
- too many expert-sounding labels
- multiple sections that all seem important
- learning material that appears before practical payoff

## Evaluation Goals

When using these personas, optimize for:
- final prompt discoverability
- fast readiness judgment
- explanation that earns its space
- visible learning value tied to prompt structure
- review flows that feel like guided improvement, not error handling

## Dynamic Evaluation Lenses

Choose one lens per evaluation pass. Do not mix all lenses at once.

### 1. First-Run Quick Success
Use when the input is short and common and the result is likely usable immediately.

Check:
- can the user find the final prompt within a few seconds?
- does the screen make `ready_to_use` feel simple and confident?
- is secondary explanation clearly lower priority than the prompt itself?

Flag:
- if learning panels compete with the prompt for primary attention
- if "success" still feels heavy, cautious, or over-instrumented

### 2. Review-Needed Recovery
Use when the output should not yet be copied blindly.

Check:
- can the user tell what is missing?
- can the user tell why the follow-up question exists?
- can the user tell how answering will improve the prompt structure?

Flag:
- if clarification questions feel like generic form fields
- if warning language explains the system state but not the user's next move

### 3. Learning Value After Success
Use when the output is usable, but the product still wants to teach structure.

Check:
- does the explanation reveal a reusable prompt pattern?
- does the user learn why this structure was chosen?
- is the learning material optional enough not to slow down copying?

Flag:
- if the screen teaches by volume rather than by relevance
- if the explanation sounds like internal engine trace instead of prompt coaching

### 4. Trust And Readiness
Use when judging whether the screen communicates safe use vs review well.

Check:
- is it obvious whether the prompt is ready now?
- does the trust signal match the actual caution level?
- do trust and next action appear near each other?

Flag:
- if the user must read multiple lower cards to understand whether to proceed
- if "ready" and "needs review" states feel too visually similar

### 5. Explanation Density
Use when the surface feels busy or over-detailed.

Check:
- does each visible section answer a distinct user question?
- would hiding one section make the product easier without harming trust?
- is the explanation layered from immediate to optional?

Flag:
- if several sections repeat the same conclusion in different words
- if detail that is useful for internal validation is shown as if it were essential UX

## Decision Rules

### Persona Selection Rule
- use `Practical Learner` when judging learning-track fit and prompt-structure teaching value
- use `Everyday AI User` when judging first-run simplicity, density, and broad accessibility
- use both when deciding whether a success-state surface is carrying too much visible explanation

### Prefer Keeping Visible
- the final prompt
- the immediate readiness judgment
- one clear next action when review is needed
- one short explanation of why this prompt shape was chosen

### Prefer Collapsing, Deferring, Or Demoting
- repeated rationale across multiple cards
- low-level engine trace not needed for immediate user action
- long validation detail in `ready_to_use` states
- educational detail that does not improve the user's next decision

## Red Flags

Treat these as strong warning signs:
- a short simple input produces a visually exhausting result screen
- `ready_to_use` still feels like the user is entering a review workflow
- users must read several cards before understanding what to do next
- learning value is claimed, but the screen does not teach a reusable structural idea
- the UI looks more like a diagnostic console than a prompt-learning tool

## Non-Goals

Do not use this guide to justify:
- adding a product-facing persona selector
- turning every review into broad UX redesign work
- removing explanation entirely in the name of simplicity
- preserving dense panels just because the engine can produce them

## Short Review Template

When asked to evaluate a UX change, answer in this shape:

0. Chosen persona
1. Chosen lens
2. What the persona understands immediately
3. What still feels heavy, confusing, or too internal
4. Whether the surface feels more like a prompt-learning tool or a generator
5. The smallest next change worth making
