// PDF Header Component
// Renders the header section by composing sub-components

import {
  renderName,
  renderSebiInfo,
  renderBseInfo,
  renderRecommendation,
  renderDate,
  renderInstrument,
  renderKeyPoints
} from './header'

export const renderHeader = (doc, { pageWidth, margin, template, tradingData, keyPoints, yPos, raName, sebiRegistration, bseEnlistment, headerDate, imagePreview }) => {
  const headerHeight = 65 // Fixed header height in mm

  // White background
  doc.setFillColor(255, 255, 255)
  doc.rect(0, yPos, pageWidth, headerHeight, 'F')

  // RA Name Title at the very top (Left aligned with small margin)
  doc.setFont('times', 'bold')
  doc.setFontSize(30)
  doc.setTextColor(0, 0, 0) // Black
  doc.text(raName || 'TRADE ANALYSIS', 5, yPos + 10)

  // SEBI and BSE Info (top right)
  // Reduced top margins as requested
  renderSebiInfo(doc, { pageWidth, margin, sebiRegistration, yPos: yPos + 8 })
  renderBseInfo(doc, { pageWidth, margin, bseEnlistment, yPos: yPos + 18 })

  // Header Row: Recommendation | Date | "TECHNICAL COMMENTARY" Title
  // Starting Y for this row, just below BSE info
  const rowY = yPos + 18

  // 1. Recommendation (Left Aligned)
  const { width: recWidth } = renderRecommendation(doc, {
    pageWidth,
    margin,
    tradingData,
    yPos: rowY,
    xPos: margin // Explicitly left aligned
  })

  // 2. Date (Beside Recommendation)
  const dateGap = 5
  // Safeguard: ensure recWidth is valid number, else default to avoid NaN
  const safeRecWidth = (typeof recWidth === 'number' && !isNaN(recWidth)) ? recWidth : 80

  renderDate(doc, {
    xPos: margin + safeRecWidth + dateGap,
    yPos: rowY,
    headerDate
  })

  // 3. Technical Commentary Title (Center Aligned on Page)
  doc.setFont('sans-serif', 'bold')
  doc.setFontSize(20) // Reduced size as requested
  doc.setTextColor(53, 4, 65)
  doc.text('Technical Commentary', pageWidth / 2, rowY, { align: 'center' })

  return rowY + 10 // Return Y position for next component (body text)
}
