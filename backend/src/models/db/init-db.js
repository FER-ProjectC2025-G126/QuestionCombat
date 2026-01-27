import sqlite3import from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import walk from '../../utils/walkDirTree.js';
import argon2 from 'argon2';
import Users from './tables/Users.js';
import Questions from './tables/Questions.js';
import QuestionSets from './tables/QuestionSets.js';
const sqlite3 = sqlite3import.verbose();
const __dirname = path.dirname(fileURLToPath(import.meta.url));


const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_EMAIL = 'admin@questioncombat.azurewebsites.net';
const DEFAULT_ADMIN_PASSWORD = 'adminQC123';


export async function initDb(db) {
  // database schema
  const schemaPath = path.join(__dirname, './schema.sql');
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

  // initialize database schema
  await db.exec(schemaSQL, (err) => {
    if (err) {
      console.error('Could not initialize database schema: ', err);
    }
  });

  // initial questions
  const questionsDir = path.join(__dirname, '../../../../questionsAI');

  // fill database with initial questions from questionsAI directory
  await walk(questionsDir, async (file) => {
    const questionSetJSON = JSON.parse(fs.readFileSync(file, 'utf8'));
    const questionSet = new QuestionSets(db);
    const questions = new Questions(db);
    await questionSet
      .createQuestionSet(questionSetJSON.title, questionSetJSON.description)
      .then((questionSetId) => {
        const questionsPromises = questionSetJSON.questions.map((q) => {
          const text = q.question;
          const answers = [
            q['answers']['a'],
            q['answers']['b'],
            q['answers']['c'],
            q['answers']['d'],
          ];
          let correct;
          switch (q['correct']) {
            case 'a':
              correct = 0;
              break;
            case 'b':
              correct = 1;
              break;
            case 'c':
              correct = 2;
              break;
            case 'd':
              correct = 3;
              break;
            default:
              throw new Error(`Invalid correct answer: ${q['correct']}`);
          }
          return questions.createQuestion(questionSetId, text, answers, correct);
        });
        return Promise.all(questionsPromises);
      });
  });

  // add a default admin user
  const users = new Users(db);
  await argon2.hash(DEFAULT_ADMIN_PASSWORD).then((hashedPassword) => {
    return users.createUser(DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_EMAIL, hashedPassword, true);
  });
}

// if run directly as a script, reset and initialize the database
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dbPath = path.join(__dirname, '../../../../instance/db.sqlite');
  const isNewDb = !fs.existsSync(dbPath);

  let db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Could not connect to database: ', err);
      db = null;
    }
  });

  db.serialize();

  if (!isNewDb) {
    db.exec('DROP TABLE IF EXISTS sessions;');
    db.exec('DROP TABLE IF EXISTS users;');
    db.exec('DROP TABLE IF EXISTS question_sets;');
    db.exec('DROP TABLE IF EXISTS questions;');
    db.exec('DROP TABLE IF EXISTS question_options;');
    console.log('Database reset: All tables dropped.');
  }

  initDb(db)
    .then(() => {
      console.log('Database initialized.');
      db.close((err) => {
        if (err) {
          console.error('Error closing the database connection: ', err);
        } else {
          console.log('Database connection closed.');
        }
      });
    })
    .catch((err) => {
      console.error('Error initializing the database: ', err);
    });
}
