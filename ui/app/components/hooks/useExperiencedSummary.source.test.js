import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./useExperiencedSummary.js', import.meta.url), 'utf8');

test('useExperiencedSummary reads prompt-first data from a normalized summary model', () => {
  assert.match(source, /summaryModel,/);
  assert.match(source, /const safeSummaryModel = isObject\(summaryModel\) \? summaryModel : \{\};/);
  assert.match(source, /const actions = isObject\(safeSummaryModel\.actions\) \? safeSummaryModel\.actions : \{\};/);
  assert.match(source, /const delivery = isObject\(safeSummaryModel\.delivery\) \? safeSummaryModel\.delivery : \{\};/);
  assert.match(source, /const clarify = isObject\(safeSummaryModel\.clarify\) \? safeSummaryModel\.clarify : \{\};/);
  assert.match(source, /const clarifyAnswers = isObject\(clarify\.answers\) \? clarify\.answers : \{\};/);
  assert.match(source, /const clarifyLoopTurn = Number\(clarify\.loopTurn \|\| 0\);/);
  assert.match(source, /const promptOutput = isObject\(delivery\.promptOutput\) \? delivery\.promptOutput : \{\};/);
  assert.match(source, /const refinedPrompt = toText\(promptOutput\.final_prompt\);/);
  assert.match(source, /const quickRequest = useMemo\(/);
  assert.match(source, /toText\(delivery\.quickRequestBase\)/);
  assert.match(source, /const rewriteMode = toText\(promptOutput\.rewrite_mode\);/);
  assert.match(source, /const appliedTechniqueCount = Array\.isArray\(promptOutput\.applied_techniques\)/);
  assert.match(source, /rewriteMode,/);
  assert.match(source, /appliedTechniqueCount,/);
  assert.doesNotMatch(source, /standardOutput/);
  assert.doesNotMatch(source, /todayActions/);
  assert.doesNotMatch(source, /completionScore/);
  assert.doesNotMatch(source, /validationSeverity/);
  assert.doesNotMatch(source, /hasValidationReport/);
});

test('useExperiencedSummary falls back to quickRequest when final_prompt is missing', () => {
  assert.match(source, /const quickAiPrompt = useMemo\(\(\) => \{/);
  assert.match(source, /const refinedPrompt = toText\(promptOutput\.final_prompt\);/);
  assert.match(source, /if \(refinedPrompt\) return refinedPrompt;/);
  assert.match(source, /return quickRequest;/);
  assert.match(source, /\}, \[promptOutput\.final_prompt, quickRequest\]\);/);
});
