import React from 'react';
import Button1 from "../components/Button1";

function NotFoundPage() {
    return (
        <div>
            <h1>404 - Page not found</h1>
            <Button1 to="/" text="Go to Home" className="home-button" />
        </div>
    );
}

export default NotFoundPage;
