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
  assert.ok(source.includes('buildPromptValidationTrustChecklist'));
  assert.ok(source.includes('promptValidation.summary'));
  assert.ok(source.includes('promptValidation.summary_code'));
  assert.ok(source.includes('promptValidation.reason_details'));
  assert.ok(source.includes('promptValidation.reason_codes'));
  assert.ok(source.includes('validationWarnings.length || validationReasons.length'));
});
