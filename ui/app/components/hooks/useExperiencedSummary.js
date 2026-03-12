import { useCallback, useMemo, useState } from 'react';
import { isObject, toStringArray, toText } from '../result-panel/utils';

export function useExperiencedSummary({
  summaryModel,
}) {
  const [promptCopyStatus, setPromptCopyStatus] = useState('');
  const safeSummaryModel = isObject(summaryModel) ? summaryModel : {};
  const actions = isObject(safeSummaryModel.actions) ? safeSummaryModel.actions : {};
  const delivery = isObject(safeSummaryModel.delivery) ? safeSummaryModel.delivery : {};
  const promptOutput = isObject(delivery.promptOutput) ? delivery.promptOutput : {};
  const clarify = isObject(safeSummaryModel.clarify) ? safeSummaryModel.clarify : {};

  const topWarnings = useMemo(
    () => toStringArray(actions.topWarnings).slice(0, 2),
    [actions.topWarnings],
  );
  const quickRequest = useMemo(
    () => toText(delivery.quickRequestBase),
    [delivery.quickRequestBase],
  );
  const quickAiPrompt = useMemo(() => {
    const refinedPrompt = toText(promptOutput.final_prompt);
    if (refinedPrompt) return refinedPrompt;
    return quickRequest;
  }, [promptOutput.final_prompt, quickRequest]);

  const handleCopyExperiencedPrompt = useCallback(async () => {
    if (!quickAiPrompt) {
      setPromptCopyStatus('복사할 AI 프롬프트가 아직 없습니다.');
      return;
    }

    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      setPromptCopyStatus('클립보드를 지원하지 않는 환경입니다.');
      return;
    }

    try {
      await navigator.clipboard.writeText(quickAiPrompt);
      setPromptCopyStatus('AI 프롬프트를 복사했습니다.');
    } catch {
      setPromptCopyStatus('AI 프롬프트 복사에 실패했습니다.');
    }
  }, [quickAiPrompt]);

  const validationQuestions = useMemo(
    () => toStringArray(clarify.questions),
    [clarify.questions],
  );
  const clarifyAnswers = isObject(clarify.answers) ? clarify.answers : {};
  const clarifyLoopTurn = Number(clarify.loopTurn || 0);
  const canSubmitClarification = clarify.canSubmit === true;
  const rewriteMode = toText(promptOutput.rewrite_mode);
  const appliedTechniqueCount = Array.isArray(promptOutput.applied_techniques)
    ? promptOutput.applied_techniques.length
    : 0;

  return {
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
  };
}