# Short-Video Learning Platform - Backend API

A production-ready, clean-architecture REST API backend built with **Node.js + Express + PostgreSQL**.

---

## 🏛️ Architecture Overview

This project strictly follows the **Clean Architecture / Layered Pattern** to decouple routing, transport, business rules, and data storage.

```mermaid
graph TD
    Client[Client Request] --> Routes[Routes Layer]
    Routes --> Controllers[Controllers Layer]
    Controllers --> Services[Services Layer]
    Services --> DB[Database Configuration]
    Services --> DB_Pool[pg Pool Setup]
```

### Layer Responsibilities
1. **App Entry (`server.js`)**: Starts the HTTP server, mounts common middlewares (JSON parser, CORS, static uploads), hooks route sub-systems, and registers the centralized error handler.
2. **Routes (`src/routes/*`)**: Define endpoint HTTP methods and paths. They map request paths to the respective controller actions, wrapped in an `asyncHandler`. Routes contain zero business logic or request parsing.
3. **Controllers (`src/controllers/*`)**: Extract parameters from `req.body`, `req.params`, or `req.query`, invoke the appropriate asynchronous Service logic, and build a unified JSON payload shape. Controllers do not use `try/catch`; they rely on the `asyncHandler` wrapper to forward errors to the Express error boundary.
4. **Services (`src/services/*`)**: House the core business rules and execute all direct, raw SQL database operations (using parameterized queries). Services throw structured Error instances with specific HTTP status codes (e.g., `409` or `401`), which are caught and formatted at the boundary.
5. **Database Configuration (`src/config/db.js`)**: Configures and exports the `pg.Pool` database connection pool. It dynamically resolves secure TLS/SSL configuration parameters for cloud-hosted environments like Neon/Supabase.

---

## ⚙️ Environment Variables (`.env`)

Create a `.env` file in the root of the `backend/` directory. You can copy the contents of `.env.example` as a starting point.

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string. Must include `sslmode=require` for Neon/Supabase. | `postgresql://postgres:postgres@localhost:5432/short_video_db` |
| `JWT_SECRET` | Secure secret string used to sign and verify JSON Web Tokens. | *Choose a long, random string* |
| `PORT` | Local port number for the Express server to listen on. | `3001` |
| `NODE_ENV` | Environment identifier (`development` or `production`). | `development` |

---

## 🚀 Setup & Database Installation

### 1. Database Provisioning (Neon / Supabase)

#### Option A: Neon (Recommended)
1. Go to [Neon.tech](https://neon.tech/) and sign up for a free account.
2. Create a new project named `short-video-learning-platform`.
3. In the Neon dashboard, copy the connection string under **Connection Details** (select the "Node.js" tab or just copy the URI).
4. Paste the connection string as `DATABASE_URL` inside `backend/.env`.

#### Option B: Supabase
1. Go to [Supabase.com](https://supabase.com/) and create a new project.
2. Go to **Project Settings** > **Database** > **Connection string** > **URI** and copy the URI.
3. Replace the password placeholder with your database password.
4. Paste the connection string as `DATABASE_URL` inside `backend/.env` (add `?sslmode=require` at the end).

### 2. Schema Installation

Initialize the database tables, indexes, and extensions directly by running the database initializer script:
```bash
npm run init-db
```
This reads and executes [schema.sql](schema.sql) against your database automatically.

---

## 🛠️ Running the Application

### 1. Install Dependencies
Run the installation command inside the `backend/` folder:
```bash
npm install
```

### 2. Seed Database
Execute the seed script to pre-populate the database with the initial 3 educational videos:
```bash
npm run seed
```

### 3. Start Development Server
Start the development server with hot-reloading enabled (via `nodemon`):
```bash
npm run dev
```
The server will start listening at `http://localhost:3001`.

---

## 📂 Adding Video Files Manually

The seed script registers references to three local video files:
* `/uploads/video1.mp4`
* `/uploads/video2.mp4`
* `/uploads/video3.mp4`

To test actual video playback on the frontend:
1. Locate or download three short `.mp4` video clips (e.g. from [Mixkit](https://mixkit.co/free-stock-video/)).
2. Rename them to `video1.mp4`, `video2.mp4`, and `video3.mp4`.
3. Place them directly inside the `backend/uploads/` directory.

These videos will be git-ignored automatically but will serve locally over `http://localhost:3001/uploads/videoX.mp4`.
