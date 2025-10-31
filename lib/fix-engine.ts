import { Violation, FixSuggestion } from '@/types/scan';
import { generateColorContrastFix } from './fix-rules/color-contrast';
import { generateImageAltFix } from './fix-rules/image-alt';
import { generateLabelFix } from './fix-rules/label';
import { generateHeadingOrderFix } from './fix-rules/heading-order';
import { generateLinkNameFix } from './fix-rules/link-name';
import { generateButtonNameFix } from './fix-rules/button-name';
import { generateAriaFix } from './fix-rules/aria';

const FIX_GENERATORS: Record<string, (violation: Violation) => FixSuggestion> = {
  'color-contrast': generateColorContrastFix,
  'image-alt': generateImageAltFix,
  'label': generateLabelFix,
  'heading-order': generateHeadingOrderFix,
  'link-name': generateLinkNameFix,
  'button-name': generateButtonNameFix,
};

// ARIA violations follow a pattern like aria-*
const isAriaViolation = (id: string) => id.startsWith('aria-');

export function generateFixForViolation(violation: Violation): FixSuggestion {
  // Try specific fix generator
  const generator = FIX_GENERATORS[violation.id];
  if (generator) {
    return generator(violation);
  }

  // Try ARIA fix generator for ARIA violations
  if (isAriaViolation(violation.id)) {
    return generateAriaFix(violation);
  }

  // Fallback for unknown violations
  return generateGenericFix(violation);
}

function generateGenericFix(violation: Violation): FixSuggestion {
  const firstNode = violation.nodes[0];
  
  return {
    explanation: `Fix ${violation.description.toLowerCase()}`,
    before: firstNode?.html || '',
    after: firstNode?.html || '',
    confidence: 'Low',
    wcagReference: violation.helpUrl,
  };
}

