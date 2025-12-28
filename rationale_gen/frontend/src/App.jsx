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
  const [raName, setRaName] = useState(() => {
    const saved = localStorage.getItem('raName')
    return saved || ''
  })
  const [sebiRegistration, setSebiRegistration] = useState(() => {
    const saved = localStorage.getItem('sebiRegistration')
    return saved || ''
  })
  const [footerContact, setFooterContact] = useState(() => {
    const saved = localStorage.getItem('footerContact')
    return saved || ''
  })
  const [footerAddress, setFooterAddress] = useState(() => {
    const saved = localStorage.getItem('footerAddress')
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
    if (!timeCell) return ''
    if (typeof timeCell === 'number') {
      const totalMinutes = Math.round(timeCell * 24 * 60)
      const h = Math.floor(totalMinutes / 60)
      const m = totalMinutes % 60
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    }
    if (timeCell instanceof Date && !isNaN(timeCell)) {
      return `${String(timeCell.getHours()).padStart(2, '0')}:${String(timeCell.getMinutes()).padStart(2, '0')}`
    }
    return String(timeCell)
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
      const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
      
      // Normalize keys: trim & remove BOM etc
      const normalized = json.map((row) => {
        const out = {}
        Object.keys(row).forEach((k) => {
          const key = k.toString().trim()
          out[key] = row[k]
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

  const handleFileSelect = (file) => {
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

    // Placeholder technical commentary (will be fetched from backend eventually)
    // Simulate a small delay for UX
    setTimeout(() => {
      const placeholderRationale = `This is a placeholder technical commentary that will be fetched from the backend.

The backend will provide detailed analysis including:
- Key patterns and trends
- Potential trading opportunities
- Risk assessment
- Trading recommendations

This content will be automatically included in the PDF export when available.`

      setRationaleResult(placeholderRationale)
      setEditableRationale(placeholderRationale)
      setShowPreview(true)
      setGettingRationale(false)
    }, 500)
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

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const headerHeight = 35 // Fixed header height
    const footerHeight = 40 // Footer height
    const maxWidth = pageWidth - 2 * margin
    const availableHeight = pageHeight - headerHeight - footerHeight - margin // Available space for content
    
    // Draw Header with fixed space
    doc.setFillColor(255, 255, 255) // White background
    doc.rect(0, 0, pageWidth, headerHeight, 'F')
    
    // Draw border line below header
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.line(0, headerHeight, pageWidth, headerHeight)
    
    // Add RA Name (bold, left side)
    if (raName.trim()) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text(raName, margin, 20)
    }
    
    // Add SEBI Registration (right top)
    if (sebiRegistration.trim()) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      const sebiText = `SEBI Reg. No: ${sebiRegistration}`
      const textWidth = doc.getTextWidth(sebiText)
      doc.text(sebiText, pageWidth - margin - textWidth, 20)
    }
    
    // Prepare all content with type identifiers (excluding header)
    const contentItems = []
    
    // Technical Commentary (use editable version if available)
    if (rationaleToExport) {
      contentItems.push({ text: 'Technical Commentary', type: 'section', isBold: true, color: [30, 64, 175] })
      contentItems.push({ text: rationaleToExport, type: 'content', isBold: false, color: [0, 0, 0] })
    }
    
    // Disclaimer
    if (pdfDisclaimer.trim()) {
      contentItems.push({ text: 'Disclaimer', type: 'disclaimer-title', isBold: true, color: [0, 0, 0] })
      contentItems.push({ text: pdfDisclaimer, type: 'disclaimer', isBold: false, color: [128, 128, 128] })
    }
    
    // Start content below header
    let yPosition = headerHeight + margin
    
    // Calculate approximate height needed with default font sizes
    let approximateHeight = 0
    const defaultSizes = { section: 12, content: 9, disclaimerTitle: 10, disclaimer: 8 }
    
    // Add image height to calculation if image exists
    const imageHeight = imagePreview ? 70 : 0 // Reserve space for image
    approximateHeight += imageHeight
    
    contentItems.forEach(item => {
      let fontSize = defaultSizes.content
      let spacing = 5
      
      if (item.type === 'section') {
        fontSize = defaultSizes.section
        spacing = 5
      } else if (item.type === 'disclaimer-title') {
        fontSize = defaultSizes.disclaimerTitle
        spacing = 3
      } else if (item.type === 'disclaimer') {
        fontSize = defaultSizes.disclaimer
        spacing = 3
      }
      
      doc.setFontSize(fontSize)
      const lines = doc.splitTextToSize(item.text, maxWidth)
      approximateHeight += lines.length * fontSize * 0.5 + spacing
    })
    
    // Calculate scale factor if content exceeds available height
    let scaleFactor = 1
    if (approximateHeight > availableHeight) {
      scaleFactor = availableHeight / approximateHeight
      scaleFactor = Math.max(0.55, scaleFactor) // Don't go below 55% of original size
    }
    
    // Adjusted font sizes
    const sizes = {
      section: Math.max(8, Math.round(defaultSizes.section * scaleFactor)),
      content: Math.max(6, Math.round(defaultSizes.content * scaleFactor)),
      disclaimerTitle: Math.max(7, Math.round(defaultSizes.disclaimerTitle * scaleFactor)),
      disclaimer: Math.max(6, Math.round(defaultSizes.disclaimer * scaleFactor))
    }
    
    // Add all content with adjusted sizes
    let isAfterTechnicalCommentary = false
    contentItems.forEach((item, index) => {
      let fontSize = sizes.content
      let spacing = 5
      let color = item.color || [0, 0, 0]
      
      if (item.type === 'section') {
        fontSize = sizes.section
        spacing = 5
        color = item.color || [30, 64, 175]
        isAfterTechnicalCommentary = false // Reset flag at section start
      } else if (item.type === 'disclaimer-title') {
        fontSize = sizes.disclaimerTitle
        spacing = 3
      } else if (item.type === 'disclaimer') {
        fontSize = sizes.disclaimer
        spacing = 3
      }
      
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', item.isBold ? 'bold' : 'normal')
      doc.setTextColor(color[0], color[1], color[2])
      
      const lines = doc.splitTextToSize(item.text, maxWidth)
      doc.text(lines, margin, yPosition)
      yPosition += lines.length * fontSize * 0.5 + spacing
      
      // Track if we're after Technical Commentary section
      if (item.type === 'section' && item.text === 'Technical Commentary') {
        isAfterTechnicalCommentary = true
      }
      
      // Add image after Technical Commentary content (right after the content item)
      if (item.type === 'content' && isAfterTechnicalCommentary && imagePreview) {
        try {
          // Calculate available space for image
          const remainingSpace = pageHeight - footerHeight - yPosition - 10
          const maxImageHeight = Math.max(40, Math.min(80, remainingSpace))
          
          // Detect image format from data URL
          let imageFormat = 'PNG' // default
          if (imagePreview.startsWith('data:image/')) {
            const formatMatch = imagePreview.match(/data:image\/(\w+);/)
            if (formatMatch) {
              imageFormat = formatMatch[1].toUpperCase()
              // jsPDF supports JPEG, PNG - convert others
              if (imageFormat === 'JPG') imageFormat = 'JPEG'
            }
          }
          
          // Add image - use available width
          doc.addImage(imagePreview, imageFormat, margin, yPosition, maxWidth, maxImageHeight)
          yPosition += maxImageHeight + 10
          isAfterTechnicalCommentary = false // Reset flag after adding image
    } catch (error) {
          console.error('Error adding image to PDF:', error)
          // Continue without image if there's an error
        }
      }
    })
    
    // Draw Footer with background color
    const footerY = pageHeight - footerHeight
    const footerColor = hexToRgb(footerBackgroundColor)
    doc.setFillColor(footerColor.r, footerColor.g, footerColor.b)
    doc.rect(0, footerY, pageWidth, footerHeight, 'F')
    
    // Add border line above footer
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.line(0, footerY, pageWidth, footerY)
    
    // Add Footer content (Contact first, then Address)
    let footerYPos = footerY + 10
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    
    // Contact (first)
    if (footerContact.trim()) {
      doc.setTextColor(0, 0, 0)
      const contactLines = doc.splitTextToSize(footerContact, maxWidth)
      doc.text(contactLines, margin, footerYPos)
      footerYPos += contactLines.length * 9 * 0.5 + 5
    }
    
    // Address (last)
    if (footerAddress.trim()) {
      doc.setTextColor(60, 60, 60)
      const addressLines = doc.splitTextToSize(footerAddress, maxWidth)
      doc.text(addressLines, margin, footerYPos)
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

            {usage && (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon-wrapper">
                    <FiUpload className="stat-icon" />
                  </div>
                  <div className="stat-content">
                    <h3 className="stat-label">Total Uploads</h3>
                    <p className="stat-value">{usage.totalUploads}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrapper">
                    <FiFileText className="stat-icon" />
                  </div>
                  <div className="stat-content">
                    <h3 className="stat-label">Excel Files</h3>
                    <p className="stat-value">{usage.excelUploads}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrapper">
                    <FiImage className="stat-icon" />
                  </div>
                  <div className="stat-content">
                    <h3 className="stat-label">Image Files</h3>
                    <p className="stat-value">{usage.imageUploads}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrapper">
                    <FiClock className="stat-icon" />
                  </div>
                  <div className="stat-content">
                    <h3 className="stat-label">Last Activity</h3>
                    <p className="stat-value-small">
                      {usage.lastActivity 
                        ? new Date(usage.lastActivity).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                </div>
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
                      borderBottom: '1px solid #ddd',
                      background: '#ffffff',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      minHeight: '60px'
                    }}>
                      <div>
                        {raName.trim() ? (
                          <h2 style={{ margin: 0, fontWeight: 'bold', fontSize: '18px', color: '#000' }}>
                            {raName}
                          </h2>
                        ) : (
                          <span style={{ color: '#999', fontStyle: 'italic' }}>RA Name</span>
                        )}
                      </div>
                      <div>
                        {sebiRegistration.trim() ? (
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            SEBI Reg. No: {sebiRegistration}
                          </span>
                        ) : (
                          <span style={{ color: '#999', fontStyle: 'italic', fontSize: '12px' }}>SEBI Reg. No</span>
                        )}
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div style={{ padding: '2rem', minHeight: '400px' }}>
                      {/* Technical Commentary */}
                      <div style={{ marginBottom: '2rem' }}>
                        <h3 style={{ 
                          color: '#1e40af', 
                          fontSize: '16px', 
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
                            background: '#fafafa'
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
                        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
                          <h3 style={{ 
                            fontSize: '14px', 
                            fontWeight: 'bold', 
                            marginBottom: '0.5rem',
                            marginTop: 0
                          }}>
                            Disclaimer
                          </h3>
                          <p style={{ 
                            color: '#666', 
                            fontSize: '12px', 
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
                      minHeight: '60px',
                      color: '#000'
                    }}>
                      {footerContact.trim() && (
                        <div style={{ marginBottom: '0.5rem', fontSize: '13px' }}>
                          {footerContact}
                        </div>
                      )}
                      {footerAddress.trim() && (
                        <div style={{ fontSize: '12px', color: '#444' }}>
                          {footerAddress}
                        </div>
                      )}
                      {!footerContact.trim() && !footerAddress.trim() && (
                        <div style={{ color: '#999', fontStyle: 'italic', fontSize: '12px' }}>
                          Footer content (Contact & Address)
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
                    <label htmlFor="footer-contact">Contact</label>
                    <textarea
                      id="footer-contact"
                      value={footerContact}
                      onChange={(e) => {
                        setFooterContact(e.target.value)
                        localStorage.setItem('footerContact', e.target.value)
                      }}
                      placeholder="Enter contact information (will appear first in footer)"
                      rows={3}
                      className="form-textarea"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="footer-address">Address</label>
                    <textarea
                      id="footer-address"
                      value={footerAddress}
                      onChange={(e) => {
                        setFooterAddress(e.target.value)
                        localStorage.setItem('footerAddress', e.target.value)
                      }}
                      placeholder="Enter address (will appear last in footer)"
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

