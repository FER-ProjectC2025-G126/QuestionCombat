import { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthProvider';
import api from '../api/api';
import Button1 from '../components/Button1';
import { FaUserCircle } from 'react-icons/fa';
import '../styles/Profile.css';
import Background from "../components/Background";

const Profile = () => {
  const { user, login } = useAuth();
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
  if (user) {
    setBio(user.bio || '');
    setPhotoUrl(user.profilePicture || '');
  }
}, [user]);

  const handleSave = async () => {
  try {
    const formData = new FormData();
    formData.append('bio', bio);

    if (photoFile) {
      formData.append('profilePicture', photoFile);
    }

    await api.put('/auth/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    await login();
    setMessage('Profile updated successfully!');
    setError('');
    setIsEditing(false);

  } catch (err) {
    setError(err.response?.data?.error || 'Failed to update profile');
    setMessage('');
  }
};

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setPhotoUrl(previewUrl);
    setPhotoFile(file);
  };

  if (!user) {
    return <div className="loader">Loading...</div>;
  }

  return (
    <Background>
      <div className="profileBlock">
        <Button1 to="/home" text="BACK" className="backBtn" />
        <div className="profileTitle">My Profile</div>

        <div className="profileContent">
          <div className="profilePictureSection">
  {photoUrl ? (
    <img src={photoUrl} alt="Profile" className="profilePictureLarge" />
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

              {isEditing && (
                <div className="profileField">
                <label className='profileLabel' htmlFor="edit_profile_photo">
                  Profile Picture
                </label>
                <input
                className='fileInput'
        type="file"
        accept="image/*"
        id="edit_profile_photo"
        onChange={handleFileChange}
      />
                 </div>
              )
            }
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
    </Background>
  );
};

export default Profile;
