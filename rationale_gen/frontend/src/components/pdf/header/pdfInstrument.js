// PDF Instrument Details Component
// Renders the trading instrument name and CMP in a light yellow box

export const renderInstrument = (doc, { recommendX, recommendY, tradingData }) => {
  if (!tradingData || (!tradingData.tradingName && !tradingData.cmp)) return
  
  // Instrument Details Box - Light yellow, larger
  const instrumentY = recommendY + 10
  const instrumentX = recommendX
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  const instrumentText = tradingData.tradingName || 'N/A'
  const cmpText = tradingData.cmp ? `CMP: ${tradingData.cmp}` : ''
  const fullText = cmpText ? `${instrumentText} ${cmpText}` : instrumentText
  const instrumentWidth = Math.max(doc.getTextWidth(fullText) + 8, 50)
  doc.setFillColor(255, 250, 200) // Light yellow
  doc.roundedRect(instrumentX, instrumentY - 5, instrumentWidth, 8, 3, 3, 'F')
  doc.setTextColor(0, 0, 0)
  doc.text(instrumentText, instrumentX + 4, instrumentY)
  if (cmpText) {
    doc.text(cmpText, instrumentX + 4, instrumentY + 4)
  }
}

