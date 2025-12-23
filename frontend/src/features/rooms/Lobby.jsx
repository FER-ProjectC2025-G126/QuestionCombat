import React from 'react';
import useSocket from '../socket/useSocket';
import { Navigate } from 'react-router';
import { useState } from 'react';

const Lobby = () => {
  const {appState, leaveRoom} = useSocket();
  const [redirect, setedirect] = useState(false);

  const onLeaveClicked = () => {
    leaveRoom();
    setedirect(true);
  }

  if(redirect) {
    return <Navigate to="/joinGame" />;
  }

  return <div>
    <h1>Lobby</h1>
    <button onClick={onLeaveClicked} type='button'>Leave Room</button>
  </div>;
};

export default Lobby;
