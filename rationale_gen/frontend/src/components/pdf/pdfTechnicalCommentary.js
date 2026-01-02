// PDF Technical Commentary Component
// Renders the technical commentary section with title and bullet-pointed content

export const renderTechnicalCommentary = (doc, { pageWidth, margin, rationale, yPos, pageHeight, footerHeight }) => {
  if (!rationale || !rationale.trim()) return yPos
  
  // Title - Large, bold
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text('Technical COMMENTORY', margin, yPos)
  yPos += 10
  
  // Calculate available height for content (ensure disclaimer is always visible)
  const availableHeight = pageHeight - footerHeight - yPos - 60 // Reserve space for disclaimer
  const maxWidth = pageWidth - 2 * margin
  
  // Render text with dynamic font sizing
  const finalY = renderTextWithDynamicFont(doc, rationale, margin, yPos, maxWidth, availableHeight)
  
  return finalY + 5
}

/**
 * Render text with dynamic font sizing to fit available height
 * Adjusts font size so disclaimer is always visible
 * Renders ** as literal text
 */
const renderTextWithDynamicFont = (doc, text, x, y, maxWidth, availableHeight) => {
  if (!text) return y
  
  // Start with base font size
  let fontSize = 11
  const minFontSize = 7
  let contentHeight = 0
  
  // Calculate content height with current font size
  const calculateHeight = (fontSize) => {
    let height = 0
    const lineHeight = fontSize * 1.2 // Reduced from 1.4 to reduce spacing
    const textLines = text.split('\n')
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(fontSize)
    
    textLines.forEach((line) => {
      if (!line.trim()) {
        height += fontSize * 0.3 // Reduced spacing for empty lines
        return
      }
      
      // Render ** as literal text (no removal)
      const wrappedLines = doc.splitTextToSize(line, maxWidth)
      height += wrappedLines.length * lineHeight
    })
    
    return height
  }
  
  // Reduce font size if content is too tall
  contentHeight = calculateHeight(fontSize)
  while (contentHeight > availableHeight && fontSize > minFontSize) {
    fontSize -= 0.5
    contentHeight = calculateHeight(fontSize)
  }
  
  // Now render with the calculated font size
  let currentY = y
  const lineHeight = fontSize * 1.2 // Reduced from 1.4 to reduce spacing
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(fontSize)
  
  // Split by lines to preserve structure (including bullet points)
  const textLines = text.split('\n')
  
  textLines.forEach((line) => {
    if (!line.trim()) {
      currentY += fontSize * 0.3 // Reduced spacing for empty lines
      return
    }
    
    // Render line as-is (including ** markers)
    const lines = doc.splitTextToSize(line, maxWidth)
    doc.text(lines, x, currentY)
    currentY += lines.length * lineHeight
  })
  
  return currentY
}

