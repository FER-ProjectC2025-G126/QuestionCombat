import useSocket from '../socket/useSocket';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import {useAuth} from "../auth/AuthProvider";

const GameRoom = () => {
  const { user } = useAuth();
  const { appState, leaveRoom } = useSocket();
  const [progressBar, setProgressBar] = useState(1);
  const [turn, setTurn] = useState("");
  const [question, setQuestion] = useState({});
  const [questionChoices, setQuestionChoices] = useState([]);
  const [state, setState] = useState("");
  const [isOnTurn, setIsOnTurn] = useState(false);

  useEffect(() => {
    if(appState?.timer?.percentage) {
        setProgressBar(appState.timer.percentage);
    }
    if(appState?.turn) {
      setTurn(appState.turn);
    }
    if(appState?.question) {
      setQuestion(appState.question);
    }
     if(appState?.questionChoices) {
      setQuestionChoices(appState.questionChoices);
    }
    if(appState?.state) {
      setState(appState.state);
    }
    setIsOnTurn(user.username === appState?.turn);
    console.log(appState);
  }, [appState])

  const onLeaveClicked =  () => {
    leaveRoom();
  }

  if(!appState) return <div>Loading...</div>

  if (appState.type === 'lobby') {
    return <Navigate to="/home" />;
  }

  return (
    <div className='gameRoom'>
        <h1>Game Room</h1>
        <p>{turn}`s turn</p>
        {state === "choice" && (
  <div className="question-card">
    <div className="question-text">Choose Question</div>

    <div className={`options ${!isOnTurn ? "disabled" : ""}`}>
      {questionChoices.map((q) => (
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

    {!isOnTurn && (
      <p className="waiting-text">
        Waiting for {turn} to choose a question...
      </p>
    )}
  </div>
)}
       {state === "answer" && (
  <div className="question-card" data-id={question.id}>
    <div className="question-text">{question.text}</div>

    <div className={`options ${!isOnTurn ? "disabled" : ""}`}>
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

    {!isOnTurn && (
      <p className="waiting-text">
        Waiting for {turn} to answer
      </p>
    )}
  </div>
)}
{state === "review" && (
  <div className="question-card">
    <div className="question-text">Result</div>

    <p className="review-text">
      Correct answer <b>{question.correctOption}</b>
    </p>

    <p className="review-text">
      {turn} answered: <b>{question.playerAnswer}</b>
    </p>
  </div>
)}
        <div className="progress">
        <div
          className="progressBar"
          style={{ width: `${progressBar * 100}%` }}
        />
      </div>
      <button onClick={onLeaveClicked} type="button" className="leaveBtn">
        Leave Room
      </button>
    </div>
  )
}

export default GameRoom