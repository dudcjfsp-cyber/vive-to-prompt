import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./ExperiencedWorkspace.jsx', import.meta.url), 'utf8');

test('ExperiencedWorkspace keeps the prompt-first summary path wired to prompt-native state', () => {
  assert.ok(source.includes('buildExperiencedSummaryModel({ derived, stateVibe: state.vibe })'));
  assert.ok(source.includes('[derived.clarifyLoop, derived.promptOutput, state.vibe]'));
  assert.ok(!source.includes('derived.standardOutput'));
});

test('ExperiencedWorkspace still exposes prompt rationale and prompt validation helpers', () => {
  assert.ok(source.includes('promptOutput.rewrite_rationale'));
  assert.ok(source.includes('buildReadyToUseSuccessState'));
  assert.ok(source.includes('buildPromptValidationTrustChecklist'));
  assert.ok(source.includes("technique.id !== 'zero_shot_pass_through'"));
  assert.ok(source.includes('promptValidation.summary'));
  assert.ok(source.includes('promptValidation.summary_code'));
  assert.ok(source.includes('promptValidation.reason_details'));
  assert.ok(source.includes('promptValidation.reason_codes'));
  assert.ok(source.includes('validationWarnings.length || validationReasons.length'));
});

test('ExperiencedWorkspace orders the success-state cards around prompt-first primary information', () => {
  const promptIndex = source.indexOf('<h3>최종 프롬프트</h3>');
  const trustIndex = source.indexOf('<h3>{getPromptValidationTrustTitle(promptValidation.status)}</h3>');
  const rationaleIndex = source.indexOf('<h3>이번 구조화 판단 요약</h3>');
  const representativeTechniqueIndex = source.indexOf('<h3>대표 구조화 기법</h3>');
  const questionsIndex = source.indexOf('<h3>추가 확인이 필요한 질문</h3>');
  const detailsIndex = source.indexOf('상세 구조화 메모 보기');

  assert.ok(promptIndex !== -1);
  assert.ok(trustIndex !== -1);
  assert.ok(rationaleIndex !== -1);
  assert.ok(representativeTechniqueIndex !== -1);
  assert.ok(questionsIndex !== -1);
  assert.ok(detailsIndex !== -1);
  assert.ok(promptIndex < representativeTechniqueIndex);
  assert.ok(trustIndex < detailsIndex);
  assert.ok(rationaleIndex < representativeTechniqueIndex);
  assert.ok(representativeTechniqueIndex < detailsIndex);
  assert.ok(questionsIndex < detailsIndex);
  assert.ok(source.includes('experienced-priority-sequence'));
  assert.ok(source.includes('experienced-secondary-details'));
});
