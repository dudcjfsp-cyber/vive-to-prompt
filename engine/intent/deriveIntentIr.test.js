import test from 'node:test';
import assert from 'node:assert/strict';
import { buildIntentIrFromSpec } from './deriveIntentIr.js';

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

test('buildIntentIrFromSpec derives a renderer-neutral view from normalized spec data', () => {
  const intentIr = buildIntentIrFromSpec({
    sourceVibe: 'Need a store report',
    spec: {
      summary: 'Store export report',
      problem_frame: {
        who: 'store manager',
        when: 'end of day',
        what: 'review order volume',
        why: 'spot issues quickly',
        success: 'export works in one click',
      },
      roles: [{ role: 'manager', description: 'reviews output' }],
      features: { must: ['Generate CSV'], nice: ['Email summary'] },
      input_fields: [{ name: 'date_range', type: 'string', example: '2026-03-09' }],
      permissions: [{ role: 'manager', read: true, create: false, update: false, delete: false, notes: 'read only' }],
      ambiguities: {
        missing: ['exact export format'],
        questions: ['Should export support CSV only?'],
      },
      risks: ['stale data'],
    },
    validationReport: {
      needs_clarification: true,
      severity: 'medium',
      warning_count: 1,
      blocking_issue_count: 0,
    },
    fields: fieldMap,
  });

  assert.equal(intentIr.source_vibe, 'Need a store report');
  assert.equal(intentIr.summary, 'Store export report');
  assert.equal(intentIr.intent.target_user, 'store manager');
  assert.deepEqual(intentIr.delivery.must_haves, ['Generate CSV']);
  assert.deepEqual(intentIr.analysis.missing_information, ['exact export format']);
  assert.equal(intentIr.signals.confidence, 'medium');
});

test('buildIntentIrFromSpec rewrites spec-shaped must-haves into prompt-native wording for short common inputs', () => {
  const intentIr = buildIntentIrFromSpec({
    sourceVibe: '인스타 신제품 홍보 문구 프롬프트 만들어줘',
    spec: {
      summary: '인스타그램 신제품 홍보 문구 프롬프트',
      problem_frame: {
        who: '마케터',
        when: '신제품 출시 직전',
        what: '홍보 문구를 만든다',
        why: '바로 게시할 문구 초안을 빠르게 확보한다',
        success: '문구를 바로 다듬어 사용할 수 있다',
      },
      roles: [],
      features: {
        must: [
          '제품 정보 입력 (제품명, 핵심 특징, 타깃 고객 등)',
          'AI 기반 홍보 문구 생성',
          '생성된 문구 목록 확인 및 선택',
          '문구 복사 기능',
        ],
        nice: [],
      },
      input_fields: [],
      permissions: [],
      ambiguities: {
        missing: [],
        questions: [],
      },
      risks: [],
    },
    validationReport: {
      needs_clarification: false,
      severity: 'low',
      warning_count: 0,
      blocking_issue_count: 0,
    },
    fields: fieldMap,
  });

  assert.deepEqual(intentIr.delivery.must_haves, [
    '제품명, 핵심 특징, 대상 고객 정보를 반영한 문구를 만든다.',
    '인스타그램용 홍보 문구를 여러 가지 제안한다.',
    '후보 문구를 비교하고 바로 고르기 쉽게 정리한다.',
    '바로 사용할 수 있는 완성형 문구로 제안한다.',
  ]);
  assert.doesNotMatch(intentIr.delivery.must_haves.join('\n'), /(복사|버튼|입력|선택|생성)/);
});

test('buildIntentIrFromSpec rewrites ready-state UI wording into prompt-native wording for prompt requests', () => {
  const intentIr = buildIntentIrFromSpec({
    sourceVibe: '회의록 핵심만 3줄로 요약해주는 프롬프트 만들어줘',
    spec: {
      summary: '회의록 핵심만 3줄로 요약해주는 프롬프트',
      problem_frame: {
        who: '',
        when: '',
        what: '',
        why: '',
        success: '',
      },
      roles: [],
      features: {
        must: [
          '회의록 텍스트 필드 정보를 반영한다.',
          '"3줄 요약 프롬프트" 버튼 형태로 작성한다.',
          '생성된 프롬프트를 복사할 수 있는 기능 형태로 작성한다.',
        ],
        nice: [],
      },
      input_fields: [],
      permissions: [],
      ambiguities: {
        missing: [],
        questions: [],
      },
      risks: [],
    },
    validationReport: {
      needs_clarification: false,
      severity: 'low',
      warning_count: 0,
      blocking_issue_count: 0,
    },
    fields: fieldMap,
  });

  assert.deepEqual(intentIr.delivery.must_haves, [
    '회의록 내용을 반영한다.',
    '3줄 요약 프롬프트로 정리한다.',
    '바로 사용할 수 있게 프롬프트를 정리한다.',
  ]);
  assert.doesNotMatch(intentIr.delivery.must_haves.join('\n'), /(필드|버튼|기능 형태|복사할 수 있는 기능|복사 버튼)/);
});
