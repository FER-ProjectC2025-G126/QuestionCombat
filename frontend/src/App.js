import React from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./pages/Home";
import NotFoundPage from "./pages/NotFound";
import LoginPage from "./features/auth/Login";
import SignUpPage from "./features/auth/SignUp";
import CreateNewGame from "./pages/createNewGame";
import JoinGame from "./pages/joinGame";
import { AuthProvider } from "./features/auth/AuthProvider";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route index element={<LoginPage />} />
          <Route path="register" element={<SignUpPage />} />

          <Route path="home" element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="createNewGame" element={<CreateNewGame />} />
          <Route path="joinGame" element={<JoinGame />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
