import '../styles/LeaderBoard.css';

// this is just to show you how i imagined it to look like, when you connect this page to backend you can delete this
const players = [
  { name: 'Ana', score: 120, alive: false },
  { name: 'Bob', score: 95, alive: true },
  { name: 'Tea', score: 80, alive: false },
  { name: 'Teo', score: 60, alive: true },
];

function LeaderBoard() {
  //this is that logic that we talked about, pearson who is still alive is winner, but maybe not the first on the leaderboard
  const alivePlayers = players.filter((p) => p.alive);
  const maxScore = Math.max(...alivePlayers.map((p) => p.score));
  const winnerIndex = players.findIndex((p) => p.alive && p.score === maxScore);

   const onLeaveClicked = () => {
    leaveRoom();
  };

  const delayStep = 1; //delay for animations, pls dont change :)

  return (
    <div className="container">
      <div className="block">
        <button onClick={onLeaveClicked} type="button" className="leaveBtn">
          Leave Room
        </button>
        <h1 className="gameName">LEADERBOARD</h1>
        <div className="board">
          {players.map((player, index) => {
            const isWinner = index === winnerIndex;
            const delay = (players.length - 1 - index) * delayStep;

            return (
              <div
                key={player.name}
                className={`playerRow ${isWinner ? 'winner' : ''}`}
                style={{
                  animationDelay: `${delay}s`,
                  animationDuration: isWinner ? '2s' : '0.8s',
                }}
              >
                <p>
                  {index + 1}. {player.name}
                </p>
                <span className="playerScore">{player.score}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default LeaderBoard;
