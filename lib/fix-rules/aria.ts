import { Violation, FixSuggestion } from '@/types/scan';

export function generateAriaFix(violation: Violation): FixSuggestion {
  const node = violation.nodes[0];
  if (!node?.html) {
    return createFallbackFix(violation);
  }

  const html = node.html;
  
  // Try to identify the specific ARIA issue
  if (violation.id.includes('required-children') || violation.id.includes('required-parent')) {
    return generateRequiredChildrenFix(violation);
  }
  
  if (violation.id.includes('invalid')) {
    return generateInvalidAriaFix(violation);
  }
  
  if (violation.id.includes('unsupported')) {
    return generateUnsupportedAriaFix(violation);
  }

  return createFallbackFix(violation);
}

function generateRequiredChildrenFix(violation: Violation): FixSuggestion {
  const node = violation.nodes[0];
  const html = node?.html || '';
  
  // Suggest adding required children
  const match = html.match(/role="([^"]+)"/);
  const role = match?.[1] || '';
  
  let suggestion = 'Add required child elements for this ARIA role.';
  if (role === 'listbox' || role === 'combobox') {
    suggestion = 'This element with role="' + role + '" requires child elements with role="option".';
  } else if (role === 'tablist') {
    suggestion = 'This element with role="tablist" requires child elements with role="tab".';
  }
  
  return {
    explanation: suggestion,
    before: html,
    after: html,
    confidence: 'Medium',
    wcagReference: 'https://www.w3.org/TR/wai-aria-1.2/',
  };
}

function generateInvalidAriaFix(violation: Violation): FixSuggestion {
  const node = violation.nodes[0];
  const html = node?.html || '';
  
  // Try to find and suggest removal of invalid attributes
  const ariaMatch = html.match(/(aria-[a-z-]+)="[^"]+"/);
  
  if (ariaMatch) {
    const invalidAttr = ariaMatch[1];
    const fixedHtml = html.replace(new RegExp(`${invalidAttr}="[^"]+"`), '');
    
    return {
      explanation: `Remove or fix the invalid ARIA attribute: ${invalidAttr}`,
      before: html,
      after: fixedHtml,
      confidence: 'High',
      wcagReference: 'https://www.w3.org/TR/wai-aria-1.2/',
    };
  }

  return createFallbackFix(violation);
}

function generateUnsupportedAriaFix(violation: Violation): FixSuggestion {
  const node = violation.nodes[0];
  const html = node?.html || '';
  
  return {
    explanation: 'ARIA attributes used are not supported on this element. Remove unsupported attributes or change the element type.',
    before: html,
    after: html,
    confidence: 'High',
    wcagReference: violation.helpUrl,
  };
}

function createFallbackFix(violation: Violation): FixSuggestion {
  return {
    explanation: violation.description,
    before: violation.nodes[0]?.html || '',
    after: violation.nodes[0]?.html || '',
    confidence: 'Medium',
    wcagReference: violation.helpUrl,
  };
}

