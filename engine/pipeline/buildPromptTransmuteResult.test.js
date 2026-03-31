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

test('buildPromptTransmuteResult keeps live-ready prompt output prompt-native across short common inputs', () => {
  const cases = [
    {
      label: 'summary',
      expectedStatus: 'ready',
      sourceVibe: '회의록 3줄 요약 프롬프트 만들어줘',
      spec: {
        summary: '회의록 3줄 요약 프롬프트',
        problem_frame: {
          who: '팀원',
          when: '회의 직후',
          what: '',
          why: '핵심만 빠르게 공유한다',
          success: '3줄 요약이 바로 나온다',
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
        ambiguities: { missing: [], questions: [] },
        risks: [],
      },
      expectedLines: [
        '회의록 내용을 반영한다.',
        '3줄 요약 프롬프트로 정리한다.',
        '바로 사용할 수 있게 프롬프트를 정리한다.',
      ],
    },
    {
      label: 'announcement',
      expectedStatus: 'review',
      sourceVibe: '서비스 점검 안내문 작성 프롬프트 만들어줘',
      spec: {
        summary: '서비스 점검 안내문 프롬프트',
        problem_frame: {
          who: '운영 담당자',
          when: '점검 공지 전',
          what: '',
          why: '사용자 혼란을 줄인다',
          success: '점검 정보가 분명한 안내문이 나온다',
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
      },
      expectedLines: [
        '점검 유형이 정기인지 긴급인지 분명히 반영한다.',
        '점검 시작 시간과 종료 시간이 분명히 드러나게 쓴다.',
        '영향 범위와 영향을 받는 기능을 구체적으로 적는다.',
      ],
      expectedQuestions: [
        '점검 유형은 정기 점검인가요, 긴급 점검인가요?',
        '점검 일시와 예상 소요 시간은 어떻게 되나요?',
        '어떤 기능이나 서비스가 영향을 받는지 구체적으로 적어줄 수 있나요?',
      ],
    },
    {
      label: 'planning',
      expectedStatus: 'review',
      sourceVibe: '도쿄 2박 3일 일정 짜는 프롬프트 만들어줘',
      spec: {
        summary: '도쿄 2박 3일 여행 계획 프롬프트',
        problem_frame: {
          who: '여행자',
          when: '여행 준비 전',
          what: '',
          why: '짧은 여행을 효율적으로 준비한다',
          success: '날짜별 일정이 바로 나온다',
        },
        roles: [],
        features: {
          must: [
            '사용자 입력 기반 도쿄 2박 3일 일정 생성',
            '날짜별 시간대별(오전/오후) 활동 및 장소 추천',
            '주요 관광지, 맛집, 쇼핑 장소 등 카테고리별 추천',
          ],
          nice: [],
        },
        input_fields: [],
        permissions: [],
        ambiguities: { missing: [], questions: [] },
        risks: [],
      },
      expectedLines: [
        '여행 조건을 반영한 도쿄 2박 3일 일정을 짠다.',
        '날짜별로 오전과 오후 일정을 나누고 활동과 장소를 함께 제안한다.',
        '관광지, 맛집, 쇼핑 장소를 균형 있게 묶어 추천한다.',
      ],
      expectedQuestions: [
        '쇼핑, 문화, 음식 중 어떤 관심사가 가장 중요한가요?',
        '예산은 대략 어느 정도로 생각하고 있나요?',
      ],
    },
    {
      label: 'marketing',
      expectedStatus: 'ready',
      sourceVibe: '인스타 신제품 홍보 문구 프롬프트 만들어줘',
      spec: {
        summary: '인스타그램 신제품 홍보 문구 프롬프트',
        problem_frame: {
          who: '마케터',
          when: '신제품 출시 직전',
          what: '',
          why: '바로 게시할 문구 초안을 준비한다',
          success: '후보 문구를 바로 고를 수 있다',
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
        ambiguities: { missing: [], questions: [] },
        risks: [],
      },
      expectedLines: [
        '제품명, 핵심 특징, 대상 고객 정보를 반영한 문구를 만든다.',
        '인스타그램용 홍보 문구를 여러 가지 제안한다.',
        '후보 문구를 비교하고 바로 고르기 쉽게 정리한다.',
      ],
    },
  ];
  const bannedPattern = /(입력 필드|텍스트 필드|필드 정보|버튼|버튼 형태|기능 형태|미리보기|create\/edit\/share\/copy|복사|공유|목록\s*\/\s*상세|list\s*\/\s*detail|publish|unpublish|게시|발행|관리\s*(기능|흐름)|조회\s*및\s*수정|저장\s*및\s*불러오기|공개\s*여부)/i;

  cases.forEach(({ label, sourceVibe, spec, expectedLines, expectedStatus, expectedQuestions = [] }) => {
    const { result } = buildPromptTransmuteResult({
      raw: {
        model: 'prompt-model',
      },
      fallbackModel: 'fallback-model',
      sourceVibe,
      intentFieldMap: fieldMap,
      normalizeStandardOutput: () => ({
        spec,
        validationReport: {
          severity: 'low',
          needs_clarification: false,
          warning_count: 0,
          blocking_issue_count: 0,
        },
      }),
      renderer: createPromptRenderer(),
    });

    assert.equal(result.prompt_output.validation.status, expectedStatus, `${label} should keep the expected validation state`);
    assert.doesNotMatch(result.prompt_output.final_prompt, /Original request:|Suggested workflow:|Before finalizing:/, `${label} should stay compact`);
    assert.doesNotMatch(result.prompt_output.final_prompt, bannedPattern, `${label} should avoid spec-shaped feature wording`);
    expectedLines.forEach((line) => {
      assert.match(result.prompt_output.final_prompt, new RegExp(line.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${label} should include prompt-native line: ${line}`);
    });
    if (expectedQuestions.length > 0) {
      assert.deepEqual(result.prompt_output.validation.suggested_questions, expectedQuestions, `${label} should surface concrete follow-up questions`);
    }
  });
});
