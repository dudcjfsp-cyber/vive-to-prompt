import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./buildExperiencedSummaryModel.js', import.meta.url), 'utf8');

test('buildExperiencedSummaryModel stays prompt-first and avoids spec-shaped fallback fields', () => {
  assert.ok(source.includes('safePromptOutput.validation'));
  assert.ok(source.includes('toText(safePromptOutput.source_vibe)'));
  assert.ok(source.includes('toText(stateVibe)'));
  assert.ok(!source.includes('safeDerived.standardOutput'));
  assert.ok(!source.includes('오늘_할_일_3개'));
  assert.ok(!source.includes('완성도_진단'));
  assert.ok(!source.includes('수정요청_변환'));
});
