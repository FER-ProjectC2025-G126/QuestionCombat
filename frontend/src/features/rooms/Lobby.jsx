import React from 'react';
import useSocket from '../socket/useSocket';
import { Navigate } from 'react-router';
import { useState, useEffect } from 'react';

const Lobby = () => {
  const {appState, leaveRoom} = useSocket();
  const [players, setPlayers] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("");

  useEffect(() => {
    if(appState.players) {
      setPlayers(appState.players);
    }
    if(appState.name) {
      setRoomName(appState.name);
    }
    if(appState.type) {
      setRoomType(appState.type);
    }
  }, [appState]);
  

  const onLeaveClicked = () => {
    leaveRoom();
  }

  if(roomType === "lobby") {
    return <Navigate to="/joinGame" />;
  }

  return <div className='lobby-page'>
    <h1>Lobby</h1>
    <h2>{roomName}</h2>
    <div className='players'>
      {players.map((player, index) => (
        <div key={index}>{player.username}</div>
      ))}
    </div>
    <button onClick={onLeaveClicked} type='button'>Leave Room</button>
  </div>;
};

export default Lobby;
