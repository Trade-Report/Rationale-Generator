// PDF Recommendation Component
// Renders the SELL/BUY recommendation box

export const renderRecommendation = (doc, { pageWidth, tradingData, yPos }) => {
  const recommendX = pageWidth * 0.55
  const recommendY = yPos + 22
  
  // Recommendation Box (SELL/BUY) - Green, rounded left corners
  const recommendation = tradingData?.recommendation || 'SELL'
  doc.setFillColor(34, 197, 94) // Green
  doc.roundedRect(recommendX, recommendY - 4, 20, 7, 3, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text(recommendation, recommendX + 10, recommendY, { align: 'center' })
  
  return { recommendX, recommendY }
}

