import React from "react";
import "../../styles/createNewGame.css";
import Button1 from "../../components/Button1";
import { useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router";

function CreateNewGame() {
    const navigate = useNavigate();
    const [numOfPlayers, setNumOfPlayers] = useState("");
    const [gameType, setGameType] = useState("");
    const [error, setError] = useState("");

    const onNumOfPlayersChange = (e) => setNumOfPlayers(e.target.value);
    const onGameTypeChange = (e) => setGameType(e.target.value);

    const onSubmitClicked = (e) => {
        e.preventDefault();
        if(!numOfPlayers) {
            setError("Choose number of players!")
            return;
        } else if (!gameType) {
            setError("Choose game type!")
            return;
        }
        api.post("/todo", {
            numOfPlayers,
            gameType    
        }).then((response) => {
            console.log(response.data.message);
            navigate("/") //TODO
        }).catch(error => {
            console.error(error.response.data.message);
            setError(error.response.data.message)
        }).finally(() => setLoading(false));
    }

    return  (<div className="container">
            <form className="block2" onSubmit={onSubmitClicked}>
                <Button1 to="/home" text="BACK" className="backBtn"/>
                <div className ="gameName">NEW GAME</div>
                <div className ="block3">
                    <div className="elementOfBlock2">
                        <h2 className="elmHeader">CHOOSE NUMBER OF PLAYERS</h2>
                            <div className="Forms">
                               <label className="Labels">
                                    <span>2 players</span>
                                    <input type="radio" name="players" value="2" onChange={onNumOfPlayersChange}/>
                                </label>

                                <label className="Labels">
                                    <span>3 players</span>
                                    <input type="radio" name="players" value="3" onChange={onNumOfPlayersChange}/>
                                </label>

                                <label  className="Labels">
                                    <span>4 players</span>
                                    <input type="radio" name="players" value="4" onChange={onNumOfPlayersChange}/>
                                </label>
                            </div>
                    </div>
                    <div className="elementOfBlock2">
                        <h2 className="elmHeader">CHOOSE UP TO 5 COURSES</h2>
                    </div>
                    <div className="elementOfBlock2">
                        <h2 className="elmHeader">PRIVATE OR PUBLIC?</h2>
                        <div className="Forms">
                               <label className="Labels">
                                    <span>private</span>
                                    <input type="radio" name="gameType" value="private" onChange={onGameTypeChange} />
                                </label>

                                <label className="Labels">
                                    <span>public</span>
                                    <input type="radio" name="gameType" value="public" onChange={onGameTypeChange}/>
                                </label>
                        </div>
                    </div>
                    <div className="elementOfBlock2">
                        <h2 className="elmHeader">READY?</h2>
                        <button type="submit" className="startBtn">START!</button>
                        {error && (
                            <div className="error">{error}</div>
                        )}
                    </div>
                </div>
            </form>
        </div>)
}

export default CreateNewGame;
