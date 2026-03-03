// PDF Disclaimer Component
// Renders the disclaimer section with market risks note and main disclaimer text
// Supports **bold**, *italic*, __underline__ - markers are parsed and rendered as formatting

import { parseMarkdownFormat } from './pdfTextRenderer'

export const renderDisclaimer = (doc, { pageWidth, margin, pdfDisclaimer, yPos, pageHeight, footerHeight }) => {
  const availableHeight = pageHeight - footerHeight - yPos - 10
  const disclaimerMargin = 5
  const disclaimerWidth = pageWidth - 2 * disclaimerMargin

  yPos += 12

  const disclaimerWebsite = 'https://chartntrade.com/research-disclaimer'
  const disclaimerBaseText = pdfDisclaimer || 'Investments in Securities market are subject to market risks. Read all the related documents carefully before investing. For complete disclaimer and disclosure, please refer to the website: ' + disclaimerWebsite
  const disclaimerText = disclaimerBaseText.includes('http') ? disclaimerBaseText : `${disclaimerBaseText}\n\nFor complete disclaimer and disclosure, please refer to: ${disclaimerWebsite}`

  const disclaimerFontSize = 17
  doc.setFontSize(disclaimerFontSize)
  doc.setTextColor(0, 0, 0)

  const lines = disclaimerText.split('\n')
  const lineHeight = doc.getLineHeight() / doc.internal.scaleFactor * 1.2
  const maxX = disclaimerMargin + disclaimerWidth

  lines.forEach((line) => {
    if (!line.trim()) {
      yPos += lineHeight * 0.5
      return
    }

    const parts = parseMarkdownFormat(line)
    const words = []
    parts.forEach((part) => {
      part.text.split(/(\s+)/).forEach((w) => {
        if (w.length > 0) {
          words.push({ text: w, bold: part.bold, italic: part.italic, underline: part.underline })
        }
      })
    })

    let currentX = disclaimerMargin
    words.forEach((wordObj) => {
      const fontStyle = wordObj.bold && wordObj.italic ? 'bolditalic' : wordObj.bold ? 'bold' : wordObj.italic ? 'italic' : 'normal'
      doc.setFont('times', fontStyle)
      doc.setFontSize(disclaimerFontSize)
      const wordWidth = doc.getTextWidth(wordObj.text)

      if (currentX + wordWidth > maxX && currentX > disclaimerMargin) {
        yPos += lineHeight
        currentX = disclaimerMargin
        if (!wordObj.text.trim()) return // skip leading spaces on new line
      }

      doc.text(wordObj.text, currentX, yPos)
      if (wordObj.underline) {
        const lineY = yPos + (lineHeight * 0.15)
        doc.setDrawColor(0, 0, 0)
        doc.setLineWidth(0.1)
        doc.line(currentX, lineY, currentX + wordWidth, lineY)
      }
      currentX += wordWidth
    })

    yPos += lineHeight
  })

  return yPos + 5
}

