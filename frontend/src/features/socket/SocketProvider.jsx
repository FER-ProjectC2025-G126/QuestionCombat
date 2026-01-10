import { SocketContext } from './SocketContext';
import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Outlet } from 'react-router-dom';
import Lobby from '../rooms/Lobby';

// Create socket connection using explicit WS URL if provided, otherwise fallback to current origin
function createSocketConnection() {
  const socketUrl = import.meta.env.VITE_WS_URL || window.location.origin;
  return io(socketUrl, {
    autoConnect: false,
    withCredentials: true,
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

    const handleStateUpdate = (state) => {
      setAppState(state)
    };

    const handleConnect = () => {
      console.log("Connected successfully!");
      setIsConnected(true);
      setIsLoading(false);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleConnectError = (error) => {
      console.error('Socket connection error', error);
      setIsLoading(false);
    };

    newSocket.on('stateUpdate', handleStateUpdate);
    newSocket.on('connect', handleConnect);
    newSocket.on('disconnect', handleDisconnect);
    newSocket.on('connect_error', handleConnectError);

    newSocket.connect();

    return () => {
      newSocket.off('stateUpdate', handleStateUpdate);
      newSocket.disconnect();
    };
  }, []);

  const joinRoom = (roomName) => {
    if (!socketRef.current) return;
    socketRef.current.emit('joinRoom', roomName);
  };

  const createRoom = (options) => {
    if (!socketRef.current) return;
    const { maxPlayers, visibility, questionSetIds } = options;
    const isPrivate = visibility === 'private';
    socketRef.current.emit('createRoom', maxPlayers, isPrivate, questionSetIds || []);
  };

  const leaveRoom = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('leaveRoom');
  };

  const startGame = () => {
    if (!socketRef.current) return;
    socketRef.current.emit("startGame");
  }

  const chooseQuestion = (questionId, username) => {
    if (!socketRef.current) return;
    socketRef.current.emit("chooseQuestion", questionId, username);
  }

  const answerQuestion = (answer) => {
    if (!socketRef.current) return;
    socketRef.current.emit("submitAnswer", answer);
  }

  const value = {
    socket: socketRef.current,
    isConnected,
    isLoading,
    appState,
    joinRoom,
    createRoom,
    leaveRoom,
    startGame,
    chooseQuestion,
    answerQuestion,
  };

  return (
    <SocketContext.Provider value={value}>
      <Outlet />
    </SocketContext.Provider>
  );
};

export default SocketProvider;
