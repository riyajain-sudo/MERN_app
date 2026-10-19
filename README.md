# TOURISM (MERN APP)

A full-stack MERN application where users can share places, descriptions, and images with other users.

## Overview

Tourism is a full-stack application built to understand and practice the real-world full-stack development concepts.
The project focuses on all CRUD methods, authentication, authorization, state management, backend API integration.
Users can add places they like along with basic details and view them within the application.

## Features
### Frontend
- User authentication (signup and login)
- Add new places with images and descriptions
- View places shared by other users
- Update and delete places added by the user
- Map/geocoding is currently disabled; the application does not fabricate or persist coordinates
- Client-side state management

### Backend
- RESTful API built with Node.js and Express
- CRUD operations for places
- User authentication and authorization
- Image upload handling
- Secure API endpoints
- MongoDB database integration

#### API Endpoints

<img width="1264" height="572" alt="{2665DBA5-5257-465A-AFD6-C8F987B41678}" src="https://github.com/user-attachments/assets/5432931c-91af-496e-abf8-dee1bf3273ea" />


## Tech Stack
### Frontend
- React
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js
- REST APIs

### Database
- MongoDB Atlas

### Other Tools & Services
- Git & GitHub


## How it works?
The application follows a typical MERN stack architecture where the frontend and backend communicate through RESTful APIs. Users interact with the React frontend, which sends requests to the backend server. The backend processes these requests, performs database operations, and sends responses back to the frontend.



## Local setup

Use Node.js 20.4 or newer. Install backend and frontend dependencies separately with their committed lockfiles:

```sh
cd backend && npm ci
cd ../frontend && npm ci
```

Start a MongoDB deployment that supports transactions (a replica set or sharded cluster is required by the current place create/delete flows). In a backend terminal, set `MONGODB_URI` to that database, set `JWT_SECRET` to a newly generated random value of at least 32 characters, and optionally set `PORT` (default `5000`), then run `npm start`. For a local Unix-like shell:

```sh
cd backend
export MONGODB_URI='mongodb://127.0.0.1:27017/mern'
export JWT_SECRET="$(node -e 'process.stdout.write(require("node:crypto").randomBytes(32).toString("hex"))')"
npm start
```

The example URI works only if local MongoDB meets the transaction requirement. `backend/.env.example` contains placeholders; the server reads process environment variables and does not automatically load `.env`. Startup refuses to connect if the URI or a sufficiently long signing secret is missing. Never reuse a secret that was committed in the past.

In another terminal, optionally set `REACT_APP_API_URL` (default `http://localhost:5000`) and run `npm start` from `frontend/`. Use a reachable backend URL for deployed browsers; `localhost` there refers to the visitor's own device. `frontend/.env.example` is a public, non-secret example. Uploaded images are stored under `backend/uploads/images/`; ensure that directory is writable by the backend process.

Run the focused offline backend regression tests with `cd backend && npm test`. They use mocked database models and do not contact MongoDB. Full end-to-end tests and a frontend build still require owner-provided database/configuration and frontend dependencies. Map rendering and geocoding need a real provider implementation and configuration before that UI is advertised again.

## Credential rotation required

A prior repository revision contained exposed database and JWT signing material. Rotating or removing source values does not revoke them: the owner must rotate/restrict the database credential in its authorized control plane, replace the JWT secret, and invalidate tokens signed with the old key. No live services were accessed as part of these changes.
