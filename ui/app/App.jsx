import React from 'react';
import ApiKeyModal from './components/ApiKeyModal';
import ExperiencedWorkspace from './components/ExperiencedWorkspace';
import PromptEntryStage from './components/PromptEntryStage.jsx';
import { useAppController } from './hooks/useAppController';
import { PROMPT_FIRST_APP_CONFIG } from './runtime/promptFirstConfig';

function getHeaderCopy() {
  return '자연어 입력 하나를 받아 최종 프롬프트와 구조화 이유를 함께 보여주는 prompt-first 워크스페이스입니다.';
}

function renderApiKeyGate({ state, derived, actions }) {
  return (
    <section className="panel api-key-gate">
      <div className="panel-head">
        <h2>API 키 연결</h2>
        <p>prompt-first 실행을 시작하려면 먼저 사용할 프로바이더와 API 키를 연결합니다.</p>
      </div>
      <div className="control-grid">
        <div className="form-group">
          <label htmlFor="gate-provider">프로바이더</label>
          <select
            id="gate-provider"
            value={state.apiProvider}
            onChange={(event) => actions.setApiProvider(event.target.value)}
          >
            {derived.providerOptions.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="stack-actions">
        <button type="button" className="btn btn-primary" onClick={() => actions.setIsSettingsOpen(true)}>
          API 키 입력하기
        </button>
      </div>
      <p className="small-muted">
        API 키를 저장하면 같은 화면에서 바로 프롬프트 구조화를 시작할 수 있습니다.
      </p>
    </section>
  );
}

export default function App() {
  const { state, derived, actions } = useAppController({
    runtimeConfig: PROMPT_FIRST_APP_CONFIG,
  });
  const hasApiAccess = state.hasApiAccess;
  const requiresApiKey = state.requiresApiKey;
  const providerLabel = derived.providerOptions.find((item) => item.id === state.apiProvider)?.label || state.apiProvider;
  const apiStatusLabel = requiresApiKey
    ? (hasApiAccess ? providerLabel : '연결 필요')
    : '관리형 서버 (' + providerLabel + ')';
  const headerCopy = getHeaderCopy();
  const modelStatusLabel = state.selectedModel || (state.isModelOptionsLoading ? '불러오는 중' : (state.activeModel || '선택 안 됨'));
  const hasEnteredResultStage = hasApiAccess && (state.status !== 'idle' || Boolean(state.result));

  return (
    <main className="app-shell">
      <header className="app-header panel">
        <div>
          <p className="eyebrow">Prompt Structuring Workspace</p>
          <h1>Vibe-to-Prompt</h1>
          <p className="header-copy">{headerCopy}</p>
        </div>
        <div className="header-meta">
          <span className="status-chip">
            Surface: prompt-first
          </span>
          <button
            type="button"
            className={`status-chip status-chip-button ${hasApiAccess ? '' : 'muted'}`}
            onClick={() => actions.setIsSettingsOpen(true)}
            disabled={state.status === 'processing'}
            title="Open API settings"
          >
            API: {apiStatusLabel}
          </button>
          <button
            type="button"
            className="status-chip status-chip-button muted"
            onClick={() => actions.setIsSettingsOpen(true)}
            disabled={state.status === 'processing'}
            title="Open API settings"
          >
            모델: {modelStatusLabel}
          </button>
        </div>
      </header>

      {requiresApiKey && !hasApiAccess && renderApiKeyGate({
        state,
        derived,
        actions,
      })}

      {hasApiAccess && !hasEnteredResultStage && (
        <PromptEntryStage
          state={state}
          derived={derived}
          actions={actions}
          showApiSettings={requiresApiKey}
        />
      )}

      {hasEnteredResultStage && (
        <ExperiencedWorkspace
          state={state}
          derived={derived}
          actions={actions}
          showModeIntro={false}
          showApiSettings={requiresApiKey}
        />
      )}

      <ApiKeyModal
        isOpen={state.isSettingsOpen}
        providerLabel={providerLabel}
        providerOptions={derived.providerOptions}
        selectedProvider={state.apiProvider}
        onProviderChange={actions.setApiProvider}
        modelOptions={state.modelOptions}
        selectedModel={state.selectedModel}
        isModelOptionsLoading={state.isModelOptionsLoading}
        onModelChange={actions.setSelectedModel}
        showApiKeyInput={requiresApiKey}
        tempKey={state.tempKey}
        onTempKeyChange={actions.setTempKey}
        onSave={actions.handleSaveKey}
        onClose={() => actions.setIsSettingsOpen(false)}
      />
    </main>
  );
}
