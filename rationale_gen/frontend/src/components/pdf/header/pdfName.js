// PDF Name Component
// Renders the RA Name in the header

import { TEMPLATES } from '../../../App'

export const renderName = (doc, { margin, template, raName, yPos }) => {
  if (!raName || !raName.trim()) return yPos
  
  const templateConfig = TEMPLATES[template] || TEMPLATES.classic
  
  // RA Name - Very large, bold, heavy slab-serif style (36-40pt)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(38) // 36-40pt range, using 38pt
  doc.setTextColor(templateConfig.nameColor.r, templateConfig.nameColor.g, templateConfig.nameColor.b)
  doc.text(raName.toUpperCase(), margin, yPos)
  
  return yPos + 10
}

