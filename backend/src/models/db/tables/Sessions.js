export default class Sessions {
    constructor(db) {
        this.db = db;
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

    cleanExpiredSessions() {
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString();
            this.db.run("DELETE FROM sessions WHERE expires_at < ?", [now], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}
