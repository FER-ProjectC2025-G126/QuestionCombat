// library imports
import cookieParser from "cookie-parser";
import express from "express";
import http from "http";
import minimist from "minimist";
import path from "path";
import { Server } from "socket.io";
import { fileURLToPath } from "url";

// cli arguments
const argv = minimist(process.argv.slice(2));

// __dirname replacement for ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// database
import Database from "./models/db/Database.js";
const database = new Database();

// socketio connection manager
import UserManager from "./sockets/UserManager.js";

// route imports
import { router as authRouter, sessionLength } from "./routes/auth.router.js";
import { router as publicRouter } from "./routes/public.router.js";

// server setup
const app = express();
const server = http.createServer(app);
const io = new Server(server);



// EXPRESS

// express middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// parse authentication cookie
app.use("/api", async function (req, res, next) {
  req.session_id = null;
  req.username = null;
  const session_id = req.cookies["session_id"];
  if (session_id) {
    let session = await database.sessions.getSession(session_id);
    if (session && session.expiresAt > new Date().toISOString()) {
      // extend session
      let sessionLengthMs = sessionLength * 24 * 60 * 60 * 1000; // sessionLength in ms
      await database.sessions.updateSession(
        session_id,
        new Date(Date.now() + sessionLengthMs).toISOString()
      );
      res.cookie("session_id", session_id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS only in prod (so we can test locally over HTTP)
        sameSite: "strict",
        maxAge: sessionLengthMs,
        path: "/",
      });
      req.username = session.username;
      req.session_id = session_id;
    }
  }
  next();
});

// api routes
app.use("/api/auth", authRouter);
app.use("/api/public", publicRouter);

// api 404 handler
app.use("/api", function (req, res) {
  return res.status(404).json({ error: "API endpoint not found!" });
});

// if in production mode, serve frontend static files
// (if in dev, the frontend is running separately with its own webpack dev server)
if (argv.mode === "prod") {
  const frontendPath = path.join(__dirname, "..", "..", "frontend", "dist");
  app.use(express.static(frontendPath));
  app.use("/*any", function (req, res) {
    return res.sendFile(path.join(frontendPath, "index.html"));
  });
}



// SOCKET.IO

// initialize user manager (handles users connected via socket.io)
const userManager = new UserManager(io);

// middleware to parse cookies and authenticate
io.engine.use(cookieParser());
io.engine.use(async (req, res, next) => {
  req.username = null;
  // only run for handshake requests without sid (new connections)
  if (req._query.sid === undefined) {
    const session_id = req.cookies["session_id"];
    if (session_id) {
      let session = await database.sessions.getSession(session_id);
      if (session && session.expiresAt > new Date().toISOString()) {
        req.username = session.username;
      }
    }
  }
  next();
})

// Socket.io connection handler
io.on('connection', (socket) => {
  if (!socket.request.username) {
    console.log('Unauthenticated user attempted to connect via Socket.io');
    return socket.disconnect(true);
  }
  userManager.connectUser(socket.request.username, socket);
});



// START SERVER
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}!`);
});
