import React from "react";
import api from "../api/api";
import { IoIosLogOut } from "react-icons/io";
import { useAuth } from "../features/auth/AuthProvider";

const LogoutButton = () => {
  const { logout } = useAuth();
  const onLogoutClicked = () => {
    api.post("/auth/logout").then(() => {
      console.log("Logged out successfully");
      return logout();
    });
  };
  return (
    <div className="logoutBtn" onClick={onLogoutClicked}>
      <IoIosLogOut size={30} />
    </div>
  );
};

export default LogoutButton;
