# PlantUML Diagrams - Event Registration Management System

Use each block independently in any PlantUML renderer.

## 5.1 Interaction Viewpoint - Sequence Diagram (User Team Registration)

@startuml
title 5.1 Interaction - Team Registration Sequence
actor "User (Team Leader)" as U
participant "Frontend (user-dashboard.js)" as UI
participant "/api/register" as API
participant "auth middleware" as AUTH
participant "registrationController" as RC
database "Event model" as EV
database "Team model" as TM
database "TeamMember model" as TMM
database "Registration model" as REG

U -> UI: Click Register (team event)
UI -> API: POST /api/register(eventId, teamId) + Bearer token
API -> AUTH: Validate JWT
AUTH --> API: req.user
API -> RC: registerForEvent(req,res)
RC -> EV: findById(eventId)
EV --> RC: event
RC -> TM: findById(teamId)
TM --> RC: team
RC -> TMM: find(teamId)
TMM --> RC: members
RC -> REG: find(user in allUserIds, event)
REG --> RC: duplicates?
RC -> REG: insertMany(team registrations)
REG --> RC: created[]
RC --> UI: 201 Team registered successfully
UI --> U: Show success state
@enduml

## 5.2 Context Viewpoint - Use Case Diagram

@startuml
title 5.2 Context - Use Case
left to right direction
actor Host
actor Organiser
actor Management
actor User

rectangle "University Event Registration Management System" {
  usecase "Register/Login" as UC1
  usecase "Create Organiser" as UC2
  usecase "Create Management User" as UC3
  usecase "Create Main Event" as UC4
  usecase "Create/Update Sub-Event" as UC5
  usecase "Create Team and Add Members" as UC6
  usecase "Register for Event" as UC7
  usecase "View Event Registrations" as UC8
  usecase "Chatbot Assistance" as UC9
}

Host --> UC2
Host --> UC4
Host --> UC8
Organiser --> UC3
Organiser --> UC4
Organiser --> UC5
Organiser --> UC8
Management --> UC5
Management --> UC8
User --> UC1
User --> UC6
User --> UC7
User --> UC9
@enduml

## 5.3 Composition Viewpoint - Package Diagram

@startuml
title 5.3 Composition - Package Diagram
package "src" {
  [app.js] as APP
  [server.js] as SERVER

  package "routes" {
    [authRoutes]
    [userRoutes]
    [mainEventRoutes]
    [eventRoutes]
    [teamRoutes]
    [registrationRoutes]
    [chatbotRoutes]
  }

  package "controllers" {
    [authController]
    [usersController]
    [mainEventController]
    [eventController]
    [teamController]
    [registrationController]
    [chatbotController]
  }

  package "middleware" {
    [auth]
    [roles]
  }

  package "models" {
    [User]
    [MainEvent]
    [Event]
    [Team]
    [TeamMember]
    [Registration]
  }

  package "config + utils" {
    [config/db]
    [utils/bootstrapHost]
  }
}

package "frontend" {
  [login/register pages]
  [dashboard pages + js]
}

SERVER --> [config/db]
SERVER --> [utils/bootstrapHost]
SERVER --> APP
APP --> [authRoutes]
APP --> [userRoutes]
APP --> [mainEventRoutes]
APP --> [eventRoutes]
APP --> [teamRoutes]
APP --> [registrationRoutes]
APP --> [chatbotRoutes]
[authRoutes] --> [authController]
[userRoutes] --> [usersController]
[mainEventRoutes] --> [mainEventController]
[eventRoutes] --> [eventController]
[teamRoutes] --> [teamController]
[registrationRoutes] --> [registrationController]
[chatbotRoutes] --> [chatbotController]
[authController] --> [User]
[usersController] --> [User]
[usersController] --> [MainEvent]
[mainEventController] --> [MainEvent]
[eventController] --> [Event]
[eventController] --> [MainEvent]
[teamController] --> [Team]
[teamController] --> [TeamMember]
[registrationController] --> [Registration]
[dashboard pages + js] --> APP
[login/register pages] --> APP
@enduml

## 5.4 Logical Viewpoint - Class Diagram (Domain Model)

@startuml
title 5.4 Logical - Domain Class Diagram

class User {
  +_id: ObjectId
  +name: String
  +email: String
  +password: String
  +role: String
  +createdByOrganiser: ObjectId
  +assignedMainEvent: ObjectId
  +phone: String
  +department: String
  +year: String
  +collegeName: String
  +rollNo: String
}

class MainEvent {
  +_id: ObjectId
  +name: String
  +description: String
  +startDate: Date
  +endDate: Date
  +organiser: ObjectId
}

class Event {
  +_id: ObjectId
  +mainEvent: ObjectId
  +name: String
  +date: Date
  +time: String
  +endDate: Date
  +endTime: String
  +venue: String
  +domain: String
  +maxParticipants: Number
  +eventType: String
  +registrationDeadline: Date
  +createdBy: ObjectId
  +managementUsers: ObjectId[]
}

class Team {
  +_id: ObjectId
  +teamName: String
  +teamLeader: ObjectId
  +event: ObjectId
}

class TeamMember {
  +_id: ObjectId
  +team: ObjectId
  +user: ObjectId
}

class Registration {
  +_id: ObjectId
  +user: ObjectId
  +event: ObjectId
  +team: ObjectId
  +status: String
}

User "1" --> "0..*" MainEvent : organises
MainEvent "1" --> "0..*" Event : contains
User "1" --> "0..*" Event : creates
User "0..*" --> "0..*" Event : assigned management
Event "1" --> "0..*" Team : has
Team "1" --> "0..*" TeamMember : has
User "1" --> "0..*" Team : leads
User "1" --> "0..*" TeamMember : participates
User "1" --> "0..*" Registration : makes
Event "1" --> "0..*" Registration : receives
Team "0..1" --> "0..*" Registration : optional for team events
@enduml

## 5.5 Dependency Viewpoint - Component Dependency Diagram

@startuml
title 5.5 Dependency - Components
skinparam componentStyle rectangle

component app
component authRoutes
component userRoutes
component mainEventRoutes
component eventRoutes
component teamRoutes
component registrationRoutes
component chatbotRoutes

component authController
component usersController
component mainEventController
component eventController
component teamController
component registrationController
component chatbotController

component auth
component roles

database User
database MainEvent
database Event
database Team
database TeamMember
database Registration

app --> authRoutes
app --> userRoutes
app --> mainEventRoutes
app --> eventRoutes
app --> teamRoutes
app --> registrationRoutes
app --> chatbotRoutes

authRoutes --> authController
userRoutes --> auth
userRoutes --> roles
userRoutes --> usersController

mainEventRoutes --> auth
mainEventRoutes --> roles
mainEventRoutes --> mainEventController

eventRoutes --> auth
eventRoutes --> roles
eventRoutes --> eventController

teamRoutes --> auth
teamRoutes --> teamController

registrationRoutes --> auth
registrationRoutes --> roles
registrationRoutes --> registrationController

chatbotRoutes --> auth
chatbotRoutes --> chatbotController

authController --> User
usersController --> User
usersController --> MainEvent
mainEventController --> MainEvent
mainEventController --> User
eventController --> Event
eventController --> MainEvent
eventController --> User
eventController --> Registration
teamController --> Team
teamController --> TeamMember
teamController --> Event
registrationController --> Event
registrationController --> Team
registrationController --> TeamMember
registrationController --> Registration
registrationController --> User
chatbotController --> Event
chatbotController --> Registration
@enduml

## 5.6 Information Viewpoint - Data Model Diagram

@startuml
title 5.6 Information - Data Model

entity User {
  * email : String <<unique>>
  * rollNo : String <<unique,sparse,uppercase>>
  * role : host|organiser|management|user
  --
  assignedMainEvent : MainEvent?
  createdByOrganiser : User?
}

entity MainEvent {
  * organiser : User
  * startDate : Date
  * endDate : Date
}

entity Event {
  * mainEvent : MainEvent
  * createdBy : User
  * managementUsers : User[*]
  * eventType : individual|team
  * maxParticipants : Number (min 1)
  * registrationDeadline : Date
}

entity Team {
  * teamLeader : User
  * event : Event
  --
  unique(event, teamName)
}

entity TeamMember {
  * team : Team
  * user : User
  --
  unique(team, user)
}

entity Registration {
  * user : User
  * event : Event
  team : Team?
  * status : confirmed|pending|cancelled
  --
  unique(user, event)
}

User ||--o{ MainEvent : organises
MainEvent ||--o{ Event : contains
Event ||--o{ Team : has
Team ||--o{ TeamMember : has
User ||--o{ Registration : owns
Event ||--o{ Registration : target
Team o|--o{ Registration : optional
@enduml

## 5.7 Patterns Use Viewpoint - Collaboration Diagram (Auth + RBAC)

@startuml
title 5.7 Patterns Use - Auth + RBAC Collaboration
autonumber
actor Client
participant "Express Route" as Route
participant "auth()" as Auth
participant "permit(...roles)" as Permit
participant "Controller Method" as Controller
participant "Mongoose Model" as Model

Client -> Route: HTTP request + Bearer token
Route -> Auth: authenticate
Auth -> Model: fetch user by token payload.id
Model --> Auth: user
Auth --> Permit: req.user
Permit --> Controller: authorized request
Controller -> Model: business query/update
Model --> Controller: result
Controller --> Client: JSON response
@enduml

## 5.8 Interface Viewpoint - API Component Interfaces

@startuml
title 5.8 Interface - API Components
skinparam componentStyle rectangle

component "Frontend Pages + JS" as FE

interface "IAuthAPI\n/api/auth" as I1
interface "IUsersAPI\n/api/users" as I2
interface "IMainEventsAPI\n/api/main-events" as I3
interface "IEventsAPI\n/api/events" as I4
interface "ITeamAPI\n/api/team" as I5
interface "IRegisterAPI\n/api/register" as I6
interface "IChatbotAPI\n/api/chatbot" as I7

component "Auth Service" as S1
component "User Admin Service" as S2
component "Main Event Service" as S3
component "Sub-Event Service" as S4
component "Team Service" as S5
component "Registration Service" as S6
component "Chatbot Service" as S7

FE --> I1
FE --> I2
FE --> I3
FE --> I4
FE --> I5
FE --> I6
FE --> I7

I1 -- S1
I2 -- S2
I3 -- S3
I4 -- S4
I5 -- S5
I6 -- S6
I7 -- S7
@enduml

## 5.9 Structure Viewpoint - Deployment Diagram

@startuml
title 5.9 Structure - Deployment
node "Client Device\nBrowser + HTML/CSS/JS" as Client
node "Node.js Runtime\nExpress App" as Node
database "MongoDB" as Mongo
artifact ".env / env vars" as Env

node Node {
  component "Static frontend (/frontend)" as Static
  component "REST API (/api/*)" as API
  component "JWT + RBAC middleware" as Security
  component "Controllers + Models" as Logic

  API --> Security
  Security --> Logic
  Static --> API
}

Client --> Node : HTTP/JSON
Node --> Mongo : Mongoose
Env --> Node : configuration
@enduml

## 5.11 State Dynamics Viewpoint - Registration State Machine

@startuml
title 5.11 State Dynamics - Registration Lifecycle
[*] --> Unregistered

Unregistered --> EligibilityCheck : submit registration
EligibilityCheck --> Rejected : deadline passed / full / invalid team
EligibilityCheck --> Confirmed : constraints valid

Confirmed --> Cancelled : cancellation
Cancelled --> Confirmed : re-activation
Rejected --> Unregistered : retry with valid input
Confirmed --> [*]
@enduml

## 5.12 Algorithm Viewpoint - Activity Diagram (registerForEvent)

@startuml
title 5.12 Algorithm - registerForEvent Activity
start

if (eventId present?) then (yes)
  :Load Event;
  if (Event exists?) then (yes)
    if (Deadline passed?) then (no)
      if (Already registered?) then (no)
        if (Event type == individual?) then (yes)
          :Count confirmed registrations;
          if (Slots available?) then (yes)
            :Create single Registration;
            :Return 201 Created;
          else (no)
            :Return 400 Event full;
          endif
        else (team)
          if (teamId present?) then (yes)
            :Load Team and validate mapping/leader;
            if (Valid team + leader?) then (yes)
              :Load team members;
              if (Any member already registered?) then (no)
                :Check total slots for whole team;
                if (Enough slots?) then (yes)
                  :insertMany registrations;
                  :Return 201 Created;
                else (no)
                  :Return 400 Not enough slots;
                endif
              else (yes)
                :Return 409 Already registered member;
              endif
            else (no)
              :Return 403/404/400;
            endif
          else (no)
            :Return 400 teamId required;
          endif
        endif
      else (yes)
        :Return 409 Already registered;
      endif
    else (yes)
      :Return 400 Deadline passed;
    endif
  else (no)
    :Return 404 Event not found;
  endif
else (no)
  :Return 400 eventId required;
endif

stop
@enduml

## 5.13 Resource Viewpoint - Deployment Resource Diagram

@startuml
title 5.13 Resource - Runtime Resource View
node "Node Process\nSingle runtime instance" as CPU
node "Runtime Memory\nJWT payloads, request context, cached objects" as MEM
node "Network I/O\nHTTP requests/responses" as IO
node "Mongoose Connection\nMongo socket pool" as DBPOOL
database "Mongo Collections\nusers, mainEvents, events, teams, teammembers, registrations" as STORE

IO --> CPU
CPU <--> MEM
CPU <--> DBPOOL
DBPOOL <--> STORE
@enduml