import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import HomePage from "./pages/Home";
import NotFoundPage from "./pages/NotFound";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route index element={<HomePage />} />

                <Route path="*" element={<NotFoundPage />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
