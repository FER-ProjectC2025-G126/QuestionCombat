import '../styles/LeaderBoard.css';
import Background from '../components/Background';
import useSocket from '../features/socket/useSocket.js';
import { useNavigate } from 'react-router';

function LeaderBoard() {
  const { appState, closeEndOfGameStats } = useSocket();
  const winnerIndex = appState.lastGameStats.findIndex((p) => p.isWinner);
  const navigate = useNavigate();

  const onLeaveClicked = () => {
    closeEndOfGameStats();
    navigate('/lobby');
  };

  if (appState.type === 'lobby') {
    navigate('/lobby');
    return null;
  }

  let correct, all, percentage, message;

  if(!(appState.capacity > 1)) {
    correct = appState.lastGameStats[0].correctAns;
    all = appState.lastGameStats[0].correctAns + appState.lastGameStats[0].incorrectAns;
    percentage = all > 0 ? Math.round((correct / all) * 100) : 0;

    switch (true) {
      case percentage === 100:
        message = "Excellent! You got everything correct!";
        break;
      case percentage >= 90:
        message = `Great job! You scored ${percentage}%, almost perfect!`;
        break;
      case percentage >= 70:
        message = `Very good! You got ${percentage}% correct, well done!`;
        break;
      case percentage >= 50:
        message = `Good effort! You scored ${percentage}%, you're halfway there!`;
        break;
      default:
        message = `Not bad for a start. You got ${percentage}% correct, keep practicing!`;
        break;
    } 
  }

  const delayStep = 1; //delay for animations, pls dont change :)

  return (
    <Background>
      <div className="block">
        <button onClick={onLeaveClicked} type="button" className="leaveBtn">
          Close
        </button>
        <h1 className="gameName">{appState.capacity > 1 ? 'LEADERBOARD' : 'STATS'}</h1>
        <div className={`board ${appState.capacity > 1 ? "" : "stats"}`}>
          {appState.capacity > 1 ? (
            appState.lastGameStats.map((player, index) => {
              const isWinner = index === winnerIndex;
              const delay = (appState.lastGameStats.length - 1 - index) * delayStep;

              return (
                <div
                  key={player.username}
                  className={`playerRow ${isWinner ? 'winner' : ''}`}
                  style={{
                    animationDelay: `${delay}s`,
                    animationDuration: isWinner ? '2s' : '0.8s',
                  }}
                >
                  <p>
                    {index + 1}. {player.username}
                  </p>
                  <span className="playerScore">{player.score}</span>
                </div>
              );
            })
          ) : (
            <div className='game-stats' key={appState.lastGameStats[0].username}>
              <p className='game-stats-message'>{message}</p>
              <span className="playerScore">Score: {appState.lastGameStats[0].score}</span>
              <p className='game-stats-answers'>
                {correct} /{' '}
                {all}{' '}
                correct answers
              </p>
            </div>
          )}
        </div>
      </div>
    </Background>
  );
}

export default LeaderBoard;
