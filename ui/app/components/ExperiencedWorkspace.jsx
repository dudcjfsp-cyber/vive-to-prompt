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
    safe_to_pass_through: '원문을 거의 그대로 써도 되는가',
    has_audience_hint: '대상 독자 힌트가 포함되어 있는가',
  };
  const label = labels[key] || key;

  if (value === true) return label + ': 예';
  if (value === false) return label + ': 아니오';
  return label + ': ' + getSignalValueLabel(value);
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
    () => buildExperiencedSummaryModel({ derived }),
    [derived.clarifyLoop, derived.promptOutput, derived.standardOutput],
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
  const promptValidation = promptOutput.validation && typeof promptOutput.validation === 'object' ? promptOutput.validation : {};
  const validationWarnings = Array.isArray(promptValidation.warnings) ? promptValidation.warnings : [];
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
                <h3>적용된 기법</h3>
                {appliedTechniques.length > 0 ? (
                  <ul className="experienced-summary-list">
                    {appliedTechniques.map((technique) => (
                      <li key={technique.id}>
                        <strong>{technique.label}</strong>
                        {technique.why ? ': ' + technique.why : ''}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="small-muted">이번 결과에서는 별도 기법 적용이 기록되지 않았습니다.</p>
                )}
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
                <h3>검증 메모</h3>
                <ul className="experienced-summary-list">
                  {(validationWarnings.length > 0 ? validationWarnings : topWarnings.length > 0 ? topWarnings : ['현재 기록된 검토 메모는 없습니다.'])
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
                        <strong>{technique.label}</strong>
                        {technique.why ? ': ' + technique.why : ''}
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
