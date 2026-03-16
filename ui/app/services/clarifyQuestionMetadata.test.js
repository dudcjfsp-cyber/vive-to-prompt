import test from 'node:test';
import assert from 'node:assert/strict';
import { buildClarifyQuestionDetails } from './clarifyQuestionMetadata.js';

test('buildClarifyQuestionDetails translates prompt-native metadata into learning-oriented question guidance', () => {
  const details = buildClarifyQuestionDetails({
    questions: ['Who is the audience?', 'What format is required?'],
    suggestedQuestionDetails: [
      {
        question: 'Who is the audience?',
        intent_key: 'audience',
        source: 'prompt_output.validation',
        reason_code: 'validation_missing_audience_or_role',
      },
      {
        question: 'What format is required?',
        intent_key: 'output_format',
        source: 'validation_report',
        missing_information: 'output format',
      },
    ],
  });

  assert.equal(details[0].intent_key, 'audience');
  assert.equal(details[0].source, 'prompt_output.validation');
  assert.equal(details[0].intent_label, '대상');
  assert.equal(details[0].source_label, '프롬프트 검토');
  assert.match(details[0].why_this_question, /누구를 위한 프롬프트인지 비어 있어/);
  assert.match(details[0].prompt_improvement, /역할, 톤, 예시/);

  assert.equal(details[1].intent_key, 'output_format');
  assert.equal(details[1].source, 'validation_report');
  assert.equal(details[1].intent_label, '출력 형식');
  assert.equal(details[1].source_label, '상위 검증');
  assert.match(details[1].why_this_question, /output format/);
  assert.match(details[1].prompt_improvement, /원하는 결과 형식/);
});

test('buildClarifyQuestionDetails falls back to manual-loop metadata for synthesized questions', () => {
  const details = buildClarifyQuestionDetails({
    questions: ['What needs manual review first?'],
    suggestedQuestionDetails: [],
  });

  assert.deepEqual(details, [
    {
      question: 'What needs manual review first?',
      intent_key: 'general',
      source: 'manual_loop',
      intent_label: '일반',
      source_label: '수동 보완',
      why_this_question: '추가 맥락이 있어야 프롬프트 구조를 더 분명하게 완성할 수 있습니다.',
      prompt_improvement: '답하면 빠진 맥락을 채워 프롬프트 구조를 더 선명하게 정리할 수 있습니다.',
    },
  ]);
});
