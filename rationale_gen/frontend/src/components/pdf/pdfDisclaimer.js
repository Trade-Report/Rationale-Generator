// PDF Disclaimer Component
// Renders the disclaimer section with market risks note and main disclaimer text

export const renderDisclaimer = (doc, { pageWidth, margin, pdfDisclaimer, yPos, pageHeight, footerHeight }) => {
  const availableHeight = pageHeight - footerHeight - yPos - 10
  const disclaimerMargin = 5
  const disclaimerWidth = pageWidth - 2 * disclaimerMargin

  // Market Risks Note (small gray box, top right)


  yPos += 12

  // Main Disclaimer Text with website link
  // Add disclaimer text with reference to website
  const disclaimerWebsite = 'https://chartntrade.com/research-disclaimer'
  const disclaimerBaseText = pdfDisclaimer || 'Investments in Securities market are subject to market risks. Read all the related documents carefully before investing. For complete disclaimer and disclosure, please refer to the website: ' + disclaimerWebsite
  const disclaimerText = disclaimerBaseText.includes('http') ? disclaimerBaseText : `${disclaimerBaseText}\n\nFor complete disclaimer and disclosure, please refer to: ${disclaimerWebsite}`

  // Start with larger font size (was increased by 3 from previous 9, now +2 again)
  let disclaimerFontSize = 14
  doc.setFontSize(disclaimerFontSize)
  doc.setFont('times', 'italic')
  doc.setTextColor(0, 0, 0) // Black text for visibility

  let disclaimerLines = doc.splitTextToSize(disclaimerText, disclaimerWidth)
  let lineHeight = doc.getLineHeight() / doc.internal.scaleFactor
  let contentHeight = disclaimerLines.length * lineHeight

  // Adjust font size to fit available space
  while (contentHeight > availableHeight && disclaimerFontSize > 6) {
    disclaimerFontSize -= 0.3
    doc.setFontSize(disclaimerFontSize)
    lineHeight = doc.getLineHeight() / doc.internal.scaleFactor
    disclaimerLines = doc.splitTextToSize(disclaimerText, disclaimerWidth)
    contentHeight = disclaimerLines.length * lineHeight
  }

  doc.text(disclaimerLines, disclaimerMargin, yPos)

  return yPos + contentHeight + 5
}

