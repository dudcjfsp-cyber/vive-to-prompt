function toText(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => toText(item))
    .filter(Boolean);
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function toPositiveNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeSuggestedQuestionDetails(value, fallbackSource = 'prompt_validation') {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => isPlainObject(item))
    .map((item) => {
      const question = toText(item.question);
      if (!question) return null;

      const normalized = {
        question,
        intent_key: toText(item.intent_key, 'general'),
        source: toText(item.source, fallbackSource),
      };

      const reasonCode = toText(item.reason_code);
      if (reasonCode) normalized.reason_code = reasonCode;

      const missingInformation = toText(item.missing_information);
      if (missingInformation) normalized.missing_information = missingInformation;

      return normalized;
    })
    .filter(Boolean);
}

function mergeSuggestedQuestionDetails({
  promptQuestionDetails = [],
  validationQuestionDetails = [],
  promptQuestions = [],
  validationQuestions = [],
  suggestedQuestions = [],
} = {}) {
  const merged = [];
  const promptQuestionSet = new Set(toStringArray(promptQuestions));
  const validationQuestionSet = new Set(toStringArray(validationQuestions));
  const pushDetail = (detail) => {
    if (!isPlainObject(detail)) return;
    const question = toText(detail.question);
    if (!question || merged.some((item) => item.question === question)) return;
    merged.push(detail);
  };

  normalizeSuggestedQuestionDetails(promptQuestionDetails, 'prompt_output.validation').forEach(pushDetail);
  normalizeSuggestedQuestionDetails(validationQuestionDetails, 'validation_report').forEach(pushDetail);

  toStringArray(suggestedQuestions).forEach((question) => {
    if (merged.some((item) => item.question === question)) return;
    merged.push({
      question,
      intent_key: 'general',
      source: promptQuestionSet.has(question)
        ? 'prompt_output.validation'
        : (validationQuestionSet.has(question) ? 'validation_report' : 'prompt_output.validation'),
    });
  });

  return merged.slice(0, 3);
}

function buildSuggestedQuestions({
  promptValidation = null,
  validationReport = null,
  suggestedQuestions = null,
} = {}) {
  if (Array.isArray(suggestedQuestions)) {
    return toStringArray(suggestedQuestions).slice(0, 3);
  }

  const promptQuestions = toStringArray(promptValidation?.suggested_questions);
  const fallbackQuestions = toStringArray(validationReport?.suggested_questions);

  return Array.from(new Set([
    ...promptQuestions,
    ...fallbackQuestions,
  ])).slice(0, 3);
}

export function buildPromptFirstValidationReport({
  promptValidation = null,
  validationReport = null,
  suggestedQuestions = null,
} = {}) {
  const safePromptValidation = isPlainObject(promptValidation) ? promptValidation : null;
  const safeValidationReport = isPlainObject(validationReport) ? validationReport : null;
  const normalizedQuestions = buildSuggestedQuestions({
    promptValidation: safePromptValidation,
    validationReport: safeValidationReport,
    suggestedQuestions,
  });
  const promptQuestions = toStringArray(safePromptValidation?.suggested_questions);
  const validationQuestions = toStringArray(safeValidationReport?.suggested_questions);
  const mergedQuestionDetails = mergeSuggestedQuestionDetails({
    promptQuestionDetails: safePromptValidation?.suggested_question_details,
    validationQuestionDetails: safeValidationReport?.suggested_question_details,
    promptQuestions,
    validationQuestions,
    suggestedQuestions: normalizedQuestions,
  });

  if (safePromptValidation) {
    const promptStatus = toText(safePromptValidation.status, 'ready');
    const fallbackSeverity = promptStatus === 'review' ? 'medium' : 'low';
    const promptWarnings = toStringArray(safePromptValidation.warnings);
    const upstreamWarnings = toStringArray(safeValidationReport?.warnings);
    const warnings = Array.from(new Set([
      ...promptWarnings,
      ...upstreamWarnings,
    ]));
    const blockingIssues = Array.isArray(safeValidationReport?.blocking_issues)
      ? safeValidationReport.blocking_issues
      : [];
    const canAutoProceed = typeof safeValidationReport?.can_auto_proceed === 'boolean'
      ? safeValidationReport.can_auto_proceed
      : promptStatus !== 'review';

    return {
      ...safePromptValidation,
      source: 'prompt_output.validation',
      severity: toText(safeValidationReport?.severity, fallbackSeverity),
      warnings,
      can_auto_proceed: canAutoProceed,
      warning_count: toPositiveNumber(
        safePromptValidation.warning_count,
        toPositiveNumber(safeValidationReport?.warning_count, warnings.length),
      ),
      blocking_issues: blockingIssues,
      blocking_issue_count: toPositiveNumber(
        safeValidationReport?.blocking_issue_count,
        blockingIssues.length,
      ),
      suggested_questions: normalizedQuestions,
      suggested_question_details: mergedQuestionDetails,
      needs_clarification: typeof safePromptValidation.needs_clarification === 'boolean'
        ? safePromptValidation.needs_clarification
        : normalizedQuestions.length > 0,
      upstream_validation: safeValidationReport
        ? {
          severity: toText(safeValidationReport.severity, 'low'),
          warning_count: toPositiveNumber(safeValidationReport.warning_count),
          blocking_issue_count: toPositiveNumber(safeValidationReport.blocking_issue_count),
          can_auto_proceed: safeValidationReport.can_auto_proceed === true,
        }
        : null,
    };
  }

  if (!safeValidationReport) {
    return null;
  }

  return {
    ...safeValidationReport,
    source: 'validation_report',
    suggested_questions: normalizedQuestions,
    suggested_question_details: mergedQuestionDetails,
    needs_clarification: typeof safeValidationReport.needs_clarification === 'boolean'
      ? safeValidationReport.needs_clarification
      : normalizedQuestions.length > 0,
  };
}

export function buildPromptFirstValidationReportFromResult(result) {
  const safeResult = isPlainObject(result) ? result : null;

  return buildPromptFirstValidationReport({
    promptValidation: isPlainObject(safeResult?.prompt_output?.validation)
      ? safeResult.prompt_output.validation
      : null,
    validationReport: isPlainObject(safeResult?.validation_report)
      ? safeResult.validation_report
      : null,
  });
}
