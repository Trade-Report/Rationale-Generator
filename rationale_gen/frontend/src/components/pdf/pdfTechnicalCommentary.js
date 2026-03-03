// PDF Technical Commentary Component
// Renders the technical commentary section with title and bullet-pointed content
// Supports **bold**, *italic*, __underline__ - markers are parsed and rendered as formatting

import { parseMarkdownFormat } from './pdfTextRenderer'

export const renderTechnicalCommentary = (doc, { pageWidth, margin, rationale, yPos, pageHeight, footerHeight, disclaimerHeight }) => {
  if (!rationale || !rationale.trim()) return yPos

  // Title removed as it is now rendered in the Header component

  // Calculate available height for content (ensure disclaimer is always visible)
  // Use passed disclaimerHeight or default to 60 if not provided
  const reservedDisclaimerHeight = disclaimerHeight || 60
  const availableHeight = pageHeight - footerHeight - yPos - reservedDisclaimerHeight - 10 // Reserve space for disclaimer + padding
  const maxWidth = pageWidth - 2 * margin

  // Set text color to Black as requested
  doc.setTextColor(0, 0, 0)
  doc.setFont('sans-serif', 'bold')

  // Render text with dynamic font sizing
  const finalY = renderTextWithDynamicFont(doc, rationale, margin, yPos, maxWidth, availableHeight)

  return finalY + 5
}

/**
 * Render text with dynamic font sizing to fit available height
 * Adjusts font size so disclaimer is always visible
 * Supports bold keywords using **text** markdown syntax
 */
const renderTextWithDynamicFont = (doc, text, x, y, maxWidth, availableHeight) => {
  if (!text) return y;

  // Base font size for technical commentary (bold, readable)
  let fontSize = 18;
  const minFontSize = 14;
  let contentHeight = 0;

  // Calculate content height with current font size (must match render line height)
  const calculateHeight = (fontSize) => {
    let height = 0;
    const lineHeight = fontSize * 0.5; // Match render line height
    const textLines = text.split('\n');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fontSize);

    textLines.forEach((line) => {
      if (!line.trim()) {
        height += fontSize * 0.2;
        return;
      }

      const formatParts = parseMarkdownFormat(line);
      const cleanLine = formatParts.map(p => p.text).join('');
      const wrappedLines = doc.splitTextToSize(cleanLine, maxWidth);
      height += wrappedLines.length * lineHeight;
    });

    return height;
  };

  // Reduce font size if content is too tall
  contentHeight = calculateHeight(fontSize);
  while (contentHeight > availableHeight && fontSize > minFontSize) {
    fontSize -= 0.5;
    contentHeight = calculateHeight(fontSize);
  }

  // Now render with the calculated font size and bold support
  let currentY = y;
  const lineHeight = fontSize * 0.5;

  const textLines = text.split('\n');

  textLines.forEach((line) => {
    if (!line.trim()) {
      currentY += fontSize * 0.1;
      return;
    }

    const parts = parseMarkdownFormat(line);

    let currentX = x;
    const endX = x + maxWidth;

    // Break parts into words with their style
    let words = [];
    parts.forEach(part => {
      const rawWords = part.text.split(/(\s+)/);
      rawWords.forEach(w => {
        if (w.length > 0) {
          words.push({ text: w, bold: part.bold, italic: part.italic, underline: part.underline });
        }
      });
    });

    // Render words with proper formatting (default to bold for technical commentary)
    words.forEach((wordObj) => {
      const fontStyle = wordObj.bold && wordObj.italic ? 'bolditalic' : wordObj.italic && !wordObj.bold ? 'italic' : 'bold';
      doc.setFont('helvetica', fontStyle);
      doc.setFontSize(fontSize);
      const wordWidth = doc.getTextWidth(wordObj.text);

      if (currentX + wordWidth > endX) {
        currentY += lineHeight;
        currentX = x;
        if (!wordObj.text.trim()) return;
      }

      doc.text(wordObj.text, currentX, currentY);
      if (wordObj.underline) {
        const lineY = currentY + (doc.getLineHeight() / doc.internal.scaleFactor) * 0.15;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.1);
        doc.line(currentX, lineY, currentX + wordWidth, lineY);
      }
      currentX += wordWidth;
    });

    // End of paragraph/bullet point
    currentY += lineHeight;
  });

  return currentY;
};

