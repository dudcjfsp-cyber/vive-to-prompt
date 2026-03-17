import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPromptValidation, createPromptRenderer } from './promptRenderer.js';

function createSharedRuntimeHandoff(overrides = {}) {
  return {
    sourceVibe: 'Write a JSON email prompt for beta users with subject, body, and CTA.',
    model: 'prompt-model',
    parsedOutput: {},
    normalizedDraft: {},
    validationReport: {
      severity: 'low',
      needs_clarification: false,
      warning_count: 0,
      blocking_issue_count: 0,
    },
    intentIr: {
      summary: 'Write a launch email prompt',
      intent: {
        target_user: 'beta users',
        usage_moment: 'before launch',
        user_job: 'write a launch email prompt',
        problem_context: 'Need a compact prompt for a launch announcement.',
        success_signal: 'The prompt is immediately reusable.',
      },
      delivery: {
        must_haves: ['subject', 'body', 'cta'],
        nice_to_haves: ['friendly tone'],
      },
      analysis: {
        risks: [],
        missing_information: [],
        clarification_questions: [],
      },
      signals: {
        confidence: 'high',
        needs_clarification: false,
        severity: 'low',
        warning_count: 0,
        blocking_issue_count: 0,
      },
    },
    meta: undefined,
    ...overrides,
  };
}

test('prompt renderer keeps explicit zero-shot-ready vibes in pass-through mode', () => {
  const renderer = createPromptRenderer();
  const handoff = createSharedRuntimeHandoff();

  const result = renderer.buildPromptOutput(handoff);

  assert.equal(result.renderer, 'prompt');
  assert.equal(result.rewrite_mode, 'pass_through');
  assert.equal(result.final_prompt, handoff.sourceVibe);
  assert.deepEqual(result.applied_techniques.map((item) => item.id), ['zero_shot_pass_through']);
  assert.equal(result.selection_signals.safe_to_pass_through, true);
  assert.equal(result.rewrite_rationale.summary_code, 'pass_through_clear_enough');
  assert.deepEqual(result.rewrite_rationale.reason_codes, [
    'goal_clear',
    'constraints_or_format_clear',
    'low_ambiguity',
  ]);
  assert.equal(result.validation.status, 'ready');
  assert.equal(result.validation.summary_code, 'ready_to_use');
  assert.equal(result.validation.summary, '원문 의도와 요청 형식이 충분히 살아 있어 지금 바로 사용할 수 있습니다.');
  assert.deepEqual(result.validation.reason_codes, [
    'preserves_source_vibe',
    'ready_for_direct_use',
  ]);
  assert.deepEqual(result.validation.reason_details, [
    '원문 요청의 핵심 의도가 최종 프롬프트 안에 그대로 남아 있습니다.',
    '입력이 이미 분명해 불필요한 재작성 없이 바로 복사해 사용할 수 있습니다.',
    '추가 확인 질문 없이 바로 사용할 수 있는 상태입니다.',
  ]);
});

test('prompt renderer escalates to structured refine when intent is vague and ambiguity is high', () => {
  const renderer = createPromptRenderer();
  const handoff = createSharedRuntimeHandoff({
    sourceVibe: 'Need something for launch',
    validationReport: {
      severity: 'high',
      needs_clarification: true,
      warning_count: 2,
      blocking_issue_count: 1,
      blocking_issues: [
        { id: 'missing_problem_who', message: '문제정의 5칸: 누가가 비어 있습니다.' },
      ],
      warnings: [
        '문제정의 5칸: 누가가 비어 있습니다.',
        '필수 기능이 비어 있습니다.',
      ],
      suggested_questions: [
        '누가 이 기능을 가장 자주 사용하는지 알려주세요.',
        '이번에 반드시 들어가야 하는 핵심 기능 1~3개를 알려주세요.',
      ],
    },
    intentIr: {
      summary: '',
      intent: {
        target_user: '',
        usage_moment: '',
        user_job: '',
        problem_context: '',
        success_signal: '',
      },
      delivery: {
        must_haves: ['mention launch date', 'mention CTA', 'keep it concise'],
        nice_to_haves: [],
      },
      analysis: {
        risks: ['Do not overpromise'],
        missing_information: ['target audience', 'exact launch date'],
        clarification_questions: ['Who is the email for?', 'When is the launch date?'],
      },
      signals: {
        confidence: 'low',
        needs_clarification: true,
        severity: 'high',
        warning_count: 2,
        blocking_issue_count: 1,
      },
    },
  });

  const result = renderer.buildPromptOutput(handoff);

  assert.equal(result.rewrite_mode, 'structured_refine');
  assert.match(result.final_prompt, /Original request:/);
  assert.match(result.final_prompt, /Task:/);
  assert.match(result.final_prompt, /Constraints and priorities:/);
  assert.match(result.final_prompt, /Before finalizing:/);
  assert.equal(result.applied_techniques.some((item) => item.id === 'goal_clarification'), true);
  assert.equal(result.applied_techniques.some((item) => item.id === 'quality_checklist_injection'), true);
  assert.equal(result.selection_signals.safe_to_pass_through, false);
  assert.equal(result.rewrite_rationale.summary_code, 'structured_refine_reduce_risk');
  assert.deepEqual(result.rewrite_rationale.reason_codes, [
    'goal_needs_clarification',
    'high_ambiguity',
    'missing_information',
    'validation_flags',
  ]);
  assert.equal(result.validation.status, 'review');
  assert.equal(result.validation.summary_code, 'review_before_use');
  assert.equal(result.validation.summary, '현재 프롬프트는 결과 품질을 좌우하는 핵심 입력 조건이 아직 덜 고정돼 있어 한 번 검토하고 쓰는 편이 안전합니다.');
  assert.deepEqual(result.validation.reason_codes, [
    'validation_missing_audience_or_role',
    'validation_missing_requirements',
  ]);
  assert.deepEqual(result.validation.warnings, [
    '이 프롬프트가 맞춰야 하는 대상이나 역할 정보가 아직 덜 고정돼 있습니다.',
    '이 프롬프트에 반드시 포함해야 할 핵심 요구나 입력 조건이 아직 덜 드러나 있습니다.',
  ]);
  assert.deepEqual(result.validation.reason_details, [
    '누구를 위한 프롬프트인지, 어떤 역할을 기준으로 답해야 하는지가 아직 충분히 분명하지 않습니다.',
    '결과 품질을 좌우하는 필수 요구사항이나 입력 조건이 아직 충분히 고정되지 않았습니다.',
    '아직 확정되지 않은 정보가 있어 결과 편차가 남을 수 있습니다: target audience, exact launch date.',
  ]);
  assert.deepEqual(result.validation.suggested_questions, [
    'Who is the email for?',
    'When is the launch date?',
    '이 프롬프트에 반드시 포함해야 할 핵심 요구나 입력 조건은 무엇인가요?',
  ]);
});

test('prompt renderer compacts short ready-to-use prompts without blank scaffold sections', () => {
  const renderer = createPromptRenderer();
  const handoff = createSharedRuntimeHandoff({
    sourceVibe: '신규 가입자에게 보내는 환영 이메일 프롬프트 만들어줘',
    intentIr: {
      summary: '신규 가입자용 환영 이메일을 작성하는 프롬프트를 만들어줘',
      intent: {
        target_user: '',
        usage_moment: '',
        user_job: '',
        problem_context: '',
        success_signal: '',
      },
      delivery: {
        must_haves: [
          '회원가입 완료 시 환영 이메일 자동 발송',
          '환영 이메일 템플릿 관리 (내용, 제목 등)',
        ],
        nice_to_haves: [],
      },
      analysis: {
        risks: [],
        missing_information: [],
        clarification_questions: [],
      },
      signals: {
        confidence: 'medium',
        needs_clarification: false,
        severity: 'low',
        warning_count: 0,
        blocking_issue_count: 0,
      },
    },
  });

  const result = renderer.buildPromptOutput(handoff);

  assert.equal(result.rewrite_mode, 'light_refine');
  assert.doesNotMatch(result.final_prompt, /Original request:/);
  assert.match(result.final_prompt, /신규 가입자용 환영 이메일을 작성하는 프롬프트를 만들어줘/);
  assert.match(result.final_prompt, /조건:/);
  assert.match(result.final_prompt, /출력 형식:/);
  assert.match(result.final_prompt, /제목:/);
  assert.match(result.final_prompt, /본문:/);
  assert.doesNotMatch(result.final_prompt, /Task:/);
  assert.doesNotMatch(result.final_prompt, /Constraints and priorities:/);
  assert.doesNotMatch(result.final_prompt, /Output format:/);
  assert.doesNotMatch(result.final_prompt, /Role:/);
  assert.doesNotMatch(result.final_prompt, /Context:/);
  assert.doesNotMatch(result.final_prompt, /Not specified/);
  assert.doesNotMatch(result.final_prompt, /Suggested workflow:/);
  assert.doesNotMatch(result.final_prompt, /Before finalizing:/);
  assert.equal(result.validation.status, 'ready');
  assert.equal(result.validation.summary_code, 'ready_to_use');
  assert.deepEqual(result.validation.reason_codes, [
    'preserves_source_vibe',
    'rewrite_trace_recorded',
  ]);
});

test('prompt renderer compacts ready-to-use prompts even when raw scaffold sections were initially present', () => {
  const renderer = createPromptRenderer();
  const handoff = createSharedRuntimeHandoff({
    sourceVibe: '신규 가입자에게 보내는 환영 이메일 프롬프트 만들어줘',
    validationReport: {
      severity: 'low',
      needs_clarification: false,
      warning_count: 0,
      blocking_issue_count: 0,
    },
    intentIr: {
      summary: '신규 가입자에게 보내는 환영 이메일 프롬프트 만들어줘',
      intent: {
        target_user: '',
        usage_moment: '',
        user_job: '',
        problem_context: '',
        success_signal: '',
      },
      delivery: {
        must_haves: [
          '환영 이메일 프롬프트 생성 및 수정',
          '개인화 변수(예: {{사용자이름}})를 활용한 이메일 내용 구성',
          '작성된 이메일 프롬프트 미리보기',
          '신규 가입 완료 시 자동 이메일 발송 트리거',
        ],
        nice_to_haves: [],
      },
      analysis: {
        risks: [],
        missing_information: ['email tone'],
        clarification_questions: [],
      },
      signals: {
        confidence: 'medium',
        needs_clarification: false,
        severity: 'low',
        warning_count: 0,
        blocking_issue_count: 0,
      },
    },
  });

  const result = renderer.buildPromptOutput(handoff);

  assert.equal(result.validation.status, 'ready');
  assert.doesNotMatch(result.final_prompt, /Original request:/);
  assert.doesNotMatch(result.final_prompt, /Suggested workflow:/);
  assert.doesNotMatch(result.final_prompt, /Before finalizing:/);
  assert.match(result.final_prompt, /신규 가입자에게 보내는 환영 이메일 프롬프트 만들어줘/);
  assert.match(result.final_prompt, /조건:/);
  assert.match(result.final_prompt, /출력 형식:/);
  assert.match(result.final_prompt, /제목:/);
  assert.match(result.final_prompt, /본문:/);
  assert.doesNotMatch(result.final_prompt, /Task:/);
  assert.doesNotMatch(result.final_prompt, /Constraints and priorities:/);
  assert.doesNotMatch(result.final_prompt, /Output format:/);
  assert.match(result.final_prompt, /개인화 요소/);
  assert.match(result.final_prompt, /템플릿 형태/);
  assert.doesNotMatch(result.final_prompt, /로깅/);
  assert.doesNotMatch(result.final_prompt, /자동 이메일 발송 트리거/);
});

test('prompt renderer rewrites spec-like email constraints into writing-friendly ready-to-use constraints', () => {
  const renderer = createPromptRenderer();
  const handoff = createSharedRuntimeHandoff({
    sourceVibe: '신규 가입자에게 보내는 환영 이메일 작성해줘',
    validationReport: {
      severity: 'low',
      needs_clarification: false,
      warning_count: 0,
      blocking_issue_count: 0,
    },
    intentIr: {
      summary: '신규 가입자에게 보내는 환영 이메일 작성해줘',
      intent: {
        target_user: '',
        usage_moment: '',
        user_job: '',
        problem_context: '',
        success_signal: '',
      },
      delivery: {
        must_haves: [
          '회원 가입 완료 시 환영 이메일 자동 발송',
          '환영 이메일 템플릿 관리 (제목, 본문, 발신자 정보)',
          '이메일 발송 성공/실패 로깅',
        ],
        nice_to_haves: [],
      },
      analysis: {
        risks: [],
        missing_information: [],
        clarification_questions: [],
      },
      signals: {
        confidence: 'medium',
        needs_clarification: false,
        severity: 'low',
        warning_count: 0,
        blocking_issue_count: 0,
      },
    },
  });

  const result = renderer.buildPromptOutput(handoff);

  assert.equal(result.validation.status, 'ready');
  assert.match(result.final_prompt, /회원가입 직후 보내는 첫 환영 이메일/);
  assert.match(result.final_prompt, /제목과 본문을 수정 가능한 템플릿 형태/);
  assert.doesNotMatch(result.final_prompt, /자동 발송/);
  assert.doesNotMatch(result.final_prompt, /템플릿 관리/);
  assert.doesNotMatch(result.final_prompt, /성공\/실패 로깅/);
});

test('prompt renderer keeps short summary prompts compact without email-style output scaffold', () => {
  const renderer = createPromptRenderer();
  const handoff = createSharedRuntimeHandoff({
    sourceVibe: '회의록 3줄 요약 프롬프트 만들어줘',
    validationReport: {
      severity: 'low',
      needs_clarification: false,
      warning_count: 0,
      blocking_issue_count: 0,
    },
    intentIr: {
      summary: '회의록을 핵심만 3줄로 요약하는 프롬프트를 만들어줘',
      intent: {
        target_user: '',
        usage_moment: '',
        user_job: '',
        problem_context: '',
        success_signal: '',
      },
      delivery: {
        must_haves: [
          '회의록 3줄 요약 프롬프트 생성',
          '생성된 프롬프트 복사 기능',
        ],
        nice_to_haves: [],
      },
      analysis: {
        risks: [],
        missing_information: [],
        clarification_questions: [],
      },
      signals: {
        confidence: 'medium',
        needs_clarification: false,
        severity: 'low',
        warning_count: 0,
        blocking_issue_count: 0,
      },
    },
  });

  const result = renderer.buildPromptOutput(handoff);

  assert.equal(result.validation.status, 'ready');
  assert.match(result.final_prompt, /회의록을 핵심만 3줄로 요약하는 프롬프트를 만들어줘/);
  assert.match(result.final_prompt, /조건:/);
  assert.match(result.final_prompt, /회의록의 핵심만 3줄로 압축하게 한다/);
  assert.doesNotMatch(result.final_prompt, /Original request:/);
  assert.doesNotMatch(result.final_prompt, /Suggested workflow:/);
  assert.doesNotMatch(result.final_prompt, /Before finalizing:/);
  assert.doesNotMatch(result.final_prompt, /출력 형식:/);
  assert.doesNotMatch(result.final_prompt, /제목:/);
  assert.doesNotMatch(result.final_prompt, /본문:/);
  assert.doesNotMatch(result.final_prompt, /복사 기능/);
});

test('prompt renderer keeps short planning prompts compact without forcing email sections', () => {
  const renderer = createPromptRenderer();
  const handoff = createSharedRuntimeHandoff({
    sourceVibe: '도쿄 2박 3일 일정 짜는 프롬프트 만들어줘',
    validationReport: {
      severity: 'low',
      needs_clarification: false,
      warning_count: 0,
      blocking_issue_count: 0,
    },
    intentIr: {
      summary: '도쿄 2박 3일 여행 일정을 짜는 프롬프트를 만들어줘',
      intent: {
        target_user: '',
        usage_moment: '',
        user_job: '',
        problem_context: '',
        success_signal: '',
      },
      delivery: {
        must_haves: [
          '사용자 입력 기반 2박 3일 도쿄 여행 일정 생성',
          '날짜별, 시간대별(오전/오후) 활동 및 장소 추천',
          '주요 관광지, 맛집, 쇼핑 장소 등 카테고리별 추천',
        ],
        nice_to_haves: [],
      },
      analysis: {
        risks: [],
        missing_information: [],
        clarification_questions: [],
      },
      signals: {
        confidence: 'medium',
        needs_clarification: false,
        severity: 'low',
        warning_count: 0,
        blocking_issue_count: 0,
      },
    },
  });

  const result = renderer.buildPromptOutput(handoff);

  assert.equal(result.validation.status, 'ready');
  assert.match(result.final_prompt, /도쿄 2박 3일 여행 일정을 짜는 프롬프트를 만들어줘/);
  assert.match(result.final_prompt, /조건:/);
  assert.match(result.final_prompt, /여행자 조건을 반영해 도쿄 2박 3일 일정을 짠다/);
  assert.match(result.final_prompt, /날짜별로 오전과 오후 일정을 나눠 활동과 장소를 제안한다/);
  assert.match(result.final_prompt, /관광지, 맛집, 쇼핑 장소를 균형 있게 섞어 추천한다/);
  assert.doesNotMatch(result.final_prompt, /Original request:/);
  assert.doesNotMatch(result.final_prompt, /Suggested workflow:/);
  assert.doesNotMatch(result.final_prompt, /Before finalizing:/);
  assert.doesNotMatch(result.final_prompt, /출력 형식:/);
  assert.doesNotMatch(result.final_prompt, /제목:/);
  assert.doesNotMatch(result.final_prompt, /본문:/);
});

test('prompt renderer keeps short marketing prompts lightweight instead of falling back to email scaffold', () => {
  const renderer = createPromptRenderer();
  const handoff = createSharedRuntimeHandoff({
    sourceVibe: '인스타 신제품 홍보 문구 프롬프트 만들어줘',
    validationReport: {
      severity: 'low',
      needs_clarification: false,
      warning_count: 0,
      blocking_issue_count: 0,
    },
    intentIr: {
      summary: '신제품 인스타그램 홍보 문구를 만드는 프롬프트를 작성해줘',
      intent: {
        target_user: '',
        usage_moment: '',
        user_job: '',
        problem_context: '',
        success_signal: '',
      },
      delivery: {
        must_haves: [
          '제품 정보 입력 (제품명, 특징, 타겟 고객 등)',
          'AI 기반 홍보 문구 생성',
          '생성된 문구 목록 확인 및 선택',
          '문구 복사 기능',
        ],
        nice_to_haves: [],
      },
      analysis: {
        risks: [],
        missing_information: [],
        clarification_questions: [],
      },
      signals: {
        confidence: 'medium',
        needs_clarification: false,
        severity: 'low',
        warning_count: 0,
        blocking_issue_count: 0,
      },
    },
  });

  const result = renderer.buildPromptOutput(handoff);

  assert.equal(result.validation.status, 'ready');
  assert.match(result.final_prompt, /신제품 인스타그램 홍보 문구를 만드는 프롬프트를 작성해줘/);
  assert.match(result.final_prompt, /조건:/);
  assert.match(result.final_prompt, /제품명, 특징, 타겟 고객 정보를 반영해 문구를 만든다/);
  assert.match(result.final_prompt, /인스타그램용 홍보 문구를 여러 개 제안한다/);
  assert.match(result.final_prompt, /후보 문구를 비교해 바로 고르기 쉽게 정리한다/);
  assert.doesNotMatch(result.final_prompt, /Original request:/);
  assert.doesNotMatch(result.final_prompt, /Suggested workflow:/);
  assert.doesNotMatch(result.final_prompt, /Before finalizing:/);
  assert.doesNotMatch(result.final_prompt, /출력 형식:/);
  assert.doesNotMatch(result.final_prompt, /제목:/);
  assert.doesNotMatch(result.final_prompt, /본문:/);
  assert.doesNotMatch(result.final_prompt, /문구 복사 기능/);
});

test('prompt renderer keeps short announcement prompts compact and prompt-like', () => {
  const renderer = createPromptRenderer();
  const handoff = createSharedRuntimeHandoff({
    sourceVibe: '서비스 점검 안내문 작성 프롬프트 만들어줘',
    validationReport: {
      severity: 'low',
      needs_clarification: false,
      warning_count: 0,
      blocking_issue_count: 0,
    },
    intentIr: {
      summary: '서비스 점검 안내문을 작성하는 프롬프트를 만들어줘',
      intent: {
        target_user: '',
        usage_moment: '',
        user_job: '',
        problem_context: '',
        success_signal: '',
      },
      delivery: {
        must_haves: [
          '점검 유형(정기/긴급) 선택',
          '점검 시작/종료 시간 입력',
          '점검 영향 범위(전체/일부 기능) 선택 및 상세 입력',
          '안내문 미리보기',
        ],
        nice_to_haves: [],
      },
      analysis: {
        risks: [],
        missing_information: [],
        clarification_questions: [],
      },
      signals: {
        confidence: 'medium',
        needs_clarification: false,
        severity: 'low',
        warning_count: 0,
        blocking_issue_count: 0,
      },
    },
  });

  const result = renderer.buildPromptOutput(handoff);

  assert.equal(result.validation.status, 'ready');
  assert.match(result.final_prompt, /서비스 점검 안내문을 작성하는 프롬프트를 만들어줘/);
  assert.match(result.final_prompt, /조건:/);
  assert.match(result.final_prompt, /점검 유형이 정기인지 긴급인지 분명히 반영한다/);
  assert.match(result.final_prompt, /점검 시작 시간과 종료 시간을 명확히 넣는다/);
  assert.match(result.final_prompt, /점검 영향 범위와 영향을 받는 기능을 구체적으로 적는다/);
  assert.doesNotMatch(result.final_prompt, /Original request:/);
  assert.doesNotMatch(result.final_prompt, /Suggested workflow:/);
  assert.doesNotMatch(result.final_prompt, /Before finalizing:/);
  assert.doesNotMatch(result.final_prompt, /출력 형식:/);
  assert.doesNotMatch(result.final_prompt, /제목:/);
  assert.doesNotMatch(result.final_prompt, /본문:/);
  assert.doesNotMatch(result.final_prompt, /안내문 미리보기/);
});


test('prompt validation marks empty prompt as review_before_use', () => {
  const result = buildPromptValidation({
    sourceVibe: 'Write a launch email prompt.',
    finalPrompt: '',
    rewriteMode: 'pass_through',
    appliedTechniques: [],
  });

  assert.equal(result.status, 'review');
  assert.equal(result.summary_code, 'review_before_use');
  assert.equal(result.summary, '최종 프롬프트가 비어 있어 바로 사용할 수 없습니다.');
  assert.deepEqual(result.warnings, [
    '\uCD5C\uC885 \uD504\uB86C\uD504\uD2B8\uAC00 \uBE44\uC5B4 \uC788\uC2B5\uB2C8\uB2E4.',
    '\uC815\uB9AC \uACFC\uC815\uC5D0\uC11C \uC6D0\uBB38 \uC758\uB3C4\uAC00 \uD750\uB824\uC84C\uC2B5\uB2C8\uB2E4.',
  ]);
  assert.deepEqual(result.reason_codes, ['empty_prompt', 'loses_source_vibe']);
  assert.deepEqual(result.reason_details, [
    '실제로 복사해 사용할 최종 프롬프트 문장이 아직 비어 있습니다.',
    '원문 요청의 핵심 의도가 최종 프롬프트 안에서 약해졌을 수 있습니다.',
    '바로 보완할 수 있는 추가 확인 질문이 함께 준비되어 있습니다.',
  ]);
  assert.deepEqual(result.suggested_questions, [
    '이번에 실제로 만들고 싶은 최종 산출물을 한 문장으로 다시 적어 주세요.',
    '최종 프롬프트에 반드시 남아야 하는 핵심 의도나 요구 1~2개를 짧게 적어 주세요.',
  ]);
  assert.deepEqual(result.suggested_question_details, [
    {
      question: '이번에 실제로 만들고 싶은 최종 산출물을 한 문장으로 다시 적어 주세요.',
      intent_key: 'deliverable',
      source: 'prompt_validation',
      reason_code: 'empty_prompt',
    },
    {
      question: '최종 프롬프트에 반드시 남아야 하는 핵심 의도나 요구 1~2개를 짧게 적어 주세요.',
      intent_key: 'source_vibe',
      source: 'prompt_validation',
      reason_code: 'loses_source_vibe',
    },
  ]);
});

test('prompt validation marks refined prompt without technique trace as review_before_use', () => {
  const result = buildPromptValidation({
    sourceVibe: 'Need something for launch',
    finalPrompt: 'Original request:\nNeed something for launch',
    rewriteMode: 'structured_refine',
    appliedTechniques: [],
  });

  assert.equal(result.status, 'review');
  assert.equal(result.summary_code, 'review_before_use');
  assert.equal(result.summary, '현재 프롬프트는 정제 이유가 충분히 남지 않아 한 번 검토하고 쓰는 편이 안전합니다.');
  assert.deepEqual(result.warnings, ['\uC815\uC81C\uB41C \uD504\uB86C\uD504\uD2B8\uC778\uB370 \uAE30\uB85D\uB41C \uAE30\uBC95\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.']);
  assert.deepEqual(result.reason_codes, ['missing_technique_trace']);
  assert.deepEqual(result.reason_details, [
    '정제된 결과인데 어떤 기준으로 구조화했는지 추적 정보가 부족합니다.',
    '바로 보완할 수 있는 추가 확인 질문이 함께 준비되어 있습니다.',
  ]);
  assert.equal(result.needs_clarification, true);
  assert.deepEqual(result.suggested_questions, [
    '이 프롬프트에서 반드시 지켜야 할 구조나 형식은 무엇인가요?',
  ]);
});


test('prompt validation exposes prompt-first clarification questions for review-needed output', () => {
  const result = buildPromptValidation({
    sourceVibe: 'Need something for launch',
    finalPrompt: 'Original request:\nNeed something for launch',
    rewriteMode: 'structured_refine',
    appliedTechniques: [],
    sharedRuntimeHandoff: createSharedRuntimeHandoff({
      intentIr: {
        summary: 'Need something for launch',
        intent: {
          target_user: '',
          usage_moment: '',
          user_job: '',
          problem_context: '',
          success_signal: '',
        },
        delivery: {
          must_haves: [],
          nice_to_haves: [],
        },
        analysis: {
          risks: [],
          missing_information: ['launch date'],
          clarification_questions: ['Who is the email for?'],
        },
        signals: {
          confidence: 'low',
          needs_clarification: true,
          severity: 'medium',
          warning_count: 1,
          blocking_issue_count: 0,
        },
      },
    }),
  });

  assert.equal(result.needs_clarification, true);
  assert.deepEqual(result.suggested_questions, [
    'Who is the email for?',
    '이 프롬프트에 반영할 일정이나 날짜는 무엇인가요?',
    '이 프롬프트에서 반드시 지켜야 할 구조나 형식은 무엇인가요?',
  ]);
  assert.deepEqual(result.suggested_question_details, [
    {
      question: 'Who is the email for?',
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
      question: '이 프롬프트에서 반드시 지켜야 할 구조나 형식은 무엇인가요?',
      intent_key: 'structure',
      source: 'prompt_validation',
      reason_code: 'missing_technique_trace',
    },
  ]);
  assert.equal(
    result.summary,
    '현재 프롬프트는 정제 이유가 충분히 남지 않아 한 번 검토하고 쓰는 편이 안전합니다.',
  );
  assert.deepEqual(result.reason_details, [
    '정제된 결과인데 어떤 기준으로 구조화했는지 추적 정보가 부족합니다.',
    '아직 확정되지 않은 정보가 있어 결과 편차가 남을 수 있습니다: launch date.',
    '바로 보완할 수 있는 추가 확인 질문이 함께 준비되어 있습니다.',
  ]);
});

test('prompt validation translates upstream validation blockers into prompt-native review reasons', () => {
  const result = buildPromptValidation({
    sourceVibe: 'Write a launch plan prompt',
    finalPrompt: 'Original request:\nWrite a launch plan prompt\n\nTask:\nWrite a launch plan prompt',
    rewriteMode: 'structured_refine',
    appliedTechniques: [{ id: 'goal_clarification' }],
    sharedRuntimeHandoff: createSharedRuntimeHandoff({
      validationReport: {
        severity: 'high',
        needs_clarification: true,
        warning_count: 2,
        blocking_issue_count: 1,
        blocking_issues: [
          { id: 'missing_problem_success', message: '문제정의 5칸: 성공기준이 비어 있습니다.' },
        ],
        warnings: [
          '문제정의 5칸: 성공기준이 비어 있습니다.',
          '권한 규칙이 비어 있습니다.',
        ],
        suggested_questions: [
          '완료를 어떻게 판단할지 성공 기준을 알려주세요.',
          '역할별로 조회, 생성, 수정, 삭제 권한 차이가 필요한지 알려주세요.',
        ],
      },
      intentIr: {
        summary: 'Write a launch plan prompt',
        intent: {
          target_user: 'ops team',
          usage_moment: 'launch prep',
          user_job: 'write a launch plan prompt',
          problem_context: 'Need a reusable launch-planning prompt.',
          success_signal: '',
        },
        delivery: {
          must_haves: ['timeline'],
          nice_to_haves: [],
        },
        analysis: {
          risks: [],
          missing_information: [],
          clarification_questions: [],
        },
        signals: {
          confidence: 'medium',
          needs_clarification: true,
          severity: 'high',
          warning_count: 2,
          blocking_issue_count: 1,
        },
      },
    }),
  });

  assert.equal(result.status, 'review');
  assert.equal(result.summary_code, 'review_before_use');
  assert.equal(result.summary, '현재 프롬프트는 결과 품질을 좌우하는 핵심 입력 조건이 아직 덜 고정돼 있어 한 번 검토하고 쓰는 편이 안전합니다.');
  assert.deepEqual(result.reason_codes, [
    'validation_missing_success_criteria',
    'validation_missing_permissions',
  ]);
  assert.deepEqual(result.warnings, [
    '좋은 결과를 판단할 성공 기준이 아직 약합니다.',
    '역할별 권한이나 허용 범위를 반영해야 하는지 아직 분명하지 않습니다.',
  ]);
  assert.deepEqual(result.reason_details, [
    '이 프롬프트의 결과가 충분히 좋은지 판단할 기준이나 확인 포인트가 아직 부족합니다.',
    '이 프롬프트가 역할별 허용 범위나 권한 차이를 반영해야 하는지 아직 고정되지 않았습니다.',
    '바로 보완할 수 있는 추가 확인 질문이 함께 준비되어 있습니다.',
  ]);
  assert.deepEqual(result.suggested_questions, [
    '이 프롬프트의 결과가 충분히 좋다고 볼 기준은 무엇인가요?',
    '역할별 권한이나 허용 범위를 이 프롬프트에 반영해야 하나요?',
    '완료를 어떻게 판단할지 성공 기준을 알려주세요.',
  ]);
  assert.deepEqual(result.suggested_question_details, [
    {
      question: '이 프롬프트의 결과가 충분히 좋다고 볼 기준은 무엇인가요?',
      intent_key: 'success_criteria',
      source: 'prompt_validation_signal',
      reason_code: 'validation_missing_success_criteria',
    },
    {
      question: '역할별 권한이나 허용 범위를 이 프롬프트에 반영해야 하나요?',
      intent_key: 'permissions',
      source: 'prompt_validation_signal',
      reason_code: 'validation_missing_permissions',
    },
    {
      question: '완료를 어떻게 판단할지 성공 기준을 알려주세요.',
      intent_key: 'success_criteria',
      source: 'validation_report',
    },
  ]);
});
