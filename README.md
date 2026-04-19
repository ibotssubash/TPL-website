# Trichy Premier League (TPL)

Full-stack cricket league app with FastAPI, PostgreSQL, SQLAlchemy, React, Tailwind CSS, Axios, and React Router.

## Project Structure

```text
TPL/
  backend/     # FastAPI + SQLAlchemy + Alembic
  frontend/    # React + Vite + Tailwind
  database/    # SQL bootstrap script
```

## Features Implemented

- Home page with hero, upcoming matches, top performers, and leaderboard.
- Teams page with modern cards and team-based player navigation.
- Players page with team filter, search, stats table, and pagination-ready API.
- Matches page with Upcoming/Completed tabs.
- Points table with computed points and net run rate.
- Live match page with score, striker/non-striker/bowler, and commentary.
- Admin login with JWT authentication.
- Admin panel to add/edit/delete teams and players, create/delete matches, and update match scores.
- Admin media manager for multi-image uploads and live video stream link updates.
- Homepage live gallery + embedded live stream with auto-refresh.
- RESTful APIs with Pydantic validation and SQLAlchemy relationships.
- Alembic migration setup for database versioning.

## Backend Setup (FastAPI)

1. Go to backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create `.env` from `.env.example` and update values as needed.
5. Ensure PostgreSQL is running and database exists (`tpl_db`).
6. Apply migrations:
   ```bash
   alembic -c alembic.ini upgrade head
   ```
7. Start API server:
   ```bash
   uvicorn app.main:app --reload
   ```

Backend URL: `http://127.0.0.1:8000`

## Frontend Setup (React + Tailwind)

1. Open a new terminal and go to frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env` from `.env.example`:
   ```env
   VITE_API_BASE_URL=http://127.0.0.1:8000/api
   ```
4. Start frontend:
   ```bash
   npm run dev
   ```

Frontend URL: `http://127.0.0.1:5173`

## Default Admin Credentials

Seeded automatically on backend startup:

- Username: `admin`
- Password: `admin123`

Override via backend `.env`:

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

## Database Bootstrap (Optional)

If you want manual SQL bootstrap instead of Alembic:

```bash
psql -U postgres -f database/init.sql
```

## Main API Endpoints

- `POST /api/auth/login`
- `GET/POST/PUT/DELETE /api/teams`
- `GET/POST/PUT/DELETE /api/players`
- `GET/POST/PUT/DELETE /api/matches`
- `PATCH /api/matches/{match_id}/score`
- `GET /api/media/images`
- `POST /api/media/images/upload` (admin)
- `DELETE /api/media/images/{image_id}` (admin)
- `GET /api/media/live-stream`
- `PUT /api/media/live-stream` (admin)
- `GET /api/dashboard/home`
- `GET /api/dashboard/points-table`
- `GET /api/dashboard/live-match`
