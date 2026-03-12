import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPromptOutputFromSpecResult } from './buildPromptOutputFromSpecResult.js';

function createSpecResult() {
  return {
    model: 'spec-model',
    standard_output: {
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
      '입력_데이터_필드': [],
      '권한_규칙': [],
      '남은_모호함': {
        '부족한_정보': [],
        '확인_질문_3개': [],
      },
      '리스크_주의점_3개': [],
    },
    validation_report: {
      severity: 'low',
      needs_clarification: false,
      warning_count: 0,
      blocking_issue_count: 0,
    },
    meta: {
      prompt_policy_mode: 'baseline',
    },
  };
}

test('buildPromptOutputFromSpecResult derives prompt output without a second model call', () => {
  const promptOutput = buildPromptOutputFromSpecResult({
    sourceVibe: 'Write a JSON email prompt for beta users with subject, body, and CTA.',
    result: createSpecResult(),
  });

  assert.equal(promptOutput.renderer, 'prompt');
  assert.equal(promptOutput.rewrite_mode, 'pass_through');
  assert.equal(promptOutput.final_prompt, 'Write a JSON email prompt for beta users with subject, body, and CTA.');
  assert.deepEqual(promptOutput.applied_techniques.map((item) => item.id), ['zero_shot_pass_through']);
});