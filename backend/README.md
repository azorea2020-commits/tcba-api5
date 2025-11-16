# TCBA API (Minimal)

## Run locally
1. Install: `npm install`
2. Create a `.env` file (optional):
   ```
   PORT=5000
   ```
3. Start: `npm start`
4. Test:
   - http://localhost:5000/ → "TCBA API is running"
   - http://localhost:5000/healthz → `{ ok: true, uptime: ... }`
   - http://localhost:5000/api/ping → `{ pong: true, ts: ... }`

## Notes
- `.env` is **ignored** by git.
- Add routes under `/api/...` as needed.
