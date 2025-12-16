import React from "react";
import Button1 from "../../components/Button1";
import "../../styles/joinGame.css"
import { useEffect, useState } from "react";
import useSocket from "../socket/useSocket";
import { Navigate } from "react-router";

function JoinGame() {
    const { socket, isConnected, isLoading } = useSocket();
    const [gameCode, setGameCode] = useState("");
    const [error, setError] = useState(null)

  const handleJoinPublicGame = (roomId) => {
    if (!isConnected) {
        setError("Not connected to server!");
        return;
    };
    setError(null)

    socket.emit("room:join", { roomId });
  };

  const handleJoinPrivateGame = (e) => {
    e.preventDefault();

    if (!isConnected) {
        setError("Not connected to server!");
        return;
    } else if(!gameCode) {
        setError("Please enter game code!");
        return;
    }

    socket.emit("room:join", { roomId: gameCode });
};

const onGameCodeChanged = (e) => setGameCode(e.target.value);

  useEffect(() => {
    if (!socket) return;

    const handleJoined = ({ roomId }) => {
      console.log("Joined room:", roomId);
      //TODO <Navigate to={`game/${roomId}`}/>
    };

    const handleError = ({ message }) => {
      setError(message);
    };

    socket.on("room:joined", handleJoined);
    socket.on("room:error", handleError);

    return () => {
      socket.off("room:joined", handleJoined);
      socket.off("room:error", handleError);
    };
  }, [socket]);

  {/* if(isLoading) return <div className="loader">Connecting to server...</div> this will be added later when backend is finished*/}

    return (
        <div className="container">
            <div className="block2">
                <Button1 to="/home" text="BACK" className="backBtn"/> 
                <div className ="gameName">JOIN A GAME</div>
                <div className="block4">
                        <div className ="elementOfBlock3">
                            <div className="elmHeader">JOIN PUBLIC GAME</div>
                        
                        {/* This gameList should be changed so that it reads info from the database :) */ }
                            <div className="gamesList">
                                {/* games.map(id => (
                                    <div key={id} className="gameCard" onClick={handleJoinPublicGame(id)}>
                                        Game #{id}
                                    </div>
                                )) this will be added later when backend is finished */} 
                                <div className="gameCard">Game #1</div>
                                <div className="gameCard">Game #2</div>
                                <div className="gameCard">Game #3</div>
                                <div className="gameCard">Game #4</div>
                                <div className="gameCard">Game #5</div>
                                <div className="gameCard">Game #1</div>
                                <div className="gameCard">Game #2</div>
                                <div className="gameCard">Game #3</div>
                                <div className="gameCard">Game #4</div>
                                <div className="gameCard">Game #5</div>
                            </div>

                        </div>

                        <div className ="elementOfBlock3">
                            <div className="elmHeader">JOIN PRIVATE GAME</div>
                            <div className="elmCode">
                                <form className="joinPrivateForm" onSubmit={handleJoinPrivateGame}>
                                    <input 
                                    type="text" 
                                    name="gameCode" 
                                    placeholder="Enter game code" 
                                    value={gameCode}
                                    onChange={onGameCodeChanged}
                                    />
                                    <button type="submit" className="startBtn">ENTER</button>
                                    {error && (
                                        <div className="error">{error}</div>
                                    )}
                                </form>
                            </div>
                        </div>    
                </div>
            </div>
        </div>
    );
}

export default JoinGame;
