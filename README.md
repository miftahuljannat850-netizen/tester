# Simple File Upload Demo (Express + Vanilla JS)

Demonstrates a minimal file-upload flow with a **separate frontend and backend**,
the way you'd deploy on a VPS: backend as an API/file server, frontend as static files.

```
upload-demo/
├── backend/          # Express + Multer API
│   ├── server.js
│   ├── package.json
│   └── uploads/      # uploaded files land here
└── frontend/         # plain HTML/CSS/JS, no build step
    ├── index.html
    ├── style.css
    └── script.js
```

## 1. Run the backend

```bash
cd backend
npm install
npm start
```

This starts the API on `http://0.0.0.0:5000` with:
- `POST /api/upload` — accepts a file (field name `file`), saves it to `uploads/`
- `GET  /api/files`  — lists uploaded files as JSON
- `GET  /uploads/<filename>` — serves an uploaded file
- `GET  /api/health` — simple health check

## 2. Run the frontend

The frontend is static, so any web server works. Simplest option:

```bash
cd frontend
npx serve -l 3000
# or: python3 -m http.server 3000
```

Open `http://localhost:3000` (or `http://YOUR_VPS_IP:3000`).

Before that, edit `frontend/script.js` and set `BACKEND_URL` to wherever
the backend actually runs, e.g.:

```js
const BACKEND_URL = "http://YOUR_VPS_IP:5000";
```

## 3. Deploying on a real VPS

- Open both ports in your firewall (e.g. `ufw allow 5000`, `ufw allow 3000`),
  or put both behind Nginx as reverse proxies on port 80/443.
- Keep the backend alive with `pm2 start server.js` (or a systemd service)
  instead of `npm start` directly, so it survives SSH disconnects/reboots.
- For production, consider:
  - Restricting file types/size further in `multer` config.
  - Serving the frontend from Nginx directly instead of `serve`.
  - Adding HTTPS (Let's Encrypt / certbot) if exposed publicly.

## Notes

- CORS is enabled on the backend (`cors()` middleware) so the frontend can be
  on a different port/domain than the API — this mirrors a real VPS setup
  where frontend and backend are two separate services.
- Max upload size is capped at 10MB in `server.js` (`limits.fileSize`) — adjust as needed.
