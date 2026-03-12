import { SPEC_INTENT_FIELD_MAP } from '../contracts/specIntentFieldMap.js';
import { buildIntentIrFromSpec } from '../intent/deriveIntentIr.js';
import { createPromptRenderer } from '../renderers/prompt/promptRenderer.js';

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

export function buildPromptOutputFromSpecResult({
  sourceVibe = '',
  result,
  renderer = createPromptRenderer(),
} = {}) {
  const safeResult = isPlainObject(result) ? result : {};
  const normalizedDraft = isPlainObject(safeResult.standard_output)
    ? safeResult.standard_output
    : (isPlainObject(safeResult.표준_출력) ? safeResult.표준_출력 : {});
  const validationReport = isPlainObject(safeResult.validation_report)
    ? safeResult.validation_report
    : {};
  const meta = isPlainObject(safeResult.meta) ? safeResult.meta : undefined;
  const model = typeof safeResult.model === 'string' ? safeResult.model : '';
  const intentIr = buildIntentIrFromSpec({
    sourceVibe,
    spec: normalizedDraft,
    validationReport,
    fields: SPEC_INTENT_FIELD_MAP,
  });

  return renderer.buildPromptOutput({
    sourceVibe,
    model,
    parsedOutput: {
      model,
      meta,
    },
    normalizedDraft,
    validationReport,
    intentIr,
    meta,
  });
}