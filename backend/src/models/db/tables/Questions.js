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

  createQuestion(setId, qText, qOptions, qCorrectOption, source = 'MANUAL', createdBy = null) {
    return new Promise((resolve, reject) => {
      // AI-generated questions are inactive by default
      const isActive = source === 'MANUAL' ? 1 : 0;
      const status = source === 'AI' ? 'PENDING' : 'APPROVED';
      const isApproved = source === 'MANUAL' ? 1 : 0;

      this.db.run(
        'INSERT INTO questions (set_id, question_text, source, created_by, status, is_approved, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [setId, qText, source, createdBy, status, isApproved, isActive],
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

  // Get questions filtered by status (for admins)
  getQuestionsByStatus(status) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM questions WHERE status = ? ORDER BY created_at DESC',
        [status],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  // Get all questions by set (for admins)
  getQuestionsBySet(setId) {
    return new Promise((resolve, reject) => {
      const query = setId
        ? 'SELECT * FROM questions WHERE set_id = ? ORDER BY created_at DESC'
        : 'SELECT * FROM questions ORDER BY created_at DESC';
      const params = setId ? [setId] : [];

      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  // Get approved questions only (for regular users)
  getQuestionsBySetApproved(setId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM questions WHERE set_id = ? AND is_approved = 1 AND is_active = 1',
        [setId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  // Get full question with options
  getQuestionFull(qId) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM questions WHERE question_id = ?', [qId], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          // Get question options
          this.db.all(
            'SELECT * FROM question_options WHERE question_id = ? ORDER BY option_id ASC',
            [qId],
            (err, options) => {
              if (err) {
                reject(err);
              } else {
                // Transform options for frontend: array of strings with correct_answer_index
                const answer_options = (options || []).map(opt => opt.option_text);
                const correct_answer_index = (options || []).findIndex(opt => opt.is_correct === 1);
                
                resolve({
                  ...row,
                  answer_options: answer_options,
                  correct_answer_index: correct_answer_index >= 0 ? correct_answer_index : 0,
                  options: options || [], // Keep original for backward compatibility
                });
              }
            }
          );
        }
      });
    });
  }

  // Approve a question
  approveQuestion(qId, approvedBy) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE questions SET status = ?, is_approved = 1, is_active = 1, approved_by = ?, approved_at = CURRENT_TIMESTAMP WHERE question_id = ?',
        ['APPROVED', approvedBy, qId],
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

  // Reject a question
  rejectQuestion(qId, rejectionReason = null) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE questions SET status = ?, is_approved = 0, is_active = 0 WHERE question_id = ?',
        ['REJECTED', qId],
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

  // Edit a question
  editQuestion(qId, questionText, options) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE questions SET question_text = ? WHERE question_id = ?',
        [questionText, qId],
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
        const optionPromises = options.map((option, index) => {
          return new Promise((resolve, reject) => {
            this.db.run(
              'INSERT INTO question_options (question_id, option_text, is_correct) VALUES (?, ?, ?)',
              [qId, option.text, option.isCorrect ? 1 : 0],
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
