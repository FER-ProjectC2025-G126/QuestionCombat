import Button1 from '../components/Button1';
import LogoutButton from '../components/LogoutButton';
import ProfileIcon from '../components/ProfileIcon';
import useSocket from '../features/socket/useSocket';
import { Navigate } from 'react-router';
import { useAuth } from '../features/auth/AuthProvider';

function HomePage() {
  const { appState } = useSocket();
  const { user } = useAuth();

  if (!appState) return <div>Loading...</div>;

  if (appState.type === 'room') return <Navigate to="/lobby" />;

  return (
    <div className="container">
      <div className="block">
        <LogoutButton />
        <ProfileIcon />
        <div className="gameName">QUESTION COMBAT</div>
        <div className="buttonsHomeGroup">
          {user?.role === 'ADMIN' && <Button1 to="/admin" text="Admin Panel" className="ProfilBtn" />}
          <Button1 to="/singleplayerLobby" text="Singleplayer" className="btn" />
          <Button1 to="/createNewGame" text="Create a new room" className="btn" />
          <Button1 to="/joinGame" text="Join a room" className="btn" />
          <Button1 to="/listOfCourses" text="List of courses" className="btn" />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
