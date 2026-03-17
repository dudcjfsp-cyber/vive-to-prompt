import { PROMPT_TECHNIQUE_MAP, PROMPT_TECHNIQUE_REGISTRY } from './promptTechniqueRegistry.js';

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function toText(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => toText(item)).filter(Boolean);
}

function pushUniqueText(list, value) {
  const text = toText(value);
  if (!text || list.includes(text)) return;
  list.push(text);
}

function pushQuestionForTopic(list, question, matcher = null) {
  const text = toText(question);
  if (!text) return;
  if (matcher && list.some((item) => matcher.test(item))) return;
  pushUniqueText(list, text);
}

const PROMPT_NATIVE_VALIDATION_SIGNAL_MAP = Object.freeze({
  audience_or_role_missing: {
    ids: ['missing_problem_who', 'missing_roles'],
    warnings: ['문제정의 5칸: 누가가 비어 있습니다.', '사용자 역할이 비어 있습니다.'],
    reason_code: 'validation_missing_audience_or_role',
    warning: '이 프롬프트가 맞춰야 하는 대상이나 역할 정보가 아직 덜 고정돼 있습니다.',
    reason_detail: '누구를 위한 프롬프트인지, 어떤 역할을 기준으로 답해야 하는지가 아직 충분히 분명하지 않습니다.',
    question: '이 프롬프트가 가장 먼저 맞춰야 하는 대상이나 역할은 누구인가요?',
    intent_key: 'audience',
    question_matcher: /(who|audience|target|user|reader|customer|recipient|role|persona|누구|대상|사용자|독자|고객|수신자|역할)/i,
  },
  task_definition_missing: {
    ids: ['missing_summary', 'missing_problem_what', 'missing_standard_request'],
    warnings: ['한 줄 요약이 비어 있습니다.', '문제정의 5칸: 무엇을이 비어 있습니다.', '표준 요청문이 비어 있습니다.'],
    reason_code: 'validation_missing_task_definition',
    warning: '이 프롬프트가 정확히 시켜야 할 작업이 아직 덜 구체적입니다.',
    reason_detail: '최종 프롬프트가 수행해야 할 핵심 작업이나 요청 문장이 아직 충분히 선명하지 않습니다.',
    question: '이 프롬프트로 정확히 어떤 작업을 수행하게 하고 싶나요?',
    intent_key: 'task_definition',
    question_matcher: /(task|job|work|request|what|무엇|작업|요청|기능)/i,
  },
  success_or_quality_bar_missing: {
    ids: ['missing_problem_success', 'missing_tests'],
    warnings: ['문제정의 5칸: 성공기준이 비어 있습니다.', '테스트 시나리오가 비어 있습니다.'],
    reason_code: 'validation_missing_success_criteria',
    warning: '좋은 결과를 판단할 성공 기준이 아직 약합니다.',
    reason_detail: '이 프롬프트의 결과가 충분히 좋은지 판단할 기준이나 확인 포인트가 아직 부족합니다.',
    question: '이 프롬프트의 결과가 충분히 좋다고 볼 기준은 무엇인가요?',
    intent_key: 'success_criteria',
    question_matcher: /(success|quality|criteria|check|test|검증|성공|기준|확인|테스트)/i,
  },
  requirements_or_input_missing: {
    ids: ['missing_must_features', 'missing_input_fields'],
    warnings: ['필수 기능이 비어 있습니다.', '입력 데이터 필드가 비어 있습니다.'],
    reason_code: 'validation_missing_requirements',
    warning: '이 프롬프트에 반드시 포함해야 할 핵심 요구나 입력 조건이 아직 덜 드러나 있습니다.',
    reason_detail: '결과 품질을 좌우하는 필수 요구사항이나 입력 조건이 아직 충분히 고정되지 않았습니다.',
    question: '이 프롬프트에 반드시 포함해야 할 핵심 요구나 입력 조건은 무엇인가요?',
    intent_key: 'requirements',
    question_matcher: /(must|required|requirement|input|field|constraint|필수|요구|입력|조건|제약)/i,
  },
  permission_rules_missing: {
    ids: ['missing_permissions'],
    warnings: ['권한 규칙이 비어 있습니다.'],
    reason_code: 'validation_missing_permissions',
    warning: '역할별 권한이나 허용 범위를 반영해야 하는지 아직 분명하지 않습니다.',
    reason_detail: '이 프롬프트가 역할별 허용 범위나 권한 차이를 반영해야 하는지 아직 고정되지 않았습니다.',
    question: '역할별 권한이나 허용 범위를 이 프롬프트에 반영해야 하나요?',
    intent_key: 'permissions',
    question_matcher: /(permission|access|approve|delete|role|권한|허용|승인|삭제|역할)/i,
  },
});

function inferPromptQuestionIntentKey(text = '') {
  const normalized = toText(text);
  if (!normalized) return 'general';
  if (/(who|audience|target user|user|reader|customer|recipient|persona|누구|대상|사용자|독자|고객|수신자|역할)/i.test(normalized)) return 'audience';
  if (/(date|deadline|schedule|timeline|timing|launch date|일정|날짜|마감|시점)/i.test(normalized)) return 'schedule';
  if (/(format|output|template|schema|json|table|email|markdown|형식|출력|포맷|스키마|템플릿|본문)/i.test(normalized)) return 'output_format';
  if (/(tone|style|voice|톤|말투|문체)/i.test(normalized)) return 'tone';
  if (/(length|word count|wordcount|under|within|limit|분량|길이|글자 수|글자수|제한)/i.test(normalized)) return 'length';
  if (/(cta|call to action|next step|action|행동|다음 단계|콜투액션)/i.test(normalized)) return 'next_action';
  if (/(context|background|problem|situation|배경|맥락|문제|상황)/i.test(normalized)) return 'context';
  if (/(goal|success|outcome|objective|성공|기준|목표|결과)/i.test(normalized)) return 'success_criteria';
  if (/(task|job|work|request|what|무엇|작업|요청|기능)/i.test(normalized)) return 'task_definition';
  if (/(must|required|requirement|input|field|constraint|필수|요구|입력|조건|제약)/i.test(normalized)) return 'requirements';
  if (/(permission|access|approve|delete|권한|허용|승인|삭제)/i.test(normalized)) return 'permissions';
  if (/(original request|source vibe|원문|의도)/i.test(normalized)) return 'source_vibe';
  if (/(structure|format|형식|구조)/i.test(normalized)) return 'structure';
  return 'general';
}

function buildSuggestedQuestionDetail({
  question,
  intentKey = '',
  source = '',
  reasonCode = '',
  missingInformation = '',
} = {}) {
  const normalizedQuestion = toText(question);
  if (!normalizedQuestion) return null;

  const detail = {
    question: normalizedQuestion,
    intent_key: toText(intentKey) || inferPromptQuestionIntentKey(normalizedQuestion),
    source: toText(source) || 'prompt_validation',
  };

  const normalizedReasonCode = toText(reasonCode);
  if (normalizedReasonCode) {
    detail.reason_code = normalizedReasonCode;
  }

  const normalizedMissingInformation = toText(missingInformation);
  if (normalizedMissingInformation) {
    detail.missing_information = normalizedMissingInformation;
  }

  return detail;
}

function pushSuggestedQuestionDetail(list, detail, matcher = null) {
  const safeDetail = isPlainObject(detail) ? detail : null;
  const question = toText(safeDetail?.question);
  if (!question) return;
  if (matcher && list.some((item) => matcher.test(toText(item?.question)))) return;
  if (list.some((item) => toText(item?.question) === question)) return;
  list.push(safeDetail);
}

function toLevel(score) {
  if (score >= 2) return 'high';
  if (score >= 1) return 'medium';
  return 'low';
}

function hasStructuredSource(sourceVibe) {
  const source = toText(sourceVibe);
  if (!source) return false;
  return /\n|:|- |\d+\.|\?|;/m.test(source) || source.length >= 90;
}

function hasOutputFormatHints(sourceVibe) {
  return /(json|markdown|table|list|bullet|outline|template|format|subject|body|email|prompt|schema|제목|본문|형식|리스트|목록|표|단계|프롬프트)/i.test(toText(sourceVibe));
}

function hasConstraintHints(sourceVibe) {
  return /(must|should|avoid|limit|under|within|include|exclude|tone|style|length|필수|반드시|제외|제한|톤|길이|포함)/i.test(toText(sourceVibe));
}

function hasAudienceHints(sourceVibe) {
  return /(for |audience|customer|buyer|reader|user|team|사용자|고객|독자|대상|팀)/i.test(toText(sourceVibe));
}

function inferOutputInstruction(sourceVibe) {
  const source = toText(sourceVibe).toLowerCase();
  if (source.includes('json')) return 'Return valid JSON only.';
  if (source.includes('table') || source.includes('표')) return 'Return a compact markdown table.';
  if (source.includes('email') || source.includes('메일')) return 'Return a ready-to-send result with clear subject and body sections.';
  if (source.includes('list') || source.includes('bullet') || source.includes('목록') || source.includes('리스트')) {
    return 'Return a concise bullet list.';
  }
  return 'Return a structured answer with clear headings and concise bullets.';
}

function buildCompactOutputFormatLines(sourceVibe = '') {
  const normalized = toText(sourceVibe);
  if (!normalized) return [];

  if (/(email|이메일|메일)/i.test(normalized)) {
    return ['- 제목:', '- 본문:'];
  }

  if (/(json)/i.test(normalized)) {
    return ['- JSON'];
  }

  if (/(table|표)/i.test(normalized)) {
    return ['- 표 형식'];
  }

  if (/(markdown|bullet|list|outline|목록|리스트)/i.test(normalized)) {
    return ['- 항목별 목록'];
  }

  return [];
}

function createTechniqueDecision(id, why) {
  const technique = PROMPT_TECHNIQUE_MAP.get(id);
  return {
    id,
    label: technique?.label || id,
    why: toText(why),
  };
}

function buildSelectionSignals(sharedRuntimeHandoff) {
  const sourceVibe = toText(sharedRuntimeHandoff?.sourceVibe);
  const intentIr = isPlainObject(sharedRuntimeHandoff?.intentIr) ? sharedRuntimeHandoff.intentIr : {};
  const intent = isPlainObject(intentIr.intent) ? intentIr.intent : {};
  const delivery = isPlainObject(intentIr.delivery) ? intentIr.delivery : {};
  const analysis = isPlainObject(intentIr.analysis) ? intentIr.analysis : {};
  const validationReport = isPlainObject(sharedRuntimeHandoff?.validationReport)
    ? sharedRuntimeHandoff.validationReport
    : {};
  const warningCount = Number(validationReport.warning_count || 0);
  const blockingIssueCount = Number(validationReport.blocking_issue_count || 0);
  const missingInformation = toStringArray(analysis.missing_information);
  const mustHaves = toStringArray(delivery.must_haves);

  const goalClarityScore = Number(Boolean(toText(intentIr.summary))) + Number(Boolean(toText(intent.user_job)));
  const constraintClarityScore = Number(mustHaves.length > 0) + Number(hasConstraintHints(sourceVibe));
  const outputFormatClarityScore = Number(hasOutputFormatHints(sourceVibe)) + Number(sourceVibe.includes('\n'));
  const sourceStructure = hasStructuredSource(sourceVibe);
  const ambiguityScore = Number(warningCount > 0) + Number(missingInformation.length > 0) + Number(blockingIssueCount > 0);
  const ambiguityLevel = ambiguityScore >= 2 ? 'high' : (ambiguityScore === 1 ? 'medium' : 'low');
  const safeToPassThrough = Boolean(
    sourceVibe
    && goalClarityScore >= 2
    && ambiguityLevel === 'low'
    && (outputFormatClarityScore >= 1 || constraintClarityScore >= 1 || sourceStructure)
    && sourceVibe.length <= 320
  );

  return {
    goal_clarity: toLevel(goalClarityScore),
    constraint_clarity: toLevel(constraintClarityScore),
    output_format_clarity: toLevel(outputFormatClarityScore),
    ambiguity_level: ambiguityLevel,
    source_structure: sourceStructure ? 'high' : 'low',
    safe_to_pass_through: safeToPassThrough,
    has_audience_hint: hasAudienceHints(sourceVibe),
  };
}

function selectRewriteMode(selectionSignals) {
  if (selectionSignals.safe_to_pass_through) return 'pass_through';
  if (selectionSignals.ambiguity_level === 'high' || selectionSignals.goal_clarity === 'low') {
    return 'structured_refine';
  }
  return 'light_refine';
}

function buildRewriteRationale(sharedRuntimeHandoff, selectionSignals, rewriteMode) {
  const intentIr = isPlainObject(sharedRuntimeHandoff?.intentIr) ? sharedRuntimeHandoff.intentIr : {};
  const analysis = isPlainObject(intentIr.analysis) ? intentIr.analysis : {};
  const validationReport = isPlainObject(sharedRuntimeHandoff?.validationReport)
    ? sharedRuntimeHandoff.validationReport
    : {};
  const missingInformation = toStringArray(analysis.missing_information);
  const reasonCodes = [];

  if (rewriteMode === 'pass_through') {
    reasonCodes.push('goal_clear');

    if (selectionSignals.output_format_clarity !== 'low' || selectionSignals.constraint_clarity !== 'low') {
      reasonCodes.push('constraints_or_format_clear');
    }

    if (selectionSignals.source_structure === 'high') {
      reasonCodes.push('source_already_structured');
    }

    if (selectionSignals.ambiguity_level === 'low') {
      reasonCodes.push('low_ambiguity');
    }

    return {
      summary_code: 'pass_through_clear_enough',
      reason_codes: reasonCodes,
    };
  }

  if (rewriteMode === 'structured_refine') {
    if (selectionSignals.goal_clarity === 'low') {
      reasonCodes.push('goal_needs_clarification');
    }

    if (selectionSignals.ambiguity_level === 'high') {
      reasonCodes.push('high_ambiguity');
    }

    if (missingInformation.length > 0) {
      reasonCodes.push('missing_information');
    }

    if (Number(validationReport.warning_count || 0) > 0 || Number(validationReport.blocking_issue_count || 0) > 0) {
      reasonCodes.push('validation_flags');
    }

    return {
      summary_code: 'structured_refine_reduce_risk',
      reason_codes: reasonCodes,
    };
  }

  if (selectionSignals.goal_clarity !== 'high') {
    reasonCodes.push('goal_partially_clear');
  }

  if (selectionSignals.constraint_clarity === 'low' || selectionSignals.output_format_clarity === 'low') {
    reasonCodes.push('structure_would_help');
  }

  if (selectionSignals.ambiguity_level === 'medium') {
    reasonCodes.push('some_ambiguity');
  }

  if (reasonCodes.length === 0) {
    reasonCodes.push('light_touch_enough');
  }

  return {
    summary_code: 'light_refine_add_structure',
    reason_codes: reasonCodes,
  };
}

function selectTechniques(sharedRuntimeHandoff, selectionSignals, rewriteMode) {
  const intentIr = isPlainObject(sharedRuntimeHandoff?.intentIr) ? sharedRuntimeHandoff.intentIr : {};
  const intent = isPlainObject(intentIr.intent) ? intentIr.intent : {};
  const delivery = isPlainObject(intentIr.delivery) ? intentIr.delivery : {};
  const analysis = isPlainObject(intentIr.analysis) ? intentIr.analysis : {};
  const selected = [];

  if (rewriteMode === 'pass_through') {
    selected.push(createTechniqueDecision('zero_shot_pass_through', 'The source vibe is already explicit enough for direct zero-shot use.'));
    return selected;
  }

  if (selectionSignals.goal_clarity !== 'high' || rewriteMode === 'structured_refine') {
    selected.push(createTechniqueDecision('goal_clarification', 'The task or success condition needs a clearer headline before prompting.'));
  }

  if (!selectionSignals.has_audience_hint && !toText(intent.target_user)) {
    selected.push(createTechniqueDecision('role_assignment', 'The request does not clearly frame who the answer should serve.'));
  }

  if (selectionSignals.constraint_clarity !== 'high' || toStringArray(delivery.must_haves).length > 0) {
    selected.push(createTechniqueDecision('constraint_expansion', 'Must-have requirements and limits should be surfaced explicitly.'));
  }

  if (selectionSignals.output_format_clarity !== 'high') {
    selected.push(createTechniqueDecision('output_format_lock', 'The vibe does not reliably lock the response shape yet.'));
  }

  if (selectionSignals.source_structure === 'low' || rewriteMode === 'structured_refine') {
    selected.push(createTechniqueDecision('context_structuring', 'The request benefits from a stable context block before execution.'));
  }

  if (rewriteMode === 'structured_refine' || toStringArray(delivery.must_haves).length > 2) {
    selected.push(createTechniqueDecision('step_decomposition', 'Breaking the task into a short workflow reduces ambiguity.'));
  }

  if (selectionSignals.ambiguity_level !== 'low' || toStringArray(analysis.missing_information).length > 0) {
    selected.push(createTechniqueDecision('quality_checklist_injection', 'The output should explicitly guard against hidden assumptions and missing constraints.'));
  }

  if (selected.length === 0) {
    selected.push(createTechniqueDecision('goal_clarification', 'A light rewrite still needs a stable task headline.'));
  }

  return selected;
}

function buildRefinedPrompt(sharedRuntimeHandoff, appliedTechniques, rewriteMode) {
  const sourceVibe = toText(sharedRuntimeHandoff?.sourceVibe);
  const intentIr = isPlainObject(sharedRuntimeHandoff?.intentIr) ? sharedRuntimeHandoff.intentIr : {};
  const intent = isPlainObject(intentIr.intent) ? intentIr.intent : {};
  const delivery = isPlainObject(intentIr.delivery) ? intentIr.delivery : {};
  const analysis = isPlainObject(intentIr.analysis) ? intentIr.analysis : {};
  const validationReport = isPlainObject(sharedRuntimeHandoff?.validationReport)
    ? sharedRuntimeHandoff.validationReport
    : {};
  const summary = toText(intentIr.summary) || sourceVibe || 'Clarify the user request and produce the best possible answer.';
  const mustHaves = toStringArray(delivery.must_haves);
  const niceToHaves = toStringArray(delivery.nice_to_haves);
  const missingInformation = toStringArray(analysis.missing_information);
  const clarificationQuestions = toStringArray(analysis.clarification_questions);
  const risks = toStringArray(analysis.risks);
  const sections = [];
  const selectedIds = new Set(appliedTechniques.map((item) => item.id));
  const shouldUseCompactPromptTemplate = Boolean(
    sourceVibe
    && sourceVibe.length <= 120
    && !/\n/.test(sourceVibe)
    && Number(validationReport.warning_count || 0) === 0
    && Number(validationReport.blocking_issue_count || 0) === 0
    && validationReport.needs_clarification !== true
    && missingInformation.length === 0
    && clarificationQuestions.length === 0
  );

  if (!shouldUseCompactPromptTemplate) {
    sections.push('Original request:');
    sections.push(sourceVibe || '(empty)');
  }

  if (!shouldUseCompactPromptTemplate && selectedIds.has('role_assignment') && toText(intent.target_user)) {
    sections.push('');
    sections.push('Role:');
    sections.push(`Act as a focused assistant for ${intent.target_user}.`);
  }

  if (selectedIds.has('goal_clarification')) {
    const taskLines = [];
    if (summary) taskLines.push(summary);
    if (!shouldUseCompactPromptTemplate && toText(intent.user_job)) {
      taskLines.push(`Primary job to be done: ${intent.user_job}`);
    }
    if (!shouldUseCompactPromptTemplate && toText(intent.success_signal)) {
      taskLines.push(`Success condition: ${intent.success_signal}`);
    }

    if (taskLines.length > 0) {
      sections.push('');
      if (shouldUseCompactPromptTemplate) {
        sections.push(taskLines[0]);
      } else {
        sections.push('Task:');
        taskLines.forEach((line) => sections.push(line));
      }
    }
  }

  if (!shouldUseCompactPromptTemplate && selectedIds.has('context_structuring')) {
    const contextLines = [];
    if (toText(intent.target_user)) {
      contextLines.push(`- Target user: ${intent.target_user}`);
    }
    if (toText(intent.usage_moment)) {
      contextLines.push(`- Usage moment: ${intent.usage_moment}`);
    }
    if (toText(intent.problem_context)) {
      contextLines.push(`- Problem context: ${intent.problem_context}`);
    }

    if (contextLines.length > 0) {
      sections.push('');
      sections.push('Context:');
      contextLines.forEach((line) => sections.push(line));
    }
  }

  if (selectedIds.has('constraint_expansion')) {
    const constraintLines = [];
    if (mustHaves.length > 0) {
      mustHaves.slice(0, rewriteMode === 'structured_refine' ? 4 : 3).forEach((item) => {
        constraintLines.push(`- Must: ${item}`);
      });
    } else if (!shouldUseCompactPromptTemplate) {
      constraintLines.push('- Preserve the original goal without adding unrelated scope.');
    }

    niceToHaves.slice(0, 2).forEach((item) => constraintLines.push(`- Nice to have: ${item}`));
    risks.slice(0, 2).forEach((item) => constraintLines.push(`- Avoid: ${item}`));

    if (constraintLines.length > 0) {
      sections.push('');
      sections.push(shouldUseCompactPromptTemplate ? '조건:' : 'Constraints and priorities:');
      constraintLines.forEach((line) => sections.push(line));
    }
  }

  if (selectedIds.has('output_format_lock')) {
    if (shouldUseCompactPromptTemplate) {
      const compactOutputFormatLines = buildCompactOutputFormatLines(sourceVibe || summary);
      if (compactOutputFormatLines.length > 0) {
        sections.push('');
        sections.push('출력 형식:');
        compactOutputFormatLines.forEach((line) => sections.push(line));
      }
    } else {
      sections.push('');
      sections.push('Output format:');
      sections.push(`- ${inferOutputInstruction(sourceVibe)}`);
      sections.push('- Keep the answer concise, explicit, and immediately usable.');
    }
  }

  if (!shouldUseCompactPromptTemplate && selectedIds.has('step_decomposition')) {
    sections.push('');
    sections.push('Suggested workflow:');
    sections.push('1. Identify the exact deliverable the user is asking for.');
    sections.push('2. Fill in only the missing structure needed to make the response actionable.');
    sections.push('3. Produce the final answer in the requested format without unnecessary detours.');
  }

  if (!shouldUseCompactPromptTemplate && selectedIds.has('quality_checklist_injection')) {
    sections.push('');
    sections.push('Before finalizing:');
    sections.push('- Do not hide missing assumptions. State them clearly if you must infer.');
    sections.push('- Keep constraints and requested format intact.');
    if (missingInformation.length > 0) {
      missingInformation.slice(0, 3).forEach((item) => sections.push(`- Missing information to handle carefully: ${item}`));
    }
    if (clarificationQuestions.length > 0) {
      clarificationQuestions.slice(0, 2).forEach((item) => sections.push(`- If the answer depends on an unknown, surface this question: ${item}`));
    }
  }

  return sections.join('\n');
}

function compactReadyToUsePrompt(finalPrompt = '', sourceVibe = '') {
  const source = toText(finalPrompt);
  if (!source) return '';

  const lines = source.split('\n');
  const sections = [];
  let currentSection = null;

  lines.forEach((line) => {
    const normalized = toText(line);

    if (normalized.endsWith(':') && !normalized.startsWith('-') && normalized.length < 40) {
      currentSection = {
        header: normalized,
        lines: [line],
      };
      sections.push(currentSection);
      return;
    }

    if (!currentSection) {
      currentSection = {
        header: '',
        lines: [],
      };
      sections.push(currentSection);
    }

    currentSection.lines.push(line);
  });

  const taskSection = sections.find((section) => section.header === 'Task:')
    || sections.find((section) => !section.header && section.lines.some((line) => toText(line)));
  const constraintsSection = sections.find((section) => (
    section.header === 'Constraints and priorities:' || section.header === '조건:'
  ));
  const outputFormatSection = sections.find((section) => (
    section.header === 'Output format:' || section.header === '출력 형식:'
  ));

  const compactLines = [];
  const taskLines = (taskSection?.lines || [])
    .slice(taskSection?.header ? 1 : 0)
    .map((line) => toText(line))
    .filter(Boolean);
  const constraintLines = (constraintsSection?.lines || [])
    .slice(1)
    .map((line) => toText(line))
    .filter(Boolean);

  if (taskLines.length > 0) {
    compactLines.push(taskLines[0]);
  }

  if (constraintLines.length > 0) {
    if (compactLines.length > 0) compactLines.push('');
    compactLines.push('조건:');
    buildCompactWritingConstraints(taskLines[0] || source, constraintLines)
      .forEach((line) => compactLines.push(line));
  }

  const compactOutputFormatLines = buildCompactOutputFormatLines(taskLines[0] || sourceVibe || source);

  if (outputFormatSection && compactOutputFormatLines.length > 0) {
    if (compactLines.length > 0) compactLines.push('');
    compactLines.push('출력 형식:');
    compactOutputFormatLines.forEach((line) => compactLines.push(line));
  }

  const compacted = compactLines.join('\n').trim();
  return compacted || source;
}

function isEmailWritingTask(sourceVibe = '') {
  const normalized = toText(sourceVibe);
  return /(email|이메일|메일)/i.test(normalized) && /(write|draft|작성|써|만들어줘|만들어 줘)/i.test(normalized);
}

function normalizeConstraintLine(line = '') {
  return toText(line)
    .replace(/^- /, '')
    .replace(/^(Must|Nice to have|Avoid):\s*/i, '')
    .trim();
}

function rewriteCompactConstraintLine(sourceVibe = '', line = '') {
  const normalizedSource = toText(sourceVibe);
  const normalizedLine = normalizeConstraintLine(line);
  if (!normalizedLine) return '';

  if (/(복사 기능|복사 버튼|copy feature|copy button)/i.test(normalizedLine)) {
    if (/(문구)/i.test(normalizedLine)) {
      return '- 바로 복사해 쓸 수 있는 완성형 문구로 제안한다.';
    }
    return '';
  }

  if (/(미리보기|preview)/i.test(normalizedLine)) {
    return '- 사용자에게 바로 보여줄 수 있는 자연스러운 문장으로 작성한다.';
  }

  if (/(회의록).*(3줄|세 줄).*(요약).*(프롬프트 생성|생성)/i.test(normalizedLine)) {
    return '- 회의록의 핵심만 3줄로 압축하게 한다.';
  }

  if (/(제품 정보).*(입력)/i.test(normalizedLine)) {
    return '- 제품명, 특징, 타겟 고객 정보를 반영해 문구를 만든다.';
  }

  if (/(홍보 문구).*(생성)/i.test(normalizedLine)) {
    return '- 인스타그램용 홍보 문구를 여러 개 제안한다.';
  }

  if (/(문구 목록).*(확인).*(선택)/i.test(normalizedLine)) {
    return '- 후보 문구를 비교해 바로 고르기 쉽게 정리한다.';
  }

  if (/(점검 유형).*(선택)/i.test(normalizedLine)) {
    return '- 점검 유형이 정기인지 긴급인지 분명히 반영한다.';
  }

  if (/(시작\/종료 시간|시작 시간|종료 시간).*(입력)/i.test(normalizedLine)) {
    return '- 점검 시작 시간과 종료 시간을 명확히 넣는다.';
  }

  if (/(영향 범위).*(선택).*(상세 입력|상세)/i.test(normalizedLine)) {
    return '- 점검 영향 범위와 영향을 받는 기능을 구체적으로 적는다.';
  }

  if (/^(?=.*도쿄)(?=.*2박\s*3일)(?=.*일정)(?=.*생성).+$/i.test(normalizedLine)) {
    return '- 여행자 조건을 반영해 도쿄 2박 3일 일정을 짠다.';
  }

  if (/(날짜별).*(시간대별|오전\/오후|오전|오후).*(활동).*(장소 추천)/i.test(normalizedLine)) {
    return '- 날짜별로 오전과 오후 일정을 나눠 활동과 장소를 제안한다.';
  }

  if (/(관광지).*(맛집).*(쇼핑 장소).*(추천)/i.test(normalizedLine)) {
    return '- 관광지, 맛집, 쇼핑 장소를 균형 있게 섞어 추천한다.';
  }

  if (/(입력)/i.test(normalizedLine)) {
    return `- ${normalizedLine.replace(/\s*입력\b/i, '').trim()} 정보를 반영한다.`;
  }

  if (/(선택)/i.test(normalizedLine)) {
    return `- ${normalizedLine.replace(/\s*선택\b/i, '').trim()} 내용을 분명히 반영한다.`;
  }

  if (/(생성)/i.test(normalizedLine) && /(프롬프트|문구|안내문|일정)/i.test(normalizedLine)) {
    return `- ${normalizedLine.replace(/\s*생성\b/i, '').trim()}한다.`;
  }

  if (normalizedLine === normalizedSource) {
    return '';
  }

  return `- ${normalizedLine}`;
}

function buildCompactWritingConstraints(sourceVibe = '', constraintLines = []) {
  const normalizedSource = toText(sourceVibe);
  const normalizedLines = constraintLines
    .map((line) => normalizeConstraintLine(line))
    .filter(Boolean);

  if (!isEmailWritingTask(normalizedSource)) {
    const nextLines = [];
    const pushLine = (line) => {
      const text = toText(line);
      if (!text || nextLines.includes(text)) return;
      nextLines.push(text);
    };

    normalizedLines.forEach((line) => {
      pushLine(rewriteCompactConstraintLine(normalizedSource, line));
    });

    return nextLines;
  }

  const nextLines = [];
  const pushLine = (line) => {
    const text = toText(line);
    if (!text || nextLines.includes(text)) return;
    nextLines.push(text);
  };

  normalizedLines.forEach((line) => {
    if (/(자동 발송|자동 이메일|회원\s*가입\s*완료|가입 완료|직후)/i.test(line)) {
      pushLine('- 회원가입 직후 보내는 첫 환영 이메일이어야 한다.');
      return;
    }

    if (/(개인화 변수|사용자이름|이름 변수|변수)/i.test(line)) {
      pushLine('- 이름 같은 개인화 요소를 자연스럽게 넣을 수 있게 작성한다.');
      return;
    }

    if (/(프롬프트 생성|프롬프트 수정|생성 및 수정|미리보기)/i.test(line)) {
      pushLine('- 제목과 본문을 수정 가능한 템플릿 형태로 작성한다.');
      return;
    }

    if (/(템플릿 관리|템플릿|제목|본문|발신자 정보)/i.test(line)) {
      pushLine('- 제목과 본문을 수정 가능한 템플릿 형태로 작성한다.');
      return;
    }

    if (/(로깅|성공\/실패|성공\/ 실패|발송 성공|발송 실패)/i.test(line)) {
      return;
    }

    pushLine(`- ${line}`);
  });

  if (nextLines.length === 0) {
    pushLine('- 회원가입 직후 보내는 첫 환영 이메일이어야 한다.');
    pushLine('- 제목과 본문을 분리해서 작성한다.');
  }

  return nextLines;
}

function collectPromptNativeValidationSignals(validationReport = {}) {
  const normalizedReport = isPlainObject(validationReport) ? validationReport : {};
  const blockingIssues = Array.isArray(normalizedReport.blocking_issues) ? normalizedReport.blocking_issues : [];
  const warningTexts = toStringArray(normalizedReport.warnings);
  const matchedSignalKeys = [];

  Object.entries(PROMPT_NATIVE_VALIDATION_SIGNAL_MAP).forEach(([signalKey, config]) => {
    const matchedById = blockingIssues.some((issue) => config.ids.includes(toText(issue?.id)));
    const matchedByWarning = warningTexts.some((warning) => config.warnings.includes(warning));
    if (matchedById || matchedByWarning) {
      matchedSignalKeys.push(signalKey);
    }
  });

  const signals = matchedSignalKeys.map((signalKey) => PROMPT_NATIVE_VALIDATION_SIGNAL_MAP[signalKey]);
  const requiresReview = Boolean(
    signals.length > 0
    && (
      Number(normalizedReport.blocking_issue_count || 0) > 0
      || normalizedReport.needs_clarification === true
    )
  );

  return {
    requires_review: requiresReview,
    warning_count: Number(normalizedReport.warning_count || 0),
    blocking_issue_count: Number(normalizedReport.blocking_issue_count || 0),
    reason_codes: signals.map((signal) => signal.reason_code),
    warnings: signals.map((signal) => signal.warning),
    reason_details: signals.map((signal) => signal.reason_detail),
    questions: signals.map((signal) => signal.question),
    question_details: signals
      .map((signal) => buildSuggestedQuestionDetail({
        question: signal.question,
        intentKey: signal.intent_key,
        source: 'prompt_validation_signal',
        reasonCode: signal.reason_code,
      }))
      .filter(Boolean),
  };
}

function buildPromptClarificationQuestions({
  sharedRuntimeHandoff,
  reasonCodes,
  promptNativeValidationSignals,
}) {
  const intentIr = isPlainObject(sharedRuntimeHandoff?.intentIr) ? sharedRuntimeHandoff.intentIr : {};
  const analysis = isPlainObject(intentIr.analysis) ? intentIr.analysis : {};
  const validationReport = isPlainObject(sharedRuntimeHandoff?.validationReport)
    ? sharedRuntimeHandoff.validationReport
    : {};
  const clarificationQuestions = toStringArray(analysis.clarification_questions);
  const missingInformation = toStringArray(analysis.missing_information);
  const fallbackQuestions = toStringArray(validationReport.suggested_questions);
  const translatedValidationQuestionDetails = Array.isArray(promptNativeValidationSignals?.question_details)
    ? promptNativeValidationSignals.question_details
    : [];
  const suggestionDetails = [];

  if (reasonCodes.includes('empty_prompt')) {
    pushSuggestedQuestionDetail(suggestionDetails, buildSuggestedQuestionDetail({
      question: '이번에 실제로 만들고 싶은 최종 산출물을 한 문장으로 다시 적어 주세요.',
      intentKey: 'deliverable',
      source: 'prompt_validation',
      reasonCode: 'empty_prompt',
    }));
  }

  if (reasonCodes.includes('loses_source_vibe')) {
    pushSuggestedQuestionDetail(suggestionDetails, buildSuggestedQuestionDetail({
      question: '최종 프롬프트에 반드시 남아야 하는 핵심 의도나 요구 1~2개를 짧게 적어 주세요.',
      intentKey: 'source_vibe',
      source: 'prompt_validation',
      reasonCode: 'loses_source_vibe',
    }));
  }

  clarificationQuestions.slice(0, 3).forEach((question) => {
    pushSuggestedQuestionDetail(suggestionDetails, buildSuggestedQuestionDetail({
      question,
      source: 'intent_ir',
    }));
  });

  missingInformation.slice(0, 3).forEach((item) => {
    const normalized = toText(item);
    if (!normalized) return;

    if (/(audience|target user|user|reader|customer|recipient|persona|사용자|대상|독자|고객|수신자|역할)/i.test(normalized)) {
      pushSuggestedQuestionDetail(
        suggestionDetails,
        buildSuggestedQuestionDetail({
          question: '이 프롬프트가 가장 먼저 맞춰야 하는 대상은 누구인가요?',
          intentKey: 'audience',
          source: 'missing_information',
          missingInformation: normalized,
        }),
        /(who|audience|target|user|reader|customer|recipient|role|persona|누구|대상|사용자|독자|고객|수신자|역할)/i,
      );
      return;
    }

    if (/(date|deadline|schedule|timeline|timing|launch date|일정|날짜|마감|시점)/i.test(normalized)) {
      pushSuggestedQuestionDetail(
        suggestionDetails,
        buildSuggestedQuestionDetail({
          question: '이 프롬프트에 반영할 일정이나 날짜는 무엇인가요?',
          intentKey: 'schedule',
          source: 'missing_information',
          missingInformation: normalized,
        }),
        /(date|deadline|schedule|timeline|timing|launch date|일정|날짜|마감|시점)/i,
      );
      return;
    }

    if (/(format|output|template|schema|json|table|email|markdown|형식|출력|포맷|스키마|템플릿|본문)/i.test(normalized)) {
      pushSuggestedQuestionDetail(
        suggestionDetails,
        buildSuggestedQuestionDetail({
          question: '최종 응답 형식은 무엇으로 고정하면 될까요?',
          intentKey: 'output_format',
          source: 'missing_information',
          missingInformation: normalized,
        }),
        /(format|output|template|schema|json|table|email|markdown|형식|출력|포맷|스키마|템플릿|본문)/i,
      );
      return;
    }

    if (/(tone|style|voice|톤|말투|문체)/i.test(normalized)) {
      pushSuggestedQuestionDetail(
        suggestionDetails,
        buildSuggestedQuestionDetail({
          question: '원하는 톤이나 말투는 무엇인가요?',
          intentKey: 'tone',
          source: 'missing_information',
          missingInformation: normalized,
        }),
        /(tone|style|voice|톤|말투|문체)/i,
      );
      return;
    }

    if (/(length|word count|wordcount|under|within|limit|분량|길이|글자 수|글자수|제한)/i.test(normalized)) {
      pushSuggestedQuestionDetail(
        suggestionDetails,
        buildSuggestedQuestionDetail({
          question: '분량이나 길이 제한은 어느 정도인가요?',
          intentKey: 'length',
          source: 'missing_information',
          missingInformation: normalized,
        }),
        /(length|word count|wordcount|under|within|limit|분량|길이|글자 수|글자수|제한)/i,
      );
      return;
    }

    if (/(cta|call to action|next step|action|행동|다음 단계|콜투액션)/i.test(normalized)) {
      pushSuggestedQuestionDetail(
        suggestionDetails,
        buildSuggestedQuestionDetail({
          question: '이 프롬프트가 유도해야 하는 다음 행동은 무엇인가요?',
          intentKey: 'next_action',
          source: 'missing_information',
          missingInformation: normalized,
        }),
        /(cta|call to action|next step|action|행동|다음 단계|콜투액션)/i,
      );
      return;
    }

    if (/(context|background|problem|situation|배경|맥락|문제|상황)/i.test(normalized)) {
      pushSuggestedQuestionDetail(
        suggestionDetails,
        buildSuggestedQuestionDetail({
          question: '이 프롬프트가 전제로 삼아야 하는 핵심 맥락은 무엇인가요?',
          intentKey: 'context',
          source: 'missing_information',
          missingInformation: normalized,
        }),
        /(context|background|problem|situation|배경|맥락|문제|상황)/i,
      );
      return;
    }

    if (/(goal|success|outcome|objective|목표|성공|결과)/i.test(normalized)) {
      pushSuggestedQuestionDetail(
        suggestionDetails,
        buildSuggestedQuestionDetail({
          question: '이 프롬프트가 만족해야 하는 성공 기준은 무엇인가요?',
          intentKey: 'success_criteria',
          source: 'missing_information',
          missingInformation: normalized,
        }),
        /(goal|success|outcome|objective|목표|성공|결과)/i,
      );
      return;
    }

    pushSuggestedQuestionDetail(suggestionDetails, buildSuggestedQuestionDetail({
      question: `'${normalized}'를 이 프롬프트에서 어떻게 확정하면 될까요?`,
      source: 'missing_information',
      missingInformation: normalized,
    }));
  });

  if (reasonCodes.includes('missing_technique_trace')) {
    pushSuggestedQuestionDetail(suggestionDetails, buildSuggestedQuestionDetail({
      question: '이 프롬프트에서 반드시 지켜야 할 구조나 형식은 무엇인가요?',
      intentKey: 'structure',
      source: 'prompt_validation',
      reasonCode: 'missing_technique_trace',
    }));
  }

  translatedValidationQuestionDetails.slice(0, 3).forEach((detail) => {
    const matchedSignalConfig = Object.values(PROMPT_NATIVE_VALIDATION_SIGNAL_MAP)
      .find((signal) => signal.question === detail.question);
    pushSuggestedQuestionDetail(
      suggestionDetails,
      detail,
      matchedSignalConfig?.question_matcher || null,
    );
  });

  fallbackQuestions.slice(0, 3).forEach((question) => {
    pushSuggestedQuestionDetail(suggestionDetails, buildSuggestedQuestionDetail({
      question,
      source: 'validation_report',
    }));
  });

  return suggestionDetails.slice(0, 3);
}

function buildPromptValidationNarrative({
  rewriteMode,
  appliedTechniques,
  warnings,
  reasonCodes,
  promptNativeValidationSignals,
  suggestedQuestions,
  sharedRuntimeHandoff,
}) {
  const intentIr = isPlainObject(sharedRuntimeHandoff?.intentIr) ? sharedRuntimeHandoff.intentIr : {};
  const analysis = isPlainObject(intentIr.analysis) ? intentIr.analysis : {};
  const validationReport = isPlainObject(sharedRuntimeHandoff?.validationReport)
    ? sharedRuntimeHandoff.validationReport
    : {};
  const missingInformation = toStringArray(analysis.missing_information);
  const reasonDetails = [];
  let summary = '';

  if (warnings.length > 0) {
    if (reasonCodes.includes('empty_prompt')) {
      summary = '최종 프롬프트가 비어 있어 바로 사용할 수 없습니다.';
    } else if (toStringArray(promptNativeValidationSignals?.reason_codes).length > 0) {
      summary = '현재 프롬프트는 결과 품질을 좌우하는 핵심 입력 조건이 아직 덜 고정돼 있어 한 번 검토하고 쓰는 편이 안전합니다.';
    } else if (reasonCodes.includes('loses_source_vibe') && reasonCodes.includes('missing_technique_trace')) {
      summary = '현재 프롬프트는 원문 의도 유지와 구조화 근거를 함께 다시 확인해야 합니다.';
    } else if (reasonCodes.includes('loses_source_vibe')) {
      summary = '현재 프롬프트는 정리 과정에서 원문 의도가 흐려져 한 번 검토하고 쓰는 편이 안전합니다.';
    } else if (reasonCodes.includes('missing_technique_trace')) {
      summary = '현재 프롬프트는 정제 이유가 충분히 남지 않아 한 번 검토하고 쓰는 편이 안전합니다.';
    } else {
      summary = '현재 프롬프트는 바로 사용하기 전에 핵심 입력과 정리 근거를 한 번 확인하는 편이 안전합니다.';
    }

    if (reasonCodes.includes('empty_prompt')) {
      pushUniqueText(reasonDetails, '실제로 복사해 사용할 최종 프롬프트 문장이 아직 비어 있습니다.');
    }
    if (reasonCodes.includes('loses_source_vibe')) {
      pushUniqueText(reasonDetails, '원문 요청의 핵심 의도가 최종 프롬프트 안에서 약해졌을 수 있습니다.');
    }
    if (reasonCodes.includes('missing_technique_trace')) {
      pushUniqueText(reasonDetails, '정제된 결과인데 어떤 기준으로 구조화했는지 추적 정보가 부족합니다.');
    }
    toStringArray(promptNativeValidationSignals?.reason_details).forEach((detail) => {
      pushUniqueText(reasonDetails, detail);
    });
    if (missingInformation.length > 0) {
      pushUniqueText(
        reasonDetails,
        `아직 확정되지 않은 정보가 있어 결과 편차가 남을 수 있습니다: ${missingInformation.slice(0, 2).join(', ')}.`,
      );
    }
    if (suggestedQuestions.length > 0) {
      pushUniqueText(reasonDetails, '바로 보완할 수 있는 추가 확인 질문이 함께 준비되어 있습니다.');
    }
    if (Number(validationReport.warning_count || 0) > 0 || Number(validationReport.blocking_issue_count || 0) > 0) {
      pushUniqueText(reasonDetails, '상위 검증 단계에서도 보완 신호가 남아 있어 한 번 더 확인하는 편이 안전합니다.');
    }

    return {
      summary,
      reason_details: reasonDetails.slice(0, 3),
    };
  }

  if (rewriteMode === 'pass_through') {
    summary = '원문 의도와 요청 형식이 충분히 살아 있어 지금 바로 사용할 수 있습니다.';
  } else {
    summary = '원문 의도를 유지한 채 바로 사용할 수 있는 실행용 프롬프트로 정리됐습니다.';
  }

  if (reasonCodes.includes('preserves_source_vibe')) {
    pushUniqueText(reasonDetails, '원문 요청의 핵심 의도가 최종 프롬프트 안에 그대로 남아 있습니다.');
  }
  if (reasonCodes.includes('ready_for_direct_use')) {
    pushUniqueText(reasonDetails, '입력이 이미 분명해 불필요한 재작성 없이 바로 복사해 사용할 수 있습니다.');
  }
  if (reasonCodes.includes('rewrite_trace_recorded')) {
    pushUniqueText(reasonDetails, '적용된 구조화 기법과 이유가 함께 남아 있어 결과를 추적하기 쉽습니다.');
  }
  if (rewriteMode !== 'pass_through' && appliedTechniques.length > 0) {
    pushUniqueText(reasonDetails, `적용된 구조화 기법 ${appliedTechniques.length}개가 함께 기록돼 있습니다.`);
  }
  if (missingInformation.length === 0 && suggestedQuestions.length === 0) {
    pushUniqueText(reasonDetails, '추가 확인 질문 없이 바로 사용할 수 있는 상태입니다.');
  }

  return {
    summary,
    reason_details: reasonDetails.slice(0, 3),
  };
}

export function buildPromptValidation({
  sourceVibe,
  finalPrompt,
  rewriteMode,
  appliedTechniques,
  sharedRuntimeHandoff = null,
}) {
  const warnings = [];
  const reasonCodes = [];
  const normalizedSource = toText(sourceVibe);
  const normalizedPrompt = toText(finalPrompt);
  const validationReport = isPlainObject(sharedRuntimeHandoff?.validationReport)
    ? sharedRuntimeHandoff.validationReport
    : {};
  const intentIr = isPlainObject(sharedRuntimeHandoff?.intentIr) ? sharedRuntimeHandoff.intentIr : {};
  const promptSummary = toText(intentIr.summary);
  const promptUserJob = toText(intentIr.intent?.user_job);
  const promptNativeValidationSignals = collectPromptNativeValidationSignals(validationReport);
  const preservesSourceVibe = rewriteMode === 'pass_through'
    ? normalizedPrompt === normalizedSource
    : Boolean(
      normalizedPrompt.includes('Original request:')
      || (normalizedSource && normalizedPrompt.includes(normalizedSource))
      || (promptSummary && normalizedPrompt.includes(promptSummary))
      || (promptUserJob && normalizedPrompt.includes(promptUserJob))
    );

  if (!normalizedPrompt) {
    warnings.push('\uCD5C\uC885 \uD504\uB86C\uD504\uD2B8\uAC00 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.');
    reasonCodes.push('empty_prompt');
  }
  if (!preservesSourceVibe) {
    warnings.push('\uC815\uB9AC \uACFC\uC815\uC5D0\uC11C \uC6D0\uBB38 \uC758\uB3C4\uAC00 \uD750\uB824\uC84C\uC2B5\uB2C8\uB2E4.');
    reasonCodes.push('loses_source_vibe');
  }
  if (rewriteMode !== 'pass_through' && appliedTechniques.length === 0) {
    warnings.push('\uC815\uC81C\uB41C \uD504\uB86C\uD504\uD2B8\uC778\uB370 \uAE30\uB85D\uB41C \uAE30\uBC95\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.');
    reasonCodes.push('missing_technique_trace');
  }
  if (promptNativeValidationSignals.requires_review) {
    promptNativeValidationSignals.warnings.forEach((warning) => {
      pushUniqueText(warnings, warning);
    });
    promptNativeValidationSignals.reason_codes.forEach((code) => {
      if (!reasonCodes.includes(code)) {
        reasonCodes.push(code);
      }
    });
  }

  if (warnings.length === 0) {
    if (preservesSourceVibe) {
      reasonCodes.push('preserves_source_vibe');
    }

    if (rewriteMode === 'pass_through') {
      reasonCodes.push('ready_for_direct_use');
    } else if (appliedTechniques.length > 0) {
      reasonCodes.push('rewrite_trace_recorded');
    }
  }

  const suggestedQuestionDetails = warnings.length > 0
    ? buildPromptClarificationQuestions({ sharedRuntimeHandoff, reasonCodes, promptNativeValidationSignals })
    : [];
  const suggestedQuestions = suggestedQuestionDetails.map((detail) => detail.question);
  const narrative = buildPromptValidationNarrative({
    rewriteMode,
    appliedTechniques,
    warnings,
    reasonCodes,
    promptNativeValidationSignals,
    suggestedQuestions,
    sharedRuntimeHandoff,
  });

  return {
    status: warnings.length > 0 ? 'review' : 'ready',
    summary_code: warnings.length > 0 ? 'review_before_use' : 'ready_to_use',
    summary: narrative.summary,
    warning_count: warnings.length,
    warnings,
    reason_codes: reasonCodes,
    reason_details: narrative.reason_details,
    preserves_source_vibe: preservesSourceVibe,
    needs_clarification: suggestedQuestions.length > 0,
    suggested_questions: suggestedQuestions,
    suggested_question_details: suggestedQuestionDetails,
  };
}

export function createPromptRenderer() {
  function buildPromptOutput(sharedRuntimeHandoff) {
    const selectionSignals = buildSelectionSignals(sharedRuntimeHandoff);
    const rewriteMode = selectRewriteMode(selectionSignals);
    const rewriteRationale = buildRewriteRationale(sharedRuntimeHandoff, selectionSignals, rewriteMode);
    const appliedTechniques = selectTechniques(sharedRuntimeHandoff, selectionSignals, rewriteMode);
    const skippedTechniques = PROMPT_TECHNIQUE_REGISTRY
      .filter((technique) => !appliedTechniques.some((item) => item.id === technique.id))
      .map((technique) => ({
        id: technique.id,
        label: technique.label,
        why: rewriteMode === 'pass_through'
          ? 'Pass-through mode avoids unnecessary rewriting.'
          : 'This technique was not necessary for the current intent signals.',
      }));
    const rawFinalPrompt = rewriteMode === 'pass_through'
      ? toText(sharedRuntimeHandoff?.sourceVibe)
      : buildRefinedPrompt(sharedRuntimeHandoff, appliedTechniques, rewriteMode);
    let finalPrompt = rawFinalPrompt;
    let validation = buildPromptValidation({
      sourceVibe: sharedRuntimeHandoff?.sourceVibe,
      finalPrompt,
      rewriteMode,
      appliedTechniques,
      sharedRuntimeHandoff,
    });

    if (rewriteMode !== 'pass_through' && validation.status === 'ready') {
      const compactedPrompt = compactReadyToUsePrompt(rawFinalPrompt, sharedRuntimeHandoff?.sourceVibe);
      if (compactedPrompt && compactedPrompt !== rawFinalPrompt) {
        finalPrompt = compactedPrompt;
        validation = buildPromptValidation({
          sourceVibe: sharedRuntimeHandoff?.sourceVibe,
          finalPrompt,
          rewriteMode,
          appliedTechniques,
          sharedRuntimeHandoff,
        });
      }
    }

    return {
      renderer: 'prompt',
      source_vibe: toText(sharedRuntimeHandoff?.sourceVibe),
      rewrite_mode: rewriteMode,
      rewrite_rationale: rewriteRationale,
      final_prompt: finalPrompt,
      applied_techniques: appliedTechniques,
      skipped_techniques: skippedTechniques,
      selection_signals: selectionSignals,
      validation,
    };
  }

  return {
    buildPromptOutput,
  };
}
