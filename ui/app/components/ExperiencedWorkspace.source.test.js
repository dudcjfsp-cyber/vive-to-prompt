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
  assert.ok(source.includes('buildPromptChangeHighlights'));
  assert.ok(source.includes('derived?.clarifyLoop?.questionDetails'));
  assert.ok(source.includes('readyToUseSuccessState?.reusablePattern'));
  assert.ok(source.includes('clarifyQuestionDetailByText'));
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
  const rationaleIndex = source.indexOf('<h3>이번엔 이렇게 다듬었어요</h3>');
  const reusablePatternIndex = source.indexOf('<h3>직접 써볼 표현 패턴</h3>');
  const representativeTechniqueIndex = source.indexOf('<h3>대표 구조화 기법</h3>');
  const questionsIndex = source.indexOf('<h3>추가 확인이 필요한 질문</h3>');
  const detailsIndex = source.indexOf('상세 구조화 메모 보기');

  assert.ok(promptIndex !== -1);
  assert.ok(trustIndex !== -1);
  assert.ok(rationaleIndex !== -1);
  assert.ok(reusablePatternIndex !== -1);
  assert.ok(representativeTechniqueIndex !== -1);
  assert.ok(questionsIndex !== -1);
  assert.ok(detailsIndex !== -1);
  assert.ok(promptIndex < representativeTechniqueIndex);
  assert.ok(trustIndex < detailsIndex);
  assert.ok(rationaleIndex < representativeTechniqueIndex);
  assert.ok(rationaleIndex < reusablePatternIndex);
  assert.ok(reusablePatternIndex < representativeTechniqueIndex);
  assert.ok(representativeTechniqueIndex < detailsIndex);
  assert.ok(questionsIndex < detailsIndex);
  assert.ok(source.includes('experienced-priority-sequence'));
  assert.ok(source.includes('experienced-secondary-details'));
});

test('ExperiencedWorkspace keeps ready-to-use supporting trace collapsed for first-run quick success evaluation', () => {
  assert.ok(
    source.includes('원래 표현은 살리고, AI가 더 안정적으로 이해할 수 있도록 바뀐 점만 먼저 짚어줍니다.'),
  );
  assert.ok(source.includes('성공 상태에서 먼저 읽으면 되는 핵심 기법만 3개까지 남겼습니다.'));
  assert.ok(source.includes('왜 필요한가: {whyThisQuestion}'));
  assert.ok(source.includes('답하면 좋아지는 점: {promptImprovement}'));
  assert.ok(source.includes('<details className="experienced-summary-card experienced-secondary-details">'));
  assert.ok(source.includes('원문 입력, 전체 적용 기법, 판단 신호, 검증 메모는 필요할 때만 펼쳐봅니다.'));
});
