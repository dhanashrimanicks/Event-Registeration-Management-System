# Requirement Traceability Matrix (RTM)

## Project: University Event Registration Management System with AI Chatbot

This document provides comprehensive requirements mapping across multiple viewpoints, linking functional requirements to design components, implementation artifacts, and test cases.

---

## 1. Business Viewpoint - Requirements by Stakeholder

### 1.1 Host (System Administrator)

| Req ID | Requirement | Justification | Status |
|--------|-------------|---------------|--------|
| 2.1 | Host Account Bootstrap | Ensure system startup with admin credentials from environment | Completed |
| 2.2 | Host Creates Organisers | Enable delegation of event management to organisers | Completed |
| 3.1 | Main Event Management | Oversee all events at top level | Completed |
| 5.1 | Event Registration Visibility | Monitor global participation and registrations | Completed |

**Related Components:** `authController`, `usersController`, `host-dashboard.html`

---

### 1.2 Organiser (Event Planner)

| Req ID | Requirement | Justification | Status |
|--------|-------------|---------------|--------|
| 2.3 | Creates Management Users | Delegate sub-event operations to specialists | Completed |
| 3.1 | Main Event Creation/Update | Plan umbrella events and timelines | Completed |
| 3.2 | Sub-Event Management | Organize individual competitions/workshops | Completed |
| 5.1 | Registration Monitoring | Track participant commitments per event | Completed |

**Related Components:** `mainEventController`, `eventController`, `organiser-dashboard.html`

---

### 1.3 Management (Event Operator)

| Req ID | Requirement | Justification | Status |
|--------|-------------|---------------|--------|
| 3.2 | Assigned Sub-Event Operations | Manage delegated events | Completed |
| 5.1 | Registrations for Assigned Events | Verify participants on event day | Completed |

**Related Components:** `eventController`, `registrationController`, `management-dashboard.html`

---

### 1.4 User (Participant)

| Req ID | Requirement | Justification | Status |
|--------|-------------|---------------|--------|
| 1.1 | Register & Login | Join the platform and access personalised dashboard | Completed |
| 4.1 | Team Creation & Membership | Form or join teams for collaborative events | Completed |
| 4.2 | Individual Registration | Register for solo participation | Completed |
| 4.3 | Team Registration | Register team for group events | Completed |
| 5.2 | User Dashboard | View events, registrations, and team status | Completed |
| 6.3 | Team Management Page | Manage team lifecycle (create, invite, remove) | Completed |
| 7.1 | AI Chatbot Assistance | Get event guidance and registration help | Completed |

**Related Components:** `authController`, `registrationController`, `teamController`, `user-dashboard.html`, `team-management.html`

---

## 2. Functional Viewpoint - Requirement Categories

### 2.1 Security & Authentication (Category 1)

| Req ID | Feature | Component Map | Test Case |
|--------|---------|----------------|-----------|
| 1.1 | User Registration & Login | `authController`, `login.html`, `register.html` | TC-01, TC-02 |
| 1.2 | JWT Session Handling | `middleware/auth.js` | TC-02 |
| 1.3 | Role-Based Access Control (RBAC) | `middleware/roles.js` | TC-03 |

**Implementation:** JWT tokens issued on successful login; validated on every protected route; role permits enforce endpoint access.

---

### 2.2 User & Role Management (Category 2)

| Req ID | Feature | Component Map | Test Case |
|--------|---------|----------------|-----------|
| 2.1 | Host Bootstrap from Environment | `utils/bootstrapHost.js` | TC-04 |
| 2.2 | Host Creates Organiser Accounts | `POST /api/users/create-organiser` | TC-05 |
| 2.3 | Organiser Creates Management Users | `POST /api/users/create-management` | TC-06 |

**Implementation:** Role hierarchy: Host → Organiser → Management → User. Each role can delegate to next level.

---

### 2.3 Event Management (Category 3)

| Req ID | Feature | Component Map | Test Case |
|--------|---------|----------------|-----------|
| 3.1 | Main Event CRUD | `mainEventController`, `/api/main-events` | TC-07 |
| 3.2 | Sub-Event CRUD | `eventController`, `/api/events` | TC-08 |
| 3.3 | Event Visibility by Role | Authorization in `getMainEvents()`, `getEvents()` | TC-09 |

**Implementation:** Events filtered by creator role and assigned management scope; scoped GET queries.

---

### 2.4 Team & Registration (Category 4)

| Req ID | Feature | Component Map | Test Case |
|--------|---------|----------------|-----------|
| 4.1 | Team Creation & Add/Remove Members | `teamController`, `/api/team` | TC-10 |
| 4.2 | Individual Event Registration | `registrationController`, `/api/register` | TC-11 |
| 4.3 | Team Event Registration | `registrationController`, `/api/register` (team branch) | TC-12 |

**Implementation:** Unique constraint on `(user, event)` pair; team registrations bulk-insert all members.

---

### 2.5 Dashboards & Monitoring (Category 5)

| Req ID | Feature | Component Map | Test Case |
|--------|---------|----------------|-----------|
| 5.1 | Event Registrations View (Staff) | `GET /api/register/event/:eventId` | TC-13 |
| 5.2 | User Dashboard | `user-dashboard.html`, `user-dashboard.js` | TC-14 |
| 5.3 | Host Dashboard | `host-dashboard.html`, `host-dashboard.js` | TC-15 |

**Related:** 6.1 (Organiser Dashboard), 6.2 (Management Dashboard)

---

### 2.6 Support Services (Category 7)

| Req ID | Feature | Component Map | Test Case |
|--------|---------|----------------|-----------|
| 7.1 | AI Chatbot | `chatbotController`, `/api/chatbot` | TC-19 |
| 7.2 | Health Check | `GET /api/health` | TC-20 |

**Implementation:** Chatbot intent detection and response; health endpoint for uptime monitoring.

---

## 3. Data Viewpoint - Requirements to Data Models

### 3.1 Core Entities

| Requirement | Model | Key Fields | Uniqueness |
|-------------|-------|-----------|-----------|
| 1.1 Authentication | `User` | email, password, role | email unique |
| 3.1 Main Events | `MainEvent` | name, organiser, dates | name per organiser |
| 3.2 Sub-Events | `Event` | name, mainEvent, dates, capacity | name per mainEvent |
| 4.1 Team Management | `Team`, `TeamMember` | teamName, teamLeader, members | (event, teamName) unique |
| 4.2/4.3 Registration | `Registration` | user, event, team, status | (user, event) unique |

### 3.2 Data Relationships

```
User (Host) ──→ (organises) ──→ MainEvent
MainEvent ──→ (contains) ──→ Event
Event ──→ (has teams) ──→ Team
Team ──→ (has members) ──→ TeamMember → User
User ──→ (makes) ──→ Registration ← Event
Registration ← (optional) ← Team
```

---

## 4. API Viewpoint - Requirement to Endpoint Mapping

### 4.1 Authentication Routes

| Req ID | Endpoint | Method | Purpose | Auth |
|--------|----------|--------|---------|------|
| 1.1 | `/api/auth/register` | POST | User self-signup | Public |
| 1.1 | `/api/auth/login` | POST | Issue JWT token | Public |

### 4.2 User Management Routes

| Req ID | Endpoint | Method | Purpose | Auth |
|--------|----------|--------|---------|------|
| 2.1 | (internal) | - | Bootstrap host on startup | System |
| 2.2 | `/api/users/create-organiser` | POST | Host creates organiser | Host |
| 2.2 | `/api/users/organisers` | GET | List organisers | Host |
| 2.2 | `/api/users/organisers/:id` | DELETE | Delete organiser | Host |
| 2.3 | `/api/users/create-management` | POST | Organiser creates management user | Organiser |
| 2.3 | `/api/users/management` | GET | List management users | Organiser |
| 2.3 | `/api/users/management/:id` | DELETE | Delete management user | Organiser |

### 4.3 Event Routes

| Req ID | Endpoint | Method | Purpose | Auth |
|--------|----------|--------|---------|------|
| 3.1 | `/api/main-events` | POST | Create main event | Organiser/Host |
| 3.1 | `/api/main-events` | GET | List main events | Authenticated |
| 3.1 | `/api/main-events/:id` | PUT | Update main event | Organiser/Host |
| 3.1 | `/api/main-events/:id` | DELETE | Delete main event | Organiser/Host |
| 3.2 | `/api/events` | POST | Create sub-event | Management/Organiser/Host |
| 3.2 | `/api/events` | GET | List sub-events | Authenticated |
| 3.2 | `/api/events/:id` | PUT | Update sub-event | Management/Organiser/Host |
| 3.2 | `/api/events/:id` | DELETE | Delete sub-event | Management/Organiser/Host |

### 4.4 Team Routes

| Req ID | Endpoint | Method | Purpose | Auth |
|--------|----------|--------|---------|------|
| 4.1 | `/api/team/create` | POST | Create team | Authenticated user |
| 4.1 | `/api/team/add-member` | POST | Add team member | Team leader |
| 4.1 | `/api/team/remove-member` | DELETE | Remove team member | Team leader |
| 4.1 | `/api/team/my` | GET | View user's teams | Authenticated user |

### 4.5 Registration Routes

| Req ID | Endpoint | Method | Purpose | Auth |
|--------|----------|--------|---------|------|
| 4.2/4.3 | `/api/register` | POST | Register for event | Authenticated user |
| 4.2/4.3 | `/api/register/my` | GET | View user registrations | Authenticated user |
| 5.1 | `/api/register/event/:eventId` | GET | View event registrations | Management/Organiser/Host |

### 4.6 Support Routes

| Req ID | Endpoint | Method | Purpose | Auth |
|--------|----------|--------|---------|------|
| 7.1 | `/api/chatbot` | POST | Chat for event help | Optional (Public/Auth) |
| 7.2 | `/api/health` | GET | Server health check | Public |

---

## 5. Frontend Viewpoint - Requirement to Pages

## 5. Frontend Viewpoint - Requirement to Pages

| Req ID | Page | URL Path | Role | Features |
|--------|------|----------|------|----------|
| 1.1 | Login | `/login.html` | Public | User/Organiser/Host login |
| 1.1 | Register | `/register.html` | Public | User self-registration |
| 5.2 | User Dashboard | `/user-dashboard.html` | User | View events, registrations, timeline |
| 5.3 | Host Dashboard | `/host-dashboard.html` | Host | Manage organisers, monitor all events |
| 6.1 | Organiser Dashboard | `/organiser-dashboard.html` | Organiser | Create/manage main events, create management users |
| 6.2 | Management Dashboard | `/management-dashboard.html` | Management | Manage assigned sub-events, view registrations |
| 4.1, 6.3 | Team Management | `/team-management.html` | User | Create teams, add/remove members, register team |

**Supporting JavaScript:** `main.js` (core utilities), role-specific JS files for each dashboard.

---

## 6. Component Viewpoint - Requirement to Code Mapping

### 6.1 Controllers

| Req ID | Controller | Key Methods | Status |
|--------|-----------|-------------|--------|
| 1.1 | `authController.js` | `register()`, `login()` | Finished |
| 2.1, 2.2, 2.3 | `usersController.js` | `createOrganiser()`, `createManagement()`, list/delete | Finished |
| 3.1 | `mainEventController.js` | CRUD operations for main events | Finished |
| 3.2 | `eventController.js` | CRUD operations for sub-events | Finished |
| 4.1 | `teamController.js` | `createTeam()`, `addMember()`, `removeMember()`, `myTeams()` | Finished |
| 4.2, 4.3 | `registrationController.js` | `registerForEvent()`, `myRegistrations()`, `getEventRegistrations()` | Finished |
| 7.1 | `chatbotController.js` | `chatbot()` with intent detection and response generation | Finished |

### 6.2 Middleware

| Req ID | Middleware | Purpose | Status |
|--------|-----------|---------|--------|
| 1.2 | `middleware/auth.js` | JWT token verification and payload extraction | Finished |
| 1.3 | `middleware/roles.js` | Role-based access control (permit function) | Finished |

### 6.3 Models

| Req ID | Model | Collections | Status |
|--------|-------|-----------|--------|
| 1.1 | `User.js` | users | Finished |
| 3.1 | `MainEvent.js` | mainEvents | Finished |
| 3.2 | `Event.js` | events | Finished |
| 4.1 | `Team.js`, `TeamMember.js` | teams, teamMembers | Finished |
| 4.2, 4.3 | `Registration.js` | registrations | Finished |

### 6.4 Utilities

| Req ID | Utility | Purpose | Status |
|--------|---------|---------|--------|
| 2.1 | `utils/bootstrapHost.js` | Auto-create host account from .env on startup | Finished |

---

## 7. Test Case Mapping

| Test Case | Requirement | Scenario | Expected Result |
|-----------|-------------|----------|-----------------|
| TC-01 | 1.1 | User registers with valid email, password, name | Account created, can login |
| TC-02 | 1.1 | User logs in with correct credentials | JWT token issued, stored in localStorage |
| TC-03 | 1.2 | Authenticated request with expired/invalid token | 401 Unauthorized |
| TC-04 | 1.3 | Host accesses `/api/users/organisers`, User role attempts same | User gets 403 Forbidden |
| TC-05 | 2.1 | App starts with HOST_NAME, HOST_EMAIL, HOST_PASSWORD in .env | Host account synced in database |
| TC-06 | 2.2 | Host POSTs to `/api/users/create-organiser` with organiser details | Organiser account created, appears in GET list |
| TC-07 | 2.2 | Host DELETEs organiser by ID | Organiser removed, no longer in GET list |
| TC-08 | 2.3 | Organiser POSTs to `/api/users/create-management` with user details | Management user created under organiser scope |
| TC-09 | 3.1 | Organiser POSTs main event with name, dates, description | Event created, appears in GET `/api/main-events` |
| TC-10 | 3.1 | Organiser PUTs update to main event (dates, description) | Event updated, changes reflected |
| TC-11 | 3.1 | Organiser DELETEs main event | Event removed, cascaded deletions occur |
| TC-12 | 3.2 | Management POSTs sub-event under main event with capacity, deadline | Sub-event created, visible to authorised roles |
| TC-13 | 3.2 | User attempts GET `/api/events` with no access | No sub-events returned (filtered by role) |
| TC-14 | 3.3 | Management PUTs update to sub-event (dates, capacity) | Event updated, validation checks applied |
| TC-15 | 4.1 | User POSTs `/api/team/create` with team name for an event | Team created with user as leader |
| TC-16 | 4.1 | Team leader POSTs `/api/team/add-member` with member email | Member added, verified in GET `/api/team/my` |
| TC-17 | 4.1 | Team leader DELETEs member from team | Member removed from team |
| TC-18 | 4.2 | User POSTs `/api/register` for individual event (no team) | Registration created with status confirmed |
| TC-19 | 4.3 | Team leader POSTs `/api/register` with eventId, teamId | All team members registered, bulk insert verified |
| TC-20 | 4.3 | Same user attempts re-registration for same event | 409 Conflict response (duplicate check) |
| TC-21 | 5.1 | Management POSTs GET `/api/register/event/:eventId` | List of all registrations for that event returned |
| TC-22 | 5.2 | User logs in and navigates to `/user-dashboard.html` | Dashboard loads with events timeline, registrations list |
| TC-23 | 5.3 | Host logs in and navigates to `/host-dashboard.html` | Host dashboard loads, option to manage organisers visible |
| TC-24 | 6.1 | Organiser logs in and navigates to `/organiser-dashboard.html` | Organiser dashboard loads, option to create main event visible |
| TC-25 | 6.2 | Management logs in and navigates to `/management-dashboard.html` | Management dashboard loads, assigned sub-events listed |
| TC-26 | 6.3 | User navigates to `/team-management.html` | Team management page loads, create team form visible |
| TC-27 | 7.1 | User POSTs `/api/chatbot` with message "show events" | Chatbot returns list of available events |
| TC-28 | 7.1 | User POSTs `/api/chatbot` with message "how to register" | Chatbot returns registration guide |
| TC-29 | 7.2 | GET `/api/health` | Response: `{ status: "ok" }`, HTTP 200 |

---

## 8. Design Status Summary

| Category | Completed | In Progress | Pending |
|----------|-----------|-------------|---------|
| Security & Auth | ✓ 1.1, 1.2, 1.3 | — | — |
| User & Role Management | ✓ 2.1, 2.2, 2.3 | — | — |
| Event Management | ✓ 3.1, 3.2, 3.3 | — | — |
| Team & Registration | ✓ 4.1, 4.2, 4.3 | — | — |
| Dashboards & Monitoring | ✓ 5.1, 5.2, 5.3 | — | — |
| Role Dashboards | ✓ 6.1, 6.2, 6.3 | — | — |
| Support Services | ✓ 7.1, 7.2 | — | — |

**Overall Status: 100% Specification Finished | 100% Design Finished | Ready for Testing**

---

## 9. Traceability Matrix - Full View

| Req ID | Feature | Business Need | Component(s) | Route(s) | Model(s) | Test Case(s) | Status |
|--------|---------|----------------|-------------|---------|---------|------------|--------|
| 1.1 | User Auth | Secure access | authController | `/api/auth/*` | User | TC-01, TC-02 | ✓ |
| 1.2 | JWT Sessions | Session security | middleware/auth | (all protected) | — | TC-03 | ✓ |
| 1.3 | RBAC | Access control | middleware/roles | (all protected) | — | TC-04 | ✓ |
| 2.1 | Host Bootstrap | Admin initialization | bootstrapHost | (startup) | User | TC-05 | ✓ |
| 2.2 | Host Creates Organisers | Admin delegation | usersController | `/api/users/create-organiser` | User | TC-06, TC-07 | ✓ |
| 2.3 | Organiser Mgmt Users | Operations delegation | usersController | `/api/users/create-management` | User | TC-08 | ✓ |
| 3.1 | Main Events | Event planning | mainEventController | `/api/main-events` | MainEvent | TC-09, TC-10, TC-11 | ✓ |
| 3.2 | Sub-Events | Detailed scheduling | eventController | `/api/events` | Event | TC-12, TC-13, TC-14 | ✓ |
| 3.3 | Event Visibility | Scoped access | eventController | `/api/events` | Event | TC-13 | ✓ |
| 4.1 | Team Mgmt | Team workflows | teamController | `/api/team/*` | Team, TeamMember | TC-15, TC-16, TC-17 | ✓ |
| 4.2 | Individual Reg | Solo participation | registrationController | `/api/register` | Registration | TC-18 | ✓ |
| 4.3 | Team Reg | Group participation | registrationController | `/api/register` | Registration, Team | TC-19, TC-20 | ✓ |
| 5.1 | Staff Reg View | Operational monitoring | registrationController | `/api/register/event/:eventId` | Registration | TC-21 | ✓ |
| 5.2 | User Dashboard | Participant interface | user-dashboard.js | `/user-dashboard.html` | — | TC-22 | ✓ |
| 5.3 | Host Dashboard | Admin control | host-dashboard.js | `/host-dashboard.html` | — | TC-23 | ✓ |
| 6.1 | Organiser Dashboard | Event control | organiser-dashboard.js | `/organiser-dashboard.html` | — | TC-24 | ✓ |
| 6.2 | Management Dashboard | Sub-event ops | management-dashboard.js | `/management-dashboard.html` | — | TC-25 | ✓ |
| 6.3 | Team Mgmt Page | Team UI | team-management.html | `/team-management.html` | — | TC-26 | ✓ |
| 7.1 | AI Chatbot | Event assistance | chatbotController | `/api/chatbot` | Event, Registration | TC-27, TC-28 | ✓ |
| 7.2 | Health Check | Uptime monitoring | app.js | `/api/health` | — | TC-29 | ✓ |

---

## Notes

- This RTM is based on the current implemented codebase in `src/` and `frontend/`.
- All 21 requirements are **Completed** with both **Specification** and **Design** marked finished.
- The matrix can be exported to **CSV or Excel** format for formal submission if needed.
- Reference the [UML_DIAGRAMS.md](UML_DIAGRAMS.md) file for detailed architectural viewpoints (Interaction, Composition, Logical, Dependency, Data, API, Deployment, State, Algorithm, Resource).