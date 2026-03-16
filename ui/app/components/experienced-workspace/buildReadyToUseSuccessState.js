import { isObject, toText } from '../result-panel/utils.js';

export const READY_TO_USE_REPRESENTATIVE_TECHNIQUE_LIMIT = 3;

const TECHNIQUE_LEARNING_META = {
  '제로샷 그대로 통과': {
    concept: '원문 의도',
    effect: '원문 의도를 거의 그대로 유지',
  },
  '목표 명확화': {
    concept: '목표',
    effect: '목표를 더 또렷하게 정리',
  },
  '역할 부여': {
    concept: '대상과 역할',
    effect: '답변의 대상과 역할을 분명하게 설정',
  },
  '제약 조건 확장': {
    concept: '필수 조건',
    effect: '빠진 조건과 제한을 더 선명하게 노출',
  },
  '출력 형식 고정': {
    concept: '출력 형태',
    effect: '원하는 결과 형식을 고정',
  },
  '맥락 구조화': {
    concept: '맥락',
    effect: '실행 전에 필요한 맥락을 묶어 정리',
  },
  '단계 분해': {
    concept: '작업 순서',
    effect: '작업 순서를 짧게 나눠 이해하기 쉽게 정리',
  },
  '품질 체크리스트 주입': {
    concept: '점검 기준',
    effect: '놓치기 쉬운 확인 기준을 함께 추가',
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
    return '원문 의도가 이미 충분히 분명해, 큰 재작성 없이 바로 사용할 수 있게 정리했습니다.';
  }

  const concepts = Array.from(new Set(
    normalizedTechniques
      .map((technique) => TECHNIQUE_LEARNING_META[technique.label]?.concept || '')
      .filter(Boolean),
  )).slice(0, READY_TO_USE_REPRESENTATIVE_TECHNIQUE_LIMIT);

  if (concepts.length > 0) {
    return `이 프롬프트는 ${joinConcepts(concepts)}를 더 분명하게 드러내 바로 사용하기 쉬운 구조로 정리했습니다.`;
  }

  return toText(rewriteRationaleSummary)
    || '이 프롬프트는 바로 사용할 수 있도록 핵심 구조만 간단히 정리했습니다.';
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
        || '핵심 구조를 더 또렷하게 정리',
    }));

  return {
    representativeTechniques,
    hiddenTechniqueCount: Math.max(0, normalizedTechniques.length - representativeTechniques.length),
    learningNarrative: buildReadyToUseLearningNarrative({
      rewriteRationaleSummary,
      representativeTechniques,
    }),
  };
}
