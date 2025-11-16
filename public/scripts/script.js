/* ===============================================
   TCBA Configuration File
   ===============================================
   This file defines the API base URL and other
   environment-level constants for the front-end.
   =============================================== */

// 🐝 Set your live backend API endpoint here.
// Make sure this matches the address where your
// server.js is hosted and running online.
const API_BASE_URL = "https://tcba-api.onrender.com"; 
// Example alternatives (use only one):
// const API_BASE_URL = "https://tcbabees.org/api";
// const API_BASE_URL = "https://your-flyio-app.fly.dev";

// 🧭 Optional: define paths for specific routes
const API_ENDPOINTS = {
  signup: `${API_BASE_URL}/signup`,
  login: `${API_BASE_URL}/login`,
  test: `${API_BASE_URL}/test`,
  members: `${API_BASE_URL}/members`,
  events: `${API_BASE_URL}/events`,
  videos: `${API_BASE_URL}/videos`
};

// 🛠 Utility function to easily fetch data
async function apiFetch(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("🐝 API Fetch Error:", error);
    throw error;
  }
}

// ✅ Export to other scripts
window.TCBA_CONFIG = {
  API_BASE_URL,
  API_ENDPOINTS,
  apiFetch
};

console.log("✅ TCBA config.js loaded. Backend:", API_BASE_URL);
