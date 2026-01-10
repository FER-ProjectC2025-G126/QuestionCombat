import { useNavigate } from 'react-router';
import { useAuth } from '../features/auth/AuthProvider';
import { FaUserCircle } from 'react-icons/fa';
import '../styles/Profile.css';

const ProfileIcon = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="profileIcon" onClick={() => navigate('/profile')} title="View Profile">
      {user.profilePicture ? (
        <img src={user.profilePicture} alt="Profile" className="profileIconImage" />
      ) : (
        <FaUserCircle size={40} color="#FF7300" />
      )}
    </div>
  );
};

export default ProfileIcon;
