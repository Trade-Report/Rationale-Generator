// PDF Date Component
// Renders the date box in the header

export const renderDate = (doc, { xPos, yPos, headerDate }) => {
  if (!headerDate || !headerDate.trim()) return { width: 0 }

  // Format date if it's in YYYY-MM-DD format (from date input)
  let displayDate = headerDate
  if (/^\d{4}-\d{2}-\d{2}$/.test(headerDate)) {
    const dateObj = new Date(headerDate + 'T00:00:00')
    const day = dateObj.getDate()
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
    const month = months[dateObj.getMonth()]
    const year = dateObj.getFullYear()
    displayDate = `${day} ${month} ${year}`
  }

  // Date Box - Light yellow rounded rectangle, bold sans-serif (12-14pt)
  const dateX = xPos
  const dateY = yPos
  doc.setFillColor(255, 250, 230) // Light yellow
  const dateText = `Date: ${displayDate}`
  doc.setFont('helvetica', 'bold') // Bold sans-serif
  doc.setFontSize(13) // 12-14pt range, using 13pt
  const dateWidth = doc.getTextWidth(dateText) + 8
  doc.roundedRect(dateX, dateY - 4, dateWidth, 7, 3, 3, 'F')
  doc.setTextColor(0, 0, 0)
  doc.text(dateText, dateX + dateWidth / 2, dateY, { align: 'center' })

  return { width: dateWidth }
}

