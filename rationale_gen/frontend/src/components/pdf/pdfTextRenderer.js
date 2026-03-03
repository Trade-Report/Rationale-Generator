// PDF Text Renderer with Markdown Support
// Utility functions for rendering text with markdown formatting (bold, italic, etc.)

/**
 * Renders text with markdown formatting support
 * Currently supports: **bold** (double asterisks)
 * @param {jsPDF} doc - The jsPDF document instance
 * @param {string} text - The text to render (may contain markdown)
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} maxWidth - Maximum width for text wrapping
 * @param {object} options - Additional options (align, font, fontSize, etc.)
 * @returns {number} - The final Y position after rendering
 */
export const renderMarkdownText = (doc, text, x, y, maxWidth, options = {}) => {
  if (!text || !text.trim()) return y
  
  const {
    align = 'left',
    fontSize = doc.getFontSize(),
    font = doc.getFont().fontName,
    fontStyle = doc.getFont().fontStyle,
    color = doc.getTextColor()
  } = options
  
  let currentY = y
  const lineHeight = fontSize * 1.2
  
  // Split text by lines to handle multi-line content
  const lines = text.split('\n')
  
  lines.forEach((line) => {
    if (!line.trim()) {
      currentY += lineHeight * 0.5
      return
    }
    
    // Parse markdown bold (**text**)
    const parts = parseMarkdownBold(line)
    
    let currentX = x
    const words = []
    
    // Group parts into words for wrapping
    parts.forEach((part) => {
      if (part.isBold) {
        // For bold text, we need to measure each word
        const boldWords = part.text.split(' ')
        boldWords.forEach((word, idx) => {
          if (word.trim()) {
            words.push({ text: word, isBold: true, isSpace: false })
            if (idx < boldWords.length - 1) {
              words.push({ text: ' ', isBold: false, isSpace: true })
            }
          }
        })
      } else {
        const normalWords = part.text.split(' ')
        normalWords.forEach((word, idx) => {
          if (word.trim()) {
            words.push({ text: word, isBold: false, isSpace: false })
            if (idx < normalWords.length - 1) {
              words.push({ text: ' ', isBold: false, isSpace: true })
            }
          }
        })
      }
    })
    
    // Render words with wrapping
    let lineText = ''
    let lineWords = []
    
    words.forEach((word) => {
      const testText = lineText + (word.isSpace ? ' ' : '') + word.text
      doc.setFont(font, word.isBold ? 'bold' : fontStyle)
      doc.setFontSize(fontSize)
      
      const textWidth = doc.getTextWidth(testText)
      
      if (textWidth > maxWidth && lineText.trim()) {
        // Render current line
        renderLineWithBold(doc, lineWords, currentX, currentY, fontSize, font, fontStyle, color, align)
        currentY += lineHeight
        lineText = word.text
        lineWords = [word]
      } else {
        lineText = testText
        lineWords.push(word)
      }
    })
    
    // Render remaining words
    if (lineWords.length > 0) {
      renderLineWithBold(doc, lineWords, currentX, currentY, fontSize, font, fontStyle, color, align)
      currentY += lineHeight
    }
  })
  
  return currentY
}

/**
 * Parse markdown bold syntax (**text**)
 * @param {string} text - Text to parse
 * @returns {Array} - Array of {text, isBold} objects
 */
export const parseMarkdownBold = (text) => {
  const parts = []
  const boldRegex = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: text.substring(lastIndex, match.index), isBold: false })
    }
    parts.push({ text: match[1], isBold: true })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.substring(lastIndex), isBold: false })
  }

  if (parts.length === 0) {
    parts.push({ text, isBold: false })
  }

  return parts
}

/**
 * Parse markdown: **bold**, *italic*, __underline__
 * Order: ** first, then __, then * (to avoid * matching inside **)
 * @returns {Array} - Array of {text, bold, italic, underline}
 */
export const parseMarkdownFormat = (text) => {
  const parts = []
  const re = /\*\*(.+?)\*\*|__(.+?)__|\*([^*]+)\*/g
  let lastIndex = 0
  let match

  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const before = text.substring(lastIndex, match.index)
      if (before) parts.push({ text: before, bold: false, italic: false, underline: false })
    }
    if (match[1] !== undefined) {
      parts.push({ text: match[1], bold: true, italic: false, underline: false })
    } else if (match[2] !== undefined) {
      parts.push({ text: match[2], bold: false, italic: false, underline: true })
    } else if (match[3] !== undefined) {
      parts.push({ text: match[3], bold: false, italic: true, underline: false })
    }
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    const after = text.substring(lastIndex)
    if (after) parts.push({ text: after, bold: false, italic: false, underline: false })
  }

  if (parts.length === 0) {
    parts.push({ text, bold: false, italic: false, underline: false })
  }

  // Clean orphan markers from normal parts (unmatched **, __, * that would show as literal)
  return parts.map(p => {
    if (!p.bold && !p.italic && !p.underline) {
      return { ...p, text: p.text.replace(/\*\*/g, '').replace(/__/g, '').replace(/(?<!\*)\*(?!\*)/g, '') }
    }
    return p
  })
}

/**
 * Render a line with bold formatting
 * @param {jsPDF} doc - The jsPDF document instance
 * @param {Array} words - Array of word objects {text, isBold, isSpace}
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} fontSize - Font size
 * @param {string} font - Font name
 * @param {string} fontStyle - Font style
 * @param {object} color - Text color
 * @param {string} align - Text alignment
 */
const renderLineWithBold = (doc, words, x, y, fontSize, font, fontStyle, color, align) => {
  let currentX = x
  let lineText = ''
  
  words.forEach((word) => {
    if (word.isSpace) {
      lineText += ' '
      return
    }
    
    // Render accumulated text if switching between bold/normal
    if (lineText) {
      const prevWord = words[words.indexOf(word) - 1]
      if (prevWord && prevWord.isBold !== word.isBold) {
        doc.setFont(font, prevWord.isBold ? 'bold' : fontStyle)
        doc.setFontSize(fontSize)
        doc.setTextColor(color.r || color[0], color.g || color[1], color.b || color[2])
        const textWidth = doc.getTextWidth(lineText.trim())
        doc.text(lineText.trim(), currentX, y, { align })
        currentX += textWidth
        lineText = ''
      }
    }
    
    lineText += word.text
  })
  
  // Render remaining text
  if (lineText.trim()) {
    const lastWord = words[words.length - 1]
    doc.setFont(font, lastWord?.isBold ? 'bold' : fontStyle)
    doc.setFontSize(fontSize)
    doc.setTextColor(color.r || color[0], color.g || color[1], color.b || color[2])
    doc.text(lineText.trim(), currentX, y, { align })
  }
}

/**
 * Simple version for rendering text with bold support (one line at a time)
 * This version is simpler and more reliable for basic use cases
 */
export const renderTextWithBold = (doc, text, x, y, maxWidth) => {
  if (!text) return y
  
  // Parse markdown bold
  const parts = parseMarkdownBold(text)
  
  // For now, use a simpler approach: split into lines and render each
  const lines = doc.splitTextToSize(text.replace(/\*\*/g, ''), maxWidth)
  let currentY = y
  
  lines.forEach((line) => {
    // Check if line contains bold markers
    if (line.includes('**')) {
      // Parse and render with bold support
      const lineParts = parseMarkdownBold(line)
      let currentX = x
      
      lineParts.forEach((part) => {
        doc.setFont('helvetica', part.isBold ? 'bold' : 'normal')
        const textWidth = doc.getTextWidth(part.text)
        doc.text(part.text, currentX, currentY)
        currentX += textWidth
      })
    } else {
      doc.setFont('helvetica', 'normal')
      doc.text(line, x, currentY)
    }
    
    currentY += doc.getLineHeight() / doc.internal.scaleFactor
  })
  
  return currentY
}

