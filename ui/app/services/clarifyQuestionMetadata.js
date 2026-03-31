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

function normalizeIdentityToken(value) {
  return toText(value).toLowerCase().replace(/\s+/g, ' ').trim();
}

export function buildClarifyQuestionDetailId(detail = {}) {
  const intentKey = toText(detail?.intent_key, 'general');
  const reasonCode = normalizeIdentityToken(detail?.reason_code);
  const missingInformation = normalizeIdentityToken(detail?.missing_information);
  const source = normalizeIdentityToken(detail?.source);
  const question = normalizeIdentityToken(detail?.question);

  if (reasonCode) return `${intentKey}::reason::${reasonCode}`;
  if (missingInformation) return `${intentKey}::missing::${missingInformation}`;
  if (intentKey !== 'general') return `${intentKey}::intent`;
  if (source && question) return `${source}::question::${question}`;
  if (question) return `manual_loop::question::${question}`;
  return 'manual_loop::general';
}

const QUESTION_INTENT_META = Object.freeze({
  audience: {
    label: '대상',
    prompt_improvement: '답하면 대상에 맞는 역할, 톤, 예시를 더 정확히 넣을 수 있습니다.',
  },
  task_definition: {
    label: '작업',
    prompt_improvement: '답하면 모델이 해야 할 핵심 작업을 한 줄로 더 선명하게 고정할 수 있습니다.',
  },
  success_criteria: {
    label: '성공 기준',
    prompt_improvement: '답하면 좋은 결과의 기준을 프롬프트 안에 넣어 결과 검토 기준이 더 분명해집니다.',
  },
  requirements: {
    label: '필수 조건',
    prompt_improvement: '답하면 반드시 포함할 요소와 제외할 요소를 더 안정적으로 구조화할 수 있습니다.',
  },
  permissions: {
    label: '권한',
    prompt_improvement: '답하면 허용 범위와 금지 범위를 분명히 적어 더 안전한 지시문이 됩니다.',
  },
  schedule: {
    label: '일정',
    prompt_improvement: '답하면 시점과 순서를 반영해 더 현실적인 프롬프트 구조로 다듬을 수 있습니다.',
  },
  structure: {
    label: '구조',
    prompt_improvement: '답하면 단계, 섹션, 템플릿 같은 출력 뼈대를 더 안정적으로 고정할 수 있습니다.',
  },
  deliverable: {
    label: '산출물',
    prompt_improvement: '답하면 최종 산출물 형태를 먼저 고정해 바로 쓸 수 있는 프롬프트로 다듬을 수 있습니다.',
  },
  source_vibe: {
    label: '원래 의도',
    prompt_improvement: '답하면 원래 요청의 뉘앙스를 유지하면서도 더 구조화된 프롬프트로 정리할 수 있습니다.',
  },
  output_format: {
    label: '출력 형식',
    prompt_improvement: '답하면 원하는 결과 형식을 프롬프트 안에 더 안정적으로 고정할 수 있습니다.',
  },
  tone: {
    label: '톤',
    prompt_improvement: '답하면 말투와 문체를 맞춰 더 일관된 결과를 유도할 수 있습니다.',
  },
  length: {
    label: '분량',
    prompt_improvement: '답하면 길이 제한을 프롬프트 구조에 반영해 더 통제된 결과를 기대할 수 있습니다.',
  },
  next_action: {
    label: '다음 행동',
    prompt_improvement: '답하면 사용자가 바로 움직일 수 있는 다음 단계까지 프롬프트에 더 분명히 담을 수 있습니다.',
  },
  context: {
    label: '맥락',
    prompt_improvement: '답하면 배경 상황을 반영해 더 정확한 판단 기준과 표현을 넣을 수 있습니다.',
  },
  general: {
    label: '일반',
    prompt_improvement: '답하면 빠진 맥락을 채워 프롬프트 구조를 더 선명하게 정리할 수 있습니다.',
  },
});

const QUESTION_SOURCE_LABELS = Object.freeze({
  'prompt_output.validation': '프롬프트 검토',
  prompt_validation: '프롬프트 검토',
  prompt_validation_signal: '프롬프트 구조 신호',
  validation_report: '상위 검증',
  intent_ir: '의도 해석',
  missing_information: '누락 정보',
  manual_loop: '수동 보완',
});

const QUESTION_REASON_META = Object.freeze({
  validation_missing_audience_or_role: {
    why_this_question: '누구를 위한 프롬프트인지 비어 있어 결과 톤과 설명 수준을 맞추기 어렵습니다.',
  },
  validation_missing_task_definition: {
    why_this_question: '무엇을 하게 만들지 불분명해 지시문의 중심 동작이 약해져 있습니다.',
  },
  validation_missing_success_criteria: {
    why_this_question: '좋은 결과의 기준이 비어 있어 프롬프트가 무엇을 목표로 해야 하는지 흐립니다.',
  },
  validation_missing_requirements: {
    why_this_question: '반드시 포함해야 할 조건이 비어 있어 중요한 요구사항이 빠질 수 있습니다.',
  },
  validation_missing_permissions: {
    why_this_question: '허용 범위나 권한 조건이 비어 있어 실행 가능성과 안전선이 흐려집니다.',
  },
  empty_prompt: {
    why_this_question: '현재 정보만으로는 안정적인 프롬프트 구조를 세우기 어렵습니다.',
    prompt_improvement: '답하면 빈칸이 아닌 실제 작업 지시가 들어간 프롬프트로 전환할 수 있습니다.',
  },
  loses_source_vibe: {
    why_this_question: '정제 과정에서 원래 요청의 핵심 뉘앙스가 약해질 위험이 있습니다.',
  },
  missing_technique_trace: {
    why_this_question: '어떤 구조를 고정해야 하는지 부족해 프롬프트의 뼈대를 안정적으로 세우기 어렵습니다.',
    prompt_improvement: '답하면 원하는 구조를 프롬프트 안에 더 직접적으로 고정할 수 있습니다.',
  },
});

function getIntentMeta(intentKey) {
  const normalized = toText(intentKey, 'general');
  return QUESTION_INTENT_META[normalized] || QUESTION_INTENT_META.general;
}

function getSourceLabel(source) {
  const normalized = toText(source, 'manual_loop');
  return QUESTION_SOURCE_LABELS[normalized] || '수동 보완';
}

function buildQuestionCoachingFocus({
  intentKey = 'general',
  source = 'manual_loop',
  reasonCode = '',
  missingInformation = '',
} = {}) {
  const normalizedIntentKey = toText(intentKey, 'general');
  const intentLabel = getIntentMeta(normalizedIntentKey).label;
  const sourceLabel = getSourceLabel(source);
  const normalizedReasonCode = toText(reasonCode);
  const normalizedMissingInformation = toText(missingInformation);

  if (normalizedReasonCode === 'empty_prompt') {
    return `${sourceLabel}에서 최종 프롬프트가 아직 실제 작업 지시로 충분히 정리되지 않아 먼저 보완하는 질문입니다.`;
  }

  if (normalizedReasonCode === 'loses_source_vibe') {
    return `${sourceLabel}에서 원래 요청의 뉘앙스를 지키려면 ${intentLabel}부터 다시 확인하는 편이 좋다고 판단했습니다.`;
  }

  if (normalizedReasonCode === 'missing_technique_trace') {
    return `${sourceLabel}에서 ${intentLabel}를 더 직접적으로 고정해야 프롬프트 구조가 안정된다고 판단했습니다.`;
  }

  if (normalizedReasonCode.startsWith('validation_missing_')) {
    return `${sourceLabel}에서 ${intentLabel} 정보가 아직 비어 있어 먼저 채우는 편이 좋다고 판단했습니다.`;
  }

  if (normalizedMissingInformation) {
    return `${sourceLabel}에서 '${normalizedMissingInformation}' 정보가 아직 비어 있어 먼저 보완하는 질문입니다.`;
  }

  if (normalizedIntentKey !== 'general') {
    return `${sourceLabel}에서 ${intentLabel}를 먼저 또렷하게 잡아야 프롬프트를 안정적으로 다듬을 수 있어 묻는 질문입니다.`;
  }

  return `${sourceLabel}에서 비어 있는 맥락을 추가로 확인해 프롬프트 구조를 더 분명하게 만들기 위한 질문입니다.`;
}

function buildQuestionWhyNarrative({
  source = 'manual_loop',
  reasonCode = '',
  missingInformation = '',
} = {}) {
  const normalizedReasonCode = toText(reasonCode);
  const knownReason = QUESTION_REASON_META[normalizedReasonCode];
  if (knownReason?.why_this_question) {
    return knownReason.why_this_question;
  }

  const normalizedMissingInformation = toText(missingInformation);
  if (normalizedMissingInformation) {
    return `'${normalizedMissingInformation}' 정보가 아직 비어 있어 프롬프트 구조를 충분히 고정하기 어렵습니다.`;
  }

  const normalizedSource = toText(source, 'manual_loop');
  if (normalizedSource === 'intent_ir') {
    return '원래 요청을 해석하는 단계에서 아직 의미가 열려 있어 구조를 확정하기 전 확인이 필요합니다.';
  }
  if (normalizedSource === 'missing_information') {
    return '프롬프트를 안정적으로 구성하는 데 필요한 정보가 아직 비어 있습니다.';
  }
  if (normalizedSource === 'validation_report') {
    return '상위 검증 단계에서 바로 사용하기엔 아직 빠진 정보가 있다고 판단했습니다.';
  }
  if (normalizedSource === 'prompt_validation_signal') {
    return '현재 프롬프트 구조를 점검하는 과정에서 보완이 필요한 항목으로 감지됐습니다.';
  }
  if (normalizedSource === 'prompt_output.validation' || normalizedSource === 'prompt_validation') {
    return '현재 프롬프트를 그대로 쓰기 전에 구조를 한 번 더 고정하는 편이 안전한 상태입니다.';
  }

  return '추가 맥락이 있어야 프롬프트 구조를 더 분명하게 완성할 수 있습니다.';
}

function buildPromptImprovementNarrative({
  intentKey = 'general',
  reasonCode = '',
} = {}) {
  const normalizedReasonCode = toText(reasonCode);
  const knownReason = QUESTION_REASON_META[normalizedReasonCode];
  if (knownReason?.prompt_improvement) {
    return knownReason.prompt_improvement;
  }

  return getIntentMeta(intentKey).prompt_improvement;
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

      const missingInformation = toText(item.missing_information);
      if (missingInformation) normalized.missing_information = missingInformation;

      return normalized;
    })
    .filter(Boolean);
}

function decorateQuestionDetail(detail) {
  const normalized = {
    question: toText(detail.question),
    intent_key: toText(detail.intent_key, 'general'),
    source: toText(detail.source, 'manual_loop'),
    question_id: buildClarifyQuestionDetailId(detail),
  };

  const reasonCode = toText(detail.reason_code);
  if (reasonCode) normalized.reason_code = reasonCode;

  const missingInformation = toText(detail.missing_information);
  if (missingInformation) normalized.missing_information = missingInformation;

  const intentMeta = getIntentMeta(normalized.intent_key);

  return {
    ...normalized,
    intent_label: intentMeta.label,
    source_label: getSourceLabel(normalized.source),
    coaching_focus: buildQuestionCoachingFocus({
      intentKey: normalized.intent_key,
      source: normalized.source,
      reasonCode,
      missingInformation,
    }),
    why_this_question: buildQuestionWhyNarrative({
      source: normalized.source,
      reasonCode,
      missingInformation,
    }),
    prompt_improvement: buildPromptImprovementNarrative({
      intentKey: normalized.intent_key,
      reasonCode,
    }),
  };
}

export function buildClarifyQuestionDetails({
  questions = [],
  suggestedQuestionDetails = [],
} = {}) {
  const detailByQuestion = new Map();
  const detailById = new Map();

  normalizeQuestionDetails(suggestedQuestionDetails).forEach((detail) => {
    const decorated = decorateQuestionDetail(detail);
    if (!detailById.has(decorated.question_id)) {
      detailById.set(decorated.question_id, decorated);
    }
    if (!detailByQuestion.has(detail.question)) {
      detailByQuestion.set(detail.question, decorated);
    }
  });

  return toStringArray(questions).map((question) => {
    const matchedByQuestion = detailByQuestion.get(question);
    if (matchedByQuestion) return matchedByQuestion;

    const fallbackDetail = decorateQuestionDetail({
      question,
      intent_key: 'general',
      source: 'manual_loop',
    });

    return detailById.get(fallbackDetail.question_id) || fallbackDetail;
  });
}
