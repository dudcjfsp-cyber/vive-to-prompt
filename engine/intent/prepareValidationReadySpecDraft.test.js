import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareValidationReadySpecDraft } from './prepareValidationReadySpecDraft.js';

const K = {
  SUMMARY: 'summary',
  PROBLEM_FRAME: 'problem_frame',
  WHO: 'who',
  WHEN: 'when',
  WHAT: 'what',
  WHY: 'why',
  SUCCESS: 'success',
  INTERVIEW: 'interview',
  FOLLOW_UP: 'follow_up',
  ROLES: 'roles',
  ROLE: 'role',
  DESCRIPTION: 'description',
  FEATURES: 'features',
  MUST: 'must',
  NICE: 'nice',
  FLOW: 'flow',
  INPUT_FIELDS: 'input_fields',
  NAME: 'name',
  TYPE: 'type',
  EXAMPLE: 'example',
  PERMISSIONS: 'permissions',
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  NOTES: 'notes',
  AMBIGUITIES: 'ambiguities',
  MISSING: 'missing',
  QUESTIONS: 'questions',
  RISKS: 'risks',
  TESTS: 'tests',
  NEXT: 'next',
  REQUEST_CONVERTER: 'request_converter',
  RAW_REQUEST: 'raw',
  SHORT_REQUEST: 'short',
  STANDARD_REQUEST: 'standard',
  DETAILED_REQUEST: 'detailed',
  IMPACT: 'impact',
  IMPACT_SCREENS: 'screens',
  IMPACT_PERMISSIONS: 'permissions_impact',
  IMPACT_TESTS: 'impact_tests',
  LAYER_GUIDE: 'layer_guide',
  COMPLETENESS: 'completeness',
  SCORE: 'score',
  WARNINGS: 'warnings',
};

test('prepareValidationReadySpecDraft builds a renderer-ready normalized draft plus validation input', () => {
  const { specDraft, completenessInput } = prepareValidationReadySpecDraft({
    schemaKeys: K,
    raw: {
      one_line_summary: 'Store report assistant',
      problem_frame: {
        who: 'store manager',
        when: 'end of day',
        what: 'review daily sales',
        why: 'spot issues quickly',
        success_criteria: 'exports in one click',
      },
      interview_mode: {
        follow_up_questions: ['Which stores should be included?'],
      },
      users_and_roles: [
        { role: 'manager', description: 'reviews the report' },
      ],
      core_features: {
        must: ['Generate report'],
      },
      user_flow_steps: ['Open report', 'Pick range', 'Review totals', 'Export CSV', 'Share results'],
      permission_matrix: [
        { role: 'manager', read: true, create: false, update: false, delete: false },
      ],
      ambiguities: {
        missing_information: ['timezone'],
        questions: ['Which timezone should exports use?'],
      },
      test_scenarios: ['Loads report', 'Exports CSV', 'Shows permission error'],
      completeness: {
        score: 92,
        warnings: ['Timezone is not fixed'],
      },
    },
    normalizeLayerGuide: () => ['normalized layers'],
  });

  assert.equal(specDraft.summary, 'Store report assistant');
  assert.equal(specDraft.interview.follow_up.length, 3);
  assert.equal(specDraft.interview.follow_up[0], 'Which stores should be included?');
  assert.equal(specDraft.interview.follow_up[1], 'Which timezone should exports use?');
  assert.match(specDraft.interview.follow_up[2], /timezone/);
  assert.equal(specDraft.request_converter.raw, 'Store report assistant');
  assert.match(specDraft.request_converter.short, /Generate report/);
  assert.equal(specDraft.impact.screens.length, 5);
  assert.match(specDraft.impact.screens[0], /Open report/);
  assert.match(specDraft.impact.permissions_impact[0], /manager/i);
  assert.deepEqual(specDraft.layer_guide, ['normalized layers']);
  assert.deepEqual(completenessInput, {
    score: 92,
    warnings: ['Timezone is not fixed'],
  });
});

test('prepareValidationReadySpecDraft keeps fallback-filled draft assembly reusable when raw input is thin', () => {
  const { specDraft, completenessInput } = prepareValidationReadySpecDraft({
    schemaKeys: K,
    raw: {},
    normalizeLayerGuide: () => ['default layer guide'],
  });

  assert.equal(typeof specDraft.summary, 'string');
  assert.equal(specDraft.summary.length > 0, true);
  assert.equal(specDraft.interview.follow_up.length, 3);
  assert.equal(specDraft.layer_guide[0], 'default layer guide');
  assert.deepEqual(completenessInput, {
    score: null,
    warnings: [],
  });
});
