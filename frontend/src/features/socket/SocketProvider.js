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
  const [appState, setAppState] = useState(null);

  useEffect(() => {
    const newSocket = createSocketConnection();
    socketRef.current = newSocket;

    const handleConnect = () => {
      console.log("Socket connected", newSocket.id);

      setIsConnected(true);
      setIsLoading(false);
    };

    const handleDisconnect = () => {
      console.log("Socket disconnected");

      setIsConnected(false);
      setIsLoading(false);
    };

    const handleConnectError = (error) => {
      console.error("Socket connection error", error);

      setIsLoading(false);
    };

    const handleStateUpdate = (state) => {
      setAppState(state);
    };

    newSocket.on("connect", handleConnect);
    newSocket.on("disconnect", handleDisconnect);
    newSocket.on("connect_error", handleConnectError);
    newSocket.on("stateUpdate", handleStateUpdate);

    newSocket.connect();

    return () => {
      newSocket.off("stateUpdate", handleStateUpdate);
      newSocket.disconnect();
    };
  }, []);

  const joinRoom = (roomName) => {
    if (!socketRef.current) return;
    socketRef.current.emit("joinRoom", roomName);
  };

  const createRoom = (roomName) => {
    if (!socketRef.current) return;
    socketRef.current.emit("createRoom", roomName);
  };

  const leaveRoom = () => {
    if (!socketRef.current) return;
    socketRef.current.emit("leaveRoom");
  };

  const value = {
    socket: socketRef.current,
    isConnected,
    isLoading,
    appState,
    joinRoom,
    createRoom,
    leaveRoom,
  };

  return (
    <SocketContext.Provider value={value}>
      <Outlet />
    </SocketContext.Provider>
  );
};

export default SocketProvider;
