import React from 'react';

export default function PromptEntryStage({
  state,
  derived,
  actions,
  showApiSettings = true,
}) {
  const providerLabel = derived.providerOptions.find((provider) => provider.id === state.apiProvider)?.label || state.apiProvider;
  const modelLabel = state.isModelOptionsLoading
    ? '불러오는 중'
    : (state.selectedModel || state.modelOptions[0] || state.activeModel || '선택 안 됨');

  return (
    <section className="prompt-entry-stage">
      <section className="panel prompt-entry-panel">
        <div className="panel-head prompt-entry-head">
          <p className="prompt-entry-eyebrow">입력 단계</p>
          <h2>무엇을 만들고 싶은지만 적어 주세요</h2>
          <p>
            첫 진입에서는 입력 하나에만 집중합니다. 제출한 뒤에만 현재 결과 화면과 구조화 설명이 열립니다.
          </p>
        </div>

        <div className="signal-pills prompt-entry-pills">
          <span className="pill">프로바이더: {providerLabel}</span>
          <span className="pill">모델: {modelLabel}</span>
          <span className="pill">다음 단계: 결과 / 설명 화면</span>
        </div>

        <div className="form-group">
          <label htmlFor="prompt-entry-vibe">바이브 입력</label>
          <textarea
            id="prompt-entry-vibe"
            rows={10}
            value={state.vibe}
            onChange={(event) => actions.setVibe(event.target.value)}
            placeholder="예: 연인과 2박 3일 여행가는데 경로 추천해줘."
            disabled={state.status === 'processing'}
          />
        </div>

        {state.errorMessage && (
          <p className="small-muted prompt-entry-feedback">
            이전 실행 오류: {state.errorMessage}
          </p>
        )}

        {derived.clarifyApplyNotice && (
          <p className="small-muted matrix-notice">{derived.clarifyApplyNotice}</p>
        )}

        <div className="stack-actions prompt-entry-actions">
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
              API / 모델 설정
            </button>
          )}
        </div>
      </section>
    </section>
  );
}
