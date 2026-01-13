// PDF Chart Component
// Renders the chart image section

export const renderChart = (doc, { pageWidth, margin, imagePreview, yPos, keyPoints }) => {
  if (!imagePreview) return yPos

  try {
    const contentWidth = pageWidth - 2 * margin
    const gap = 10 // Increased gap for better spacing

    // Detect image properties for aspect ratio
    const imgProps = doc.getImageProperties(imagePreview)
    const originalRatio = imgProps.width / imgProps.height

    // Increase chart width to ~65% of page width
    const chartWidth = contentWidth * 0.65

    // Calculate chart height based on original aspect ratio
    // But cap it so it doesn't take over the entire page
    let chartHeight = chartWidth / originalRatio

    // Safety cap for height (e.g., 90mm or ~30% of page height)
    const maxHeight = 90
    if (chartHeight > maxHeight) {
      chartHeight = maxHeight
    }

    // 1. Render Chart (Left Side)
    const imageFormat = imagePreview.startsWith('data:image/png') ? 'PNG' : 'JPEG'
    doc.addImage(imagePreview, imageFormat, margin, yPos, chartWidth, chartHeight)

    // 2. Render Key Points (Right Side)
    if (keyPoints && keyPoints.length > 0) {
      const boxX = margin + chartWidth + gap
      const boxWidth = contentWidth - chartWidth - gap
      const boxHeight = chartHeight

      // Blueish background
      doc.setFillColor(230, 240, 255) // Light blue
      doc.roundedRect(boxX, yPos, boxWidth, boxHeight, 2, 2, 'F')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)
      doc.text('Key Points', boxX + 4, yPos + 6)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9) // Smaller font for points

      let textY = yPos + 12
      const maxTextWidth = boxWidth - 8

      keyPoints.slice(0, 8).forEach((point) => { // Limit to 8 points to fit the potentially taller box
        const bullet = '• '
        // Clean point text
        const cleanPoint = point.replace(/^\W+/, '')
        const lines = doc.splitTextToSize(bullet + cleanPoint, maxTextWidth)

        // Check if we have space
        if (textY + lines.length * 4 > yPos + boxHeight) return

        doc.text(lines, boxX + 4, textY)
        textY += lines.length * 4 + 1
      })
    }

    return yPos + chartHeight + 10 // Spacing after section
  } catch (error) {
    console.error('Error adding chart image:', error)
    return yPos
  }
}

