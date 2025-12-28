import useSocket from '../socket/useSocket';
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router';

const GameRoom = () => {
  const { appState, leaveRoom } = useSocket();
  const [progressBar, setProgressBar] = useState(1);

  useEffect(() => {
    if(appState?.timer?.percentage) {
        setProgressBar(appState.timer.percentage);
    }
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