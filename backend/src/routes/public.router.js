import Database from '../models/db/Database.js';
const database = new Database();
import express from 'express';

export const router = express.Router();

router.get('/question_sets', async function (req, res) {
  const questionSets = await database.question_sets.listQuestionSets();
  return res.status(200).json(questionSets);
});

router.get("/profImg/:username", async function (req, res) {
  const reqUser = req.params.username;
  const usersDb = database.users;
  try {
    const user = await usersDb.getUser(reqUser);
    if (user && user.profilePicture) {
      res.status(200).json({
        profilePicture: user.profilePicture
      })
    } else {
      res.status(404).json({ error: 'Profile picture not found!' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve profile picture!' });
  }
})
