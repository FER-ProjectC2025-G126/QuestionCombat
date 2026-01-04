import Button1 from '../components/Button1';
import LogoutButton from '../components/LogoutButton';
import ProfileIcon from '../components/ProfileIcon';
import useSocket from '../features/socket/useSocket';
import { Navigate } from 'react-router';

function HomePage() {
  const { appState } = useSocket();

  if (!appState) return <div>Loading...</div>;

  if (appState.type === 'room') return <Navigate to="/lobby" />;

  return (
    <div className="container">
      <div className="block">
        <LogoutButton />
        <ProfileIcon />
        <div className="gameName">QUESTION COMBAT</div>
        <Button1 to="/singleplayerLobby" text="Singleplayer" className="btn" />
        <Button1 to="/createNewGame" text="Create a new room" className="btn" />
        <Button1 to="/joinGame" text="Join a room" className="btn" />
        <Button1 to="/listOfCourses" text="List of courses" className="btn" />
      </div>
    </div>
  );
}

export default HomePage;
