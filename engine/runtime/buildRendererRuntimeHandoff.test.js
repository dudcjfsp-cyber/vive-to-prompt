import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRendererRuntimeHandoff } from './buildRendererRuntimeHandoff.js';

const fieldMap = {
  summary: 'summary',
  problemFrame: 'problem_frame',
  who: 'who',
  when: 'when',
  what: 'what',
  why: 'why',
  success: 'success',
  roles: 'roles',
  role: 'role',
  description: 'description',
  features: 'features',
  must: 'must',
  nice: 'nice',
  inputFields: 'input_fields',
  name: 'name',
  type: 'type',
  example: 'example',
  permissions: 'permissions',
  read: 'read',
  create: 'create',
  update: 'update',
  delete: 'delete',
  notes: 'notes',
  ambiguities: 'ambiguities',
  missing: 'missing',
  questions: 'questions',
  risks: 'risks',
};

test('buildRendererRuntimeHandoff exposes the minimum shared runtime payload for future renderers', () => {
  const spec = {
    summary: 'Store export report',
    problem_frame: {
      who: 'store manager',
      when: 'end of day',
      what: 'review order volume',
      why: 'spot issues quickly',
      success: 'export works in one click',
    },
    roles: [],
    features: { must: [], nice: [] },
    input_fields: [],
    permissions: [],
    ambiguities: { missing: [], questions: [] },
    risks: [],
  };
  const validationReport = {
    severity: 'medium',
    needs_clarification: true,
    warning_count: 2,
    blocking_issue_count: 0,
  };

  const handoff = buildRendererRuntimeHandoff({
    raw: {
      model: 'shared-model',
      meta: { repair_mode: 'strict_format' },
      draft_only: true,
    },
    fallbackModel: 'fallback-model',
    promptMeta: { validation_retry_count: 1 },
    sourceVibe: 'Need a store report',
    intentFieldMap: fieldMap,
    normalizeStandardOutput: () => ({ spec, validationReport }),
  });

  assert.equal(handoff.model, 'shared-model');
  assert.equal(handoff.sourceVibe, 'Need a store report');
  assert.deepEqual(handoff.parsedOutput, {
    model: 'shared-model',
    meta: { repair_mode: 'strict_format' },
    draft_only: true,
  });
  assert.equal(handoff.normalizedDraft, spec);
  assert.deepEqual(handoff.validationReport, validationReport);
  assert.deepEqual(handoff.meta, {
    repair_mode: 'strict_format',
    validation_retry_count: 1,
  });
  assert.equal(handoff.intentIr.summary, 'Store export report');
  assert.equal(handoff.intentIr.signals.needs_clarification, true);
});

test('buildRendererRuntimeHandoff normalizes spec-shaped must-haves before prompt rendering', () => {
  const spec = {
    summary: '서비스 점검 안내문 프롬프트',
    problem_frame: {
      who: '운영 담당자',
      when: '점검 공지 전',
      what: '점검 안내문 프롬프트를 만든다',
      why: '사용자 안내를 빠르게 준비한다',
      success: '바로 사용할 수 있는 점검 안내문이 나온다',
    },
    roles: [],
    features: {
      must: [
        '점검 유형(정기/긴급) 선택',
        '점검 시작/종료 시간 입력',
        '점검 영향 범위(전체/일부 기능) 선택 및 상세 입력',
        '안내문 미리보기',
      ],
      nice: [],
    },
    input_fields: [],
    permissions: [],
    ambiguities: { missing: [], questions: [] },
    risks: [],
  };
  const validationReport = {
    severity: 'low',
    needs_clarification: false,
    warning_count: 0,
    blocking_issue_count: 0,
  };

  const handoff = buildRendererRuntimeHandoff({
    raw: {
      model: 'shared-model',
    },
    fallbackModel: 'fallback-model',
    sourceVibe: '서비스 점검 안내문 작성 프롬프트 만들어줘',
    intentFieldMap: fieldMap,
    normalizeStandardOutput: () => ({ spec, validationReport }),
  });

  assert.deepEqual(handoff.intentIr.delivery.must_haves, [
    '점검 유형이 정기인지 긴급인지 분명히 반영한다.',
    '점검 시작 시간과 종료 시간이 분명히 드러나게 쓴다.',
    '영향 범위와 영향을 받는 기능을 구체적으로 적는다.',
    '사용자에게 바로 보여줄 수 있는 자연스러운 문장으로 작성한다.',
  ]);
  assert.doesNotMatch(
    handoff.intentIr.delivery.must_haves.join('\n'),
    /(미리보기|선택|입력|버튼|공유|복사|publish|unpublish|게시|발행)/i,
  );
});
