import Database from "./db/Database.js";
const database = new Database();


export const TICK_RATE = 20; // ticks per second


// time limits in seconds
const Q_CHOOSE_TIME = 10;  // time to choose a question (seconds)
const Q_ANSWER_TIME = 15;  // time to answer a question (seconds)


export class Room {
    constructor(io, id, name, capacity, isPrivate, questionSetsIds) {
        // room properties
        this._io = io;
        this._id = id;
        this._name = name;
        this._capacity = capacity;
        if (this._capacity < 1 || this._capacity > 4) {
            this._capacity = 1;
        }
        this._isPrivate = !!isPrivate;  // ensure boolean

        // questions loading
        this._loading = true;
        this._questionSets = [];      // metadata of question sets
        this._questions = [];         // loaded questions from sets
        const questionSetsPromises = [];
        for (const setId of questionSetsIds || []) {
            questionSetsPromises.push(database.question_sets.getQuestionSet(setId));
        }
        if (questionSetsPromises.length === 0) {
            // if no specific sets requested, load random set
            questionSetsPromises.push(
                database.question_sets.listQuestionSets().then((qSets) => {
                    const randSetId = qSets[Math.floor(Math.random() * qSets.length)].id;
                    return database.question_sets.getQuestionSet(randSetId);
                })
            );
        }
        Promise.all(questionSetsPromises).then(question_sets => {
            for (const qSet of question_sets) {
                this._questionSets.push({
                    id: qSet.id,
                    title: qSet.title,
                    description: qSet.description,
                    questionCount: qSet.questions.length,
                });
                for (const question of qSet.questions) {
                    this._questions.push(question);
                }
            }
            this._loading = false;
        });

        // players in the room
        this._players = [];

        // game state tracking
        this._started = false;
        if (this._capacity === 1) {

        } else {

        }

        // start room update loop
        this.roomUpdateInterval = setInterval(() => this.update(), 1000 / TICK_RATE);
    }

    update() {
        const updateJSON = {
            type: "room",
            loading: this._loading,
            started: this._started,
            questionSets: this._questionSets,
        };

        if (!this._loading) {
            if (this._started) {
                // include game state
            } else {
                // include lobby state
                updateJSON.players = this._players.map(player => ({
                    username: player.username
                }));
            }
        }

        this.io.to(this.id).emit("stateUpdate", updateJSON);
    }

    addPlayer(username) {
        if (this._players.length >= this._capacity) {
            return false;
        }
        this._players.append({
            username: username,
            hp: 100,
            left: false,
        });
        return true;
    }

    removePlayer(username) {
        this._players = this._players.filter(player => player.username !== username);
        if (this._players.length === 0) {
            clearInterval(this.roomUpdateInterval);
        }
    }

    startGame() {
        // everyone must be ready
    }

    stopGame() {}

    submitAnswer(username, answer) {}

    chooseQuestion(username, questionIndex) {}

    get io() {
        return this._io;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get capacity() {
        return this._capacity;
    }

    get isPrivate() {
        return this._isPrivate;
    }

    get playerCount() {
        return this._players.length;
    }

    get questionSets() {
        return this._questionSets;
    }
}
