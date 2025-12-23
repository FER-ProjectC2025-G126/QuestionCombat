import { SocketContext } from './SocketContext';
import { useContext } from 'react';

const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider.');
  }

  return context;
};

export default useSocket;
