import test from 'node:test';
import assert from 'node:assert/strict';
import { createModelRuntime } from './modelRuntime.js';

test('createModelRuntime fetchAvailableModels sorts and caches provider models', async () => {
  const calls = [];
  const runtime = createModelRuntime({
    fetchImpl: async (url) => {
      calls.push(url);
      return {
        ok: true,
        json: async () => ({
          models: [
            { name: 'models/gemini-1.5-flash', supportedGenerationMethods: ['generateContent'] },
            { name: 'models/gemini-2.5-flash', supportedGenerationMethods: ['generateContent'] },
            { name: 'models/ignored', supportedGenerationMethods: ['embedContent'] },
            { name: 'models/gemini-2.5-flash', supportedGenerationMethods: ['generateContent'] },
          ],
        }),
      };
    },
  });

  const first = await runtime.fetchAvailableModels('demo-key', { provider: 'gemini' });
  const second = await runtime.fetchAvailableModels('demo-key', { provider: 'gemini' });

  assert.deepEqual(first, ['gemini-2.5-flash', 'gemini-1.5-flash']);
  assert.deepEqual(second, first);
  assert.equal(calls.length, 1);
});

test('createModelRuntime picks a preferred model when available and otherwise falls back to provider defaults', async () => {
  const runtime = createModelRuntime({
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({
        data: [
          { id: 'gpt-4.1' },
          { id: 'gpt-4o-mini' },
          { id: 'text-embedding-3-small' },
        ],
      }),
    }),
  });

  const preferred = await runtime.getOptimalModel('demo-key', 'gpt-4.1', 'openai');
  const fallback = await runtime.getOptimalModel('', '', 'anthropic');

  assert.equal(preferred, 'gpt-4.1');
  assert.equal(fallback, 'claude-3-5-haiku-latest');
  assert.equal(runtime.getProviderDisplayName('openai'), 'OpenAI');
  assert.equal(runtime.normalizeProvider('unknown-provider'), 'gemini');
});
