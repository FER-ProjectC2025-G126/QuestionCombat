import useSocket from '../socket/useSocket';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../auth/AuthProvider';
import { FaUserCircle } from 'react-icons/fa';

const GameRoom = () => {
  const { user } = useAuth();
  const { appState, leaveRoom } = useSocket();
  const [progressBar, setProgressBar] = useState(1);
  const [turn, setTurn] = useState('');
  const [question, setQuestion] = useState({});
  const [questionChoices, setQuestionChoices] = useState([]);
  const [state, setState] = useState('');
  const [isOnTurn, setIsOnTurn] = useState(false);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    if (appState?.players) {
      setPlayers(appState.players);
    }
    if (appState?.timer?.percentage) {
      setProgressBar(appState.timer.percentage);
    }
    if (appState?.turn) {
      setTurn(appState.turn);
    }
    if (appState?.question) {
      setQuestion(appState.question);
    }
    if (appState?.questionChoices) {
      setQuestionChoices(appState.questionChoices);
    }
    if (appState?.state) {
      setState(appState.state);
    }
    setIsOnTurn(user.username === appState?.turn);
    console.log(appState);
  }, [appState]);

  const onLeaveClicked = () => {
    leaveRoom();
  };

  if (!appState) return <div>Loading...</div>;

  if (appState.type === 'lobby') {
    return <Navigate to="/home" />;
  }

  return (
    <div className="gameRoom">
      <button onClick={onLeaveClicked} type="button" className="leaveBtn">
        Leave Room
      </button>
      <div className="gameHeader">
        <p className="turn">{turn}'s turn</p>
      </div>
      <div className="Players">
        {players.map((player) => (
          <div key={player.id} className="playerCard">
            <div className="playerName">{player.username}</div>
            <div className="profilePictureSection">
              {player.profilePicture ? (
                <img
                  src={player.profilePicture}
                  alt={player.username}
                  className="profilePictureSmall"
                />
              ) : (
                <FaUserCircle size={60} className="profilePicturePlaceholder" />
              )}
            </div>
            <div className="HP">
              <div className="HealthBar" style={{ width: `${player.health}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="timer">
        <div className="timerBar" style={{ width: `${progressBar * 100}%` }} />
      </div>
      {state === 'choice' && (
        <div className="question-card">
          <div className="question-text">Choose Question</div>
          <div className={`options ${!isOnTurn ? 'disabled' : ''}`}>
            {questionChoices.map((q) => (
              // we should discuss how many questions we show
              <button
                key={q.id}
                className="option"
                disabled={!isOnTurn}
                onClick={() => {
                  if (!isOnTurn) return;
                  chooseQuestion(q.id); // socket emit
                }}
              >
                {q.text}
              </button>
            ))}
          </div>
          <p className={`waiting-text ${isOnTurn ? 'your-turn' : ''}`}>
            {isOnTurn ? "It's your turn" : `Waiting for ${turn} to answer`}
          </p>{' '}
        </div>
      )}
      {state === 'answer' && (
        <div className="question-card" data-id={question.id}>
          <div className="question-text">{question.text}</div>

          <div className={`options ${state} ${!isOnTurn ? 'disabled' : ''}`}>
            {question.options.map((option, index) => (
              <label key={index} className="option">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  disabled={!isOnTurn}
                  onChange={() => {
                    if (!isOnTurn) return;
                    answerQuestion(question.id, option); // socket emit
                  }}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          <p className={`waiting-text ${isOnTurn ? 'your-turn' : ''}`}>
            {isOnTurn ? "It's your turn" : `Waiting for ${turn} to answer`}
          </p>
        </div>
      )}
      {state === 'review' && (
        <div className="question-card">
          <div className="question-text">Result</div>

          <p className="review-text">
            Correct answer: <b>{question.correctOption}</b>
          </p>

          <p className="review-text">
            {turn} answered: <b>{question.playerAnswer}</b>
          </p>
        </div>
      )}
    </div>
  );
};

export default GameRoom;
