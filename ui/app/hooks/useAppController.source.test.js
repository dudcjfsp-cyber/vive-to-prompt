import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./useAppController.js', import.meta.url), 'utf8');

test('useAppController can route generation through prompt-first execution', () => {
  assert.ok(source.includes('buildClarifyQuestionDetails'));
  assert.ok(source.includes('transmuteVibeToPrompt,'));
  assert.ok(source.includes('buildPromptOutputFromSpecResult,'));
  assert.ok(source.includes('buildPromptFirstValidationReportFromResult'));
  assert.ok(source.includes("export function useAppController({ runtimeConfig = null, personaConfig = null } = {})"));
  assert.ok(source.includes("transmuteTarget: String(runtimeConfig?.capabilities?.transmuteTarget || 'spec')"));
  assert.ok(source.includes("const transmute = transmuteTarget === 'prompt' ? transmuteVibeToPrompt : transmuteVibeToSpec;"));
  assert.ok(source.includes("const promptFirstMode = String(resolvedRuntime.capabilities.transmuteTarget || 'spec') === 'prompt';"));
  assert.ok(source.includes("throw new Error('Prompt-first mode requires prompt_output from the prompt renderer.');"));
  assert.ok(source.includes('const promptFirstValidationReport = useMemo('));
  assert.ok(source.includes('() => buildPromptFirstValidationReportFromResult(result),'));
  assert.ok(source.includes('const clarifyQuestionDetails = useMemo('));
  assert.ok(source.includes('const clarifyQuestionDetailByQuestion = useMemo('));
  assert.ok(source.includes('questions: clarifyQuestions,'));
  assert.ok(source.includes('suggestedQuestionDetails: promptFirstValidationReport?.suggested_question_details,'));
  assert.ok(source.includes('const applyClarifyQuestionSet = useCallback((nextQuestions, nextSuggestedQuestionDetails = []) => {'));
  assert.ok(source.includes('const questionId = toText(detail?.question_id);'));
  assert.ok(source.includes('applyClarifyQuestionSet(nextQuestions, validationReport?.suggested_question_details);'));
  assert.ok(source.includes('promptOutput: isPlainObject(result?.prompt_output) ? result.prompt_output : null,'));
  assert.ok(source.includes('validationReport: promptFirstValidationReport,'));
  assert.ok(source.includes('questionDetails: clarifyQuestionDetails,'));
  assert.doesNotMatch(source, /engine\/pipeline\/buildPromptOutputFromSpecResult/);
});

test('useAppController keeps warning-driven clarify sync prompt-first', () => {
  assert.ok(source.includes('validationReport: promptFirstValidationReport,'));
  assert.doesNotMatch(source, /const promptValidation = isPlainObject\(result\?\.prompt_output\?\.validation\)/);
});
