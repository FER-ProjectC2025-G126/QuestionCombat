import React from "react";
import "../styles/Home.css"
import Button1 from "../components/Button1";
import LogoutButton from "../components/LogoutButton";


function HomePage() {

    return (
        <div className="container">
            <div className="block">
                <LogoutButton />
                <div className="gameName">QUESTION COMBAT</div>
                <Button1 to="/createNewGame" text="Create a new game" className="btn"/>
                <Button1 to="/joinGame" text="Join a game" className="btn"/>
                <Button1 text="List of courses" className="btn" />
            </div>
        </div>
       );
}

export default HomePage;
