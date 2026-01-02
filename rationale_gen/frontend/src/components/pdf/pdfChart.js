// PDF Chart Component
// Renders the chart image section

export const renderChart = (doc, { pageWidth, margin, imagePreview, yPos }) => {
  if (!imagePreview) return yPos
  
  try {
    const chartWidth = pageWidth - 2 * margin
    const chartHeight = 60 // Fixed height in mm
    const imageFormat = imagePreview.startsWith('data:image/png') ? 'PNG' : 'JPEG'
    doc.addImage(imagePreview, imageFormat, margin, yPos, chartWidth, chartHeight)
    return yPos + chartHeight + 2 // Reduced spacing to place technical commentary just below
  } catch (error) {
    console.error('Error adding chart image:', error)
    return yPos
  }
}

