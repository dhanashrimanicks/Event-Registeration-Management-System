import React, { useEffect, useState } from 'react';
import { requireAuth, logout, api } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const timelineOrder = ['current', 'upcoming', 'past'];
const timelineLabels = {
  current: 'Current Events',
  upcoming: 'Upcoming Events',
  past: 'Past Events',
};

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const authUser = requireAuth();
    if (!authUser) {
      navigate('/login');
      return;
    }
    if (authUser.role !== 'user') {
      navigate('/login');
      return;
    }
    setUser(authUser);
    loadDashboard().finally(() => setLoading(false));
  }, [navigate]);

  const getDatePart = (value) => {
    if (!value) return '';
    if (typeof value === 'string' && value.includes('T')) return value.split('T')[0];
    return value;
  };

  const toDateTime = (dateValue, timeValue) => {
    if (!dateValue || !timeValue) return new Date(dateValue);
    return new Date(`${getDatePart(dateValue)}T${timeValue}`);
  };

  const getTimelineBucket = (event) => {
    const now = new Date();
    const start = toDateTime(event.date, event.time);
    const end = toDateTime(event.endDate || event.date, event.endTime || event.time);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 'upcoming';
    if (now < start) return 'upcoming';
    if (now > end) return 'past';
    return 'current';
  };

  const isDeadlineOver = (event) => {
    if (!event.registrationDeadline) return false;
    const deadline = new Date(event.registrationDeadline);
    if (Number.isNaN(deadline.getTime())) return false;
    return new Date() > deadline;
  };

  const buildDashboardData = () => {
    const registeredMap = new Map();
    registrations.forEach((reg) => {
      if (!reg.event) return;
      registeredMap.set(String(reg.event._id || reg.event), reg);
    });

    const grouped = new Map();
    events.forEach((event) => {
      const mainEventId = String(event.mainEvent?._id || 'ungrouped');
      const mainEventName = event.mainEvent?.name || 'General Events';
      if (!grouped.has(mainEventId)) {
        grouped.set(mainEventId, {
          id: mainEventId,
          name: mainEventName,
          buckets: {
            registered: { current: [], upcoming: [], past: [] },
            unregistered: { current: [], upcoming: [], past: [] },
          },
        });
      }
      const section = grouped.get(mainEventId);
      const statusKey = registeredMap.has(String(event._id)) ? 'registered' : 'unregistered';
      const timeline = getTimelineBucket(event);
      section.buckets[statusKey][timeline].push(event);
    });

    grouped.forEach((section) => {
      Object.values(section.buckets).forEach((bucket) => {
        timelineOrder.forEach((timeline) => {
          bucket[timeline].sort((a, b) => new Date(a.date) - new Date(b.date));
        });
      });
    });

    return { grouped: Array.from(grouped.values()), registeredMap };
  };

  const loadDashboard = async () => {
    try {
      const [eventsData, regsData] = await Promise.all([api('/events'), api('/register/my')]);
      setEvents(eventsData);
      setRegistrations(regsData);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRegister = async (event) => {
    try {
      let teamId;
      if (event.eventType === 'team') {
        teamId = window.prompt('Enter your team ID (leader only):');
        if (!teamId) return;
      }
      await api('/register', {
        method: 'POST',
        body: JSON.stringify({ eventId: event._id, teamId }),
      });
      await loadDashboard();
      alert('Registered successfully');
    } catch (error) {
      alert(error.message);
    }
  };

  const renderEventCard = (event, statusKey, timeline, registrationInfo) => {
    const deadlineClosed = isDeadlineOver(event);
    const registered = statusKey === 'registered';
    const disabled = registered || timeline === 'past' || deadlineClosed;
    const buttonLabel = registered
      ? 'Registered'
      : timeline === 'past'
      ? 'Event Ended'
      : deadlineClosed
      ? 'Deadline Closed'
      : 'Register';
    const badgeClass = timeline === 'past' ? 'text-bg-dark' : timeline === 'current' ? 'text-bg-info' : 'text-bg-primary';

    return (
      <div key={event._id} className="col-md-6">
        <div className="event-card p-3 h-100">
          <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
            <h6 className="mb-0">{event.name}</h6>
            <div className="d-flex gap-1 flex-wrap">
              <span className={`badge ${badgeClass}`}>{timelineLabels[timeline]}</span>
              <span className={`badge ${registered ? 'text-bg-success' : 'text-bg-secondary'}`}>
                {registered ? 'Registered' : 'Not Registered'}
              </span>
            </div>
          </div>
          <div className="small-note mb-2">
            {new Date(event.date).toLocaleDateString()} {event.time ? `| ${event.time}` : ''}
            {event.endDate ? ` to ${new Date(event.endDate).toLocaleDateString()}` : ''}
            {event.endTime ? ` | ${event.endTime}` : ''}
          </div>
          <div className="small-note mb-2">Venue: {event.venue || 'TBA'}</div>
          <div className="small-note mb-2">Type: {event.eventType} | Max: {event.maxParticipants}</div>
          <div className="small-note mb-3">{event.description || 'No description provided.'}</div>
          <div className="d-flex justify-content-between align-items-center gap-2">
            <span className="small-note">
              {registrationInfo?.team?.teamName ? `Team: ${registrationInfo.team.teamName}` : ''}
            </span>
            <button className={`btn btn-sm ${registered ? 'btn-success' : 'btn-brand'}`} disabled={disabled} onClick={() => handleRegister(event)}>
              {buttonLabel}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (section, statusKey, registeredMap) => {
    const rows = timelineOrder.map((timeline) => {
      const eventsForTimeline = section.buckets[statusKey][timeline];
      if (!eventsForTimeline.length) return null;
      return (
        <div key={timeline} className="timeline-group mb-3">
          <h6 className="mb-2">{timelineLabels[timeline]}</h6>
          <div className="row g-3">
            {eventsForTimeline.map((event) => renderEventCard(event, statusKey, timeline, registeredMap.get(String(event._id))))}
          </div>
        </div>
      );
    });
    return rows.some((row) => row !== null) ? (
      <div className="status-group mb-4" key={statusKey}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">{statusKey === 'registered' ? 'Registered Events' : 'Unregistered Events'}</h5>
        </div>
        {rows}
      </div>
    ) : null;
  };

  const renderDashboardSections = () => {
    const { grouped, registeredMap } = buildDashboardData();
    if (!grouped.length) {
      return <p className="small-note">No events available.</p>;
    }
    return grouped.map((section) => (
      <div key={section.id} className="main-event-section border rounded p-3 mb-4 bg-white fade-in">
        <h4 className="mb-3">{section.name}</h4>
        {renderSection(section, 'registered', registeredMap) || <p className="small-note">No registered events in this main event.</p>}
        {renderSection(section, 'unregistered', registeredMap) || <p className="small-note">No unregistered events in this main event.</p>}
      </div>
    ));
  };

  const renderRegistrations = () => {
    if (!registrations.length) {
      return <p className="small-note">No registrations yet.</p>;
    }
    return registrations.map((reg) => (
      <div key={reg._id} className="border rounded p-2 mb-2 bg-white">
        <strong>{reg.event?.name || 'Event'}</strong>
        <br />
        <span className="small-note">{reg.event?.venue || 'Venue not available'}</span>
        <br />
        <span className="small-note">{new Date(reg.event?.date).toLocaleDateString()} | Status: {reg.status}{reg.team ? ` | Team: ${reg.team.teamName}` : ''}</span>
      </div>
    ));
  };

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
            {loading ? <p className="small-note">Loading events...</p> : renderDashboardSections()}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="glass-card p-3 p-md-4">
            <div className="section-title">My Registrations</div>
            {loading ? <p className="small-note">Loading registrations...</p> : renderRegistrations()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
