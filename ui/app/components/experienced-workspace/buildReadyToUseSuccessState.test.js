import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildReadyToUseLearningNarrative,
  buildReadyToUseSuccessState,
  READY_TO_USE_REPRESENTATIVE_TECHNIQUE_LIMIT,
} from './buildReadyToUseSuccessState.js';

test('buildReadyToUseSuccessState keeps only three representative techniques at primary weight', () => {
  const result = buildReadyToUseSuccessState({
    appliedTechniques: [
      { id: 'goal', label: '목표 명확화' },
      { id: 'role', label: '역할 부여' },
      { id: 'format', label: '출력 형식 고정' },
      { id: 'quality', label: '품질 체크리스트 주입' },
    ],
    rewriteRationaleSummary: '거친 요청은 이미 있었지만, 바로 붙여 쓰기 좋도록 핵심 구조만 더 선명하게 정리했습니다.',
  });

  assert.equal(result.representativeTechniques.length, READY_TO_USE_REPRESENTATIVE_TECHNIQUE_LIMIT);
  assert.equal(result.hiddenTechniqueCount, 1);
  assert.equal(result.reusablePattern, '무엇을 해줘: [AI가 수행해야 할 핵심 작업 한 문장]');
  assert.deepEqual(
    result.representativeTechniques.map((technique) => technique.label),
    ['목표 명확화', '역할 부여', '출력 형식 고정'],
  );
});

test('buildReadyToUseSuccessState adds reusable patterns to representative techniques', () => {
  const result = buildReadyToUseSuccessState({
    appliedTechniques: [
      { id: 'goal', label: '목표 명확화' },
      { id: 'role', label: '역할 부여' },
    ],
  });

  assert.equal(result.representativeTechniques[0].reusable_pattern, '무엇을 해줘: [AI가 수행해야 할 핵심 작업 한 문장]');
  assert.equal(result.representativeTechniques[1].reusable_pattern, '대상/관점: [누가 읽는지]를 고려해 [어떤 톤이나 관점]으로 써줘');
});

test('buildReadyToUseSuccessState builds one short effect-first learning narrative', () => {
  const result = buildReadyToUseSuccessState({
    appliedTechniques: [
      { id: 'goal', label: '목표 명확화' },
      { id: 'role', label: '역할 부여' },
      { id: 'format', label: '출력 형식 고정' },
    ],
  });

  assert.match(result.learningNarrative, /목표, 대상과 관점, 출력 형식/);
  assert.match(result.learningNarrative, /바로 쓰기 쉬운 요청/);
});

test('buildReadyToUseLearningNarrative keeps pass-through success simple', () => {
  const narrative = buildReadyToUseLearningNarrative({
    representativeTechniques: [
      { id: 'pass-through', label: '제로샷 그대로 통과' },
    ],
  });

  assert.equal(narrative, '원래 요청이 이미 충분히 분명해서 억지로 늘리지 않고 바로 쓸 수 있는 형태로 정리했습니다.');
});

test('buildReadyToUseLearningNarrative falls back to rewrite summary when technique metadata is absent', () => {
  const narrative = buildReadyToUseLearningNarrative({
    rewriteRationaleSummary: '입력이 이미 충분히 분명해서 불필요한 확장 없이 거의 그대로 통과시켰습니다.',
    representativeTechniques: [],
  });

  assert.equal(narrative, '입력이 이미 충분히 분명해서 불필요한 확장 없이 거의 그대로 통과시켰습니다.');
});

test('buildReadyToUseLearningNarrative avoids raw technique ids so the summary reads like coaching instead of trace', () => {
  const narrative = buildReadyToUseLearningNarrative({
    representativeTechniques: [
      { id: 'goal_clarification', label: '목표 명확화' },
      { id: 'output_format_lock', label: '출력 형식 고정' },
    ],
  });

  assert.match(narrative, /목표와 출력 형식/);
  assert.doesNotMatch(narrative, /goal_clarification/);
  assert.doesNotMatch(narrative, /output_format_lock/);
  assert.doesNotMatch(narrative, /_/);
});
