// PDF Technical Commentary Component
// Renders the technical commentary section with title and bullet-pointed content

export const renderTechnicalCommentary = (doc, { pageWidth, margin, rationale, yPos, pageHeight, footerHeight }) => {
  if (!rationale || !rationale.trim()) return yPos

  // Title removed as it is now rendered in the Header component

  // Calculate available height for content (ensure disclaimer is always visible)
  const availableHeight = pageHeight - footerHeight - yPos - 60 // Reserve space for disclaimer
  const maxWidth = pageWidth - 2 * margin

  // Set text color to Black as requested
  doc.setTextColor(0, 0, 0)
  doc.setFont('sans-serif', 'bold')

  // Render text with dynamic font sizing
  const finalY = renderTextWithDynamicFont(doc, rationale, margin, yPos, maxWidth, availableHeight)

  return finalY + 5
}

/**
 * Parse markdown bold syntax (**text**)
 */
const parseMarkdownBold = (text) => {
  const parts = []
  const boldRegex = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.substring(lastIndex, match.index), isBold: false })
    }
    parts.push({ text: match[1], isBold: true })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.substring(lastIndex), isBold: false })
  }

  if (parts.length === 0) {
    parts.push({ text, isBold: false })
  }

  return parts
}

/**
 * Render text with dynamic font sizing to fit available height
 * Adjusts font size so disclaimer is always visible
 * Supports bold keywords using **text** markdown syntax
 */
const renderTextWithDynamicFont = (doc, text, x, y, maxWidth, availableHeight) => {
  if (!text) return y;

  // Start with base font size (12pt for body text)
  let fontSize = 12;
  const minFontSize = 8;
  let contentHeight = 0;

  // Calculate content height with current font size
  const calculateHeight = (fontSize) => {
    let height = 0;
    const lineHeight = fontSize * 0.8;
    const textLines = text.split('\n');

    doc.setFont('sans-serif', 'normal'); // Standard serif font for body text
    doc.setFontSize(fontSize);

    textLines.forEach((line) => {
      if (!line.trim()) {
        height += fontSize * 0.3;
        return;
      }

      // Remove markdown markers for height calculation
      const cleanLine = line.replace(/\*\*/g, '');
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
  // Reduce line height multiplier for tighter spacing
  const lineHeight = fontSize * 1.0; // Reduced from 1.2

  const textLines = text.split('\n');

  textLines.forEach((line) => {
    if (!line.trim()) {
      currentY += fontSize * 0.3;
      return;
    }
    const parts = parseMarkdownBold(line);
    let currentX = x;
    parts.forEach((part) => {
      doc.setFont('sans-serif', part.isBold ? 'bold' : 'normal');
      doc.setFontSize(fontSize);
      doc.text(part.text, currentX, currentY);
      currentX += doc.getTextWidth(part.text);
    });
    currentY += lineHeight;
  });

  return currentY;
};

