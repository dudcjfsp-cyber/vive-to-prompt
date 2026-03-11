import { SPEC_INTENT_FIELD_MAP } from '../../contracts/specIntentFieldMap.js';
import { buildSpecTransmuteResult } from '../../pipeline/buildSpecTransmuteResult.js';
import { runSpecTransmutePipeline } from '../../pipeline/runSpecTransmutePipeline.js';
import { createSpecRenderer } from '../../renderers/spec/specRenderer.js';

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

export function buildSpecFacadeResult({
  raw,
  fallbackModel,
  promptMeta = null,
  sourceVibe = '',
  schemaKeys,
  normalizeStandardOutput,
} = {}) {
  if (!isPlainObject(schemaKeys)) {
    throw new Error('schemaKeys is required.');
  }
  if (typeof normalizeStandardOutput !== 'function') {
    throw new Error('normalizeStandardOutput is required.');
  }

  return buildSpecTransmuteResult({
    raw,
    fallbackModel,
    promptMeta,
    sourceVibe,
    standardOutputAliasKey: schemaKeys.STANDARD_OUTPUT,
    intentFieldMap: SPEC_INTENT_FIELD_MAP,
    normalizeStandardOutput,
    renderer: createSpecRenderer({ schemaKeys }),
  });
}

export function normalizeSpecResult(options = {}) {
  return buildSpecFacadeResult(options).result;
}

export async function transmuteVibeToSpec(
  vibe,
  apiKey,
  {
    provider,
    showThinking = true,
    modelName = '',
    persona = '',
    promptPolicyMode = '',
    promptExperimentId = '',
  } = {},
  {
    runtime,
    executePromptRepairChain,
    schemaKeys,
    normalizeStandardOutput,
  } = {},
) {
  if (!apiKey) {
    throw new Error('API key is missing.');
  }
  if (!runtime || typeof runtime !== 'object') {
    throw new Error('runtime is required.');
  }
  if (typeof runtime.normalizeProvider !== 'function') {
    throw new Error('runtime.normalizeProvider is required.');
  }
  if (typeof runtime.getOptimalModel !== 'function') {
    throw new Error('runtime.getOptimalModel is required.');
  }
  if (typeof runtime.generateTextByProvider !== 'function') {
    throw new Error('runtime.generateTextByProvider is required.');
  }
  if (typeof executePromptRepairChain !== 'function') {
    throw new Error('executePromptRepairChain is required.');
  }

  const normalizedProvider = runtime.normalizeProvider(provider || runtime.defaultProvider || 'gemini');
  const selectedModel = await runtime.getOptimalModel(apiKey, modelName, normalizedProvider);
  const generateText = (prompt) => runtime.generateTextByProvider(normalizedProvider, apiKey, selectedModel, prompt);
  const promptOptions = {
    vibe,
    showThinking,
    persona,
    policyMode: promptPolicyMode,
    promptExperimentId,
  };

  try {
    return await runSpecTransmutePipeline({
      generateText,
      promptOptions,
      selectedModel,
      normalizedProvider,
      sourceVibe: vibe,
      executePromptRepairChain,
      normalizeResult: (raw, fallbackModel, promptMeta, sourceVibe) => normalizeSpecResult({
        raw,
        fallbackModel,
        promptMeta,
        sourceVibe,
        schemaKeys,
        normalizeStandardOutput,
      }),
    });
  } catch (error) {
    console.error('Transmutation failed:', error);
    throw new Error('Transmutation interrupted by model or JSON parsing failure.');
  }
}

