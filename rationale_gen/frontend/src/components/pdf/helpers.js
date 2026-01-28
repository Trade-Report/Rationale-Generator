// Helper functions for PDF generation

// ==================== DYNAMIC PAGE HEIGHT CALCULATION ====================

/**
 * Calculate the height needed for the Technical Commentary section
 * @param {jsPDF} doc - The jsPDF document instance
 * @param {string} rationale - The technical commentary text
 * @param {number} maxWidth - Maximum width for text
 * @param {number} fontSize - Font size (default 17)
 * @returns {number} Height in mm
 */
export const calculateTechnicalCommentaryHeight = (doc, rationale, maxWidth, fontSize = 17) => {
  if (!rationale || !rationale.trim()) return 0

  let height = 0
  const lineHeight = fontSize * 0.5
  const textLines = rationale.split('\n')

  doc.setFont('sans-serif', 'bold')
  doc.setFontSize(fontSize)

  textLines.forEach((line) => {
    if (!line.trim()) {
      height += fontSize * 0.1
      return
    }

    // Remove markdown markers for height calculation
    const cleanLine = line.replace(/\*\*/g, '')
    const wrappedLines = doc.splitTextToSize(cleanLine, maxWidth)
    height += wrappedLines.length * lineHeight
  })

  return height + 10 // Add padding
}

/**
 * Calculate the height needed for the Disclaimer section
 * @param {jsPDF} doc - The jsPDF document instance
 * @param {string} pdfDisclaimer - The disclaimer text
 * @param {number} disclaimerWidth - Width for disclaimer text
 * @param {number} fontSize - Font size (default 17)
 * @returns {number} Height in mm
 */
export const calculateDisclaimerHeight = (doc, pdfDisclaimer, disclaimerWidth, fontSize = 17) => {
  const disclaimerWebsite = 'https://chartntrade.com/research-disclaimer'
  const disclaimerBaseText = pdfDisclaimer || 'Investments in Securities market are subject to market risks. Read all the related documents carefully before investing. For complete disclaimer and disclosure, please refer to the website: ' + disclaimerWebsite
  const disclaimerText = disclaimerBaseText.includes('http') ? disclaimerBaseText : `${disclaimerBaseText}\n\nFor complete disclaimer and disclosure, please refer to: ${disclaimerWebsite}`

  doc.setFontSize(fontSize)
  doc.setFont('times', 'italic')

  const disclaimerLines = doc.splitTextToSize(disclaimerText, disclaimerWidth)
  const lineHeight = doc.getLineHeight() / doc.internal.scaleFactor
  const contentHeight = disclaimerLines.length * lineHeight

  return contentHeight + 20 // Add padding (12 initial + 5 final)
}

/**
 * Calculate the height needed for the Chart section
 * @param {jsPDF} doc - The jsPDF document instance
 * @param {string} imagePreview - Base64 image data
 * @param {number} contentWidth - Available content width
 * @param {Array} keyPoints - Key points array
 * @returns {number} Height in mm
 */
export const calculateChartHeight = (doc, imagePreview, contentWidth, keyPoints) => {
  if (!imagePreview) return 0

  try {
    const imgProps = doc.getImageProperties(imagePreview)
    const originalRatio = imgProps.width / imgProps.height
    const chartWidth = contentWidth * 0.65
    let chartHeight = chartWidth / originalRatio

    // Safety cap for height
    const maxHeight = 90
    if (chartHeight > maxHeight) {
      chartHeight = maxHeight
    }

    // Also consider key points box height if it might be taller
    if (keyPoints && keyPoints.length > 0) {
      const boxWidth = contentWidth - chartWidth - 10
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      let keyPointsHeight = 10 // Header

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      const maxTextWidth = boxWidth - 8

      // Calculate for min 6, max 10 key points
      const MIN_KEY_POINTS = 6
      const MAX_KEY_POINTS = 10
      const pointsCount = Math.max(MIN_KEY_POINTS, Math.min(keyPoints.length, MAX_KEY_POINTS))
      const pointsToRender = keyPoints.slice(0, pointsCount)

      pointsToRender.forEach((point) => {
        const cleanPoint = point.replace(/^\W+/, '')
        const lines = doc.splitTextToSize('• ' + cleanPoint, maxTextWidth)
        keyPointsHeight += lines.length * 4 + 1
      })

      keyPointsHeight += 4 // Bottom padding

      // Return the taller of chart or key points
      return Math.max(chartHeight, keyPointsHeight) + 10
    }

    return chartHeight + 10 // Add spacing after section
  } catch (error) {
    console.error('Error calculating chart height:', error)
    return 0
  }
}

/**
 * Get the fixed header height
 * @returns {number} Height in mm (fixed at 28mm - just the row height + spacing)
 */
export const getHeaderHeight = () => {
  return 28 // Header row Y (18) + margin (10)
}

/**
 * Get the trading details height
 * @returns {number} Height in mm
 */
export const getTradingDetailsHeight = () => {
  return 18 // rowHeight (8) + padding (8) + some margin
}

/**
 * Get the footer height
 * @returns {number} Height in mm
 */
export const getFooterHeight = () => {
  return 56
}

/**
 * Calculate the total dynamic page height based on all content
 * @param {jsPDF} doc - The jsPDF document instance
 * @param {Object} options - Content options
 * @returns {number} Total page height in mm
 */
export const calculateDynamicPageHeight = (doc, {
  pageWidth,
  margin,
  rationale,
  pdfDisclaimer,
  imagePreview,
  keyPoints,
  componentOrder = ['chart', 'tradingDetails', 'technicalCommentary', 'disclaimer']
}) => {
  const contentWidth = pageWidth - 2 * margin
  const disclaimerMargin = 5
  const disclaimerWidth = pageWidth - 2 * disclaimerMargin

  // Start with header height
  let totalHeight = getHeaderHeight()

  // Calculate height for each component based on order
  componentOrder.forEach((componentType) => {
    switch (componentType) {
      case 'chart':
        totalHeight += calculateChartHeight(doc, imagePreview, contentWidth, keyPoints)
        break
      case 'tradingDetails':
        totalHeight += getTradingDetailsHeight()
        break
      case 'technicalCommentary':
        totalHeight += calculateTechnicalCommentaryHeight(doc, rationale, contentWidth)
        break
      case 'disclaimer':
        totalHeight += calculateDisclaimerHeight(doc, pdfDisclaimer, disclaimerWidth)
        break
      default:
        break
    }
  })

  // Add footer height
  totalHeight += getFooterHeight()

  // Add some buffer margin (top + bottom margins)
  const bufferMargin = 30

  return totalHeight + bufferMargin
}

// ==================== END DYNAMIC PAGE HEIGHT CALCULATION ====================

// Convert hex color to RGB
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 245, g: 245, b: 245 } // Default light gray
}

// Extract trading data from Excel row
export const getTradingData = (fileInfo, selectedStockIndex, excelRows) => {
  if (!fileInfo || fileInfo.type !== 'excel' || selectedStockIndex === null || !excelRows[selectedStockIndex]) {
    return {
      tradingName: '',
      cmp: '',
      entrylevel: '',
      target1: '',
      target2: '',
      target3: '',
      stoploss: '',
      recommendation: '' // SELL/BUY
    }
  }

  const selectedRow = excelRows[selectedStockIndex]

  /**
   * Helper function to get string value from a field
   */
  const getStringValue = (value) => {
    if (value === null || value === undefined) return ''
    return String(value).trim()
  }

  /**
   * Helper function to check if a value is valid (not empty, '-', '0', or other invalid values)
   * Returns empty string if invalid, otherwise returns the cleaned value
   */
  const getValidValue = (value) => {
    const stringVal = getStringValue(value)
    // Invalid values that should be treated as empty
    const invalidValues = ['', '-', '0', '0.0', '0.00', 'na', 'n/a', 'nil', 'none', 'null', 'undefined']
    if (invalidValues.includes(stringVal.toLowerCase())) {
      return ''
    }
    return stringVal
  }

  // Extract and normalize Plan Type / Segment for field filtering
  const rawPlanType = getStringValue(
    selectedRow.planType || selectedRow.PlanType || selectedRow.plan_type ||
    selectedRow['Segment'] || selectedRow.segment || 'Equity'
  )
  const planType = rawPlanType.charAt(0).toUpperCase() + rawPlanType.slice(1).toLowerCase() // Ensure Title Case
  const planTypeLower = planType.toLowerCase()

  /**
   * Segment-based field rules:
   * - Equity: No Strike Price, No Option Type, No Expiry Date
   * - Options: Has Strike Price, Option Type, Expiry Date
   * - Commodity: Has Expiry Date, No Strike Price, No Option Type
   * - Derivatives: Has Expiry Date, No Strike Price, No Option Type
   */
  const segmentFieldRules = {
    equity: {
      showStrikePrice: false,
      showOptionType: false,
      showExpiryDate: false
    },
    options: {
      showStrikePrice: true,
      showOptionType: true,
      showExpiryDate: true
    },
    commodity: {
      showStrikePrice: false,
      showOptionType: false,
      showExpiryDate: true
    },
    derivatives: {
      showStrikePrice: false,
      showOptionType: false,
      showExpiryDate: true
    }
  }

  // Get the field rules for current segment (default to equity if unknown)
  const rules = segmentFieldRules[planTypeLower] || segmentFieldRules.equity

  // Extract values with validation
  const strikePrice = rules.showStrikePrice
    ? getValidValue(selectedRow.strikePrice || selectedRow.StrikePrice || selectedRow['Strike Price'] || selectedRow.strikeprice || '')
    : ''

  const optionType = rules.showOptionType
    ? getValidValue(selectedRow.optionType || selectedRow.OptionType || selectedRow['Option Type'] || selectedRow['Options Type'] || selectedRow.optiontype || '')
    : ''

  const expiryDate = rules.showExpiryDate
    ? getValidValue(selectedRow.expiryDate || selectedRow.ExpiryDate || selectedRow['Expiry Date'] || selectedRow.expirydate || '')
    : ''

  return {
    tradingName: getValidValue(selectedRow.TradingName || selectedRow.tradingName || selectedRow['Trading Name'] || selectedRow['Script Name'] || selectedRow['Trade Name'] || selectedRow.script || ''),
    cmp: getValidValue(selectedRow.CMP || selectedRow.cmp || selectedRow['Current Market Price'] || selectedRow['Current Price'] || ''),
    entrylevel: getValidValue(selectedRow.entrylevel || selectedRow.EntryLevel || selectedRow.entry_level || selectedRow['Entry Level'] || selectedRow['EntryLevel'] || selectedRow.entryPrice || selectedRow.EntryPrice || selectedRow.entry_price || selectedRow['Entry Price'] || ''),
    target1: getValidValue(selectedRow.target1 || selectedRow.Target1 || selectedRow.target_1 || selectedRow['Target 1'] || ''),
    target2: getValidValue(selectedRow.target2 || selectedRow.Target2 || selectedRow.target_2 || selectedRow['Target 2'] || ''),
    target3: getValidValue(selectedRow.target3 || selectedRow.Target3 || selectedRow.target_3 || selectedRow['Target 3'] || ''),
    stoploss: getValidValue(selectedRow.stoploss || selectedRow.StopLoss || selectedRow.stop_loss || selectedRow['Stop Loss'] || selectedRow['Stop-Loss'] || ''),
    recommendation: getStringValue(selectedRow.recommendation || selectedRow.Recommendation || selectedRow['Trade Type'] || selectedRow.action || selectedRow.Action || 'OUTLOOK').toUpperCase(),
    planType: planType,
    strikePrice: strikePrice,
    expiryDate: expiryDate,
    optionType: optionType
  }
}

// Extract key points from rationale
export const extractKeyPoints = (rationale) => {
  // Extract MACD and RSI mentions from rationale if available
  const macdMatch = rationale.match(/MACD[^•\n]*/i)
  const rsiMatch = rationale.match(/RSI[^•\n]*/i)

  const keyPoints = []
  if (macdMatch) keyPoints.push(`MACD: ${macdMatch[0].replace(/^MACD[:\s]+/i, '').trim()}`)
  if (rsiMatch) keyPoints.push(`RSI: ${rsiMatch[0].replace(/^RSI[:\s]+/i, '').trim()}`)

  // If no specific matches, use generic key points
  if (keyPoints.length === 0) {
    keyPoints.push('MACD: Bearish crossover with histogram turning red, indicating momentum shift in favor of sellers.')
    keyPoints.push('RSI: Gradual decline from overbought territory, showing reduced buying strength and potential for further downside.')
  }

  return keyPoints
}

