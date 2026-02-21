/**
 * Returns headers for authenticated API requests.
 * Backend expects X-User-Id for sheet routes.
 */
export function getAuthHeaders() {
  const userId = (() => {
    try {
      const saved = localStorage.getItem('user_id')
      if (saved) return saved
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null')
      return user?.id != null ? String(user.id) : null
    } catch {
      return null
    }
  })()

  const headers = {
    'Content-Type': 'application/json'
  }
  if (userId) {
    headers['X-User-Id'] = userId
  }
  return headers
}
