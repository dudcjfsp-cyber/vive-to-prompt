import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./App.jsx', import.meta.url), 'utf8');

test('App uses a single prompt-first shell instead of persona-driven workspaces', () => {
  assert.match(source, /Vibe-to-Prompt/);
  assert.match(source, /Surface: prompt-first/);
  assert.match(source, /runtimeConfig: PROMPT_FIRST_APP_CONFIG/);
  assert.match(source, /<ExperiencedWorkspace/);
  assert.doesNotMatch(source, /<PersonaSelector/);
  assert.doesNotMatch(source, /<BeginnerWorkspace/);
  assert.doesNotMatch(source, /<MajorWorkspace/);
  assert.doesNotMatch(source, /vibe_to_spec_persona/);
});
