const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/+$/, '')

const apiUrl = path => `${API_BASE_URL}/${String(path).replace(/^\/+/, '')}`

module.exports = { API_BASE_URL, apiUrl }
