import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPromptValidation, createPromptRenderer } from './promptRenderer.js';

function createSharedRuntimeHandoff(overrides = {}) {
  return {
    sourceVibe: 'Write a JSON email prompt for beta users with subject, body, and CTA.',
    model: 'prompt-model',
    parsedOutput: {},
    normalizedDraft: {},
    validationReport: {
      severity: 'low',
      needs_clarification: false,
      warning_count: 0,
      blocking_issue_count: 0,
    },
    intentIr: {
      summary: 'Write a launch email prompt',
      intent: {
        target_user: 'beta users',
        usage_moment: 'before launch',
        user_job: 'write a launch email prompt',
        problem_context: 'Need a compact prompt for a launch announcement.',
        success_signal: 'The prompt is immediately reusable.',
      },
      delivery: {
        must_haves: ['subject', 'body', 'cta'],
        nice_to_haves: ['friendly tone'],
      },
      analysis: {
        risks: [],
        missing_information: [],
        clarification_questions: [],
      },
      signals: {
        confidence: 'high',
        needs_clarification: false,
        severity: 'low',
        warning_count: 0,
        blocking_issue_count: 0,
      },
    },
    meta: undefined,
    ...overrides,
  };
}

test('prompt renderer keeps explicit zero-shot-ready vibes in pass-through mode', () => {
  const renderer = createPromptRenderer();
  const handoff = createSharedRuntimeHandoff();

  const result = renderer.buildPromptOutput(handoff);

  assert.equal(result.renderer, 'prompt');
  assert.equal(result.rewrite_mode, 'pass_through');
  assert.equal(result.final_prompt, handoff.sourceVibe);
  assert.deepEqual(result.applied_techniques.map((item) => item.id), ['zero_shot_pass_through']);
  assert.equal(result.selection_signals.safe_to_pass_through, true);
  assert.equal(result.rewrite_rationale.summary_code, 'pass_through_clear_enough');
  assert.deepEqual(result.rewrite_rationale.reason_codes, [
    'goal_clear',
    'constraints_or_format_clear',
    'low_ambiguity',
  ]);
  assert.equal(result.validation.status, 'ready');
  assert.equal(result.validation.summary_code, 'ready_to_use');
  assert.deepEqual(result.validation.reason_codes, [
    'preserves_source_vibe',
    'ready_for_direct_use',
  ]);
});

test('prompt renderer escalates to structured refine when intent is vague and ambiguity is high', () => {
  const renderer = createPromptRenderer();
  const handoff = createSharedRuntimeHandoff({
    sourceVibe: 'Need something for launch',
    validationReport: {
      severity: 'high',
      needs_clarification: true,
      warning_count: 2,
      blocking_issue_count: 1,
    },
    intentIr: {
      summary: '',
      intent: {
        target_user: '',
        usage_moment: '',
        user_job: '',
        problem_context: '',
        success_signal: '',
      },
      delivery: {
        must_haves: ['mention launch date', 'mention CTA', 'keep it concise'],
        nice_to_haves: [],
      },
      analysis: {
        risks: ['Do not overpromise'],
        missing_information: ['target audience', 'exact launch date'],
        clarification_questions: ['Who is the email for?', 'When is the launch date?'],
      },
      signals: {
        confidence: 'low',
        needs_clarification: true,
        severity: 'high',
        warning_count: 2,
        blocking_issue_count: 1,
      },
    },
  });

  const result = renderer.buildPromptOutput(handoff);

  assert.equal(result.rewrite_mode, 'structured_refine');
  assert.match(result.final_prompt, /Original request:/);
  assert.match(result.final_prompt, /Task:/);
  assert.match(result.final_prompt, /Constraints and priorities:/);
  assert.match(result.final_prompt, /Before finalizing:/);
  assert.equal(result.applied_techniques.some((item) => item.id === 'goal_clarification'), true);
  assert.equal(result.applied_techniques.some((item) => item.id === 'quality_checklist_injection'), true);
  assert.equal(result.selection_signals.safe_to_pass_through, false);
  assert.equal(result.rewrite_rationale.summary_code, 'structured_refine_reduce_risk');
  assert.deepEqual(result.rewrite_rationale.reason_codes, [
    'goal_needs_clarification',
    'high_ambiguity',
    'missing_information',
    'validation_flags',
  ]);
  assert.equal(result.validation.status, 'ready');
  assert.equal(result.validation.summary_code, 'ready_to_use');
  assert.deepEqual(result.validation.reason_codes, [
    'preserves_source_vibe',
    'rewrite_trace_recorded',
  ]);
});


test('prompt validation marks empty prompt as review_before_use', () => {
  const result = buildPromptValidation({
    sourceVibe: 'Write a launch email prompt.',
    finalPrompt: '',
    rewriteMode: 'pass_through',
    appliedTechniques: [],
  });

  assert.equal(result.status, 'review');
  assert.equal(result.summary_code, 'review_before_use');
  assert.deepEqual(result.warnings, [
    '\uCD5C\uC885 \uD504\uB86C\uD504\uD2B8\uAC00 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.',
    '\uC815\uB9AC \uACFC\uC815\uC5D0\uC11C \uC6D0\uBB38 \uC758\uB3C4\uAC00 \uD750\uB824\uC84C\uC2B5\uB2C8\uB2E4.',
  ]);
  assert.deepEqual(result.reason_codes, ['empty_prompt', 'loses_source_vibe']);
});

test('prompt validation marks refined prompt without technique trace as review_before_use', () => {
  const result = buildPromptValidation({
    sourceVibe: 'Need something for launch',
    finalPrompt: 'Original request:\nNeed something for launch',
    rewriteMode: 'structured_refine',
    appliedTechniques: [],
  });

  assert.equal(result.status, 'review');
  assert.equal(result.summary_code, 'review_before_use');
  assert.deepEqual(result.warnings, ['\uC815\uC81C\uB41C \uD504\uB86C\uD504\uD2B8\uC778\uB370 \uAE30\uB85D\uB41C \uAE30\uBC95\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.']);
  assert.deepEqual(result.reason_codes, ['missing_technique_trace']);
});
