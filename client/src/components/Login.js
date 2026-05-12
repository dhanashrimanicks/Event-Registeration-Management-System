import React, { useState } from 'react';
import { api, setAuth } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alert, setAlert] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert('');
    try {
      const payload = { email: email.trim(), password };
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setAuth(data.token, data.user);
      redirectByRole(data.user.role);
    } catch (error) {
      setAlert(error.message);
    }
  };

  const redirectByRole = (role) => {
    const roleDashboardMap = {
      host: '/host-dashboard',
      organiser: '/organiser-dashboard',
      management: '/management-dashboard',
      user: '/user-dashboard',
    };
    const page = roleDashboardMap[role] || '/login';
    navigate(page);
  };

  return (
    <div className="page-wrap d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div className="glass-card p-4 p-md-5 fade-in" style={{ maxWidth: '440px', width: '100%' }}>
        <h2 className="brand mb-3">University Event Registration</h2>
        <p className="small-note">Login to manage events, teams, and registrations.</p>
        {alert && <div className="alert alert-danger">{alert}</div>}
        <form onSubmit={handleSubmit} className="mt-3" autoComplete="off">
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              autoComplete="off"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                autoComplete="new-password"
                required
              />
              <button
                className="btn btn-outline-secondary password-toggle"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <button className="btn btn-brand w-100" type="submit">Login</button>
        </form>
        <p className="mt-3 mb-0 small-note">
          No account? <a href="/register">Create one</a>
        </p>
      </div>
    </div>
  );
};

export default Login;