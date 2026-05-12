import React, { useEffect, useState } from 'react';
import { requireAuth, logout, api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const HostDashboard = () => {
  const [user, setUser] = useState(null);
  const [organisers, setOrganisers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const authUser = requireAuth();
    if (!authUser || authUser.role !== 'host') {
      navigate('/login');
      return;
    }
    setUser(authUser);
    loadOrganisers().finally(() => setLoading(false));
  }, [navigate]);

  const loadOrganisers = async () => {
    try {
      const data = await api('/users/organisers');
      setOrganisers(data);
    } catch (error) {
      setOrganisers([]);
      alert(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api('/users/create-organiser', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ name: '', email: '', password: '' });
      await loadOrganisers();
      alert('Organiser created');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this organiser?')) return;
    try {
      await api(`/users/organisers/${id}`, { method: 'DELETE' });
      await loadOrganisers();
    } catch (error) {
      alert(error.message);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="page-wrap">
      <div className="glass-card p-3 p-md-4 mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 className="brand mb-1">Host Dashboard</h3>
          <div className="small-note">{user.name} ({user.role})</div>
        </div>
        <button className="btn btn-brand btn-sm" onClick={logout}>Logout</button>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="glass-card p-3 p-md-4 h-100">
            <div className="section-title">Create Main Event Organiser</div>
            <form onSubmit={handleSubmit} className="row g-2" autoComplete="off">
              <div className="col-12">
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="form-control"
                  placeholder="Name"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="col-12">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="form-control"
                  placeholder="Email"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="col-12">
                <div className="input-group">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="form-control"
                    placeholder="Password"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
              <div className="col-12">
                <button className="btn btn-teal w-100">Create Organiser</button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="glass-card p-3 p-md-4 h-100">
            <div className="section-title">All Organisers</div>
            {loading ? (
              <p className="small-note">Loading organisers...</p>
            ) : organisers.length ? (
              organisers.map((organiser) => (
                <div key={organiser._id} className="border rounded p-2 mb-2 bg-white">
                  <strong>{organiser.name}</strong>
                  <br />
                  <span className="small-note">{organiser.email}</span>
                  <br />
                  <span className="small-note">Created: {new Date(organiser.createdAt).toLocaleString()}</span>
                  <br />
                  <button className="btn btn-sm btn-outline-danger mt-2" onClick={() => handleDelete(organiser._id)}>
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p className="small-note">No organisers found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostDashboard;
