# Vibe-to-Prompt Context

## Why This File Exists
This file captures the current product-direction reset for this copied repository.

Use this file when a new thread needs the current `Vibe-to-Prompt` intent without re-importing old `Vibe-to-Spec V2` assumptions.

This file does not replace the protected long-term context documents.
It narrows the working interpretation for this repository right now.

## Repository Working Identity
This repository started as a copy of the already-working `Vibe-to-Spec V2` codebase.

It is now being used as:
- a `Vibe-to-Prompt` product workspace
- a reusable engine extraction workspace

The original `Vibe-to-Spec V2` repository is already preserved elsewhere and is not the main risk surface here.

## Current Product Intent
The target experience is now:
- one natural-language input box
- one prompt-oriented output as the primary result
- visible explanation of how and why the prompt was structured

The product should answer:
- what prompt was produced
- which techniques were applied
- how many techniques were applied
- why pass-through or refinement was chosen
- what validation or warning signals influenced the result

## UX Direction
### Input
- one natural-language input field
- no user-level branching as a primary UX requirement
- no separate beginner / experienced / major entry path as a product requirement

### Output
- a single prompt-first result surface
- prompt metadata visible by default
- explanation-oriented UI preferred over spec artifact panels

### Explanation Layer
The educational value should come from:
- rewrite mode
- applied techniques
- skipped techniques when useful
- validation or warning notes
- short rationale for the produced prompt shape
- human-readable selection-signal summaries

It should not depend on:
- spec markdown as the main teaching surface
- persona-based workspace switching
- V2 learning-mode copy as the main framing

## Engine Interpretation
The engine is still allowed to use transitional spec-shaped normalization internally where necessary.

But the product-facing goal is now:
- prompt-first output
- renderer-neutral engine handoff underneath
- shrinking exposure of spec-only contracts in app code

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
As of 2026-03-12:
- prompt renderer exists
- prompt-first controller branching exists
- the active app shell is prompt-first
- the active app surface no longer depends on persona selection
- prompt metadata is visible in the main result UI
- human-readable selection-signal rationale is visible in the main result UI
- spec compatibility paths still remain internally

So the repository is currently best described as:
- `prompt-first transition substantially in place`
- not yet fully free of spec-shaped internals

## Current Thread: Good Work To Continue
These remain valid in the same thread if they directly support the current product intent.

1. Improve the visible explanation quality of the prompt result surface.
2. Reduce visible dependence on spec-first naming in active UI paths.
3. Improve prompt-output validation messages shown to users.
4. Remove one remaining compatibility path only when its blast radius is understood.
5. Strengthen prompt-first app wording and result trust signals.

## Current Thread: Work To Avoid
These should not be pushed further in the same thread unless they become a direct blocker.

1. Large technique-registry expansion toward 25 or 70+ techniques.
2. Full intent-analysis redesign upstream of normalization.
3. Generalized multi-product studio architecture.
4. Major design-system rewrite unrelated to prompt-first validation.
5. Internal cleanup that mostly renames spec-era helpers without changing user-visible behavior.
6. Reintroducing deployment, managed API, or product-ops cleanup as priority work.

## Next-Thread Boundary
Move to a new thread when the work changes from:
- prompt-first product reshaping
- UI/controller simplification
- app-contract migration toward `prompt_output`

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
- one prompt result
- one explanation surface

then it probably belongs in the current thread.

If a task mainly makes the engine internally prettier without reducing spec-first behavior in the product, it is probably not the best current investment.

## Suggested Start Prompt For The Next Thread
```text
작업 시작 전에 아래 문서만 읽고 기준으로 삼아라.

현재 기준 문서:
- docs/long-term-context.md
- docs/engine-refactor-plan.md
- docs/intent-ir.md
- docs/handoff/latest.md
- docs/refactor-stop-checklist.md
- docs/vibe-to-prompt-context.md

현재 작업 전제:
- 이 레포는 Vibe-to-Prompt 작업 레포이자 재사용 가능한 엔진 추출 작업 공간이다.
- 원본 Vibe-to-Spec V2 레포는 별도로 안전하게 보관되어 있다.
- 현재 제품 목표는 한 개 입력창 + 한 개 프롬프트 결과 + 구조화 이유 설명이다.
- spec-shaped normalization과 일부 compatibility path는 아직 내부에 남아 있다.

이번 스레드 목표:
- 사용자에게 보이는 prompt-first 가치가 있는 작업인지 먼저 판단하라.
- 단순 내부 cleanup이면 멈추고 그 이유를 말하라.
- engine blocker 또는 prompt-first UX blocker 하나만 골라 해결하라.

마지막에는 다음을 정리하라:
- 이번 작업이 왜 루프가 아니었는지
- 무엇이 실제로 더 prompt-first 해졌는지
- 무엇이 아직 transitional compatibility path인지
- 새 스레드가 필요하다면 그 정확한 이유
```
