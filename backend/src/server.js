import cookieParser from "cookie-parser";
import express from "express";
import minimist from "minimist";
import path from "path";
import { fileURLToPath } from "url";

const argv = minimist(process.argv.slice(2));
const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { Database } from "./models/Database.js";
const database = new Database();

import { router as authRouter, sessionLength } from "./routes/auth.router.js";

const app = express();

// middleware
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
        path: "/api",
      });
      req.username = session.username;
      req.session_id = session_id;
    }
  }
  next();
});

// api routes
app.use("/api/auth", authRouter);

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

// start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}!`);
});
