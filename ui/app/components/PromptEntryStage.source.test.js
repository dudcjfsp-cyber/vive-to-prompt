import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./PromptEntryStage.jsx', import.meta.url), 'utf8');

test('PromptEntryStage stays focused on the pre-submit input boundary', () => {
  assert.ok(source.includes('첫 진입에서는 입력 하나에만 집중합니다.'));
  assert.ok(source.includes('연인과 2박 3일 여행가는데 경로 추천해줘.'));
  assert.ok(source.includes('actions.handleTransmute'));
  assert.ok(source.includes('API / 모델 설정'));
  assert.doesNotMatch(source, /ResultPanel/);
  assert.doesNotMatch(source, /buildExperiencedSummaryModel/);
});
