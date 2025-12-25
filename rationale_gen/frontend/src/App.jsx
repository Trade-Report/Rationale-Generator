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
  FiSun
} from 'react-icons/fi'
import * as XLSX from 'xlsx'
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

    try {
      const formData = new FormData()
      formData.append('file', imageFile)
      formData.append('userId', currentUser.id)

      // If Excel file was uploaded, include stock data
      if (fileInfo && fileInfo.type === 'excel' && selectedStockIndex !== null) {
        const stockData = excelRows[selectedStockIndex]
        formData.append('stockData', JSON.stringify(stockData))
        formData.append('excelFileName', excelFileName)
      }

      const response = await fetch('/api/get-rationale', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setRationaleResult(data.rationale || 'Rationale will be generated here (placeholder)')
      } else {
        alert('Error: ' + (data.error || 'Failed to get rationale'))
      }
    } catch (error) {
      console.error('Error getting rationale:', error)
      alert('Error getting rationale. Please try again.')
    } finally {
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
                  <h3>Rationale</h3>
                  <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', color: 'var(--text-primary)', fontFamily: 'inherit', margin: 0 }}>
                    {rationaleResult}
                  </pre>
                </div>
              )}

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

