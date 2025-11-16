// script.js – TCBA frontend utility and API connection
const TCBA_API_BASE = 'https://tcba-api.onrender.com';  // live Render backend

/**
 * Generic helper for API requests
 * @param {string} endpoint - API path like '/api/login'
 * @param {object} options - Fetch options (method, headers, body)
 * @returns {Promise<object>} JSON response or error
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const res = await fetch(`${TCBA_API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API error ${res.status}: ${text}`);
    }

    return await res.json();
  } catch (err) {
    console.error('API request failed:', err);
    alert('⚠️ Could not connect to TCBA servers. Please try again.');
    throw err;
  }
}

// Example quick test call (you can delete this line later)
// apiRequest('/health').then(console.log);
