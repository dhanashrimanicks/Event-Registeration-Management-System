import React, { useEffect, useState } from 'react';
import { requireAuth, logout } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const ManagementDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authUser = requireAuth();
    if (!authUser || authUser.role !== 'management') {
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
          <h3 className="brand mb-1">Management Dashboard</h3>
          <div className="small-note">{user.name} ({user.role})</div>
        </div>
        <div>
          <button className="btn btn-brand btn-sm" onClick={logout}>Logout</button>
        </div>
      </div>
      <div>Management dashboard content...</div>
    </div>
  );
};

export default ManagementDashboard;