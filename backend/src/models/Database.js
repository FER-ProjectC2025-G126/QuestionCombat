import path from "path";
import { fileURLToPath } from "url";
import sqlite3import from "sqlite3";
const sqlite3 = sqlite3import.verbose();

const __dirname = path.dirname(fileURLToPath(import.meta.url));


let db = null;
function getDb() {
    if (!db) {
        db = new sqlite3.Database(path.join(__dirname, '../../db.sqlite'), (err) => {
            if (err) {
                console.error('Could not connect to database: ', err);
                db = null;
            } else {
                db.run("CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, email TEXT NOT NULL, password_hash TEXT NOT NULL)");
                db.run("CREATE TABLE IF NOT EXISTS sessions (sid TEXT PRIMARY KEY, username TEXT NOT NULL, expires_at TEXT NOT NULL)");
            }
        });
    }
    return db;
}


export class Database {
    constructor() {
        this.db = getDb();
    }

    get sessions() {
        return new Sessions();
    }

    get users() {
        return new Users();
    }
}

class Sessions extends Database {
    constructor() {
        super();
    }

    getSession(sid) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM sessions WHERE sid = ?", [sid], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    resolve(null);
                } else {
                    resolve({session_id: row["sid"], username: row["username"], expiresAt: row["expires_at"]});
                }
            });
        });
    }

    createSession(sid, username, expiresAt) {
        return new Promise((resolve, reject) => {
            this.db.run("INSERT INTO sessions (sid, username, expires_at) VALUES (?, ?, ?)", [sid, username, expiresAt], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    updateSession(sid, newExpiresAt) {
        return new Promise((resolve, reject) => {
            this.db.run("UPDATE sessions SET expires_at = ? WHERE sid = ?", [newExpiresAt, sid], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        })
    }

    removeSession(sid) {
        return new Promise((resolve, reject) => {
            this.db.run("DELETE FROM sessions WHERE sid = ?", [sid], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

class Users extends Database {
    constructor() {
        super();
    }

    getUser(username) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    resolve(null);
                } else {
                    resolve({
                        username: row["username"],
                        email: row["email"],
                        passwordHash: row["password_hash"]
                    });
                }
            });
        });
    }

    createUser(username, email, passwordHash) {
        return new Promise((resolve, reject) => {
            this.db.run("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", [username, email, passwordHash], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}


// Periodic cleanup of expired sessions
setInterval(() => {
    const dbInstance = getDb();
    const now = new Date().toISOString();
    dbInstance.run("DELETE FROM sessions WHERE expires_at < ?", [now]);
}, 60 * 60 * 1000);  // every hour
