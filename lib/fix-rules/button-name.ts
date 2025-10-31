import { Violation, FixSuggestion } from '@/types/scan';

export function generateButtonNameFix(violation: Violation): FixSuggestion {
  const node = violation.nodes[0];
  if (!node?.html) {
    return createFallbackFix(violation);
  }

  const html = node.html;
  
  // Check if button has visible text
  const textMatch = html.match(/>(.*?)</);
  const hasText = textMatch && textMatch[1].trim().length > 0;
  
  if (!hasText) {
    // Try to infer button purpose from other attributes
    const typeMatch = html.match(/type="([^"]+)"/);
    const classMatch = html.match(/class="([^"]+)"/);
    
    const type = typeMatch?.[1] || 'button';
    const className = classMatch?.[1] || '';
    
    let ariaLabel = '';
    
    // Suggest aria-label based on context
    if (className.includes('close') || className.includes('dismiss')) {
      ariaLabel = 'Close';
    } else if (className.includes('submit')) {
      ariaLabel = 'Submit';
    } else if (className.includes('menu') || className.includes('hamburger')) {
      ariaLabel = 'Open Menu';
    } else if (type === 'submit') {
      ariaLabel = 'Submit Form';
    } else {
      ariaLabel = 'Button';
    }
    
    const fixedHtml = html.replace(/<button/, `<button aria-label="${ariaLabel}"`);

    return {
      explanation: `Add an aria-label attribute to describe the button's purpose for screen readers.`,
      before: html,
      after: fixedHtml,
      confidence: 'High',
      wcagReference: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
    };
  }

  return createFallbackFix(violation);
}

function createFallbackFix(violation: Violation): FixSuggestion {
  return {
    explanation: 'Buttons must have accessible names (visible text or aria-label) that describe their purpose.',
    before: violation.nodes[0]?.html || '',
    after: violation.nodes[0]?.html || '',
    confidence: 'Medium',
    wcagReference: violation.helpUrl,
  };
}

