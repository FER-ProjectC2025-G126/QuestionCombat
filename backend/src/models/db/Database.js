import Questions from './tables/Questions.js';
import QuestionSets from './tables/QuestionSets.js';
import Sessions from './tables/Sessions.js';
import Users from './tables/Users.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sqlite3import from 'sqlite3';
const sqlite3 = sqlite3import.verbose();
import walk from "../../utils/walkDirTree.js"
import argon2 from 'argon2';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


const DEFAULT_ADMIN_USERNAME = 'admin';
const DEFAULT_ADMIN_EMAIL = "admin@questioncombat.azurewebsites.net"
const DEFAULT_ADMIN_PASSWORD = 'adminQC123';


let db = null;
function getDb() {
  if (!db) {
    const dbPath = path.join(__dirname, '../../../../instance/db.sqlite');
    const isNewDb = !fs.existsSync(dbPath);

    // ensure directory exists
    const dbDir = path.dirname(dbPath);
    fs.mkdirSync(dbDir, { recursive: true });

    // connect to SQLite database (file will be created if not exists)
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Could not connect to database: ', err);
        db = null;
      }
    });

    // execute everything in serialized mode
    db.serialize();

    if (isNewDb) {
      // database schema
      const schemaPath = path.join(__dirname, './schema.sql');
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

      // initialize database schema
      db.exec(schemaSQL, (err) => {
        if (err) {
          console.error('Could not initialize database schema: ', err);
        }
      });

      // initial questions
      const questionsDir = path.join(__dirname, '../../../../questionsAI');

      // fill database with initial questions from questionsAI directory
      walk(questionsDir, (file) => {
        const questionSetJSON = JSON.parse(fs.readFileSync(file, 'utf8'));
        const questionSet = new QuestionSets(db);
        const questions = new Questions(db);
        questionSet
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
      argon2.hash(DEFAULT_ADMIN_PASSWORD).then((hashedPassword) => {
        return users.createUser(DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_EMAIL, hashedPassword, true);
      });
    }
  }
  return db;
}

export default class Database {
  constructor() {
    this.db = getDb();
  }

  get sessions() {
    return new Sessions(this.db);
  }

  get users() {
    return new Users(this.db);
  }

  get question_sets() {
    return new QuestionSets(this.db);
  }

  get questions() {
    return new Questions(this.db);
  }
}

// periodic cleanup of expired sessions
const cleanupIntervalMs = 60 * 60 * 1000; // 1 hour
const sessions = new Database().sessions;
setInterval(() => sessions.cleanExpiredSessions(), cleanupIntervalMs);
