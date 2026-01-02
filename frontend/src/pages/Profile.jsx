import { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthProvider';
import api from '../api/api';
import Button1 from '../components/Button1';
import { FaUserCircle } from 'react-icons/fa';
import '../styles/Profile.css';

const Profile = () => {
  const { user, login } = useAuth();
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setProfilePicture(user.profilePicture || '');
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await api.put('/auth/profile', {
        bio,
        profilePicture: profilePicture || null,
      });

      await login();
      setMessage('Profile updated successfully!');
      setError('');
      setIsEditing(false);

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
      setMessage('');
    }
  };

  if (!user) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="profileBlock">
        <Button1 to="/home" text="BACK" className="backBtn" />
        <div className="profileTitle">My Profile</div>

        <div className="profileContent">
          <div className="profilePictureSection">
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="profilePictureLarge" />
            ) : (
              <FaUserCircle size={150} className="profilePicturePlaceholder" />
            )}
          </div>

          <div className="profileDetails">
            <div className="profileField">
              <label className="profileLabel">Username</label>
              <div className="profileValue">{user.username}</div>
            </div>

            <div className="profileField">
              <label className="profileLabel">Email</label>
              <div className="profileValue">{user.email}</div>
            </div>

            <div className="profileField">
              <label className="profileLabel">Bio</label>
              {isEditing ? (
                <textarea
                  className="profileTextarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              ) : (
                <div className="profileValue">{bio || 'No bio yet'}</div>
              )}
            </div>

            <div className="profileField">
              <label className="profileLabel">Profile Picture URL</label>
              {isEditing ? (
                <input
                  type="text"
                  className="profileInput"
                  value={profilePicture}
                  onChange={(e) => setProfilePicture(e.target.value)}
                  placeholder="https://example.com/your-photo.jpg"
                />
              ) : (
                <div className="profileValue">{profilePicture || 'No picture set'}</div>
              )}
            </div>

            {message && <div className="profileSuccess">{message}</div>}
            {error && <div className="profileError">{error}</div>}

            <div className="profileActions">
              {isEditing ? (
                <>
                  <button className="profileBtn profileBtnSave" onClick={handleSave}>
                    Save Changes
                  </button>
                  <button
                    className="profileBtn profileBtnCancel"
                    onClick={() => {
                      setIsEditing(false);
                      setBio(user.bio || '');
                      setProfilePicture(user.profilePicture || '');
                      setError('');
                      setMessage('');
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button className="profileBtn profileBtnEdit" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
