import React from "react";
import { NavLink } from "react-router";

function Button1({ to, text, className }) {
    return (
        <NavLink to={to} className={className}>
            <p>{text}</p>
        </NavLink>
    );
}

export default Button1;
