// PDF SEBI Registration Component
// Renders the SEBI registration information (positioned at top right, above BSE)

export const renderSebiInfo = (doc, { pageWidth, margin, sebiRegistration, yPos }) => {
  if (!sebiRegistration || !sebiRegistration.trim()) return
  
  // SEBI Registration - Smaller, italic, positioned at top right
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  const sebiText = `SEBI Registered Research Analyst- ${sebiRegistration}`
  doc.text(sebiText, pageWidth - margin, yPos, { align: 'right' })
}

