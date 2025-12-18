import Questions from "./tables/Questions.js";
import QuestionSets from "./tables/QuestionSets.js";
import Sessions from "./tables/Sessions.js";
import Users from "./tables/Users.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import sqlite3import from "sqlite3";
const sqlite3 = sqlite3import.verbose();

const __dirname = path.dirname(fileURLToPath(import.meta.url));


let db = null;
function getDb() {
    if (!db) {
        // connect to SQLite database
        db = new sqlite3.Database(path.join(__dirname, './db.sqlite'), (err) => {
            if (err) {
                console.error('Could not connect to database: ', err);
                db = null;
            }
        });
        // execute everything in serialized mode
        db.serialize();
        // initialize database schema
        const schemaPath = path.join(__dirname, './schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schemaSQL, (err) => {
            if (err) {
                console.error('Could not initialize database schema: ', err);
            }
        });
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
