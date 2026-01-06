import { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthProvider';
import api from '../api/api';
import Button1 from '../components/Button1';
import '../styles/AdminPanel.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [updatingUser, setUpdatingUser] = useState(null);

  // Check if user is admin
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="container">
        <div className="adminBlock">
          <div className="adminError">Access Denied: Admin privileges required</div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (username, newRole) => {
    if (username === user.username) {
      setError('You cannot change your own role!');
      return;
    }

    setUpdatingUser(username);
    setError('');
    setMessage('');

    try {
      await api.put(`/auth/users/${username}/role`, { role: newRole });

      // Update local state
      setUsers(users.map((u) => (u.username === username ? { ...u, role: newRole } : u)));

      setMessage(`Successfully updated ${username}'s role to ${newRole}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update role');
    } finally {
      setUpdatingUser(null);
    }
  };

  return (
    <div className="container">
      <div className="adminBlock">
        <Button1 to="/home" text="BACK" className="backBtn" />
        <div className="adminTitle">Admin Panel</div>

        {error && <div className="adminError">{error}</div>}
        {message && <div className="adminSuccess">{message}</div>}

        <div className="adminContent">
          <div className="usersSection">
            <h2 className="usersTitle">Users Management</h2>

            {loading ? (
              <div className="adminLoading">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="noUsers">No users found</div>
            ) : (
              <div className="usersTable">
                <div className="tableHeader">
                  <div className="colUsername">Username</div>
                  <div className="colEmail">Email</div>
                  <div className="colRole">Role</div>
                  <div className="colActions">Actions</div>
                </div>

                {users.map((u) => (
                  <div key={u.username} className="tableRow">
                    <div className="colUsername">
                      <span className="username">{u.username}</span>
                      {u.username === user.username && <span className="youBadge">(You)</span>}
                    </div>
                    <div className="colEmail">{u.email}</div>
                    <div className="colRole">
                      <span className={`roleBadge role-${u.role.toLowerCase()}`}>{u.role}</span>
                    </div>
                    <div className="colActions">
                      {u.username === user.username ? (
                        <span className="noActions">Cannot change own role</span>
                      ) : (
                        <div className="roleButtons">
                          <button
                            className={`roleBtn ${u.role === 'USER' ? 'active' : ''}`}
                            onClick={() => handleRoleChange(u.username, 'USER')}
                            disabled={updatingUser === u.username}
                          >
                            User
                          </button>
                          <button
                            className={`roleBtn ${u.role === 'ADMIN' ? 'active' : ''}`}
                            onClick={() => handleRoleChange(u.username, 'ADMIN')}
                            disabled={updatingUser === u.username}
                          >
                            Admin
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
