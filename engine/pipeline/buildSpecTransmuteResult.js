import { buildRendererRuntimeHandoff } from '../runtime/buildRendererRuntimeHandoff.js';

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

export function buildSpecTransmuteResult({
  raw,
  fallbackModel,
  promptMeta = null,
  sourceVibe = '',
  standardOutputAliasKey = '',
  intentFieldMap = {},
  normalizeStandardOutput,
  renderer,
} = {}) {
  if (typeof normalizeStandardOutput !== 'function') {
    throw new Error('normalizeStandardOutput is required.');
  }
  if (!isPlainObject(renderer) || typeof renderer.buildResultSections !== 'function') {
    throw new Error('renderer.buildResultSections is required.');
  }

  const sharedRuntimeHandoff = buildRendererRuntimeHandoff({
    raw,
    fallbackModel,
    promptMeta,
    sourceVibe,
    intentFieldMap,
    normalizeStandardOutput,
  });
  const rawThinking = isPlainObject(sharedRuntimeHandoff.parsedOutput.layers?.L1_thinking)
    ? sharedRuntimeHandoff.parsedOutput.layers.L1_thinking
    : (isPlainObject(sharedRuntimeHandoff.parsedOutput.L1_thinking)
      ? sharedRuntimeHandoff.parsedOutput.L1_thinking
      : null);
  const rendered = renderer.buildResultSections(sharedRuntimeHandoff.normalizedDraft, rawThinking);

  const result = {
    model: sharedRuntimeHandoff.model,
    standard_output: sharedRuntimeHandoff.normalizedDraft,
    validation_report: sharedRuntimeHandoff.validationReport,
    artifacts: rendered.artifacts,
    layers: rendered.layers,
    glossary: rendered.glossary,
  };

  if (standardOutputAliasKey) {
    result[standardOutputAliasKey] = sharedRuntimeHandoff.normalizedDraft;
  }

  if (isPlainObject(sharedRuntimeHandoff.meta)) {
    result.meta = sharedRuntimeHandoff.meta;
  }

  return {
    result,
    intentIr: sharedRuntimeHandoff.intentIr,
    sharedRuntimeHandoff,
  };
}
