# CodeReview AI — Full-Stack AI Code Review Platform

Write, paste, review, and improve code using an LLM. Users submit code in one of
several languages, and the platform returns a structured, senior-level review:
a quality score, bugs, security issues, performance and readability suggestions,
best practices, time/space complexity, and a cleaned-up rewrite — all saved to a
searchable history.

Built with a modern SaaS-style UI inspired by Linear, Vercel, and GitHub.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Setup & Run](#setup--run)
- [API Documentation](#api-documentation)
- [Notes on the AI Provider](#notes-on-the-ai-provider)

---

## Features

**Authentication**
- Register, login, JWT-based auth, protected routes, and a user profile.

**Dashboard**
- View previous reviews, search by title/code, filter by language, delete, and revisit.
- Quick stats: total reviews, average score, languages used.

**Code Editor**
- Monaco Editor with syntax highlighting and line numbers.
- Languages: JavaScript, TypeScript, Python, Java, C++, Go.
- Light/Dark theme switch, character & line count, sample snippets.
- Keyboard shortcut: `Ctrl/Cmd + Enter` to review.
- Auto-saves your draft locally.

**AI Review** returns:
- Overall quality score (/10)
- Bugs found
- Security issues
- Performance improvements
- Readability suggestions
- Best practices
- Cleaned-up version of the code
- Time complexity & space complexity
- Final summary

**Extras**
- Copy code, download review as PDF, toast notifications, loading animations,
  Markdown rendering of AI output, responsive design, and Framer Motion transitions.

---

## Tech Stack

| Layer     | Technologies                                                            |
| --------- | ----------------------------------------------------------------------- |
| Frontend  | React + TypeScript, Vite, Tailwind CSS, React Router, Axios, Monaco Editor, Framer Motion, react-markdown, jsPDF |
| Backend   | Node.js + Express, MongoDB + Mongoose, JWT, bcryptjs, express-validator, express-rate-limit, helmet, morgan |
| AI        | Google Gemini or OpenAI (configurable)                                  |
| Tooling   | ESLint + Prettier on both frontend and backend                          |

---

## Project Structure

```
AI-Code Review Platform/
├── backend/
│   ├── src/
│   │   ├── config/         # env loading + Mongo connection
│   │   ├── controllers/    # auth & review request handlers
│   │   ├── middleware/      # auth, validation, rate limiting, error handling
│   │   ├── models/          # Mongoose schemas (User, Review)
│   │   ├── routes/          # Express routers
│   │   ├── services/        # AI provider integration (Gemini/OpenAI)
│   │   ├── utils/           # ApiError, asyncHandler, JWT helpers
│   │   ├── validators/      # express-validator chains
│   │   ├── app.js           # Express app factory (middleware + routes)
│   │   └── server.js        # entry point (DB connect + listen)
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # reusable UI (editor, layout, ui/*)
    │   ├── context/         # Auth, Theme, Toast providers
    │   ├── hooks/           # useDebounce, useLocalStorage
    │   ├── lib/             # axios instance + error helpers
    │   ├── pages/           # Login, Register, Dashboard, Review, Profile...
    │   ├── services/        # typed API clients
    │   ├── types/           # shared TypeScript types
    │   ├── utils/           # constants, PDF generation
    │   ├── App.tsx          # routing
    │   └── main.tsx         # entry point
    ├── .env.example
    └── package.json
```

---

## Prerequisites

- **Node.js** 18+ (developed on Node 24)
- **MongoDB** running locally, or a MongoDB Atlas connection string
- *(Optional)* A **Gemini** or **OpenAI** API key for real AI reviews. Without a
  key, the backend returns a deterministic demo review so the app stays usable.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable          | Description                                          | Example                                      |
| ----------------- | ---------------------------------------------------- | -------------------------------------------- |
| `PORT`            | API port                                             | `5000`                                       |
| `NODE_ENV`        | `development` or `production`                        | `development`                                |
| `CLIENT_URL`      | Allowed CORS origin (frontend URL)                   | `http://localhost:5173`                      |
| `MONGO_URI`       | MongoDB connection string                            | `mongodb://127.0.0.1:27017/ai-code-review`   |
| `JWT_SECRET`      | Secret used to sign JWTs                             | a long random string                         |
| `JWT_EXPIRES_IN`  | Token lifetime                                       | `7d`                                         |
| `AI_PROVIDER`     | `gemini` or `openai`                                 | `gemini`                                     |
| `GEMINI_API_KEY`  | Google Gemini API key                                | —                                            |
| `GEMINI_MODEL`    | Gemini model name                                    | `gemini-1.5-flash`                           |
| `OPENAI_API_KEY`  | OpenAI API key (when `AI_PROVIDER=openai`)           | —                                            |
| `OPENAI_MODEL`    | OpenAI model name                                    | `gpt-4o-mini`                                |

### Frontend (`frontend/.env`)

| Variable        | Description                                              | Example |
| --------------- | -------------------------------------------------------- | ------- |
| `VITE_API_URL`  | Base URL for the API. Leave as `/api` to use the dev proxy | `/api`  |

---

## Setup & Run

You need **two terminals** running at the same time — one for the backend, one
for the frontend. Set up the backend first.

### Backend setup (step by step)

#### Step 1 — Install Node.js

Install **Node.js 18+** (developed on Node 24) from <https://nodejs.org>.
Verify it:

```bash
node --version
npm --version
```

#### Step 2 — Set up MongoDB

You need a MongoDB database. Pick **one** of these options:

<details>
<summary><b>Option A — MongoDB Atlas (free cloud DB, recommended, no install)</b></summary>

1. Create a free account at <https://www.mongodb.com/cloud/atlas/register>.
2. Create a **free M0 cluster**.
3. Under **Database Access**, create a database user (username + password).
4. Under **Network Access**, click **Add IP Address → Allow access from anywhere**
   (`0.0.0.0/0`) for development.
5. Click **Connect → Drivers** and copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ai-code-review?retryWrites=true&w=majority
   ```
6. Replace `<username>` / `<password>` with your credentials and put this value
   in `MONGO_URI` in `backend/.env` (see Step 3).

</details>

<details>
<summary><b>Option B — Local MongoDB on Windows</b></summary>

1. Download the **MongoDB Community Server** MSI from
   <https://www.mongodb.com/try/download/community>.
2. Run the installer. Choose **Complete**, and keep **"Install MongoDB as a
   Service"** checked (this starts MongoDB automatically on boot).
3. (Optional) Install **MongoDB Compass** when prompted — a GUI to view your data.
4. MongoDB now runs on `mongodb://127.0.0.1:27017`. To verify the service is running:
   ```powershell
   Get-Service MongoDB
   ```
   If its status isn't `Running`, start it with:
   ```powershell
   net start MongoDB
   ```
5. Use this in `backend/.env`:
   ```
   MONGO_URI=mongodb://127.0.0.1:27017/ai-code-review
   ```

</details>

<details>
<summary><b>Option C — MongoDB via Docker</b></summary>

```bash
docker run -d --name mongo -p 27017:27017 mongo:7
```
Then use `MONGO_URI=mongodb://127.0.0.1:27017/ai-code-review`.

</details>

#### Step 3 — Create the backend `.env`

From the `backend` folder, copy the example file and edit it:

```bash
cd backend
copy .env.example .env       # macOS/Linux: cp .env.example .env
```

Open `backend/.env` and set at least:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# From Step 2 (Atlas string OR local URI)
MONGO_URI=mongodb://127.0.0.1:27017/ai-code-review

# Any long random string
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d

# AI provider — leave the key blank to use the built-in offline demo review
AI_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

#### Step 4 — (Optional) Add an AI API key for real reviews

Without a key the backend still works and returns a deterministic **demo** review.
For real AI output, add one of:

- **Gemini:** get a key at <https://aistudio.google.com/app/apikey>, set
  `AI_PROVIDER=gemini` and `GEMINI_API_KEY=...`.
- **OpenAI:** get a key at <https://platform.openai.com/api-keys>, set
  `AI_PROVIDER=openai` and `OPENAI_API_KEY=...`.

#### Step 5 — Install dependencies and run the backend

```bash
cd backend
npm install
npm run dev        # starts on http://localhost:5000
```

You should see `MongoDB connected` and `API running on http://localhost:5000`.
Sanity-check it in a browser: <http://localhost:5000/api/health>.

### Frontend setup

In a **second terminal**:

```bash
cd frontend
npm install
copy .env.example .env     # optional; defaults work with the dev proxy
npm run dev                # starts on http://localhost:5173
```

Then open **http://localhost:5173**, register an account, and start reviewing code.
The dev server proxies `/api` to the backend, so no extra config is needed.

### Production build (frontend)

```bash
cd frontend
npm run build
npm run preview
```

### Troubleshooting

- **`MongoDB connection error` / backend exits immediately** — MongoDB isn't
  running or `MONGO_URI` is wrong. Verify the service (Option B) or your Atlas
  string and IP allowlist (Option A).
- **Frontend loads but requests fail** — make sure the backend terminal is
  running on port `5000`.
- **`EADDRINUSE` on 5000/5173** — another process is using the port. Stop it or
  change `PORT` (backend) / the Vite port.
- **CORS errors** — ensure `CLIENT_URL` in `backend/.env` matches the frontend URL.

---

## API Documentation

Base URL: `http://localhost:5000/api`

All authenticated routes require an `Authorization: Bearer <token>` header.
Responses follow the envelope: `{ "success": boolean, "message"?: string, "data": ... }`.

### Auth

#### `POST /auth/register`
Create an account.
```json
{ "name": "Ada Lovelace", "email": "ada@example.com", "password": "secret123" }
```
**201** → `{ "data": { "user": { ... }, "token": "<jwt>" } }`

#### `POST /auth/login`
```json
{ "email": "ada@example.com", "password": "secret123" }
```
**200** → `{ "data": { "user": { ... }, "token": "<jwt>" } }`

#### `GET /auth/me` *(auth)*
Returns the current user.

#### `PATCH /auth/me` *(auth)*
Update profile.
```json
{ "name": "Ada", "avatarColor": "#10b981" }
```

### Reviews *(all require auth)*

#### `POST /review`
Run and store an AI review.
```json
{ "code": "function add(a,b){return a+b}", "language": "javascript", "title": "Optional title" }
```
`language` ∈ `javascript | typescript | python | java | cpp | go`.
**201** → `{ "data": { "review": { ..., "aiResponse": { ... } } } }`

#### `GET /reviews`
List the current user's reviews.
Query params: `page`, `limit` (max 50), `search`, `language`.
**200** → `{ "data": { "items": [...], "pagination": { page, limit, total, totalPages } } }`

#### `GET /reviews/stats`
**200** → `{ "data": { "totalReviews": number, "averageScore": number } }`

#### `GET /review/:id`
Fetch a single review owned by the user.

#### `DELETE /review/:id`
Delete a review.

### Health

#### `GET /health`
**200** → `{ "success": true, "status": "ok", "uptime": number }`

### Errors & Rate Limits

- Errors return `{ "success": false, "message": "...", "details"?: [...] }`.
- Rate limits: global API (300/15min), auth endpoints (20/15min), reviews (10/min).

---

## Notes on the AI Provider

- Set `AI_PROVIDER=gemini` (default) or `AI_PROVIDER=openai` and provide the
  matching API key in `backend/.env`.
- The backend asks the model for strict JSON and normalises the response into the
  `aiResponse` schema, so the UI stays consistent.
- **No key configured?** The API returns a deterministic demo review so you can
  explore the full app without external credentials.

---

## License

MIT
