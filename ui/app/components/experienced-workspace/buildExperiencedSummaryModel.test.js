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
      },
      standardOutput: {
        오늘_할_일_3개: ['폼 정리', 'API 연결', '테스트 추가', '배포'],
        완성도_진단: {
          누락_경고: ['권한 확인', '에러 상태 정의'],
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

  assert.deepEqual(result.actions.today, ['폼 정리', 'API 연결', '테스트 추가']);
  assert.deepEqual(result.actions.topWarnings, ['권한 확인', '에러 상태 정의']);
  assert.equal(result.delivery.quickRequestBase, '주문 취소 흐름을 정리해줘');
  assert.equal(result.delivery.promptOutput.final_prompt, 'Write a compact launch email with subject, body, and CTA.');
  assert.deepEqual(result.clarify.questions, ['취소 사유는 필수인가요?']);
  assert.equal(result.clarify.loopTurn, 1);
  assert.equal(result.clarify.canSubmit, true);
});

test('buildExperiencedSummaryModel falls back to prompt validation when standard output is missing', () => {
  const result = buildExperiencedSummaryModel({
    derived: {
      promptOutput: {
        source_vibe: 'rough launch request',
        final_prompt: 'Turn the rough request into a concise execution prompt.',
        validation: {
          warnings: ['Need a clearer audience'],
        },
      },
      standardOutput: null,
      clarifyLoop: {
        questions: [],
        answers: {},
        loopTurn: 0,
        canSubmit: false,
      },
    },
  });

  assert.deepEqual(result.actions.today, []);
  assert.deepEqual(result.actions.topWarnings, ['Need a clearer audience']);
  assert.equal(result.delivery.quickRequestBase, 'rough launch request');
  assert.equal(result.delivery.promptOutput.final_prompt, 'Turn the rough request into a concise execution prompt.');
});