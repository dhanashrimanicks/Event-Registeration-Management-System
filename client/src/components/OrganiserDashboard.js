import React, { useCallback, useEffect, useState } from 'react';
import { requireAuth, logout, api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const OrganiserDashboard = () => {
  const [user, setUser] = useState(null);
  const [mainEvents, setMainEvents] = useState([]);
  const [subEvents, setSubEvents] = useState([]);
  const [managementUsers, setManagementUsers] = useState([]);
  const [mainForm, setMainForm] = useState({ name: '', description: '', startDate: '', endDate: '' });
  const [mgmtForm, setMgmtForm] = useState({ name: '', email: '', password: '', mainEventId: '' });
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadMainEvents = useCallback(async () => {
    try {
      const data = await api('/main-events');
      setMainEvents(data);
    } catch (error) {
      setMainEvents([]);
      alert(error.message);
    }
  }, []);

  const loadSubEvents = useCallback(async () => {
    try {
      const data = await api('/events');
      setSubEvents(data);
    } catch (error) {
      setSubEvents([]);
      alert(error.message);
    }
  }, []);

  const loadManagementUsers = useCallback(async () => {
    try {
      const data = await api('/users/management');
      setManagementUsers(data);
    } catch (error) {
      setManagementUsers([]);
      alert(error.message);
    }
  }, []);

  const loadData = useCallback(async () => {
    await Promise.all([loadMainEvents(), loadSubEvents(), loadManagementUsers()]);
  }, [loadMainEvents, loadSubEvents, loadManagementUsers]);

  useEffect(() => {
    const authUser = requireAuth();
    if (!authUser || authUser.role !== 'organiser') {
      navigate('/login');
      return;
    }
    setUser(authUser);
    loadData().finally(() => setLoading(false));
  }, [navigate, loadData]);

  const handleMainSubmit = async (e) => {
    e.preventDefault();
    try {
      await api('/main-events', {
        method: 'POST',
        body: JSON.stringify(mainForm),
      });
      setMainForm({ name: '', description: '', startDate: '', endDate: '' });
      await loadMainEvents();
      await loadSubEvents();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleMgmtSubmit = async (e) => {
    e.preventDefault();
    try {
      await api('/users/create-management', {
        method: 'POST',
        body: JSON.stringify(mgmtForm),
      });
      setMgmtForm({ name: '', email: '', password: '', mainEventId: '' });
      alert('Management user created');
      await loadManagementUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  const startEdit = (event) => {
    setEditingId(event._id);
    setEditValues({
      name: event.name || '',
      description: event.description || '',
      startDate: event.startDate?.slice(0, 10) || '',
      endDate: event.endDate?.slice(0, 10) || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = async (id) => {
    try {
      await api(`/main-events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(editValues),
      });
      setEditingId(null);
      setEditValues({});
      await loadMainEvents();
      await loadSubEvents();
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteManagementUser = async (id) => {
    if (!window.confirm('Delete this management user?')) return;
    try {
      await api(`/users/management/${id}`, { method: 'DELETE' });
      await loadManagementUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteMainEvent = async (id) => {
    if (!window.confirm('Delete this main event?')) return;
    try {
      await api(`/main-events/${id}`, { method: 'DELETE' });
      await loadMainEvents();
      await loadSubEvents();
      await loadManagementUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  if (!user || loading) return <div>Loading...</div>;

  return (
    <div className="page-wrap">
      <div className="glass-card p-3 p-md-4 mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 className="brand mb-1">Organiser Dashboard</h3>
          <div className="small-note">{user.name} ({user.role})</div>
        </div>
        <button className="btn btn-brand btn-sm" onClick={logout}>Logout</button>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="glass-card p-3 p-md-4">
            <div className="section-title">Create Main Event</div>
            <form onSubmit={handleMainSubmit} className="row g-2" autoComplete="off">
              <div className="col-12">
                <input
                  className="form-control"
                  placeholder="Main event name"
                  value={mainForm.name}
                  onChange={(e) => setMainForm({ ...mainForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="col-12">
                <textarea
                  className="form-control"
                  placeholder="Description"
                  value={mainForm.description}
                  onChange={(e) => setMainForm({ ...mainForm, description: e.target.value })}
                />
              </div>
              <div className="col-6">
                <label className="small-note mb-1">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={mainForm.startDate}
                  onChange={(e) => setMainForm({ ...mainForm, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="col-6">
                <label className="small-note mb-1">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={mainForm.endDate}
                  onChange={(e) => setMainForm({ ...mainForm, endDate: e.target.value })}
                  required
                />
              </div>
              <div className="col-12">
                <button className="btn btn-brand w-100">Create Main Event</button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="glass-card p-3 p-md-4">
            <div className="section-title">Create Management User</div>
            <form onSubmit={handleMgmtSubmit} className="row g-2" autoComplete="off">
              <div className="col-6">
                <input
                  className="form-control"
                  placeholder="Name"
                  value={mgmtForm.name}
                  onChange={(e) => setMgmtForm({ ...mgmtForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="col-6">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email"
                  value={mgmtForm.email}
                  onChange={(e) => setMgmtForm({ ...mgmtForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="col-12">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={mgmtForm.password}
                  onChange={(e) => setMgmtForm({ ...mgmtForm, password: e.target.value })}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="col-12">
                <select
                  className="form-select"
                  value={mgmtForm.mainEventId}
                  onChange={(e) => setMgmtForm({ ...mgmtForm, mainEventId: e.target.value })}
                  required
                >
                  <option value="">Select Main Event For Management User</option>
                  {mainEvents.map((event) => (
                    <option key={event._id} value={event._id}>{event.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <button className="btn btn-teal w-100">Create Management</button>
              </div>
            </form>
          </div>
        </div>

        <div className="col-12">
          <div className="glass-card p-3 p-md-4">
            <div className="section-title">Main Events</div>
            <div className="small-note mb-2">{mainEvents.length} main event(s) found.</div>
            <div className="row g-3">
              {mainEvents.length ? (
                mainEvents.map((event) => (
                  <div key={event._id} className={mainEvents.length === 1 ? 'col-12' : 'col-12 col-lg-6'}>
                    <div className="event-card p-3 h-100 main-event-card">
                      {editingId === event._id ? (
                        <>
                          <div className="row g-2">
                            <div className="col-12">
                              <label className="small-note mb-1">Main Event Name</label>
                              <input
                                className="form-control"
                                value={editValues.name}
                                onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                              />
                            </div>
                            <div className="col-12">
                              <label className="small-note mb-1">Description</label>
                              <textarea
                                className="form-control"
                                rows={5}
                                value={editValues.description}
                                onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                              />
                            </div>
                            <div className="col-6">
                              <label className="small-note mb-1">Start Date</label>
                              <input
                                type="date"
                                className="form-control"
                                value={editValues.startDate}
                                onChange={(e) => setEditValues({ ...editValues, startDate: e.target.value })}
                              />
                            </div>
                            <div className="col-6">
                              <label className="small-note mb-1">End Date</label>
                              <input
                                type="date"
                                className="form-control"
                                value={editValues.endDate}
                                onChange={(e) => setEditValues({ ...editValues, endDate: e.target.value })}
                              />
                            </div>
                            <div className="col-12 d-flex gap-2 mt-2">
                              <button className="btn btn-sm btn-brand" onClick={() => saveEdit(event._id)} type="button">Save</button>
                              <button className="btn btn-sm btn-outline-secondary" onClick={cancelEdit} type="button">Cancel</button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <h6>{event.name}</h6>
                          <div className="small-note mb-2">Start: {new Date(event.startDate).toLocaleDateString()}</div>
                          <div className="small-note mb-2">End: {new Date(event.endDate).toLocaleDateString()}</div>
                          <div className="small-note mb-2">Organiser: {event.organiser?.name || '-'}</div>
                          <div className="small-note mb-3 description-text">Description: {event.description || '-'}</div>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => startEdit(event)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteMainEvent(event._id)}>Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="small-note">No main events found.</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="glass-card p-3 p-md-4">
            <div className="section-title">Sub-Events</div>
            <div className="small-note mb-2">{subEvents.length} sub-event(s) found.</div>
            <div className="row g-3">
              {subEvents.length ? (
                subEvents.map((event) => (
                  <div key={event._id} className="col-md-6">
                    <div className="event-card p-3 h-100">
                      <h6 className="mb-1">{event.name}</h6>
                      <div className="small-note mb-2">Main Event: {event.mainEvent?.name || '-'}</div>
                      <div className="small-note mb-2">Start: {new Date(event.date).toLocaleDateString()} {event.time || ''}</div>
                      <div className="small-note mb-2">End: {new Date(event.endDate || event.date).toLocaleDateString()} {event.endTime || '-'}</div>
                      <div className="small-note mb-2">Venue: {event.venue || '-'}</div>
                      <div className="small-note mb-2">Event Type: {event.eventType || '-'}</div>
                      <div className="small-note mb-2">Max Participants: {event.maxParticipants ?? '-'}</div>
                      <div className="small-note mb-2">Registration Deadline: {event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleString() : '-'}</div>
                      <div className="small-note mb-0">Description: {event.description || event.domain || '-'}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="small-note">No sub-events found.</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="glass-card p-3 p-md-4">
            <div className="section-title">Management Users</div>
            <div className="row g-3">
              {managementUsers.length ? (
                managementUsers.map((userItem) => (
                  <div key={userItem._id} className="col-md-6">
                    <div className="event-card p-3 h-100">
                      <h6 className="mb-1">{userItem.name}</h6>
                      <div className="small-note mb-2">{userItem.email}</div>
                      <div className="small-note mb-2">Main Event: {userItem.assignedMainEvent?.name || 'Not assigned'}</div>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => deleteManagementUser(userItem._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="small-note">No management users found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganiserDashboard;
