import React from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./pages/Home";
import NotFoundPage from "./pages/NotFound";
import LoginPage from "./pages/Login";
import SignUpPage from "./pages/SignUp";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<LoginPage />} />
        <Route path="register" element={<SignUpPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
