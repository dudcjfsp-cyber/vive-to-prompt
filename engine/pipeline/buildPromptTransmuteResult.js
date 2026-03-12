import { buildRendererRuntimeHandoff } from '../runtime/buildRendererRuntimeHandoff.js';

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

export function buildPromptTransmuteResult({
  raw,
  fallbackModel,
  promptMeta = null,
  sourceVibe = '',
  intentFieldMap = {},
  normalizeStandardOutput,
  renderer,
} = {}) {
  if (typeof normalizeStandardOutput !== 'function') {
    throw new Error('normalizeStandardOutput is required.');
  }
  if (!isPlainObject(renderer) || typeof renderer.buildPromptOutput !== 'function') {
    throw new Error('renderer.buildPromptOutput is required.');
  }

  const sharedRuntimeHandoff = buildRendererRuntimeHandoff({
    raw,
    fallbackModel,
    promptMeta,
    sourceVibe,
    intentFieldMap,
    normalizeStandardOutput,
  });
  const promptOutput = renderer.buildPromptOutput(sharedRuntimeHandoff);
  const result = {
    model: sharedRuntimeHandoff.model,
    prompt_output: promptOutput,
    intent_ir: sharedRuntimeHandoff.intentIr,
    validation_report: sharedRuntimeHandoff.validationReport,
  };

  if (isPlainObject(sharedRuntimeHandoff.meta)) {
    result.meta = sharedRuntimeHandoff.meta;
  }

  return {
    result,
    intentIr: sharedRuntimeHandoff.intentIr,
    sharedRuntimeHandoff,
  };
}
