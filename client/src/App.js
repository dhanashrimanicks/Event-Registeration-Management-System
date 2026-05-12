import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import HostDashboard from './components/HostDashboard';
import OrganiserDashboard from './components/OrganiserDashboard';
import ManagementDashboard from './components/ManagementDashboard';
import UserDashboard from './components/UserDashboard';
import TeamManagement from './components/TeamManagement';
import './styles.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/host-dashboard" element={<HostDashboard />} />
          <Route path="/organiser-dashboard" element={<OrganiserDashboard />} />
          <Route path="/management-dashboard" element={<ManagementDashboard />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/team-management" element={<TeamManagement />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
