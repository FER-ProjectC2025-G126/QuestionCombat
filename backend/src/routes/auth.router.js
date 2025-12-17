import argon2 from "argon2";
import { Database } from "../models/Database.js";
const database = new Database();
import express from "express";
import { v4 as uuidv4 } from "uuid";

export const router = express.Router();
export const sessionLength = 7; // days

router.post("/login", async function (req, res) {
  if (req.username) {
    return res.status(403).json({ error: "User already logged in!" });
  }
  if (!req.body) {
    return res.status(400).json({ error: "Missing request body!" });
  }
  const username = req.body.username;
  if (!username) {
    return res.status(400).json({ error: "Missing username!" });
  }
  const password = req.body.password;
  if (!password) {
    return res.status(400).json({ error: "Missing password!" });
  }
  const user = await database.users.getUser(username);
  if (!user) {
    return res.status(401).json({ error: "Invalid username!" });
  }
  if (await argon2.verify(user.passwordHash, password)) {
    // the password is correct, create session
    let session_id = uuidv4();
    while (await database.sessions.getSession(session_id)) {
      session_id = uuidv4();
    }
    const sessionLengthMs = sessionLength * 24 * 60 * 60 * 1000; // sessionLength in ms
    const expiresAt = new Date(Date.now() + sessionLengthMs).toISOString();
    await database.sessions.createSession(session_id, username, expiresAt);
    res.cookie("session_id", session_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod (so we can test locally over HTTP)
      sameSite: "strict",
      maxAge: sessionLengthMs,
      path: "/",
    });
    return res.sendStatus(200);
  } else {
    return res.status(401).json({ error: "Invalid password!" });
  }
});

router.post("/logout", async function (req, res) {
  if (req.session_id) {
    await database.sessions.removeSession(req.session_id);
    res.clearCookie("session_id", { path: "/" });
  }
  return res.sendStatus(200);
});

router.post("/register", async function (req, res) {
  if (req.username) {
    return res.status(403).json({ error: "User already logged in!" });
  }

  if (!req.body) {
    return res.status(400).json({ error: "Missing request body!" });
  }

  const username = req.body.username;
  if (!username) {
    return res.status(400).json({ error: "Missing username!" });
  }

  const email = req.body.email;
  if (!email) {
    return res.status(400).json({ error: "Missing email!" });
  }

  const password = req.body.password;
  if (!password) {
    return res.status(400).json({ error: "Missing password!" });
  }

  if (username.length > 32) {
    return res
      .status(400)
      .json({ error: "Username too long! (max 32 characters)" });
  }

  if (await database.users.getUser(username)) {
    return res.status(409).json({ error: "Username already taken!" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password too short! (min 6 characters)" });
  }

  let hasDigit = false;
  let hasLetter = false;
  for (let ch of password) {
    if (/[0-9]/.test(ch)) hasDigit = true;
    if (/[A-Za-z]/.test(ch)) hasLetter = true;
  }
  if (!hasDigit) {
    return res
      .status(400)
      .json({ error: "Password must contain at least one digit!" });
  }
  if (!hasLetter) {
    return res
      .status(400)
      .json({ error: "Password must contain at least one ASCII letter!" });
  }

  const HTML5_EMAIL_RE =
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
  if (!HTML5_EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Invalid email address!" });
  }

  const passwordHash = await argon2.hash(password);

  await database.users.createUser(username, email, passwordHash);

  return res.sendStatus(201);
});

router.get("/me", async function (req, res) {
  if (req.username) {
    const user = await database.users.getUser(req.username);
    return res.status(200).json({ username: user.username, email: user.email });
  } else {
    return res.status(401).json({ error: "User not logged in!" });
  }
});
