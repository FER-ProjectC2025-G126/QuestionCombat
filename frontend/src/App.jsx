import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home';
import NotFoundPage from './pages/NotFound';
import LoginPage from './features/auth/Login';
import SignUpPage from './features/auth/SignUp';
import CreateNewGame from './features/rooms/createNewGame';
import JoinGame from './features/rooms/joinGame';
import { AuthProvider } from './features/auth/AuthProvider';
import RequireAuth from './features/auth/RequireAuth';
import PublicOnly from './features/auth/PublicOnly';
import SocketProvider from './features/socket/SocketProvider';
import Public from './pages/Public';
import Lobby from './features/rooms/Lobby';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public page is accessible to everyone */}
          <Route index element={<Public />} />

          {/* Auth-only pages (login/register) should be inaccessible when already authed */}
          <Route element={<PublicOnly />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<SignUpPage />} />
          </Route>

          {/* Protected routes start */}
          <Route element={<RequireAuth />}>
            <Route element={<SocketProvider />}>
              <Route path="home" element={<HomePage />} />
              <Route path="createNewGame" element={<CreateNewGame />} />
              <Route path="joinGame" element={<JoinGame />} />
              <Route path="lobby" element={<Lobby />} />
            </Route>
          </Route>
          {/* Protected routes end */}

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
