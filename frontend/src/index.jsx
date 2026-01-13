import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css';
import './styles/createNewGame.css';
import './styles/Home.css';
import './styles/joinGame.css';
import './styles/Login.css';
import './styles/Public.css';
import "./styles/Lobby.css"
import './styles/SingleplayerLobby.css';
import "./styles/GameRoom.css"
import './styles/Profile.css';
import './styles/Background.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
