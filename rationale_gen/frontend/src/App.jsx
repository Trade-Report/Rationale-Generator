import React, { useState, useEffect } from 'react'
import { 
  FiUpload, 
  FiFileText, 
  FiImage, 
  FiActivity,
  FiLogOut,
  FiUser,
  FiTrendingUp,
  FiInfo,
  FiX,
  FiCheckCircle,
  FiClock,
  FiMoon,
  FiSun,
  FiDownload
} from 'react-icons/fi'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import './App.css'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [activePage, setActivePage] = useState('home')
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileInfo, setFileInfo] = useState(null)
  const [usage, setUsage] = useState(null)
  const [excelRows, setExcelRows] = useState([])
  const [excelFileName, setExcelFileName] = useState('')
  const [excelError, setExcelError] = useState(null)
  const [parsingExcel, setParsingExcel] = useState(false)
  const [selectedStockIndex, setSelectedStockIndex] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [gettingRationale, setGettingRationale] = useState(false)
  const [rationaleResult, setRationaleResult] = useState(null)
  const [editableRationale, setEditableRationale] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [raName, setRaName] = useState(() => {
    const saved = localStorage.getItem('raName')
    return saved || ''
  })
  const [sebiRegistration, setSebiRegistration] = useState(() => {
    const saved = localStorage.getItem('sebiRegistration')
    return saved || ''
  })
  const [bseEnlistment, setBseEnlistment] = useState(() => {
    const saved = localStorage.getItem('bseEnlistment')
    return saved || ''
  })
  const [headerDate, setHeaderDate] = useState(() => {
    const saved = localStorage.getItem('headerDate')
    return saved || ''
  })
  const [headerBorderColor, setHeaderBorderColor] = useState(() => {
    const saved = localStorage.getItem('headerBorderColor')
    return saved || '#c8c8c8'
  })
  const [headerBackgroundColor, setHeaderBackgroundColor] = useState(() => {
    const saved = localStorage.getItem('headerBackgroundColor')
    return saved || '#ffffff'
  })
  const [footerContact, setFooterContact] = useState(() => {
    const saved = localStorage.getItem('footerContact')
    return saved || ''
  })
  const [footerAddress, setFooterAddress] = useState(() => {
    const saved = localStorage.getItem('footerAddress')
    return saved || ''
  })
  const [footerEmail, setFooterEmail] = useState(() => {
    const saved = localStorage.getItem('footerEmail')
    return saved || ''
  })
  const [footerWebsite, setFooterWebsite] = useState(() => {
    const saved = localStorage.getItem('footerWebsite')
    return saved || ''
  })
  const [footerBackgroundColor, setFooterBackgroundColor] = useState(() => {
    const saved = localStorage.getItem('footerBackgroundColor')
    return saved || '#f5f5f5'
  })
  const [pdfDisclaimer, setPdfDisclaimer] = useState(() => {
    const saved = localStorage.getItem('pdfDisclaimer')
    return saved || ''
  })
  const [signature, setSignature] = useState(() => {
    const saved = localStorage.getItem('signature')
    return saved || ''
  })
  const [signatureDate, setSignatureDate] = useState(() => {
    const saved = localStorage.getItem('signatureDate')
    return saved || ''
  })
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCurrentUser(user)
      loadUsage(user.id)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark-mode')
      document.body.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
      document.body.classList.remove('dark-mode')
    }
  }, [darkMode])

  // Initialize editableRationale when rationaleResult is set
  useEffect(() => {
    if (rationaleResult && !editableRationale) {
      setEditableRationale(rationaleResult)
    }
  }, [rationaleResult])

  // Apply dark mode on initial load
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode')
      document.body.classList.add('dark-mode')
    }
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const loadUsage = async (userId) => {
    try {
      const response = await fetch(`/api/user/${userId}/usage`)
      if (response.ok) {
        const data = await response.json()
        setUsage(data)
      }
    } catch (error) {
      console.error('Error loading usage:', error)
    }
  }

  const login = async (e) => {
    e.preventDefault()
    setLoginError('')
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginForm)
      })

      const data = await response.json()

      if (response.ok) {
        setCurrentUser(data.user)
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        setUsage(data.user.usage)
        setLoginForm({ username: '', password: '' })
      } else {
        setLoginError(data.error || 'Login failed')
      }
    } catch (error) {
      setLoginError('Error connecting to server. Please try again.')
    }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
    setUsage(null)
    setActivePage('home')
    setSelectedFile(null)
    setFileInfo(null)
    setExcelRows([])
    setExcelFileName('')
    setExcelError(null)
    setParsingExcel(false)
    setSelectedStockIndex(null)
    setImageFile(null)
    setImagePreview(null)
    setShowImageModal(false)
    setRationaleResult(null)
  }

  const detectFileType = (filename) => {
    const ext = filename.toLowerCase().split('.').pop()
    const excelExtensions = ['xlsx', 'xls', 'csv']
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
    
    if (excelExtensions.includes(ext)) return 'excel'
    if (imageExtensions.includes(ext)) return 'image'
    return 'unknown'
  }

  const formatExcelDate = (dateCell) => {
    if (!dateCell) return ''
    if (dateCell instanceof Date && !isNaN(dateCell)) {
      return dateCell.toDateString()
    }
    return String(dateCell)
  }

  const formatExcelTime = (timeCell) => {
    if (!timeCell && timeCell !== 0) return ''
    
    // Handle number (Excel time is stored as decimal fraction of 24 hours)
    if (typeof timeCell === 'number') {
      // Excel time: 0.0 = 00:00:00, 0.5 = 12:00:00, 1.0 = 24:00:00
      const totalSeconds = Math.round(timeCell * 24 * 60 * 60)
      const h = Math.floor(totalSeconds / 3600) % 24
      const m = Math.floor((totalSeconds % 3600) / 60)
      const s = totalSeconds % 60
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }
    
    // Handle Date object
    if (timeCell instanceof Date && !isNaN(timeCell)) {
      return `${String(timeCell.getHours()).padStart(2, '0')}:${String(timeCell.getMinutes()).padStart(2, '0')}:${String(timeCell.getSeconds()).padStart(2, '0')}`
    }
    
    // Handle string that might be a time format
    if (typeof timeCell === 'string') {
      // Check if it's already in time format (HH:MM or HH:MM:SS)
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeCell.trim())) {
        return timeCell.trim()
      }
    }
    
    return String(timeCell)
  }
  
  // Helper function to convert Excel time value to formatted string
  const convertExcelTimeValue = (value, key) => {
    if (value === null || value === undefined || value === '') return value
    
    // Check if the key suggests it's a time column
    const keyLower = key.toString().toLowerCase()
    const isTimeColumn = keyLower.includes('time') || keyLower.includes('hour') || keyLower.includes('timestamp')
    
    if (isTimeColumn) {
      // If it's already a formatted time string, return as is
      if (typeof value === 'string' && /^\d{1,2}:\d{2}(:\d{2})?(\s*(AM|PM))?$/i.test(value.trim())) {
        return value.trim()
      }
      
      // If it's a number (Excel time format), convert it
      if (typeof value === 'number') {
        if (value >= 0 && value < 1) {
          // Pure time value (0.0 = 00:00:00, 0.5 = 12:00:00)
          return formatExcelTime(value)
        } else if (value >= 1) {
          // Might be a datetime (integer part is date, fractional part is time)
          // Extract just the time part
          const timePart = value % 1
          return formatExcelTime(timePart)
        }
      }
      
      // If it's a Date object, format it
      if (value instanceof Date && !isNaN(value)) {
        return formatExcelTime(value)
      }
    }
    
    return value
  }

  const handleExcelUpload = async (file) => {
    setExcelError(null)
    setExcelFileName(file.name)
    setParsingExcel(true)
    setExcelRows([])
    
    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array', cellDates: true })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      // Convert to JSON - headers inferred
      const json = XLSX.utils.sheet_to_json(worksheet, { 
        defval: '',
        raw: true  // Get raw values to properly handle time numbers
      })
      
      // Normalize keys: trim & remove BOM etc, and handle time values
      const normalized = json.map((row) => {
        const out = {}
        Object.keys(row).forEach((k) => {
          const key = k.toString().trim()
          let value = row[k]
          
          // Convert time values to properly formatted strings
          value = convertExcelTimeValue(value, key)
          
          out[key] = value
        })
        return out
      })
      
      setExcelRows(normalized)
    } catch (err) {
      console.error('Excel parse error', err)
      setExcelError('Failed to parse Excel file. Make sure it is a valid .xlsx or .xls file.')
      setExcelRows([])
    } finally {
      setParsingExcel(false)
    }
  }

  const handleFileSelect = async (file) => {
    const fileType = detectFileType(file.name)
    
    if (fileType === 'unknown') {
      alert('Unsupported file type. Please upload Excel or Image files.')
      return
    }

    setSelectedFile(file)
    setFileInfo({
      name: file.name,
      type: fileType,
      size: (file.size / 1024).toFixed(2)
    })
    
    // Reset previous selections
    setSelectedStockIndex(null)
    setImageFile(null)
    setImagePreview(null)
    setShowImageModal(false)
    setRationaleResult(null)
    
    // Note: File upload tracking will happen when getRationale is called
    // Statistics will be refreshed after successful rationale retrieval
    
    // Parse Excel file if it's an Excel file
    if (fileType === 'excel') {
      handleExcelUpload(file)
    } else if (fileType === 'image') {
      // Handle direct image upload
      setExcelRows([])
      setExcelFileName('')
      setExcelError(null)
      setParsingExcel(false)
      handleImageUpload(file)
    }
  }

  const handleImageUpload = (file) => {
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }
    handleImageUpload(file)
  }

  const handleStockSelect = (index) => {
    setSelectedStockIndex(index)
    setShowImageModal(true)
    // Reset image when selecting a new stock
    setImageFile(null)
    setImagePreview(null)
  }

  const closeImageModal = () => {
    setShowImageModal(false)
    // Optionally reset selected stock or keep it
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const getRationale = async () => {
    // For Excel files, require both stock selection and image
    if (fileInfo && fileInfo.type === 'excel') {
      if (selectedStockIndex === null) {
        alert('Please select a stock from the table first.')
        return
      }
      if (!imageFile) {
        alert('Please upload a chart image for the selected stock.')
        return
      }
    }

    // For direct image upload, require image
    if (fileInfo && fileInfo.type === 'image') {
      if (!imageFile) {
        alert('Please upload an image first.')
        return
      }
    }

    setGettingRationale(true)
    setRationaleResult(null)

    try {
      let response
      
      if (fileInfo && fileInfo.type === 'excel') {
        // For Excel files: Call analyze-with-rationale endpoint
        const selectedRow = excelRows[selectedStockIndex]
        // Convert row object to key-value pairs (remove any undefined/null values)
        const tradeData = {}
        Object.keys(selectedRow).forEach(key => {
          if (selectedRow[key] !== null && selectedRow[key] !== undefined && selectedRow[key] !== '') {
            tradeData[key] = String(selectedRow[key])
          }
        })

    const formData = new FormData()
        formData.append('trade_data', JSON.stringify(tradeData))
        formData.append('image', imageFile)

        response = await fetch('http://127.0.0.1:8000/gemini/analyze-with-rationale', {
        method: 'POST',
        body: formData
      })
      } else {
        // For image-only: Call analyze-image-only endpoint
        const formData = new FormData()
        formData.append('image', imageFile)

        response = await fetch('http://127.0.0.1:8000/gemini/analyze-image-only', {
          method: 'POST',
          body: formData
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Backend response:', data) // Debug log
      
      // Extract technical commentary from response
      // For analyze-with-rationale: data.output = {analysis: string, usage: object}
      // For analyze-image-only: data.output is a tuple (response_text, usage_log) which becomes an array [response_text, usage_log] in JSON
      let technicalCommentary = ''
      
      if (data.output) {
        // Case 1: analyze-with-rationale returns {analysis: string, usage: object}
        if (data.output.analysis) {
          technicalCommentary = typeof data.output.analysis === 'string' 
            ? data.output.analysis 
            : String(data.output.analysis)
        }
        // Case 2: analyze-image-only returns tuple as array [response_text, usage_log]
        else if (Array.isArray(data.output) && data.output.length > 0) {
          technicalCommentary = typeof data.output[0] === 'string' ? data.output[0] : String(data.output[0])
        }
        // Case 3: output is a string directly
        else if (typeof data.output === 'string') {
          technicalCommentary = data.output
        }
        // Case 4: output is an object with other text fields
        else if (data.output.text) {
          technicalCommentary = data.output.text
        } else if (data.output.result) {
          technicalCommentary = data.output.result
        } else if (data.output.content) {
          technicalCommentary = data.output.content
      } else {
          console.error('Unexpected output structure:', data.output)
          technicalCommentary = 'Unable to extract analysis from response. Please check console for details.'
        }
      } else {
        console.error('No output field in response:', data)
        technicalCommentary = 'No analysis result returned from the backend.'
      }
      
      console.log('Extracted technicalCommentary length:', technicalCommentary.length, 'First 100 chars:', technicalCommentary.substring(0, 100))

      // Convert newlines to bullet points (only process the analysis content)
      if (technicalCommentary) {
        // Split by newlines and add bullet points, filtering out empty lines
        technicalCommentary = technicalCommentary.split('\n').map(line => {
          const trimmed = line.trim()
          // Only add bullet if line is not empty and doesn't start with JSON structure indicators
          if (trimmed && !trimmed.startsWith('{') && !trimmed.startsWith('[') && !trimmed.startsWith('"') && !trimmed.includes('"endpoint"') && !trimmed.includes('"usage"')) {
            return `• ${trimmed}`
          }
          return trimmed ? `• ${trimmed}` : ''
        }).filter(line => line && !line.includes('"endpoint"') && !line.includes('"usage"') && !line.includes('"model"')).join('\n')
      }

      setRationaleResult(technicalCommentary)
      setEditableRationale(technicalCommentary)
      setShowPreview(true)
      setGettingRationale(false)
      
      // Refresh usage statistics after successful file processing
      if (currentUser && currentUser.id) {
        loadUsage(currentUser.id)
      }
    } catch (error) {
      console.error('Error getting rationale:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
      alert(`Error getting rationale: ${error.message}. Please check the console for more details.`)
      setGettingRationale(false)
    }
  }

  // Check if Get Rationale button should be enabled
  const isGetRationaleEnabled = () => {
    if (!fileInfo || !currentUser) return false
    
    // For Excel files: need stock selected and image uploaded
    if (fileInfo.type === 'excel') {
      return selectedStockIndex !== null && imageFile !== null
    }
    
    // For image files: just need image uploaded
    if (fileInfo.type === 'image') {
      return imageFile !== null
    }
    
    return false
  }

  // Helper function to convert hex color to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 245, g: 245, b: 245 } // Default light gray
  }

  const exportToPDF = async () => {
    // Use editable rationale if available, otherwise fall back to original
    const rationaleToExport = editableRationale || rationaleResult
    if (!rationaleToExport) {
      alert('Please get a rationale first before exporting to PDF.')
      return
    }

    console.log('Exporting PDF with imagePreview:', imagePreview ? 'available' : 'missing')
    
    // Extract Excel row data if available (for TradingName, target1, target2, target3/stoploss, entryPrice)
    let tradingName = ''
    let target1 = ''
    let target2 = ''
    let target3 = '' // This will be stoploss
    let entryPrice = ''
    
    if (fileInfo && fileInfo.type === 'excel' && selectedStockIndex !== null && excelRows[selectedStockIndex]) {
      const selectedRow = excelRows[selectedStockIndex]
      // Convert to strings to avoid .trim() errors on numbers
      const getStringValue = (value) => {
        if (value === null || value === undefined) return ''
        return String(value)
      }
      tradingName = getStringValue(selectedRow.TradingName || selectedRow.tradingName || selectedRow['Trading Name'] || '')
      target1 = getStringValue(selectedRow.target1 || selectedRow.Target1 || selectedRow.target_1 || selectedRow['Target 1'] || '')
      target2 = getStringValue(selectedRow.target2 || selectedRow.Target2 || selectedRow.target_2 || selectedRow['Target 2'] || '')
      target3 = getStringValue(selectedRow.stoploss || selectedRow.StopLoss || selectedRow.stop_loss || selectedRow['Stop Loss'] || selectedRow['Stop-Loss'] || selectedRow.target3 || selectedRow.Target3 || selectedRow.target_3 || selectedRow['Target 3'] || '')
      entryPrice = getStringValue(selectedRow.entryPrice || selectedRow.EntryPrice || selectedRow.entry_price || selectedRow['Entry Price'] || selectedRow['Entry Price'] || '')
    }

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    
    // Fixed heights as percentage of page height
    const headerHeight = pageHeight * 0.10 // 10% of page height
    const footerHeight = pageHeight * 0.10 // 10% of page height
    const technicalCommentaryHeight = pageHeight * 0.40 // 40% of page height
    const imageHeight = pageHeight * 0.10 // 10% of page height
    const disclaimerHeight = pageHeight * 0.30 // 30% of page height
    
    const maxWidth = pageWidth - 2 * margin
    
    // Draw Header with background color
    const headerBgRgb = hexToRgb(headerBackgroundColor)
    doc.setFillColor(headerBgRgb.r, headerBgRgb.g, headerBgRgb.b)
    doc.rect(0, 0, pageWidth, headerHeight, 'F')
    
    // Add RA Name (font size 30, bold, top left of header)
    const nameY = headerHeight * 0.25 // Top of header (25% of header height)
    if (raName.trim()) {
      // Font size 30
      let fontSize = 30
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', 'bold')
      let nameWidth = doc.getTextWidth(raName)
      // Reduce font size only if name is too wide
      while (nameWidth > pageWidth - 2 * margin - 180 && fontSize > 18) {
        fontSize -= 1
        doc.setFontSize(fontSize)
        nameWidth = doc.getTextWidth(raName)
      }
      doc.setTextColor(0, 0, 0)
      doc.text(raName, margin, nameY)
    }
    
    // Add "OUTLOOK" with green curved background (bottom left of header)
    const outlookText = 'OUTLOOK'
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    const outlookWidth = doc.getTextWidth(outlookText)
    const outlookX = margin // Left aligned
    const outlookY = headerHeight * 0.85 // Bottom of header (85% of header height)
    const outlookPadding = 5
    const outlookHeight = 6 // Reduced height
    
    // Draw green curved background (rounded rectangle)
    doc.setFillColor(34, 197, 94) // Green color
    doc.roundedRect(outlookX - outlookPadding, outlookY - outlookHeight + 1, outlookWidth + 2 * outlookPadding, outlookHeight, 2, 2, 'F')
    
    // Add white text on green background
    doc.setTextColor(255, 255, 255)
    doc.text(outlookText, outlookX, outlookY)
    
    // Add Date (format: "30 NOV 2025" - DD MMM YYYY) with curved background (bottom center)
    if (headerDate.trim()) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      // Format date if it's in YYYY-MM-DD format (from date input)
      let displayDate = headerDate
      if (/^\d{4}-\d{2}-\d{2}$/.test(headerDate)) {
        const dateObj = new Date(headerDate + 'T00:00:00')
        const day = dateObj.getDate()
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
        const month = months[dateObj.getMonth()]
        const year = dateObj.getFullYear()
        displayDate = `Date: ${day} ${month} ${year}`
      }
      const dateTextWidth = doc.getTextWidth(displayDate)
      const dateX = (pageWidth - dateTextWidth) / 2 // Center
      const dateY = headerHeight * 0.85 // Bottom of header (same as OUTLOOK)
      const datePadding = 5
      const dateHeight = 6 // Reduced height
      
      // Draw curved background for date (light gray)
      doc.setFillColor(240, 240, 240)
      doc.roundedRect(dateX - datePadding, dateY - dateHeight + 1, dateTextWidth + 2 * datePadding, dateHeight, 2, 2, 'F')
      
      // Add date text
      doc.setTextColor(0, 0, 0)
      doc.text(displayDate, dateX, dateY)
    }
    
    // Add SEBI Registration (right top) - format: "SEBI Registered Research Analyst- INH300008155" - BOLD, smaller font size
    let rightTopY = headerHeight * 0.15
    if (sebiRegistration.trim()) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      const sebiText = `SEBI Registered Research Analyst- ${sebiRegistration}`
      const textWidth = doc.getTextWidth(sebiText)
      doc.text(sebiText, pageWidth - margin - textWidth, rightTopY)
      rightTopY += 8 // Move down for BSE Enlistment
    }
    
    // Add BSE Enlistment Number (right side, below SEBI) - format: "BSE ENLISTMENT NO-5426" - BOLD, smaller font size
    if (bseEnlistment.trim()) {
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      const bseText = `BSE ENLISTMENT NO-${bseEnlistment}`
      const textWidth = doc.getTextWidth(bseText)
      doc.text(bseText, pageWidth - margin - textWidth, rightTopY)
    }
    
    // Remove placeholder text from rationale
    let cleanRationale = rationaleToExport
    if (cleanRationale) {
      cleanRationale = cleanRationale.replace(/This content will be automatically included in the PDF export when available\./g, '')
      cleanRationale = cleanRationale.replace(/This is a placeholder technical commentary that will be fetched from the backend\./g, '')
      cleanRationale = cleanRationale.replace(/The backend will provide detailed analysis including:/g, '')
      cleanRationale = cleanRationale.replace(/- Key patterns and trends/g, '')
      cleanRationale = cleanRationale.replace(/- Potential trading opportunities/g, '')
      cleanRationale = cleanRationale.replace(/- Risk assessment/g, '')
      cleanRationale = cleanRationale.replace(/- Trading recommendations/g, '')
      cleanRationale = cleanRationale.trim()
    }
    
    // Start content positioning with fixed heights
    let yPosition = headerHeight + margin
    
    // Technical Commentary Section (40% of page height, left aligned)
    if (cleanRationale) {
      // Technical Commentary Title - "Technical COMMENTORY" (all caps, bold)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('Technical COMMENTORY', margin, yPosition)
      yPosition += 10
      
      // Technical Commentary Content (left aligned, auto-size to fit 40% height)
      // Note: cleanRationale already has bullet points added from getRationale function
      const contentStartY = yPosition
      const contentEndY = headerHeight + technicalCommentaryHeight - margin
      const availableContentHeight = contentEndY - contentStartY
      
      // Start with larger font size (increased from 10 to 13)
      let fontSize = 13
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      let lines = doc.splitTextToSize(cleanRationale, maxWidth)
      let lineHeight = doc.getLineHeight() / doc.internal.scaleFactor
      let contentHeight = lines.length * lineHeight
      
      // If content is short, try to increase font size to use more space
      if (contentHeight < availableContentHeight * 0.6) {
        // Content is short - try to use bigger font (max 15)
        while (contentHeight < availableContentHeight * 0.85 && fontSize < 15) {
          fontSize += 0.5
          doc.setFontSize(fontSize)
          lineHeight = doc.getLineHeight() / doc.internal.scaleFactor
          lines = doc.splitTextToSize(cleanRationale, maxWidth)
          contentHeight = lines.length * lineHeight
        }
      } else {
        // Content is long or fits well - reduce font size if it overflows
        while (contentHeight > availableContentHeight && fontSize > 6) {
          fontSize -= 0.5
          doc.setFontSize(fontSize)
          lineHeight = doc.getLineHeight() / doc.internal.scaleFactor
          lines = doc.splitTextToSize(cleanRationale, maxWidth)
          contentHeight = lines.length * lineHeight
        }
      }
      
      // Render content (left aligned) - bullet points already in cleanRationale
      lines.forEach(line => {
        doc.text(line, margin, yPosition)
        yPosition += lineHeight
      })
      
      // yPosition now points to where the content actually ends (no fixed height forcing)
      // Don't reset to headerHeight + technicalCommentaryHeight to avoid whitespace
    }
    
    // Add TradingName, Target1, Target2, and StopLoss in a single row above image (all with curved backgrounds)
    if (tradingName.trim() || target1.trim() || target2.trim() || stoploss.trim()) {
      const rowY = yPosition + 10
      const itemPadding = 6
      const itemHeight = 8
      const itemSpacing = 10 // Space between items
      let currentX = margin
      
      // Set common font properties
      doc.setFont('helvetica', 'bold')
      
      // 1. TradingName (smaller font size)
      if (tradingName.trim()) {
        doc.setFontSize(11) // Reduced from 14
        const textWidth = doc.getTextWidth(tradingName)
        const boxWidth = textWidth + 2 * itemPadding
        
        // Draw curved background with light blue color
        doc.setFillColor(230, 240, 255) // Light blue
        doc.roundedRect(currentX, rowY - itemHeight + 2, boxWidth, itemHeight, 3, 3, 'F')
        
        // Add text (black on light blue background)
        doc.setTextColor(0, 0, 0)
        doc.text(tradingName, currentX + itemPadding, rowY)
        currentX += boxWidth + itemSpacing
      }
      
      // 2. Concatenated Target1, Target2, and StopLoss with "-" separator in a single box
      const targetParts = []
      if (target1.trim()) targetParts.push(`Target 1: ${target1}`)
      if (target2.trim()) targetParts.push(`Target 2: ${target2}`)
      if (stoploss.trim()) targetParts.push(`Stop Loss: ${stoploss}`)
      
      if (targetParts.length > 0) {
        doc.setFontSize(10)
        // Concatenate with " - " separator
        const concatenatedText = targetParts.join(' - ')
        const textWidth = doc.getTextWidth(concatenatedText)
        const boxWidth = textWidth + 2 * itemPadding
        
        // Draw curved background with light blue color
        doc.setFillColor(230, 240, 255) // Light blue
        doc.roundedRect(currentX, rowY - itemHeight + 2, boxWidth, itemHeight, 3, 3, 'F')
        
        // Add text (black on light blue background)
        doc.setTextColor(0, 0, 0)
        doc.text(concatenatedText, currentX + itemPadding, rowY)
      }
      
      yPosition = rowY + itemHeight + 8 // Add spacing after the row
    }
    
    // Image (10% height, 30% width, centered horizontally) - Small spacing after the row of items
    if (imagePreview) {
      try {
        const imageY = yPosition + 5 // Small spacing (5pt) after commentary content or targets
        const imageWidthPercent = 0.30
        const imageW = pageWidth * imageWidthPercent
        const imageH = Math.max(40, imageHeight - 10) // Ensure minimum height of 40pt for visibility
        const imageX = (pageWidth - imageW) / 2 // Center horizontally
        
        // Detect image format from data URL
        let imageFormat = 'PNG'
        if (imagePreview.startsWith('data:image/')) {
          const formatMatch = imagePreview.match(/data:image\/(\w+);/)
          if (formatMatch) {
            imageFormat = formatMatch[1].toUpperCase()
            if (imageFormat === 'JPG') imageFormat = 'JPEG'
            if (imageFormat === 'WEBP') imageFormat = 'PNG' // jsPDF doesn't support WEBP, convert to PNG
          }
        }
        
        console.log('Adding image to PDF:', { 
          imageX: imageX.toFixed(2), 
          imageY: imageY.toFixed(2), 
          imageW: imageW.toFixed(2), 
          imageH: imageH.toFixed(2), 
          imageFormat,
          imageHeight: imageHeight.toFixed(2),
          pageHeight: pageHeight.toFixed(2),
          pageWidth: pageWidth.toFixed(2)
        })
        
        // Add image to PDF (format: addImage(imageData, format, x, y, width, height))
        doc.addImage(imagePreview, imageFormat, imageX, imageY, imageW, imageH)
        console.log('Image added successfully to PDF')
        // Update yPosition to the bottom of the image using actual image height
        yPosition = imageY + imageH + 5 // Add 5pt spacing after image
      } catch (error) {
        console.error('Error adding image to PDF:', error)
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
        console.error('Image preview type:', typeof imagePreview)
        console.error('Image preview length:', imagePreview ? imagePreview.length : 'null')
        console.error('Image preview start:', imagePreview ? imagePreview.substring(0, 150) : 'null')
        // Still reserve space even if image fails
        yPosition += imageHeight + 5
      }
    } else {
      console.log('No image preview available for PDF export')
      // Reserve space even if no image, but use actual imageHeight
      yPosition += imageHeight
    }
    
    // Disclaimer (30% height, left aligned, auto-size font, no title, full width, different font style)
    if (pdfDisclaimer.trim()) {
      // yPosition is already positioned after the image with spacing, so start disclaimer directly
      const disclaimerStartY = yPosition
      const disclaimerEndY = pageHeight - footerHeight - 20 // Add whitespace below disclaimer (20pt)
      const availableDisclaimerHeight = disclaimerEndY - disclaimerStartY
      
      // Full page width with minimal margin (5pt on each side)
      const disclaimerMargin = 5
      const disclaimerWidth = pageWidth - 2 * disclaimerMargin
      
      // Start with larger font size and adjust based on content length
      // If disclaimer is short, use bigger font; if long, use smaller font
      let disclaimerFontSize = 9
      doc.setFontSize(disclaimerFontSize)
      // Use different font style (times/italic for disclaimer)
      doc.setFont('times', 'italic')
      doc.setTextColor(100, 100, 100)
      let disclaimerLines = doc.splitTextToSize(pdfDisclaimer, disclaimerWidth)
      let lineHeight = doc.getLineHeight() / doc.internal.scaleFactor
      let disclaimerContentHeight = disclaimerLines.length * lineHeight
      
      // Adjust font size to fit available height
      // If content is short, try to use larger font; if long, reduce font size
      if (disclaimerContentHeight < availableDisclaimerHeight * 0.5) {
        // Content is short - try to use bigger font (max 11)
        while (disclaimerContentHeight < availableDisclaimerHeight * 0.8 && disclaimerFontSize < 11) {
          disclaimerFontSize += 0.5
          doc.setFontSize(disclaimerFontSize)
          lineHeight = doc.getLineHeight() / doc.internal.scaleFactor
          disclaimerLines = doc.splitTextToSize(pdfDisclaimer, disclaimerWidth)
          disclaimerContentHeight = disclaimerLines.length * lineHeight
        }
      } else {
        // Content is long - reduce font size to fit
        while (disclaimerContentHeight > availableDisclaimerHeight && disclaimerFontSize > 5) {
          disclaimerFontSize -= 0.5
          doc.setFontSize(disclaimerFontSize)
          lineHeight = doc.getLineHeight() / doc.internal.scaleFactor
          disclaimerLines = doc.splitTextToSize(pdfDisclaimer, disclaimerWidth)
          disclaimerContentHeight = disclaimerLines.length * lineHeight
        }
      }
      
      // Render disclaimer text (left aligned, full width with minimal margin)
      let disclaimerY = disclaimerStartY
      disclaimerLines.forEach(line => {
        doc.text(line, disclaimerMargin, disclaimerY)
        disclaimerY += lineHeight
      })
    }
    
    // Draw Footer with background color
    const footerY = pageHeight - footerHeight
    const footerColor = hexToRgb(footerBackgroundColor)
    doc.setFillColor(footerColor.r, footerColor.g, footerColor.b)
    doc.rect(0, footerY, pageWidth, footerHeight, 'F')
    
    // Add border line above footer
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.line(0, footerY, pageWidth, footerY)
    
    // Footer content area (left side) with icons
    const footerContentY = footerY + 10
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(255, 255, 255) // White text for footer
    
    let footerContentX = margin
    let footerContentLineY = footerContentY
    const iconSize = 6 // Size of icons
    
    // Add icons and text for contact, email, website, and address
    // Icons should be placed in public folder: phone-icon.png, email-icon.png, website-icon.png, location-icon.png
    try {
      // Contact with phone icon
      if (footerContact.trim()) {
        try {
          doc.addImage('/phone-icon.png', 'PNG', footerContentX, footerContentLineY - 4, iconSize, iconSize)
          footerContentX += iconSize + 3
        } catch (e) {
          // If icon not found, use text prefix
          doc.text('Phone: ', footerContentX, footerContentLineY)
          footerContentX += doc.getTextWidth('Phone: ')
        }
        doc.text(footerContact, footerContentX, footerContentLineY)
        footerContentX += doc.getTextWidth(footerContact) + 15
      }
      
      // Email with email icon
      if (footerEmail.trim()) {
        try {
          doc.addImage('/email-icon.png', 'PNG', footerContentX, footerContentLineY - 4, iconSize, iconSize)
          footerContentX += iconSize + 3
        } catch (e) {
          doc.text('Email: ', footerContentX, footerContentLineY)
          footerContentX += doc.getTextWidth('Email: ')
        }
        doc.text(footerEmail, footerContentX, footerContentLineY)
        footerContentX += doc.getTextWidth(footerEmail) + 15
      }
      
      // Website with website icon
      if (footerWebsite.trim()) {
        try {
          doc.addImage('/website-icon.png', 'PNG', footerContentX, footerContentLineY - 4, iconSize, iconSize)
          footerContentX += iconSize + 3
        } catch (e) {
          doc.text('Website: ', footerContentX, footerContentLineY)
          footerContentX += doc.getTextWidth('Website: ')
        }
        doc.text(footerWebsite, footerContentX, footerContentLineY)
      }
      
      // Address with location icon (on next line)
      if (footerAddress.trim()) {
        footerContentLineY += 12
        footerContentX = margin
        try {
          doc.addImage('/location-icon.png', 'PNG', footerContentX, footerContentLineY - 4, iconSize, iconSize)
          footerContentX += iconSize + 3
        } catch (e) {
          // If icon not found, continue without icon
        }
        const addressLines = doc.splitTextToSize(footerAddress, pageWidth - 2 * margin - 15)
        doc.text(addressLines, footerContentX, footerContentLineY)
      }
    } catch (error) {
      console.error('Error adding footer icons:', error)
      // Fallback to text-only footer
      const footerItems = []
      if (footerContact.trim()) {
        footerItems.push(`Phone: ${footerContact}`)
      }
      if (footerEmail.trim()) {
        footerItems.push(`Email: ${footerEmail}`)
      }
      if (footerWebsite.trim()) {
        footerItems.push(`Website: ${footerWebsite}`)
      }
      const combinedFooterText = footerItems.join(' | ')
      if (combinedFooterText) {
        doc.text(combinedFooterText, margin, footerContentY)
      }
      if (footerAddress.trim()) {
        doc.text(footerAddress, margin, footerContentY + 12)
      }
    }
    
    // Digital Signature (bottom right, right-aligned)
    if (signature.trim()) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      
      // Calculate signature width for right alignment
      const signatureTextWidth = doc.getTextWidth(signature)
      const signatureX = pageWidth - margin - signatureTextWidth // Right aligned
      const signatureY = footerY + footerHeight - 25
      
      // Signature name (right-aligned)
      doc.text(signature, signatureX, signatureY)
      
      // "Signature" label (right-aligned)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      const signatureLabelWidth = doc.getTextWidth('Signature')
      doc.text('Signature', pageWidth - margin - signatureLabelWidth, signatureY + 8)
      
      // Signature date (right-aligned)
      if (signatureDate.trim()) {
        let displaySignatureDate = signatureDate
        if (/^\d{4}-\d{2}-\d{2}$/.test(signatureDate)) {
          const dateObj = new Date(signatureDate + 'T00:00:00')
          const day = dateObj.getDate()
          const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
          const month = months[dateObj.getMonth()]
          const year = dateObj.getFullYear()
          displaySignatureDate = `Date: ${day} ${month} ${year}`
        }
        doc.setFontSize(7)
        const dateTextWidth = doc.getTextWidth(displaySignatureDate)
        doc.text(displaySignatureDate, pageWidth - margin - dateTextWidth, signatureY + 16)
      }
    }
    
    // Helper function to convert hex color to RGB
    function hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 245, g: 245, b: 245 } // Default light gray
    }

    // Save the PDF
    const fileName = `Technical_Commentary_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  if (!currentUser) {
    return (
      <div className="app">
        <div className="login-container">
          <button 
            className="dark-mode-toggle-login" 
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
          <div className="login-card">
            <div className="login-header">
              <FiTrendingUp className="login-icon" />
              <h1>Rationale Generator</h1>
              <p>Trade Analyser</p>
            </div>
            <form onSubmit={login} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              {loginError && (
                <div className="error-message">{loginError}</div>
              )}
              <button type="submit" className="btn btn-primary btn-full">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">
            <FiTrendingUp className="brand-icon" />
            <h1>Rationale Generator</h1>
          </div>
          <div className="nav-links">
            <button
              className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
              onClick={() => setActivePage('home')}
            >
              <FiUser className="nav-icon" />
              Home
            </button>
            <button
              className={`nav-link ${activePage === 'about' ? 'active' : ''}`}
              onClick={() => setActivePage('about')}
            >
              <FiInfo className="nav-icon" />
              About Us
            </button>
            <button 
              className="nav-link dark-mode-toggle" 
              onClick={toggleDarkMode}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <FiSun className="nav-icon" /> : <FiMoon className="nav-icon" />}
            </button>
            <button className="nav-link" onClick={logout}>
              <FiLogOut className="nav-icon" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="app-main">
        {activePage === 'home' && (
          <div className="home-page">
            <div className="welcome-section">
              <h2>Welcome, {currentUser.username}!</h2>
              <p className="welcome-subtitle">Upload and analyze your trading files</p>
            </div>

            <div className="upload-section">
              <h2>Upload File for Analysis</h2>
              <div
                className="upload-area"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('fileInput').click()}
              >
                <FiUpload className="upload-icon" />
                <p className="upload-text">Click to upload or drag and drop</p>
                <p className="upload-hint">
                  Supports Excel files (.xlsx, .xls, .csv) and Images (.jpg, .png, .gif, etc.)
                </p>
              </div>
              <input
                type="file"
                id="fileInput"
                accept=".xlsx,.xls,.csv,.jpg,.jpeg,.png,.gif,.bmp,.webp"
                onChange={(e) => {
                  if (e.target.files.length > 0) {
                    handleFileSelect(e.target.files[0])
                  }
                }}
                style={{ display: 'none' }}
              />

              {fileInfo && (
                <div className="file-info">
                  <div className="file-info-header">
                    <FiCheckCircle className="file-info-icon" />
                    <span>File Selected</span>
                  </div>
                  <div className="file-info-details">
                    <p><strong>Name:</strong> {fileInfo.name}</p>
                    <p><strong>Type:</strong> {fileInfo.type === 'excel' ? 'Excel Spreadsheet' : 'Image'}</p>
                    <p><strong>Size:</strong> {fileInfo.size} KB</p>
                  </div>
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => {
                      setSelectedFile(null)
                      setFileInfo(null)
                      setExcelRows([])
                      setExcelFileName('')
                      setExcelError(null)
                      setParsingExcel(false)
                      setSelectedStockIndex(null)
                      setImageFile(null)
                      setImagePreview(null)
                      setShowImageModal(false)
                      setRationaleResult(null)
                      document.getElementById('fileInput').value = ''
                    }}
                  >
                    <FiX className="btn-icon" />
                    Clear
                  </button>
                </div>
              )}

              {/* Excel Table Display */}
              {fileInfo && fileInfo.type === 'excel' && (
                <div className="excel-table-section">
                  {parsingExcel && (
                    <div className="parsing-message">
                      <FiActivity className="btn-icon spinning" />
                      Parsing Excel file...
                    </div>
                  )}
                  
                  {excelError && (
                    <div className="error-message">{excelError}</div>
                  )}
                  
                  {!parsingExcel && excelRows.length === 0 && !excelError ? (
                    <div className="empty-sheet">No data found in the Excel file.</div>
                  ) : !parsingExcel && excelRows.length > 0 ? (
                    <>
                      <h3>Excel Data: {excelFileName}</h3>
                      <div className="table-wrapper">
                        <table className="sheet-table">
                          <thead>
                            <tr>
                              <th>#</th>
                              {Object.keys(excelRows[0] || {}).map((key) => (
                                <th key={key}>{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {excelRows.map((row, idx) => (
                              <tr 
                                key={idx}
                                className={selectedStockIndex === idx ? 'selected-row' : ''}
                                onClick={() => handleStockSelect(idx)}
                                style={{ cursor: 'pointer' }}
                              >
                                <td>{idx + 1}</td>
                                {Object.keys(excelRows[0] || {}).map((key) => {
                                  const value = row[key]
                                  // Format dates and times
                                  if (value instanceof Date && !isNaN(value)) {
                                    const formatted = formatExcelDate(value)
                                    return <td key={key}>{formatted}</td>
                                  }
                                  if (typeof value === 'number' && key.toLowerCase().includes('time')) {
                                    return <td key={key}>{formatExcelTime(value)}</td>
                                  }
                                  return <td key={key}>{value || ''}</td>
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : null}
                  
                  {!parsingExcel && excelRows.length > 0 && (
                    <div className="excel-prompt" style={{ marginTop: '1rem', padding: '1rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                        💡 Click on any row to select a stock and upload its chart image
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Image Preview and Get Rationale Button */}
              {fileInfo && fileInfo.type === 'image' && imagePreview && (
                <div className="image-preview-section" style={{ marginTop: '1.5rem' }}>
                  <h3>Uploaded Image</h3>
                  <div style={{ marginTop: '1rem' }}>
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                  </div>
                </div>
              )}

              {/* Get Rationale Button */}
              {fileInfo && (
                <div style={{ marginTop: '1.5rem' }}>
              <button
                className="btn btn-primary"
                    onClick={getRationale}
                    disabled={!isGetRationaleEnabled() || gettingRationale}
              >
                    {gettingRationale ? (
                  <>
                    <FiActivity className="btn-icon spinning" />
                        Getting Rationale...
                  </>
                ) : (
                  <>
                        <FiTrendingUp className="btn-icon" />
                        Get Rationale
                  </>
                )}
              </button>

                  {fileInfo.type === 'excel' && !isGetRationaleEnabled() && (
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Please select a stock from the table and upload its chart image
                    </p>
                  )}
                </div>
              )}

              {/* Rationale Result */}
              {rationaleResult && (
                <div className="rationale-result" style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0 }}>Rationale</h3>
                    <button
                      className="btn btn-secondary"
                      onClick={() => setShowPreview(!showPreview)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      {showPreview ? 'Hide Preview' : 'Show Preview & Edit'}
                    </button>
                  </div>
                  {!showPreview && (
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', color: 'var(--text-primary)', fontFamily: 'inherit', margin: 0 }}>
                      {rationaleResult}
                    </pre>
                  )}
                </div>
              )}

              {/* PDF Preview Section */}
              {showPreview && rationaleResult && (
                <div className="pdf-preview-section" style={{ marginTop: '2rem', padding: '2rem', background: 'var(--surface)', border: '2px solid var(--border)', borderRadius: '16px' }}>
                  <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>PDF Preview & Editor</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                    Preview and edit your PDF content before exporting. Changes will be reflected in the exported PDF.
                  </p>
                  
                  {/* Preview Container - styled to look like PDF */}
                  <div className="pdf-preview-container" style={{ 
                    background: '#ffffff', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px',
                    padding: 0,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    marginBottom: '1.5rem'
                  }}>
                    {/* Header Preview */}
                    <div style={{ 
                      padding: '1.5rem 2rem', 
                      background: headerBackgroundColor || '#ffffff',
                      minHeight: '80px',
                      position: 'relative'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          {raName.trim() ? (
                            <h2 style={{ margin: 0, fontWeight: 'bold', fontSize: '28px', color: '#000' }}>
                              {raName}
                            </h2>
                          ) : (
                            <span style={{ color: '#999', fontStyle: 'italic' }}>RA Name</span>
                          )}
                        </div>
                      <div style={{ textAlign: 'right' }}>
                        {sebiRegistration.trim() && (
                          <div style={{ fontSize: '11px', color: '#333', marginBottom: '0.25rem' }}>
                            SEBI Registered Research Analyst- {sebiRegistration}
                          </div>
                        )}
                        {bseEnlistment.trim() && (
                          <div style={{ fontSize: '11px', color: '#333' }}>
                            BSE ENLISTMENT NO-{bseEnlistment}
                          </div>
                        )}
                        {!sebiRegistration.trim() && !bseEnlistment.trim() && (
                          <span style={{ color: '#999', fontStyle: 'italic', fontSize: '12px' }}>SEBI/BSE Reg. No</span>
                        )}
                      </div>
                    </div>
                        {headerDate.trim() && (
                          <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                            <span style={{ fontSize: '12px', color: '#333' }}>
                              {/^\d{4}-\d{2}-\d{2}$/.test(headerDate) 
                                ? (() => {
                                    const dateObj = new Date(headerDate + 'T00:00:00')
                                    const day = dateObj.getDate()
                                    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
                                    const month = months[dateObj.getMonth()]
                                    const year = dateObj.getFullYear()
                                    return `${day} ${month} ${year}`
                                  })()
                                : headerDate
                              }
                            </span>
                          </div>
                        )}
                    </div>

                    {/* Content Preview */}
                    <div style={{ padding: '2rem', minHeight: '400px' }}>
                      {/* Technical Commentary */}
                      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <h3 style={{ 
                          color: '#000', 
                          fontSize: '14px', 
                          fontWeight: 'bold', 
                          marginBottom: '1rem',
                          marginTop: 0
                        }}>
                          Technical COMMENTORY
                        </h3>
                        <textarea
                          value={editableRationale}
                          onChange={(e) => setEditableRationale(e.target.value)}
                          style={{
                            width: '100%',
                            minHeight: '200px',
                            padding: '1rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontFamily: 'inherit',
                            lineHeight: '1.6',
                            resize: 'vertical',
                            background: '#fafafa',
                            textAlign: 'left'
                          }}
                          placeholder="Edit technical commentary here..."
                        />
                      </div>

                      {/* Chart Image Preview */}
                      {imagePreview && (
                        <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                          <h4 style={{ 
                            fontSize: '14px', 
                            fontWeight: '600', 
                            marginBottom: '0.5rem',
                            marginTop: 0,
                            color: '#333'
                          }}>
                            Chart Image
                          </h4>
                          <div style={{ 
                            border: '1px solid #ddd', 
                            borderRadius: '4px', 
                            padding: '0.5rem',
                            background: '#fafafa',
                            textAlign: 'center'
                          }}>
                            <img 
                              src={imagePreview} 
                              alt="Chart preview" 
                              style={{ 
                                maxWidth: '100%', 
                                maxHeight: '150px',
                                objectFit: 'contain'
                              }}
                            />
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '12px', color: '#666' }}>
                              This image will be included in the PDF
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Disclaimer */}
                      {pdfDisclaimer.trim() && (
                        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee', textAlign: 'left' }}>
                          <p style={{ 
                            color: '#666', 
                            fontSize: '11px', 
                            lineHeight: '1.6',
                            margin: 0,
                            whiteSpace: 'pre-wrap'
                          }}>
                            {pdfDisclaimer}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer Preview */}
                    <div style={{ 
                      padding: '1.5rem 2rem', 
                      borderTop: '1px solid #ddd',
                      background: footerBackgroundColor || '#f5f5f5',
                      minHeight: '80px',
                      color: '#000'
                    }}>
                      {(footerContact.trim() || footerEmail.trim() || footerWebsite.trim()) && (
                        <div style={{ marginBottom: '0.5rem', fontSize: '13px' }}>
                          {footerContact.trim() && <span>Phone: {footerContact}</span>}
                          {footerContact.trim() && (footerEmail.trim() || footerWebsite.trim()) && <span> | </span>}
                          {footerEmail.trim() && <span>Email: {footerEmail}</span>}
                          {footerEmail.trim() && footerWebsite.trim() && <span> | </span>}
                          {footerWebsite.trim() && <span>Website: {footerWebsite}</span>}
                        </div>
                      )}
                      {footerAddress.trim() && (
                        <div style={{ fontSize: '12px', color: '#444', marginTop: '0.5rem' }}>
                          {footerAddress}
                        </div>
                      )}
                      {!footerContact.trim() && !footerEmail.trim() && !footerWebsite.trim() && !footerAddress.trim() && (
                        <div style={{ color: '#999', fontStyle: 'italic', fontSize: '12px' }}>
                          Footer content (Contact, Email, Website & Address)
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={exportToPDF}
                    style={{ marginRight: '1rem' }}
                  >
                    <FiDownload className="btn-icon" />
                    Export PDF
                  </button>
                  
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setEditableRationale(rationaleResult)
                      setShowPreview(false)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* PDF Export Form */}
              <div className="pdf-export-section" style={{ marginTop: '3rem', padding: '2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
                <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>PDF Settings</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Configure your PDF details below. These settings will be saved and used in all PDF exports. The Technical Commentary will be automatically included from the rationale response.
                </p>
                
                <div className="pdf-form">
                  <h3 style={{ marginTop: '0', marginBottom: '1rem', color: 'var(--text-primary)' }}>Header Settings</h3>
                  <div className="form-group">
                    <label htmlFor="ra-name">Name of RA (Research Analyst)</label>
                    <input
                      type="text"
                      id="ra-name"
                      value={raName}
                      onChange={(e) => {
                        setRaName(e.target.value)
                        localStorage.setItem('raName', e.target.value)
                      }}
                      placeholder="Enter Research Analyst name"
                      className="form-input"
                    />
          </div>

                  <div className="form-group">
                    <label htmlFor="sebi-registration">SEBI Registration Number</label>
                    <input
                      type="text"
                      id="sebi-registration"
                      value={sebiRegistration}
                      onChange={(e) => {
                        setSebiRegistration(e.target.value)
                        localStorage.setItem('sebiRegistration', e.target.value)
                      }}
                      placeholder="Enter SEBI Registration Number"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bse-enlistment">BSE Enlistment Number</label>
                    <input
                      type="text"
                      id="bse-enlistment"
                      value={bseEnlistment}
                      onChange={(e) => {
                        setBseEnlistment(e.target.value)
                        localStorage.setItem('bseEnlistment', e.target.value)
                      }}
                      placeholder="Enter BSE Enlistment Number"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="header-date">Date</label>
                    <input
                      type="date"
                      id="header-date"
                      value={headerDate}
                      onChange={(e) => {
                        setHeaderDate(e.target.value)
                        localStorage.setItem('headerDate', e.target.value)
                      }}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="header-background-color">Header Background Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <input
                        type="color"
                        id="header-background-color"
                        value={headerBackgroundColor}
                        onChange={(e) => {
                          setHeaderBackgroundColor(e.target.value)
                          localStorage.setItem('headerBackgroundColor', e.target.value)
                        }}
                        style={{ width: '60px', height: '40px', cursor: 'pointer', border: '1px solid var(--border)', borderRadius: '4px' }}
                      />
                      <input
                        type="text"
                        value={headerBackgroundColor}
                        onChange={(e) => {
                          setHeaderBackgroundColor(e.target.value)
                          localStorage.setItem('headerBackgroundColor', e.target.value)
                        }}
                        placeholder="#ffffff"
                        className="form-input"
                        style={{ flex: 1, maxWidth: '200px' }}
                      />
                    </div>
                  </div>


                  <div className="form-group">
                    <label htmlFor="pdf-disclaimer">Disclaimer</label>
                    <textarea
                      id="pdf-disclaimer"
                      value={pdfDisclaimer}
                      onChange={(e) => {
                        setPdfDisclaimer(e.target.value)
                        localStorage.setItem('pdfDisclaimer', e.target.value)
                      }}
                      placeholder="Enter disclaimer text to be included in the PDF"
                      rows={5}
                      className="form-textarea"
                    />
                  </div>

                  <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Footer Settings</h3>
                  <div className="form-group">
                    <label htmlFor="pdf-footer-contact">Contact (Phone)</label>
                    <input
                      type="text"
                      id="pdf-footer-contact"
                      value={footerContact}
                      onChange={(e) => {
                        setFooterContact(e.target.value)
                        localStorage.setItem('footerContact', e.target.value)
                      }}
                      placeholder="Enter contact/phone number"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="pdf-footer-email">Email</label>
                    <input
                      type="email"
                      id="pdf-footer-email"
                      value={footerEmail}
                      onChange={(e) => {
                        setFooterEmail(e.target.value)
                        localStorage.setItem('footerEmail', e.target.value)
                      }}
                      placeholder="Enter email address"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="pdf-footer-website">Website</label>
                    <input
                      type="text"
                      id="pdf-footer-website"
                      value={footerWebsite}
                      onChange={(e) => {
                        setFooterWebsite(e.target.value)
                        localStorage.setItem('footerWebsite', e.target.value)
                      }}
                      placeholder="Enter website URL"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="pdf-footer-address">Address</label>
                    <textarea
                      id="pdf-footer-address"
                      value={footerAddress}
                      onChange={(e) => {
                        setFooterAddress(e.target.value)
                        localStorage.setItem('footerAddress', e.target.value)
                      }}
                      placeholder="Enter address"
                      rows={3}
                      className="form-textarea"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="footer-background-color">Footer Background Color</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <input
                        type="color"
                        id="footer-background-color"
                        value={footerBackgroundColor}
                        onChange={(e) => {
                          setFooterBackgroundColor(e.target.value)
                          localStorage.setItem('footerBackgroundColor', e.target.value)
                        }}
                        style={{ width: '60px', height: '40px', cursor: 'pointer', border: '1px solid var(--border)', borderRadius: '4px' }}
                      />
                      <input
                        type="text"
                        value={footerBackgroundColor}
                        onChange={(e) => {
                          setFooterBackgroundColor(e.target.value)
                          localStorage.setItem('footerBackgroundColor', e.target.value)
                        }}
                        placeholder="#f5f5f5"
                        className="form-input"
                        style={{ flex: 1, maxWidth: '200px' }}
                      />
                    </div>
                  </div>

                  <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Signature Settings</h3>
                  <div className="form-group">
                    <label htmlFor="signature">Digital Signature Name</label>
                    <input
                      type="text"
                      id="signature"
                      value={signature}
                      onChange={(e) => {
                        setSignature(e.target.value)
                        localStorage.setItem('signature', e.target.value)
                      }}
                      placeholder="Enter signature name (e.g., Your Name)"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="signature-date">Signature Date</label>
                    <input
                      type="date"
                      id="signature-date"
                      value={signatureDate}
                      onChange={(e) => {
                        setSignatureDate(e.target.value)
                        localStorage.setItem('signatureDate', e.target.value)
                      }}
                      className="form-input"
                    />
                  </div>


                  <button
                    className="btn btn-primary"
                    onClick={exportToPDF}
                    disabled={!rationaleResult}
                    style={{ marginTop: '1rem' }}
                  >
                    <FiDownload className="btn-icon" />
                    Export PDF
                  </button>
                  
                  {!rationaleResult && (
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Please get a rationale first before exporting to PDF
                    </p>
                  )}
                </div>
              </div>

              {/* Image Upload Modal */}
              {showImageModal && selectedStockIndex !== null && (
                <div className="modal-overlay" onClick={closeImageModal}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h3>
                        Upload Chart Image - {excelRows[selectedStockIndex] && 
                          (excelRows[selectedStockIndex].TradingName || `Row ${selectedStockIndex + 1}`)}
                      </h3>
                      <button className="modal-close" onClick={closeImageModal}>
                        <FiX />
                      </button>
                    </div>
                    <div className="modal-body">
                      <div className="image-upload-area">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          id="chart-image-input"
                          style={{ display: 'none' }}
                        />
                        <label htmlFor="chart-image-input" className="image-upload-label">
                          {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="preview-image" />
                          ) : (
                            <div className="upload-placeholder">
                              <FiImage style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }} />
                              <p>Click to upload chart image</p>
                              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                PNG, JPG, GIF up to 10MB
                              </span>
                            </div>
                          )}
                        </label>
                      </div>
                      {imageFile && (
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                          <button
                            className="btn btn-primary"
                            onClick={() => {
                              closeImageModal()
                            }}
                          >
                            Done
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activePage === 'about' && (
          <div className="about-page">
            <div className="about-card">
              <h2>About Trading Solution by Vikas</h2>
              <div className="about-content">
                <section>
                  <h3>Our Mission</h3>
                  <p>
                    Trading Solution by Vikas is dedicated to providing cutting-edge trading analysis tools 
                    that help traders make informed decisions. Our platform leverages advanced AI technology 
                    to analyze trading data and provide actionable insights.
                  </p>
                </section>

                <section>
                  <h3>About Vikas</h3>
                  <p>
                    Vikas is an experienced trader and financial analyst with years of expertise in the trading 
                    industry. With a deep understanding of market dynamics and technical analysis, Vikas has 
                    developed this platform to democratize access to professional-grade trading analysis tools.
                  </p>
                </section>

                <section>
                  <h3>Key Features</h3>
                  <ul>
                    <li>Advanced file analysis for Excel spreadsheets and images</li>
                    <li>Real-time usage tracking and statistics</li>
                    <li>AI-powered insights and recommendations</li>
                    <li>User-friendly interface for traders of all levels</li>
                  </ul>
                </section>

                <section>
                  <h3>Contact</h3>
                  <p>
                    For inquiries and support, please contact us through the admin panel.
                  </p>
                </section>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App

