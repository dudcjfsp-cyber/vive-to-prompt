import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPromptFirstValidationReport,
  buildPromptFirstValidationReportFromResult,
} from './promptValidationContract.js';

test('buildPromptFirstValidationReport keeps prompt validation primary while preserving upstream diagnostics', () => {
  const report = buildPromptFirstValidationReport({
    promptValidation: {
      status: 'review',
      summary_code: 'review_before_use',
      summary: 'Prompt needs a quick review.',
      warning_count: 2,
      warnings: ['Prompt warning 1'],
      reason_codes: ['validation_missing_requirements'],
      needs_clarification: true,
      suggested_questions: ['Prompt question 1', 'Prompt question 2'],
      suggested_question_details: [
        { question: 'Prompt question 1', intent_key: 'requirements', source: 'prompt_output.validation' },
      ],
    },
    validationReport: {
      severity: 'high',
      warning_count: 3,
      warnings: ['Spec warning 1'],
      can_auto_proceed: false,
      blocking_issue_count: 1,
      blocking_issues: [{ id: 'missing-scope', message: 'Scope is still ambiguous.' }],
      suggested_questions: ['Spec question 1'],
      suggested_question_details: [
        { question: 'Spec question 1', intent_key: 'general', source: 'validation_report' },
      ],
    },
  });

  assert.equal(report?.source, 'prompt_output.validation');
  assert.equal(report?.summary_code, 'review_before_use');
  assert.equal(report?.severity, 'high');
  assert.deepEqual(report?.warnings, ['Prompt warning 1', 'Spec warning 1']);
  assert.deepEqual(report?.blocking_issues, [{ id: 'missing-scope', message: 'Scope is still ambiguous.' }]);
  assert.deepEqual(report?.suggested_questions, ['Prompt question 1', 'Prompt question 2', 'Spec question 1']);
  assert.deepEqual(report?.suggested_question_details, [
    { question: 'Prompt question 1', intent_key: 'requirements', source: 'prompt_output.validation' },
    { question: 'Prompt question 2', intent_key: 'general', source: 'prompt_output.validation' },
    { question: 'Spec question 1', intent_key: 'general', source: 'validation_report' },
  ]);
  assert.deepEqual(report?.upstream_validation, {
    severity: 'high',
    warning_count: 3,
    blocking_issue_count: 1,
    can_auto_proceed: false,
  });
});

test('buildPromptFirstValidationReportFromResult returns fallback report when prompt validation is missing', () => {
  const report = buildPromptFirstValidationReportFromResult({
    validation_report: {
      severity: 'medium',
      needs_clarification: true,
      suggested_questions: ['Spec question 1'],
    },
  });

  assert.equal(report?.source, 'validation_report');
  assert.equal(report?.severity, 'medium');
  assert.deepEqual(report?.suggested_questions, ['Spec question 1']);
});

test('buildPromptFirstValidationReport keeps metadata-backed question wording ahead of raw string fallbacks', () => {
  const report = buildPromptFirstValidationReport({
    promptValidation: {
      needs_clarification: true,
      suggested_questions: ['Raw prompt wording'],
      suggested_question_details: [
        {
          question: 'Canonical prompt wording',
          intent_key: 'audience',
          source: 'prompt_output.validation',
          reason_code: 'validation_missing_audience_or_role',
        },
      ],
    },
    validationReport: {
      needs_clarification: true,
      suggested_questions: ['Raw spec wording'],
      suggested_question_details: [
        {
          question: 'Canonical spec wording',
          intent_key: 'output_format',
          source: 'validation_report',
          missing_information: 'output format',
        },
      ],
    },
  });

  assert.deepEqual(report?.suggested_questions, [
    'Canonical prompt wording',
    'Canonical spec wording',
  ]);
  assert.deepEqual(report?.suggested_question_details, [
    {
      question: 'Canonical prompt wording',
      intent_key: 'audience',
      source: 'prompt_output.validation',
      reason_code: 'validation_missing_audience_or_role',
    },
    {
      question: 'Canonical spec wording',
      intent_key: 'output_format',
      source: 'validation_report',
      missing_information: 'output format',
    },
  ]);
});
