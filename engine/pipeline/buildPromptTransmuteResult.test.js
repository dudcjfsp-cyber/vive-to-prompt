import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPromptTransmuteResult } from './buildPromptTransmuteResult.js';
import { createPromptRenderer } from '../renderers/prompt/promptRenderer.js';

const fieldMap = {
  summary: 'summary',
  problemFrame: 'problem_frame',
  who: 'who',
  when: 'when',
  what: 'what',
  why: 'why',
  success: 'success',
  roles: 'roles',
  role: 'role',
  description: 'description',
  features: 'features',
  must: 'must',
  nice: 'nice',
  inputFields: 'input_fields',
  name: 'name',
  type: 'type',
  example: 'example',
  permissions: 'permissions',
  read: 'read',
  create: 'create',
  update: 'update',
  delete: 'delete',
  notes: 'notes',
  ambiguities: 'ambiguities',
  missing: 'missing',
  questions: 'questions',
  risks: 'risks',
};

test('buildPromptTransmuteResult returns prompt output on top of the shared runtime handoff', () => {
  const spec = {
    summary: 'Write a launch email prompt',
    problem_frame: {
      who: 'beta users',
      when: 'before release day',
      what: 'draft a reusable launch email prompt',
      why: 'speed up launch communication',
      success: 'the prompt is ready to paste into a model',
    },
    roles: [{ role: 'marketer', description: 'owns launch messaging' }],
    features: { must: ['Include subject', 'Include CTA'], nice: ['Friendly tone'] },
    input_fields: [{ name: 'audience', type: 'string', example: 'beta users' }],
    permissions: [{ role: 'marketer', read: true, create: true, update: true, delete: false, notes: 'editable' }],
    ambiguities: { missing: [], questions: [] },
    risks: ['Avoid hype'],
  };
  const validationReport = {
    severity: 'low',
    needs_clarification: false,
    warning_count: 0,
    blocking_issue_count: 0,
  };

  const { result, intentIr, sharedRuntimeHandoff } = buildPromptTransmuteResult({
    raw: {
      model: 'prompt-model',
      meta: { source: 'raw' },
    },
    fallbackModel: 'fallback-model',
    promptMeta: { experiment: 'prompt-v1' },
    sourceVibe: 'Write a JSON email prompt for beta users with subject, body, and CTA.',
    intentFieldMap: fieldMap,
    normalizeStandardOutput: () => ({ spec, validationReport }),
    renderer: createPromptRenderer(),
  });

  assert.equal(result.model, 'prompt-model');
  assert.equal(result.prompt_output.renderer, 'prompt');
  assert.equal(result.prompt_output.rewrite_mode, 'pass_through');
  assert.equal(result.prompt_output.final_prompt, 'Write a JSON email prompt for beta users with subject, body, and CTA.');
  assert.deepEqual(result.validation_report, validationReport);
  assert.deepEqual(result.meta, { source: 'raw', experiment: 'prompt-v1' });
  assert.equal(intentIr.intent.user_job, 'draft a reusable launch email prompt');
  assert.equal(sharedRuntimeHandoff.model, 'prompt-model');
  assert.equal(sharedRuntimeHandoff.intentIr, intentIr);
});