import React, { useState, useEffect } from 'react'
import {
  FiUsers,
  FiUpload,
  FiFileText,
  FiImage,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiTrendingUp,
  FiActivity,
  FiLock,
  FiLogOut,
  FiEye
} from 'react-icons/fi'
import './App.css'

const API_BASE_URL = 'https://api.vikashbagaria.com/api'

function App() {
  const [token, setToken] = useState(localStorage.getItem('admin_token'))
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [newClient, setNewClient] = useState({ username: '', password: '' })

  // Usage Modal State
  const [showUsageModal, setShowUsageModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)

  // Login State
  const [loginCreds, setLoginCreds] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    if (token) {
      loadClients()
    }
  }, [token])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginCreds)
      })
      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('admin_token', data.access_token)
        setToken(data.access_token)
      } else {
        setLoginError(data.detail || 'Login failed')
      }
    } catch (error) {
      setLoginError('Network error. Check console.')
      console.error(error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setToken(null)
    setClients([])
  }

  const loadClients = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/admin/clients/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.status === 401) {
        handleLogout()
        return
      }
      const data = await response.json()
      setClients(data)
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const createClient = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/admin/clients/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newClient)
      })

      const data = await response.json()

      if (response.ok) {
        alert('Client created successfully!')
        setShowModal(false)
        setNewClient({ username: '', password: '' })
        loadClients()
      } else {
        alert('Error: ' + (data.detail || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error creating client:', error)
      alert('Error creating client. Please try again.')
    }
  }

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to delete this client? This will delete all their usage history as well.')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/admin/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        alert('Client deleted successfully')
        loadClients()
      } else {
        const data = await response.json()
        alert('Error: ' + (data.detail || 'Failed to delete client'))
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('Error deleting client')
    }
  }

  const handleViewUsage = async (client) => {
    try {
      // Fetch detailed usage for this client
      const response = await fetch(`${API_BASE_URL}/admin/clients/${client.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedClient(data)
        setShowUsageModal(true)
      } else {
        alert('Failed to fetch client usage details')
      }
    } catch (error) {
      console.error('Error fetching usage:', error)
      alert('Error fetching usage details')
    }
  }

  const stats = {
    totalClients: clients.length,
    totalRequests: clients.reduce((sum, client) => sum + (client.total_requests || 0), 0),
    totalTokens: clients.reduce((sum, client) => sum + (client.total_tokens || 0), 0)
  }

  if (!token) {
    return (
      <div className="app login-page">
        <div className="login-card">
          <div className="login-header">
            <div className="header-title justify-center">
              <FiLock className="header-icon" />
              <h1>Admin Login</h1>
            </div>
            <p className="header-subtitle text-center">Trade Analyser Management</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={loginCreds.username}
                onChange={e => setLoginCreds({ ...loginCreds, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={loginCreds.password}
                onChange={e => setLoginCreds({ ...loginCreds, password: e.target.value })}
                required
              />
            </div>
            {loginError && <p className="error-text">{loginError}</p>}
            <button type="submit" className="btn btn-primary w-full">Login</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content flex justify-between items-center">
          <div className="header-title">
            <FiTrendingUp className="header-icon" />
            <h1>Admin Dashboard</h1>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-small">
            <FiLogOut /> Logout
          </button>
        </div>
        <div className="header-content">
          <p className="header-subtitle">Trade Analyser Management</p>
        </div>
      </header>

      <main className="app-main">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper users">
              <FiUsers className="stat-icon" />
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Total Clients</h3>
              <p className="stat-value">{stats.totalClients}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper uploads">
              <FiActivity className="stat-icon" />
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Total Requests</h3>
              <p className="stat-value">{stats.totalRequests.toLocaleString()}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper excel">
              <FiFileText className="stat-icon" />
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Total Tokens</h3>
              <p className="stat-value">{stats.totalTokens.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="actions-bar">
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            <FiPlus className="btn-icon" />
            Create New Client
          </button>
          <button
            className="btn btn-secondary"
            onClick={loadClients}
            disabled={loading}
          >
            <FiRefreshCw className={`btn-icon ${loading ? 'spinning' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="users-section">
          <div className="section-header">
            <h2>
              <FiUsers className="section-icon" />
              Clients
            </h2>
          </div>

          {loading ? (
            <div className="loading-state">
              <FiRefreshCw className="spinning" />
              <p>Loading clients...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="empty-state">
              <FiUsers className="empty-icon" />
              <p>No clients found. Create your first client to get started!</p>
            </div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>

                    <th>Total Requests</th>
                    <th>Total Tokens</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => {
                    return (
                      <tr key={client.id}>
                        <td>{client.id}</td>
                        <td>
                          <div className="user-cell">
                            <FiActivity className="user-indicator" />
                            <strong>{client.username}</strong>
                          </div>
                        </td>
                        <td>{client.total_requests}</td>
                        <td>{client.total_tokens.toLocaleString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon-only view"
                              onClick={() => handleViewUsage(client)}
                              title="View Usage"
                            >
                              <FiEye />
                            </button>
                            <button
                              className="btn-icon-only delete"
                              onClick={() => handleDeleteClient(client.id)}
                              title="Delete Client"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Client</h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={createClient}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={newClient.username}
                  onChange={(e) => setNewClient({ ...newClient, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={newClient.password}
                  onChange={(e) => setNewClient({ ...newClient, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUsageModal && selectedClient && (
        <div className="modal-overlay" onClick={() => setShowUsageModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Usage Details: {selectedClient.username}</h2>
              <button
                className="modal-close"
                onClick={() => setShowUsageModal(false)}
              >
                ×
              </button>
            </div>
            <div className="usage-details">
              {selectedClient.usage && selectedClient.usage.length > 0 ? (
                <div className="table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Action</th>
                        <th>Tokens Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedClient.usage.map((log, index) => (
                        <tr key={index}>
                          <td>{new Date(log.created_at).toLocaleString()}</td>
                          <td>{log.action}</td>
                          <td>{log.tokens_used}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="empty-text">No usage history found for this client.</p>
              )}
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowUsageModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

