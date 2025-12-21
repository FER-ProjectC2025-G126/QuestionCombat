import shuffle from "shuffle-array";
import Database from "./db/Database.js";

const database = new Database();


export const TICK_RATE = 20; // ticks per second


// time limits in seconds
const Q_CHOOSE_TIME = 10;               // time to choose a question (seconds)
const Q_ANSWER_TIME = 15;               // time to answer a question (seconds)
const Q_REVIEW_TIME = 5;                // time to review question answer (seconds)

const Q_WEIGHT_INCREASE = 0.05;         // question weight increase per turn (multiplayer mode, max 1.0)

const PLAYER_HP_DECREASE = 20;          // health points decrease on incorrect answer (multiplayer mode)
const PLAYER_MAX_SCORE_INCREASE = 50;   // max score increase on correct answer (if player answers instantly)


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
        this._players = new Map();

        // game started flag (waiting for players to join or playing)
        this._started = false;

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
                // updateJSON.players = this._players.map(player => ({
                //     username: player.username
                // }));
            }
        }

        this.io.to(this.id).emit("stateUpdate", updateJSON);
    }

    addPlayer(username) {
        if (this._players.size >= this._capacity || this._started) {
            return false;
        }

        this._players.set(username, {});

        return true;
    }

    removePlayer(username) {
        // if the game has started, mark player as not present,
        // otherwise remove them from the room
        if (this._started) {
            this._players.get(username).present = false;
        } else {
            this._players.delete(username);
        }

        // if this was the last player, stop the room update loop
        // (since the room will be deleted by the UserManager)
        if (this._players.size === 0) {
            clearInterval(this.roomUpdateInterval);
        }
    }

    startGame() {
        // if game is already started, or room is still loading, or room is not full, cannot start
        if (this._started || this._loading || this._players.size < this._capacity) {
            return false;
        }

        // question choosing tactics:
        // 1. single player - random question order (shuffle indices)
        // 2. multiplayer - random weight-based question selection
        //    (each question has assigned weight, weight 1 means normal chance,
        //    weight zero means no chance, when a question is chosen, its weight is set to zero,
        //    each turn its weight increases by Q_WEIGHT_INCREASE, until it reaches 1)
        if (this._capacity === 1) {
            this._questionOrder = new Array(this._questions.length);
            for (let i = 0; i < this._questions.length; i++) {
                this._questionOrder[i] = i;
            }
            shuffle(this._questionOrder);
            this._currentQuestionIndex = 0;
        } else {
            this._questionSelector = new MultiplayerQuestionSelector(this._questions);
        }

        // reset player stats
        for (const [_, player] of this._players) {
            player.correctAnswers = 0;      // the number of correct answers given
            player.incorrectAnswers = 0;    // the number of incorrect answers given
            player.hp = 100;                // health points (for multiplayer mode)
            player.score = 0;               // player's score
            player.endOfGameStats = false;  // whether player is viewing end of game stats
            player.present = true;          // whether player is still present in the game
        }

        // player turn tracking
        const players = Array.from(this._players.keys());
        const randPlayerIndex = Math.floor(Math.random() * players.length);
        const randPlayer = this._players.get(players[randPlayerIndex]).username;
        this._turn = {
            username: randPlayer,  // username of player whose turn it is
            type: "choose"         // or "answer" (alternates each turn in multiplayer, ignored in singleplayer)
        };

        // timer variable (used for time-limited actions)
        this._timer = {
            endTime: 0,               // timestamp when current timer ends
            originalDuration: 0,      // original duration of the timer (for calculating score based on time left)
            active: false             // whether the timer is active
        };

        this._started = true;

        // game started successfully
        return true;
    }

    submitAnswer(username, answer) {
        if (username === this._turn.username) {

        }
    }

    chooseQuestion(username, questionIndex) {
        // only for multiplayer mode
        if (this._capacity > 1) {
            this._questionSelector.markQuestionChosen(questionIndex);
        }
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

    get playerCount() {
        return this._players.length;
    }

    get questionSets() {
        return this._questionSets;
    }
}

class MultiplayerQuestionSelector {
    constructor(questions) {
        this._questions = questions;
        this._questionWeights = new Array(questions.length).fill(1.0);
        this._questionWeightsCumulative = new Array(questions.length);
        this._totalWeight = 0;
        this.updateCumulativeWeights();
    }

    getNext3() {
        const chosenIndices = new Set();
        while (chosenIndices.size < 3) {
            const nextIndex = this.getNext();
            chosenIndices.add(nextIndex);
        }
        return Array.from(chosenIndices);
    }

    getNext() {
        const rand = Math.random() * this._totalWeight;

        let left = 0;
        let right = this._questionWeightsCumulative.length - 1;
        while (left < right) {
            const mid = left + ((right - left) >> 1);
            if (rand <= this._questionWeightsCumulative[mid]) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }

        return left;
    }

    updateCumulativeWeights() {
        this._totalWeight = 0;
        for (let i = 0; i < this._questionWeights.length; i++) {
            this._totalWeight += this._questionWeights[i];
            this._questionWeightsCumulative[i] = this._totalWeight;
        }
    }

    markQuestionChosen(questionIndex) {
        // increase weights of all questions (up to max 1.0)
        for (let i = 0; i < this._questionWeights.length; i++) {
            if (this._questionWeights[i] < 1.0) {
                this._questionWeights[i] = Math.min(1.0, this._questionWeights[i] + Q_WEIGHT_INCREASE);
            }
        }
        // set chosen question weight to zero
        this._questionWeights[questionIndex] = 0;
        // update cumulative weights
        this.updateCumulativeWeights();
    }
}
