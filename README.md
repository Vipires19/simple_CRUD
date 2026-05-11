# File Manager App

🇺🇸 English | [🇧🇷 Português](README_PTBR.md)

![React](https://img.shields.io/badge/React-Frontend-blue)
![Django](https://img.shields.io/badge/Django-Backend-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue)
![Docker](https://img.shields.io/badge/Docker-Containerization-blue)

## Description

A fullstack file management application built with React, TypeScript, Django REST Framework and PostgreSQL.

---

## Features

- User registration and login (session-based)
- File upload with extension and size validation (`.png`, `.jpg`, `.jpeg`, `.pdf`, `.txt`, max 10MB)
- File listing scoped to the authenticated user
- File download (server-side streaming via Django `FileResponse`)
- Image preview thumbnails for uploaded images
- File deletion
- CSRF protection on mutating API calls
- Dockerized environment (PostgreSQL, backend, frontend)
- Automated tests: `pytest` (API) and Playwright (E2E smoke flow)

---

## Screenshots

![Login — session-based authentication](screenshots/login.png)

![Home — file list, upload area, and actions](screenshots/home.png)

![Upload — validated upload with progress](screenshots/upload.png)

![Download — client receives streamed file as blob for save](screenshots/download.png)

---

## Architecture

```
React SPA
    ↓  HTTP (JSON, multipart, cookies)
Django REST API
    ↓  ORM
PostgreSQL
```

The **frontend** is a React single-page application that talks to the **backend** only through HTTP: session cookies for authentication, JSON for auth metadata, and `multipart/form-data` for uploads. The **backend** persists users and file metadata in **PostgreSQL** and stores file binaries on disk under Django’s configured media root.

**Why this split:** the UI can evolve independently (routing, components, build tooling) while the API enforces authorization, validation, and storage rules in one place. **Benefits:** clear boundaries, easier testing of the API in isolation, and the option to swap or add clients (mobile, CLI) without changing storage logic.

---

## Tech Stack

**Frontend**

- React
- TypeScript
- Vite
- Fetch API (including `XMLHttpRequest` for upload progress)

**Backend**

- Django
- Django REST Framework

**Database**

- PostgreSQL (optional SQLite via `USE_SQLITE=1` for tests/local tooling)

**Infrastructure**

- Docker
- Docker Compose

**Testing**

- pytest, pytest-django
- Playwright (`@playwright/test`)

---

## Technical Decisions

- **PostgreSQL:** durable relational storage for users and file metadata; fits Django’s ORM and concurrent access better than ad hoc file indexing alone.
- **Django REST Framework:** structured serializers, consistent HTTP semantics, and pluggable authentication/permissions on views.
- **React + TypeScript:** component model for the UI and static typing to reduce regressions as the surface grows.
- **Docker Compose:** one command to align versions, network, and DB credentials across machines; frontend dev server proxies `/api` to the backend service inside the stack.
- **Streaming download:** `FileResponse` streams from the stored file instead of loading the whole object into memory, which scales better for larger allowed files.
- **SPA + API:** the browser hosts the UI; the server remains stateless beyond Django sessions and focuses on data rules and I/O.

---

## Project Structure

```
project/
├── backend/
├── frontend/
├── docker-compose.yml
├── README.md
├── README_PTBR.md
└── LICENSE
```

---

## Setup Instructions

### 1. Clone

```bash
git clone <repository-url>
cd simple_CRUD
```

### 2. Backend environment

Copy or create `backend/.env` (see [Environment Variables](#environment-variables)). For Compose, `POSTGRES_HOST` must be `db` so the API resolves the database service.

### 3. Run with Docker Compose

From the project root (directory that contains `docker-compose.yml`):

```bash
docker compose up --build
```

The backend container runs `migrate` before `runserver`, so you do not need a separate migrate step for this path.

### 4. Access

| Service    | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:5173        |
| Backend   | http://localhost:8000        |
| Admin     | http://localhost:8000/admin/ |

Health check: `GET http://localhost:8000/api/health/`

### Local development without Docker (optional)

- Run Django from `backend/` (e.g. `USE_SQLITE=1` for a quick DB, or point `POSTGRES_*` at a local instance).
- Run `npm run dev` from `frontend/`. The default Vite proxy target is `http://backend:8000` for Compose; on the host machine, change `server.proxy` in `frontend/vite.config.ts` to `http://127.0.0.1:8000` (or your Django URL) so `/api` resolves.

---

## Environment Variables

### Backend (`backend/.env`)

Used by `config/settings.py` and `docker-compose` (via `env_file`).

Example:

```env
DJANGO_SECRET_KEY=change-me-in-production
DJANGO_DEBUG=1
DJANGO_ALLOWED_HOSTS=backend,localhost,127.0.0.1

POSTGRES_DB=fileapp
POSTGRES_USER=app
POSTGRES_PASSWORD=app
POSTGRES_HOST=db
POSTGRES_PORT=5432

USE_SQLITE=0

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000,http://127.0.0.1:8000
```

- With **Docker Compose**, keep `POSTGRES_HOST=db`.
- For **pytest** or quick local runs without Postgres, set `USE_SQLITE=1` (see Playwright config for E2E).

### Frontend

The client uses **relative** URLs (`/api/...`). No `.env` is required for the default Compose or Vite-proxy setup. If you host the SPA and API on different origins in production, you would introduce a build-time base URL (not present in the current codebase).

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health/` | Liveness JSON (`{"status":"ok"}`) |
| GET | `/api/csrf/` | Returns `csrfToken`; sets CSRF cookie |
| POST | `/api/auth/register/` | Register user (JSON: `email`, `password`) |
| POST | `/api/auth/login/` | Login (session cookie) |
| POST | `/api/auth/logout/` | Logout |
| GET | `/api/auth/me/` | Current user (`id`, `email`) — authenticated |
| GET | `/api/files/` | List current user’s files |
| POST | `/api/files/` | Upload (`multipart/form-data`, field `file`) |
| GET | `/api/files/<id>/download/` | Download (`FileResponse`, attachment) |
| GET | `/api/files/<id>/preview/` | Inline image preview (images only) |
| DELETE | `/api/files/<id>/` | Delete file |

Mutating requests from the browser send `X-CSRFToken` after loading `/api/csrf/`.

---

## Security

- **Authentication:** Django session cookies after login; DRF `SessionAuthentication` and `IsAuthenticated` on file routes.
- **Isolation:** Queries use `request.user` (e.g. `get_object_or_404(UserFile, pk=pk, user=request.user)`), so users cannot read or delete another user’s files by ID guessing alone.
- **Upload validation:** Whitelist of extensions and maximum size enforced in the serializer; Django also sets upload memory limits in settings.
- **Password storage:** `create_user` / Django’s password hashers (not plain text).
- **CSRF:** `CsrfViewMiddleware` and explicit token on register/login/logout/upload/delete from the SPA.
- **Cookies:** `SESSION_COOKIE_HTTPONLY`, `SESSION_COOKIE_SAMESITE=Lax`; configure HTTPS and stricter cookie flags in production.

---

## Automated Tests

**Backend (pytest)** — from `backend/`:

```bash
USE_SQLITE=1 python -m pytest
```

Covers auth register/login/me/logout and file upload/list/download/preview/delete plus rejection of disallowed extensions.

**Frontend (Playwright)** — from `frontend/` (install browsers once: `npx playwright install chromium`):

```bash
npm run test:e2e
```

The Playwright config starts Django (SQLite) and Vite, then runs a smoke test: register, login, upload PNG, assert list and thumbnail.

---

## Future Improvements

- Object storage (S3/MinIO) instead of local media only
- Time-limited signed download URLs
- Background/async processing for antivirus scanning or transcoding
- HTTP caching or CDN for static assets and previews

---

## License

MIT License — see [LICENSE](LICENSE).
