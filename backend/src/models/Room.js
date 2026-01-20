import shuffle from 'shuffle-array';
import Database from './db/Database.js';

const database = new Database();

export const TICK_RATE = 20; // ticks per second

// time limits in seconds
const Q_CHOOSE_TIME = 10; // time to choose a question (seconds)
const Q_ANSWER_TIME = 15; // time to answer a question (seconds)
const Q_REVIEW_TIME = 3; // time to review question answer (seconds)
const Q_NOT_PRESENT_TIME = 1; // time to skip turn if player not present (seconds)

const Q_WEIGHT_INCREASE = 0.05; // question weight increase per turn (multiplayer mode, max 1.0)

const PLAYER_HP_DECREASE = 10; // health points decrease on incorrect answer (multiplayer mode)
const PLAYER_MAX_SCORE_INCREASE = 50; // max score increase on correct answer (if player answers instantly)

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
    this._isPrivate = !!isPrivate; // ensure boolean

    // questions loading
    this._loading = true;
    this._questionSets = []; // metadata of question sets
    this._questions = []; // loaded questions from sets
    const questionSetsPromises = [];
    for (const setId of questionSetsIds || []) {
      questionSetsPromises.push(database.question_sets.getQuestionSet(setId));
    }

    if (questionSetsPromises.length === 0) {
      // if no specific sets requested, load random set
      questionSetsPromises.push(
        database.question_sets.listQuestionSets().then((qSets) => {
          if (!qSets || qSets.length === 0) {
            throw new Error('No question sets available in database.');
          }
          const randSet = qSets[Math.floor(Math.random() * qSets.length)];
          return database.question_sets.getQuestionSet(randSet.id);
        })
      );
    }

    Promise.all(questionSetsPromises)
      .then((question_sets) => {
        for (const qSet of question_sets || []) {
          if (!qSet) continue;
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
      })
      .catch((err) => {
        console.error('Failed to load question sets for room:', err.message);
      })
      .finally(() => {
        this._loading = false;
      });

    // players in the room
    this._players = new Map();

    // game started flag (waiting for players to join or playing)
    this._started = false;

    // statistics of the last finished game (players and their scores), for displaying end of game stats
    this._lastGameStats = null;

    // whose turn it is (username)
    this._turn = null;

    // timer variable (used for time-limited actions)
    this._timer = { endTime: 0, originalDuration: 0, active: false };

    // current game state ("choice" - waiting for question choice, "answer" - waiting for answer, "review" - reviewing the answer)
    this._state = null;

    // start room update loop
    this.roomUpdateInterval = setInterval(() => this.update(), 1000 / TICK_RATE);
  }

  update() {
    const updateJSON = {
      type: 'room', // user is in a game room
      name: this._name, // name of the game room
      capacity: this._capacity, // size of the game room (how many players must join to start)
      isPrivate: this._isPrivate, // whether the room is private (not shown in public room list)
      loading: this._loading, // whether the game room is still loading (show loading screen)
      started: this._started, // whether the game has started in the room
      questionSets: this._questionSets, // metadata of question sets used in this room
      lastGameStats: this._lastGameStats, // stats for the last finished game in this room (array of { username, score, correctAns, incorrectAns, isWinner } objects where correctAns is the number of correct answers, and incorrectAns the number of incorrect answers, and isWinner is a boolean indicating whether the user was the last one alive), if no games finished yet, null
      players: [], // array of players in this room with their stats (objects described below)
      turn: this._turn, // whose turn it is (username)
      timer: { percentage: 0 },
      state: this._state,
    };

    // populate players array
    for (const [player, playerData] of this._players) {
      updateJSON.players.push({
        username: player, // player's username
        present: playerData.present, // whether the player is still present in the game (players who left during the game are marked as not present)
        correctAns: playerData.correctAns, // number of correct answers given by the player
        incorrectAns: playerData.incorrectAns, // number of incorrect answers given by the player
        hp: playerData.hp, // player's health points (for multiplayer mode)
        score: playerData.score, // player's score
        viewingStats: playerData.viewingStats, // whether the player is viewing end of game stats
      });
    }

    // update timer percentage
    let timerPercentage = (this._timer.endTime - Date.now()) / this._timer.originalDuration;
    if (timerPercentage < 0) {
      timerPercentage = 0;
    } else if (timerPercentage > 1) {
      timerPercentage = 1;
    }
    updateJSON.timer.percentage = timerPercentage;

    // game logic updates
    if (!this._loading && this._started) {
      if (this._capacity === 1) {
        // singleplayer mode updates
        if (this._state === 'answer') {
          if (this.timerExpired()) {
            // time's up, question unanswered (count as incorrect)
            const player = this._players.values().next().value;
            player.incorrectAns += 1;
            this._chosenAnswer = null;

            // proceed to review state
            this._state = 'review';
            this.setTimer(Q_REVIEW_TIME);

            // retrigger update
            return this.update();
          }
          updateJSON.question = {
            ...this._questions[this._questionOrder[this._currentQuestionIndex]],
          };
          updateJSON.question.correctOption = null; // hide correct answer during answering phase
        } else if (this._state === 'review') {
          if (this.timerExpired()) {
            // review time over, proceed to next question
            this._currentQuestionIndex += 1;
            if (this._currentQuestionIndex >= this._questionOrder.length) {
              // game over
              this._started = false;

              // prepare end of game stats
              const player = this._players.values().next().value;
              player.viewingStats = true;
              this._lastGameStats = [
                {
                  username: this._players.keys().next().value,
                  score: player.score,
                  correctAns: player.correctAns,
                  incorrectAns: player.incorrectAns,
                  isWinner: true,
                },
              ];
            } else {
              // next question
              this._state = 'answer';
              this.setTimer(Q_ANSWER_TIME);
            }
            return this.update();
          }
          updateJSON.question = this._questions[this._questionOrder[this._currentQuestionIndex]];
          updateJSON.chosenAnswer = this._chosenAnswer;
        } else {
          throw new Error(`Invalid game state: ${this._state}`);
        }
      } else {
        // multiplayer mode updates
        if (this._state === 'answer') {
          if (this.timerExpired()) {
            // time's up, question unanswered (count as incorrect)
            const player = this._players.get(this._turn);
            player.incorrectAns += 1;
            player.hp -= PLAYER_HP_DECREASE;
            if (player.hp < 0) {
              player.hp = 0;
            }
            this._chosenAnswer = null;

            // proceed to review state
            this._state = 'review';
            this.setTimer(Q_REVIEW_TIME);

            // retrigger update
            return this.update();
          }
          updateJSON.question = { ...this._questions[this._currentQuestionIndex] };
          updateJSON.question.correctOption = null; // hide correct answer during answering phase
        } else if (this._state === 'review') {
          if (this.timerExpired()) {
            // review time over, proceed to next turn
            // check for game over condition (only one player with hp > 0)
            let playersAlive = 0;
            for (const [, player] of this._players) {
              if (player.hp > 0) {
                playersAlive += 1;
              }
            }
            if (playersAlive <= 1) {
              // game over
              this._started = false;

              // prepare end of game stats
              this._lastGameStats = [];
              for (const [username, player] of this._players) {
                player.viewingStats = true;
                this._lastGameStats.push({
                  username: username,
                  score: player.score,
                  correctAns: player.correctAns,
                  incorrectAns: player.incorrectAns,
                  isWinner: player.hp > 0 && player.present,
                });
              }
              this._lastGameStats.sort((a, b) => b.score - a.score);
              // remove players who were not present at the end of the game
              const notPresentPlayers = [];
              for (const [username, player] of this._players) {
                if (!player.present) {
                  notPresentPlayers.push(username);
                }
              }
              for (const username of notPresentPlayers) {
                this._players.delete(username);
              }
            } else {
              // this._turn unchanged (the player who answered will choose the next question and player who answers next)

              // go to choice state
              this._state = 'choice';
              if (this._players.get(this._turn).present) {
                this.setTimer(Q_CHOOSE_TIME);
              } else {
                // if the player whose turn it is not present, set very short timer to skip their turn
                this.setTimer(Q_NOT_PRESENT_TIME);
              }
            }
            return this.update();
          }
          updateJSON.question = this._questions[this._currentQuestionIndex];
          updateJSON.chosenAnswer = this._chosenAnswer;
        } else if (this._state === 'choice') {
          if (this.timerExpired()) {
            // time's up, choose random question and random player to answer
            const randQuestionIndex = Math.floor(Math.random() * this._questionChoices.length);
            this._currentQuestionIndex = this._questionChoices[randQuestionIndex];

            const playersArray = Array.from(this._players.keys()).filter(
              (username) => this._players.get(username).hp > 0 && username !== this._turn
            );
            const randPlayerIndex = Math.floor(Math.random() * playersArray.length);
            this._turn = playersArray[randPlayerIndex];

            // go to answer state
            this._state = 'answer';
            if (this._players.get(this._turn).present) {
              this.setTimer(Q_ANSWER_TIME);
            } else {
              // if the player whose turn it is not present, set very short timer to skip their turn
              this.setTimer(Q_NOT_PRESENT_TIME);
            }

            // update question selector
            this._questionSelector.markQuestionChosen(this._currentQuestionIndex);
            // get next question choices
            this._questionChoices = this._questionSelector.getNext3();

            // retrigger update
            return this.update();
          }
          updateJSON.questionChoices = this._questionChoices.map((index) => {
            return { index: index, ...this._questions[index] };
          });
          for (const question of updateJSON.questionChoices) {
            question.correctOption = null; // hide correct answers during question choosing phase
          }
        } else {
          throw new Error(`Invalid game state: ${this._state}`);
        }
      }
    }

    // send state update to all players in the room
    this.io.to(this.id).emit('stateUpdate', updateJSON);
  }

  addPlayer(username) {
    if (this._players.size >= this._capacity || this._started) {
      return false;
    }

    this._players.set(username, {
      present: true,
      correctAns: 0,
      incorrectAns: 0,
      hp: 100,
      score: 0,
      viewingStats: false,
    });

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
    if (this.playerCount === 0) {
      clearInterval(this.roomUpdateInterval);
    }
  }

  startGame() {
    // if game is already started, or room is still loading, or room is not full,
    // or someone is viewing end of game stats, cannot start
    let someoneLooksAtEndStats = false;
    for (const [, player] of this._players) {
      if (player.viewingStats) {
        someoneLooksAtEndStats = true;
        break;
      }
    }
    if (
      this._started ||
      this._loading ||
      this._players.size < this._capacity ||
      someoneLooksAtEndStats ||
      this._questions.length === 0
    ) {
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
    } else {
      this._questionSelector = new MultiplayerQuestionSelector(this._questions);
    }
    this._currentQuestionIndex = 0;

    // reset player stats
    for (const [, player] of this._players) {
      player.present = true; // whether player is still present in the game
      player.correctAns = 0; // the number of correct answers given
      player.incorrectAns = 0; // the number of incorrect answers given
      player.hp = 100; // health points (for multiplayer mode)
      player.score = 0; // player's score
      player.viewingStats = false; // whether player is viewing end of game stats
    }

    // player turn tracking
    const players = Array.from(this._players.keys());
    const randPlayerIndex = Math.floor(Math.random() * players.length);
    this._turn = players[randPlayerIndex]; // whose turn it is (username)

    // timer variable (used for time-limited actions)
    this._timer = {
      endTime: 0, // timestamp when current timer ends
      originalDuration: 0, // original duration of the timer (for calculating score based on time left)
    };

    // current game state ("choice" - waiting for question choice, "answer" - waiting for answer, "review" - reviewing the answer)
    this._state = this._capacity > 1 ? 'choice' : 'answer'; // (choice, answer, review)

    if (this._state === 'choice') {
      this.setTimer(Q_CHOOSE_TIME);
    } else if (this._state === 'answer') {
      this.setTimer(Q_ANSWER_TIME);
    }

    // chosen answer for the current question (used for reviewing phase)
    this._chosenAnswer = null;

    // question choices for multiplayer mode
    if (this._capacity > 1) {
      this._questionChoices = this._questionSelector.getNext3();
    }

    // start the game
    this._started = true;

    // game started successfully
    return true;
  }

  setTimer(lengthInSeconds) {
    this._timer.endTime = Date.now() + lengthInSeconds * 1000;
    this._timer.originalDuration = lengthInSeconds * 1000;
  }

  timerExpired() {
    return Date.now() >= this._timer.endTime;
  }

  submitAnswer(username, answer) {
    if (username === this._turn && this._state === 'answer' && !this.timerExpired()) {
      const player = this._players.get(username);
      let currentQuestion;
      if (this._capacity === 1) {
        currentQuestion = this._questions[this._questionOrder[this._currentQuestionIndex]];
      } else {
        currentQuestion = this._questions[this._currentQuestionIndex];
      }

      if (answer === currentQuestion.correctOption) {
        // correct answer
        player.correctAns += 1;

        // calculate score increase based on time left
        let timerPercentage = (this._timer.endTime - Date.now()) / this._timer.originalDuration;
        if (timerPercentage < 0) {
          timerPercentage = 0;
        } else if (timerPercentage > 1) {
          timerPercentage = 1;
        }
        player.score += Math.floor(PLAYER_MAX_SCORE_INCREASE * ((1 + timerPercentage) / 2));
      } else {
        // incorrect answer
        player.incorrectAns += 1;

        if (this._capacity > 1) {
          // multiplayer mode - decrease HP
          player.hp -= PLAYER_HP_DECREASE;
          if (player.hp < 0) {
            player.hp = 0;
          }
        }
      }
      this._chosenAnswer = answer;

      // proceed to review state
      this._state = 'review';
      this.setTimer(Q_REVIEW_TIME);
    }
  }

  chooseQuestion(username, questionIndex, attackedUsername) {
    // only for multiplayer mode
    const attackedUser = this._players.get(attackedUsername);
    if (
      this._capacity > 1 &&
      this._turn === username &&
      this._state === 'choice' &&
      !this.timerExpired() &&
      this._questionChoices.includes(questionIndex) &&
      attackedUser &&
      attackedUser.hp > 0 &&
      attackedUsername !== username
    ) {
      this._questionSelector.markQuestionChosen(questionIndex);
      this._currentQuestionIndex = questionIndex;

      this._turn = attackedUsername;
      this._state = 'answer';
      if (this._players.get(this._turn).present) {
        this.setTimer(Q_ANSWER_TIME);
      } else {
        // if the player whose turn it is not present, set very short timer to skip their turn
        this.setTimer(Q_NOT_PRESENT_TIME);
      }

      // get next question choices
      this._questionChoices = this._questionSelector.getNext3();
    }
  }

  closeEndOfGameStats(username) {
    const player = this._players.get(username);
    if (player) {
      player.viewingStats = false;
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
    let activePlayers = 0;
    for (const [, player] of this._players) {
      if (player.present) {
        activePlayers += 1;
      }
    }
    return activePlayers;
  }

  get questionSets() {
    return this._questionSets;
  }

  get players() {
    return this._players;
  }
}

class MultiplayerQuestionSelector {
  constructor(questions) {
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
    // set chosen question weight to 5%
    this._questionWeights[questionIndex] = 0.05;
    // update cumulative weights
    this.updateCumulativeWeights();
  }
}
