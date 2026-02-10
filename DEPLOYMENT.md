# RentNest – Production Deployment Guide

This guide walks you through deploying the full-stack MERN app **RentNest** so it is publicly accessible.

**Stack:**
- **Frontend:** React (Vite) + Tailwind CSS → **Vercel**
- **Backend:** Node.js + Express → **Render**
- **Database:** MongoDB Atlas (production)

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [MongoDB Atlas (Production Database)](#2-mongodb-atlas-production-database)
3. [Deploy Backend to Render](#3-deploy-backend-to-render)
4. [Deploy Frontend to Vercel](#4-deploy-frontend-to-vercel)
5. [Connect Frontend to Deployed Backend](#5-connect-frontend-to-deployed-backend)
6. [Environment Variables Reference](#6-environment-variables-reference)
7. [Final Testing Checklist](#7-final-testing-checklist)
8. [Security & Best Practices](#8-security--best-practices)

---

## 1. Prerequisites

- [Git](https://git-scm.com/) installed and project in a Git repo (GitHub/GitLab/Bitbucket).
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account.
- [Render](https://render.com/) account (backend).
- [Vercel](https://vercel.com/) account (frontend).
- Backend and frontend working locally (optional but recommended).

---

## 2. MongoDB Atlas (Production Database)

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create or select a **Cluster** (e.g. M0 free tier).
3. **Database Access** → Add user (username + password). Save the password.
4. **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`) for Render/Vercel.
5. **Connect** → **Drivers** → copy the connection string (e.g. `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/`).
6. Replace `<password>` with the real password and add database name:  
   `mongodb+srv://user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/rentnest?retryWrites=true&w=majority`  
   Use this as `MONGODB_URI` in Render.

---

## 3. Deploy Backend to Render

### 3.1 Push code to GitHub

Ensure your project is in a Git repo and pushed (e.g. to GitHub).  
**Do not commit `.env`** – use Render’s environment variables instead.

### 3.2 Create Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/).
2. **New** → **Web Service**.
3. Connect your Git provider and select the **RentNest** repository.
4. Configure:
   - **Name:** `rentnest-api` (or any name).
   - **Root Directory:** `Backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or paid if you prefer).

### 3.3 Environment variables (Render)

In the Web Service → **Environment** tab, add:

| Key             | Value                                                                 | Notes                    |
|-----------------|-----------------------------------------------------------------------|--------------------------|
| `NODE_ENV`      | `production`                                                          | Required                 |
| `PORT`          | `5000`                                                                | Render sets this; keep 5000 or leave default |
| `MONGODB_URI`   | `mongodb+srv://user:pass@cluster..../rentnest?retryWrites=true&w=majority` | From Atlas               |
| `JWT_SECRET`    | Long random string (e.g. 64 chars)                                    | **Never** use dev value  |
| `JWT_EXPIRE`    | `7d`                                                                  | Optional                 |
| `FRONTEND_URL`  | `https://YOUR_VERCEL_APP.vercel.app`                                 | Your Vercel URL (see §5) |

Optional (email):

- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`

Save. Render will redeploy.

### 3.4 Get backend URL

After deploy, Render gives a URL like:

- `https://rentnest-api.onrender.com`

**Backend API base URL:** `https://rentnest-api.onrender.com`  
(No `/api` in the base – your app uses `/api` in routes.)

---

## 4. Deploy Frontend to Vercel

### 4.1 Prepare frontend

- Ensure `frontend/package.json` has a **build** script: `"build": "vite build"` (Vite default).
- Do **not** commit `.env`. You will set `VITE_API_URL` in Vercel.

### 4.2 Import project on Vercel

1. Go to [Vercel](https://vercel.com/) and sign in (e.g. with GitHub).
2. **Add New** → **Project**.
3. Import the **RentNest** repo.
4. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 4.3 Environment variables (Vercel)

In **Settings** → **Environment Variables** add:

| Key             | Value                                      | Environment   |
|-----------------|--------------------------------------------|---------------|
| `VITE_API_URL`  | `https://rentnest-api.onrender.com/api`    | Production    |

Use your real Render backend URL. **Redeploy** after adding/changing env vars.

### 4.4 Deploy and get URL

Click **Deploy**. When finished, you get a URL like:

- `https://rentnest.vercel.app`  
(or `https://your-project-xxx.vercel.app`)

This is your **live frontend URL**.

---

## 5. Connect Frontend to Deployed Backend

1. **Backend (Render)**  
   In Render → your Web Service → **Environment**:
   - Set `FRONTEND_URL` = your Vercel URL (e.g. `https://rentnest.vercel.app`).  
   No trailing slash.

2. **Frontend (Vercel)**  
   In Vercel → Project → **Settings** → **Environment Variables**:
   - Set `VITE_API_URL` = `https://YOUR-RENDER-URL.onrender.com/api`  
   (with `/api` at the end).

3. **Redeploy both** after changing env vars:
   - Render: **Manual Deploy** or push a commit.
   - Vercel: **Redeploy** from Deployments.

---

## 6. Environment Variables Reference

### Backend (Render)

- **Local:** Copy `Backend/env.example` to `Backend/.env` and fill in values (do not commit `.env`).
- **Production:** Set the same keys in Render’s Environment tab (do not use `.env` on Render).

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<long-random-string>
JWT_EXPIRE=7d
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (Vercel)

- **Local:** Copy `frontend/env.example` to `frontend/.env` and set `VITE_API_URL=http://localhost:5000/api`.
- **Production:** Set in Vercel:

```env
VITE_API_URL=https://rentnest-api.onrender.com/api
```

For **local** development, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

**Important:** Never commit `.env` files. They are in `.gitignore`.

---

## 7. Final Testing Checklist

Before considering the app “live”:

### Backend (Render)

- [ ] Service is **Live** (green) on Render.
- [ ] **Health check:** open `https://YOUR-RENDER-URL.onrender.com/api/health` in browser → JSON with `status: 'OK'`.
- [ ] **Root:** `https://YOUR-RENDER-URL.onrender.com/` → JSON message (e.g. “RentNest API is running”).

### Frontend (Vercel)

- [ ] Build completed without errors.
- [ ] Site loads at your Vercel URL.
- [ ] No console errors about wrong API URL or CORS.

### Integration

- [ ] **Login:** Register/Login from the Vercel site works (hits Render API).
- [ ] **Protected routes:** After login, protected pages load (no CORS errors).
- [ ] **Data:** Listings/bookings (or any feature that uses DB) load from MongoDB Atlas.

### Security

- [ ] No secrets in frontend repo or in browser (no `JWT_SECRET`, `MONGODB_URI`, etc. in client code).
- [ ] `FRONTEND_URL` on Render matches your real Vercel URL (no typo, no trailing slash).

---

## 8. Security & Best Practices

1. **Secrets**
   - Use only **environment variables** for `JWT_SECRET`, `MONGODB_URI`, and any API keys.
   - Never commit `.env` or paste secrets in docs/README.

2. **CORS**
   - Backend is configured to allow only:
     - Local dev origins (`localhost:5173`, etc.)
     - The exact `FRONTEND_URL` you set on Render.
   - Keep `FRONTEND_URL` in sync with your real Vercel URL.

3. **MongoDB Atlas**
   - Use a strong DB user password.
   - In production, you can restrict **Network Access** to Render’s IPs if you switch to a paid plan and have static IPs; for free tier, `0.0.0.0/0` is common.

4. **JWT**
   - Use a long, random `JWT_SECRET` in production (e.g. 64 characters).
   - You can generate one with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

5. **HTTPS**
   - Render and Vercel serve over HTTPS. Use `https://` in `FRONTEND_URL` and `VITE_API_URL`.

---

## Quick Reference – Live URLs

After deployment:

| What        | URL |
|------------|-----|
| Frontend   | `https://YOUR-PROJECT.vercel.app` |
| Backend API| `https://YOUR-SERVICE.onrender.com` |
| API base (for frontend env) | `https://YOUR-SERVICE.onrender.com/api` |
| Health check | `https://YOUR-SERVICE.onrender.com/api/health` |

Replace placeholders with your actual Render and Vercel URLs.

---

## Troubleshooting

- **CORS errors in browser:**  
  Confirm `FRONTEND_URL` on Render matches the Vercel URL exactly (protocol, domain, no trailing slash). Redeploy backend after changing.

- **“Failed to fetch” / network errors:**  
  Confirm `VITE_API_URL` in Vercel is correct and includes `/api`. Redeploy frontend after changing.

- **Render free tier spins down:**  
  First request after idle can take 30–60 seconds. Consider upgrading or a small paid plan if you need always-on.

- **Build fails on Vercel:**  
  Check **Root Directory** is `frontend`, **Build Command** is `npm run build`, and that `package.json` has the correct `build` script.

---

Your RentNest app should now be production-ready and publicly accessible. Use the checklist in §7 to verify before sharing the live URL.
