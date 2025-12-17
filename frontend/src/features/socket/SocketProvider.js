import { SocketContext } from "./SocketContext";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { Outlet } from "react-router";
import React from "react";

function createSocketConnection() {
  return io({
    autoConnect: false,
  });
}

const SocketProvider = () => {
  const socketRef = useRef();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const newSocket = createSocketConnection();
    socketRef.current = newSocket;

    // Handles the socket connection event
    const handleConnect = () => {
      console.log("Socket connected", newSocket.id);

      setIsConnected(true);
      setIsLoading(false);
    };

    // Handles the socket disconnection event, i.e. if the connection is lost
    const handleDisconnect = () => {
      console.log("Socket disconnected");

      setIsConnected(false);
      setIsLoading(false);
    };

    // Handles the socket connection error event, e.g. the server is down
    const handleConnectError = (error) => {
      console.error("Socket connection error", error);

      setIsLoading(false);
    };

    newSocket.on("connect", handleConnect);
    newSocket.on("disconnect", handleDisconnect);
    newSocket.on("connect_error", handleConnectError);

    // Connects to the server
    newSocket.connect();

    // Cleans up the event listeners and disconnects from the server
    return () => {
      newSocket.off("connect", handleConnect);
      newSocket.off("disconnect", handleDisconnect);
      newSocket.off("connect_error", handleConnectError);
      newSocket.disconnect();
    };
  }, []);

  const value = { socket: socketRef.current, isConnected, isLoading };

  return (
    <SocketContext.Provider value={value}>
      <Outlet />
    </SocketContext.Provider>
  );
};

export default SocketProvider;
