// PDF Footer Component
// Renders the footer section with contact info, address, and digital signature

import { hexToRgb } from './helpers'

export const renderFooter = (doc, { pageWidth, pageHeight, margin, footerContact, footerEmail, footerWebsite, footerAddress, signature, signatureDate, footerBackgroundColor, raName, footerHeight, footerImages }) => {
  const footerY = pageHeight - footerHeight

  // Footer background
  const footerBgRgb = hexToRgb(footerBackgroundColor)
  doc.setFillColor(footerBgRgb.r, footerBgRgb.g, footerBgRgb.b)
  doc.rect(0, footerY, pageWidth, footerHeight, 'F')

  let currentY = footerY + 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(0, 0, 0)
  const contactParts = []

  const addIconText = (text, icon, key) => {
    if (footerImages && footerImages[key]) {
      const iconSize = 4
      const iconY = currentY - 3
      try {
        // Calculate current X position based on what's already in contactParts
        // This is tricky because contactParts is joined by " | ". We need to estimate width.
        // Simplified approach: Render icon and text as a unit or use a placeholder approach?
        // JS PDF doesn't support inline images easily in text flow. 
        // Better approach: Calculate width of previous parts + separators.

        let prefixWidth = margin
        if (contactParts.length > 0) {
          prefixWidth += doc.getTextWidth(contactParts.join(' | ') + ' | ')
        }

        doc.addImage(footerImages[key], 'PNG', prefixWidth, iconY, iconSize, iconSize)
        contactParts.push(`       ${text}`) // Add padding for icon
      } catch (e) {
        console.error(`Failed to add ${key} icon`, e)
        contactParts.push(`${key === 'address' ? '' : key.charAt(0).toUpperCase() + key.slice(1) + ': '}${text}`)
      }
    } else {
      contactParts.push(`${key === 'address' ? 'Address: ' : key.charAt(0).toUpperCase() + key.slice(1) + ': '}${text}`)
    }
  }

  // Phone
  if (footerContact.trim()) {
    addIconText(footerContact, null, 'phone')
  }

  // Website
  if (footerWebsite.trim()) {
    addIconText(footerWebsite, null, 'web')
  }

  // Email
  if (footerEmail.trim()) {
    addIconText(footerEmail, null, 'email')
  }

  if (contactParts.length > 0) {
    doc.text(contactParts.join(' | '), margin, currentY)
    currentY += 5
  }

  // Address
  if (footerAddress.trim()) {
    const addressKey = 'address'
    if (footerImages && footerImages[addressKey]) {
      const iconSize = 4
      const iconY = currentY - 1
      try {
        doc.addImage(footerImages[addressKey], 'PNG', margin, iconY, iconSize, iconSize)
        const addressLines = doc.splitTextToSize(`       ${footerAddress}`, pageWidth * 0.6)
        doc.text(addressLines, margin, currentY + 2) // Adjust Y for text alignment
      } catch (e) {
        const addressLines = doc.splitTextToSize(`Address: ${footerAddress}`, pageWidth * 0.6)
        doc.text(addressLines, margin, currentY)
      }
    } else {
      const addressLines = doc.splitTextToSize(`Address: ${footerAddress}`, pageWidth * 0.6)
      doc.text(addressLines, margin, currentY)
    }
  }

  // Right side - Digital Signature
  const signatureName = signature || raName || 'Signature'
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Signature', pageWidth - margin, footerY + 8, { align: 'right' })
  doc.setFontSize(9)
  doc.text(signatureName.toUpperCase(), pageWidth - margin, footerY + 15, { align: 'right' })
  if (signatureDate.trim()) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text(signatureDate, pageWidth - margin, footerY + 22, { align: 'right' })
  }
}

