# UML Diagrams - Event Registration Management System

This document provides UML diagrams mapped to the requested viewpoints.
All diagrams are written in Mermaid so they can be rendered in Markdown tools that support Mermaid.

## 5.1 Interaction Viewpoint - Sequence Diagram (User Team Registration)

```mermaid
sequenceDiagram
    actor U as User (Team Leader)
    participant UI as Frontend (user-dashboard.js)
    participant API as /api/register
    participant AUTH as auth middleware
    participant RC as registrationController
    participant EV as Event model
    participant TM as Team model
    participant TMM as TeamMember model
    participant REG as Registration model

    U->>UI: Click Register (team event)
    UI->>API: POST /api/register {eventId, teamId} + Bearer token
    API->>AUTH: Validate JWT
    AUTH-->>API: req.user
    API->>RC: registerForEvent(req,res)
    RC->>EV: findById(eventId)
    EV-->>RC: event
    RC->>TM: findById(teamId)
    TM-->>RC: team
    RC->>TMM: find({team: teamId})
    TMM-->>RC: members
    RC->>REG: find({user in allUserIds, event})
    REG-->>RC: duplicates?
    RC->>REG: insertMany(team registrations)
    REG-->>RC: created[]
    RC-->>UI: 201 Team registered successfully
    UI-->>U: Show success state
```

## 5.2 Context Viewpoint - Use Case Diagram

```mermaid
flowchart LR
    subgraph System[University Event Registration Management System]
      UC1([Register/Login])
      UC2([Create Organiser])
      UC3([Create Management User])
      UC4([Create Main Event])
      UC5([Create/Update Sub-Event])
      UC6([Create Team and Add Members])
      UC7([Register for Event])
      UC8([View Event Registrations])
      UC9([Chatbot Assistance])
    end

    Host[Host] --> UC2
    Host --> UC4
    Host --> UC8

    Org[Organiser] --> UC3
    Org --> UC4
    Org --> UC5
    Org --> UC8

    Mgmt[Management] --> UC5
    Mgmt --> UC8

    User[User] --> UC1
    User --> UC6
    User --> UC7
    User --> UC9
```

## 5.3 Composition Viewpoint - Package Diagram

```mermaid
flowchart TB
    APP[src/app.js]
    SERVER[src/server.js]

    subgraph Routes[src/routes]
      R1[authRoutes]
      R2[userRoutes]
      R3[mainEventRoutes]
      R4[eventRoutes]
      R5[teamRoutes]
      R6[registrationRoutes]
      R7[chatbotRoutes]
    end

    subgraph Controllers[src/controllers]
      C1[authController]
      C2[usersController]
      C3[mainEventController]
      C4[eventController]
      C5[teamController]
      C6[registrationController]
      C7[chatbotController]
    end

    subgraph Middleware[src/middleware]
      M1[auth]
      M2[roles]
    end

    subgraph Models[src/models]
      MO1[User]
      MO2[MainEvent]
      MO3[Event]
      MO4[Team]
      MO5[TeamMember]
      MO6[Registration]
    end

    subgraph Infra[src/config + src/utils]
      DB[config/db]
      BOOT[utils/bootstrapHost]
    end

    subgraph Frontend[frontend]
      P1[login/register pages]
      P2[dashboard pages + js]
    end

    SERVER --> DB
    SERVER --> BOOT
    SERVER --> APP
    APP --> Routes
    Routes --> Middleware
    Routes --> Controllers
    Controllers --> Models
    P2 --> APP
    P1 --> APP
```

## 5.4 Logical Viewpoint - Class Diagram (Domain Model)

```mermaid
classDiagram
    class User {
      +ObjectId _id
      +String name
      +String email
      +String password
      +String role
      +ObjectId createdByOrganiser
      +ObjectId assignedMainEvent
      +String phone
      +String department
      +String year
      +String collegeName
      +String rollNo
    }

    class MainEvent {
      +ObjectId _id
      +String name
      +String description
      +Date startDate
      +Date endDate
      +ObjectId organiser
    }

    class Event {
      +ObjectId _id
      +ObjectId mainEvent
      +String name
      +Date date
      +String time
      +Date endDate
      +String endTime
      +String venue
      +String domain
      +Number maxParticipants
      +String eventType
      +Date registrationDeadline
      +ObjectId createdBy
      +ObjectId[] managementUsers
    }

    class Team {
      +ObjectId _id
      +String teamName
      +ObjectId teamLeader
      +ObjectId event
    }

    class TeamMember {
      +ObjectId _id
      +ObjectId team
      +ObjectId user
    }

    class Registration {
      +ObjectId _id
      +ObjectId user
      +ObjectId event
      +ObjectId team
      +String status
    }

    User "1" --> "0..*" MainEvent : organises
    MainEvent "1" --> "0..*" Event : contains
    User "1" --> "0..*" Event : creates
    User "0..*" --> "0..*" Event : assigned as managementUsers
    Event "1" --> "0..*" Team : has teams
    Team "1" --> "0..*" TeamMember : has members
    User "1" --> "0..*" Team : leads
    User "1" --> "0..*" TeamMember : participates
    User "1" --> "0..*" Registration : makes
    Event "1" --> "0..*" Registration : receives
    Team "0..1" --> "0..*" Registration : team registrations
```

## 5.5 Dependency Viewpoint - Component Dependency Diagram

```mermaid
flowchart LR
    App[app.js]
    AR[authRoutes]
    UR[userRoutes]
    MR[mainEventRoutes]
    ER[eventRoutes]
    TR[teamRoutes]
    RR[registrationRoutes]
    CR[chatbotRoutes]

    AC[authController]
    UC[usersController]
    MEC[mainEventController]
    EC[eventController]
    TC[teamController]
    RC[registrationController]
    CC[chatbotController]

    AUTH[auth middleware]
    ROLES[roles middleware]

    U[(User)]
    ME[(MainEvent)]
    E[(Event)]
    T[(Team)]
    TM[(TeamMember)]
    R[(Registration)]

    App --> AR --> AC --> U
    App --> UR --> AUTH
    UR --> ROLES
    UR --> UC
    UC --> U
    UC --> ME

    App --> MR --> AUTH
    MR --> ROLES
    MR --> MEC
    MEC --> ME
    MEC --> U

    App --> ER --> AUTH
    ER --> ROLES
    ER --> EC
    EC --> E
    EC --> ME
    EC --> U
    EC --> R

    App --> TR --> AUTH
    TR --> TC
    TC --> T
    TC --> TM
    TC --> E

    App --> RR --> AUTH
    RR --> ROLES
    RR --> RC
    RC --> E
    RC --> T
    RC --> TM
    RC --> R
    RC --> U

    App --> CR --> AUTH
    CR --> CC
    CC --> E
    CC --> R
```

## 5.6 Information Viewpoint - Data Model Class Diagram

```mermaid
classDiagram
    class User {
      email: unique
      rollNo: unique sparse uppercase
      role: host|organiser|management|user
      assignedMainEvent: FK MainEvent?
      createdByOrganiser: FK User?
    }

    class MainEvent {
      organiser: FK User
      startDate
      endDate
    }

    class Event {
      mainEvent: FK MainEvent
      createdBy: FK User
      managementUsers: FK User[*]
      eventType: individual|team
      maxParticipants: min 1
      registrationDeadline
    }

    class Team {
      teamLeader: FK User
      event: FK Event
      unique(event, teamName)
    }

    class TeamMember {
      team: FK Team
      user: FK User
      unique(team, user)
    }

    class Registration {
      user: FK User
      event: FK Event
      team: FK Team?
      status: confirmed|pending|cancelled
      unique(user, event)
    }

    User --> MainEvent : organiser
    MainEvent --> Event : parent-child
    Event --> Team : team event grouping
    Team --> TeamMember : composition
    User --> Registration : participant
    Event --> Registration : registration target
    Team --> Registration : optional for team events
```

## 5.7 Patterns Use Viewpoint - Collaboration Diagram (Auth + RBAC)

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant Route as Express Route
    participant Auth as auth()
    participant Permit as permit(...roles)
    participant Controller as Controller Method
    participant Model as Mongoose Model

    Client->>Route: 1. HTTP request + Bearer token
    Route->>Auth: 2. Authenticate token
    Auth->>Model: 3. Fetch user by token payload.id
    Model-->>Auth: 4. User found
    Auth-->>Permit: 5. Attach req.user and continue
    Permit-->>Controller: 6. Role authorized
    Controller->>Model: 7. Execute business query/update
    Model-->>Controller: 8. Result
    Controller-->>Client: 9. JSON response
```

## 5.8 Interface Viewpoint - API Component Interfaces

```mermaid
flowchart LR
    FE[Frontend Pages + JS]

    subgraph API[Express API Interfaces]
      I1[/api/auth]
      I2[/api/users]
      I3[/api/main-events]
      I4[/api/events]
      I5[/api/team]
      I6[/api/register]
      I7[/api/chatbot]
    end

    subgraph Service[Controller Components]
      S1[Auth Service]
      S2[User Admin Service]
      S3[Main Event Service]
      S4[Sub-Event Service]
      S5[Team Service]
      S6[Registration Service]
      S7[Chatbot Service]
    end

    FE --> I1 --> S1
    FE --> I2 --> S2
    FE --> I3 --> S3
    FE --> I4 --> S4
    FE --> I5 --> S5
    FE --> I6 --> S6
    FE --> I7 --> S7
```

## 5.9 Structure Viewpoint - Deployment Diagram

```mermaid
flowchart TB
    UserDevice[Client Device\nBrowser + HTML/CSS/JS]
    NodeServer[Node.js Runtime\nExpress App]
    Mongo[(MongoDB Database)]
    Env[Environment Variables\n.env + host bootstrap values]

    UserDevice -->|HTTP/JSON| NodeServer
    NodeServer -->|Mongoose| Mongo
    Env --> NodeServer

    subgraph NodeServer
      Static[Static frontend from /frontend]
      Api[REST API /api/*]
      AuthLayer[JWT + RBAC middleware]
      Logic[Controllers + Models]
    end

    Api --> AuthLayer --> Logic
    Static --> Api
```

## 5.11 State Dynamics Viewpoint - Registration State Machine

```mermaid
stateDiagram-v2
    [*] --> Unregistered

    Unregistered --> EligibilityCheck: User submits registration
    EligibilityCheck --> Rejected: Deadline passed / slots full / invalid team
    EligibilityCheck --> Confirmed: Valid constraints

    Confirmed --> Cancelled: Admin or system cancellation
    Cancelled --> Confirmed: Re-activation (optional business action)

    Rejected --> Unregistered: User retries with valid inputs
    Confirmed --> [*]
```

## 5.12 Algorithm Viewpoint - Activity Diagram (registerForEvent)

```mermaid
flowchart TD
    A([Start]) --> B{eventId present?}
    B -- No --> E1[Return 400]
    B -- Yes --> C[Load Event]
    C --> D{Event exists?}
    D -- No --> E2[Return 404]
    D -- Yes --> F{Deadline passed?}
    F -- Yes --> E3[Return 400]
    F -- No --> G{Already registered?}
    G -- Yes --> E4[Return 409]
    G -- No --> H{Event type}

    H -- individual --> I[Count confirmed registrations]
    I --> J{Slots available?}
    J -- No --> E5[Return 400 Event full]
    J -- Yes --> K[Create single Registration]
    K --> Z([201 Created])

    H -- team --> L{teamId present?}
    L -- No --> E6[Return 400]
    L -- Yes --> M[Load Team and validate mapping/leader]
    M --> N{Valid team and leader?}
    N -- No --> E7[Return 403/404/400]
    N -- Yes --> O[Load team members]
    O --> P{Any member already registered?}
    P -- Yes --> E8[Return 409]
    P -- No --> Q[Check total slots for whole team]
    Q --> R{Enough slots?}
    R -- No --> E9[Return 400]
    R -- Yes --> S[insertMany registrations]
    S --> Z
```

## 5.13 Resource Viewpoint - Deployment Resource Diagram

```mermaid
flowchart LR
    CPU[Node Process\nSingle runtime instance]
    MEM[Runtime Memory\nJWT payloads, request context, cached objects]
    IO[Network I/O\nHTTP requests/responses]
    DBPOOL[Mongoose Connection\nMongo socket pool]
    STORE[(MongoDB Collections\nusers, mainEvents, events, teams, teammembers, registrations)]

    IO --> CPU
    CPU <--> MEM
    CPU <--> DBPOOL
    DBPOOL <--> STORE
```

## Notes

- These diagrams are aligned with the current code structure and route/controller/model behavior.
- If you want, the next step is generating PlantUML versions for the same viewpoints.

## PlantUML Code (All Mentioned Viewpoints)

### 5.1 Interaction Viewpoint - Sequence Diagram (User Team Registration)

```plantuml
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
```

### 5.2 Context Viewpoint - Use Case Diagram

```plantuml
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
```

### 5.3 Composition Viewpoint - Package Diagram

```plantuml
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
```

### 5.4 Logical Viewpoint - Class Diagram (Domain Model)

```plantuml
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
```

### 5.5 Dependency Viewpoint - Component Dependency Diagram

```plantuml
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
```

### 5.6 Information Viewpoint - Data Model Diagram

```plantuml
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
```

### 5.7 Patterns Use Viewpoint - Collaboration Diagram (Auth + RBAC)

```plantuml
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
```

### 5.8 Interface Viewpoint - API Component Interfaces

```plantuml
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
```

### 5.9 Structure Viewpoint - Deployment Diagram

```plantuml
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
```

### 5.11 State Dynamics Viewpoint - Registration State Machine

```plantuml
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
```

### 5.12 Algorithm Viewpoint - Activity Diagram (registerForEvent)

```plantuml
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
```

### 5.13 Resource Viewpoint - Deployment Resource Diagram

```plantuml
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
```