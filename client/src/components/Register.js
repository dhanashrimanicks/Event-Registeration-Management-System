import React, { useState } from 'react';
import { api, setAuth } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    collegeName: '',
    year: '',
    department: '',
    rollNo: '',
    phone: '',
    email: '',
    password: '',
  });
  const [alert, setAlert] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert('');
    try {
      if (formData.password.length < 6) throw new Error('Password must be at least 6 characters');

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        department: formData.department.trim(),
        year: formData.year.trim(),
        collegeName: formData.collegeName.trim(),
        rollNo: formData.rollNo.trim(),
      };

      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setAuth(data.token, data.user);
      setAlert('Registration successful. Redirecting...');
      setTimeout(() => redirectByRole(data.user.role), 800);
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
      <div className="glass-card p-4 p-md-5 fade-in" style={{ maxWidth: '560px', width: '100%' }}>
        <h2 className="brand mb-3">Create Account</h2>
        {alert && (
          <div className={`alert ${alert.includes('successful') ? 'alert-success' : 'alert-danger'}`}>
            {alert}
          </div>
        )}
        <form onSubmit={handleSubmit} className="row g-3 mt-1" autoComplete="off">
          <div className="col-md-6">
            <label className="small-note mb-1">name:</label>
            <input
              className="form-control"
              id="name"
              placeholder="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="small-note mb-1">Collage Name:</label>
            <input
              className="form-control"
              id="collegeName"
              placeholder="Collage Name"
              value={formData.collegeName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="small-note mb-1">Year:</label>
            <input
              className="form-control"
              id="year"
              placeholder="Year"
              value={formData.year}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label className="small-note mb-1">Department:</label>
            <input
              className="form-control"
              id="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label className="small-note mb-1">Unique ID:</label>
            <input
              className="form-control"
              id="rollNo"
              placeholder="Unique ID"
              value={formData.rollNo}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="small-note mb-1">Phone No:</label>
            <input
              className="form-control"
              id="phone"
              placeholder="Phone No"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6">
            <label className="small-note mb-1">UserName:</label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="UserName"
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
              required
            />
          </div>
          <div className="col-md-6">
            <label className="small-note mb-1">Password:</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                id="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
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
          <div className="col-12">
            <button className="btn btn-brand w-100" type="submit">Register</button>
          </div>
        </form>
        <p className="mt-3 mb-0 small-note">
          Already registered? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;