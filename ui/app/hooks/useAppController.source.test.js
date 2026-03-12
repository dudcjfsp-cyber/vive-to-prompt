import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./useAppController.js', import.meta.url), 'utf8');

test('useAppController can route generation through prompt-first execution', () => {
  assert.ok(source.includes('transmuteVibeToPrompt,'));
  assert.ok(source.includes("export function useAppController({ runtimeConfig = null, personaConfig = null } = {})"));
  assert.ok(source.includes("transmuteTarget: String(runtimeConfig?.capabilities?.transmuteTarget || 'spec')"));
  assert.ok(source.includes("const transmute = transmuteTarget === 'prompt' ? transmuteVibeToPrompt : transmuteVibeToSpec;"));
  assert.ok(source.includes("const promptFirstMode = String(resolvedRuntime.capabilities.transmuteTarget || 'spec') === 'prompt';"));
  assert.ok(source.includes("throw new Error('Prompt-first mode requires prompt_output from the prompt renderer.');"));
  assert.ok(source.includes('promptOutput: isPlainObject(result?.prompt_output) ? result.prompt_output : null,'));
});
