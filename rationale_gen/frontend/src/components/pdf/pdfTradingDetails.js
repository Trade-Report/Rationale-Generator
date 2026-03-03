// PDF Trading Details Component
// Renders the trading details row with Entry, Targets, and Stoploss in light blue boxes
// Prevents overflow by wrapping to next row and truncating long text to fit page width

const PADDING = 8
const SPACING = 6
const ROW_HEIGHT = 10

/** Truncate text to fit maxWidth, adding "…" if truncated */
const truncateToFit = (doc, text, maxWidth) => {
  if (doc.getTextWidth(text) <= maxWidth) return text
  const ellipsis = '…'
  const ellipsisWidth = doc.getTextWidth(ellipsis)
  let truncated = text
  while (truncated.length > 1 && doc.getTextWidth(truncated) + ellipsisWidth > maxWidth) {
    truncated = truncated.slice(0, -1)
  }
  return truncated + ellipsis
}

/** Draw a box, wrapping to next row or truncating if it would overflow */
const drawBox = (doc, text, currentX, boxY, maxX) => {
  const textWidth = doc.getTextWidth(text)
  let width = textWidth + PADDING
  const availableWidth = maxX - currentX - PADDING

  let displayText = text
  if (width > maxX - currentX && availableWidth > 15) {
    displayText = truncateToFit(doc, text, availableWidth)
    width = doc.getTextWidth(displayText) + PADDING
  }
  width = Math.min(width, maxX - currentX)

  doc.setFillColor(200, 220, 255)
  doc.roundedRect(currentX, boxY, width, ROW_HEIGHT - 2, 1, 1, 'F')
  doc.text(displayText, currentX + 4, boxY + 6)
  return width
}

export const renderTradingDetails = (doc, { pageWidth, margin, tradingData, yPos }) => {
  const maxX = pageWidth - margin
  let currentX = margin
  let boxY = yPos + 2

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)

  if (tradingData.tradingName) {
    const text = `Trade Name: ${tradingData.tradingName}`
    if (currentX + doc.getTextWidth(text) + PADDING > maxX && currentX > margin) {
      currentX = margin
      boxY += ROW_HEIGHT + 2
    }
    const w = drawBox(doc, text, currentX, boxY, maxX)
    currentX += w + SPACING
  }

  if (tradingData.planType) {
    const text = `Segment: ${tradingData.planType}`
    if (currentX + doc.getTextWidth(text) + PADDING > maxX && currentX > margin) {
      currentX = margin
      boxY += ROW_HEIGHT + 2
    }
    const w = drawBox(doc, text, currentX, boxY, maxX)
    currentX += w + SPACING
  }

  if (tradingData.strikePrice) {
    const isOptions = tradingData.planType && tradingData.planType.toLowerCase() === 'options'
    const strikePriceDisplay = isOptions && tradingData.optionType
      ? `${tradingData.strikePrice}${tradingData.optionType}`
      : tradingData.strikePrice
    const text = `Strike Price: ${strikePriceDisplay}`
    if (currentX + doc.getTextWidth(text) + PADDING > maxX && currentX > margin) {
      currentX = margin
      boxY += ROW_HEIGHT + 2
    }
    const w = drawBox(doc, text, currentX, boxY, maxX)
    currentX += w + SPACING
  }

  if (tradingData.expiryDate) {
    const text = `Expiry Date: ${tradingData.expiryDate}`
    if (currentX + doc.getTextWidth(text) + PADDING > maxX && currentX > margin) {
      currentX = margin
      boxY += ROW_HEIGHT + 2
    }
    const w = drawBox(doc, text, currentX, boxY, maxX)
    currentX += w + SPACING
  }

  if (tradingData.optionType && !(tradingData.planType && tradingData.planType.toLowerCase() === 'options')) {
    const text = `Option Type: ${tradingData.optionType}`
    if (currentX + doc.getTextWidth(text) + PADDING > maxX && currentX > margin) {
      currentX = margin
      boxY += ROW_HEIGHT + 2
    }
    const w = drawBox(doc, text, currentX, boxY, maxX)
    currentX += w + SPACING
  }

  if (tradingData.entrylevel) {
    const text = `Entry: ${tradingData.entrylevel}`
    if (currentX + doc.getTextWidth(text) + PADDING > maxX && currentX > margin) {
      currentX = margin
      boxY += ROW_HEIGHT + 2
    }
    const w = drawBox(doc, text, currentX, boxY, maxX)
    currentX += w + SPACING
  }

  const targetParts = []
  if (tradingData.target1) targetParts.push(tradingData.target1)
  if (tradingData.target2) targetParts.push(tradingData.target2)
  if (tradingData.target3) targetParts.push(tradingData.target3)
  if (targetParts.length > 0) {
    const text = `Targets: ${targetParts.join('-')}`
    if (currentX + doc.getTextWidth(text) + PADDING > maxX && currentX > margin) {
      currentX = margin
      boxY += ROW_HEIGHT + 2
    }
    const w = drawBox(doc, text, currentX, boxY, maxX)
    currentX += w + SPACING
  }

  if (tradingData.stoploss) {
    const text = `Stoploss: ${tradingData.stoploss}`
    if (currentX + doc.getTextWidth(text) + PADDING > maxX && currentX > margin) {
      currentX = margin
      boxY += ROW_HEIGHT + 2
    }
    drawBox(doc, text, currentX, boxY, maxX)
  }

  const totalHeight = boxY - yPos + ROW_HEIGHT + 6
  return yPos + totalHeight
}

