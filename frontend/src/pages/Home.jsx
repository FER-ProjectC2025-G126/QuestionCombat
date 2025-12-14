import React from "react";
import "../styles/Home.css"
import { useAuth } from "../features/auth/AuthProvider";
import { useNavigate } from "react-router";
import Button1 from "../components/Button1";


function HomePage() {
    const {user} = useAuth();
    const navigate = useNavigate();
    if(!user) {
        navigate("/");
    }

    return <div>
        <div className="container">
            <div className="block">
                <div className="gameName">QUESTION COMBAT</div>
                <Button1 to="/createNewGame" text="Create a new game" className="btn"/>
                <Button1 text="Join a game with a code" className="btn"/>
                <Button1 text="List of courses" className="btn" />
            </div>
        </div>
        </div>;
}

export default HomePage;
