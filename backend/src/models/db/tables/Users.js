export default class Users {
  constructor(db) {
    this.db = db;
  }

  getUser(username) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            username: row['username'],
            email: row['email'],
            passwordHash: row['password_hash'],
            bio: row['bio'] || '',
            profilePicture: row['profile_picture'] || null,
          });
        }
      });
    });
  }

  createUser(username, email, passwordHash) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO users (username, email, password_hash, bio, profile_picture) VALUES (?, ?, ?, ?, ?)',
        [username, email, passwordHash, '', null],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  updateUserProfile(username, bio, profilePicture) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE users SET bio = ?, profile_picture = ? WHERE username = ?',
        [bio, profilePicture, username],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }
}
