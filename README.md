# Project Template: Django + Next.js + Tailwind CSS

A minimal full-stack starter:

- `backend/` is a Django 5.2 API (Django REST Framework, CORS enabled)
- `frontend/` is Next.js (App Router, TypeScript) styled with Tailwind CSS v4

## Structure

```
.
├── backend/
│   ├── config/          # Django project settings, root urls
│   ├── api/             # Starter app with a /api/health/ endpoint
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── app/             # Next.js App Router pages
    ├── lib/api.ts       # Small fetch helper for the Django API
    ├── package.json
    └── .env.local.example
```

## 1. Run the backend

```bash
cd backend
python -m venv .venv
# Windows:      .venv\Scripts\activate
# macOS/Linux:  source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env        # macOS/Linux: cp .env.example .env
python manage.py migrate
python manage.py runserver
```

The API runs at http://127.0.0.1:8000. Check http://127.0.0.1:8000/api/health/

## 2. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
copy .env.local.example .env.local   # macOS/Linux: cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000. The home page calls the Django health endpoint and shows whether it is connected.

## Features

- **Side-by-side evaluation:** enter a prompt, paste each model's response, score each 1–10, pick a winner (or tie), add notes, and save. "Swap A / B" flips the two sides.
- **Leaderboard:** wins / losses / ties, win rate, and average score per model.
- **History:** recent evaluations, expandable to show both responses, with delete.
- **Model list from the API:** `Codex` and `Claude` are seeded by a migration. Add or retire models in Django admin (`python manage.py createsuperuser`, then http://127.0.0.1:8000/admin/).

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health/` | Health check |
| GET | `/api/models/` | Active models |
| GET, POST | `/api/evaluations/` | List (`?limit=N`, `?model=Name`) or create |
| GET, PUT, PATCH, DELETE | `/api/evaluations/<id>/` | Read, update, or delete one evaluation |
| GET | `/api/leaderboard/` | Per-model stats, best first |

Run the backend tests with `python manage.py test`.

## Adding things

- **New API endpoint:** add a view in `backend/api/views.py` and register it in `backend/api/urls.py`.
- **New Django app:** `python manage.py startapp <name>`, then add it to `INSTALLED_APPS` in `backend/config/settings.py`.
- **New page:** create `frontend/app/<route>/page.tsx`.
- **Call the API:** use `apiFetch("/api/your-endpoint/")` from `frontend/lib/api.ts`.
