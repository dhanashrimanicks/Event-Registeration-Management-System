import React, { useCallback, useEffect, useState } from 'react';
import { requireAuth, logout, api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const TeamManagement = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamForm, setTeamForm] = useState({ teamName: '', eventId: '' });
  const [memberForm, setMemberForm] = useState({ teamId: '', userId: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const loadTeamEvents = useCallback(async () => {
    try {
      const data = await api('/events');
      setEvents(data.filter((item) => item.eventType === 'team'));
    } catch (error) {
      setEvents([]);
      setMessage(error.message);
    }
  }, []);

  const loadTeams = useCallback(async () => {
    try {
      const data = await api('/team/my');
      setTeams(data.ledTeams || []);
    } catch (error) {
      setTeams([]);
      setMessage(error.message);
    }
  }, []);

  const loadData = useCallback(async () => {
    await Promise.all([loadTeamEvents(), loadTeams()]);
  }, [loadTeamEvents, loadTeams]);

  useEffect(() => {
    const authUser = requireAuth();
    if (!authUser) {
      navigate('/login');
      return;
    }
    setUser(authUser);
    loadData();
  }, [navigate, loadData]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await api('/team/create', {
        method: 'POST',
        body: JSON.stringify(teamForm),
      });
      setTeamForm({ teamName: '', eventId: '' });
      await loadTeams();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api('/team/add-member', {
        method: 'POST',
        body: JSON.stringify(memberForm),
      });
      setMessage('Member added');
      setMemberForm({ ...memberForm, userId: '' });
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleRemoveMember = async () => {
    try {
      await api('/team/remove-member', {
        method: 'DELETE',
        body: JSON.stringify(memberForm),
      });
      setMessage('Member removed');
      setMemberForm({ ...memberForm, userId: '' });
      await loadTeams();
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="page-wrap">
      <div className="glass-card p-3 p-md-4 mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 className="brand mb-1">Team Management</h3>
          <div className="small-note">{user.name} ({user.role})</div>
        </div>
        <div>
          <button className="btn btn-outline-dark btn-sm" onClick={() => navigate('/user-dashboard')}>Back</button>
          <button className="btn btn-brand btn-sm" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="glass-card p-3 p-md-4 mb-3">
            <div className="section-title">Create Team</div>
            <form onSubmit={handleCreateTeam} className="row g-2">
              <div className="col-12">
                <input
                  id="teamName"
                  className="form-control"
                  placeholder="Team name"
                  value={teamForm.teamName}
                  onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })}
                  required
                />
              </div>
              <div className="col-12">
                <select
                  id="eventId"
                  className="form-select"
                  value={teamForm.eventId}
                  onChange={(e) => setTeamForm({ ...teamForm, eventId: e.target.value })}
                  required
                >
                  <option value="">Select Team Event</option>
                  {events.map((event) => (
                    <option key={event._id} value={event._id}>
                      {event.name} ({new Date(event.date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <button className="btn btn-teal w-100">Create Team</button>
              </div>
            </form>
          </div>

          <div className="glass-card p-3 p-md-4">
            <div className="section-title">Add / Remove Member</div>
            <form onSubmit={handleAddMember} className="row g-2 mb-3">
              <div className="col-12">
                <select
                  id="teamId"
                  className="form-select"
                  value={memberForm.teamId}
                  onChange={(e) => setMemberForm({ ...memberForm, teamId: e.target.value })}
                  required
                >
                  <option value="">Select Team</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>{team.teamName}</option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <input
                  id="userId"
                  className="form-control"
                  placeholder="Member User ID"
                  value={memberForm.userId}
                  onChange={(e) => setMemberForm({ ...memberForm, userId: e.target.value })}
                  required
                />
              </div>
              <div className="col-6">
                <button className="btn btn-brand w-100" type="submit">Add</button>
              </div>
              <div className="col-6">
                <button className="btn btn-outline-danger w-100" type="button" onClick={handleRemoveMember}>Remove</button>
              </div>
            </form>
            <div className="small-note">Use exact user ID from DB/admin records for member assignment.</div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="glass-card p-3 p-md-4">
            <div className="section-title">My Teams</div>
            {message && <div className="small-note text-danger mb-2">{message}</div>}
            {teams.length ? (
              teams.map((team) => (
                <div key={team._id} className="border rounded p-2 mb-2 bg-white">
                  <strong>{team.teamName}</strong>
                  <br />
                  <span className="small-note">{team.event?.name || ''}</span>
                  <br />
                  <span className="small-note">Team ID: {team._id}</span>
                </div>
              ))
            ) : (
              <p className="small-note">No teams led by you yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamManagement;
