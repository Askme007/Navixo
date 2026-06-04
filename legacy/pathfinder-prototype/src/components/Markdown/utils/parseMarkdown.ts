/**
 * Markdown Parsing Utilities
 * Helper functions to extract footnotes and abbreviations
 */

/**
 * Extract footnotes from markdown content
 * Format: [^1]: Footnote text here
 */
export function extractFootnotes(content: string): Array<{ id: string; text: string }> {
  const footnoteRegex = /\[\^(\d+)\]:(.+)/g;
  const footnotes: Array<{ id: string; text: string }> = [];
  
  let match;
  while ((match = footnoteRegex.exec(content)) !== null) {
    footnotes.push({
      id: match[1],
      text: match[2].trim()
    });
  }
  
  return footnotes;
}

/**
 * Extract abbreviations from markdown content
 * Format: ABBR (Full Text)
 * Looks for uppercase abbreviations (2+ letters) followed by full text in parentheses
 */
export function extractAbbreviations(content: string): Array<{ abbr: string; full: string }> {
  const abbrRegex = /\b([A-Z]{2,})\s*\(([^)]+)\)/g;
  const abbreviations: Array<{ abbr: string; full: string }> = [];
  const seen = new Set<string>();
  
  let match;
  while ((match = abbrRegex.exec(content)) !== null) {
    const abbr = match[1];
    const full = match[2];
    
    // Avoid duplicates
    if (!seen.has(abbr)) {
      seen.add(abbr);
      abbreviations.push({ abbr, full });
    }
  }
  
  return abbreviations;
}
