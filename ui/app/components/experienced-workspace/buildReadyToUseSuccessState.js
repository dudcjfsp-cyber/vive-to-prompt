import { isObject, toText } from '../result-panel/utils.js';

export const READY_TO_USE_REPRESENTATIVE_TECHNIQUE_LIMIT = 3;

const TECHNIQUE_LEARNING_META = {
  '제로샷 그대로 통과': {
    concept: '원문 표현',
    effect: '원래 요청이 이미 충분히 분명해 거의 그대로 사용할 수 있게 정리',
    pattern: '요청이 이미 선명하다면 불필요하게 길게 풀지 말고 그대로 써도 됩니다.',
  },
  '목표 명확화': {
    concept: '목표',
    effect: '무엇을 해달라는 요청인지 한 줄 중심 문장으로 정리',
    pattern: '무엇을 해줘: [AI가 수행해야 할 핵심 작업 한 문장]',
  },
  '역할 부여': {
    concept: '대상과 관점',
    effect: '누가 읽고 어떤 관점에서 답해야 하는지 더 분명하게 고정',
    pattern: '대상/관점: [누가 읽는지]를 고려해 [어떤 톤이나 관점]으로 써줘',
  },
  '제약 조건 확장': {
    concept: '중요 조건',
    effect: '빠지면 안 되는 요소와 피해야 할 요소를 요청 안에 드러냄',
    pattern: '반드시 포함: [...] / 피할 것: [...]',
  },
  '출력 형식 고정': {
    concept: '출력 형식',
    effect: '결과 모양이 흔들리지 않도록 원하는 형식을 먼저 고정',
    pattern: '출력 형식: [표/목록/문단/JSON 등 원하는 형식]으로 정리해줘',
  },
  '맥락 구조화': {
    concept: '맥락',
    effect: '배경 상황과 전제를 먼저 정리해 요청을 더 잘 이해하게 만듦',
    pattern: '배경/맥락: [지금 상황, 전제, 참고 정보]',
  },
  '단계 분해': {
    concept: '작업 순서',
    effect: '한 번에 뭉친 요청을 짧은 순서로 나눠 결과를 더 안정화',
    pattern: '작업 순서: 1. [...] 2. [...] 3. [...]',
  },
  '품질 체크리스트 주입': {
    concept: '점검 기준',
    effect: '결과에서 빠지기 쉬운 조건을 마지막에 한 번 더 확인하게 만듦',
    pattern: '마지막 점검: 빠진 조건, 어색한 표현, 누락된 형식이 없는지 확인해줘',
  },
};

function toTechniqueItems(value) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => isObject(item))
    .map((item) => ({
      ...item,
      label: toText(item.label),
      why: toText(item.why),
    }))
    .filter((item) => item.label);
}

function joinConcepts(concepts) {
  if (concepts.length === 0) return '';
  if (concepts.length === 1) return concepts[0];
  if (concepts.length === 2) return `${concepts[0]}와 ${concepts[1]}`;
  return `${concepts.slice(0, -1).join(', ')}, ${concepts[concepts.length - 1]}`;
}

export function buildReadyToUseLearningNarrative({
  rewriteRationaleSummary = '',
  representativeTechniques = [],
} = {}) {
  const normalizedTechniques = toTechniqueItems(representativeTechniques);

  if (
    normalizedTechniques.length === 1
    && normalizedTechniques[0].label === '제로샷 그대로 통과'
  ) {
    return '원래 요청이 이미 충분히 분명해서 억지로 늘리지 않고 바로 쓸 수 있는 형태로 정리했습니다.';
  }

  const concepts = Array.from(new Set(
    normalizedTechniques
      .map((technique) => TECHNIQUE_LEARNING_META[technique.label]?.concept || '')
      .filter(Boolean),
  )).slice(0, READY_TO_USE_REPRESENTATIVE_TECHNIQUE_LIMIT);

  if (concepts.length > 0) {
    return `이번 프롬프트는 ${joinConcepts(concepts)}를 더 또렷하게 드러내 바로 쓰기 쉬운 요청으로 정리했습니다.`;
  }

  return toText(rewriteRationaleSummary)
    || '이번 프롬프트는 바로 사용할 수 있도록 핵심 구조만 간단히 정리했습니다.';
}

export function buildReadyToUseSuccessState({
  appliedTechniques = [],
  rewriteRationaleSummary = '',
} = {}) {
  const normalizedTechniques = toTechniqueItems(appliedTechniques);
  const representativeTechniques = normalizedTechniques
    .slice(0, READY_TO_USE_REPRESENTATIVE_TECHNIQUE_LIMIT)
    .map((technique) => ({
      ...technique,
      learning_effect:
        TECHNIQUE_LEARNING_META[technique.label]?.effect
        || '요청을 더 또렷하게 드러내도록 정리',
      reusable_pattern:
        TECHNIQUE_LEARNING_META[technique.label]?.pattern
        || '',
    }));

  return {
    representativeTechniques,
    hiddenTechniqueCount: Math.max(0, normalizedTechniques.length - representativeTechniques.length),
    reusablePattern:
      representativeTechniques.find((technique) => technique.reusable_pattern)?.reusable_pattern
      || '',
    learningNarrative: buildReadyToUseLearningNarrative({
      rewriteRationaleSummary,
      representativeTechniques,
    }),
  };
}
