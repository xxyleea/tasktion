

# Tasktion

A modern, full-stack task manager app with categories, tags, due dates, and persistent storage. Built with React, Vite, Tailwind CSS, and a Node.js/Express backend with JSON file storage.

---

## Features
- Task management with tags, due dates, and completion tracking
- Custom categories (filtered by tag)
- Calendar and list views
- Dark mode toggle
- Persistent storage (all data saved in `backend/tasks.json`)
- Simple, local-first setup (no database required)

---

## Quick Start

### 1. Clone and Install
```sh
git clone <repo-url>
cd tasktion
npm install
cd backend
npm install # (if you add backend dependencies)
cd ..
```

### 2. Configuration
- **Port config:**
  - Frontend runs on port **3000** (Vite)
  - Backend runs on port **4000** (Express)
- **Allowed hosts:**
  - If using a tunnel (like ngrok), add your domain to `vite.config.ts` under `server.allowedHosts`.
- **Data location:**
  - All tasks and categories are stored in `backend/tasks.json`.

### 3. Running the App
#### Option A: Manually (two terminals)
1. **Start the backend:**
   ```sh
   cd backend
   node server.js
   ```
2. **Start the frontend:**
   ```sh
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Option B: With a Batch File (Windows)
1. Create a file named `start-tasktion.bat` in the project root with:
   ```bat
   @echo off
   start cmd /k "cd /d %~dp0backend && node server.js"
   start cmd /k "cd /d %~dp0 && npm run dev"
   ```
2. Right-click the batch file and choose "Send to > Desktop (create shortcut)".
3. Double-click the shortcut to launch both servers.

---

## API Endpoints (Backend)
- `GET /api/tasks` — Get all tasks
- `POST /api/tasks` — Add/update a task (send `{ task: {...} }`)
- `GET /api/categories` — Get all categories
- `POST /api/categories` — Add/update a category (send `{ category: {...} }`)

---

## Customization & Tips
- **Dark mode:** Toggle in the sidebar; preference is saved.
- **Data reset:** Delete or edit `backend/tasks.json` to reset tasks/categories.
- **Port conflict?** Change ports in `vite.config.ts` (frontend) or `backend/server.js` (backend).
- **Production:** For local use only. For public deployment, use a real database and secure the backend.

---

## Troubleshooting
- If tasks/categories don't show up, check the browser console and backend terminal for errors.
- If you see CORS or network errors, make sure both servers are running and ports match.
- For ngrok/tunnel use, add your public domain to `vite.config.ts` as described above.

---

## Credits
- Original Figma design: https://www.figma.com/design/R5JluKXNZLsZUJA6GTFe7a/Task-Manager-Application
- Built with React, Vite, Tailwind CSS, Node.js, Express
