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
  FiDownload,
  FiRefreshCw, // Added Refresh Icon
  FiFilter,
  FiCalendar
} from 'react-icons/fi'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import './App.css'
import {
  renderHeader,
  renderTradingDetails,
  renderTechnicalCommentary,
  renderChart,
  renderDisclaimer,
  renderFooter,
  getTradingData,
  extractKeyPoints,
  calculateDynamicPageHeight,
  calculateDisclaimerHeight
} from './components/pdf'
import emailIconPath from './assets/email.png'
import phoneIconPath from './assets/phone-call.png'
import webIconPath from './assets/web.png'
import addressIconPath from './assets/maps-and-flags.png'

// Template Configuration - Easy to extend and modify
// componentOrder defines the order of components in the PDF (header and footer are always first/last)
// Available components: 'chart', 'tradingDetails', 'technicalCommentary', 'disclaimer'
export const TEMPLATES = {
  classic: {
    id: 'classic',
    name: 'Template 1',
    description: 'Template 1',
    nameColor: { r: 0, g: 0, b: 0 }, // Black
    nameColorHex: '#000000',
    componentOrder: ['technicalCommentary', 'tradingDetails', 'chart', 'disclaimer'] // Order for Template 1
  },
  blue: {
    id: 'blue',
    name: 'Template 2',
    description: 'Template 2',
    nameColor: { r: 30, g: 64, b: 175 }, // Blue #1e40af
    nameColorHex: '#1e40af',
    componentOrder: ['technicalCommentary', 'tradingDetails', 'chart', 'disclaimer'] // Order for Template 2
  },
  green: {
    id: 'green',
    name: 'Template 3',
    description: 'Template 3',
    nameColor: { r: 16, g: 185, b: 129 }, // Green #10b981
    nameColorHex: '#10b981',
    componentOrder: ['technicalCommentary', 'tradingDetails', 'chart', 'disclaimer'] // Order for Template 3
  }
}

const API_BASE_URL = 'https://api.vikashbagaria.com'

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
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    const saved = localStorage.getItem('selectedTemplate')
    return saved || 'classic' // Default to classic template
  })
  const [customPrompt, setCustomPrompt] = useState('')
  const [geminiApiKey, setGeminiApiKey] = useState('') // New state for API Key
  const [processedRows, setProcessedRows] = useState(new Set()) // Track processed row indices
  const [autoDownload, setAutoDownload] = useState(false) // Trigger for auto-download
  const [allSheets, setAllSheets] = useState([])
  const [selectedSheetId, setSelectedSheetId] = useState(null) // Currently selected sheet
  const [dateFilter, setDateFilter] = useState('') // Date filter for sheets
  const [activeTab, setActiveTab] = useState(0) // Active tab index for sheets
  const [sheetsPerTab] = useState(5) // Number of sheets to show per tab
  const [rowRationaleData, setRowRationaleData] = useState({}) // Will be loaded from backend
  const [loadingSheets, setLoadingSheets] = useState(false)

  const [emailIconBase64, setEmailIconBase64] = useState(null)
  const [phoneIconBase64, setPhoneIconBase64] = useState(null)
  const [webIconBase64, setWebIconBase64] = useState(null)
  const [addressIconBase64, setAddressIconBase64] = useState(null)

  // Load footer icons as base64
  useEffect(() => {
    const loadIcons = async () => {
      const loadIcon = async (path, setter) => {
        try {
          const response = await fetch(path)
          if (response.ok) {
            const blob = await response.blob()
            const reader = new FileReader()
            reader.onloadend = () => setter(reader.result)
            reader.readAsDataURL(blob)
          }
        } catch (error) {
          console.error(`Error loading icon ${path}:`, error)
        }
      }

      await Promise.all([
        loadIcon(emailIconPath, setEmailIconBase64),
        loadIcon(phoneIconPath, setPhoneIconBase64),
        loadIcon(webIconPath, setWebIconBase64),
        loadIcon(addressIconPath, setAddressIconBase64)
      ])
    }
    loadIcons()
  }, [])

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

  // Save selected template to localStorage
  useEffect(() => {
    localStorage.setItem('selectedTemplate', selectedTemplate)
  }, [selectedTemplate])

  // Save all sheets to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('allSheets', JSON.stringify(allSheets))
  }, [allSheets])

  // Save row rationale data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('rowRationaleData', JSON.stringify(rowRationaleData))
  }, [rowRationaleData])

  // Initialize editableRationale when rationaleResult is set
  useEffect(() => {
    if (rationaleResult && !editableRationale) {
      setEditableRationale(rationaleResult)
    }
  }, [rationaleResult])

  // Auto-download PDF when rationale is ready (triggered by Refresh)
  useEffect(() => {
    if (autoDownload && rationaleResult && editableRationale) {
      exportToPDF()
      setAutoDownload(false) // Reset trigger
    }
  }, [autoDownload, rationaleResult, editableRationale])

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
      const response = await fetch(`${API_BASE_URL}/api/user/${userId}/usage`)
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
    if (loginForm.username === 'vikas' || loginForm.password === 'vikas') {
      setCurrentUser({ username: 'vikas', password: 'vikas' })
      localStorage.setItem('currentUser', JSON.stringify({ username: 'vikas', password: 'vikas' }))
      setUsage({ usage: 0 })
      setLoginForm({ username: '', password: '' })
      setActivePage('home')
      return
    }
    else {

      try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
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
      const day = String(dateCell.getDate()).padStart(2, '0')
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const month = months[dateCell.getMonth()]
      const year = dateCell.getFullYear()
      return `${day} ${month} ${year}`
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

      if (typeof value === 'string' && /^\d{1,2}:\d{2}(:\d{2})?(\s*(AM|PM))?$/i.test(value.trim())) {
        return value.trim()
      }


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
      const workbook = XLSX.read(data, { type: 'array', cellDates: false, raw: false })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      // Convert to JSON - headers inferred
      // Use raw: false to get formatted strings (dates will be in their original format)
      const json = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
        raw: false  // Get formatted values to preserve date/time formats as strings
      })

      // Normalize keys: trim & remove BOM etc
      const normalized = json.map((row) => {
        const out = {}
        Object.keys(row).forEach((k) => {
          const key = k.toString().trim()
          let value = row[k]

          // Keep all values as strings - no date conversion
          // Dates will be preserved in their original format from Excel (e.g., DD-MM-YYYY)
          out[key] = value
        })
        return out
      })

      // Save sheet to backend
      const uploadDate = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

      try {
        const response = await fetch(`${API_BASE_URL}/api/sheets`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            file_name: file.name,
            upload_date: uploadDate,
            rows_data: normalized,
            processed_rows: []
          })
        })

        if (response.ok) {
          const savedSheet = await response.json()
          const sheetId = savedSheet.id.toString()

          // Update local state
          const newSheet = {
            id: sheetId,
            fileName: savedSheet.file_name,
            uploadDate: savedSheet.upload_date,
            rows: savedSheet.rows_data,
            processedRows: savedSheet.processed_rows || []
          }

          // Reload all sheets from backend
          await loadAllSheets()

          // Set as currently selected sheet
          setSelectedSheetId(sheetId)
          setExcelRows(normalized)
          setFileInfo({
            name: file.name,
            type: 'excel',
            size: (file.size / 1024).toFixed(2),
            sheetId: sheetId
          })
        } else {
          throw new Error('Failed to save sheet to backend')
        }
      } catch (error) {
        console.error('Error saving sheet:', error)
        alert('Failed to save sheet. Please try again.')
      }
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

  // Load a sheet from allSheets
  const loadSheet = (sheetId) => {
    const sheet = allSheets.find(s => s.id === sheetId)
    if (sheet) {
      setSelectedSheetId(sheetId)
      setExcelRows(sheet.rows)
      setExcelFileName(sheet.fileName)
      setFileInfo({
        name: sheet.fileName,
        type: 'excel',
        size: '0',
        sheetId: sheetId
      })
      // Restore processed rows
      setProcessedRows(new Set(sheet.processedRows))
      setSelectedStockIndex(null)
      setImageFile(null)
      setImagePreview(null)
      setRationaleResult(null)
    }
  }

  // Get filtered sheets based on date filter
  const getFilteredSheets = () => {
    if (!dateFilter) return allSheets
    return allSheets.filter(sheet => sheet.uploadDate === dateFilter)
  }

  // Get sheets for the current tab
  const getSheetsForCurrentTab = () => {
    const filtered = getFilteredSheets()
    // If we have 5 or fewer sheets, show all of them (no tabs needed)
    if (filtered.length <= sheetsPerTab) {
      return filtered
    }
    // Otherwise, slice to show only sheetsPerTab sheets per tab
    const startIndex = activeTab * sheetsPerTab
    const endIndex = startIndex + sheetsPerTab
    const sliced = filtered.slice(startIndex, endIndex)
    // Ensure we never return more than sheetsPerTab items
    return sliced.slice(0, sheetsPerTab)
  }

  // Calculate total number of tabs needed
  const getTotalTabs = () => {
    const filtered = getFilteredSheets()
    return Math.ceil(filtered.length / sheetsPerTab)
  }

  // Reset to first tab when filter changes or when sheets change
  useEffect(() => {
    setActiveTab(0)
  }, [dateFilter, allSheets.length])

  // Export PDF with provided data (for saved rationales)
  const exportToPDFWithData = async (sheetRows, rowIndex, rationaleData, imagePreviewData, fileName, sheetId) => {
    const rationaleToExport = rationaleData.editableRationale || rationaleData.rationale || ''

    if (!rationaleToExport) {
      alert('No rationale data available for export.')
      return
    }

    const margin = 15
    const footerHeight = 56

    // Extract trading data from Excel row
    const tradingData = getTradingData(
      { name: fileName, type: 'excel', sheetId: sheetId },
      rowIndex,
      sheetRows
    )

    // Extract key points
    let keyPoints = []
    if (rationaleData.rationaleResult && rationaleData.rationaleResult.output && rationaleData.rationaleResult.output.key_points && Array.isArray(rationaleData.rationaleResult.output.key_points)) {
      keyPoints = rationaleData.rationaleResult.output.key_points
    } else {
      keyPoints = extractKeyPoints(rationaleToExport)
    }

    let yPos = 0

    // Get template configuration
    const templateConfig = TEMPLATES[selectedTemplate] || TEMPLATES.classic
    const componentOrder = templateConfig.componentOrder || ['chart', 'tradingDetails', 'technicalCommentary', 'disclaimer']

    // Determine Header Date
    const dateForHeader = headerDate || new Date().toISOString().split('T')[0]

    // Calculate dynamic page height
    const tempDoc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [400, 800] })
    const tempPageWidth = tempDoc.internal.pageSize.getWidth()

    const dynamicPageHeight = calculateDynamicPageHeight(tempDoc, {
      pageWidth: tempPageWidth,
      margin,
      rationale: rationaleToExport,
      pdfDisclaimer,
      imagePreview: imagePreviewData,
      keyPoints,
      componentOrder
    })

    const finalPageHeight = Math.max(dynamicPageHeight, 290)
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [400, finalPageHeight] })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    const calculatedDisclaimerHeight = calculateDisclaimerHeight(tempDoc, pdfDisclaimer, tempDoc.internal.pageSize.getWidth() - 2 * 5)

    // 1. Header Section
    yPos = renderHeader(doc, {
      pageWidth,
      margin,
      template: selectedTemplate,
      tradingData,
      keyPoints,
      yPos,
      raName,
      sebiRegistration,
      bseEnlistment,
      headerDate: dateForHeader,
      imagePreview: null
    })

    // 2. Render Components
    componentOrder.forEach((componentType) => {
      switch (componentType) {
        case 'chart':
          yPos = renderChart(doc, {
            pageWidth,
            margin,
            imagePreview: imagePreviewData,
            yPos,
            keyPoints
          })
          break

        case 'tradingDetails':
          yPos = renderTradingDetails(doc, {
            pageWidth,
            margin,
            tradingData,
            yPos
          })
          break

        case 'technicalCommentary':
          yPos = renderTechnicalCommentary(doc, {
            pageWidth,
            margin,
            rationale: rationaleToExport,
            yPos,
            pageHeight,
            footerHeight,
            disclaimerHeight: calculatedDisclaimerHeight
          })
          break

        case 'disclaimer':
          yPos = renderDisclaimer(doc, {
            pageWidth,
            margin,
            pdfDisclaimer,
            yPos,
            pageHeight,
            footerHeight
          })
          break

        default:
          console.warn(`Unknown component type: ${componentType}`)
      }
    })

    // 3. Footer Section
    renderFooter(doc, {
      pageWidth,
      pageHeight,
      margin,
      footerContact,
      footerEmail,
      footerWebsite,
      footerAddress,
      signature,
      signatureDate,
      footerBackgroundColor,
      raName,
      footerHeight,
      footerImages: {
        email: emailIconBase64,
        phone: phoneIconBase64,
        web: webIconBase64,
        address: addressIconBase64
      }
    })

    // Save PDF
    const fileName_pdf = headerDate
      ? `Analysis_${headerDate.replace(/\//g, '-')}.pdf`
      : `Analysis_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName_pdf)
  }

  // Download PDF for a saved rationale
  const downloadSavedRationale = async (sheetId, rowIndex) => {
    const dataKey = `${sheetId}_${rowIndex}`
    const savedData = rowRationaleData[dataKey]

    if (!savedData) {
      alert('No saved rationale found for this row.')
      return
    }

    // Find the sheet
    const sheet = allSheets.find(s => s.id === sheetId)
    if (!sheet) {
      alert('Sheet not found.')
      return
    }

    // Export PDF using the saved data
    exportToPDFWithData(
      sheet.rows,
      rowIndex,
      savedData,
      savedData.imagePreview,
      sheet.fileName,
      sheetId
    )
  }

  // Regenerate rationale for a saved row
  const regenerateSavedRationale = async (sheetId, rowIndex) => {
    // Load the sheet first
    loadSheet(sheetId)
    setSelectedStockIndex(rowIndex)

    // Load saved image if available
    const dataKey = `${sheetId}_${rowIndex}`
    const savedData = rowRationaleData[dataKey]
    if (savedData && savedData.imagePreview) {
      setImagePreview(savedData.imagePreview)
      // Convert base64 data URL to File object for regeneration
      try {
        // Handle data URL format: data:image/png;base64,...
        const base64Data = savedData.imagePreview.includes(',')
          ? savedData.imagePreview.split(',')[1]
          : savedData.imagePreview

        // Convert base64 to blob
        const byteCharacters = atob(base64Data)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)

        // Determine MIME type from data URL or default to image/png
        const mimeType = savedData.imagePreview.match(/data:([^;]+);/)?.[1] || 'image/png'
        const blob = new Blob([byteArray], { type: mimeType })
        const file = new File([blob], 'chart-image.png', { type: mimeType })
        setImageFile(file)
      } catch (error) {
        console.error('Error converting image:', error)
        // If conversion fails, user will need to upload image again
        alert('Please upload the chart image again for this row.')
        setShowImageModal(true)
        return
      }
    } else {
      // No saved image, show modal for user to upload
      setShowImageModal(true)
      return
    }

    // Trigger rationale generation after a short delay to ensure state is set
    setTimeout(() => {
      getRationale(rowIndex, false)
    }, 200)
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

  const getRationale = async (index = null, isRefresh = false) => {
    // Determine which index to use (passed or selected)
    const targetIndex = index !== null ? index : selectedStockIndex

    // For Excel files, require both stock selection and image
    if (fileInfo && fileInfo.type === 'excel') {
      if (targetIndex === null) {
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
        const selectedRow = excelRows[targetIndex]
        // Convert row object to key-value pairs (remove any undefined/null values)
        // Ensure all values are strings (handle arrays, objects, etc.)
        const tradeData = {}
        Object.keys(selectedRow).forEach(key => {
          const value = selectedRow[key]
          if (value !== null && value !== undefined && value !== '') {
            // Convert to string, handling arrays and objects properly
            if (Array.isArray(value)) {
              tradeData[key] = value.join(', ') // Join array elements with comma
            } else if (typeof value === 'object') {
              tradeData[key] = JSON.stringify(value) // Stringify objects
            } else {
              tradeData[key] = String(value) // Convert primitives to string
            }
          }
        })

        const formData = new FormData()
        formData.append('trade_data', JSON.stringify(tradeData))
        formData.append('image', imageFile)
        formData.append('prompt', customPrompt)
        formData.append('plan_type', tradeData['Segment'])

        response = await fetch('https://rationale-generator-2.onrender.com/gemini/analyze-with-rationale', {
          method: 'POST',
          headers: {
            'X-GEMINI-API-KEY': geminiApiKey
          },
          body: formData
        })
      } else {
        // For image-only: Call analyze-image-only endpoint
        const formData = new FormData()
        formData.append('image', imageFile)

        response = await fetch('https://rationale-generator-2.onrender.com/gemini/analyze-image-only', {
          method: 'POST',
          headers: {
            'X-GEMINI-API-KEY': geminiApiKey
          },
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
      // For analyze-with-rationale: data.output = {analysis: list[str] | string, key_points: list[str], usage: object}
      // For analyze-image-only: data.output = {analysis: list[str], usage: object}
      let technicalCommentary = ''
      console.log('Backend response:', data) // Debug log
      if (data.output) {
        // Case 1: analyze-with-rationale or analyze-image-only returns {analysis: list[str] | string, ...}
        if (data.output.analysis) {
          console.log('Analysis:', data.output.analysis)
          // Handle both list and string formats
          if (Array.isArray(data.output.analysis)) {
            // Join array of strings with newlines
            technicalCommentary = data.output.analysis.join('\n')
          } else {
            // Already a string
            technicalCommentary = typeof data.output.analysis === 'string'
              ? data.output.analysis
              : String(data.output.analysis)
          }
        }
        // Case 2: analyze-image-only returns tuple as array [response_text, usage_log] (legacy format)
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

      setRationaleResult(data) // Store full API response to preserve key_points
      setEditableRationale(technicalCommentary)
      setShowPreview(true)
      setGettingRationale(false)

      // Refresh usage statistics after successful file processing
      if (currentUser && currentUser.id) {
        loadUsage(currentUser.id)
      }

      // Mark row as processed and save rationale data
      if (fileInfo.type === 'excel' && targetIndex !== null && fileInfo.sheetId) {
        setProcessedRows(prev => new Set(prev).add(targetIndex))

        // Update the sheet's processed rows
        setAllSheets(prev => prev.map(sheet => {
          if (sheet.id === fileInfo.sheetId) {
            if (!sheet.processedRows.includes(targetIndex)) {
              sheet.processedRows = [...sheet.processedRows, targetIndex]
            }
          }
          return sheet
        }))

        // Save rationale data to backend
        if (fileInfo.sheetId && currentUser && currentUser.id) {
          try {
            const response = await fetch(`${API_BASE_URL}/api/sheets/rationales`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({
                sheet_id: parseInt(fileInfo.sheetId),
                row_index: targetIndex,
                rationale_text: technicalCommentary,
                rationale_result: data,
                image_preview: imagePreview,
                editable_rationale: technicalCommentary
              })
            })

            if (response.ok) {
              // Update local state
              const dataKey = `${fileInfo.sheetId}_${targetIndex}`
              setRowRationaleData(prev => ({
                ...prev,
                [dataKey]: {
                  rationale: technicalCommentary,
                  rationaleResult: data,
                  imagePreview: imagePreview,
                  editableRationale: technicalCommentary,
                  generatedDate: new Date().toISOString()
                }
              }))

              // Reload sheet to update processed rows
              await loadAllSheets()
            } else {
              console.error('Failed to save rationale to backend')
            }
          } catch (error) {
            console.error('Error saving rationale:', error)
          }
        }

        // Auto-set Header Date from Expiry Date column
        const rowData = excelRows[targetIndex]
        if (rowData) {
          const expiryKey = Object.keys(rowData).find(k => k.toLowerCase().includes('expiry') || k.toLowerCase().includes('date'))
          if (expiryKey && rowData[expiryKey]) {
            const val = rowData[expiryKey]
            if (val instanceof Date) {
              setHeaderDate(val.toISOString().split('T')[0])
            } else {
              setHeaderDate(String(val))
            }
          } else {
            setHeaderDate(new Date().toISOString().split('T')[0])
          }
        }
      } else {
        // Default to today for image-only
        setHeaderDate(new Date().toISOString().split('T')[0])
      }

      // Trigger auto-download if it's a refresh action
      if (isRefresh) {
        setAutoDownload(true)
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
      return selectedStockIndex !== null && imageFile !== null && geminiApiKey.trim() !== ''
    }

    // For image files: just need image uploaded
    if (fileInfo.type === 'image') {
      return imageFile !== null && geminiApiKey.trim() !== ''
    }

    return false
  }

  // Generate random technical commentary
  const generateRandomTechnicalCommentary = () => {
    const commentaries = [
      `• PHILLIPS CARBON BL is showing a strong recovery trend from its lows, with price action clearly above key moving averages.
• The stock is currently in a tight consolidation phase, forming a potential continuation pattern after a significant upward move.
• This consolidation is occurring just beneath the immediate resistance level of 210.40, indicating a potential build-up for a breakout.
• Both the short-term and longer-term moving averages are trending upwards, with the current price trading comfortably above them, confirming momentum.
• The shorter-term moving average is providing dynamic support, positioned closely below the current price consolidation, reinforcing bullish structure.`,
    ]
    return commentaries[Math.floor(Math.random() * commentaries.length)]
  }

  // Generate random key points (min 6, max 10)
  const generateRandomKeyPoints = () => {
    const allKeyPoints = [
      'MACD: Bullish crossover with histogram expanding, indicating strong upward momentum.',
      'MACD: Signal line crossover above zero line suggests potential bullish reversal.',
      'RSI: Holding above 50 level suggests underlying bullish momentum remains intact.',
      'RSI: Strong upward movement from oversold levels indicates buying momentum building.',
      'Price consolidating above key support zone, building base for next move.',
      'Volume pattern confirms institutional accumulation at current levels.',
      'Moving averages aligned in bullish order, supporting trend continuation.',
      'Break above resistance level could trigger momentum acceleration.',
      'Risk-reward ratio favorable at current entry levels.',
      'Market structure remains constructive with higher lows intact.'
    ]

    // Shuffle and return 6-10 random points
    const shuffled = [...allKeyPoints].sort(() => Math.random() - 0.5)
    const count = Math.floor(Math.random() * 5) + 6 // Random between 6 and 10
    return shuffled.slice(0, count)
  }

  // Export PDF with random content
  const exportPDFWithRandomContent = async () => {
    const randomTechnicalCommentary = generateRandomTechnicalCommentary()
    const randomKeyPoints = generateRandomKeyPoints()

    const margin = 15
    const footerHeight = 56 // Reduced by 20%

    // Extract trading data from Excel row if available
    const tradingData = getTradingData(fileInfo, selectedStockIndex, excelRows)

    let yPos = 0

    // Get template configuration for component order
    const templateConfig = TEMPLATES[selectedTemplate] || TEMPLATES.classic
    const componentOrder = templateConfig.componentOrder || ['chart', 'tradingDetails', 'technicalCommentary', 'disclaimer']

    // Determine Header Date (Expiry Date or Today)
    let dateForHeader = ''
    if (tradingData) {
      // Look for Expiry Date in tradingData (case insensitive)
      const expiryKey = Object.keys(tradingData).find(k => k.toLowerCase().includes('expiry') || k.toLowerCase().includes('date'))
      if (expiryKey && tradingData[expiryKey]) {
        const val = tradingData[expiryKey]
        if (val instanceof Date) {
          dateForHeader = val.toISOString().split('T')[0]
        } else {
          dateForHeader = String(val)
        }
      }
    }

    // Fallback to today if empty
    if (!dateForHeader) {
      dateForHeader = new Date().toISOString().split('T')[0]
    }

    // Calculate dynamic page height based on content
    // First create a temporary document to measure content heights
    const tempDoc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [400, 800] })
    const tempPageWidth = tempDoc.internal.pageSize.getWidth()

    // Calculate the dynamic page height
    const dynamicPageHeight = calculateDynamicPageHeight(tempDoc, {
      pageWidth: tempPageWidth,
      margin,
      rationale: randomTechnicalCommentary,
      pdfDisclaimer,
      imagePreview,
      keyPoints: randomKeyPoints,
      componentOrder
    })

    // Create final document with calculated height (minimum 300mm to ensure reasonable page size)
    const finalPageHeight = Math.max(dynamicPageHeight, 300)
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [400, finalPageHeight] })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // 1. Header Section
    yPos = renderHeader(doc, {
      pageWidth,
      margin,
      template: selectedTemplate,
      tradingData,
      keyPoints: randomKeyPoints,
      yPos,
      raName,
      sebiRegistration,
      bseEnlistment,
      headerDate: dateForHeader,
      imagePreview: null
    })

    // 2. Render Components
    componentOrder.forEach((componentType) => {
      switch (componentType) {
        case 'chart':
          yPos = renderChart(doc, {
            pageWidth,
            margin,
            imagePreview,
            yPos,
            keyPoints: randomKeyPoints
          })
          break

        case 'tradingDetails':
          yPos = renderTradingDetails(doc, {
            pageWidth,
            margin,
            tradingData,
            yPos
          })
          break

        case 'technicalCommentary':
          yPos = renderTechnicalCommentary(doc, {
            pageWidth,
            margin,
            rationale: randomTechnicalCommentary,
            yPos,
            pageHeight,
            footerHeight
          })
          break

        case 'disclaimer':
          yPos = renderDisclaimer(doc, {
            pageWidth,
            margin,
            pdfDisclaimer,
            yPos,
            pageHeight,
            footerHeight
          })
          break

        default:
          console.warn(`Unknown component type: ${componentType}`)
      }
    })

    // 3. Footer Section
    renderFooter(doc, {
      pageWidth,
      pageHeight,
      margin,
      footerContact,
      footerEmail,
      footerWebsite,
      footerAddress,
      signature,
      signatureDate,
      footerBackgroundColor,
      raName,
      footerHeight,
      footerImages: {
        email: emailIconBase64,
        phone: phoneIconBase64,
        web: webIconBase64,
        address: addressIconBase64
      }
    })

    // Save PDF
    const fileName = headerDate
      ? `Analysis_${headerDate.replace(/\//g, '-')}.pdf`
      : `Analysis_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  const exportToPDF = async () => {
    // Handle both old format (string) and new format (object with output)
    const rationaleToExport = editableRationale ||
      (typeof rationaleResult === 'string' ? rationaleResult :
        (rationaleResult?.output?.analysis ?
          (Array.isArray(rationaleResult.output.analysis) ?
            rationaleResult.output.analysis.join('\n') :
            rationaleResult.output.analysis) :
          ''));

    if (!rationaleToExport) {
      alert('Please get a rationale first before exporting to PDF.');
      return;
    }

    const margin = 15
    // Footer height (Increased for larger icons)
    const footerHeight = 56 // Reduced by 20%

    // Extract trading data from Excel row if available
    const tradingData = getTradingData(fileInfo, selectedStockIndex, excelRows)

    // Extract key points from rationale
    // Extract key points: Prefer structured API response, fallback to regex extraction
    let keyPoints = []
    if (rationaleResult && rationaleResult.output && rationaleResult.output.key_points && Array.isArray(rationaleResult.output.key_points)) {
      keyPoints = rationaleResult.output.key_points
    } else {
      keyPoints = extractKeyPoints(rationaleToExport)
    }

    let yPos = 0

    // Get template configuration for component order
    const templateConfig = TEMPLATES[selectedTemplate] || TEMPLATES.classic
    const componentOrder = templateConfig.componentOrder || ['chart', 'tradingDetails', 'technicalCommentary', 'disclaimer']

    // Determine Header Date (User Edited or Default)
    const dateForHeader = headerDate || new Date().toISOString().split('T')[0]

    // Calculate dynamic page height based on content
    // First create a temporary document to measure content heights
    const tempDoc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [400, 800] })
    const tempPageWidth = tempDoc.internal.pageSize.getWidth()

    // Calculate the dynamic page height
    const dynamicPageHeight = calculateDynamicPageHeight(tempDoc, {
      pageWidth: tempPageWidth,
      margin,
      rationale: rationaleToExport,
      pdfDisclaimer,
      imagePreview,
      keyPoints,
      componentOrder
    })

    // Create final document with calculated height (minimum 290mm to ensure reasonable page size)
    const finalPageHeight = Math.max(dynamicPageHeight, 290)
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [400, finalPageHeight] })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Calculate disclaimer height explicitly to pass to technical commentary
    // This allows technical commentary to know exactly how much space to leave
    const calculatedDisclaimerHeight = calculateDisclaimerHeight(tempDoc, pdfDisclaimer, tempDoc.internal.pageSize.getWidth() - 2 * 5) // 5 is disclaimer margin

    // 1. Header Section
    yPos = renderHeader(doc, {
      pageWidth,
      margin,
      template: selectedTemplate,
      tradingData,
      keyPoints,
      yPos,
      raName,
      sebiRegistration,
      bseEnlistment,
      headerDate: dateForHeader,
      imagePreview: null
    })

    // 2. Render Components
    componentOrder.forEach((componentType) => {
      switch (componentType) {
        case 'chart':
          yPos = renderChart(doc, {
            pageWidth,
            margin,
            imagePreview,
            yPos,
            keyPoints
          })
          break

        case 'tradingDetails':
          yPos = renderTradingDetails(doc, {
            pageWidth,
            margin,
            tradingData,
            yPos
          })
          break

        case 'technicalCommentary':
          yPos = renderTechnicalCommentary(doc, {
            pageWidth,
            margin,
            rationale: rationaleToExport,
            yPos,
            pageHeight,
            footerHeight,
            disclaimerHeight: calculatedDisclaimerHeight // Pass calculated height
          })
          break

        case 'disclaimer':
          yPos = renderDisclaimer(doc, {
            pageWidth,
            margin,
            pdfDisclaimer,
            yPos,
            pageHeight,
            footerHeight
          })
          break

        default:
          console.warn(`Unknown component type: ${componentType}`)
      }
    })

    // 3. Footer Section
    renderFooter(doc, {
      pageWidth,
      pageHeight,
      margin,
      footerContact,
      footerEmail,
      footerWebsite,
      footerAddress,
      signature,
      signatureDate,
      footerBackgroundColor,
      raName,
      footerHeight,
      footerImages: {
        email: emailIconBase64,
        phone: phoneIconBase64,
        web: webIconBase64,
        address: addressIconBase64
      }
    })

    // Save PDF
    const fileName = headerDate
      ? `Analysis_${headerDate.replace(/\//g, '-')}.pdf`
      : `Analysis_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  };

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

            {/* All Sheets Display Section with Tabs */}
            {allSheets.length > 0 && (
              <div className="all-sheets-section" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <h2 style={{ margin: 0 }}>All Uploaded Sheets ({getFilteredSheets().length})</h2>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <FiFilter style={{ color: 'var(--text-secondary)' }} />
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      placeholder="Filter by date"
                      style={{
                        padding: '0.5rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        background: 'var(--background)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    {dateFilter && (
                      <button
                        className="btn btn-secondary btn-small"
                        onClick={() => setDateFilter('')}
                      >
                        Clear Filter
                      </button>
                    )}
                  </div>
                </div>

                {/* Tab Navigation */}
                {(() => {
                  const filteredSheets = getFilteredSheets()
                  const filteredCount = filteredSheets.length
                  const shouldShowTabs = filteredCount > sheetsPerTab

                  if (!shouldShowTabs) {
                    return null
                  }

                  const totalTabs = Math.ceil(filteredCount / sheetsPerTab)

                  return (
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginBottom: '1rem',
                      flexWrap: 'wrap',
                      borderBottom: '2px solid var(--border)',
                      paddingBottom: '0.75rem',
                      backgroundColor: 'var(--background)',
                      padding: '0.5rem',
                      borderRadius: '6px'
                    }}>
                      {Array.from({ length: totalTabs }, (_, index) => (
                        <button
                          key={`tab-${index}`}
                          onClick={() => setActiveTab(index)}
                          style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            background: activeTab === index ? 'var(--primary)' : 'var(--surface)',
                            color: activeTab === index ? '#ffffff' : 'var(--text-primary)',
                            cursor: 'pointer',
                            fontWeight: activeTab === index ? 'bold' : 'normal',
                            transition: 'all 0.2s ease',
                            minWidth: '80px'
                          }}
                          onMouseEnter={(e) => {
                            if (activeTab !== index) {
                              e.currentTarget.style.background = 'var(--background)'
                              e.currentTarget.style.borderColor = 'var(--primary)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (activeTab !== index) {
                              e.currentTarget.style.background = 'var(--surface)'
                              e.currentTarget.style.borderColor = 'var(--border)'
                            }
                          }}
                        >
                          Tab {index + 1}
                        </button>
                      ))}
                    </div>
                  )
                })()}

                {/* Sheets for Current Tab */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '200px' }}>
                  {getSheetsForCurrentTab().length > 0 ? (
                    getSheetsForCurrentTab().map((sheet) => (
                      <div
                        key={sheet.id}
                        style={{
                          padding: '1rem',
                          border: `2px solid ${selectedSheetId === sheet.id ? 'var(--primary)' : 'var(--border)'}`,
                          borderRadius: '8px',
                          background: selectedSheetId === sheet.id ? 'var(--background)' : 'var(--surface)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => loadSheet(sheet.id)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <FiFileText style={{ color: 'var(--primary)' }} />
                              <strong>{sheet.fileName}</strong>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                              <FiCalendar />
                              <span>Uploaded: {new Date(sheet.uploadDate).toLocaleDateString()}</span>
                              <span style={{ margin: '0 0.5rem' }}>•</span>
                              <span>{sheet.rows.length} rows</span>
                              <span style={{ margin: '0 0.5rem' }}>•</span>
                              <span>{sheet.processedRows.length} processed</span>
                            </div>
                          </div>
                          {selectedSheetId === sheet.id && (
                            <FiCheckCircle style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{
                      padding: '2rem',
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic'
                    }}>
                      No sheets found for this tab.
                    </div>
                  )}
                </div>

                {/* Tab Navigation Info */}
                {getFilteredSheets().length > sheetsPerTab && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: 'var(--background)',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    textAlign: 'center'
                  }}>
                    Showing {activeTab * sheetsPerTab + 1}-{Math.min((activeTab + 1) * sheetsPerTab, getFilteredSheets().length)} of {getFilteredSheets().length} sheets
                  </div>
                )}
              </div>
            )}

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
                      setSelectedSheetId(null)
                      setProcessedRows(new Set())
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
                              <th>Actions</th>
                              <th>#</th>
                              {Object.keys(excelRows[0] || {}).map((key) => (
                                <th key={key}>{key}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {excelRows.map((row, idx) => {
                              const isProcessed = processedRows.has(idx)
                              const dataKey = fileInfo?.sheetId ? `${fileInfo.sheetId}_${idx}` : null
                              const hasSavedRationale = dataKey && rowRationaleData[dataKey]

                              return (
                                <tr
                                  key={idx}
                                  className={selectedStockIndex === idx ? 'selected-row' : ''}
                                  onClick={() => handleStockSelect(idx)}
                                  style={{ cursor: 'pointer' }}
                                >
                                  <td>
                                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                      {hasSavedRationale && (
                                        <>
                                          <button
                                            className="btn-icon-only"
                                            title="Download PDF"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              downloadSavedRationale(fileInfo.sheetId, idx)
                                            }}
                                            style={{
                                              padding: '4px',
                                              borderRadius: '4px',
                                              border: '1px solid var(--border)',
                                              background: 'var(--surface)',
                                              cursor: 'pointer',
                                              color: 'var(--primary)'
                                            }}
                                          >
                                            <FiDownload />
                                          </button>
                                          <button
                                            className="btn-icon-only"
                                            title="Regenerate Rationale"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              regenerateSavedRationale(fileInfo.sheetId, idx)
                                            }}
                                            style={{
                                              padding: '4px',
                                              borderRadius: '4px',
                                              border: '1px solid var(--border)',
                                              background: 'var(--surface)',
                                              cursor: 'pointer',
                                              color: 'var(--primary)'
                                            }}
                                          >
                                            <FiRefreshCw />
                                          </button>
                                        </>
                                      )}
                                      {isProcessed && !hasSavedRationale && (
                                        <button
                                          className="btn-icon-only"
                                          title="Refresh & Download PDF"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedStockIndex(idx)
                                            getRationale(idx, true)
                                          }}
                                          style={{
                                            padding: '4px',
                                            borderRadius: '4px',
                                            border: '1px solid var(--border)',
                                            background: 'var(--surface)',
                                            cursor: 'pointer',
                                            color: 'var(--primary)'
                                          }}
                                        >
                                          <FiRefreshCw />
                                        </button>
                                      )}
                                    </div>
                                  </td>
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
                              )
                            })}
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
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>

                  {/* Gemini API Key Input */}
                  <div style={{ flexGrow: 1, minWidth: '250px' }}>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter Gemini API Key (Required)"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        border: '1px solid var(--border)',
                        background: 'var(--background)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => getRationale(null)}
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

                  {/* Custom Prompt Input for Excel Uploads */}
                  {fileInfo.type === 'excel' && (
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Add specific instructions for analysis..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      style={{
                        flexGrow: 1,
                        minWidth: '200px',
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        border: '1px solid var(--border)',
                        background: 'var(--background)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  )}



                  {fileInfo.type === 'excel' && !isGetRationaleEnabled() && (
                    <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', width: '100%' }}>
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

                  {/* Header Date Input */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                      Report Date (Header):
                    </label>
                    <input
                      type="date"
                      value={headerDate}
                      onChange={(e) => setHeaderDate(e.target.value)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--background)',
                        color: 'var(--text-primary)',
                        fontFamily: 'inherit',
                        fontSize: '1rem'
                      }}
                    />
                  </div>

                  {/* Template Selection Tabs */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                      Select Template:
                    </label>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {Object.values(TEMPLATES).map((template) => (
                        <button
                          key={template.id}
                          onClick={() => setSelectedTemplate(template.id)}
                          style={{
                            padding: '0.75rem 1.5rem',
                            border: `2px solid ${selectedTemplate === template.id ? template.nameColorHex : 'var(--border)'}`,
                            borderRadius: '8px',
                            background: selectedTemplate === template.id ? template.nameColorHex : 'var(--surface)',
                            color: selectedTemplate === template.id ? '#ffffff' : 'var(--text-primary)',
                            fontWeight: selectedTemplate === template.id ? 'bold' : 'normal',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            fontSize: '0.9rem'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedTemplate !== template.id) {
                              e.currentTarget.style.background = 'var(--background)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedTemplate !== template.id) {
                              e.currentTarget.style.background = 'var(--surface)'
                            }
                          }}
                        >
                          {template.name}
                        </button>
                      ))}
                    </div>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {TEMPLATES[selectedTemplate]?.description}
                    </p>
                  </div>

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
                            <h2 style={{
                              margin: 0,
                              fontWeight: 'bold',
                              fontSize: '28px',
                              color: TEMPLATES[selectedTemplate]?.nameColorHex || '#000000'
                            }}>
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
                      {/* Trading Name, Target, Entrylevel, Stoploss Preview */}
                      {(fileInfo && fileInfo.type === 'excel' && selectedStockIndex !== null && excelRows[selectedStockIndex]) && (() => {
                        const selectedRow = excelRows[selectedStockIndex]
                        const getStringValue = (value) => {
                          if (value === null || value === undefined) return ''
                          return String(value)
                        }
                        const tradingName = getStringValue(selectedRow.TradingName || selectedRow.tradingName || selectedRow['Trading Name'] || selectedRow['Trade Name'] || '')
                        const target1 = getStringValue(selectedRow.target1 || selectedRow.Target1 || selectedRow.target_1 || selectedRow['Target 1'] || '')
                        const target2 = getStringValue(selectedRow.target2 || selectedRow.Target2 || selectedRow.target_2 || selectedRow['Target 2'] || '')
                        const stoploss = getStringValue(selectedRow.stoploss || selectedRow.StopLoss || selectedRow.stop_loss || selectedRow['Stop Loss'] || selectedRow['Stop-Loss'] || '')
                        const entrylevel = getStringValue(selectedRow.entrylevel || selectedRow.EntryLevel || selectedRow.entry_level || selectedRow['Entry Level'] || selectedRow['EntryLevel'] || selectedRow.entryPrice || selectedRow.EntryPrice || selectedRow.entry_price || selectedRow['Entry Price'] || '')

                        const targetParts = []
                        if (target1.trim()) targetParts.push(target1)
                        if (target2.trim()) targetParts.push(target2)
                        const targetText = targetParts.length > 0 ? targetParts.join('-') : ''

                        return (
                          <div style={{
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            background: '#e6f0ff',
                            borderRadius: '8px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.75rem',
                            alignItems: 'center'
                          }}>
                            {tradingName.trim() && (
                              <div style={{
                                padding: '0.5rem 1rem',
                                background: '#ffffff',
                                borderRadius: '6px',
                                border: '1px solid #cce5ff',
                                fontWeight: 'bold',
                                fontSize: '13px'
                              }}>
                                {tradingName}
                              </div>
                            )}
                            {targetText && (
                              <div style={{
                                padding: '0.5rem 1rem',
                                background: '#ffffff',
                                borderRadius: '6px',
                                border: '1px solid #cce5ff',
                                fontWeight: 'bold',
                                fontSize: '12px'
                              }}>
                                Target: {targetText}
                              </div>
                            )}
                            {stoploss.trim() && (
                              <div style={{
                                padding: '0.5rem 1rem',
                                background: '#ffffff',
                                borderRadius: '6px',
                                border: '1px solid #cce5ff',
                                fontWeight: 'bold',
                                fontSize: '12px'
                              }}>
                                Stoploss: {stoploss}
                              </div>
                            )}
                            {entrylevel.trim() && (
                              <div style={{
                                padding: '0.5rem 1rem',
                                background: '#ffffff',
                                borderRadius: '6px',
                                border: '1px solid #cce5ff',
                                fontWeight: 'bold',
                                fontSize: '12px'
                              }}>
                                Entrylevel: {entrylevel}
                              </div>
                            )}
                          </div>
                        )
                      })()}

                      {/* Technical Commentary */}
                      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                        <h3 style={{
                          color: '#000',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          marginBottom: '1rem',
                          marginTop: 0
                        }}>
                          Technical Commentary
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

