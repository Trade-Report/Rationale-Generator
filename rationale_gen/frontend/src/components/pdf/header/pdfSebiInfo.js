// PDF SEBI Registration Component
// Renders the SEBI registration information (positioned at top right, above BSE)

export const renderSebiInfo = (doc, { pageWidth, margin, sebiRegistration, yPos }) => {
  if (!sebiRegistration || !sebiRegistration.trim()) return

  // SEBI Registration - Helvetica, Size 18
  doc.setFont('sans-serif', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(0, 0, 0)
  const sebiText = `SEBI Registered Research Analyst- ${sebiRegistration}`
  doc.text(sebiText, pageWidth - margin, yPos, { align: 'right' })
}

