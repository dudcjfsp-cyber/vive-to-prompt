import test from 'node:test';
import assert from 'node:assert/strict';
import { buildClarifyQuestionDetails } from './clarifyQuestionMetadata.js';

test('buildClarifyQuestionDetails preserves prompt-native metadata for active clarify questions', () => {
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
      },
    ],
  });

  assert.deepEqual(details, [
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
    },
  ]);
});

test('buildClarifyQuestionDetails falls back to manual-loop metadata when a question was synthesized downstream', () => {
  const details = buildClarifyQuestionDetails({
    questions: ['What needs manual review first?'],
    suggestedQuestionDetails: [],
  });

  assert.deepEqual(details, [
    {
      question: 'What needs manual review first?',
      intent_key: 'general',
      source: 'manual_loop',
    },
  ]);
});
