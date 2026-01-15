# QuestionCombat Architecture Guide

This guide explains the project structure, runtime flow, and how REST + Socket.IO work together. It is written for teammates who know JavaScript but are new to real-time systems.

## 1) System Structure

- **Backend**: Node.js + Express for REST; Socket.IO for realtime; in-memory game engine (UserManager, Room); SQLite for users, sessions, question sets/questions.
- **Frontend**: React + Vite + React Router. Uses Axios for REST and Socket.IO client for realtime room/game state.
- **Database**: SQLite tables for users, sessions, question_sets, questions, etc. Session cookie (`session_id`) authenticates both REST and sockets.
- **Separation**: REST = auth and public data. WebSockets = live rooms, turns, game state.

## 2) Game Lifecycle (happy path)

1. **Login (REST)**: `POST /api/auth/login` → sets HTTP-only `session_id` cookie.
2. **Socket connect**: Client connects with cookie; server authenticates and places user in lobby; sends lobby `stateUpdate`.
3. **Room creation (WS)**: Client emits `createRoom(maxPlayers, isPrivate, questionSetIds)`; server makes Room, joins creator, emits room `stateUpdate`.
4. **Game start**: When enough players join, server marks started and begins room update loop.
5. **Turns**: Server tracks `_turn`, timers, and state (`choice`, `answer`, `review`). Clients emit actions (e.g., `submitAnswer`); server validates, updates, broadcasts `stateUpdate`.
6. **Game end**: Server computes `_lastGameStats`, emits final `stateUpdate`; players can return to lobby or view stats.

## 3) Socket.IO Conceptual Model

- **Server**: authenticates sockets via cookie, joins them to rooms (lobby or game), listens for events (`createRoom`, `joinRoom`, `submitAnswer`), broadcasts `stateUpdate` to room.
- **Client**: connects with credentials, listens to `stateUpdate`, renders state, emits user intents. Client never decides game outcome.
- **Event flow example**: Client `createRoom` → Server creates room + adds player → Server emits `stateUpdate` → Clients render.

## 4) Backend State Management

- **UserManager**: maps username ↔ sockets; tracks which room a user is in.
- **Room**: holds players, questions, timers, `_turn`, `_state`, `_lastGameStats`; runs an update loop (e.g., 20 tps) and emits `stateUpdate`.
- **Authoritative state**: Lives in memory; DB is for persistence (users/sessions/content). Server validates all actions.
- **Safety**: Guards prevent crashes if no question sets exist; timers and turns live on the server to prevent cheating.

## 5) REST + WebSockets Together

- **REST**: login/register/logout/me; fetch public question sets.
- **WebSockets**: everything realtime (rooms, lobby feed, turns, actions, game updates).
- **Mental model**: REST for slow, one-off setup; WebSockets for fast, frequent updates.

## 6) Minimal Sequence Examples

- Login: `POST /api/auth/login` → cookie set → client can open socket.
- Connect socket: `io(VITE_WS_URL, { withCredentials: true })` → server authenticates and joins lobby.
- Join/create: emit `joinRoom(name)` or `createRoom(maxPlayers, isPrivate, questionSetIds)` → server updates room and broadcasts `stateUpdate`.
- Play: emit `chooseQuestion` / `submitAnswer` → server validates, updates, emits `stateUpdate`.
- End: server detects end condition, sets `_lastGameStats`, emits final `stateUpdate`.

## 7) Operational Notes

- **Seeding data**: Ensure at least one question set exists. If none, room creation will log an error. Use `schema.sql`/`placeholders.sql` or a small seed script to insert a default question set and its questions.
- **CORS/WS**: Keep `CORS_ORIGIN` and `CLIENT_ORIGIN` aligned with the frontend URL; clients must connect with `withCredentials: true` so cookies are sent.
- **Error handling**: If sockets fail to connect, check origin settings and session cookie. If rooms fail to load questions, check that question sets exist.

## 8) What happens on failure (recent crash case)

- When the DB had zero question sets, `Room` tried to pick a random set and crashed. Now it logs a clear error and keeps running, but you still need to seed at least one question set.

Use this guide to onboard quickly: REST for auth/setup, Socket.IO for gameplay, server as the single source of truth, and always seed question content before creating rooms.

## 9) Build Steps From Scratch (modern flow)

1. **Repo & tooling**: Init git; add root .gitignore; add Prettier + ESLint (flat config) for both backend and frontend. 
Files: [.gitignore](.gitignore), [backend/eslint.config.js](backend/eslint.config.js), [frontend/eslint.config.js](frontend/eslint.config.js), [.prettierrc](.prettierrc).

2. **Backend scaffold**: npm init; install express, socket.io, cookie-parser, minimist, sqlite3, argon2; add nodemon for dev; create server. 
Files: [backend/src/server.js](backend/src/server.js), [backend/package.json](backend/package.json).

3. **Env & config**: Add backend .env/.env.example with PORT, DATABASE_URL, SESSION_LENGTH, CORS_ORIGIN, CLIENT_ORIGIN. 
Files: [backend/.env.example](backend/.env.example), [backend/.env](backend/.env).

4. **Database**: Write schema and helper; seed at least one question set. 
Files: [backend/src/models/db/schema.sql](backend/src/models/db/schema.sql), [backend/src/models/db/Database.js](backend/src/models/db/Database.js), [backend/src/models/db/placeholders.sql](backend/src/models/db/placeholders.sql).

5. **Auth REST**: Routes for register/login/logout/me; set HTTP-only session_id cookie; middleware on /api. 
Files: [backend/src/routes/auth.router.js](backend/src/routes/auth.router.js), [backend/src/server.js](backend/src/server.js).

6. **Public REST**: Route to list question sets for the public page. 
Files: [backend/src/routes/public.router.js](backend/src/routes/public.router.js).

7. **Socket layer**: Init Socket.IO with CORS/credentials; authenticate via session cookie; map users to sockets. 
Files: [backend/src/server.js](backend/src/server.js), [backend/src/sockets/UserManager.js](backend/src/sockets/UserManager.js).

8. **Game model**: Implement room logic (players, questions, timers, turns, stateUpdate). 
Files: [backend/src/models/Room.js](backend/src/models/Room.js), tables for users/sessions/question sets/questions under [backend/src/models/db/tables](backend/src/models/db/tables).

9. **Frontend scaffold**: Vite + React + React Router; axios + socket.io-client; Vite proxy. 
Files: [frontend/vite.config.js](frontend/vite.config.js), [frontend/package.json](frontend/package.json), [frontend/index.html](frontend/index.html), [frontend/src/index.jsx](frontend/src/index.jsx), [frontend/src/api/api.js](frontend/src/api/api.js).

10. **Frontend auth**: AuthProvider with /auth/me; pages Login/SignUp; guards PublicOnly/RequireAuth. 
Files: [frontend/src/features/auth/AuthProvider.jsx](frontend/src/features/auth/AuthProvider.jsx), [frontend/src/features/auth/Login.jsx](frontend/src/features/auth/Login.jsx), [frontend/src/features/auth/SignUp.jsx](frontend/src/features/auth/SignUp.jsx), [frontend/src/features/auth/PublicOnly.jsx](frontend/src/features/auth/PublicOnly.jsx), [frontend/src/features/auth/RequireAuth.jsx](frontend/src/features/auth/RequireAuth.jsx).

11. **Sockets on client**: SocketProvider connects with credentials, listens to stateUpdate, exposes joinRoom/createRoom/leaveRoom. 
Files: [frontend/src/features/socket/SocketProvider.jsx](frontend/src/features/socket/SocketProvider.jsx), [frontend/src/features/socket/SocketContext.jsx](frontend/src/features/socket/SocketContext.jsx), [frontend/src/features/socket/useSocket.js](frontend/src/features/socket/useSocket.js).

12. **UI pages**: Public, Home, CreateNewGame, JoinGame, Lobby, NotFound; shared layout components. 
Files: [frontend/src/pages/Public.jsx](frontend/src/pages/Public.jsx), [frontend/src/pages/Home.jsx](frontend/src/pages/Home.jsx), [frontend/src/features/rooms/createNewGame.jsx](frontend/src/features/rooms/createNewGame.jsx), [frontend/src/features/rooms/joinGame.jsx](frontend/src/features/rooms/joinGame.jsx), [frontend/src/features/rooms/Lobby.jsx](frontend/src/features/rooms/Lobby.jsx), [frontend/src/pages/NotFound.jsx](frontend/src/pages/NotFound.jsx), [frontend/src/components/Button1.jsx](frontend/src/components/Button1.jsx), [frontend/src/components/LogoutButton.jsx](frontend/src/components/LogoutButton.jsx), [frontend/src/App.jsx](frontend/src/App.jsx).

13. **Styling**: Global main.scss for fonts/container/loader; per-page CSS. 
Files: [frontend/src/styles/main.scss](frontend/src/styles/main.scss), page styles under [frontend/src/styles](frontend/src/styles).

14. **Testing & QA**: Run lint/format; seed DB; start dev servers; click through login → create/join → lobby. Commands: `npm run lint` / `npm run format` in frontend and backend; ensure DB seeded (placeholders.sql or manual insert).

15. **Deploy**: Build frontend (`npm run build` in frontend or root production script); serve dist via backend in prod mode; set CORS_ORIGIN/CLIENT_ORIGIN to deployed URL.
