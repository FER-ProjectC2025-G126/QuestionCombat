import React from "react";
import { useAuth } from "../features/auth/AuthProvider";
import { useNavigate } from "react-router";
import Button1 from "../components/Button1";
import "../styles/joinGame.css"

function JoinGame() {
    const {user} = useAuth();
    const navigate = useNavigate();
    if(!user) {
        navigate("/");
    }

    return <div>
        <div className="container">
            <div className="block2">
                <div className="newHeader">
                    <span className="Arrow">&#129092;</span>  
                    <div className ="gameName">JOIN A GAME</div>
                </div>
                
                <div className="block4">
                        <div className ="elementOfBlock3">
                            <div className="elmHeader">JOIN PUBLIC GAME</div>
                        
                        {/* This gameList should be changed so that it reads info from the database :) */ }
                            <div className="gamesList">
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
                                <form className="joinPrivateForm">
                                    <input 
                                    type="text" 
                                    name="gameCode" 
                                    placeholder="Enter game code" 
                                    required />
                                    <Button1 text="ENTER" className="startBtn"/>
                                </form>
                            </div>
                        </div>    
                </div>
            </div>
        </div>
        </div>;
}

export default JoinGame;
