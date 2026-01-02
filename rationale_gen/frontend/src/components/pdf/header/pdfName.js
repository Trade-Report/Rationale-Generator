// PDF Name Component
// Renders the RA Name in the header

import { TEMPLATES } from '../../../App'

export const renderName = (doc, { margin, template, raName, yPos }) => {
  if (!raName || !raName.trim()) return yPos
  
  const templateConfig = TEMPLATES[template] || TEMPLATES.classic
  
  // RA Name - Very large, bold, uses template color
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(30)
  doc.setTextColor(templateConfig.nameColor.r, templateConfig.nameColor.g, templateConfig.nameColor.b)
  doc.text(raName.toUpperCase(), margin, yPos)
  
  return yPos + 10
}

