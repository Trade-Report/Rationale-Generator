// PDF Trading Details Component
// Renders the trading details row with Entry, Targets, and Stoploss in light blue boxes

export const renderTradingDetails = (doc, { pageWidth, margin, tradingData, yPos }) => {
  const rowHeight = 5
  const spacing = 6
  let currentX = margin
  const boxY = yPos + 2

  // Blueish theme color (light blue background)
  doc.setFillColor(200, 220, 255) // More visible blue background
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0) // Black text on blue background

  // Entry
  if (tradingData.entrylevel) {
    const entryText = `Entry: ${tradingData.entrylevel}`
    const entryWidth = doc.getTextWidth(entryText) + 8
    doc.roundedRect(currentX, boxY, entryWidth, rowHeight, 1, 1, 'F')
    doc.text(entryText, currentX + 4, boxY + 4)
    currentX += entryWidth + spacing
  }

  // Targets
  const targetParts = []
  if (tradingData.target1) targetParts.push(tradingData.target1)
  if (tradingData.target2) targetParts.push(tradingData.target2)
  if (tradingData.target3) targetParts.push(tradingData.target3)
  if (targetParts.length > 0) {
    const targetText = `Targets: ${targetParts.join('-')}`
    const targetWidth = doc.getTextWidth(targetText) + 8
    doc.setFillColor(200, 220, 255)
    doc.roundedRect(currentX, boxY, targetWidth, rowHeight, 1, 1, 'F')
    doc.text(targetText, currentX + 4, boxY + 4)
    currentX += targetWidth + spacing
  }

  // Stoploss
  if (tradingData.stoploss) {
    const stoplossText = `Stoploss: ${tradingData.stoploss}`
    const stoplossWidth = doc.getTextWidth(stoplossText) + 8
    doc.setFillColor(200, 220, 255)
    doc.roundedRect(currentX, boxY, stoplossWidth, rowHeight, 1, 1, 'F')
    doc.text(stoplossText, currentX + 4, boxY + 4)
  }

  return yPos + rowHeight + 8
}

