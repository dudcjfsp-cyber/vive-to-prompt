import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./diagnosticSections.jsx', import.meta.url), 'utf8');

test('L5ActionBinder reads clarify question metadata for manual-loop prompts', () => {
  assert.match(source, /clarifyQuestionDetails = \[\],/);
  assert.match(source, /const questionDetailByText = new Map\(/);
  assert.match(source, /detail\?\.intent_label/);
  assert.match(source, /detail\?\.source_label/);
  assert.match(source, /detail\?\.why_this_question/);
  assert.match(source, /detail\?\.prompt_improvement/);
  assert.match(source, /detail\?\.intent_key/);
  assert.match(source, /detail\?\.source/);
  assert.match(source, /빠진 구조:/);
  assert.match(source, /읽은 경계:/);
  assert.match(source, /왜 필요한가:/);
  assert.match(source, /답하면 좋아지는 점:/);
});
