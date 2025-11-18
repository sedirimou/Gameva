/**
 * Auto-format long product descriptions from Kinguin API.
 * Converts single-block or line-separated text into clean HTML paragraphs.
 * Automatically adds product title as bold heading on the first line.
 * 
 * Handles two main content types:
 * 1. Pre-formatted text with line breaks (e.g., Stardew Valley features)
 * 2. Single-block paragraph text (e.g., WWE 2K Battlegrounds)
 */

export function formatDescription(rawText, productTitle = null) {
  if (!rawText || typeof rawText !== 'string') return rawText;
  
  // Clean up the text first
  const cleanText = rawText.trim();
  
  // If the text already contains HTML paragraph tags, return as is
  if (cleanText.includes('<p>') && cleanText.includes('</p>')) {
    return cleanText;
  }
  
  // Process the entire text, handling mixed content
  const result = [];
  
  // Split by double line breaks first to identify distinct sections
  const sections = cleanText.split(/\n\s*\n|\r\n\s*\r\n/);
  
  for (const section of sections) {
    const trimmedSection = section.trim();
    if (!trimmedSection) continue;
    
    // Check if this section has single line breaks (list-like content)
    if (trimmedSection.includes('\n') || trimmedSection.includes('\r\n')) {
      // Format as separate paragraphs for each line
      const lines = trimmedSection
        .split(/\n|\r\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      for (const line of lines) {
        result.push(`<p>${line}</p>`);
      }
    } else {
      // Format as sentence-based paragraphs
      const sentences = trimmedSection.split(/(?<=[.?!])\s+/);
      
      if (sentences.length <= 3) {
        // Short section, keep as single paragraph
        result.push(`<p>${trimmedSection}</p>`);
      } else {
        // Long section, group sentences into paragraphs
        const paragraphLength = 3;
        for (let i = 0; i < sentences.length; i += paragraphLength) {
          const chunk = sentences.slice(i, i + paragraphLength).join(' ');
          if (chunk.trim()) {
            result.push(`<p>${chunk.trim()}</p>`);
          }
        }
      }
    }
  }
  
  // If no sections were found (no double line breaks), treat as single block
  if (result.length === 0) {
    const sentences = cleanText.split(/(?<=[.?!])\s+/);
    
    if (sentences.length <= 3) {
      result.push(`<p>${cleanText}</p>`);
    } else {
      const paragraphLength = 3;
      for (let i = 0; i < sentences.length; i += paragraphLength) {
        const chunk = sentences.slice(i, i + paragraphLength).join(' ');
        if (chunk.trim()) {
          result.push(`<p>${chunk.trim()}</p>`);
        }
      }
    }
  }
  
  // Add product title as bold heading if provided
  if (productTitle && productTitle.trim()) {
    result.unshift(`<p><strong>${productTitle.trim()}</strong></p>`);
  }

  return result.join('\n\n');
}

/**
 * Example usage in Kinguin import pipeline:
 * 
 * import { formatDescription } from '../lib/formatDescription.js';
 * 
 * const rawDescription = kinguinProduct.description;
 * const formattedDescription = formatDescription(rawDescription);
 * 
 * await saveProduct({
 *   ...kinguinProduct,
 *   description: formattedDescription,
 * });
 */