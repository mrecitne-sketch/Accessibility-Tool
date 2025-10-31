import { Violation, FixSuggestion } from '@/types/scan';

export function generateLinkNameFix(violation: Violation): FixSuggestion {
  const node = violation.nodes[0];
  if (!node?.html) {
    return createFallbackFix(violation);
  }

  const html = node.html;
  
  // Check if link has visible text
  const textMatch = html.match(/>(.*?)</);
  const hrefMatch = html.match(/href="([^"]+)"/);
  
  const currentText = textMatch?.[1]?.trim() || '';
  const href = hrefMatch?.[1] || '';
  
  // If link is empty or generic, suggest meaningful text
  if (!currentText || currentText === '' || 
      ['click here', 'read more', 'link', 'here'].includes(currentText.toLowerCase())) {
    
    // Try to generate text from URL
    const linkText = href ? generateLinkTextFromURL(href) : 'Learn More';
    
    const fixedHtml = html.replace(/>(.*?)</, `>${linkText}<`);

    return {
      explanation: 'Link text should be descriptive of the destination. Replace generic text like "click here" with meaningful text.',
      before: html,
      after: fixedHtml,
      confidence: 'High',
      wcagReference: 'https://www.w3.org/WAI/WCAG21/Understanding/link-purpose-in-context.html',
    };
  }

  return createFallbackFix(violation);
}

function generateLinkTextFromURL(url: string): string {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.split('/').pop() || '';
    return path
      .replace(/[-_]/g, ' ')
      .replace(/\.[^.]*$/, '')
      .replace(/\b\w/g, l => l.toUpperCase()) || 'Learn More';
  } catch {
    return 'Learn More';
  }
}

function createFallbackFix(violation: Violation): FixSuggestion {
  return {
    explanation: 'Links must have accessible names that describe their purpose or destination.',
    before: violation.nodes[0]?.html || '',
    after: violation.nodes[0]?.html || '',
    confidence: 'Medium',
    wcagReference: violation.helpUrl,
  };
}

