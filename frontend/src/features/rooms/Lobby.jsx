import useSocket from '../socket/useSocket';
import { Navigate } from 'react-router';
import { useState, useEffect } from 'react';
import Background from "../../components/Background.jsx";

const Lobby = () => {
  const { appState, leaveRoom, startGame } = useSocket();
  const [players, setPlayers] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('');
  const [capacity, setCapacity] = useState('');
  const [questionSets, setQuestionSets] = useState([]);

  useEffect(() => {
    if (appState?.players) {
      setPlayers(appState.players);
    }
    if (appState?.name) {
      setRoomName(appState.name);
    }
    if(appState?.capacity) {
      setCapacity(appState.capacity);
    }
    if(appState?.questionSets) {
      setQuestionSets(appState.questionSets);
    }
    if (appState?.type) {
      setRoomType(appState.type);
    }
  }, [appState]);

  const onLeaveClicked = () => {
    leaveRoom();
  };

  const onStartClicked = () => {
      startGame();
  }

  if(!appState) return <div>Loading...</div>

  if (roomType === 'lobby') {
    return <Navigate to="/home" />;
  }

  if(appState.started) {
    return <Navigate to="/gameRoom" />;
  }

  return (
    <Background>
      <div className="block2">
        <button onClick={onLeaveClicked} type="button" className="leaveBtn lobby">
              Leave Room
            </button>
        <div className="lobby-page">
          <h1 className="Lobbyh1">Lobby</h1>
          <div className="block5">
            <div className='left'>
              <div className="roomName">
                <h2>Room name:</h2> 
                <h3>{roomName}</h3>
              </div>
              <h2 className='qSets-title'>Question Sets:</h2>
              <div className='Forms-qSets'>
                {questionSets.map((questionSet) => (
                  <div
                    key={questionSet.id}
                    className="courseCard-view"
                  >
                    <div className="courseTitle">{questionSet.title}</div>
                    <div className="courseDescription">{questionSet.description}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className='right'>
              <div className="players">
              <h2>Players:</h2>
              {players.map((player, index) => (
                <h3 key={index}>
                  {index + 1}. {player.username}
                </h3>
              ))}
            </div>
            <div className='capacity'>
                <h2 className='capacity-title'>Room Capacity:</h2>
                <h3 className='capacity-body'>{players.length}/{capacity} players</h3>
              </div>
            </div>
          </div>
          <div className='buttons'>
            <button type="button" className="startBtn" onClick={onStartClicked}>
              START!
            </button>
          </div>
        </div>
      </div>
    </Background>
  );
};

export default Lobby;
