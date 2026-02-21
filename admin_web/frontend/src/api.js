/**
 * Returns headers for authenticated admin API requests.
 * Admin routes use Bearer token from localStorage.
 */
export function getAuthHeaders(includeJson = false) {
  const token = localStorage.getItem('admin_token')
  const headers = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  if (includeJson) {
    headers['Content-Type'] = 'application/json'
  }
  return headers
}
