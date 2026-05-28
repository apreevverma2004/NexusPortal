# NexusPortal — Angular 18 + Node.js/TypeScript RBAC Application

## Overview
NexusPortal is a full-stack Single Page Application (SPA) built with **Angular 18** (frontend) and **Node.js + TypeScript** (backend). It implements Role-Based Access Control (RBAC) with two roles: **Admin** and **General User**.

---

## Project Structure

```
NexusPortal/
├── artifacts/
│   ├── angular-app/          ← Angular 18 Frontend
│   │   └── src/app/
│   │       ├── core/
│   │       │   └── services/
│   │       │       ├── auth.service.ts
│   │       │       ├── records.service.ts
│   │       │       └── user.service.ts
│   │       └── pages/
│   │           ├── login/
│   │           ├── dashboard/
│   │           └── admin/
│   └── api-server/           ← Node.js + TypeScript Backend
│       └── src/
│           ├── routes/
│           │   ├── auth.ts
│           │   ├── records.ts
│           │   └── users.ts
│           └── index.ts
```

---

## Features

### 1. Login Page
- User ID, Password and Role (Admin / General User) fields
- Role-based authentication with JWT-style token sessions
- Demo credentials shown on login page
- Error handling for invalid credentials and inactive accounts

### 2. Dashboard (Logged In Page)
- Displays logged-in user details (name, email, role, department)
- Fetches records from API based on user role
- **Admin** sees all 12 records
- **General User** sees only their own records
- Records table with status, priority, category, access level columns
- Async delay demo — add `?delay=2000` to simulate API latency

### 3. Admin Panel (Admin only)
- Full User Management (Create, Read, Update, Delete)
- View all users with role and status
- Toggle user active/inactive status
- Protected route — redirects non-admins

### 4. Async Processing Demo
- Records API supports `?delay=N` parameter (max 10 seconds)
- Showcases async/await processing in the application
- Loading indicators during API calls

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | Angular 18, Angular Material, RxJS 7    |
| Backend   | Node.js, Express 5, TypeScript          |
| Auth      | Token-based sessions (in-memory store)  |
| Storage   | In-memory data store (Map)              |
| Build     | pnpm workspaces, esbuild                |

---

## Prerequisites

- Node.js >= 20.x
- pnpm 9.x

---

## Installation & Running Commands

### Step 1 — Add pnpm to PATH (run once per terminal session)
```bash
export PATH="$HOME/.npm-global/bin:$PATH"
```

To make permanent (run once):
```bash
echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Step 2 — Install pnpm (if not installed)
```bash
npm install -g pnpm@9
```

### Step 3 — Install all dependencies (from NexusPortal root)
```bash
cd NexusPortal
pnpm install
```

### Step 4 — Start Backend (Terminal 1)
```bash
cd NexusPortal/artifacts/api-server
export PATH="$HOME/.npm-global/bin:$PATH"
PORT=3000 pnpm dev
```

**Wait for:**
```
Server listening  port: 3000
```

### Step 5 — Start Frontend (Terminal 2)
```bash
cd NexusPortal/artifacts/angular-app
export PATH="$HOME/.npm-global/bin:$PATH"
pnpm dev
```

**Wait for:**
```
✔ Compiled successfully.
** Angular Live Development Server is listening on 0.0.0.0:4200 **
```

### Step 6 — Open Browser
```
http://localhost:4200
```

---

## Demo Credentials

| User ID | Password  | Role         | Department      | Access                        |
|---------|-----------|--------------|-----------------|-------------------------------|
| `admin` | `admin123` | Admin        | IT Operations   | All records + User Management |
| `alice` | `user123`  | General User | Marketing       | Own records only              |
| `bob`   | `user123`  | General User | Engineering     | Own records only              |
| `carol` | `user123`  | General User | Finance         | Own records only              |
| `dave`  | `user123`  | General User | Human Resources | Inactive account              |

---

## API Endpoints

| Method | Endpoint           | Auth    | Description                          |
|--------|--------------------|---------|--------------------------------------|
| POST   | /api/auth/login    | —       | Login, returns token + user          |
| GET    | /api/auth/me       | Bearer  | Get current user profile             |
| POST   | /api/auth/logout   | Bearer  | Logout, invalidates token            |
| GET    | /api/records       | Bearer  | Get records (role-filtered)          |
| GET    | /api/records?delay=N | Bearer | Get records with artificial delay  |
| GET    | /api/admin/users   | Admin   | List all users                       |
| POST   | /api/admin/users   | Admin   | Create new user                      |
| PUT    | /api/admin/users/:id | Admin | Update user                         |
| DELETE | /api/admin/users/:id | Admin | Delete user                         |
| GET    | /api/health        | —       | Health check                         |

---

## Quick Start (One Command)

From NexusPortal root folder:

```bash
export PATH="$HOME/.npm-global/bin:$PATH"
pnpm install
# Terminal 1
PORT=3000 pnpm --filter @workspace/api-server dev
# Terminal 2 (new window)
pnpm --filter @workspace/angular-app dev
```

---

## Keep Both Terminals Running

> ⚠️ **Never close Terminal 1 (backend) or Terminal 2 (frontend)** while using the app. Both must be running simultaneously.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `pnpm: command not found` | Run `export PATH="$HOME/.npm-global/bin:$PATH"` |
| `PORT env variable required` | Run `PORT=3000 pnpm dev` instead of `pnpm dev` |
| Login failed | Use exact credentials from table above |
| Blank dashboard | Check backend terminal — must show `Server listening port: 3000` |
| `ng: command not found` | Run `pnpm install` first from project root |









<img width="1567" height="917" alt="1" src="https://github.com/user-attachments/assets/4936da1c-274e-4da5-95f0-0a23ae1e2d65" />
<img width="1661" height="900" alt="2" src="https://github.com/user-attachments/assets/79c1e7c6-2d45-4246-8513-d4449720dec8" />

