import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./LLMAdapter.js', import.meta.url), 'utf8');

test('LLMAdapter exposes the spec-result prompt fallback behind the adapter boundary', () => {
  assert.match(source, /buildPromptOutputFromSpecResult as buildPromptOutputFromSpecResultDirect/);
  assert.match(source, /export function buildPromptOutputFromSpecResult\(options = \{\}\)/);
});
