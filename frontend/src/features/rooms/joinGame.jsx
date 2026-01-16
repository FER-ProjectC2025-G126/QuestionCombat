import Button1 from '../../components/Button1';
import { useState } from 'react';
import useSocket from '../socket/useSocket';
import { Navigate } from 'react-router';
import Background from '../../components/Background';

function JoinGame() {
  const { isConnected, isLoading, appState, joinRoom } = useSocket();
  const [gameCode, setGameCode] = useState('');
  const [error, setError] = useState('');

  const handleJoinPublicGame = (roomName) => {
    if (!isConnected) {
      setError('Not connected to server!');
      return;
    }
    setError('');

    joinRoom(roomName);
  };

  const handleJoinPrivateGame = (e) => {
    e.preventDefault();

    if (!isConnected) {
      setError('Not connected to server!');
      return;
    } else if (!gameCode.trim()) {
      setError('Please enter game code!');
      return;
    }
    setError('');

    joinRoom(gameCode);
  };

  const onGameCodeChanged = (e) => setGameCode(e.target.value);

  if (isLoading && !appState?.type) return <div className="loader">Connecting to server...</div>;

  if (appState.type !== 'lobby') {
    return <Navigate to="/lobby" />;
  }
  return (
    <Background>
      <div className="block8">
        <Button1 to="/home" text="BACK" className="backBtn" />
        <div className="gameName">JOIN A ROOM</div>
        <div className="block4">
          <div className="elementOfBlock3">
            <div className="elmHeader">JOIN PUBLIC ROOM</div>
            <div className="gamesList">
              {appState.rooms && appState.rooms.length > 0 ? (
                appState.rooms.map((room) => (
                  <div
                    key={room.name}
                    className="gameCard"
                    onClick={() => handleJoinPublicGame(room.name)}
                  >
                    {room.name}
                  </div>
                ))
              ) : (
                <div className="noItemsMessage">No public rooms available.</div>
              )}
            </div>
          </div>
          <div className="elementOfBlock3">
            <div className="elmHeader">JOIN PRIVATE ROOM</div>
            <div className="elmCode">
              <form className="joinPrivateForm" onSubmit={handleJoinPrivateGame}>
                <input
                  className="joinInput"
                  type="text"
                  name="gameCode"
                  placeholder="Enter room name"
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
    </Background>
  );
}

export default JoinGame;
