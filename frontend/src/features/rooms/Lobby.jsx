import React from 'react';
import useSocket from '../socket/useSocket';
import { Navigate } from 'react-router';
import { useState, useEffect } from 'react';
import Button1 from '../../components/Button1';

const Lobby = () => {
  const { appState, leaveRoom } = useSocket();
  const [players, setPlayers] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('');

  useEffect(() => {
    if (appState.players) {
      setPlayers(appState.players);
    }
    if (appState.name) {
      setRoomName(appState.name);
    }
    if (appState.type) {
      setRoomType(appState.type);
    }
  }, [appState]);

  const onLeaveClicked = () => {
    leaveRoom();
  };

  if (roomType === 'lobby') {
    return <Navigate to="/joinGame" />;
  }

  return (
    <div className="container">
      <div className="block2">
        <div className="lobby-page">
          <h1 className="Lobbyh1">Lobby</h1>
          <div className="block5">
            <div className="roomName">
              <h2>Room name:</h2>
              <h3>{roomName}</h3>
            </div>
            <div className="players">
              <h2>Players:</h2>
              {players.map((player, index) => (
                <h3 key={index}>
                  {index + 1}. {player.username}
                </h3>
              ))}
            </div>
          </div>
          <div className='buttons'>
            <button onClick={onLeaveClicked} type="button" className="leaveBtn">
              Leave Room
            </button>
            <button type="submit" className="startBtn">
              START!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lobby;
