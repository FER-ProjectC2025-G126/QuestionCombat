import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import HomePage from "./pages/Home";
import NotFoundPage from "./pages/NotFound";
import LoginPage from './pages/Logn';

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route index element={<LoginPage />} />

                <Route path="*" element={<NotFoundPage />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
