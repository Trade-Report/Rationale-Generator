// PDF Date Component
// Renders the date box in the header

export const renderDate = (doc, { recommendX, recommendY, headerDate }) => {
  if (!headerDate || !headerDate.trim()) return
  
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
  
  // Date Box - Light yellow, rounded left corners, next to recommendation
  const dateX = recommendX + 22
  const dateY = recommendY
  doc.setFillColor(255, 250, 200) // Light yellow
  const dateText = `Date: ${displayDate}`
  const dateWidth = doc.getTextWidth(dateText) + 6
  doc.roundedRect(dateX, dateY - 4, dateWidth, 7, 3, 3, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(0, 0, 0)
  doc.text(dateText, dateX + dateWidth / 2, dateY, { align: 'center' })
}

