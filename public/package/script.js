// ===============================
// TCBA Frontend Script
// Handles login, signup, and redirects
// ===============================

// 👇 Your actual backend URL (Render)
window.API_BASE = "https://tcba-api.onrender.com";

// Helper function for POST requests
async function apiPost(endpoint, data) {
  const response = await fetch(`${window.API_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return response.json();
}

// Handle login/signup form submission
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const output = document.getElementById("out");

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
      // Send login request
      const res = await apiPost("/login", { email, password });

      if (res.message && res.message.includes("✅")) {
        output.style.color = "green";
        output.textContent = "✅ Login successful! Redirecting...";
        setTimeout(() => {
          window.location.href = "welcome.html";
        }, 1000);
      } else {
        output.style.color = "red";
        output.textContent = res.error || "❌ Login failed. Check connection.";
      }
    } catch (err) {
      output.style.color = "red";
      output.textContent = "❌ Network error. Please try again.";
    }
  });
});
