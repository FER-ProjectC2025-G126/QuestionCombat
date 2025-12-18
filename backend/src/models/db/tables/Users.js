export default class Users {
    constructor(db) {
        this.db = db;
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
