import test from 'node:test';
import assert from 'node:assert/strict';
import { buildClarifyQuestionDetails } from './clarifyQuestionMetadata.js';
import { buildPromptFirstValidationReportFromResult } from './promptValidationContract.js';

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
  assert.ok(details[0].coaching_focus.includes(details[0].intent_label));
  assert.ok(details[0].coaching_focus.includes(details[0].source_label));
  assert.match(details[0].why_this_question, /누구를 위한 프롬프트인지 비어 있어/);
  assert.match(details[0].prompt_improvement, /역할, 톤, 예시/);

  assert.equal(details[1].intent_key, 'output_format');
  assert.equal(details[1].source, 'validation_report');
  assert.equal(details[1].intent_label, '출력 형식');
  assert.equal(details[1].source_label, '상위 검증');
  assert.ok(details[1].coaching_focus.includes(details[1].source_label));
  assert.match(details[1].why_this_question, /output format/);
  assert.match(details[1].prompt_improvement, /원하는 결과 형식/);

  const genericAudienceDetails = buildClarifyQuestionDetails({
    questions: ['Who is the audience?'],
    suggestedQuestionDetails: [
      {
        question: 'Who is the audience?',
        intent_key: 'audience',
        source: 'prompt_output.validation',
      },
    ],
  });

  assert.notEqual(details[0].coaching_focus, genericAudienceDetails[0].coaching_focus);
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
      coaching_focus: '수동 보완에서 비어 있는 맥락을 추가로 확인해 프롬프트 구조를 더 분명하게 만들기 위한 질문입니다.',
      why_this_question: '추가 맥락이 있어야 프롬프트 구조를 더 분명하게 완성할 수 있습니다.',
      prompt_improvement: '답하면 빠진 맥락을 채워 프롬프트 구조를 더 선명하게 정리할 수 있습니다.',
    },
  ]);
});

test('buildClarifyQuestionDetails consumes actual review-state metadata from prompt-first validation output', () => {
  const reviewValidation = buildPromptFirstValidationReportFromResult({
    prompt_output: {
      validation: {
        status: 'review',
        summary_code: 'review_before_use',
        suggested_questions: ['누구를 위한 안내문인가요?', '어떤 형식으로 받아야 하나요?'],
        suggested_question_details: [
          {
            question: '누구를 위한 안내문인가요?',
            intent_key: 'audience',
            source: 'prompt_output.validation',
            reason_code: 'validation_missing_audience_or_role',
          },
          {
            question: '어떤 형식으로 받아야 하나요?',
            intent_key: 'output_format',
            source: 'validation_report',
            missing_information: '결과 형식',
          },
        ],
      },
    },
    validation_report: {
      severity: 'medium',
      warning_count: 2,
      can_auto_proceed: false,
      suggested_questions: ['누구를 위한 안내문인가요?'],
    },
  });

  const details = buildClarifyQuestionDetails({
    questions: reviewValidation?.suggested_questions,
    suggestedQuestionDetails: reviewValidation?.suggested_question_details,
  });

  assert.equal(reviewValidation?.summary_code, 'review_before_use');
  assert.equal(details.length, 2);
  assert.ok(details.every((detail) => typeof detail.coaching_focus === 'string' && detail.coaching_focus.length > 0));
  assert.ok(details.every((detail) => detail.coaching_focus.includes(detail.source_label)));
  assert.match(details[0].coaching_focus, /대상/);
  assert.match(details[1].prompt_improvement, /결과 형식/);
});
