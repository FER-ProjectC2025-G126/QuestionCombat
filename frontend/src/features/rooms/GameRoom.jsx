import useSocket from '../socket/useSocket';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from '../auth/AuthProvider';
import { FaUserCircle } from 'react-icons/fa';

const GameRoom = () => {
  const { user } = useAuth();
  const { appState, leaveRoom, chooseQuestion, answerQuestion } = useSocket();
  const [progressBar, setProgressBar] = useState(1);
  const [turn, setTurn] = useState('');
  const [question, setQuestion] = useState({});
  const [questionChoices, setQuestionChoices] = useState([]);
  const [state, setState] = useState('');
  const [isOnTurn, setIsOnTurn] = useState(false);
  const [players, setPlayers] = useState([]);
  const [nextPlayer, setNextPlayer] = useState('');
  const [chosenAnswer, setChosenAnswer] = useState(null);
  const [capacity, setCapacity] = useState(0);
  const [viewingStats, setViewingStats] = useState(false);

  useEffect(() => {
    if(!appState) return;

    if (appState.players) {
      setPlayers(appState.players);
    }
    if (appState.timer?.percentage) {
      setProgressBar(appState.timer.percentage);
    }
    if (appState.turn) {
      setTurn(appState.turn);
    }
    if (appState.question) {
      setQuestion(appState.question);
    }
    if (appState.questionChoices) {
      setQuestionChoices(appState.questionChoices);
    }
    if (appState.state) {
      setState(appState.state);
    }
    if(appState.chosenAnswer !== null) {
      setChosenAnswer(appState.chosenAnswer);
    }
    if(appState.capacity) {
      setCapacity(appState.capacity);
    }
    for(let player of appState.players) {
      if (player.username === user.username) {
        setViewingStats(player.viewingStats);
        break;
      }
    }
    setIsOnTurn(user.username === appState.turn);
    console.log(appState);
  }, [appState]);

  const onLeaveClicked = () => {
    leaveRoom();
  };

  const onChooseQuestion = (questionId, username) => { 
    setNextPlayer('');
    chooseQuestion(questionId, username);
  };

  const onAnswerQuestion = (answerIndex) => {
    answerQuestion(answerIndex);
  }

  const onChooseNextPlayer = (player) => {
    if(state !== "choice") return;
    setNextPlayer(player);
  }

  if (!appState) return <div>Loading...</div>;

  if (appState.type === 'lobby') {
    return <Navigate to="/home" />;
  }

  if(viewingStats && !appState?.started) {
    return <Navigate to="/leaderboard" />
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
          <div key={player.id} className={`playerCard ${(nextPlayer === player.username && state === "choice") ? "clicked" : ""} ${player.username === user.username ? "me" : "others"}`} onClick={() => {
            if(user.username !== player.username) {
              onChooseNextPlayer(player.username)
              }
            }}>
            <div className="playerName">{player.username}</div>
            <div className="profilePictureSection">
              {(player.username === user.username) && user.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt={user.username}
                  className="profilePictureSmall"
                />
              ) : (
                <FaUserCircle size={60} className="profilePicturePlaceholder" />
              )}
            </div>
            {capacity > 1 && (
                <div className="HP">
                  <div className="HealthBar" style={{ width: `${player.hp}%` }} />
                </div>
            )}
            <div>{player.score}</div>
          </div>
        ))}
      </div>
      <div className="timer">
        <div className="timerBar" style={{ width: `${progressBar * 100}%` }} />
      </div>
      {state === 'choice' && (
        <div className="question-card">
          <div className="question-text">Choose Question and Player to Attack</div>
          <div className={`options ${!isOnTurn || !nextPlayer ? 'disabled' : ''}`}>
            {questionChoices.map((choice) => (
              // we should discuss how many questions we show
              <button
                key={choice.id}
                className="option"
                onClick={() => {
                  if (!isOnTurn) return;
                  onChooseQuestion(choice.index, nextPlayer);
                }}
              >
                {choice.text}
              </button>
            ))}
          </div>
          <p className={`waiting-text ${isOnTurn ? 'your-turn' : ''}`}>
            {isOnTurn ? "It's your turn" : `Waiting for ${turn} to answer`}
          </p>
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
                    onAnswerQuestion(index);
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
            Correct answer: <b>{question.options[question.correctOption]}</b>
          </p>

          <p className="review-text">
            {turn} answered: <b>{question.options[chosenAnswer]}</b>
          </p>
        </div>
      )}
    </div>
  );
};

export default GameRoom;
