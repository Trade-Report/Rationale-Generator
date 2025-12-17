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
  FiActivity
} from 'react-icons/fi'
import './App.css'

function App() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newUser, setNewUser] = useState({ username: '', password: '' })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const createUser = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      })

      const data = await response.json()

      if (response.ok) {
        alert('User created successfully!')
        setShowModal(false)
        setNewUser({ username: '', password: '' })
        loadUsers()
      } else {
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error creating user. Please try again.')
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('User deleted successfully!')
        loadUsers()
      } else {
        const data = await response.json()
        alert('Error: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user. Please try again.')
    }
  }

  const stats = {
    totalUsers: users.length,
    totalUploads: users.reduce((sum, user) => sum + user.usage.totalUploads, 0),
    totalExcel: users.reduce((sum, user) => sum + user.usage.excelUploads, 0),
    totalImages: users.reduce((sum, user) => sum + user.usage.imageUploads, 0)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <FiTrendingUp className="header-icon" />
            <h1>Admin Dashboard</h1>
          </div>
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
              <h3 className="stat-label">Total Users</h3>
              <p className="stat-value">{stats.totalUsers}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper uploads">
              <FiUpload className="stat-icon" />
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Total Uploads</h3>
              <p className="stat-value">{stats.totalUploads}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper excel">
              <FiFileText className="stat-icon" />
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Excel Files</h3>
              <p className="stat-value">{stats.totalExcel}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper images">
              <FiImage className="stat-icon" />
            </div>
            <div className="stat-content">
              <h3 className="stat-label">Image Files</h3>
              <p className="stat-value">{stats.totalImages}</p>
            </div>
          </div>
        </div>

        <div className="actions-bar">
          <button 
            className="btn btn-primary" 
            onClick={() => setShowModal(true)}
          >
            <FiPlus className="btn-icon" />
            Create New User
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={loadUsers}
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
              Users
            </h2>
          </div>

          {loading ? (
            <div className="loading-state">
              <FiRefreshCw className="spinning" />
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <FiUsers className="empty-icon" />
              <p>No users found. Create your first user to get started!</p>
            </div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Created At</th>
                    <th>Total Uploads</th>
                    <th>Excel Uploads</th>
                    <th>Image Uploads</th>
                    <th>Last Activity</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => {
                    const createdAt = new Date(user.createdAt).toLocaleDateString()
                    const lastActivity = user.usage.lastActivity 
                      ? new Date(user.usage.lastActivity).toLocaleString()
                      : 'Never'
                    
                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="user-cell">
                            <FiActivity className="user-indicator" />
                            <strong>{user.username}</strong>
                          </div>
                        </td>
                        <td>{createdAt}</td>
                        <td>{user.usage.totalUploads}</td>
                        <td>{user.usage.excelUploads}</td>
                        <td>{user.usage.imageUploads}</td>
                        <td>{lastActivity}</td>
                        <td>
                          <button 
                            className="btn btn-danger btn-small"
                            onClick={() => deleteUser(user.id)}
                          >
                            <FiTrash2 className="btn-icon" />
                            Delete
                          </button>
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
              <h2>Create New User</h2>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={createUser}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
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
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

