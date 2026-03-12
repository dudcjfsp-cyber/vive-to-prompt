import { SPEC_INTENT_FIELD_MAP } from '../../contracts/specIntentFieldMap.js';
import { buildPromptTransmuteResult } from '../../pipeline/buildPromptTransmuteResult.js';
import { runSpecTransmutePipeline } from '../../pipeline/runSpecTransmutePipeline.js';
import { createPromptRenderer } from '../../renderers/prompt/promptRenderer.js';

export function buildPromptFacadeResult({
  raw,
  fallbackModel,
  promptMeta = null,
  sourceVibe = '',
  normalizeStandardOutput,
} = {}) {
  if (typeof normalizeStandardOutput !== 'function') {
    throw new Error('normalizeStandardOutput is required.');
  }

  return buildPromptTransmuteResult({
    raw,
    fallbackModel,
    promptMeta,
    sourceVibe,
    intentFieldMap: SPEC_INTENT_FIELD_MAP,
    normalizeStandardOutput,
    renderer: createPromptRenderer(),
  });
}

export function normalizePromptResult(options = {}) {
  return buildPromptFacadeResult(options).result;
}

export async function transmuteVibeToPrompt(
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
  if (typeof normalizeStandardOutput !== 'function') {
    throw new Error('normalizeStandardOutput is required.');
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
      normalizeResult: (raw, fallbackModel, promptMeta, sourceVibe) => normalizePromptResult({
        raw,
        fallbackModel,
        promptMeta,
        sourceVibe,
        normalizeStandardOutput,
      }),
    });
  } catch (error) {
    console.error('Prompt transmutation failed:', error);
    throw new Error('Prompt transmutation interrupted by model or JSON parsing failure.');
  }
}
