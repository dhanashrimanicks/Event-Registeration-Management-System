import React, { useCallback, useEffect, useState } from 'react';
import { requireAuth, logout, api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const ManagementDashboard = () => {
  const [user, setUser] = useState(null);
  const [mainEvents, setMainEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    mainEvent: '',
    name: '',
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    venue: '',
    domain: '',
    maxParticipants: '',
    eventType: 'individual',
    registrationDeadline: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [editingValues, setEditingValues] = useState({});
  const [message, setMessage] = useState('');
  const [registrationMessage, setRegistrationMessage] = useState('');
  const navigate = useNavigate();

  const loadMainEvents = useCallback(async () => {
    try {
      const data = await api('/main-events');
      setMainEvents(data);
    } catch (error) {
      setMainEvents([]);
      setMessage(error.message);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    try {
      const data = await api('/events');
      setEvents(data);
    } catch (error) {
      setEvents([]);
      setMessage(error.message);
    }
  }, []);

  const loadData = useCallback(async () => {
    await Promise.all([loadMainEvents(), loadEvents()]);
    clearRegistrationPanel();
  }, [loadMainEvents, loadEvents]);

  useEffect(() => {
    const authUser = requireAuth();
    if (!authUser || authUser.role !== 'management') {
      navigate('/login');
      return;
    }
    setUser(authUser);
    loadData();
  }, [navigate, loadData]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await api('/events', {
        method: 'POST',
        body: JSON.stringify({
          ...eventForm,
          maxParticipants: Number(eventForm.maxParticipants),
          registrationDeadline: new Date(eventForm.registrationDeadline).toISOString(),
        }),
      });
      setEventForm({
        mainEvent: '',
        name: '',
        date: '',
        time: '',
        endDate: '',
        endTime: '',
        venue: '',
        domain: '',
        maxParticipants: '',
        eventType: 'individual',
        registrationDeadline: '',
      });
      setMessage('Sub-event created successfully.');
      await loadEvents();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const startEdit = (event) => {
    setEditingId(event._id);
    setEditingValues({
      name: event.name || '',
      date: event.date?.slice(0, 10) || '',
      time: event.time || '',
      endDate: (event.endDate || event.date)?.slice(0, 10) || '',
      endTime: event.endTime || event.time || '',
      venue: event.venue || '',
      domain: event.domain || '',
      maxParticipants: event.maxParticipants || '',
      eventType: event.eventType || 'individual',
      registrationDeadline: event.registrationDeadline
        ? new Date(event.registrationDeadline).toISOString().slice(0, 16)
        : '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValues({});
    setMessage('');
  };

  const saveEdit = async (id) => {
    try {
      await api(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...editingValues,
          maxParticipants: Number(editingValues.maxParticipants),
          registrationDeadline: editingValues.registrationDeadline
            ? new Date(editingValues.registrationDeadline).toISOString()
            : null,
        }),
      });
      setEditingId(null);
      setEditingValues({});
      setMessage('Event updated successfully.');
      await loadEvents();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api(`/events/${id}`, { method: 'DELETE' });
      setMessage('Event deleted successfully.');
      if (selectedEvent?.id === id) {
        clearRegistrationPanel();
      }
      await loadEvents();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const clearRegistrationPanel = () => {
    setRegistrations([]);
    setSelectedEvent(null);
    setRegistrationMessage('');
  };

  const viewRegistrations = async (eventId) => {
    try {
      const payload = await api(`/register/event/${eventId}`);
      setRegistrations(payload.registrations || []);
      setSelectedEvent(payload.event);
      setRegistrationMessage('');
    } catch (error) {
      setRegistrationMessage(error.message);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="page-wrap">
      <div className="glass-card p-3 p-md-4 mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h3 className="brand mb-1">Management Dashboard</h3>
          <div className="small-note">{user.name} ({user.role})</div>
        </div>
        <button className="btn btn-brand btn-sm" onClick={logout}>Logout</button>
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="glass-card p-3 p-md-4">
            <div className="section-title">Create Sub-Event</div>
            <form onSubmit={handleCreateEvent} className="row g-2" autoComplete="off">
              <div className="col-12">
                <label className="small-note mb-1">Main Event</label>
                <select
                  className="form-select"
                  value={eventForm.mainEvent}
                  onChange={(e) => setEventForm({ ...eventForm, mainEvent: e.target.value })}
                  required
                >
                  <option value="">Select Main Event</option>
                  {mainEvents.map((item) => (
                    <option key={item._id} value={item._id}>{item.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-12">
                <label className="small-note mb-1">Sub-Event Name</label>
                <input
                  className="form-control"
                  placeholder="Sub-event name"
                  value={eventForm.name}
                  onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="col-6">
                <label className="small-note mb-1">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  required
                />
              </div>
              <div className="col-6">
                <label className="small-note mb-1">Start Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  required
                />
              </div>
              <div className="col-6">
                <label className="small-note mb-1">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={eventForm.endDate}
                  onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                  required
                />
              </div>
              <div className="col-6">
                <label className="small-note mb-1">End Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={eventForm.endTime}
                  onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
                  required
                />
              </div>
              <div className="col-6">
                <label className="small-note mb-1">Venue</label>
                <input
                  className="form-control"
                  placeholder="Venue"
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                  required
                />
              </div>
              <div className="col-12">
                <label className="small-note mb-1">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Description"
                  value={eventForm.domain}
                  onChange={(e) => setEventForm({ ...eventForm, domain: e.target.value })}
                />
              </div>
              <div className="col-6">
                <label className="small-note mb-1">Max Participants</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Max participants"
                  value={eventForm.maxParticipants}
                  onChange={(e) => setEventForm({ ...eventForm, maxParticipants: e.target.value })}
                  required
                />
              </div>
              <div className="col-6">
                <label className="small-note mb-1">Event Type</label>
                <select
                  className="form-select"
                  value={eventForm.eventType}
                  onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })}
                >
                  <option value="individual">individual</option>
                  <option value="team">team</option>
                </select>
              </div>
              <div className="col-12">
                <label className="small-note mb-1">Registration Deadline</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={eventForm.registrationDeadline}
                  onChange={(e) => setEventForm({ ...eventForm, registrationDeadline: e.target.value })}
                  required
                />
              </div>
              <div className="col-12">
                <button className="btn btn-teal w-100">Create Sub-Event</button>
              </div>
            </form>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="glass-card p-3 p-md-4">
            <div className="section-title">Sub-Events</div>
            <div className="small-note mb-2">{events.length} sub-event(s) found.</div>
            {message && <div className="small-note text-danger mb-2">{message}</div>}
            <div className="row g-3">
              {events.length ? (
                events.map((event) => (
                  <div key={event._id} className="col-12">
                    <div className="event-card p-3">
                      {editingId === event._id ? (
                        <div className="row g-2">
                          <div className="col-12">
                            <input
                              className="form-control"
                              value={editingValues.name}
                              onChange={(e) => setEditingValues({ ...editingValues, name: e.target.value })}
                            />
                          </div>
                          <div className="col-6">
                            <label className="small-note mb-1">Start Date</label>
                            <input
                              type="date"
                              className="form-control"
                              value={editingValues.date}
                              onChange={(e) => setEditingValues({ ...editingValues, date: e.target.value })}
                            />
                          </div>
                          <div className="col-6">
                            <label className="small-note mb-1">Start Time</label>
                            <input
                              type="time"
                              className="form-control"
                              value={editingValues.time}
                              onChange={(e) => setEditingValues({ ...editingValues, time: e.target.value })}
                            />
                          </div>
                          <div className="col-6">
                            <label className="small-note mb-1">End Date</label>
                            <input
                              type="date"
                              className="form-control"
                              value={editingValues.endDate}
                              onChange={(e) => setEditingValues({ ...editingValues, endDate: e.target.value })}
                            />
                          </div>
                          <div className="col-6">
                            <label className="small-note mb-1">End Time</label>
                            <input
                              type="time"
                              className="form-control"
                              value={editingValues.endTime}
                              onChange={(e) => setEditingValues({ ...editingValues, endTime: e.target.value })}
                            />
                          </div>
                          <div className="col-6">
                            <input
                              className="form-control"
                              value={editingValues.venue}
                              onChange={(e) => setEditingValues({ ...editingValues, venue: e.target.value })}
                              placeholder="Venue"
                            />
                          </div>
                          <div className="col-12">
                            <textarea
                              className="form-control"
                              rows={3}
                              value={editingValues.domain}
                              onChange={(e) => setEditingValues({ ...editingValues, domain: e.target.value })}
                              placeholder="Description"
                            />
                          </div>
                          <div className="col-6">
                            <input
                              type="number"
                              className="form-control"
                              value={editingValues.maxParticipants}
                              onChange={(e) => setEditingValues({ ...editingValues, maxParticipants: e.target.value })}
                              placeholder="Max participants"
                            />
                          </div>
                          <div className="col-6">
                            <select
                              className="form-select"
                              value={editingValues.eventType}
                              onChange={(e) => setEditingValues({ ...editingValues, eventType: e.target.value })}
                            >
                              <option value="individual">individual</option>
                              <option value="team">team</option>
                            </select>
                          </div>
                          <div className="col-12">
                            <input
                              type="datetime-local"
                              className="form-control"
                              value={editingValues.registrationDeadline}
                              onChange={(e) => setEditingValues({ ...editingValues, registrationDeadline: e.target.value })}
                            />
                          </div>
                          <div className="col-12 d-flex gap-2">
                            <button className="btn btn-sm btn-brand" type="button" onClick={() => saveEdit(event._id)}>Save</button>
                            <button className="btn btn-sm btn-outline-secondary" type="button" onClick={cancelEdit}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <h6>{event.name}</h6>
                          <div className="small-note mb-2">Start: {new Date(event.date).toLocaleDateString()} {event.time}</div>
                          <div className="small-note mb-2">End: {new Date(event.endDate || event.date).toLocaleDateString()} {event.endTime || '-'}</div>
                          <div className="small-note mb-2">Description: {event.domain || '-'}</div>
                          <div className="small-note mb-2">Venue: {event.venue || '-'}</div>
                          <button className="btn btn-sm btn-outline-primary me-2" type="button" onClick={() => startEdit(event)}>Edit</button>
                          <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => deleteEvent(event._id)}>Delete</button>
                          <button className="btn btn-sm btn-outline-secondary ms-2" type="button" onClick={() => viewRegistrations(event._id)}>View Registrations</button>
                        </>
                      )}
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
            <div className="section-title">Registrations</div>
            {selectedEvent ? (
              <>
                <div className="small-note mb-2">{selectedEvent.name} | {new Date(selectedEvent.date).toLocaleDateString()} {selectedEvent.time} - {new Date(selectedEvent.endDate || selectedEvent.date).toLocaleDateString()} {selectedEvent.endTime || ''} | {selectedEvent.venue || '-'}</div>
                {registrationMessage && <div className="small-note text-danger mb-2">{registrationMessage}</div>}
                <div className="row g-2">
                  {registrations.length ? (
                    registrations.map((reg) => (
                      <div key={reg._id} className="col-12">
                        <div className="event-card p-2">
                          <div className="fw-semibold">{reg.user?.name || 'Unknown'}</div>
                          <div className="small-note">{reg.user?.email || '-'}</div>
                          <div className="small-note">Team: {reg.team?.teamName || '-'}</div>
                          <div className="small-note">Status: {reg.status}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12"><p className="small-note mb-0">No registrations for this sub-event yet.</p></div>
                  )}
                </div>
              </>
            ) : (
              <p className="small-note">Select a sub-event to view registrations.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementDashboard;
