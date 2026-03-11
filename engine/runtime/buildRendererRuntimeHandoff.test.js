import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRendererRuntimeHandoff } from './buildRendererRuntimeHandoff.js';

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

test('buildRendererRuntimeHandoff exposes the minimum shared runtime payload for future renderers', () => {
  const spec = {
    summary: 'Store export report',
    problem_frame: {
      who: 'store manager',
      when: 'end of day',
      what: 'review order volume',
      why: 'spot issues quickly',
      success: 'export works in one click',
    },
    roles: [],
    features: { must: [], nice: [] },
    input_fields: [],
    permissions: [],
    ambiguities: { missing: [], questions: [] },
    risks: [],
  };
  const validationReport = {
    severity: 'medium',
    needs_clarification: true,
    warning_count: 2,
    blocking_issue_count: 0,
  };

  const handoff = buildRendererRuntimeHandoff({
    raw: {
      model: 'shared-model',
      meta: { repair_mode: 'strict_format' },
      draft_only: true,
    },
    fallbackModel: 'fallback-model',
    promptMeta: { validation_retry_count: 1 },
    sourceVibe: 'Need a store report',
    intentFieldMap: fieldMap,
    normalizeStandardOutput: () => ({ spec, validationReport }),
  });

  assert.equal(handoff.model, 'shared-model');
  assert.equal(handoff.sourceVibe, 'Need a store report');
  assert.deepEqual(handoff.parsedOutput, {
    model: 'shared-model',
    meta: { repair_mode: 'strict_format' },
    draft_only: true,
  });
  assert.equal(handoff.normalizedDraft, spec);
  assert.deepEqual(handoff.validationReport, validationReport);
  assert.deepEqual(handoff.meta, {
    repair_mode: 'strict_format',
    validation_retry_count: 1,
  });
  assert.equal(handoff.intentIr.summary, 'Store export report');
  assert.equal(handoff.intentIr.signals.needs_clarification, true);
});
