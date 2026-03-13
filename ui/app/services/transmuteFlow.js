import { shouldOfferClarificationLoop } from './clarifyLoop.js';

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
  suggestedQuestions = [],
} = {}) {
  const merged = [];
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
      source: merged.length === 0 ? 'prompt_output.validation' : 'validation_report',
    });
  });

  return merged.slice(0, 3);
}

function buildLoopValidationContract({ promptValidation = null, validationReport = null, suggestedQuestions = [] } = {}) {
  const safePromptValidation = isPlainObject(promptValidation) ? promptValidation : null;
  const safeValidationReport = isPlainObject(validationReport) ? validationReport : null;
  const normalizedQuestions = toStringArray(suggestedQuestions).slice(0, 3);
  const mergedQuestionDetails = mergeSuggestedQuestionDetails({
    promptQuestionDetails: safePromptValidation?.suggested_question_details,
    validationQuestionDetails: safeValidationReport?.suggested_question_details,
    suggestedQuestions: normalizedQuestions,
  });

  if (safePromptValidation) {
    const promptStatus = toText(safePromptValidation.status, 'ready');
    const fallbackSeverity = promptStatus === 'review' ? 'medium' : 'low';
    const canAutoProceed = typeof safeValidationReport?.can_auto_proceed === 'boolean'
      ? safeValidationReport.can_auto_proceed
      : promptStatus !== 'review';

    return {
      ...safePromptValidation,
      source: 'prompt_output.validation',
      severity: toText(safeValidationReport?.severity, fallbackSeverity),
      can_auto_proceed: canAutoProceed,
      warning_count: toPositiveNumber(
        safePromptValidation.warning_count,
        toPositiveNumber(safeValidationReport?.warning_count),
      ),
      blocking_issue_count: toPositiveNumber(safeValidationReport?.blocking_issue_count),
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

export function buildPromptExperimentId(personaConfig = {}) {
  const scope = toText(personaConfig.promptExperimentScope, toText(personaConfig.id, 'default')) || 'default';
  const mode = toText(personaConfig.promptPolicyMode, 'baseline') || 'baseline';
  return `${scope}_${mode}_v1`;
}

export function buildGeneratedResultPlan({
  generated,
  loopMode = 'off',
  maxClarifyTurns = 0,
  nextLoopTurn = 0,
  promptExperimentId = '',
} = {}) {
  const validationReport = isPlainObject(generated?.validation_report) ? generated.validation_report : null;
  const promptValidation = isPlainObject(generated?.prompt_output?.validation)
    ? generated.prompt_output.validation
    : null;
  const promptQuestions = toStringArray(promptValidation?.suggested_questions);
  const fallbackQuestions = toStringArray(validationReport?.suggested_questions);
  const suggestedQuestions = Array.from(new Set([
    ...promptQuestions,
    ...fallbackQuestions,
  ])).slice(0, 3);
  const promptNeedsClarification = typeof promptValidation?.needs_clarification === 'boolean'
    ? promptValidation.needs_clarification
    : (promptQuestions.length > 0 ? true : null);
  const loopValidation = buildLoopValidationContract({
    promptValidation: isPlainObject(promptValidation)
      ? {
        ...promptValidation,
        needs_clarification: promptNeedsClarification === null
          ? promptValidation.needs_clarification
          : promptNeedsClarification,
      }
      : null,
    validationReport,
    suggestedQuestions,
  });
  const shouldOfferLoop = shouldOfferClarificationLoop({
    loopMode,
    maxClarifyTurns,
    loopTurn: nextLoopTurn,
    validationReport: loopValidation,
  });

  return {
    validationReport: loopValidation,
    nextQuestions: shouldOfferLoop ? suggestedQuestions : [],
    nextGenerationId: `${toText(promptExperimentId, 'generation')}_${Date.now()}`,
  };
}

export function buildTransmuteSuccessShadowPayload({
  generated,
  apiProvider = '',
  selectedModel = '',
  promptPolicyMode = '',
  promptExperimentId = '',
  validationReport = null,
  nextQuestions = [],
  nextLoopTurn = 0,
  nextGenerationId = '',
  clarificationAnswersPatch = null,
} = {}) {
  const isRegenerate = isPlainObject(clarificationAnswersPatch);

  return {
    type: isRegenerate ? 'regenerate_success' : 'transmute_success',
    currentNodeId: isRegenerate ? 'regenerate_success' : 'transmute_success',
    answersPatch: {
      api_provider: apiProvider,
      last_model: String(generated?.model || selectedModel || ''),
      last_prompt_policy_mode: String(generated?.meta?.prompt_policy_mode || promptPolicyMode),
    },
    clarificationAnswersPatch,
    pendingQuestions: nextQuestions,
    lastValidation: validationReport,
    loopTurn: nextLoopTurn,
    lastGenerationId: nextGenerationId,
    payload: {
      provider: apiProvider,
      model: String(generated?.model || selectedModel || ''),
      prompt_policy_mode: String(generated?.meta?.prompt_policy_mode || promptPolicyMode),
      prompt_experiment_id: String(generated?.meta?.prompt_experiment_id || promptExperimentId),
      example_mode: String(generated?.meta?.example_mode || 'none'),
      validation_severity: String(validationReport?.severity || 'low'),
      can_auto_proceed: Boolean(validationReport?.can_auto_proceed),
      question_count: nextQuestions.length,
    },
  };
}

export function buildClarifyStartedShadowPayload({
  nextQuestions = [],
  validationReport = null,
  nextLoopTurn = 0,
  nextGenerationId = '',
} = {}) {
  if (!Array.isArray(nextQuestions) || nextQuestions.length === 0) return null;

  return {
    type: 'clarify_started',
    currentNodeId: 'clarify_started',
    pendingQuestions: nextQuestions,
    lastValidation: validationReport,
    loopTurn: nextLoopTurn,
    lastGenerationId: nextGenerationId,
    payload: {
      question_count: nextQuestions.length,
      severity: String(validationReport?.severity || 'low'),
    },
  };
}

export function buildClarifyAnsweredShadowPayload({
  clarificationAnswersPatch = null,
  clarifyQuestions = [],
  nextLoopTurn = 0,
  answeredCount = 0,
} = {}) {
  return {
    type: 'clarify_answered',
    currentNodeId: 'clarify_answered',
    clarificationAnswersPatch,
    pendingQuestions: clarifyQuestions,
    loopTurn: nextLoopTurn,
    payload: {
      question_count: answeredCount,
    },
  };
}
