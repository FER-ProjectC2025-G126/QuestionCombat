

class SingleplayerGame {
    constructor(playerId, difficulty) {
        this.answers = { correct: 0, incorrect: 0 }
        this.difficulty = difficulty
        this.startTime = new Date();
        this.score = 0;
        this.isActive = true;
    }
}
