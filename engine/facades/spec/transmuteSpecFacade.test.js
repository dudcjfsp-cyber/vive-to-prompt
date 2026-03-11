import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSpecFacadeResult, transmuteVibeToSpec } from './transmuteSpecFacade.js';

const K = {
  SUMMARY: 'summary',
  PROBLEM_FRAME: 'problem_frame',
  WHO: 'who',
  WHEN: 'when',
  WHAT: 'what',
  WHY: 'why',
  SUCCESS: 'success',
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
  COMPLETENESS: 'completeness',
  SCORE: 'score',
  WARNINGS: 'warnings',
  REQUEST_CONVERTER: 'request_converter',
  STANDARD_REQUEST: 'standard_request',
  DETAILED_REQUEST: 'detailed_request',
  IMPACT: 'impact',
  IMPACT_SCREENS: 'screens',
  IMPACT_PERMISSIONS: 'permissions',
  IMPACT_TESTS: 'tests',
  STANDARD_OUTPUT: 'legacy_output',
};

function createSpec() {
  return {
    summary: 'Store export report',
    problem_frame: {
      who: 'store manager',
      when: 'end of day',
      what: 'review order volume',
      why: 'spot issues quickly',
      success: 'export works in one click',
    },
    roles: [
      { role: 'manager', description: 'reviews the output' },
    ],
    features: {
      must: ['Generate a report'],
      nice: ['Email the report'],
    },
    flow: ['Open page', 'Pick date range', 'Review summary', 'Export CSV', 'Share with team'],
    input_fields: [
      { name: 'date_range', type: 'string', example: '2026-03-11' },
    ],
    permissions: [
      { role: 'manager', read: true, create: false, update: false, delete: false, notes: 'read only' },
    ],
    ambiguities: {
      missing: ['timezone confirmation'],
      questions: ['Which timezone should exports use?', 'Should guest users view reports?', 'Need scheduled export?'],
    },
    risks: ['Wrong timezone causes confusion', 'CSV format mismatch', 'Missing empty-state copy'],
    tests: ['Loads the report', 'Filters the date range', 'Exports CSV'],
    next: ['Confirm timezone', 'Ship export action', 'Add CSV test'],
    completeness: {
      score: 82,
      warnings: ['Clarify timezone handling'],
    },
    request_converter: {
      standard_request: 'Implement the report workflow.',
      detailed_request: 'Build the report export workflow with validation and tests.',
    },
    impact: {
      screens: ['Report page'],
      permissions: ['Manager export access'],
      tests: ['CSV export regression'],
    },
  };
}

function createValidationReport() {
  return {
    severity: 'medium',
    needs_clarification: true,
    warning_count: 1,
    blocking_issue_count: 0,
  };
}

test('buildSpecFacadeResult keeps the spec app envelope while exposing shared runtime handoff', () => {
  const spec = createSpec();
  const validationReport = createValidationReport();

  const { result, sharedRuntimeHandoff } = buildSpecFacadeResult({
    raw: {
      model: 'facade-model',
      meta: { repair_mode: 'semantic_repair' },
      layers: { L1_thinking: { notes: ['kept'] } },
    },
    fallbackModel: 'fallback-model',
    promptMeta: { validation_retry_count: 2 },
    sourceVibe: 'Need a store report',
    schemaKeys: K,
    normalizeStandardOutput: () => ({ spec, validationReport }),
  });

  assert.equal(result.model, 'facade-model');
  assert.equal(result.standard_output, spec);
  assert.equal(result.legacy_output, spec);
  assert.equal(result.validation_report, validationReport);
  assert.equal(typeof result.artifacts.dev_spec_md, 'string');
  assert.equal(typeof result.layers.L1_thinking, 'object');
  assert.equal(Array.isArray(result.glossary), true);
  assert.deepEqual(result.meta, {
    repair_mode: 'semantic_repair',
    validation_retry_count: 2,
  });
  assert.equal(sharedRuntimeHandoff.normalizedDraft, spec);
  assert.equal(sharedRuntimeHandoff.intentIr.source_vibe, 'Need a store report');
  assert.equal(sharedRuntimeHandoff.meta.validation_retry_count, 2);
});

test('transmuteVibeToSpec consumes the injected runtime service and keeps the public spec result shape', async () => {
  const calls = [];
  const spec = createSpec();
  const validationReport = createValidationReport();

  const result = await transmuteVibeToSpec('Need a store report', 'demo-key', {
    provider: 'openai',
    showThinking: false,
    modelName: 'gpt-4.1',
    persona: 'major',
    promptPolicyMode: 'baseline',
    promptExperimentId: 'runtime_service_test',
  }, {
    runtime: {
      defaultProvider: 'gemini',
      normalizeProvider(provider) {
        calls.push(['normalizeProvider', provider]);
        return provider;
      },
      async getOptimalModel(apiKey, preferredModel, provider) {
        calls.push(['getOptimalModel', apiKey, preferredModel, provider]);
        return preferredModel || 'fallback-model';
      },
      async generateTextByProvider(provider, apiKey, modelName, prompt) {
        calls.push(['generateTextByProvider', provider, apiKey, modelName, prompt]);
        return '{}';
      },
    },
    executePromptRepairChain: async (generateText, promptOptions) => {
      calls.push(['executePromptRepairChain', promptOptions]);
      return {
        parsed: {
          model: 'runtime-model',
          meta: { repair_mode: 'none' },
        },
        promptMeta: { validation_retry_count: 0 },
        repairMode: 'none',
        fallbackApplied: false,
        validationRetryCount: 0,
        semanticIssueCount: 0,
      };
    },
    schemaKeys: K,
    normalizeStandardOutput: () => ({ spec, validationReport }),
  });

  assert.equal(result.provider, 'openai');
  assert.equal(result.model, 'runtime-model');
  assert.equal(result.standard_output, spec);
  assert.equal(result.legacy_output, spec);
  assert.deepEqual(calls[0], ['normalizeProvider', 'openai']);
  assert.deepEqual(calls[1], ['getOptimalModel', 'demo-key', 'gpt-4.1', 'openai']);
  assert.deepEqual(calls[2], ['executePromptRepairChain', {
    vibe: 'Need a store report',
    showThinking: false,
    persona: 'major',
    policyMode: 'baseline',
    promptExperimentId: 'runtime_service_test',
  }]);
});
