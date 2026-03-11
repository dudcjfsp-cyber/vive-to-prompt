import { buildIntentIrFromSpec } from '../intent/deriveIntentIr.js';

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

export function buildRendererRuntimeHandoff({
  raw,
  fallbackModel,
  promptMeta = null,
  sourceVibe = '',
  intentFieldMap = {},
  normalizeStandardOutput,
} = {}) {
  if (typeof normalizeStandardOutput !== 'function') {
    throw new Error('normalizeStandardOutput is required.');
  }

  const parsedOutput = isPlainObject(raw) ? raw : {};
  const { spec: normalizedDraft, validationReport } = normalizeStandardOutput(parsedOutput);
  const mergedMeta = {
    ...(isPlainObject(parsedOutput.meta) ? parsedOutput.meta : {}),
    ...(isPlainObject(promptMeta) ? promptMeta : {}),
  };
  const model = typeof parsedOutput.model === 'string' && parsedOutput.model.trim()
    ? parsedOutput.model
    : fallbackModel;
  const intentIr = buildIntentIrFromSpec({
    sourceVibe,
    spec: normalizedDraft,
    validationReport,
    fields: intentFieldMap,
  });

  return {
    sourceVibe,
    model,
    parsedOutput,
    normalizedDraft,
    validationReport,
    intentIr,
    meta: Object.keys(mergedMeta).length > 0 ? mergedMeta : undefined,
  };
}
