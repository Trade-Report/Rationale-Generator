// PDF Key Points Component
// Renders the key points box in the header
// For template 1 (classic), also renders image beside key points

export const renderKeyPoints = (doc, { pageWidth, margin, keyPoints, yPos, headerHeight, template, imagePreview }) => {
  // Key Points Box (Top Left of Header - First element)
  if (!keyPoints || keyPoints.length === 0) return
  
  const keyPointsX = margin
  const keyPointsY = yPos + 8 // Start at the top
  const keyPointsWidth = pageWidth * 0.48 // Use left half of header
  const maxHeight = 25 // Limit height so it doesn't overlap with other elements
  
  // Title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text('KEY POINTS', keyPointsX + keyPointsWidth / 2, keyPointsY, { align: 'center' })
  
  // Content - Limit to first 5 points only
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  let keyPointsYPos = keyPointsY + 7
  const limitedKeyPoints = keyPoints.slice(0, 5) // Only take first 5 points
  limitedKeyPoints.forEach((point, idx) => {
    if (keyPointsYPos < keyPointsY + maxHeight) {
      const lines = doc.splitTextToSize(`• ${point}`, keyPointsWidth - 6)
      doc.text(lines, keyPointsX + 3, keyPointsYPos)
      keyPointsYPos += lines.length * 3.5 // Removed the +1 spacing between points
    }
  })
}

