import React from "react";
import '../styles/Login.css'

function LoginPage(){
    return <div>
        <div className="Container">
            <div id ="q1" className="falling-question" style={{ left: '5vw' }}>?</div>
            <div id ="q2"className="falling-question" style={{ left: '20vw' }}>?</div>
            <div id= "q3" className="falling-question" style={{ left: '75vw' }}>?</div>
            <div id ="q4"className="falling-question" style={{ left: '90vw' }}>?</div>

            <div className="LoginBlock">
                <div className="gameName">
                    <h1 className="Header">WELCOME TO QUESTION COMBAT</h1>
                </div>
                 <div className="LoginCard">
                    <p>Please login</p>
                    <form className="loginForm">
                        <input 
                            type="text"
                            id="userName"
                            name="userName"
                            placeholder="Username"
                            required>
                        </input>
                        <br />
                         <input 
                            type="email"
                            id="Email"
                            name="Email"
                            placeholder="Email"
                            required>
                        </input>
                        <br />
                         <input 
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Password"
                            required>
                        </input>
                        <br />
                        <button type ="submit">LOGIN</button>
                    </form>
                 </div>
            </div>
        </div>
    </div>;
}

export default LoginPage;