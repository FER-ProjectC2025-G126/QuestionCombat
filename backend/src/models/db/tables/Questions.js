export default class Questions {
  constructor(db) {
    this.db = db;
  }

  getQuestion(qId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM questions, question_options WHERE questions.question_id = question_options.question_id AND questions.question_id = ?',
        [qId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else if (rows.length === 0) {
            resolve(null);
          } else {
            const options = [];
            let correctOption = null;
            for (const row of rows) {
              options.push(row['option_text']);
              if (row['is_correct']) {
                correctOption = options.length - 1;
              }
            }
            resolve({
              id: qId,
              text: rows[0]['question_text'],
              options: options,
              correctOption: correctOption,
            });
          }
        }
      );
    });
  }

  createQuestion(setId, qText, qOptions, qCorrectOption) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO questions (set_id, question_text) VALUES (?, ?)',
        [setId, qText],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    }).then((qId) => {
      const optionPromises = qOptions.map((optionText, index) => {
        return new Promise((resolve, reject) => {
          this.db.run(
            'INSERT INTO question_options (question_id, option_text, is_correct) VALUES (?, ?, ?)',
            [qId, optionText, index === qCorrectOption ? 1 : 0],
            function (err) {
              if (err) {
                reject(err);
              } else {
                resolve();
              }
            }
          );
        });
      });
      return Promise.all(optionPromises).then(() => qId);
    });
  }

  deleteQuestion(qId) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM questions WHERE question_id = ?', [qId], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  updateQuestion(qId, qText, qOptions, qCorrectOption) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE questions SET question_text = ? WHERE question_id = ?',
        [qText, qId],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    })
      .then(() => {
        return new Promise((resolve, reject) => {
          this.db.run('DELETE FROM question_options WHERE question_id = ?', [qId], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      })
      .then(() => {
        const optionPromises = qOptions.map((optionText, index) => {
          return new Promise((resolve, reject) => {
            this.db.run(
              'INSERT INTO question_options (question_id, option_text, is_correct) VALUES (?, ?, ?)',
              [qId, optionText, index === qCorrectOption ? 1 : 0],
              function (err) {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              }
            );
          });
        });
        return Promise.all(optionPromises);
      });
  }
}
