import { useState } from 'react';
import React from 'react';
import {Link, useNavigate} from 'react-router';
import api from '../../api/api';
import "../../styles/Login.css";

function SignUpPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const onUsernameChanged = e => setUsername(e.target.value);
    const onPasswordChanged = e => setPassword(e.target.value);
    const onConfirmPasswordChanged = e => setConfirmPassword(e.target.value);
    const onEmailChanged = e => setEmail(e.target.value);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(password !== confirmPassword){
            console.error("Passwords do not match");
            setErrorMessage("Passwords do not match");
            return;
        }
        api.post('/auth/register', {
                username,
                password,
                email
            })
            .then((response) => {
                console.log(response.data);
                setErrorMessage('');
                navigate('/home');
            })
            .catch((error) => {
                console.error(error.response.data.error);
                setErrorMessage(error.response.data.error);
            });
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
                    <p>Please signup</p>
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
                            type="email"
                            id="Email"
                            name="Email"
                            placeholder="Email"
                            value={email}
                            required
                            onChange={onEmailChanged}
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
                        <input 
                            type="password"
                            id="confirmPpassword"
                            name="confirmPassword"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            required
                            onChange={onConfirmPasswordChanged}>
                        </input>
                        <br />
                        <Link to="/">Have an account? Login here.</Link>
                        {errorMessage && <div className="error">{errorMessage}</div>}
                        <br />
                        <button type ="submit">SIGNUP</button>
                    </form>
                 </div>
            </div>
        </div>
    </div>;
}

export default SignUpPage;