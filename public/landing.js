// ===========================================
// 🐝 TCBA Landing Page – Cache & Redirect Logic
// ===========================================

const createBtn = document.getElementById("createAccount");

// Check stored member cache
const member = JSON.parse(localStorage.getItem("tcbaMember")) || null;

async function verifyMember() {
  try {
    const res = await fetch(`${window.TCBA_API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrUsername: member.email || member.username,
        password: member.pin
      }),
    });

    if (!res.ok) throw new Error("Verification failed");

    const data = await res.json();
    console.log("✅ Verified:", data);

    // Redirect to Welcome page
    window.location.href = "welcome.html";
  } catch {
    localStorage.removeItem("tcbaMember");
    createBtn.classList.remove("hidden");
  }
}

if (!member) {
  document.querySelector(".welcome-box p").textContent =
    "No account found on this device.";
  createBtn.classList.remove("hidden");
  createBtn.onclick = () => (window.location.href = "signup.html");
} else {
  verifyMember();
}
