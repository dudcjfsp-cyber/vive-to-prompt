/**
 * llmAdapter.js
 * - App 레이어는 이 파일만 통해 LLM 기능을 사용합니다.
 * - 현재 workspace는 브라우저 직접 호출(transmuteEngine.js 위임)만 유지합니다.
 */
import {
  SUPPORTED_MODEL_PROVIDERS,
  getProviderDisplayName,
  fetchAvailableModels as fetchAvailableModelsDirect,
  transmuteVibeToSpec as transmuteVibeToSpecDirect,
  transmuteVibeToPrompt as transmuteVibeToPromptDirect,
  recommendHybridStacks as recommendHybridStacksDirect,
} from '../engine/graph/transmuteEngine';
import { buildPromptOutputFromSpecResult as buildPromptOutputFromSpecResultDirect } from '../engine/pipeline/buildPromptOutputFromSpecResult.js';

export { SUPPORTED_MODEL_PROVIDERS, getProviderDisplayName };

export async function fetchAvailableModels(apiKey, options = {}) {
  return fetchAvailableModelsDirect(apiKey, options);
}

export async function transmuteVibeToSpec(vibe, apiKey, options = {}) {
  return transmuteVibeToSpecDirect(vibe, apiKey, options);
}

export async function transmuteVibeToPrompt(vibe, apiKey, options = {}) {
  return transmuteVibeToPromptDirect(vibe, apiKey, options);
}

export async function recommendHybridStacks(vibe, standardOutput, apiKey, options = {}) {
  return recommendHybridStacksDirect(vibe, standardOutput, apiKey, options);
}

export function buildPromptOutputFromSpecResult(options = {}) {
  return buildPromptOutputFromSpecResultDirect(options);
}
