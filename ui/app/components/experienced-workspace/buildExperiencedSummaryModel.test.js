import test from 'node:test';
import assert from 'node:assert/strict';
import { buildExperiencedSummaryModel } from './buildExperiencedSummaryModel.js';

test('buildExperiencedSummaryModel normalizes prompt-first summary input from derived output', () => {
  const result = buildExperiencedSummaryModel({
    derived: {
      promptOutput: {
        source_vibe: '주문 취소 흐름을 정리해줘',
        final_prompt: 'Write a compact launch email with subject, body, and CTA.',
        rewrite_mode: 'light_refine',
        validation: {
          warnings: ['권한 확인', '에러 상태 정의'],
        },
      },
      clarifyLoop: {
        questions: ['취소 사유는 필수인가요?'],
        answers: {
          '취소 사유는 필수인가요?': '예',
        },
        loopTurn: 1,
        canSubmit: true,
      },
    },
  });

  assert.deepEqual(result.actions.topWarnings, ['권한 확인', '에러 상태 정의']);
  assert.equal(result.delivery.quickRequestBase, '주문 취소 흐름을 정리해줘');
  assert.equal(result.delivery.promptOutput.final_prompt, 'Write a compact launch email with subject, body, and CTA.');
  assert.deepEqual(result.clarify.questions, ['취소 사유는 필수인가요?']);
  assert.equal(result.clarify.loopTurn, 1);
  assert.equal(result.clarify.canSubmit, true);
});

test('buildExperiencedSummaryModel falls back to the live vibe when prompt source text is missing', () => {
  const result = buildExperiencedSummaryModel({
    derived: {
      promptOutput: {
        final_prompt: 'Turn the rough request into a concise execution prompt.',
        validation: {
          warnings: ['Need a clearer audience'],
        },
      },
      clarifyLoop: {
        questions: [],
        answers: {},
        loopTurn: 0,
        canSubmit: false,
      },
    },
    stateVibe: 'rough launch request',
  });

  assert.deepEqual(result.actions.topWarnings, ['Need a clearer audience']);
  assert.equal(result.delivery.quickRequestBase, 'rough launch request');
  assert.equal(result.delivery.promptOutput.final_prompt, 'Turn the rough request into a concise execution prompt.');
});

test('buildExperiencedSummaryModel falls back to the live vibe when prompt source text is blank', () => {
  const result = buildExperiencedSummaryModel({
    derived: {
      promptOutput: {
        source_vibe: '   ',
        final_prompt: 'Use the current live request as the source anchor.',
        validation: {
          warnings: ['Keep the audience explicit'],
        },
      },
    },
    stateVibe: 'blank source vibe fallback',
  });

  assert.deepEqual(result.actions.topWarnings, ['Keep the audience explicit']);
  assert.equal(result.delivery.quickRequestBase, 'blank source vibe fallback');
});

test('buildExperiencedSummaryModel keeps topWarnings empty when prompt validation warnings are absent', () => {
  const result = buildExperiencedSummaryModel({
    derived: {
      promptOutput: {
        source_vibe: 'Summarize this launch plan.',
        final_prompt: 'Summarize the launch plan in three bullets.',
        validation: {
          warnings: [],
        },
      },
    },
  });

  assert.deepEqual(result.actions.topWarnings, []);
  assert.equal(result.delivery.quickRequestBase, 'Summarize this launch plan.');
});

test('buildExperiencedSummaryModel ignores spec-shaped fallback data when prompt-native values exist', () => {
  const result = buildExperiencedSummaryModel({
    derived: {
      promptOutput: {
        source_vibe: 'prompt-native request',
        final_prompt: 'Use the prompt-native result.',
        validation: {
          warnings: ['Prompt-native warning'],
        },
      },
      standardOutput: {
        오늘_할_일_3개: ['spec task'],
        완성도_진단: {
          누락_경고: ['Spec warning'],
        },
        수정요청_변환: {
          표준_요청: 'spec request',
          짧은_요청: 'spec short request',
        },
      },
    },
    stateVibe: 'live vibe fallback',
  });

  assert.deepEqual(result.actions.topWarnings, ['Prompt-native warning']);
  assert.equal(result.delivery.quickRequestBase, 'prompt-native request');
  assert.equal(result.delivery.promptOutput.final_prompt, 'Use the prompt-native result.');
});
