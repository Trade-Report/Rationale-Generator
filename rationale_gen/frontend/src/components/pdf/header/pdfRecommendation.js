// PDF Recommendation Component
// Renders the SELL/BUY recommendation box

export const renderRecommendation = (doc, { pageWidth, margin, tradingData, yPos, xPos }) => {
  const recommendX = xPos !== undefined ? xPos : margin
  const recommendY = yPos

  // Recommendation Box (SELL/BUY) - Green pill/stadium shape with white text
  const recommendation = tradingData?.recommendation || 'BUY'
  doc.setFillColor(34, 197, 94) // Green
  // Create pill/stadium shape with high border radius
  const pillHeight = 5
  const pillWidth = Math.max(20, doc.getTextWidth(recommendation) + 8)
  doc.roundedRect(recommendX, recommendY - 4, pillWidth, pillHeight, pillHeight / 2, pillHeight / 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text(recommendation, recommendX + pillWidth / 2, recommendY, { align: 'center' })

  return { recommendX, recommendY, width: pillWidth, height: pillHeight }
}

