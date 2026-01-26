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
            role: row['role'] || 'USER',
          });
        }
      });
    });
  }

  getUserByEmail(email) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
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
            role: row['role'] || 'USER',
          });
        }
      });
    });
  }

  createUser(username, email, passwordHash, isAdmin = false) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO users (username, email, password_hash, bio, profile_picture, role) VALUES (?, ?, ?, ?, ?, ?)',
        [username, email, passwordHash, '', null, isAdmin ? "ADMIN" : "USER"],
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

  getAllUsers() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT username, email, role FROM users ORDER BY username', (err, rows) => {
        if (err) {
          reject(err);
        } else if (!rows) {
          resolve([]);
        } else {
          resolve(
            rows.map((row) => ({
              username: row['username'],
              email: row['email'],
              role: row['role'] || 'USER',
            }))
          );
        }
      });
    });
  }

  updateUserRole(username, role) {
    return new Promise((resolve, reject) => {
      if (!['USER', 'ADMIN'].includes(role)) {
        reject(new Error('Invalid role. Must be USER or ADMIN'));
        return;
      }

      this.db.run('UPDATE users SET role = ? WHERE username = ?', [role, username], function (err) {
        if (err) {
          reject(err);
        } else if (this.changes === 0) {
          reject(new Error('User not found'));
        } else {
          resolve();
        }
      });
    });
  }
}
