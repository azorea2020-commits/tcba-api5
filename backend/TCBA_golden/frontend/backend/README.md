# TCBA Full Package (Frontend + Backend)

This bundle gives you a working login → welcome flow and a minimal Node/Express API.

## What you get
- **frontend/public_html/**: Static site ready for GoDaddy cPanel upload
  - `index.html` — Login page
  - `welcome.html` — Post-login landing
  - `images/` — Put your bee images here (`bee-bg.jpg`, etc.)
- **backend/**: Minimal Express API for Render
  - `server.js` — Health check, demo login, OAuth placeholders
  - `package.json` — Start script
  - `.env.example` — Environment template

---

## How to deploy (Fast)

### 1) Front-end (GoDaddy cPanel)
1. Open **File Manager** → go to `/public_html/`.
2. Upload everything from `frontend/public_html/` (keep the folder contents, not the folder).
3. Put a background image at `/public_html/images/bee-bg.jpg` (any .jpg will do).
4. Visit your domain — you should see the **Login** page.

### 2) Back-end (Render)
1. Create a new **Web Service** (Node) and connect to this `backend/` folder.
2. Set **Start Command** to: `node server.js`
3. Add Environment from `.env.example`. (You can leave `ALLOW_ORIGIN=*` at first.)
4. Deploy. After it’s live, you’ll have an API URL like `https://tcba-api.onrender.com`.

### 3) Point the front-end at your API
- On the **login page**, the script uses `API_BASE` from `localStorage` if set, else `http://localhost:5000`.
- To set it once from your browser:
  1. Open the Login page.
  2. Hit F12 → Console, paste (replace with your actual URL):
     ```js
     localStorage.setItem('API_BASE','https://tcba-api.onrender.com')
     ```
  3. Refresh and login.

You can also hardcode it in `index.html` by changing `const API_BASE = ...` if you prefer.

---

## Quick sanity checks
- Open: `https://YOUR-API/healthz` — should say `OK`.
- Click **Sign in with Google**/**PayPal** — should display placeholder text (no 404).
- Use any username/password on the login form → should redirect to **welcome.html**.
- On the Welcome page, click **Check API /healthz** — should show `OK`.

---

## Notes
- This is a minimal setup to prove the pipeline (GoDaddy static + Render API). You can swap the demo login with real OAuth later.
- If CORS blocks you, set `ALLOW_ORIGIN` in `.env` to your site origin and deploy again.

Good luck, beekeeper 🐝
