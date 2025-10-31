import { Violation, FixSuggestion } from '@/types/scan';

// Common patterns for decorative images
const DECORATIVE_PATTERNS = ['icon', 'logo', 'spacer', 'decorative', 'divider', 'bullet', 'separator'];

export function generateImageAltFix(violation: Violation): FixSuggestion {
  const node = violation.nodes[0];
  if (!node?.html) {
    return createFallbackFix(violation);
  }

  const html = node.html.toLowerCase();
  
  // Check if image appears decorative
  const isDecorative = DECORATIVE_PATTERNS.some(pattern => html.includes(pattern));
  
  if (isDecorative) {
    // Suggest empty alt for decorative images
    const fixedHtml = html.replace(/alt="[^"]*"/, 'alt=""') || html.replace(/<img/, '<img alt=""');
    
    return {
      explanation: 'This image appears decorative. Use an empty alt attribute (alt="") to hide it from screen readers.',
      before: violation.nodes[0].html,
      after: fixedHtml !== html ? fixedHtml : html.replace(/<img/, '<img alt="" '),
      confidence: 'High',
      wcagReference: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content.html',
    };
  }

  // Try to extract meaningful alt text from context
  const srcMatch = html.match(/src="[^"]*"/);
  if (srcMatch) {
    const src = srcMatch[0];
    const filename = src.split('/').pop()?.replace(/"$/, '') || '';
    const suggestedAlt = filename
      .replace(/[-_]/g, ' ')
      .replace(/\.[^.]*$/, '')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    const fixedHtml = html.replace(/<img/, `<img alt="${suggestedAlt}" `);
    
    return {
      explanation: `Add descriptive alt text. Suggested: "${suggestedAlt}" based on filename.`,
      before: violation.nodes[0].html,
      after: fixedHtml,
      confidence: 'Medium',
      wcagReference: violation.helpUrl,
    };
  }

  return createFallbackFix(violation);
}

function createFallbackFix(violation: Violation): FixSuggestion {
  return {
    explanation: 'All images must have an alt attribute that describes the image content or purpose.',
    before: violation.nodes[0]?.html || '',
    after: violation.nodes[0]?.html || '',
    confidence: 'Low',
    wcagReference: violation.helpUrl,
  };
}

