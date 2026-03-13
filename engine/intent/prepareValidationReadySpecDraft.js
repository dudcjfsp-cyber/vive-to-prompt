import { normalizeSpecDraft } from './normalizeSpecDraft.js';
import { prepareSpecAnalysis } from './prepareSpecAnalysis.js';

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Prepares the current spec-shaped normalized draft plus the validation input
 * that still has to be derived after normalization.
 */
export function prepareValidationReadySpecDraft({
  schemaKeys,
  raw = null,
  normalizeLayerGuide,
} = {}) {
  if (!isPlainObject(schemaKeys)) {
    throw new Error('schemaKeys is required.');
  }
  if (typeof normalizeLayerGuide !== 'function') {
    throw new Error('normalizeLayerGuide is required.');
  }

  const safeRaw = isPlainObject(raw) ? raw : {};
  const { specDraft, analysisHandoff } = normalizeSpecDraft({
    schemaKeys,
    raw: safeRaw,
    normalizeLayerGuide,
  });
  const analysisPrep = prepareSpecAnalysis({
    schemaKeys,
    spec: specDraft,
    ...analysisHandoff,
  });

  specDraft[schemaKeys.INTERVIEW] = analysisPrep.interviewMode;
  specDraft[schemaKeys.REQUEST_CONVERTER] = analysisPrep.requestConverter;
  specDraft[schemaKeys.IMPACT] = analysisPrep.impact;

  return {
    specDraft,
    completenessInput: analysisPrep.completenessInput,
  };
}
