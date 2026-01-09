import argon2 from 'argon2';
import Database from '../models/db/Database.js';
const database = new Database();
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { requireAdmin } from '../middleware/auth.js';

export const router = express.Router();
export const sessionLength = 7; // days

router.post('/login', async function (req, res) {
  if (req.username) {
    return res.status(403).json({ error: 'User already logged in!' });
  }
  if (!req.body) {
    return res.status(400).json({ error: 'Missing request body!' });
  }
  const username = req.body.username;
  if (!username) {
    return res.status(400).json({ error: 'Missing username!' });
  }
  const password = req.body.password;
  if (!password) {
    return res.status(400).json({ error: 'Missing password!' });
  }
  const user = await database.users.getUser(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username!' });
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
    res.cookie('session_id', session_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod (so we can test locally over HTTP)
      sameSite: 'strict',
      maxAge: sessionLengthMs,
      path: '/',
    });
    return res.sendStatus(200);
  } else {
    return res.status(401).json({ error: 'Invalid password!' });
  }
});

router.post('/logout', async function (req, res) {
  if (req.session_id) {
    await database.sessions.removeSession(req.session_id);
    res.clearCookie('session_id', { path: '/' });
  }
  return res.sendStatus(200);
});

router.post('/register', async function (req, res) {
  if (req.username) {
    return res.status(403).json({ error: 'User already logged in!' });
  }

  if (!req.body) {
    return res.status(400).json({ error: 'Missing request body!' });
  }

  const username = req.body.username;
  if (!username) {
    return res.status(400).json({ error: 'Missing username!' });
  }

  const email = req.body.email;
  if (!email) {
    return res.status(400).json({ error: 'Missing email!' });
  }

  const password = req.body.password;
  if (!password) {
    return res.status(400).json({ error: 'Missing password!' });
  }

  if (username.length > 25) {
    return res.status(400).json({ error: 'Username too long! (max 25 characters)' });
  }

  if (await database.users.getUser(username)) {
    return res.status(409).json({ error: 'Username already taken!' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password too short! (min 6 characters)' });
  }

  let hasDigit = false;
  let hasLetter = false;
  for (const ch of password) {
    if (/[0-9]/.test(ch)) hasDigit = true;
    if (/[A-Za-z]/.test(ch)) hasLetter = true;
  }
  if (!hasDigit) {
    return res.status(400).json({ error: 'Password must contain at least one digit!' });
  }
  if (!hasLetter) {
    return res.status(400).json({ error: 'Password must contain at least one ASCII letter!' });
  }

  const HTML5_EMAIL_RE =
    /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;
  if (!HTML5_EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email address!' });
  }

  if (await database.users.getUserByEmail(email)) {
    return res.status(409).json({ error: 'Account with this email already exists!' });
  }

  const passwordHash = await argon2.hash(password);

  await database.users.createUser(username, email, passwordHash);

  return res.sendStatus(201);
});

router.get('/me', async function (req, res) {
  if (req.username) {
    const user = await database.users.getUser(req.username);
    return res.status(200).json({
      username: user.username,
      email: user.email,
      bio: user.bio,
      profilePicture: user.profilePicture,
      role: user.role,
    });
  } else {
    return res.status(401).json({ error: 'User not logged in!' });
  }
});

router.put('/profile', async function (req, res) {
  if (!req.username) {
    return res.status(401).json({ error: 'User not logged in!' });
  }

  const { bio, profilePicture } = req.body;

  if (bio === undefined && profilePicture === undefined) {
    return res.status(400).json({ error: 'No data to update!' });
  }

  try {
    const user = await database.users.getUser(req.username);
    const newBio = bio !== undefined ? bio : user.bio;
    const newProfilePicture = profilePicture !== undefined ? profilePicture : user.profilePicture;

    await database.users.updateUserProfile(req.username, newBio, newProfilePicture);

    return res.status(200).json({
      username: req.username,
      email: user.email,
      bio: newBio,
      profilePicture: newProfilePicture,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update profile!' });
  }
});

// Admin endpoints
router.get('/users', requireAdmin, async function (req, res) {
  try {
    const users = await database.users.getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users!' });
  }
});

router.put('/users/:username/role', requireAdmin, async function (req, res) {
  const { username } = req.params;
  const { role } = req.body;

  // Prevent admin from changing their own role
  if (username === req.username) {
    return res
      .status(400)
      .json({
        error: 'You cannot change your own role! You can change roles just for other users!',
      });
  }

  if (!role) {
    return res.status(400).json({ error: 'Role is required!' });
  }

  if (!['USER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be USER or ADMIN' });
  }

  try {
    await database.users.updateUserRole(username, role);
    const updatedUser = await database.users.getUser(username);

    return res.status(200).json({
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found!' });
    }
    console.error('Error updating user role:', error);
    return res.status(500).json({ error: 'Failed to update user role!' });
  }
});
