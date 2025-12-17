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
  FiClock
} from 'react-icons/fi'
import './App.css'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [activePage, setActivePage] = useState('home')
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileInfo, setFileInfo] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [usage, setUsage] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setCurrentUser(user)
      loadUsage(user.id)
    }
  }, [])

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
    setAnalysisResult(null)
  }

  const detectFileType = (filename) => {
    const ext = filename.toLowerCase().split('.').pop()
    const excelExtensions = ['xlsx', 'xls', 'csv']
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
    
    if (excelExtensions.includes(ext)) return 'excel'
    if (imageExtensions.includes(ext)) return 'image'
    return 'unknown'
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
    setAnalysisResult(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const analyzeFile = async () => {
    if (!selectedFile || !currentUser) return

    setAnalyzing(true)
    setAnalysisResult(null)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('userId', currentUser.id)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setAnalysisResult(data.analysis)
        await loadUsage(currentUser.id)
        setSelectedFile(null)
        setFileInfo(null)
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error analyzing file:', error)
      alert('Error analyzing file. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="app">
        <div className="login-container">
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
                      document.getElementById('fileInput').value = ''
                    }}
                  >
                    <FiX className="btn-icon" />
                    Clear
                  </button>
                </div>
              )}

              <button
                className="btn btn-primary"
                onClick={analyzeFile}
                disabled={!selectedFile || analyzing}
              >
                {analyzing ? (
                  <>
                    <FiActivity className="btn-icon spinning" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FiUpload className="btn-icon" />
                    Analyze File
                  </>
                )}
              </button>

              {analysisResult && (
                <div className="analysis-result">
                  <h3>Analysis Result</h3>
                  <pre>{analysisResult}</pre>
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

