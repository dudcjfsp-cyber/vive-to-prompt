import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPromptTransmuteResult } from './buildPromptTransmuteResult.js';
import { createPromptRenderer } from '../renderers/prompt/promptRenderer.js';

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

test('buildPromptTransmuteResult returns prompt output on top of the shared runtime handoff', () => {
  const spec = {
    summary: 'Write a launch email prompt',
    problem_frame: {
      who: 'beta users',
      when: 'before release day',
      what: 'draft a reusable launch email prompt',
      why: 'speed up launch communication',
      success: 'the prompt is ready to paste into a model',
    },
    roles: [{ role: 'marketer', description: 'owns launch messaging' }],
    features: { must: ['Include subject', 'Include CTA'], nice: ['Friendly tone'] },
    input_fields: [{ name: 'audience', type: 'string', example: 'beta users' }],
    permissions: [{ role: 'marketer', read: true, create: true, update: true, delete: false, notes: 'editable' }],
    ambiguities: { missing: [], questions: [] },
    risks: ['Avoid hype'],
  };
  const validationReport = {
    severity: 'low',
    needs_clarification: false,
    warning_count: 0,
    blocking_issue_count: 0,
  };

  const { result, intentIr, sharedRuntimeHandoff } = buildPromptTransmuteResult({
    raw: {
      model: 'prompt-model',
      meta: { source: 'raw' },
    },
    fallbackModel: 'fallback-model',
    promptMeta: { experiment: 'prompt-v1' },
    sourceVibe: 'Write a JSON email prompt for beta users with subject, body, and CTA.',
    intentFieldMap: fieldMap,
    normalizeStandardOutput: () => ({ spec, validationReport }),
    renderer: createPromptRenderer(),
  });

  assert.equal(result.model, 'prompt-model');
  assert.equal(result.prompt_output.renderer, 'prompt');
  assert.equal(result.prompt_output.rewrite_mode, 'pass_through');
  assert.equal(result.prompt_output.final_prompt, 'Write a JSON email prompt for beta users with subject, body, and CTA.');
  assert.deepEqual(result.validation_report, validationReport);
  assert.deepEqual(result.meta, { source: 'raw', experiment: 'prompt-v1' });
  assert.equal(intentIr.intent.user_job, 'draft a reusable launch email prompt');
  assert.equal(sharedRuntimeHandoff.model, 'prompt-model');
  assert.equal(sharedRuntimeHandoff.intentIr, intentIr);
});

test('buildPromptTransmuteResult preserves prompt-native review validation metadata through the pipeline handoff', () => {
  const spec = {
    summary: 'Prepare a reusable launch rollout prompt',
    problem_frame: {
      who: '',
      when: 'before launch week',
      what: 'prepare a reusable launch rollout prompt',
      why: 'align launch execution',
      success: '',
    },
    roles: [],
    features: { must: [], nice: [] },
    input_fields: [],
    permissions: [],
    ambiguities: {
      missing: ['launch date'],
      questions: ['Who is responsible for the launch?'],
    },
    risks: ['Avoid unclear ownership'],
  };
  const validationReport = {
    severity: 'high',
    needs_clarification: true,
    warning_count: 3,
    blocking_issue_count: 2,
    blocking_issues: [
      { id: 'missing_problem_who', message: '문제정의 5칸: 누가가 비어 있습니다.' },
      { id: 'missing_problem_success', message: '문제정의 5칸: 성공기준이 비어 있습니다.' },
    ],
    warnings: [
      '문제정의 5칸: 누가가 비어 있습니다.',
      '문제정의 5칸: 성공기준이 비어 있습니다.',
      '권한 규칙이 비어 있습니다.',
    ],
    suggested_questions: [
      '누가 이 기능을 가장 자주 사용하는지 알려주세요.',
      '완료를 어떻게 판단할지 성공 기준을 알려주세요.',
      '역할별로 조회, 생성, 수정, 삭제 권한 차이가 필요한지 알려주세요.',
    ],
  };

  const { result } = buildPromptTransmuteResult({
    raw: {
      model: 'prompt-model',
    },
    fallbackModel: 'fallback-model',
    sourceVibe: 'Need a launch rollout prompt for the team.',
    intentFieldMap: fieldMap,
    normalizeStandardOutput: () => ({ spec, validationReport }),
    renderer: createPromptRenderer(),
  });

  assert.equal(result.prompt_output.validation.status, 'review');
  assert.equal(result.prompt_output.validation.summary_code, 'review_before_use');
  assert.equal(
    result.prompt_output.validation.summary,
    '현재 프롬프트는 결과 품질을 좌우하는 핵심 입력 조건이 아직 덜 고정돼 있어 한 번 검토하고 쓰는 편이 안전합니다.',
  );
  assert.deepEqual(result.prompt_output.validation.reason_codes, [
    'validation_missing_audience_or_role',
    'validation_missing_success_criteria',
    'validation_missing_permissions',
  ]);
  assert.deepEqual(result.prompt_output.validation.suggested_questions, [
    'Who is responsible for the launch?',
    '이 프롬프트에 반영할 일정이나 날짜는 무엇인가요?',
    '이 프롬프트의 결과가 충분히 좋다고 볼 기준은 무엇인가요?',
  ]);
  assert.deepEqual(result.prompt_output.validation.suggested_question_details, [
    {
      question: 'Who is responsible for the launch?',
      intent_key: 'audience',
      source: 'intent_ir',
    },
    {
      question: '이 프롬프트에 반영할 일정이나 날짜는 무엇인가요?',
      intent_key: 'schedule',
      source: 'missing_information',
      missing_information: 'launch date',
    },
    {
      question: '이 프롬프트의 결과가 충분히 좋다고 볼 기준은 무엇인가요?',
      intent_key: 'success_criteria',
      source: 'prompt_validation_signal',
      reason_code: 'validation_missing_success_criteria',
    },
  ]);
});
