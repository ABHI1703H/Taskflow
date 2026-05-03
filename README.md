# TaskFlow

A full-stack team task manager built with FastAPI, PostgreSQL, and React.

## Stack

- **Backend**: Python 3.11, FastAPI, asyncpg (raw SQL), Pydantic v2
- **Database**: PostgreSQL
- **Frontend**: React 18, Vite, React Router v6, Axios, plain CSS

---

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### 1. Clone the repo

```bash
git clone https://github.com/yourname/taskflow.git
cd taskflow
```

### 2. Set up the database

```bash
createdb taskflow
```

### 3. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env with your database URL and a secret key

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

The API runs at http://localhost:8000  
Swagger docs: http://localhost:8000/docs

### 4. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at http://localhost:5173

---

## Commands Summary

```bash
# Backend (from /backend)
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Frontend (from /frontend)
npm run dev

# Build frontend for production
npm run build
```

---

## Deploy to Railway (Backend + Database)

1. Create a Railway project at https://railway.app
2. Add a **PostgreSQL** service — Railway auto-sets `DATABASE_URL`
3. Add a new **service** from your GitHub repo, set root to `/backend`
4. Set environment variables:
   - `SECRET_KEY` — generate with `python -c "import secrets; print(secrets.token_hex(32))"`
5. Railway will build using the `Dockerfile` and expose a public URL

---

## Deploy to Vercel (Frontend)

1. Push your repo to GitHub
2. Import the project at https://vercel.com
3. Set **Root Directory** to `frontend`
4. Set **Build Command**: `npm run build`
5. Set **Output Directory**: `dist`
6. Add environment variable:
   - `VITE_API_URL` — your Railway backend URL (e.g. `https://taskflow.up.railway.app`)
7. Update `frontend/src/api/client.js` `baseURL` to use `import.meta.env.VITE_API_URL + '/api/v1'` for production

---

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/auth/signup | No | Create account |
| POST | /api/v1/auth/login | No | Get JWT token |
| GET | /api/v1/auth/me | Yes | Current user |
| GET | /api/v1/projects/ | Yes | List my projects |
| POST | /api/v1/projects/ | Yes | Create project |
| GET | /api/v1/projects/:id | Yes | Project detail |
| DELETE | /api/v1/projects/:id | Admin | Delete project |
| GET | /api/v1/projects/:id/members | Yes | List members |
| POST | /api/v1/projects/:id/members | Admin | Add member |
| DELETE | /api/v1/projects/:id/members/:uid | Admin | Remove member |
| GET | /api/v1/projects/:id/tasks | Yes | List tasks |
| POST | /api/v1/projects/:id/tasks | Admin | Create task |
| PATCH | /api/v1/projects/:id/tasks/:tid | Yes* | Update task |
| DELETE | /api/v1/projects/:id/tasks/:tid | Admin | Delete task |
| GET | /api/v1/dashboard | Yes | Dashboard stats |

*Members can only update `status` on tasks assigned to them.

## Roles

- **Admin**: Full control over project, members, and tasks
- **Member**: Can view everything, update status of their own tasks only

## License

MIT
