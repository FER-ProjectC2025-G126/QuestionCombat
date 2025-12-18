const TICK_RATE = 20; // ticks per second
const TICK_INTERVAL = 1000 / TICK_RATE; // milliseconds per tick

class Room {
    constructor(id, ...playerUsernames) {
        this.id = id;
        this.players = [];
    }

    connectPlayer(username) {
        this.players.append({
            username: username
        });
    }
}

class SingleplayerRoom extends Room {
    constructor(id, ...playerUsernames) {
        super(id, ...playerUsernames);
        this.gameState = null;
        this.questions = null;
        this.usedQuestions = null;
    }

    startGame() {
        if (!this.gameState) {
            this.gameState = { correct: 0, incorrect: 0, unanswered: 0 };

        }
    }

    stopGame() {
        if (this.gameState) {

        }
    }

    update() {
        if (this.gameState) {

        }
    }
}

class MultiplayerRoom extends Room {
    constructor(id, name, capacity) {
        super(id, name, capacity);
        this.users = [];
    }
}
