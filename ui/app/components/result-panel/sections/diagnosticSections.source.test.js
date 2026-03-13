import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./diagnosticSections.jsx', import.meta.url), 'utf8');

test('L5ActionBinder reads clarify question metadata for manual-loop prompts', () => {
  assert.match(source, /clarifyQuestionDetails = \[\],/);
  assert.match(source, /const questionDetailByText = new Map\(/);
  assert.match(source, /detail\?\.intent_key/);
  assert.match(source, /detail\?\.source/);
  assert.match(source, /detail\?\.reason_code/);
  assert.match(source, /보완 축:/);
  assert.match(source, /출처:/);
});
