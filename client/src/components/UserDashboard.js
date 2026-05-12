import React, { useEffect, useState } from 'react';
import { requireAuth, logout } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authUser = requireAuth();
    if (!authUser) {
      navigate('/login');
      return;
    }
    if (authUser.role !== 'user') {
      // redirectByRole
      navigate('/login');
      return;
    }
    setUser(authUser);
  }, [navigate]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="page-wrap">
      <div className="glass-card p-3 p-md-4 mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 className="brand mb-1">User Dashboard</h3>
          <div className="small-note">{user.name} ({user.role})</div>
        </div>
        <div>
          <button className="btn btn-outline-dark btn-sm" onClick={() => navigate('/team-management')}>Team Management</button>
          <button className="btn btn-brand btn-sm" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="glass-card p-3 p-md-4">
            <div className="section-title">Main Event Wise Events</div>
            <div className="events-stack">Events will be loaded here...</div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="glass-card p-3 p-md-4">
            <div className="section-title">My Registrations</div>
            <div>Registrations will be loaded here...</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;