import { Violation, FixSuggestion } from '@/types/scan';

export function generateLabelFix(violation: Violation): FixSuggestion {
  const node = violation.nodes[0];
  if (!node?.html) {
    return createFallbackFix(violation);
  }

  const html = node.html;
  
  // Try to identify input type
  const typeMatch = html.match(/type="([^"]+)"/);
  const nameMatch = html.match(/name="([^"]+)"/);
  const idMatch = html.match(/id="([^"]+)"/);
  
  const type = typeMatch?.[1] || 'text';
  const name = nameMatch?.[1] || '';
  const id = idMatch?.[1] || '';
  
  // Generate meaningful label text
  const labelText = generateLabelText(name, type, id);
  
  // Generate proper label markup
  const labelId = id || `input-${name || type}`;
  const fixedHtml = html.replace(/id="[^"]*"/, `id="${labelId}"`);

  const labelHtml = `<label for="${labelId}">${labelText}</label>`;

  return {
    explanation: `Add a proper label element associated with this input using the 'for' attribute.`,
    before: html,
    after: `${labelHtml}\n${fixedHtml}`,
    confidence: 'High',
    wcagReference: 'https://www.w3.org/WAI/WCAG21/Understanding/labels-or-instructions.html',
  };
}

function generateLabelText(name: string, type: string, id: string): string {
  if (name) {
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
  
  if (type !== 'text') {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }
  
  return 'Input Field';
}

function createFallbackFix(violation: Violation): FixSuggestion {
  return {
    explanation: 'All form inputs must have an associated label element.',
    before: violation.nodes[0]?.html || '',
    after: violation.nodes[0]?.html || '',
    confidence: 'Medium',
    wcagReference: violation.helpUrl,
  };
}

