// PDF Footer Component
// Renders the footer section with contact info, address, and digital signature

import { hexToRgb } from './helpers'

export const renderFooter = (doc, { pageWidth, pageHeight, margin, footerContact, footerEmail, footerWebsite, footerAddress, signature, signatureDate, footerBackgroundColor, raName, footerHeight }) => {
  const footerY = pageHeight - footerHeight
  
  // Footer background
  const footerBgRgb = hexToRgb(footerBackgroundColor)
  doc.setFillColor(footerBgRgb.r, footerBgRgb.g, footerBgRgb.b)
  doc.rect(0, footerY, pageWidth, footerHeight, 'F')
  
  let currentY = footerY + 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(0, 0, 0)
  
  // Left side - Disclaimer link (always shown), Contact info, Address
  const disclaimerWebsite = 'https://chartntrade.com/research-disclaimer'
  doc.text(`Please refer to disclaimer on website- ${disclaimerWebsite}`, margin, currentY)
  currentY += 5
  
  // Contact info row
  const contactParts = []
  if (footerContact.trim()) contactParts.push(`Phone: ${footerContact}`)
  if (footerWebsite.trim()) contactParts.push(`Website: ${footerWebsite}`)
  if (footerEmail.trim()) contactParts.push(`Email: ${footerEmail}`)
  if (contactParts.length > 0) {
    doc.text(contactParts.join(' | '), margin, currentY)
    currentY += 5
  }
  
  // Address
  if (footerAddress.trim()) {
    const addressLines = doc.splitTextToSize(`Address: ${footerAddress}`, pageWidth * 0.6)
    doc.text(addressLines, margin, currentY)
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

