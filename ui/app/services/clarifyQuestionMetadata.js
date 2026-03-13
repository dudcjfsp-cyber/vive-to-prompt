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

function normalizeQuestionDetails(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => isPlainObject(item))
    .map((item) => {
      const question = toText(item.question);
      if (!question) return null;

      const normalized = {
        question,
        intent_key: toText(item.intent_key, 'general'),
        source: toText(item.source, 'manual_loop'),
      };

      const reasonCode = toText(item.reason_code);
      if (reasonCode) normalized.reason_code = reasonCode;

      return normalized;
    })
    .filter(Boolean);
}

export function buildClarifyQuestionDetails({
  questions = [],
  suggestedQuestionDetails = [],
} = {}) {
  const detailByQuestion = new Map();

  normalizeQuestionDetails(suggestedQuestionDetails).forEach((detail) => {
    if (!detailByQuestion.has(detail.question)) {
      detailByQuestion.set(detail.question, detail);
    }
  });

  return toStringArray(questions).map((question) => detailByQuestion.get(question) || {
    question,
    intent_key: 'general',
    source: 'manual_loop',
  });
}
