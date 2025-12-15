import React from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import HomePage from "./pages/Home";
import NotFoundPage from "./pages/NotFound";
import LoginPage from "./features/auth/Login";
import SignUpPage from "./features/auth/SignUp";
import CreateNewGame from "./features/rooms/createNewGame";
import { AuthProvider } from "./features/auth/AuthProvider";
import RequireAuth from "./features/auth/RequireAuth";
import PublicOnly from "./features/auth/PublicOnly";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes start */}
          <Route element={<PublicOnly />}>
            <Route index element={<LoginPage />} />
            <Route path="register" element={<SignUpPage />} />
          </Route>
          {/* Public routes end */}
          {/* Protected routes start */}
          <Route element={<RequireAuth />}>
            <Route path="home" element={<HomePage />} />
            <Route path="createNewGame" element={<CreateNewGame />} />
          </Route>
          {/* Protected routes end */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
