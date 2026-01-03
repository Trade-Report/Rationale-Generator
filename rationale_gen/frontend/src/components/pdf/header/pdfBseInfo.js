// PDF BSE Enlistment Component
// Renders the BSE enlistment information

export const renderBseInfo = (doc, { pageWidth, margin, bseEnlistment, yPos }) => {
  if (!bseEnlistment || !bseEnlistment.trim()) return

  // BSE Enlistment - Helvetica, Size 18
  doc.setFont('sans-serif', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(0, 0, 0)
  const bseText = `BSE ENLISTMENT NO- ${bseEnlistment}`
  doc.text(bseText, pageWidth - margin, yPos, { align: 'right' })
}

