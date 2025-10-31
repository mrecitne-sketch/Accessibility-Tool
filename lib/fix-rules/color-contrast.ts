import TinyColor from 'tinycolor2';
import { Violation, FixSuggestion } from '@/types/scan';

// WCAG AA requires 4.5:1 for normal text, 3:1 for large text
const MIN_CONTRAST = 4.5;

export function generateColorContrastFix(violation: Violation): FixSuggestion {
  const node = violation.nodes[0];
  if (!node?.html) {
    return createFallbackFix(violation);
  }

  const html = node.html;
  
  // Try to extract color from inline styles or CSS
  const colorMatch = html.match(/color:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\))/i);
  
  if (!colorMatch) {
    return createFallbackFix(violation);
  }

  const oldColor = colorMatch[1];
  
  // Determine if it's likely background or foreground color
  const isBackground = html.includes('background') || html.includes('bg-');
  const contrastColor = isBackground ? '#000000' : '#FFFFFF'; // Assume black or white contrast
  const originalColor = new TinyColor(oldColor);
  
  // Calculate current contrast
  const contrast = originalColor.getLuminance() > new TinyColor(contrastColor).getLuminance()
    ? TinyColor.readability(originalColor, contrastColor)
    : TinyColor.readability(contrastColor, originalColor);
  
  if (contrast >= MIN_CONTRAST) {
    // Already compliant, suggest adding explicit contrast
    return createFallbackFix(violation);
  }

  // Lighten/darken to meet contrast requirement
  let fixedColor = originalColor;
  if (isBackground) {
    // For backgrounds, we want to ensure contrast with foreground
    // If too light, darken it
    while (TinyColor.readability(fixedColor, contrastColor) < MIN_CONTRAST && fixedColor.getBrightness() > 10) {
      fixedColor = fixedColor.darken(5);
    }
  } else {
    // For foreground, if too similar to white background, darken
    while (TinyColor.readability(fixedColor, '#FFFFFF') < MIN_CONTRAST && fixedColor.getBrightness() < 90) {
      fixedColor = fixedColor.darken(5);
    }
  }

  const newColor = fixedColor.toHexString();
  const fixedHtml = html.replace(colorMatch[0], `color: ${newColor}`);

  return {
    explanation: `Color contrast ratio must be at least 4.5:1 for WCAG AA compliance. Changed from ${oldColor} to ${newColor}.`,
    before: html,
    after: fixedHtml,
    confidence: 'High',
    wcagReference: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
  };
}

function createFallbackFix(violation: Violation): FixSuggestion {
  return {
    explanation: 'Ensure text color and background color have a contrast ratio of at least 4.5:1.',
    before: violation.nodes[0]?.html || '',
    after: violation.nodes[0]?.html || '',
    confidence: 'Medium',
    wcagReference: violation.helpUrl,
  };
}

