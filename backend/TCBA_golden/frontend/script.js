// ===============================
// TCBA Frontend Script
// Handles login, signup, and redirects
// ===============================

// ✅ Set to your real Render backend URL
window.API_BASE = "https://tcba-api.onrender.com";

// Helper for POST requests
async function apiPost(endpoint, data) {
  try {
    const response = await fetch(`${window.API_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // important for sessions
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Try to read error response
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Request failed with ${response.status}`);
    }

    return response.json();
  } catch (err) {
    console.error("❌ API error:", err);
    throw err;
  }
}

// ===============================
// Handle Login / Signup Form
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const output = document.getElementById("out");

  if (!form) return;

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
      // 1️⃣ Try login first
      const loginResponse = await apiPost("/login", { email, password });
      console.log("✅ Login response:", loginResponse);

      output.textContent = "✅ Login successful! Redirecting...";
      setTimeout(() => {
        window.location.href = "welcome.html";
      }, 800);

    } catch (loginErr) {
      console.warn("Login failed:", loginErr);

      // 2️⃣ If login fails, try to create account (signup)
      try {
        const signupResponse = await apiPost("/signup", {
          email,
          password,
          name: email.split("@")[0],
        });
        console.log("✅ Signup response:", signupResponse);

        output.textContent = "✅ Account created! Redirecting...";
        setTimeout(() => {
          window.location.href = "welcome.html";
        }, 800);
      } catch (signupErr) {
        console.error("Signup failed:", signupErr);
        output.textContent = "❌ Login failed. Check your email/password or connection.";
      }
    }
  });
});
