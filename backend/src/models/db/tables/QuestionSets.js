import Questions from "./Questions.js"

export default class QuestionSets {
    constructor(db) {
        this.db = db;
    }

    getQuestionSet(setId) {
        return new Promise((resolve, reject) => {
            this.db.get("SELECT * FROM question_sets WHERE set_id = ?", [setId], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    resolve(null);
                } else {
                    resolve({
                        id: setId,
                        title: row["title"],
                        description: row["description"],
                    });
                }
            });
        }).then((qSet) => {
            if (!qSet) {
                return null;
            }
            return new Promise((resolve, reject) => {
                this.db.all("SELECT question_id FROM questions WHERE set_id = ?", [setId], (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        const questionIds = rows.map(row => row["question_id"]);
                        resolve({
                            qSet: qSet,
                            questionIds: questionIds
                        });
                    }
                });
            });
        }).then(result => {
            if (!result) {
                return null;
            }
            const qSet = result.qSet;
            const questionIds = result.questionIds;
            const question = new Questions(this.db);
            const questionPromises = questionIds.map(qId => question.getQuestion(qId));
            return Promise.all(questionPromises).then(questions => {
                qSet.questions = questions;
                return qSet;
            });
        });
    }

    listQuestionSets() {
        return new Promise((resolve, reject) => {
            this.db.all("SELECT question_sets.set_id, question_sets.title, question_sets.description, COUNT(*) as questionCount FROM question_sets, questions WHERE question_sets.set_id = questions.set_id GROUP BY question_sets.set_id, question_sets.title, question_sets.description", [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const questionSets = rows.map(row => ({
                        id: row["set_id"],
                        title: row["title"],
                        description: row["description"],
                        questionCount: row["questionCount"]
                    }));
                    resolve(questionSets);
                }
            });
        });
    }
}
