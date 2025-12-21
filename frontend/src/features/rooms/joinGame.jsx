import React from "react";
import Button1 from "../../components/Button1";
import { useEffect, useState } from "react";
import useSocket from "../socket/useSocket";
import { Navigate } from "react-router";

function JoinGame() {
  const { isConnected, isLoading, appState, joinRoom } = useSocket();
  const [gameCode, setGameCode] = useState("");
  const [error, setError] = useState("");

  const handleJoinPublicGame = (roomName) => {
    if (!isConnected) {
      setError("Not connected to server!");
      return;
    }
    setError("");

    joinRoom(roomName);
  };

  const handleJoinPrivateGame = (e) => {
    e.preventDefault();

    if (!isConnected) {
      setError("Not connected to server!");
      return;
    } else if (!gameCode.trim()) {
      setError("Please enter game code!");
      return;
    }
    setError("");

    joinRoom(gameCode);
  };

  const onGameCodeChanged = (e) => setGameCode(e.target.value);

  if (isLoading && !appState)
    return <div className="loader">Connecting to server...</div>;

  if (appState.type !== "lobby") {
    return <Navigate to="/lobby" />;
  }
  return (
    <div className="container">
      <div className="block2">
        <Button1 to="/home" text="BACK" className="backBtn" />
        <div className="gameName">JOIN A GAME</div>
        <div className="block4">
          <div className="elementOfBlock3">
            <div className="elmHeader">JOIN PUBLIC GAME</div>
            <div className="gamesList">
              {appState.rooms.map((roomName) => (
                <div
                  key={roomName}
                  className="gameCard"
                  onClick={() => handleJoinPublicGame(roomName)}
                >
                  {roomName}
                </div>
              ))}
            </div>
          </div>
          <div className="elementOfBlock3">
            <div className="elmHeader">JOIN PRIVATE GAME</div>
            <div className="elmCode">
              <form
                className="joinPrivateForm"
                onSubmit={handleJoinPrivateGame}
              >
                <input
                  type="text"
                  name="gameCode"
                  placeholder="Enter game code"
                  value={gameCode}
                  onChange={onGameCodeChanged}
                />
                <button type="submit" className="startBtn">
                  ENTER
                </button>
                {error && <div className="error">{error}</div>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinGame;
