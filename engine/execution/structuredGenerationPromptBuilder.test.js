import test from 'node:test';
import assert from 'node:assert/strict';
import { createStructuredGenerationPromptBuilder } from './structuredGenerationPromptBuilder.js';

function createBuilder() {
  return createStructuredGenerationPromptBuilder({
    baseSystemPrompt: 'System line',
    schemaHint: '{\n  "field": "string"\n}',
  });
}

test('structured generation prompt builder assembles retry prompts with injected schema', () => {
  const builder = createBuilder();

  const envelope = builder.buildPromptEnvelope({
    retryPayload: '{"broken":',
  });

  assert.deepEqual(envelope, {
    prompt: 'Your previous response was invalid JSON. Fix it now. Return JSON only and strictly follow schema.\nSchema:\n{\n  "field": "string"\n}\nPrevious output:\n{"broken":',
    meta: null,
  });
});

test('structured generation prompt builder assembles semantic repair prompts as a reusable stage boundary', () => {
  const builder = createBuilder();

  const envelope = builder.buildPromptEnvelope({
    vibe: 'launch email prompt',
    showThinking: false,
    persona: 'experienced',
    promptExperimentId: 'semantic_repair_v1',
    repairContext: {
      mode: 'semantic_repair',
      issues: ['Add a CTA', 'Clarify the audience'],
      previousOutput: { field: 'draft' },
    },
  });

  assert.match(envelope.prompt, /^SYSTEM:\nSystem line/);
  assert.match(envelope.prompt, /Semantic repair checklist:\n- Add a CTA\n- Clarify the audience/);
  assert.match(envelope.prompt, /Current JSON to repair:\n\{\n  "field": "draft"\n\}/);
  assert.equal(envelope.meta.prompt_policy_mode, 'semantic_repair');
  assert.equal(envelope.meta.prompt_experiment_id, 'semantic_repair_v1');
});
