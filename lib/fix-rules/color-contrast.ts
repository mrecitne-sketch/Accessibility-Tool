import TinyColor from 'tinycolor2';
import { Violation, FixSuggestion } from '@/types/scan';

// WCAG AA requires 4.5:1 for normal text, 3:1 for large text
const MIN_CONTRAST_NORMAL = 4.5;
const MIN_CONTRAST_LARGE = 3.0;

// Font size threshold for "large text" (18pt or 14pt bold)
const LARGE_TEXT_SIZE = 18;

export function generateColorContrastFix(violation: Violation): FixSuggestion {
  const node = violation.nodes[0];
  if (!node?.html) {
    return createFallbackFix(violation);
  }

  const html = node.html;
  
  // Use computed colors from axe-core if available (much more accurate!)
  const foregroundColor = node.data?.foregroundColor || node.data?.fgColor;
  const backgroundColor = node.data?.backgroundColor || node.data?.bgColor;
  const fontSize = node.data?.fontSize;
  const contrastRatio = node.data?.contrastRatio;
  
  // Determine minimum contrast requirement based on font size
  const isLargeText = fontSize ? parseFloat(fontSize) >= LARGE_TEXT_SIZE : false;
  const minContrast = isLargeText ? MIN_CONTRAST_LARGE : MIN_CONTRAST_NORMAL;
  
  // If we have computed colors from axe-core, use them (most accurate)
  if (foregroundColor && backgroundColor) {
    return generateFixFromComputedColors(
      violation,
      html,
      foregroundColor,
      backgroundColor,
      minContrast,
      contrastRatio
    );
  }
  
  // Fallback to HTML parsing (less accurate but better than nothing)
  return generateFixFromHTML(violation, html, minContrast);
}

/**
 * Generate fix using actual computed colors from axe-core (most accurate)
 */
function generateFixFromComputedColors(
  violation: Violation,
  html: string,
  foregroundColor: string,
  backgroundColor: string,
  minContrast: number,
  currentContrastRatio?: number
): FixSuggestion {
  const fgColor = new TinyColor(foregroundColor);
  const bgColor = new TinyColor(backgroundColor);
  
  // Calculate actual contrast ratio
  const actualContrast = currentContrastRatio || TinyColor.readability(fgColor, bgColor);
  
  if (actualContrast >= minContrast) {
    // Already compliant, but violation was flagged - provide guidance
    return {
      explanation: `Current contrast ratio is ${actualContrast.toFixed(2)}:1 (foreground: ${foregroundColor}, background: ${backgroundColor}). Ensure this meets WCAG AA requirements (${minContrast}:1 minimum).`,
      before: html,
      after: html,
      confidence: 'Medium',
      wcagReference: violation.helpUrl,
    };
  }
  
  // Determine which color to adjust (typically adjust foreground for better contrast)
  // For light backgrounds, darken foreground; for dark backgrounds, lighten foreground
  const bgLuminance = bgColor.getLuminance();
  
  let adjustedColor = fgColor.clone();
  let iterations = 0;
  const maxIterations = 20;
  
  // Adjust foreground color to meet contrast requirement
  while (TinyColor.readability(adjustedColor, bgColor) < minContrast && iterations < maxIterations) {
    if (bgLuminance > 0.5) {
      // Light background - darken foreground
      adjustedColor = adjustedColor.darken(5);
    } else {
      // Dark background - lighten foreground
      adjustedColor = adjustedColor.lighten(5);
    }
    iterations++;
  }
  
  const newContrast = TinyColor.readability(adjustedColor, bgColor);
  const newColorHex = adjustedColor.toHexString();
  const newColorRgb = adjustedColor.toRgbString();
  
  // Try to update the HTML with the new color
  let fixedHtml = html;
  const colorMatch = html.match(/color:\s*([^;]+)/i);
  if (colorMatch) {
    fixedHtml = html.replace(colorMatch[0], `color: ${newColorHex}`);
  } else {
    // If no inline color, suggest adding it
    fixedHtml = html.replace(/>/, ` style="color: ${newColorHex}">`);
  }
  
  return {
    explanation: `Color contrast ratio is ${actualContrast.toFixed(2)}:1 (foreground: ${foregroundColor}, background: ${backgroundColor}), which is below WCAG AA ${minContrast}:1 minimum. Suggested foreground color: ${newColorHex} (${newColorRgb}) for a contrast ratio of ${newContrast.toFixed(2)}:1.`,
    before: html,
    after: fixedHtml,
    confidence: 'High',
    wcagReference: violation.helpUrl || 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
  };
}

/**
 * Fallback: Generate fix by parsing HTML (less accurate)
 */
function generateFixFromHTML(
  violation: Violation,
  html: string,
  minContrast: number
): FixSuggestion {
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
  
  if (contrast >= minContrast) {
    // Already compliant, suggest adding explicit contrast
    return createFallbackFix(violation);
  }

  // Lighten/darken to meet contrast requirement
  let fixedColor = originalColor;
  if (isBackground) {
    // For backgrounds, we want to ensure contrast with foreground
    // If too light, darken it
    while (TinyColor.readability(fixedColor, contrastColor) < minContrast && fixedColor.getBrightness() > 10) {
      fixedColor = fixedColor.darken(5);
    }
  } else {
    // For foreground, if too similar to white background, darken
    while (TinyColor.readability(fixedColor, '#FFFFFF') < minContrast && fixedColor.getBrightness() < 90) {
      fixedColor = fixedColor.darken(5);
    }
  }

  const newColor = fixedColor.toHexString();
  const fixedHtml = html.replace(colorMatch[0], `color: ${newColor}`);

  return {
    explanation: `Color contrast ratio must be at least ${minContrast}:1 for WCAG AA compliance. Changed from ${oldColor} to ${newColor}. Note: This suggestion is based on HTML parsing. For more accurate fixes, ensure computed styles are available.`,
    before: html,
    after: fixedHtml,
    confidence: 'Medium', // Reduced confidence since we don't have computed colors
    wcagReference: violation.helpUrl || 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
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

