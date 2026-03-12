import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./ResultPanel.jsx', import.meta.url), 'utf8');

test('ResultPanel reads from a shared view-model instead of raw workspace props', () => {
  assert.match(source, /export default function ResultPanel\(\{ viewModel \}\)/);
  assert.match(source, /const session = isObject\(viewModel\?\.session\) \? viewModel\.session : \{\};/);
  assert.match(source, /const artifacts = isObject\(viewModel\?\.artifacts\) \? viewModel\.artifacts : \{\};/);
  assert.match(source, /const diagnostics = isObject\(viewModel\?\.diagnostics\) \? viewModel\.diagnostics : \{\};/);
  assert.match(source, /const actionHandlers = isObject\(viewModel\?\.actions\) \? viewModel\.actions : \{\};/);
  assert.match(source, /const workspaceSeed = isObject\(viewModel\?\.workspaceSeed\) \? viewModel\.workspaceSeed : \{\};/);
  assert.match(source, /const promptPolicy = isObject\(diagnostics\.promptPolicy\) \? diagnostics\.promptPolicy : \{\};/);
  assert.match(source, /const validation = isObject\(diagnostics\.validation\) \? diagnostics\.validation : \{\};/);
  assert.match(source, /const manualLoop = isObject\(diagnostics\.manualLoop\) \? diagnostics\.manualLoop : \{\};/);
  assert.match(source, /integritySource: viewModel\?\.integritySource,/);
  assert.match(source, /const \[hypothesis, setHypothesis\] = useState\(seededHypothesis\);/);
  assert.match(source, /const \[logicMap, setLogicMap\] = useState\(seededLogicMap\);/);
  assert.doesNotMatch(source, /export default function ResultPanel\(\{\s*activeModel,/);
  assert.doesNotMatch(source, /validationReport\?\./);
  assert.doesNotMatch(source, /standardOutput/);
});

test('ResultPanel exposes prompt-engine metadata in the compact delivery panel', () => {
  assert.match(source, /Prompt Engine Output/);
  assert.match(source, /promptRewriteMode/);
  assert.match(source, /promptAppliedTechniques/);
  assert.match(source, /Quick Request/);
  assert.match(source, /AI Coding Prompt/);
});
