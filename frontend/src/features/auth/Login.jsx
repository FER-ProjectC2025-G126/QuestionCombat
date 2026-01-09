import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from './AuthProvider';
import Button1 from '../../components/Button1';

function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const onUsernameChanged = (e) => setUsername(e.target.value);
  const onPasswordChanged = (e) => setPassword(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    api
      .post('/auth/login', {
        username,
        password,
      })
      .then(() => {
        return login();
      })
      .catch((error) => {
        console.error(error.response.data.error);
        setErrorMessage(error.response.data.error);
      });
  };

  return (
    <div>
      <div className="Container">
        <div id="q1" className="falling-question" style={{ left: '5vw' }}>
          ?
        </div>
        <div id="q2" className="falling-question" style={{ left: '20vw' }}>
          ?
        </div>
        <div id="q3" className="falling-question" style={{ left: '75vw' }}>
          ?
        </div>
        <div id="q4" className="falling-question" style={{ left: '90vw' }}>
          ?
        </div>

        <div className="LoginBlock">
          <div className="gameName">
            <h1 className="Header">WELCOME TO QUESTION COMBAT</h1>
          </div>
          <div className="LoginCard">
            <Button1 to="/home" text="HOME" className="backBtn" />
            <p className="text">Please login</p>
            <form onSubmit={handleSubmit} className="loginForm">
              <input
                className="loginInput"
                type="text"
                id="userName"
                name="userName"
                placeholder="Username"
                value={username}
                required
                onChange={onUsernameChanged}
                autoComplete="true"
              ></input>
              <br />
              <input
                className="loginInput"
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                value={password}
                required
                onChange={onPasswordChanged}
              ></input>
              <br />
              <Link to="/register">Don't have an account? Register here.</Link>
              {errorMessage && <div className="error">{errorMessage}</div>}
              <br />
              <button type="submit" className="submitBtn">
                LOGIN
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
