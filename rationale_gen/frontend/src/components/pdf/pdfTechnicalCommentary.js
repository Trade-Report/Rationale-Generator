// PDF Technical Commentary Component
// Renders the technical commentary section with title and bullet-pointed content

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

  // Start with base font size (14pt for body text)
  let fontSize = 17; // Increased by 20% from 14
  const minFontSize = 8;
  let contentHeight = 0;

  // Calculate content height with current font size
  const calculateHeight = (fontSize) => {
    let height = 0;
    const lineHeight = fontSize * 0.2;
    const textLines = text.split('\n');

    doc.setFont('sans-serif', 'bold'); // Standard serif font for body text (bold as requested)
    doc.setFontSize(fontSize);

    textLines.forEach((line) => {
      if (!line.trim()) {
        height += fontSize * 0.2;
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
  const lineHeight = fontSize * 0.5;

  const textLines = text.split('\n');

  textLines.forEach((line) => {
    if (!line.trim()) {
      currentY += fontSize * 0.1;
      return;
    }

    const parts = parseMarkdownBold(line);

    // Check if line starts with a bullet to calculate indent for wrapping
    // Standard bullet '•' or similar
    const isBulletPoint = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*');
    const bulletIndent = isBulletPoint ? 10 : -10; // standard indent for wrapped lines

    let currentX = x;
    const endX = x + maxWidth;

    // Break line into words with their style
    let words = [];
    parts.forEach(part => {
      // Split by spaces but keep them attached or handle normally. 
      // Simple split by space:
      const rawWords = part.text.split(/(\s+)/); // Keep delimiters to preserve spacing
      rawWords.forEach(w => {
        if (w.length > 0) {
          words.push({ text: w, isBold: part.isBold });
        }
      });
    });

    // Render words with wrapping
    words.forEach((wordObj, index) => {
      // Default to bold, but respect markdown markers if they were used (though now mostly redundant if everything is bold)
      doc.setFont('sans-serif', 'bold');
      doc.setFontSize(fontSize);
      const wordWidth = doc.getTextWidth(wordObj.text);

      // Check if word fits
      if (currentX + wordWidth > endX) {
        currentY += lineHeight;
        currentX = x;

        // If word is just a space, ignore it on new line start (optional but good practice)
        if (!wordObj.text.trim()) return;
      }

      doc.text(wordObj.text, currentX, currentY);
      currentX += wordWidth;
    });

    // End of paragraph/bullet point
    currentY += lineHeight;
  });

  return currentY;
};

