export const PROMPT_TECHNIQUE_REGISTRY = [
  {
    id: 'zero_shot_pass_through',
    label: 'Zero-shot pass-through',
    tier: 'core',
    category: 'preserve',
    description: 'Keeps the original vibe when it is already clear enough for direct use.',
  },
  {
    id: 'goal_clarification',
    label: 'Goal clarification',
    tier: 'core',
    category: 'clarity',
    description: 'Makes the main task and success condition explicit.',
  },
  {
    id: 'role_assignment',
    label: 'Role assignment',
    tier: 'core',
    category: 'framing',
    description: 'Adds a role or audience frame when the request needs clearer positioning.',
  },
  {
    id: 'constraint_expansion',
    label: 'Constraint expansion',
    tier: 'core',
    category: 'constraints',
    description: 'Pulls out must-have requirements, risks, and boundaries.',
  },
  {
    id: 'output_format_lock',
    label: 'Output format lock',
    tier: 'core',
    category: 'format',
    description: 'Locks the response into a specific output shape when the vibe does not.',
  },
  {
    id: 'context_structuring',
    label: 'Context structuring',
    tier: 'core',
    category: 'context',
    description: 'Organizes user, timing, and problem context into a reusable block.',
  },
  {
    id: 'step_decomposition',
    label: 'Step decomposition',
    tier: 'core',
    category: 'planning',
    description: 'Breaks the task into a short ordered workflow when execution risk is higher.',
  },
  {
    id: 'quality_checklist_injection',
    label: 'Quality checklist injection',
    tier: 'core',
    category: 'validation',
    description: 'Adds a final self-check so missing assumptions or weak outputs are surfaced.',
  },
];

export const PROMPT_TECHNIQUE_MAP = new Map(
  PROMPT_TECHNIQUE_REGISTRY.map((technique) => [technique.id, technique]),
);
