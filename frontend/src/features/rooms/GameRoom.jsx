import useSocket from '../socket/useSocket';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthProvider';
import { FaUserCircle } from 'react-icons/fa';
import HPHearts from '../../components/HPhearts';
import api from '../../api/api';

const GameRoom = () => {
  const navigate = useNavigate();
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
  const [clicked, setClicked] = useState(false);
  const [pfps, setPfps] = useState({});


  useEffect(() => {
    if (!appState) return;

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
    if (appState.chosenAnswer !== null) {
      setChosenAnswer(appState.chosenAnswer);
    }
    if (appState.capacity) {
      setCapacity(appState.capacity);
    }
    for (let player of appState.players) {
      if (player.username === user.username) {
        setViewingStats(player.viewingStats);
        break;
      }
    }
    setIsOnTurn(user.username === appState.turn);
  }, [appState]);

  const fetchPfps = useCallback(() => {
  players.forEach((player) => {
    if (pfps[player.username]) return;

    api
      .get(`/public/profImg/${player.username}`)
      .then((response) => {
        setPfps((prev) => ({
          ...prev,
          [player.username]: response.data.profilePicture,
        }));
      })
      .catch((error) => {
        console.error(error.response?.data?.message);
      });
  });
}, [players, pfps]);

  useEffect(() => {
    fetchPfps()
  }, [players, fetchPfps]);

  const onLeaveClicked = () => {
    leaveRoom();
  };

  const onChooseQuestion = (questionId, username) => {
    setNextPlayer('');
    chooseQuestion(questionId, username);
  };

  const onAnswerQuestion = (answerIndex) => {
    answerQuestion(answerIndex);
  };

  const onChooseNextPlayer = (player) => {
    if (state !== 'choice') return;
    setClicked((prev) => !prev);
    setNextPlayer(player);
  };

  if (!appState) return <div>Loading...</div>;

  if (appState.type === 'lobby') {
    navigate('/home');
    window.location.reload();
    return null;
  }

  if (viewingStats && !appState?.started) {
    navigate('/leaderboard');
    return null;
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
          <div
            key={player.username}
            className={`playerCard ${clicked && nextPlayer === player.username ? 'clicked' : ''} ${player.username === user.username ? 'me' : 'others'}`}
            onClick={() => {
              if (turn !== player.username && user.username !== player.username) {
                onChooseNextPlayer(player.username);
              }
            }}
          >
            <div className="playerName">{player.username}</div>
            <div className="profilePictureSelection">
  {pfps[player.username] ? (
    <img
      src={pfps[player.username]}
      alt="Profile"
      className="profileIconImage"
    />
  ) : (
    <FaUserCircle size={40} color="#FF7300" />
  )}
</div>
            {capacity > 1 && (
              <div className="HP">
                <HPHearts hp={Math.round((player.hp / 100) * 10)} />
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
          {isOnTurn && (<div className="question-text">Choose Question and Player to Attack</div>)}
          <div className={`options ${!isOnTurn || !nextPlayer || !clicked ? 'disabled' : ''}`}>
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
            {isOnTurn ? "It's your turn" : `Waiting for ${turn} to choose`}
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
