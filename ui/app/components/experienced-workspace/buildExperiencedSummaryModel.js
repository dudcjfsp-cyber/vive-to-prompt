import { isObject, toStringArray, toText } from '../result-panel/utils.js';

export function buildExperiencedSummaryModel({ derived, stateVibe = '' }) {
  const safeDerived = isObject(derived) ? derived : {};
  const safePromptOutput = isObject(safeDerived.promptOutput) ? safeDerived.promptOutput : {};
  const safePromptValidation = isObject(safePromptOutput.validation) ? safePromptOutput.validation : {};
  const safeClarifyLoop = isObject(safeDerived.clarifyLoop) ? safeDerived.clarifyLoop : {};
  const promptWarnings = toStringArray(safePromptValidation.warnings).slice(0, 2);

  return {
    actions: {
      topWarnings: promptWarnings,
    },
    delivery: {
      quickRequestBase:
        toText(safePromptOutput.source_vibe)
        || toText(stateVibe),
      promptOutput: isObject(safeDerived.promptOutput) ? safeDerived.promptOutput : null,
    },
    clarify: {
      questions: toStringArray(safeClarifyLoop.questions),
      answers: isObject(safeClarifyLoop.answers) ? safeClarifyLoop.answers : {},
      loopTurn: Number(safeClarifyLoop.loopTurn || 0),
      canSubmit: safeClarifyLoop.canSubmit === true,
    },
  };
}
