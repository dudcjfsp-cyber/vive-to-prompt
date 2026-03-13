import {
  buildPromptPolicyMeta,
  buildPromptSections,
  resolvePromptPolicy,
} from '../graph/promptPolicy.js';

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function toSafeString(value, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback;
}

function formatPromptSections(sections) {
  return sections
    .map((section) => `${section.label}:\n${section.content}`)
    .join('\n\n');
}

function buildLegacyBaselinePrompt({ baseSystemPrompt, schemaHint, vibe, showThinking }) {
  return `SYSTEM:\n${baseSystemPrompt}\n\nJSON Schema Shape:\n${schemaHint}\n\nUser vibe:\n${vibe}\n\nRuntime option: showThinking=${showThinking ? 'ON' : 'OFF'}.\nReturn only the fixed schema above.`;
}

export function createStructuredGenerationPromptBuilder({
  baseSystemPrompt = '',
  schemaHint = '',
} = {}) {
  function buildPromptEnvelope({
    vibe = '',
    showThinking = true,
    retryPayload = null,
    repairContext = null,
    persona = '',
    policyMode = '',
    promptExperimentId = '',
  } = {}) {
    if (retryPayload) {
      return {
        prompt: `Your previous response was invalid JSON. Fix it now. Return JSON only and strictly follow schema.\nSchema:\n${schemaHint}\nPrevious output:\n${retryPayload}`,
        meta: null,
      };
    }

    if (isObject(repairContext) && repairContext.mode === 'semantic_repair') {
      const policy = resolvePromptPolicy({ mode: 'semantic_repair' });
      const promptSections = buildPromptSections({
        vibe,
        schemaHint,
        baseSystemPrompt,
        policy,
        showThinking,
      });
      const issueList = Array.isArray(repairContext.issues)
        ? repairContext.issues.map((issue) => `- ${toSafeString(issue)}`).filter(Boolean).join('\n')
        : '';
      const currentJson = JSON.stringify(repairContext.previousOutput || {}, null, 2);

      return {
        prompt: `${formatPromptSections(promptSections)}\n\nSemantic repair checklist:\n${issueList || '- Repair missing semantic fields.'}\n\nCurrent JSON to repair:\n${currentJson}\n\nPreserve valid details, repair the missing fields listed above, and return only the fixed schema above.`,
        meta: buildPromptPolicyMeta({
          vibe,
          persona,
          policy,
          promptSections,
          positiveRewriteCount: policy.positiveRewriteCount,
          promptExperimentId,
        }),
      };
    }

    const policy = resolvePromptPolicy({ persona, mode: policyMode });
    if (policy.mode === 'baseline') {
      return {
        prompt: buildLegacyBaselinePrompt({
          baseSystemPrompt,
          schemaHint,
          vibe,
          showThinking,
        }),
        meta: buildPromptPolicyMeta({
          vibe,
          persona,
          policy,
          promptSections: ['role', 'schema', 'user_vibe', 'runtime'],
          promptExperimentId,
        }),
      };
    }

    const promptSections = buildPromptSections({
      vibe,
      schemaHint,
      baseSystemPrompt,
      policy,
      showThinking,
    });

    return {
      prompt: `${formatPromptSections(promptSections)}\n\nReturn only the fixed schema above.`,
      meta: buildPromptPolicyMeta({
        vibe,
        persona,
        policy,
        promptSections,
        positiveRewriteCount: policy.positiveRewriteCount,
        promptExperimentId,
      }),
    };
  }

  function buildPrompt(options = {}, legacyShowThinking = true, legacyRetryPayload = null) {
    if (typeof options === 'string') {
      return buildPromptEnvelope({
        vibe: options,
        showThinking: legacyShowThinking,
        retryPayload: legacyRetryPayload,
      }).prompt;
    }

    return buildPromptEnvelope(options).prompt;
  }

  return {
    buildPrompt,
    buildPromptEnvelope,
  };
}
