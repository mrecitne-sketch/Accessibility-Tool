import { Violation, FixSuggestion } from '@/types/scan';

export function generateHeadingOrderFix(violation: Violation): FixSuggestion {
  const node = violation.nodes[0];
  if (!node?.html) {
    return createFallbackFix(violation);
  }

  const html = node.html;
  
  // Extract current heading level
  const headingMatch = html.match(/<h([1-6])/);
  
  if (!headingMatch) {
    return createFallbackFix(violation);
  }

  const currentLevel = parseInt(headingMatch[1]);
  const suggestedLevel = Math.max(2, currentLevel - 1); // Suggest h2 or lower
  
  const fixedHtml = html.replace(/<h[1-6]/, `<h${suggestedLevel}`).replace(/<\/h[1-6]>/, `</h${suggestedLevel}>`);

  return {
    explanation: `Heading level ${currentLevel} skips a level. Change to h${suggestedLevel} to maintain proper heading hierarchy.`,
    before: html,
    after: fixedHtml,
    confidence: 'High',
    wcagReference: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships.html',
  };
}

function createFallbackFix(violation: Violation): FixSuggestion {
  return {
    explanation: 'Headings must follow a logical hierarchy (h1, h2, h3, etc.) without skipping levels.',
    before: violation.nodes[0]?.html || '',
    after: violation.nodes[0]?.html || '',
    confidence: 'Medium',
    wcagReference: violation.helpUrl,
  };
}

