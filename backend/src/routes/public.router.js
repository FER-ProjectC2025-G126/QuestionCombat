import Database from "../models/db/Database.js";
const database = new Database();
import express from "express";

export const router = express.Router();

router.get("/question_sets", async function (req, res) {
    const questionSets = await database.question_sets.listQuestionSets();
    return res.status(200).json(questionSets);
});
