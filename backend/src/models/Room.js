import Database from "./db/Database.js";
const database = new Database();


export const TICK_RATE = 20; // ticks per second


export class Room {
    constructor(io, id, name, capacity, isPrivate, questionSetsIds) {
        this._io = io;
        this._id = id;
        this._name = name;
        this._capacity = capacity;
        this._isPrivate = isPrivate;

        this._loading = true;
        this._questionSets = [];      // metadata of question sets
        this._questions = [];         // loaded questions from sets
        Promise.all(questionSetsIds.map(setId => database.question_sets.getQuestionSet(setId))).then(question_sets => {
            this._loading = false;
            for (const qSet of question_sets) {
                this._questionSets.push({
                    id: qSet.id,
                    title: qSet.title,
                    description: qSet.description
                });
                for (const question of qSet.questions) {
                    this._questions.push(question);
                }
            }
        });

        this._players = [];

        this.roomUpdateInterval = setInterval(() => this.update(), 1000 / TICK_RATE);
    }

    update() {
        const updateJSON = { type: "room", loading: this._loading };

        if (!this._loading) {

        }

        this.io.to(this.id).emit("stateUpdate", updateJSON);
    }

    addPlayer(username) {
        this._players.append({
            username: username
        });
    }

    removePlayer(username) {
        this._players = this._players.filter(player => player.username !== username);
    }

    get playerCount() {
        return this._players.length;
    }

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
}
