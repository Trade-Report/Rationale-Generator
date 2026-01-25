// Helper functions for PDF generation

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
  const getStringValue = (value) => {
    if (value === null || value === undefined) return ''
    return String(value).trim()
  }

  // Extract and normalize Plan Type for Enum compatibility (Title Case)
  const rawPlanType = getStringValue(selectedRow.planType || selectedRow.PlanType || selectedRow.plan_type || selectedRow['Segment'] || 'Equity');
  const planType = rawPlanType.charAt(0).toUpperCase() + rawPlanType.slice(1).toLowerCase(); // Ensure Title Case (Equity, Commodity, etc.)

  return {
    tradingName: getStringValue(selectedRow.TradingName || selectedRow.tradingName || selectedRow['Trading Name'] || selectedRow['Script Name'] || selectedRow['Trade Name'] || selectedRow.script || ''),
    cmp: getStringValue(selectedRow.CMP || selectedRow.cmp || selectedRow['Current Market Price'] || selectedRow['Current Price'] || ''),
    entrylevel: getStringValue(selectedRow.entrylevel || selectedRow.EntryLevel || selectedRow.entry_level || selectedRow['Entry Level'] || selectedRow['EntryLevel'] || selectedRow.entryPrice || selectedRow.EntryPrice || selectedRow.entry_price || selectedRow['Entry Price'] || ''),
    target1: getStringValue(selectedRow.target1 || selectedRow.Target1 || selectedRow.target_1 || selectedRow['Target 1'] || ''),
    target2: getStringValue(selectedRow.target2 || selectedRow.Target2 || selectedRow.target_2 || selectedRow['Target 2'] || ''),
    target3: getStringValue(selectedRow.target3 || selectedRow.Target3 || selectedRow.target_3 || selectedRow['Target 3'] || ''),
    stoploss: getStringValue(selectedRow.stoploss || selectedRow.StopLoss || selectedRow.stop_loss || selectedRow['Stop Loss'] || selectedRow['Stop-Loss'] || ''),
    recommendation: getStringValue(selectedRow.recommendation || selectedRow.Recommendation || selectedRow['Trade Type'] || selectedRow.action || selectedRow.Action || 'OUTLOOK').toUpperCase(),
    planType: getStringValue(selectedRow.planType || selectedRow.PlanType || selectedRow.plan_type || selectedRow['Segment'] || 'Equity'),
    strikePrice: getStringValue(selectedRow.strikePrice || selectedRow.StrikePrice || selectedRow['Strike Price'] || selectedRow.strikeprice || ''),
    expiryDate: getStringValue(selectedRow.expiryDate || selectedRow.ExpiryDate || selectedRow['Expiry Date'] || selectedRow.expirydate || ''),
    optionType: getStringValue(selectedRow.optionType || selectedRow.OptionType || selectedRow['Option Type'] || selectedRow.optiontype || '')
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

