const PROVIDER_DISPLAY_NAMES = {
  gemini: 'Gemini',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
};

const MODELS_ENDPOINT_BY_PROVIDER = {
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
  openai: 'https://api.openai.com/v1/models',
  anthropic: 'https://api.anthropic.com/v1/models',
};

const DEFAULT_MODELS = {
  gemini: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'],
  openai: ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4.1', 'o4-mini'],
  anthropic: ['claude-3-5-haiku-latest', 'claude-3-5-sonnet-latest', 'claude-3-7-sonnet-latest'],
};

const PREFERENCE_ORDER = {
  gemini: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'],
  openai: ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4.1', 'o4-mini', 'o3-mini'],
  anthropic: ['claude-3-5-haiku-latest', 'claude-3-5-sonnet-latest', 'claude-3-7-sonnet-latest'],
};

export const SUPPORTED_MODEL_PROVIDERS = ['gemini', 'openai', 'anthropic'];
export const DEFAULT_PROVIDER = 'gemini';

function toSafeString(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

async function parseResponseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function extractApiErrorMessage(payload, fallback) {
  if (!payload || typeof payload !== 'object') return fallback;
  const direct = toSafeString(payload.message);
  const nested = toSafeString(payload.error?.message);
  return direct || nested || fallback;
}

function isOpenAITextModel(modelName) {
  const name = toSafeString(modelName).toLowerCase();
  if (!name) return false;
  if (['moderation', 'embedding', 'whisper', 'tts', 'audio', 'image', 'dall-e'].some((token) => name.includes(token))) {
    return false;
  }
  return name.startsWith('gpt-') || name.startsWith('o1') || name.startsWith('o3') || name.startsWith('o4');
}

function normalizeOpenAIMessageContent(content) {
  if (typeof content === 'string') return content.trim();
  if (!Array.isArray(content)) return '';
  return content
    .map((item) => (typeof item === 'string' ? item : toSafeString(item?.text)))
    .filter(Boolean)
    .join('\n')
    .trim();
}

function extractOpenAIResponsesText(payload) {
  const direct = toSafeString(payload?.output_text);
  if (direct) return direct;
  return (Array.isArray(payload?.output) ? payload.output : [])
    .flatMap((item) => (Array.isArray(item?.content) ? item.content : []))
    .map((item) => toSafeString(item?.text))
    .filter(Boolean)
    .join('\n')
    .trim();
}

function createFetchGuard(fetchImpl) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('fetch implementation is required.');
  }
  return fetchImpl;
}

export function createModelRuntime({ fetchImpl = globalThis.fetch } = {}) {
  const request = createFetchGuard(fetchImpl);
  const availableModelsCache = new Map();

  function normalizeProvider(provider) {
    const normalized = toSafeString(provider, DEFAULT_PROVIDER).toLowerCase();
    return SUPPORTED_MODEL_PROVIDERS.includes(normalized) ? normalized : DEFAULT_PROVIDER;
  }

  function getProviderDisplayName(provider) {
    const normalized = normalizeProvider(provider);
    return PROVIDER_DISPLAY_NAMES[normalized] || PROVIDER_DISPLAY_NAMES[DEFAULT_PROVIDER];
  }

  function getDefaultModels(provider) {
    const normalized = normalizeProvider(provider);
    return DEFAULT_MODELS[normalized] || DEFAULT_MODELS[DEFAULT_PROVIDER];
  }

  function getPreferenceOrder(provider) {
    const normalized = normalizeProvider(provider);
    return PREFERENCE_ORDER[normalized] || PREFERENCE_ORDER[DEFAULT_PROVIDER];
  }

  function getApiKeyFingerprint(apiKey) {
    const normalized = toSafeString(apiKey);
    if (!normalized) return 'empty';

    let hash = 0;
    for (let idx = 0; idx < normalized.length; idx += 1) {
      hash = (hash * 31 + normalized.charCodeAt(idx)) | 0;
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  function getModelCacheKey(provider, apiKey) {
    const normalizedProvider = normalizeProvider(provider);
    const keyFingerprint = getApiKeyFingerprint(apiKey);
    return `${normalizedProvider}:${keyFingerprint}`;
  }

  function getCachedModels(provider, apiKey) {
    const cacheKey = getModelCacheKey(provider, apiKey);
    const cached = availableModelsCache.get(cacheKey);
    return Array.isArray(cached) ? cached : [];
  }

  function setCachedModels(provider, apiKey, models) {
    const sanitized = Array.isArray(models)
      ? models.map((item) => toSafeString(item)).filter(Boolean)
      : [];
    if (!sanitized.length) return;
    const cacheKey = getModelCacheKey(provider, apiKey);
    availableModelsCache.set(cacheKey, sanitized);
  }

  function sortModelsByPreference(models, provider) {
    const normalizedProvider = normalizeProvider(provider);
    const order = getPreferenceOrder(normalizedProvider);
    const orderMap = new Map(order.map((modelName, idx) => [modelName.toLowerCase(), idx]));
    const unique = Array.from(new Set((Array.isArray(models) ? models : [])
      .map((item) => toSafeString(item))
      .filter(Boolean)));

    return unique.sort((a, b) => {
      const aIdx = orderMap.has(a.toLowerCase()) ? orderMap.get(a.toLowerCase()) : Number.MAX_SAFE_INTEGER;
      const bIdx = orderMap.has(b.toLowerCase()) ? orderMap.get(b.toLowerCase()) : Number.MAX_SAFE_INTEGER;
      if (aIdx !== bIdx) return aIdx - bIdx;
      return a.localeCompare(b);
    });
  }

  async function fetchGeminiModels(apiKey) {
    const response = await request(MODELS_ENDPOINT_BY_PROVIDER.gemini, {
      headers: {
        'x-goog-api-key': apiKey,
      },
    });
    const data = await parseResponseJson(response);
    if (!response.ok) {
      throw new Error(extractApiErrorMessage(data, `Gemini model list request failed (${response.status})`));
    }

    return (Array.isArray(data?.models) ? data.models : [])
      .filter((modelItem) => modelItem?.supportedGenerationMethods?.includes('generateContent'))
      .map((modelItem) => toSafeString(modelItem?.name).split('/').pop())
      .filter(Boolean);
  }

  async function fetchOpenAIModels(apiKey) {
    const response = await request(MODELS_ENDPOINT_BY_PROVIDER.openai, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    const data = await parseResponseJson(response);
    if (!response.ok) {
      throw new Error(extractApiErrorMessage(data, `OpenAI model list request failed (${response.status})`));
    }

    return (Array.isArray(data?.data) ? data.data : [])
      .map((modelItem) => toSafeString(modelItem?.id))
      .filter((modelName) => isOpenAITextModel(modelName));
  }

  async function fetchAnthropicModels(apiKey) {
    const response = await request(MODELS_ENDPOINT_BY_PROVIDER.anthropic, {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    });
    const data = await parseResponseJson(response);
    if (!response.ok) {
      throw new Error(extractApiErrorMessage(data, `Anthropic model list request failed (${response.status})`));
    }

    return (Array.isArray(data?.data) ? data.data : [])
      .map((modelItem) => toSafeString(modelItem?.id))
      .filter((modelName) => modelName.toLowerCase().includes('claude'));
  }

  async function generateTextWithGemini(apiKey, modelName, prompt) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 },
      }),
    });
    const data = await parseResponseJson(response);
    if (!response.ok) {
      throw new Error(extractApiErrorMessage(data, `Gemini generation failed (${response.status})`));
    }

    const text = (Array.isArray(data?.candidates) ? data.candidates : [])
      .flatMap((candidate) => (Array.isArray(candidate?.content?.parts) ? candidate.content.parts : []))
      .map((part) => toSafeString(part?.text))
      .filter(Boolean)
      .join('\n')
      .trim();
    if (!text) throw new Error('Gemini generation returned empty text.');
    return text;
  }

  async function generateTextWithOpenAI(apiKey, modelName, prompt) {
    const primaryResponse = await request('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        input: prompt,
      }),
    });
    const primaryData = await parseResponseJson(primaryResponse);
    if (primaryResponse.ok) {
      const primaryText = extractOpenAIResponsesText(primaryData);
      if (primaryText) return primaryText;
    }

    const fallbackResponse = await request('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const fallbackData = await parseResponseJson(fallbackResponse);
    if (!fallbackResponse.ok) {
      const fallbackError = extractApiErrorMessage(fallbackData, `OpenAI generation failed (${fallbackResponse.status})`);
      const primaryError = extractApiErrorMessage(primaryData, '');
      throw new Error(primaryError || fallbackError);
    }

    const text = normalizeOpenAIMessageContent(fallbackData?.choices?.[0]?.message?.content);
    if (!text) throw new Error('OpenAI generation returned empty text.');
    return text;
  }

  async function generateTextWithAnthropic(apiKey, modelName, prompt) {
    const response = await request('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName,
        temperature: 0.2,
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await parseResponseJson(response);
    if (!response.ok) {
      throw new Error(extractApiErrorMessage(data, `Anthropic generation failed (${response.status})`));
    }

    const text = (Array.isArray(data?.content) ? data.content : [])
      .filter((item) => item?.type === 'text')
      .map((item) => toSafeString(item?.text))
      .filter(Boolean)
      .join('\n')
      .trim();
    if (!text) throw new Error('Anthropic generation returned empty text.');
    return text;
  }

  async function fetchAvailableModels(apiKey, { provider = DEFAULT_PROVIDER } = {}) {
    const normalizedProvider = normalizeProvider(provider);
    if (!apiKey) return getDefaultModels(normalizedProvider);

    const cachedModels = getCachedModels(normalizedProvider, apiKey);
    if (cachedModels.length > 0) return cachedModels;

    try {
      let models = [];
      if (normalizedProvider === 'gemini') {
        models = await fetchGeminiModels(apiKey);
      } else if (normalizedProvider === 'openai') {
        models = await fetchOpenAIModels(apiKey);
      } else if (normalizedProvider === 'anthropic') {
        models = await fetchAnthropicModels(apiKey);
      }

      const sortedModels = sortModelsByPreference(models, normalizedProvider);
      if (sortedModels.length > 0) {
        setCachedModels(normalizedProvider, apiKey, sortedModels);
        return sortedModels;
      }
    } catch {
      // Avoid exposing API key details.
    }

    const fallbackModels = getDefaultModels(normalizedProvider);
    setCachedModels(normalizedProvider, apiKey, fallbackModels);
    return fallbackModels;
  }

  async function getOptimalModel(apiKey, preferredModel = '', provider = DEFAULT_PROVIDER) {
    const normalizedProvider = normalizeProvider(provider);
    let availableModels = getCachedModels(normalizedProvider, apiKey);
    if (availableModels.length === 0) {
      availableModels = await fetchAvailableModels(apiKey, { provider: normalizedProvider });
    }

    const preferred = toSafeString(preferredModel).toLowerCase();
    if (preferred) {
      const matched = availableModels.find((item) => toSafeString(item).toLowerCase() === preferred);
      if (matched) return matched;
    }

    for (const candidate of getPreferenceOrder(normalizedProvider)) {
      if (availableModels.includes(candidate)) return candidate;
    }

    return availableModels[0] || getDefaultModels(normalizedProvider)[0];
  }

  async function generateTextByProvider(provider, apiKey, modelName, prompt) {
    const normalizedProvider = normalizeProvider(provider);
    if (normalizedProvider === 'gemini') return generateTextWithGemini(apiKey, modelName, prompt);
    if (normalizedProvider === 'openai') return generateTextWithOpenAI(apiKey, modelName, prompt);
    if (normalizedProvider === 'anthropic') return generateTextWithAnthropic(apiKey, modelName, prompt);
    throw new Error(`Unsupported provider: ${normalizedProvider}`);
  }

  return {
    defaultProvider: DEFAULT_PROVIDER,
    supportedProviders: [...SUPPORTED_MODEL_PROVIDERS],
    normalizeProvider,
    getProviderDisplayName,
    fetchAvailableModels,
    getOptimalModel,
    generateTextByProvider,
  };
}

export const sharedModelRuntime = createModelRuntime();
