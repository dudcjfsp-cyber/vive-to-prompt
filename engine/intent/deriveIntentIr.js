import { normalizeIntentIr } from '../contracts/intentIr.js';

function toText(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => toText(item))
    .filter(Boolean);
}

function normalizeConstraintLine(line = '') {
  return toText(line)
    .replace(/^- /, '')
    .replace(/^(Must|Nice to have|Avoid):\s*/i, '')
    .trim();
}

function normalizePromptSurfaceLine(line = '') {
  const normalized = toText(line);
  if (!normalized) return '';

  if (/(조회\s*및\s*수정|저장\s*및\s*불러오기|에디터\s*기능)/i.test(normalized)) {
    return '';
  }

  return normalized
    .replace(/텍스트\s*필드(\s*정보)?/gi, '내용')
    .replace(/입력\s*필드(\s*정보)?/gi, '내용')
    .replace(/필드\s*정보/gi, '내용')
    .replace(/정보\s*필드\s*제공\s*정보/gi, '정보')
    .replace(/필드\s*제공\s*정보/gi, '정보')
    .replace(/필드\s*제공/gi, '정보')
    .replace(/정보\s*및\s*관리\s*기능\s*정보/gi, '내용')
    .replace(/관리\s*(기능|흐름)/gi, '')
    .replace(/기능\s*형태/gi, '')
    .replace(/버튼\s*형태/gi, '')
    .replace(/게시\s*시점과\s*공개\s*여부/gi, '언제 공개되는지')
    .replace(/내용를/gi, '내용을')
    .replace(/[“”"]/g, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+\./g, '.')
    .trim();
}

function rewritePromptNativeMustHave(sourceVibe = '', line = '') {
  const normalizedSource = toText(sourceVibe);
  const normalizedLine = normalizePromptSurfaceLine(normalizeConstraintLine(line));
  if (!normalizedLine) return '';

  if (/(복사\s*(기능|버튼)|복사할\s*수\s*있(?:는|게)|copy feature|copy button)/i.test(normalizedLine)) {
    if (/(문구)/i.test(normalizedLine)) {
      return '바로 사용할 수 있는 완성형 문구로 제안한다.';
    }
    if (/(프롬프트)/i.test(normalizedLine)) {
      return '바로 사용할 수 있게 프롬프트를 정리한다.';
    }
    return '';
  }

  if (/(미리보기|preview)/i.test(normalizedLine)) {
    return '사용자에게 바로 보여줄 수 있는 자연스러운 문장으로 작성한다.';
  }

  if (/(공유|share)/i.test(normalizedLine)) {
    return '다른 사람에게 바로 전달할 수 있게 정리한다.';
  }

  if (/(목록\s*\/\s*상세|list\s*\/\s*detail|list view|detail view|목록 보기|상세 보기)/i.test(normalizedLine)) {
    return '결과를 항목별로 정리하고 각 항목의 핵심 정보를 함께 드러낸다.';
  }

  if (/(게시\s*\/\s*해제|게시|발행\s*\/\s*해제|발행|publish|unpublish|언제 공개되는지)/i.test(normalizedLine)) {
    return '언제 공개되는지 분명하게 적는다.';
  }

  if (/(회의록).*(3줄|세 줄).*(요약).*(프롬프트 생성|생성)/i.test(normalizedLine)) {
    return '회의록의 핵심만 3줄로 간결하게 쓴다.';
  }

  if (/(제품 정보).*(입력)/i.test(normalizedLine)) {
    return '제품명, 핵심 특징, 대상 고객 정보를 반영한 문구를 만든다.';
  }

  if (/(홍보 문구).*(생성)/i.test(normalizedLine)) {
    return '인스타그램용 홍보 문구를 여러 가지 제안한다.';
  }

  if (/(문구 목록).*(확인).*(선택)/i.test(normalizedLine)) {
    return '후보 문구를 비교하고 바로 고르기 쉽게 정리한다.';
  }

  if (/(점검 유형).*(선택)/i.test(normalizedLine)) {
    return '점검 유형이 정기인지 긴급인지 분명히 반영한다.';
  }

  if (/(시작\/종료 시간|시작 시간|종료 시간).*(입력)/i.test(normalizedLine)) {
    return '점검 시작 시간과 종료 시간이 분명히 드러나게 쓴다.';
  }

  if (/(영향 범위).*(선택).*(상세 입력|상세)/i.test(normalizedLine)) {
    return '영향 범위와 영향을 받는 기능을 구체적으로 적는다.';
  }

  if (/^(?=.*도쿄)(?=.*2박\s*3일)(?=.*일정)(?=.*생성).+$/i.test(normalizedLine)) {
    return '여행 조건을 반영한 도쿄 2박 3일 일정을 짠다.';
  }

  if (/(날짜별).*(시간대별|오전\/오후|오전|오후).*(활동).*(장소 추천)/i.test(normalizedLine)) {
    return '날짜별로 오전과 오후 일정을 나누고 활동과 장소를 함께 제안한다.';
  }

  if (/(관광지).*(맛집).*(쇼핑 장소).*(추천)/i.test(normalizedLine)) {
    return '관광지, 맛집, 쇼핑 장소를 균형 있게 묶어 추천한다.';
  }

  if (/(표시)$/i.test(normalizedLine)) {
    return `${normalizedLine.replace(/\s*표시$/i, '').trim()}이 드러나게 적는다.`;
  }

  if (/(입력)/i.test(normalizedLine)) {
    return `${normalizedLine.replace(/\s*입력/i, '').trim()} 정보를 반영한다.`;
  }

  if (/(선택)/i.test(normalizedLine)) {
    return `${normalizedLine.replace(/\s*선택/i, '').trim()} 내용을 분명히 반영한다.`;
  }

  if (/(프롬프트|문구|안내문|일정)\s*(로)?\s*작성한다\.?$/i.test(normalizedLine)) {
    return `${normalizedLine.replace(/\s*(로)?\s*작성한다\.?$/i, '').trim()}로 정리한다.`;
  }

  if (/(생성)/i.test(normalizedLine) && /(프롬프트|문구|안내문|일정)/i.test(normalizedLine)) {
    return `${normalizedLine.replace(/\s*생성/i, '').trim()} 형태로 작성한다.`;
  }

  if (normalizedLine === normalizedSource) {
    return '';
  }

  return normalizedLine;
}

function normalizePromptNativeMustHaves(sourceVibe = '', mustHaves = []) {
  const nextMustHaves = [];

  toStringArray(mustHaves).forEach((item) => {
    const rewritten = toText(rewritePromptNativeMustHave(sourceVibe, item));
    if (!rewritten || nextMustHaves.includes(rewritten)) return;
    nextMustHaves.push(rewritten);
  });

  return nextMustHaves;
}

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function getNestedObject(source, key) {
  if (!isPlainObject(source)) return {};
  const nested = source[key];
  return isPlainObject(nested) ? nested : {};
}

function normalizeConfidence(validationReport) {
  const blockingIssueCount = Number(validationReport?.blocking_issue_count || 0);
  const warningCount = Number(validationReport?.warning_count || 0);
  const needsClarification = Boolean(validationReport?.needs_clarification);
  const severity = toText(validationReport?.severity, 'low');

  if (blockingIssueCount > 0 || severity === 'high') return 'low';
  if (needsClarification || severity === 'medium' || warningCount > 0) return 'medium';
  return 'high';
}

function normalizeRoles(entries, roleKey, descriptionKey) {
  if (!Array.isArray(entries)) return [];
  return entries.reduce((acc, item) => {
    if (!isPlainObject(item)) return acc;
    const name = toText(item[roleKey]);
    const description = toText(item[descriptionKey]);
    if (!name && !description) return acc;
    acc.push({ name, description });
    return acc;
  }, []);
}

function normalizeInputFields(entries, nameKey, descriptionKeys = []) {
  if (!Array.isArray(entries)) return [];
  return entries.reduce((acc, item) => {
    if (!isPlainObject(item)) return acc;
    const name = toText(item[nameKey]);
    const description = descriptionKeys
      .map((key) => toText(item[key]))
      .filter(Boolean)
      .join(' | ');
    if (!name && !description) return acc;
    acc.push({ name, description });
    return acc;
  }, []);
}

function normalizePermissions(entries, roleKey, notesKey, crudKeys = {}) {
  if (!Array.isArray(entries)) return [];
  return entries.reduce((acc, item) => {
    if (!isPlainObject(item)) return acc;
    const role = toText(item[roleKey]);
    const crudParts = Object.entries(crudKeys)
      .filter(([, sourceKey]) => sourceKey && item[sourceKey] === true)
      .map(([label]) => label.toUpperCase());
    const notes = toText(item[notesKey]);
    const descriptionParts = [];
    if (crudParts.length > 0) descriptionParts.push(`crud=${crudParts.join('/')}`);
    if (notes) descriptionParts.push(notes);
    const description = descriptionParts.join(' | ');
    if (!role && !description) return acc;
    acc.push({ name: role, description });
    return acc;
  }, []);
}

export function buildIntentIrFromSpec({
  sourceVibe = '',
  spec = null,
  validationReport = null,
  fields = {},
} = {}) {
  const safeSpec = isPlainObject(spec) ? spec : {};
  const problemFrame = getNestedObject(safeSpec, fields.problemFrame);
  const features = getNestedObject(safeSpec, fields.features);
  const ambiguities = getNestedObject(safeSpec, fields.ambiguities);

  return normalizeIntentIr({
    source_vibe: toText(sourceVibe),
    summary: toText(safeSpec[fields.summary]),
    intent: {
      target_user: toText(problemFrame[fields.who]),
      usage_moment: toText(problemFrame[fields.when]),
      user_job: toText(problemFrame[fields.what]),
      problem_context: toText(problemFrame[fields.why]),
      success_signal: toText(problemFrame[fields.success]),
    },
    delivery: {
      roles: normalizeRoles(safeSpec[fields.roles], fields.role, fields.description),
      must_haves: normalizePromptNativeMustHaves(sourceVibe, features[fields.must]),
      nice_to_haves: toStringArray(features[fields.nice]),
      input_fields: normalizeInputFields(safeSpec[fields.inputFields], fields.name, [fields.type, fields.example]),
      permissions: normalizePermissions(safeSpec[fields.permissions], fields.role, fields.notes, {
        read: fields.read,
        create: fields.create,
        update: fields.update,
        delete: fields.delete,
      }),
    },
    analysis: {
      risks: toStringArray(safeSpec[fields.risks]),
      assumptions: [],
      missing_information: toStringArray(ambiguities[fields.missing]),
      clarification_questions: toStringArray(ambiguities[fields.questions]),
    },
    signals: {
      confidence: normalizeConfidence(validationReport),
      needs_clarification: Boolean(validationReport?.needs_clarification),
      severity: toText(validationReport?.severity, 'low'),
      warning_count: Number(validationReport?.warning_count || 0),
      blocking_issue_count: Number(validationReport?.blocking_issue_count || 0),
    },
  });
}
