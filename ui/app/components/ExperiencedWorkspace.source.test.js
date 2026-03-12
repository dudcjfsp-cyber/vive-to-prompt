import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./ExperiencedWorkspace.jsx', import.meta.url), 'utf8');

test('ExperiencedWorkspace is framed as a prompt-first surface', () => {
  assert.match(source, /프롬프트 구조화 워크스페이스/);
  assert.match(source, /최종 프롬프트와 그 구조화 이유를 바로 이해하는 것입니다/);
  assert.match(source, /자연어 입력/);
  assert.match(source, /프롬프트 결과/);
  assert.doesNotMatch(source, /빠른 실행형 모드/);
  assert.doesNotMatch(source, /오늘 바로 끝내기/);
});

test('ExperiencedWorkspace shows prompt workflow guidance instead of spec-oriented mode steps', () => {
  assert.match(source, /1\. 자연어 입력/);
  assert.match(source, /2\. 구조화 판단/);
  assert.match(source, /3\. 이유와 함께 출력/);
  assert.doesNotMatch(source, /오늘 할 일 3개와 전달용 요청문/);
});

test('ExperiencedWorkspace centers prompt rationale instead of advanced spec diagnostics', () => {
  assert.match(source, /적용된 기법/);
  assert.match(source, /구조화 판단 근거/);
  assert.match(source, /검증 메모/);
  assert.match(source, /이번엔 쓰지 않은 기법/);
  assert.match(source, /최종 프롬프트/);
  assert.doesNotMatch(source, /<AdvancedResultPane/);
  assert.doesNotMatch(source, /추천 구현 스택/);
  assert.doesNotMatch(source, /세부 진단 열기/);
  assert.doesNotMatch(source, /검토 상태:/);
});

test('ExperiencedWorkspace exposes prompt-engine metadata in the result surface', () => {
  assert.match(source, /구조화 방식: \{getRewriteModeLabel\(rewriteMode\)\}/);
  assert.match(source, /사용 기법: \{appliedTechniqueCount\}개/);
  assert.match(source, /검증 상태: \{getPromptValidationStatusLabel\(promptValidation\.status\)\}/);
  assert.match(source, /Object\.entries\(selectionSignals\)/);
  assert.match(source, /skippedTechniques\.slice\(0, 4\)/);
  assert.match(source, /appliedTechniques\.map/);
  assert.match(source, /목표가 얼마나 분명한가/);
  assert.match(source, /원문을 거의 그대로 써도 되는가/);
  assert.doesNotMatch(source, /completionScore/);
  assert.doesNotMatch(source, /validationSeverity/);
  assert.doesNotMatch(source, /hasValidationReport/);
});
