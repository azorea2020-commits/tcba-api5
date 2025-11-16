// ===============================
// TCBA Frontend Script
// Handles login, signup, and Google OAuth
// ===============================

// 👇 CHANGE THIS to your actual Render backend URL
window.API_BASE = "https://YOUR-RENDER-URL.onrender.com";

// Helper function for POST requests
async function apiPost(endpoint, data) {
  const response = await fetch(`${window.API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(data)
  });
  return response.json();
}

// Handle login/signup form submission
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const output = document.getElementById("out");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const email = formData.get("email");
      const password = formData.get("password");

      if (!email || !password) {
        output.textContent = "⚠️ Please enter both email and password.";
        return;
      }

      try {
        // Try to log in first
