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
  
  // Render Key Points component first (at the top left)
  renderKeyPoints(doc, { pageWidth, margin, keyPoints, yPos, headerHeight, template, imagePreview })
  
  // Render Name component (below Key Points or at right side)
  let currentY = yPos + 30 // Position below Key Points area
  currentY = renderName(doc, { margin, template, raName, yPos: currentY })
  
  // Render SEBI and BSE Info components (both at top right, SEBI above BSE)
  renderSebiInfo(doc, { pageWidth, margin, sebiRegistration, yPos: yPos + 8 })
  renderBseInfo(doc, { pageWidth, margin, bseEnlistment, yPos: yPos + 14 })
  
  // Render Recommendation component
  const { recommendX, recommendY } = renderRecommendation(doc, { pageWidth, tradingData, yPos })
  
  // Render Date component
  renderDate(doc, { recommendX, recommendY, headerDate })
  
  // Render Instrument component
  renderInstrument(doc, { recommendX, recommendY, tradingData })
  
  return yPos + headerHeight
}

