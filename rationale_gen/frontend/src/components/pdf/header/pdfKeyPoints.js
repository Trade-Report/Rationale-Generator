// PDF Key Points Component
// Renders the key points box in the header
// For template 1 (classic), also renders image beside key points

export const renderKeyPoints = (doc, { pageWidth, margin, keyPoints, yPos, headerHeight, template, imagePreview }) => {
  // Key Points Box (Bottom Right of Header)
  const keyPointsX = pageWidth * 0.55
  const keyPointsY = yPos + 45
  
  // For template 1 (classic), adjust layout to include image beside key points
  if (template === 'classic' && imagePreview) {
    // Split space: image on left, key points on right
    const imageX = keyPointsX
    const imageY = keyPointsY
    const imageWidth = (pageWidth - keyPointsX - margin) * 0.5 // 50% width for image
    const imageHeight = headerHeight - (keyPointsY - yPos) - 5
    
    // Render image on the left side
    try {
      const imageFormat = imagePreview.startsWith('data:image/png') ? 'PNG' : 'JPEG'
      doc.addImage(imagePreview, imageFormat, imageX, imageY, imageWidth, imageHeight)
    } catch (error) {
      console.error('Error adding image to header:', error)
    }
    
    // Key Points box on the right side of image
    const keyPointsBoxX = imageX + imageWidth + 5
    const keyPointsBoxWidth = pageWidth - keyPointsBoxX - margin
    
    // Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('KEY POINTS', keyPointsBoxX + keyPointsBoxWidth / 2, keyPointsY, { align: 'center' })
    
    // Content
    if (keyPoints && keyPoints.length > 0) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      let keyPointsYPos = keyPointsY + 7
      keyPoints.forEach((point, idx) => {
        if (keyPointsYPos < yPos + headerHeight - 3) {
          const lines = doc.splitTextToSize(`• ${point}`, keyPointsBoxWidth - 6)
          doc.text(lines, keyPointsBoxX + 3, keyPointsYPos)
          keyPointsYPos += lines.length * 3.5 + 1
        }
      })
    }
  } else {
    // Standard layout: Key Points only (no image)
    if (!keyPoints || keyPoints.length === 0) return
    
    const keyPointsWidth = pageWidth - keyPointsX - margin
    const keyPointsHeight = headerHeight - (keyPointsY - yPos) - 5
    
    // Title
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text('KEY POINTS', keyPointsX + keyPointsWidth / 2, keyPointsY, { align: 'center' })
    
    // Content
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    let keyPointsYPos = keyPointsY + 7
    keyPoints.forEach((point, idx) => {
      if (keyPointsYPos < yPos + headerHeight - 3) {
        const lines = doc.splitTextToSize(`• ${point}`, keyPointsWidth - 6)
        doc.text(lines, keyPointsX + 3, keyPointsYPos)
        keyPointsYPos += lines.length * 3.5 + 1
      }
    })
  }
}

