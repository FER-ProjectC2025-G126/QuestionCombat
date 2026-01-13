import '../styles/LeaderBoard.css';
import Background from "../components/Background";
import useSocket from "../features/socket/useSocket.js";
import {useNavigate} from "react-router";

function LeaderBoard() {
  const { appState, closeEndOfGameStats } = useSocket();
  const winnerIndex = appState.lastGameStats.findIndex((p) => p.isWinner);
  const navigate = useNavigate();

   const onLeaveClicked = () => {
    closeEndOfGameStats();
    navigate("/lobby");
  };

  const delayStep = 1; //delay for animations, pls dont change :)

  return (
    <Background>
      <div className="block">
        <button onClick={onLeaveClicked} type="button" className="leaveBtn">
          Close {appState.capacity > 1 ? "leaderboard" : "stats"}
        </button>
        <h1 className="gameName">{appState.capacity > 1 ? "LEADERBOARD" : "STATS"}</h1>
        <div className="board">
          {appState.capacity > 1 ? appState.lastGameStats.map((player, index) => {
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
          }) : (
              <div
                  key={appState.lastGameStats[0].username}
              >
                <p>
                  {appState.lastGameStats[0].username}
                </p>
                <span className="playerScore">{appState.lastGameStats[0].score}</span>
                <p>
                  {appState.lastGameStats[0].correctAns} / {appState.lastGameStats[0].correctAns + appState.lastGameStats[0].incorrectAns} correct answers
                </p>
              </div>
          )}
        </div>
      </div>
    </Background>
  );
}

export default LeaderBoard;
