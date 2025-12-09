import React from "react";
import Button1 from "../components/Button1";
import { useAuth } from "../features/auth/AuthProvider";
import { useNavigate } from "react-router";

function HomePage() {
    const {user} = useAuth();
    const navigate = useNavigate();
    if(!user) {
        navigate("/");
    }

    return <div>
        <h1>Welcome to the Home Page</h1>
        <Button1 to="/about" text="Go to About Page" className="about-button" />
    </div>;
}

export default HomePage;
