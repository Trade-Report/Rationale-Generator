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

      // Calculate required height based on content
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      let totalHeight = 10 // Header "Key Points" + padding

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const maxTextWidth = boxWidth - 8

      // Enforce min 6, max 10 key points
      const MIN_KEY_POINTS = 6
      const MAX_KEY_POINTS = 10

      // Start with available key points (max 10)
      let pointsToRender = keyPoints.slice(0, MAX_KEY_POINTS)

      // If fewer than 6 key points, add fallback points
      if (pointsToRender.length < MIN_KEY_POINTS) {
        const fallbackPoints = [
          'Monitor price action for trend confirmation.',
          'Watch for volume changes at key levels.',
          'Risk management should be maintained.',
          'Key support and resistance levels are critical.',
          'Market momentum should guide entry timing.',
          'Volatility conditions may impact trade execution.'
        ]

        let index = 0
        while (pointsToRender.length < MIN_KEY_POINTS && index < fallbackPoints.length) {
          // Only add if not already present
          if (!pointsToRender.includes(fallbackPoints[index])) {
            pointsToRender.push(fallbackPoints[index])
          }
          index++
        }
      }

      // Pre-calculate height for all points
      pointsToRender.forEach((point) => {
        const cleanPoint = point.replace(/^\W+/, '')
        const lines = doc.splitTextToSize('• ' + cleanPoint, maxTextWidth)
        totalHeight += lines.length * 4 + 1
      })

      totalHeight += 4 // Bottom padding

      // Draw dynamic background
      doc.setFillColor(230, 240, 255) // Light blue
      doc.roundedRect(boxX, yPos, boxWidth, totalHeight, 2, 2, 'F')

      // Draw header
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)
      doc.text('Key Points', boxX + 4, yPos + 6)

      // Draw points
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)

      let textY = yPos + 12
      pointsToRender.forEach((point) => {
        const cleanPoint = point.replace(/^\W+/, '')
        const lines = doc.splitTextToSize('• ' + cleanPoint, maxTextWidth)
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

