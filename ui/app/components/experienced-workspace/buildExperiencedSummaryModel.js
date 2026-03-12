import { isObject, toStringArray, toText } from '../result-panel/utils.js';

const TASKS_KEY = '오늘_할_일_3개';
const COMPLETION_KEY = '완성도_진단';
const WARNINGS_KEY = '누락_경고';
const REQUEST_CONVERTER_KEY = '수정요청_변환';
const STANDARD_REQUEST_KEY = '표준_요청';
const SHORT_REQUEST_KEY = '짧은_요청';

export function buildExperiencedSummaryModel({ derived }) {
  const safeDerived = isObject(derived) ? derived : {};
  const safeStandardOutput = isObject(safeDerived.standardOutput) ? safeDerived.standardOutput : {};
  const safePromptOutput = isObject(safeDerived.promptOutput) ? safeDerived.promptOutput : {};
  const safePromptValidation = isObject(safePromptOutput.validation) ? safePromptOutput.validation : {};
  const safeClarifyLoop = isObject(safeDerived.clarifyLoop) ? safeDerived.clarifyLoop : {};
  const primaryWarnings = toStringArray(safeStandardOutput?.[COMPLETION_KEY]?.[WARNINGS_KEY]).slice(0, 2);
  const fallbackWarnings = toStringArray(safePromptValidation.warnings).slice(0, 2);

  return {
    actions: {
      today: toStringArray(safeStandardOutput?.[TASKS_KEY]).slice(0, 3),
      topWarnings: primaryWarnings.length > 0 ? primaryWarnings : fallbackWarnings,
    },
    delivery: {
      quickRequestBase:
        toText(safePromptOutput.source_vibe)
        || toText(safeStandardOutput?.[REQUEST_CONVERTER_KEY]?.[STANDARD_REQUEST_KEY])
        || toText(safeStandardOutput?.[REQUEST_CONVERTER_KEY]?.[SHORT_REQUEST_KEY]),
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