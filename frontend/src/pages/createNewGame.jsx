import React from "react";
import { useAuth } from "../features/auth/AuthProvider";
import { useNavigate } from "react-router";
import "../styles/createNewGame.css"
import Button1 from "../components/Button1";


function CreateNewGame() {
    const {user} = useAuth();
    const navigate = useNavigate();
    if(!user) {
        navigate("/");
    }

    return <div>
        <div className="container">
            <div className="block2">
                <div className ="gameName">NEW GAME</div>
                <div className ="block3">
                    <div className="elementOfBlock2">
                        <h2 className="elmHeader">CHOOSE NUMBER OF PLAYERS</h2>
                            <form className="Forms">
                               <label className="Labels">
                                    <span>2 players</span>
                                    <input type="radio" name="players" value="2" />
                                </label>

                                <label className="Labels">
                                    <span>3 players</span>
                                    <input type="radio" name="players" value="3" />
                                </label>

                                <label  className="Labels">
                                    <span>4 players</span>
                                    <input type="radio" name="players" value="4" />
                                </label>
                            </form>
                    </div>
                    <div className="elementOfBlock2">
                        <h2 className="elmHeader">CHOOSE UP TO 5 COURSES</h2>
                    </div>
                    <div className="elementOfBlock2">
                        <h2 className="elmHeader">PRIVATE OR PUBLIC?</h2>
                        <form className="Forms">
                               <label className="Labels">
                                    <span>private</span>
                                    <input type="radio" name="gameType" value="private" />
                                </label>

                                <label className="Labels">
                                    <span>public</span>
                                    <input type="radio" name="gametype" value="public" />
                                </label>
                        </form>
                    </div>
                    <div className="elementOfBlock2">
                        <h2 className="elmHeader">READY?</h2>
                        <Button1 text="START!" className="startBtn"/>
                    </div>
                </div>
            </div>
        </div>
        </div>;
}

export default CreateNewGame;
