import React, { useMemo } from 'react';
import WorkspaceStatusCard from './WorkspaceStatusCard.jsx';
import { useExperiencedSummary } from './hooks/useExperiencedSummary.js';
import { buildExperiencedSummaryModel } from './experienced-workspace/buildExperiencedSummaryModel.js';

function getPromptValidationStatusLabel(status) {
  if (status === 'review') return '한 번 검토 후 사용';
  return '바로 사용 가능';
}

function getRewriteModeLabel(mode) {
  const labels = {
    pass_through: '그대로 통과',
    light_refine: '가볍게 정제',
    structured_refine: '구조화 정제',
  };
  return labels[String(mode || '').trim()] || String(mode || '').trim() || '판단 전';
}

function getSignalValueLabel(value) {
  const labels = {
    high: '높음',
    medium: '보통',
    low: '낮음',
  };
  const normalized = String(value || '').trim();
  return labels[normalized] || normalized;
}

function getSignalLabel(key, value) {
  if (value === null || value === undefined || value === '') return '';

  const labels = {
    goal_clarity: '목표가 얼마나 분명한가',
    constraint_clarity: '제약 조건이 얼마나 분명한가',
    output_format_clarity: '원하는 출력 형식이 얼마나 분명한가',
    ambiguity_level: '입력의 모호성이 어느 정도인가',
    source_structure: '입력 자체가 어느 정도 구조화되어 있는가',
    safe_to_pass_through: '원문만으로도 결과 편차가 낮은가',
    has_audience_hint: '대상 독자 힌트가 포함되어 있는가',
  };
  const label = labels[key] || key;

  if (value === true) return label + ': 예';
  if (value === false) return label + ': 아니오';
  return label + ': ' + getSignalValueLabel(value);
}

function getTechniqueLabel(label) {
  const labels = {
    'Zero-shot pass-through': '제로샷 그대로 통과',
    'Goal clarification': '목표 명확화',
    'Role assignment': '역할 부여',
    'Constraint expansion': '제약 조건 확장',
    'Output format lock': '출력 형식 고정',
    'Context structuring': '맥락 구조화',
    'Step decomposition': '단계 분해',
    'Quality checklist injection': '품질 체크리스트 주입',
  };

  const normalized = String(label || '').trim();
  return labels[normalized] || normalized;
}

function getTechniqueWhy(why) {
  const labels = {
    'The source vibe is already explicit enough for direct zero-shot use.': '원문 요청이 이미 충분히 분명해서 거의 그대로 사용해도 됩니다.',
    'The task or success condition needs a clearer headline before prompting.': '프롬프트를 만들기 전에 작업 목표나 성공 조건을 더 선명하게 드러낼 필요가 있었습니다.',
    'The request does not clearly frame who the answer should serve.': '이 요청이 누구를 위한 답인지 분명하지 않아 대상 프레임을 보강했습니다.',
    'Must-have requirements and limits should be surfaced explicitly.': '필수 요구사항과 제한 조건을 더 분명하게 꺼내 적는 편이 안전했습니다.',
    'The vibe does not reliably lock the response shape yet.': '원문만으로는 원하는 응답 형식이 충분히 고정되지 않았습니다.',
    'The request benefits from a stable context block before execution.': '실행 전에 안정적인 맥락 블록으로 정리하는 편이 도움이 됐습니다.',
    'Breaking the task into a short workflow reduces ambiguity.': '작업을 짧은 단계로 나누면 모호함을 줄일 수 있었습니다.',
    'The output should explicitly guard against hidden assumptions and missing constraints.': '숨은 가정이나 빠진 제약을 놓치지 않도록 마지막 점검 장치를 넣었습니다.',
    'A light rewrite still needs a stable task headline.': '가벼운 정제만 하더라도 안정적인 작업 한 줄 요약은 필요했습니다.',
    'Pass-through mode avoids unnecessary rewriting.': '이번 결과에서는 불필요한 재작성을 피하기 위해 이 기법을 쓰지 않았습니다.',
    'This technique was not necessary for the current intent signals.': '현재 입력 신호 기준으로는 이 기법이 꼭 필요하지 않았습니다.',
  };

  const normalized = String(why || '').trim();
  return labels[normalized] || normalized;
}

function getRewriteRationaleSummary(summaryCode, rewriteMode) {
  const labels = {
    pass_through_clear_enough: '입력이 이미 충분히 분명해서, 불필요한 재작성 없이 거의 그대로 통과했습니다.',
    light_refine_add_structure: '핵심 요청은 살아 있었지만, 바로 쓰기 좋게 약한 구조만 덧붙였습니다.',
    structured_refine_reduce_risk: '모호함과 누락 정보를 줄이기 위해 더 강한 구조화 정제를 선택했습니다.',
  };

  const normalizedCode = String(summaryCode || '').trim();
  if (labels[normalizedCode]) return labels[normalizedCode];

  if (rewriteMode === 'pass_through') return labels.pass_through_clear_enough;
  if (rewriteMode === 'structured_refine') return labels.structured_refine_reduce_risk;
  if (rewriteMode === 'light_refine') return labels.light_refine_add_structure;
  return '이번 프롬프트는 현재 입력 신호를 기준으로 가장 안정적인 구조화 방식을 선택했습니다.';
}

function getRewriteRationaleReason(reasonCode) {
  const labels = {
    goal_clear: '사용자 요청의 목표가 이미 비교적 분명했습니다.',
    constraints_or_format_clear: '제약 조건이나 원하는 출력 형식 힌트가 이미 포함되어 있었습니다.',
    source_already_structured: '입력 자체가 문장 구조나 목록 형태로 어느 정도 정리되어 있었습니다.',
    low_ambiguity: '검증 단계에서 큰 모호성 신호가 거의 없었습니다.',
    goal_needs_clarification: '목표나 성공 조건을 더 선명하게 드러낼 필요가 있었습니다.',
    high_ambiguity: '모호성 신호가 높아서 그대로 쓰면 결과 편차가 커질 수 있었습니다.',
    missing_information: '누락된 정보가 보여서 질문이나 안전장치가 필요했습니다.',
    validation_flags: '검증 경고 또는 차단 신호가 있어 더 안전한 구조가 필요했습니다.',
    goal_partially_clear: '핵심 요청은 보였지만 바로 실행하기에는 목표 설명이 조금 부족했습니다.',
    structure_would_help: '출력 형식이나 제약 조건을 더 분명히 적는 편이 안정적이었습니다.',
    some_ambiguity: '약간의 모호성이 있어 가벼운 정제가 도움이 됐습니다.',
    light_touch_enough: '큰 재작성 없이도 짧은 정리만으로 충분했습니다.',
  };

  return labels[String(reasonCode || '').trim()] || '';
}

function getPromptValidationSummary(summaryCode, status) {
  const labels = {
    ready_to_use: '현재 프롬프트는 바로 쓸 수 있는 상태로 정리됐습니다.',
    review_before_use: '현재 프롬프트는 한 번 검토하고 쓰는 편이 안전합니다.',
  };

  const normalizedCode = String(summaryCode || '').trim();
  if (labels[normalizedCode]) return labels[normalizedCode];
  if (status === 'review') return labels.review_before_use;
  return labels.ready_to_use;
}

function getPromptValidationReason(reasonCode) {
  const labels = {
    preserves_source_vibe: '원문 의도가 최종 프롬프트에 그대로 남아 있습니다.',
    ready_for_direct_use: '추가 수정 없이 거의 바로 복사해 쓸 수 있습니다.',
    rewrite_trace_recorded: '적용된 정제 기법이 기록돼 있어 이유를 따라가기 쉽습니다.',
    empty_prompt: '최종 프롬프트가 비어 있습니다.',
    loses_source_vibe: '정리 과정에서 원문 의도가 흐려졌습니다.',
    missing_technique_trace: '정제된 프롬프트인데 기록된 기법이 없습니다.',
  };

  return labels[String(reasonCode || '').trim()] || '';
}

function getPromptValidationTrustTitle(status) {
  if (status === 'review') return '바로 복사하기 전에 한 번만 검토하세요';
  return '이 프롬프트는 바로 사용해도 됩니다';
}

function getPromptValidationTrustLead(status, warningCount, questionCount) {
  if (status === 'review') {
    if (questionCount > 0) return '검토가 필요한 이유와 함께, 먼저 보완하면 좋은 질문을 바로 확인할 수 있습니다.';
    if (warningCount > 0) return '검토가 필요한 이유를 먼저 확인한 뒤, 아래 메모를 보고 원문 의도가 유지됐는지 점검하세요.';
    return '큰 오류는 아니지만, 복사하기 전에 아래 포인트를 한 번 확인하는 편이 안전합니다.';
  }

  return '검증 신호상 큰 문제 없이 바로 사용할 수 있는 상태입니다.';
}

function getPromptValidationTrustAction(reasonCode) {
  const labels = {
    empty_prompt: '최종 프롬프트가 비어 있지 않은지 먼저 확인하세요.',
    loses_source_vibe: '원문 입력과 최종 프롬프트를 비교해 의도가 흐려지지 않았는지 확인하세요.',
    missing_technique_trace: '왜 이렇게 정리됐는지 설명이 비어 있으니 구조화 판단 요약과 적용 기법을 함께 확인하세요.',
    preserves_source_vibe: '원문 의도는 유지됐으니 바로 복사해 사용해도 괜찮습니다.',
    ready_for_direct_use: '추가 수정 없이 바로 붙여 넣어도 될 가능성이 높습니다.',
    rewrite_trace_recorded: '적용된 기법과 검증 메모가 함께 남아 있어 추적 가능한 상태입니다.',
  };

  return labels[String(reasonCode || '').trim()] || '';
}

function buildPromptValidationTrustChecklist({ status, reasonCodes, warnings, questions }) {
  const checklist = [];

  reasonCodes.forEach((code) => {
    const action = getPromptValidationTrustAction(code);
    if (action && !checklist.includes(action)) {
      checklist.push(action);
    }
  });

  if (status === 'review' && questions.length > 0) {
    checklist.push('아래 추가 확인 질문에 답하면 다음 결과가 더 안정적으로 정리됩니다.');
  }

  if (status === 'review' && checklist.length === 0 && warnings.length > 0) {
    checklist.push('아래 검증 메모를 위에서부터 확인하면서 바로 복사해도 되는지 점검하세요.');
  }

  if (status !== 'review' && checklist.length === 0) {
    checklist.push('현재 검증 기준에서는 별도 재작성 없이 그대로 사용 가능한 상태입니다.');
  }

  return checklist.slice(0, 3);
}

const PROMPT_WORKFLOW_STEPS = [
  {
    title: '1. 자연어 입력',
    body: '하고 싶은 일을 한 문장 또는 짧은 문단으로 입력합니다.',
  },
  {
    title: '2. 구조화 판단',
    body: '엔진이 그대로 통과할지, 가볍게 다듬을지, 더 강한 구조화가 필요한지 결정합니다.',
  },
  {
    title: '3. 이유와 함께 출력',
    body: '최종 프롬프트와 적용된 기법, 검증 메모를 함께 확인합니다.',
  },
];

function buildPromptWorkspaceStatus(state) {
  if (state.status === 'processing') {
    return {
      tone: 'processing',
      title: '프롬프트 구조화 중',
      body: '입력 의도, 제약, 출력 형식을 바탕으로 최종 프롬프트와 구조화 이유를 정리하고 있습니다.',
      items: ['구조화 방식 결정', '적용 기법 선택', '검증 메모 정리'],
    };
  }

  if (state.status === 'error') {
    return {
      tone: 'error',
      title: '프롬프트 구조화 실패',
      body: '오류: ' + (state.errorMessage || '알 수 없는 오류'),
      items: ['입력을 조금 더 구체적으로 적기', 'API 또는 모델 설정 확인', '다시 프롬프트 구조화 시도'],
    };
  }

  return {
    tone: 'idle',
    title: '아직 프롬프트 생성 전',
    body: '자연어 입력을 적고 프롬프트 구조화 버튼을 누르면, 최종 프롬프트와 구조화 이유를 함께 보여줍니다.',
    items: ['자연어 입력 작성', '프롬프트 구조화 실행', '적용 기법과 검증 메모 확인'],
  };
}

export default function ExperiencedWorkspace({
  state,
  derived,
  actions,
  showModeIntro = true,
  showApiSettings = true,
}) {
  const providerLabel = derived.providerOptions.find((provider) => provider.id === state.apiProvider)?.label || state.apiProvider;
  const modelLabel = state.isModelOptionsLoading
    ? '불러오는 중'
    : (state.selectedModel || state.modelOptions[0] || state.activeModel || '선택 안 됨');

  const summaryModel = useMemo(
    () => buildExperiencedSummaryModel({ derived, stateVibe: state.vibe }),
    [derived.clarifyLoop, derived.promptOutput, state.vibe],
  );
  const {
    topWarnings,
    quickRequest,
    quickAiPrompt,
    rewriteMode,
    appliedTechniqueCount,
    promptCopyStatus,
    handleCopyExperiencedPrompt,
    validationQuestions,
    clarifyAnswers,
    clarifyLoopTurn,
    canSubmitClarification,
  } = useExperiencedSummary({
    summaryModel,
  });

  const promptOutput = derived.promptOutput && typeof derived.promptOutput === 'object' ? derived.promptOutput : {};
  const appliedTechniques = Array.isArray(promptOutput.applied_techniques) ? promptOutput.applied_techniques : [];
  const skippedTechniques = Array.isArray(promptOutput.skipped_techniques) ? promptOutput.skipped_techniques : [];
  const selectionSignals = promptOutput.selection_signals && typeof promptOutput.selection_signals === 'object'
    ? promptOutput.selection_signals
    : {};
  const rewriteRationale = promptOutput.rewrite_rationale && typeof promptOutput.rewrite_rationale === 'object'
    ? promptOutput.rewrite_rationale
    : {};
  const promptValidation = promptOutput.validation && typeof promptOutput.validation === 'object' ? promptOutput.validation : {};
  const validationWarnings = Array.isArray(promptValidation.warnings) ? promptValidation.warnings : [];
  const validationReasonCodes = Array.isArray(promptValidation.reason_codes) ? promptValidation.reason_codes : [];
  const validationSummary = typeof promptValidation.summary === 'string' && promptValidation.summary.trim()
    ? promptValidation.summary.trim()
    : getPromptValidationSummary(promptValidation.summary_code, promptValidation.status);
  const validationReasons = (Array.isArray(promptValidation.reason_details) ? promptValidation.reason_details : [])
    .map((item) => String(item || '').trim())
    .filter(Boolean);
  const fallbackValidationReasons = validationReasonCodes
    .map((code) => getPromptValidationReason(code))
    .filter(Boolean);
  const validationTrustChecklist = buildPromptValidationTrustChecklist({
    status: promptValidation.status,
    reasonCodes: validationReasonCodes,
    warnings: validationWarnings,
    questions: validationQuestions,
  });
  const rewriteRationaleSummary = getRewriteRationaleSummary(rewriteRationale.summary_code, rewriteMode);
  const rewriteRationaleReasons = (Array.isArray(rewriteRationale.reason_codes) ? rewriteRationale.reason_codes : [])
    .map((code) => getRewriteRationaleReason(code))
    .filter(Boolean);
  const signalEntries = Object.entries(selectionSignals)
    .map(([key, value]) => getSignalLabel(key, value))
    .filter(Boolean);
  const sourceVibe = typeof promptOutput.source_vibe === 'string' && promptOutput.source_vibe.trim()
    ? promptOutput.source_vibe.trim()
    : (quickRequest || state.vibe || '');
  const statusCard = buildPromptWorkspaceStatus(state);

  return (
    <section className="experienced-workspace">
      {showModeIntro && (
        <section className="panel persona-brief persona-brief-experienced">
          <div className="panel-head">
            <h2>프롬프트 구조화 워크스페이스</h2>
            <p>입력창 하나로 최종 프롬프트를 만들고, 왜 이런 형태로 구조화되었는지 함께 확인하는 화면입니다.</p>
          </div>
          <div className="signal-pills">
            <span className="pill">단일 입력</span>
            <span className="pill">프롬프트 단일 출력</span>
            <span className="pill">구조화 이유 표시</span>
          </div>
          <p className="small-muted persona-mode-note">
            이 화면의 핵심은 스펙 산출물이 아니라, 최종 프롬프트와 그 구조화 이유를 바로 이해하는 것입니다.
          </p>
        </section>
      )}

      <div className="experienced-compact-grid">
        <section className="panel experienced-control-panel">
          <div className="panel-head">
            <h2>자연어 입력</h2>
            <p>하고 싶은 일을 자연어로 적으면, 엔진이 적절한 정제 수준과 기법을 선택해 프롬프트를 만듭니다.</p>
          </div>

          <div className="signal-pills">
            <span className="pill">프로바이더: {providerLabel}</span>
            <span className="pill">모델: {modelLabel}</span>
          </div>
          <p className="small-muted">
            설정은 유지하되, 이 화면에서는 입력과 결과 설명에 집중합니다.
          </p>

          <div className="checkbox-row">
            <input
              id="experienced-show-thinking"
              type="checkbox"
              checked={state.showThinking}
              onChange={(event) => actions.setShowThinking(event.target.checked)}
              disabled={state.status === 'processing'}
            />
            <label htmlFor="experienced-show-thinking">해석 보조 레이어 포함</label>
          </div>
          <p className="small-muted">
            모델 내부 추론 전체를 여는 기능이 아니라, 결과를 읽기 쉽게 풀어보는 보조 레이어입니다.
          </p>

          <div className="form-group">
            <label htmlFor="experienced-vibe">자연어 입력</label>
            <textarea
              id="experienced-vibe"
              rows={8}
              value={state.vibe}
              onChange={(event) => actions.setVibe(event.target.value)}
              placeholder="원하는 결과를 자연어로 입력하세요. 엔진이 그대로 통과할지, 가볍게 다듬을지, 더 구조화할지 판단합니다."
              disabled={state.status === 'processing'}
            />
          </div>

          {derived.clarifyApplyNotice && (
            <p className="small-muted matrix-notice">{derived.clarifyApplyNotice}</p>
          )}

          <div className="stack-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={actions.handleTransmute}
              disabled={state.status === 'processing' || !state.vibe.trim()}
            >
              {state.status === 'processing' ? '프롬프트 구조화 중...' : '프롬프트 구조화'}
            </button>
            {showApiSettings && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => actions.setIsSettingsOpen(true)}
                disabled={state.status === 'processing'}
              >
                API / 모델 설정 열기
              </button>
            )}
          </div>

          <p className="small-muted experienced-footer-note">
            현재 모델: {state.activeModel}
          </p>
        </section>

        <section className="panel experienced-summary-panel">
          <div className="panel-head">
            <h2>프롬프트 결과</h2>
            <p>최종 프롬프트와 함께, 어떤 기준으로 구조화되었는지 바로 확인합니다.</p>
          </div>

          <section className="experienced-focus-strip">
            <div className="experienced-focus-grid">
              {PROMPT_WORKFLOW_STEPS.map((step) => (
                <article key={step.title} className="experienced-focus-card">
                  <strong>{step.title}</strong>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
          </section>

          {state.status !== 'success' && (
            <WorkspaceStatusCard
              tone={statusCard.tone}
              title={statusCard.title}
              body={statusCard.body}
              items={statusCard.items}
            />
          )}

          {state.status === 'success' && (
            <div className="experienced-summary-stack">
              <div className="signal-pills">
                <span className="pill">현재 모델: {state.activeModel}</span>
                {rewriteMode && <span className="pill">구조화 방식: {getRewriteModeLabel(rewriteMode)}</span>}
                <span className="pill">사용 기법: {appliedTechniqueCount}개</span>
                <span className="pill">검증 상태: {getPromptValidationStatusLabel(promptValidation.status)}</span>
              </div>

              <section className="experienced-summary-card experienced-priority-card">
                <h3>원문 입력</h3>
                <pre className="mono-block experienced-quick-request">
                  {sourceVibe || '원문 입력이 아직 없습니다.'}
                </pre>
              </section>

              <section className="experienced-summary-card experienced-priority-card">
                <h3>{getPromptValidationTrustTitle(promptValidation.status)}</h3>
                <div className="signal-pills">
                  <span className="pill">현재 상태: {getPromptValidationStatusLabel(promptValidation.status)}</span>
                  {promptValidation.status === 'review' && (
                    <span className="pill">검토 메모 {validationWarnings.length || validationReasons.length}개</span>
                  )}
                  {validationQuestions.length > 0 && (
                    <span className="pill">추가 질문 {validationQuestions.length}개</span>
                  )}
                </div>
                <p className="small-muted">
                  {getPromptValidationTrustLead(
                    promptValidation.status,
                    validationWarnings.length,
                    validationQuestions.length,
                  )}
                </p>
                <p>{validationSummary}</p>
                <ul className="experienced-summary-list">
                  {validationTrustChecklist.map((item, idx) => <li key={String(item) + '-' + String(idx)}>{item}</li>)}
                </ul>
              </section>

              <section className="experienced-summary-card experienced-priority-card">
                <h3>적용된 기법</h3>
                {appliedTechniques.length > 0 ? (
                  <ul className="experienced-summary-list">
                    {appliedTechniques.map((technique) => (
                      <li key={technique.id}>
                        <strong>{getTechniqueLabel(technique.label)}</strong>
                        {technique.why ? ': ' + getTechniqueWhy(technique.why) : ''}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="small-muted">이번 결과에서는 별도 기법 적용이 기록되지 않았습니다.</p>
                )}
              </section>

              <section className="experienced-summary-card experienced-priority-card">
                <h3>이번 구조화 판단 요약</h3>
                <p>{rewriteRationaleSummary}</p>
                <ul className="experienced-summary-list">
                  {(rewriteRationaleReasons.length > 0
                    ? rewriteRationaleReasons
                    : ['세부 판단 근거는 아래 판단 신호 카드에서 이어서 확인할 수 있습니다.'])
                    .slice(0, 4)
                    .map((item, idx) => <li key={String(item) + '-' + String(idx)}>{item}</li>)}
                </ul>
              </section>

              <section className="experienced-summary-card experienced-priority-card">
                <h3>구조화 판단 근거</h3>
                <ul className="experienced-summary-list">
                  {(signalEntries.length > 0 ? signalEntries : ['현재 기록된 구조화 판단 신호는 없습니다.'])
                    .slice(0, 6)
                    .map((item, idx) => <li key={String(item) + '-' + String(idx)}>{item}</li>)}
                </ul>
              </section>
              <section className="experienced-summary-card experienced-priority-card">
                <h3>{"\uAC80\uC99D \uC694\uC57D"}</h3>
                <p className="small-muted">{"\uC9C0\uAE08 \uBC14\uB85C \uC368\uB3C4 \uB418\uB294\uC9C0\uB97C \uD55C \uC904\uB85C \uBA3C\uC800 \uC54C\uB824\uC90D\uB2C8\uB2E4."}</p>
                <p>{validationSummary}</p>
                <ul className="experienced-summary-list">
                  {(validationReasons.length > 0
                    ? validationReasons
                    : fallbackValidationReasons.length > 0
                      ? fallbackValidationReasons
                    : ["\uD2B9\uBCC4\uD55C \uAC80\uD1A0 \uC2E0\uD638\uB294 \uC5C6\uC9C0\uB9CC, \uC544\uB798 \uBA54\uBAA8\uB97C \uD55C \uBC88 \uB354 \uD655\uC778\uD558\uBA74 \uC88B\uC2B5\uB2C8\uB2E4."])
                    .slice(0, 3)
                    .map((item, idx) => <li key={String(item) + '-' + String(idx)}>{item}</li>)}
                </ul>
              </section>

              <section className="experienced-summary-card experienced-priority-card">
                <h3>{"\uAC80\uC99D \uBA54\uBAA8"}</h3>
                <p className="small-muted">{"\uACBD\uACE0\uB098 \uBCF4\uC644 \uD3EC\uC778\uD2B8\uB97C \uADF8\uB300\uB85C \uD655\uC778\uD558\uB294 \uCE78\uC785\uB2C8\uB2E4."}</p>
                <ul className="experienced-summary-list">
                  {(validationWarnings.length > 0 ? validationWarnings : topWarnings.length > 0 ? topWarnings : ["\uD604\uC7AC \uAE30\uB85D\uB41C \uAC80\uD1A0 \uBA54\uBAA8\uB294 \uC5C6\uC2B5\uB2C8\uB2E4."])
                    .slice(0, 3)
                    .map((item, idx) => <li key={String(item) + '-' + String(idx)}>{item}</li>)}
                </ul>
              </section>
              {skippedTechniques.length > 0 && (
                <section className="experienced-summary-card experienced-priority-card">
                  <h3>이번엔 쓰지 않은 기법</h3>
                  <ul className="experienced-summary-list">
                    {skippedTechniques.slice(0, 4).map((technique) => (
                      <li key={technique.id}>
                        <strong>{getTechniqueLabel(technique.label)}</strong>
                        {technique.why ? ': ' + getTechniqueWhy(technique.why) : ''}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {validationQuestions.length > 0 && (
                <section className="experienced-summary-card experienced-priority-card">
                  <h3>추가 확인이 필요한 질문</h3>
                  <p className="small-muted">
                    현재 프롬프트를 더 안정적으로 만들기 위해 필요한 정보만 짧게 보완합니다.
                  </p>
                  <div className="stack-actions">
                    <span className="pill">보완 차수: {clarifyLoopTurn}</span>
                    <span className="pill">질문 수: {validationQuestions.length}</span>
                  </div>
                  <div className="form-group">
                    {validationQuestions.map((question) => (
                      <div key={question} className="form-group">
                        <label>{question}</label>
                        <textarea
                          rows={2}
                          value={typeof clarifyAnswers?.[question] === 'string' ? clarifyAnswers[question] : ''}
                          onChange={(event) => actions.setClarifyAnswer(question, event.target.value)}
                          placeholder="확정된 정보만 짧게 입력하세요."
                          disabled={state.status === 'processing'}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="stack-actions">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={actions.handleApplyClarifications}
                      disabled={state.status === 'processing' || !canSubmitClarification}
                    >
                      입력에 반영
                    </button>
                  </div>
                </section>
              )}

              <section className="experienced-summary-card">
                <div className="compact-delivery-head">
                  <div>
                    <h3>최종 프롬프트</h3>
                  </div>
                  <button type="button" className="btn btn-secondary" onClick={handleCopyExperiencedPrompt}>
                    프롬프트 복사
                  </button>
                </div>
                {(rewriteMode || appliedTechniqueCount > 0) && (
                  <div className="signal-pills compact-delivery-meta">
                    {rewriteMode && (
                      <span className="pill">구조화 방식: {getRewriteModeLabel(rewriteMode)}</span>
                    )}
                    {appliedTechniqueCount > 0 && (
                      <span className="pill">사용 기법: {appliedTechniqueCount}개</span>
                    )}
                  </div>
                )}
                <pre className="mono-block compact-delivery-block">
                  {quickAiPrompt || '최종 프롬프트가 아직 없습니다.'}
                </pre>
                <p className="small-muted compact-delivery-status">{promptCopyStatus || '아직 복사 전'}</p>
              </section>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
