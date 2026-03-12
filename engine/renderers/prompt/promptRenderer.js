import { PROMPT_TECHNIQUE_MAP, PROMPT_TECHNIQUE_REGISTRY } from './promptTechniqueRegistry.js';

function isPlainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function toText(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function toStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => toText(item)).filter(Boolean);
}

function toLevel(score) {
  if (score >= 2) return 'high';
  if (score >= 1) return 'medium';
  return 'low';
}

function hasStructuredSource(sourceVibe) {
  const source = toText(sourceVibe);
  if (!source) return false;
  return /\n|:|- |\d+\.|\?|;/m.test(source) || source.length >= 90;
}

function hasOutputFormatHints(sourceVibe) {
  return /(json|markdown|table|list|bullet|outline|template|format|subject|body|email|prompt|schema|제목|본문|형식|리스트|목록|표|단계|프롬프트)/i.test(toText(sourceVibe));
}

function hasConstraintHints(sourceVibe) {
  return /(must|should|avoid|limit|under|within|include|exclude|tone|style|length|필수|반드시|제외|제한|톤|길이|포함)/i.test(toText(sourceVibe));
}

function hasAudienceHints(sourceVibe) {
  return /(for |audience|customer|buyer|reader|user|team|사용자|고객|독자|대상|팀)/i.test(toText(sourceVibe));
}

function inferOutputInstruction(sourceVibe) {
  const source = toText(sourceVibe).toLowerCase();
  if (source.includes('json')) return 'Return valid JSON only.';
  if (source.includes('table') || source.includes('표')) return 'Return a compact markdown table.';
  if (source.includes('email') || source.includes('메일')) return 'Return a ready-to-send result with clear subject and body sections.';
  if (source.includes('list') || source.includes('bullet') || source.includes('목록') || source.includes('리스트')) {
    return 'Return a concise bullet list.';
  }
  return 'Return a structured answer with clear headings and concise bullets.';
}

function createTechniqueDecision(id, why) {
  const technique = PROMPT_TECHNIQUE_MAP.get(id);
  return {
    id,
    label: technique?.label || id,
    why: toText(why),
  };
}

function buildSelectionSignals(sharedRuntimeHandoff) {
  const sourceVibe = toText(sharedRuntimeHandoff?.sourceVibe);
  const intentIr = isPlainObject(sharedRuntimeHandoff?.intentIr) ? sharedRuntimeHandoff.intentIr : {};
  const intent = isPlainObject(intentIr.intent) ? intentIr.intent : {};
  const delivery = isPlainObject(intentIr.delivery) ? intentIr.delivery : {};
  const analysis = isPlainObject(intentIr.analysis) ? intentIr.analysis : {};
  const validationReport = isPlainObject(sharedRuntimeHandoff?.validationReport)
    ? sharedRuntimeHandoff.validationReport
    : {};
  const warningCount = Number(validationReport.warning_count || 0);
  const blockingIssueCount = Number(validationReport.blocking_issue_count || 0);
  const missingInformation = toStringArray(analysis.missing_information);
  const mustHaves = toStringArray(delivery.must_haves);

  const goalClarityScore = Number(Boolean(toText(intentIr.summary))) + Number(Boolean(toText(intent.user_job)));
  const constraintClarityScore = Number(mustHaves.length > 0) + Number(hasConstraintHints(sourceVibe));
  const outputFormatClarityScore = Number(hasOutputFormatHints(sourceVibe)) + Number(sourceVibe.includes('\n'));
  const sourceStructure = hasStructuredSource(sourceVibe);
  const ambiguityScore = Number(warningCount > 0) + Number(missingInformation.length > 0) + Number(blockingIssueCount > 0);
  const ambiguityLevel = ambiguityScore >= 2 ? 'high' : (ambiguityScore === 1 ? 'medium' : 'low');
  const safeToPassThrough = Boolean(
    sourceVibe
    && goalClarityScore >= 2
    && ambiguityLevel === 'low'
    && (outputFormatClarityScore >= 1 || constraintClarityScore >= 1 || sourceStructure)
    && sourceVibe.length <= 320
  );

  return {
    goal_clarity: toLevel(goalClarityScore),
    constraint_clarity: toLevel(constraintClarityScore),
    output_format_clarity: toLevel(outputFormatClarityScore),
    ambiguity_level: ambiguityLevel,
    source_structure: sourceStructure ? 'high' : 'low',
    safe_to_pass_through: safeToPassThrough,
    has_audience_hint: hasAudienceHints(sourceVibe),
  };
}

function selectRewriteMode(selectionSignals) {
  if (selectionSignals.safe_to_pass_through) return 'pass_through';
  if (selectionSignals.ambiguity_level === 'high' || selectionSignals.goal_clarity === 'low') {
    return 'structured_refine';
  }
  return 'light_refine';
}

function selectTechniques(sharedRuntimeHandoff, selectionSignals, rewriteMode) {
  const intentIr = isPlainObject(sharedRuntimeHandoff?.intentIr) ? sharedRuntimeHandoff.intentIr : {};
  const intent = isPlainObject(intentIr.intent) ? intentIr.intent : {};
  const delivery = isPlainObject(intentIr.delivery) ? intentIr.delivery : {};
  const analysis = isPlainObject(intentIr.analysis) ? intentIr.analysis : {};
  const selected = [];

  if (rewriteMode === 'pass_through') {
    selected.push(createTechniqueDecision('zero_shot_pass_through', 'The source vibe is already explicit enough for direct zero-shot use.'));
    return selected;
  }

  if (selectionSignals.goal_clarity !== 'high' || rewriteMode === 'structured_refine') {
    selected.push(createTechniqueDecision('goal_clarification', 'The task or success condition needs a clearer headline before prompting.'));
  }

  if (!selectionSignals.has_audience_hint && !toText(intent.target_user)) {
    selected.push(createTechniqueDecision('role_assignment', 'The request does not clearly frame who the answer should serve.'));
  }

  if (selectionSignals.constraint_clarity !== 'high' || toStringArray(delivery.must_haves).length > 0) {
    selected.push(createTechniqueDecision('constraint_expansion', 'Must-have requirements and limits should be surfaced explicitly.'));
  }

  if (selectionSignals.output_format_clarity !== 'high') {
    selected.push(createTechniqueDecision('output_format_lock', 'The vibe does not reliably lock the response shape yet.'));
  }

  if (selectionSignals.source_structure === 'low' || rewriteMode === 'structured_refine') {
    selected.push(createTechniqueDecision('context_structuring', 'The request benefits from a stable context block before execution.'));
  }

  if (rewriteMode === 'structured_refine' || toStringArray(delivery.must_haves).length > 2) {
    selected.push(createTechniqueDecision('step_decomposition', 'Breaking the task into a short workflow reduces ambiguity.'));
  }

  if (selectionSignals.ambiguity_level !== 'low' || toStringArray(analysis.missing_information).length > 0) {
    selected.push(createTechniqueDecision('quality_checklist_injection', 'The output should explicitly guard against hidden assumptions and missing constraints.'));
  }

  if (selected.length === 0) {
    selected.push(createTechniqueDecision('goal_clarification', 'A light rewrite still needs a stable task headline.'));
  }

  return selected;
}

function buildRefinedPrompt(sharedRuntimeHandoff, appliedTechniques, rewriteMode) {
  const sourceVibe = toText(sharedRuntimeHandoff?.sourceVibe);
  const intentIr = isPlainObject(sharedRuntimeHandoff?.intentIr) ? sharedRuntimeHandoff.intentIr : {};
  const intent = isPlainObject(intentIr.intent) ? intentIr.intent : {};
  const delivery = isPlainObject(intentIr.delivery) ? intentIr.delivery : {};
  const analysis = isPlainObject(intentIr.analysis) ? intentIr.analysis : {};
  const summary = toText(intentIr.summary, sourceVibe || 'Clarify the user request and produce the best possible answer.');
  const mustHaves = toStringArray(delivery.must_haves);
  const niceToHaves = toStringArray(delivery.nice_to_haves);
  const missingInformation = toStringArray(analysis.missing_information);
  const clarificationQuestions = toStringArray(analysis.clarification_questions);
  const risks = toStringArray(analysis.risks);
  const sections = [];
  const selectedIds = new Set(appliedTechniques.map((item) => item.id));

  sections.push('Original request:');
  sections.push(sourceVibe || '(empty)');

  if (selectedIds.has('role_assignment')) {
    sections.push('');
    sections.push('Role:');
    sections.push(`Act as a focused assistant for ${toText(intent.target_user, 'the intended audience')}.`);
  }

  if (selectedIds.has('goal_clarification')) {
    sections.push('');
    sections.push('Task:');
    sections.push(summary);
    if (toText(intent.user_job)) {
      sections.push(`Primary job to be done: ${intent.user_job}`);
    }
    if (toText(intent.success_signal)) {
      sections.push(`Success condition: ${intent.success_signal}`);
    }
  }

  if (selectedIds.has('context_structuring')) {
    sections.push('');
    sections.push('Context:');
    sections.push(`- Target user: ${toText(intent.target_user, 'Not specified')}`);
    sections.push(`- Usage moment: ${toText(intent.usage_moment, 'Not specified')}`);
    sections.push(`- Problem context: ${toText(intent.problem_context, 'Use the original request as the main context anchor.')}`);
  }

  if (selectedIds.has('constraint_expansion')) {
    sections.push('');
    sections.push('Constraints and priorities:');
    if (mustHaves.length > 0) {
      mustHaves.slice(0, rewriteMode === 'structured_refine' ? 4 : 3).forEach((item) => sections.push(`- Must: ${item}`));
    } else {
      sections.push('- Preserve the original goal without adding unrelated scope.');
    }
    niceToHaves.slice(0, 2).forEach((item) => sections.push(`- Nice to have: ${item}`));
    risks.slice(0, 2).forEach((item) => sections.push(`- Avoid: ${item}`));
  }

  if (selectedIds.has('output_format_lock')) {
    sections.push('');
    sections.push('Output format:');
    sections.push(`- ${inferOutputInstruction(sourceVibe)}`);
    sections.push('- Keep the answer concise, explicit, and immediately usable.');
  }

  if (selectedIds.has('step_decomposition')) {
    sections.push('');
    sections.push('Suggested workflow:');
    sections.push('1. Identify the exact deliverable the user is asking for.');
    sections.push('2. Fill in only the missing structure needed to make the response actionable.');
    sections.push('3. Produce the final answer in the requested format without unnecessary detours.');
  }

  if (selectedIds.has('quality_checklist_injection')) {
    sections.push('');
    sections.push('Before finalizing:');
    sections.push('- Do not hide missing assumptions. State them clearly if you must infer.');
    sections.push('- Keep constraints and requested format intact.');
    if (missingInformation.length > 0) {
      missingInformation.slice(0, 3).forEach((item) => sections.push(`- Missing information to handle carefully: ${item}`));
    }
    if (clarificationQuestions.length > 0) {
      clarificationQuestions.slice(0, 2).forEach((item) => sections.push(`- If the answer depends on an unknown, surface this question: ${item}`));
    }
  }

  return sections.join('\n');
}

function buildPromptValidation({ sourceVibe, finalPrompt, rewriteMode, appliedTechniques }) {
  const warnings = [];
  const normalizedSource = toText(sourceVibe);
  const normalizedPrompt = toText(finalPrompt);
  const preservesSourceVibe = rewriteMode === 'pass_through'
    ? normalizedPrompt === normalizedSource
    : normalizedPrompt.includes('Original request:');

  if (!normalizedPrompt) {
    warnings.push('Final prompt is empty.');
  }
  if (!preservesSourceVibe) {
    warnings.push('Final prompt no longer clearly preserves the original vibe.');
  }
  if (rewriteMode !== 'pass_through' && appliedTechniques.length === 0) {
    warnings.push('A refined prompt should record at least one applied technique.');
  }

  return {
    status: warnings.length > 0 ? 'review' : 'ready',
    warning_count: warnings.length,
    warnings,
    preserves_source_vibe: preservesSourceVibe,
  };
}

export function createPromptRenderer() {
  function buildPromptOutput(sharedRuntimeHandoff) {
    const selectionSignals = buildSelectionSignals(sharedRuntimeHandoff);
    const rewriteMode = selectRewriteMode(selectionSignals);
    const appliedTechniques = selectTechniques(sharedRuntimeHandoff, selectionSignals, rewriteMode);
    const skippedTechniques = PROMPT_TECHNIQUE_REGISTRY
      .filter((technique) => !appliedTechniques.some((item) => item.id === technique.id))
      .map((technique) => ({
        id: technique.id,
        label: technique.label,
        why: rewriteMode === 'pass_through'
          ? 'Pass-through mode avoids unnecessary rewriting.'
          : 'This technique was not necessary for the current intent signals.',
      }));
    const finalPrompt = rewriteMode === 'pass_through'
      ? toText(sharedRuntimeHandoff?.sourceVibe)
      : buildRefinedPrompt(sharedRuntimeHandoff, appliedTechniques, rewriteMode);
    const validation = buildPromptValidation({
      sourceVibe: sharedRuntimeHandoff?.sourceVibe,
      finalPrompt,
      rewriteMode,
      appliedTechniques,
    });

    return {
      renderer: 'prompt',
      source_vibe: toText(sharedRuntimeHandoff?.sourceVibe),
      rewrite_mode: rewriteMode,
      final_prompt: finalPrompt,
      applied_techniques: appliedTechniques,
      skipped_techniques: skippedTechniques,
      selection_signals: selectionSignals,
      validation,
    };
  }

  return {
    buildPromptOutput,
  };
}
