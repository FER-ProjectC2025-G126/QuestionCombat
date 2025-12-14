import React from "react";
import { useAuth } from "../features/auth/AuthProvider";
import { useNavigate } from "react-router";
import "../styles/createNewGame.css"


function CreateNewGame() {
    const {user} = useAuth();
    const navigate = useNavigate();
    if(!user) {
        navigate("/");
    }

    return <div>
        <div className="container">
            <div className="block">
                <p>New game</p>
            </div>
        </div>
        </div>;
}

export default CreateNewGame;
