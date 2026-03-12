import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPromptFacadeResult, transmuteVibeToPrompt } from './transmutePromptFacade.js';

function createPromptSpec() {
  return {
    '한 줄 요약': 'Write a launch email prompt',
    '문제정의_5가지': {
      '누가': 'beta users',
      '언제': 'before release day',
      '무엇을': 'draft a reusable launch email prompt',
      '왜': 'speed up launch communication',
      '성공기준': 'the prompt is ready to paste into a model',
    },
    '사용자역할': [
      { '역할': 'marketer', '설명': 'owns launch messaging' },
    ],
    '핵심_기능': {
      '필수': ['Include subject', 'Include CTA'],
      '있으면 좋음': ['Friendly tone'],
    },
    '입력_데이터_필드': [
      { '이름': 'audience', '타입': 'string', '예시': 'beta users' },
    ],
    '권한_규칙': [
      { '역할': 'marketer', '조회': true, '생성': true, '수정': true, '삭제': false, '비고': 'editable' },
    ],
    '남은_모호함': {
      '부족한_정보': ['final launch date'],
      '확인_질문_3개': ['What is the final launch date?', 'Any tone restrictions?', 'Should we mention discount details?'],
    },
    '리스크_주의점_3개': ['Avoid hype'],
  };
}

function createValidationReport() {
  return {
    severity: 'medium',
    needs_clarification: true,
    warning_count: 1,
    blocking_issue_count: 0,
  };
}

test('buildPromptFacadeResult returns prompt output while preserving the shared runtime handoff', () => {
  const spec = createPromptSpec();
  const validationReport = createValidationReport();

  const { result, sharedRuntimeHandoff } = buildPromptFacadeResult({
    raw: {
      model: 'prompt-facade-model',
      meta: { repair_mode: 'semantic_repair' },
    },
    fallbackModel: 'fallback-model',
    promptMeta: { validation_retry_count: 2 },
    sourceVibe: 'Need an email prompt for the beta launch.',
    normalizeStandardOutput: () => ({ spec, validationReport }),
  });

  assert.equal(result.model, 'prompt-facade-model');
  assert.equal(result.prompt_output.renderer, 'prompt');
  assert.equal(result.prompt_output.rewrite_mode, 'structured_refine');
  assert.deepEqual(result.validation_report, validationReport);
  assert.deepEqual(result.meta, {
    repair_mode: 'semantic_repair',
    validation_retry_count: 2,
  });
  assert.equal(sharedRuntimeHandoff.normalizedDraft, spec);
  assert.equal(sharedRuntimeHandoff.intentIr.source_vibe, 'Need an email prompt for the beta launch.');
  assert.equal(sharedRuntimeHandoff.meta.validation_retry_count, 2);
});

test('transmuteVibeToPrompt consumes the injected runtime service and returns prompt output', async () => {
  const calls = [];
  const spec = createPromptSpec();
  const validationReport = createValidationReport();

  const result = await transmuteVibeToPrompt('Need an email prompt for the beta launch.', 'demo-key', {
    provider: 'openai',
    showThinking: false,
    modelName: 'gpt-4.1',
    persona: 'major',
    promptPolicyMode: 'baseline',
    promptExperimentId: 'prompt_runtime_test',
  }, {
    runtime: {
      defaultProvider: 'gemini',
      normalizeProvider(provider) {
        calls.push(['normalizeProvider', provider]);
        return provider;
      },
      async getOptimalModel(apiKey, preferredModel, provider) {
        calls.push(['getOptimalModel', apiKey, preferredModel, provider]);
        return preferredModel || 'fallback-model';
      },
      async generateTextByProvider(provider, apiKey, modelName, prompt) {
        calls.push(['generateTextByProvider', provider, apiKey, modelName, prompt]);
        return '{}';
      },
    },
    executePromptRepairChain: async (generateText, promptOptions) => {
      calls.push(['executePromptRepairChain', promptOptions]);
      return {
        parsed: {
          model: 'runtime-model',
          meta: { repair_mode: 'none' },
        },
        promptMeta: { validation_retry_count: 0 },
        repairMode: 'none',
        fallbackApplied: false,
        validationRetryCount: 0,
        semanticIssueCount: 0,
      };
    },
    normalizeStandardOutput: () => ({ spec, validationReport }),
  });

  assert.equal(result.provider, 'openai');
  assert.equal(result.model, 'runtime-model');
  assert.equal(result.prompt_output.renderer, 'prompt');
  assert.equal(typeof result.prompt_output.final_prompt, 'string');
  assert.deepEqual(calls[0], ['normalizeProvider', 'openai']);
  assert.deepEqual(calls[1], ['getOptimalModel', 'demo-key', 'gpt-4.1', 'openai']);
  assert.deepEqual(calls[2], ['executePromptRepairChain', {
    vibe: 'Need an email prompt for the beta launch.',
    showThinking: false,
    persona: 'major',
    policyMode: 'baseline',
    promptExperimentId: 'prompt_runtime_test',
  }]);
});