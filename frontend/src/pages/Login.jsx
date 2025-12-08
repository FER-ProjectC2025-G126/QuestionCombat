import { useState } from 'react';
import React from 'react';
import {Link, useNavigate} from "react-router";
import api from '../app/api';
import '../styles/Login.css'

function LoginPage(){
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const onUsernameChanged = e => setUsername(e.target.value);
    const onPasswordChanged = e => setPassword(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', {
                username,
                password
            });
            console.log('Login successful:', response.data);
            //navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error.message);
        }
    }

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
                    <form onSubmit={handleSubmit} className="loginForm">
                        <input 
                            type="text"
                            id="userName"
                            name="userName"
                            placeholder="Username"
                            value={username}
                            required
                            onChange={onUsernameChanged}
                            autoComplete='true'>
                        </input>
                        <br />
                         <input 
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Password"
                            value={password}
                            required
                            onChange={onPasswordChanged}>
                        </input>
                        <br />
                        <Link to="register">Don't have an account? Register here.</Link>
                        <br />
                        <button type ="submit">LOGIN</button>
                    </form>
                 </div>
            </div>
        </div>
    </div>;
}

export default LoginPage;