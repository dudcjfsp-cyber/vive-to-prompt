import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildClarifyStartedShadowPayload,
  buildGeneratedResultPlan,
  buildPromptExperimentId,
  buildTransmuteSuccessShadowPayload,
} from './transmuteFlow.js';

test('buildPromptExperimentId uses persona scope and policy mode', () => {
  assert.equal(buildPromptExperimentId({
    id: 'experienced',
    promptExperimentScope: 'experienced',
    promptPolicyMode: 'baseline',
  }), 'experienced_baseline_v1');
});

test('buildGeneratedResultPlan limits questions when loop is disabled', () => {
  const plan = buildGeneratedResultPlan({
    generated: {
      validation_report: {
        severity: 'medium',
        needs_clarification: true,
        suggested_questions: ['질문 1'],
      },
    },
    loopMode: 'off',
    maxClarifyTurns: 1,
    nextLoopTurn: 0,
    promptExperimentId: 'exp_baseline_v1',
  });

  assert.deepEqual(plan.nextQuestions, []);
  assert.equal(plan.validationReport?.needs_clarification, true);
  assert.equal(plan.validationReport?.source, 'validation_report');
  assert.match(plan.nextGenerationId, /^exp_baseline_v1_/);
});

test('buildGeneratedResultPlan uses prompt validation questions when prompt output needs review', () => {
  const plan = buildGeneratedResultPlan({
    generated: {
      validation_report: {
        needs_clarification: false,
        suggested_questions: [],
      },
      prompt_output: {
        validation: {
          needs_clarification: true,
          suggested_questions: ['Who is the audience?', 'What format is required?'],
        },
      },
    },
    loopMode: 'guided_once',
    maxClarifyTurns: 1,
    nextLoopTurn: 0,
    promptExperimentId: 'exp_baseline_v1',
  });

  assert.deepEqual(plan.nextQuestions, ['Who is the audience?', 'What format is required?']);
  assert.equal(plan.validationReport?.source, 'prompt_output.validation');
  assert.equal(plan.validationReport?.needs_clarification, true);
  assert.deepEqual(plan.validationReport?.suggested_questions, ['Who is the audience?', 'What format is required?']);
});

test('buildGeneratedResultPlan prioritizes prompt-native clarification questions over spec fallback questions', () => {
  const plan = buildGeneratedResultPlan({
    generated: {
      validation_report: {
        needs_clarification: true,
        suggested_questions: ['Spec question 1', 'Spec question 2', 'Spec question 3'],
      },
      prompt_output: {
        validation: {
          needs_clarification: true,
          suggested_questions: ['Prompt question 1', 'Prompt question 2'],
        },
      },
    },
    loopMode: 'guided_once',
    maxClarifyTurns: 1,
    nextLoopTurn: 0,
    promptExperimentId: 'exp_baseline_v1',
  });

  assert.deepEqual(plan.nextQuestions, ['Prompt question 1', 'Prompt question 2', 'Spec question 1']);
  assert.equal(plan.validationReport?.source, 'prompt_output.validation');
  assert.deepEqual(plan.validationReport?.suggested_questions, ['Prompt question 1', 'Prompt question 2', 'Spec question 1']);
});

test('buildGeneratedResultPlan does not reopen clarify loop from spec fallback when prompt validation says it is unnecessary', () => {
  const plan = buildGeneratedResultPlan({
    generated: {
      validation_report: {
        needs_clarification: true,
        suggested_questions: ['Spec question 1'],
      },
      prompt_output: {
        validation: {
          needs_clarification: false,
          suggested_questions: [],
        },
      },
    },
    loopMode: 'guided_once',
    maxClarifyTurns: 1,
    nextLoopTurn: 0,
    promptExperimentId: 'exp_baseline_v1',
  });

  assert.deepEqual(plan.nextQuestions, []);
  assert.equal(plan.validationReport?.source, 'prompt_output.validation');
  assert.equal(plan.validationReport?.needs_clarification, false);
});

test('buildGeneratedResultPlan persists prompt-native validation as the main loop contract', () => {
  const plan = buildGeneratedResultPlan({
    generated: {
      validation_report: {
        severity: 'high',
        can_auto_proceed: false,
        warning_count: 3,
        blocking_issue_count: 1,
        needs_clarification: true,
        suggested_questions: ['Spec question 1'],
      },
      prompt_output: {
        validation: {
          status: 'review',
          summary_code: 'review_before_use',
          summary: '현재 프롬프트는 한 번 검토하고 쓰는 편이 안전합니다.',
          warning_count: 2,
          warnings: ['프롬프트 경고 1'],
          reason_codes: ['validation_missing_requirements'],
          reason_details: ['핵심 요구사항이 아직 덜 고정돼 있습니다.'],
          needs_clarification: true,
          suggested_questions: ['Prompt question 1', 'Prompt question 2'],
        },
      },
    },
    loopMode: 'guided_once',
    maxClarifyTurns: 1,
    nextLoopTurn: 0,
    promptExperimentId: 'exp_baseline_v1',
  });

  assert.equal(plan.validationReport?.source, 'prompt_output.validation');
  assert.equal(plan.validationReport?.status, 'review');
  assert.equal(plan.validationReport?.summary_code, 'review_before_use');
  assert.equal(plan.validationReport?.severity, 'high');
  assert.equal(plan.validationReport?.can_auto_proceed, false);
  assert.deepEqual(plan.validationReport?.suggested_questions, [
    'Prompt question 1',
    'Prompt question 2',
    'Spec question 1',
  ]);
  assert.deepEqual(plan.validationReport?.upstream_validation, {
    severity: 'high',
    warning_count: 3,
    blocking_issue_count: 1,
    can_auto_proceed: false,
  });
});

test('buildTransmuteSuccessShadowPayload switches event type for regenerate flow', () => {
  const payload = buildTransmuteSuccessShadowPayload({
    generated: {
      model: 'gpt-4.1',
      meta: {
        prompt_policy_mode: 'baseline',
        prompt_experiment_id: 'exp_baseline_v1',
      },
    },
    apiProvider: 'openai',
    selectedModel: 'gpt-4.1',
    promptPolicyMode: 'baseline',
    promptExperimentId: 'exp_baseline_v1',
    validationReport: {
      source: 'prompt_output.validation',
      severity: 'medium',
      can_auto_proceed: false,
      status: 'review',
      summary_code: 'review_before_use',
    },
    nextQuestions: ['질문 1'],
    nextLoopTurn: 1,
    nextGenerationId: 'exp_baseline_v1_123',
    clarificationAnswersPatch: { '질문 1': '답변' },
  });

  assert.equal(payload.type, 'regenerate_success');
  assert.equal(payload.currentNodeId, 'regenerate_success');
  assert.equal(payload.payload.validation_severity, 'medium');
  assert.equal(payload.payload.question_count, 1);
});

test('buildClarifyStartedShadowPayload returns null when there are no questions', () => {
  assert.equal(buildClarifyStartedShadowPayload({ nextQuestions: [] }), null);
});
