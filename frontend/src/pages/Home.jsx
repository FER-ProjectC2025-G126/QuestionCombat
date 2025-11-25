import React from "react";
import Button1 from "../components/Button1";

function HomePage() {
    return <div>
        <h1>Welcome to the Home Page</h1>
        <Button1 to="/about" text="Go to About Page" className="about-button" />
    </div>;
}

export default HomePage;
