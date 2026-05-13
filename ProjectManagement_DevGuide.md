# Project Management App — Full-Stack Development Guide
### Ethara AI Assessment | Round 1 | Deadline: 13th May 2026, 11:00 PM

---

## TABLE OF CONTENTS

1. [Tech Stack & Libraries](#1-tech-stack--libraries)
2. [Project Architecture Overview](#2-project-architecture-overview)
3. [User Roles & Access Model](#3-user-roles--access-model)
4. [Backend — Folder Structure](#4-backend--folder-structure)
5. [Backend — MongoDB Data Models](#5-backend--mongodb-data-models)
6. [Backend — API Design & Endpoints](#6-backend--api-design--endpoints)
7. [WebSocket Events Design](#7-websocket-events-design)
8. [Frontend — Folder Structure](#8-frontend--folder-structure)
9. [Frontend — Routing & Layout Structure](#9-frontend--routing--layout-structure)
10. [Frontend — Pages & Components Guide](#10-frontend--pages--components-guide)
11. [Canvas Feature Design](#11-canvas-feature-design)
12. [User Flow & Edge Cases](#12-user-flow--edge-cases)
13. [Email System (Nodemailer)](#13-email-system-nodemailer)
14. [Fallback Screens](#14-fallback-screens)
15. [Security Checklist](#15-security-checklist)
16. [Build Order Recommendation](#16-build-order-recommendation)

---

## 1. TECH STACK & LIBRARIES

### Backend
- **Runtime**: Node.js (Express.js)
- **Database**: MongoDB + Mongoose ODM
- **Auth**: JWT (access token + refresh token pattern)
- **WebSocket**: `ws` or `socket.io` (prefer socket.io for rooms/namespaces)
- **Email**: Nodemailer with Gmail/SMTP transport
- **Validation**: express-validator or Joi
- **Password Hashing**: bcryptjs
- **File Uploads**: multer (for canvas exports or avatars, optional)
- **Env**: dotenv

### Frontend
- **Framework**: React (Vite)
- **Routing**: React Router DOM v6
- **WebSocket Client**: socket.io-client
- **Styling**: Tailwind CSS (fastest for responsive + polished UI)
- **Icons**: lucide-react or react-icons
- **Charts (Dashboard)**: recharts
- **Canvas**: Fabric.js or plain HTML5 Canvas API
- **State**: React Context + useReducer (or Zustand for simplicity)
- **HTTP Client**: Axios with interceptors
- **Toast Notifications**: react-hot-toast or sonner
- **Date Handling**: date-fns

---

## 2. PROJECT ARCHITECTURE OVERVIEW

```
client/          ← React frontend (Vite)
server/          ← Node.js + Express backend
```

Both run as separate processes. Frontend talks to backend via REST + WebSocket.

### Environment Variables Needed (Backend)
```
PORT
MONGO_URI
JWT_SECRET
JWT_REFRESH_SECRET
JWT_EXPIRES_IN
JWT_REFRESH_EXPIRES_IN
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
CLIENT_URL          ← for CORS
```

### Key Architectural Decisions
- Access tokens are short-lived (15min–1hr), refresh tokens are long-lived (7–30 days).
- Refresh token is stored in HTTP-only cookie; access token in memory (or localStorage as fallback).
- All protected routes check JWT via middleware before controllers run.
- Role is embedded in the JWT payload. Never trust role from the request body.
- WebSocket connections are authenticated — attach user identity during handshake.
- Canvas state is persisted in MongoDB, not just in-memory.

---

## 3. USER ROLES & ACCESS MODEL

### Three Roles
| Role | Description |
|------|-------------|
| `admin` | Team Leader — full CRUD on everything, manages users, sends emails, configures settings |
| `manager` | Project Manager — manages projects, tasks, assigns team members |
| `member` | Team Member — views assigned tasks, updates task status, collaborates on canvas |

### Role Hierarchy for Access
- Admin can do everything a Manager can do, and everything a Member can do.
- Manager can do everything a Member can do within their project scope.
- Member cannot access other members' personal data, project financials, or settings.

### Key Access Rules
- A member can only see projects they are assigned to.
- A manager can only see/manage projects they created or are assigned to manage.
- Admin sees all projects, all users, all settings.
- Task creation: Admin and Manager only. Members can only update status of assigned tasks.
- User invitation/removal: Admin only.
- Settings page: Admin only (full), Members see only their own profile.
- Email sending: Admin only.
- Canvas: All roles in a project can view. Admin and Manager can create/edit. Members can annotate (add sticky notes/comments only).

---

## 4. BACKEND — FOLDER STRUCTURE

```
server/
├── config/
│   ├── db.js                  ← MongoDB connection
│   ├── nodemailer.js          ← Nodemailer transport config
│   └── socket.js              ← Socket.io initialization & auth middleware
│
├── models/
│   ├── User.model.js
│   ├── Project.model.js
│   ├── Task.model.js
│   ├── Team.model.js
│   ├── Canvas.model.js
│   ├── Notification.model.js
│   └── RefreshToken.model.js
│
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── project.controller.js
│   ├── task.controller.js
│   ├── team.controller.js
│   ├── canvas.controller.js
│   ├── notification.controller.js
│   └── email.controller.js
│
├── routes/
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── project.routes.js
│   ├── task.routes.js
│   ├── team.routes.js
│   ├── canvas.routes.js
│   ├── notification.routes.js
│   └── email.routes.js
│
├── services/
│   ├── auth.service.js        ← JWT generation, token refresh logic
│   ├── email.service.js       ← Nodemailer send functions
│   ├── notification.service.js← Create + broadcast notifications
│   └── canvas.service.js      ← Canvas state merge/save logic
│
├── middleware/
│   ├── auth.middleware.js     ← verifyToken, attachUser
│   ├── role.middleware.js     ← requireRole(...roles)
│   └── validate.middleware.js ← Request body validation
│
├── utils/
│   ├── apiResponse.js         ← Standard { success, data, message } wrapper
│   ├── asyncHandler.js        ← try/catch wrapper for async controllers
│   └── constants.js           ← Role names, task statuses, etc.
│
├── .env
├── app.js                     ← Express app setup, middleware, routes
└── server.js                  ← HTTP server + Socket.io attach + listen
```

> **Key points:**
> - `middleware/` is outside the 5 required folders but keep it. It's helper logic, not business logic.
> - `utils/` on the backend is separate from the frontend `utils/`.
> - `app.js` should only wire middleware and routes; no business logic here.
> - `server.js` creates the HTTP server from `app`, attaches socket.io, and calls `.listen()`.

---

## 5. BACKEND — MONGODB DATA MODELS

### 5.1 User Model
```
Fields:
  name            String, required
  email           String, required, unique, lowercase
  password        String, required, select: false  ← never return in queries by default
  role            Enum: ['admin', 'manager', 'member'], default: 'member'
  avatar          String (URL), optional
  isActive        Boolean, default: true
  lastSeen        Date
  createdAt       Date (timestamps: true)
  updatedAt       Date (timestamps: true)
```
> Always use `select: false` on password field and explicitly select it only during login.

### 5.2 Team Model
```
Fields:
  name            String, required
  description     String
  createdBy       ObjectId → User (admin only)
  members         [{ user: ObjectId → User, role: Enum['admin','manager','member'], joinedAt: Date }]
  createdAt / updatedAt
```
> There is one Team per organization in this app. If you want multiple teams, add a `teams` array to projects.

### 5.3 Project Model
```
Fields:
  name            String, required
  description     String
  status          Enum: ['planning', 'active', 'on_hold', 'completed', 'archived']
  priority        Enum: ['low', 'medium', 'high', 'critical']
  startDate       Date
  endDate         Date (deadline)
  createdBy       ObjectId → User
  manager         ObjectId → User
  members         [ObjectId → User]
  tags            [String]
  progress        Number (0–100), computed or manually set
  createdAt / updatedAt
```

### 5.4 Task Model
```
Fields:
  title           String, required
  description     String
  project         ObjectId → Project, required
  assignedTo      [ObjectId → User]
  createdBy       ObjectId → User
  status          Enum: ['todo', 'in_progress', 'in_review', 'done', 'blocked']
  priority        Enum: ['low', 'medium', 'high', 'critical']
  dueDate         Date
  estimatedHours  Number
  actualHours     Number
  attachments     [String] (URLs)
  comments        [{ author: ObjectId → User, text: String, createdAt: Date }]
  labels          [String]
  parentTask      ObjectId → Task (for subtasks, optional)
  order           Number (for drag-and-drop ordering within a column)
  createdAt / updatedAt
```

### 5.5 Canvas Model
```
Fields:
  project         ObjectId → Project, required, unique (one canvas per project)
  data            Mixed (JSON — stores Fabric.js or your canvas serialized state)
  lastEditedBy    ObjectId → User
  version         Number, default: 1 (increment on each save for conflict detection)
  createdAt / updatedAt
```
> Store the full canvas JSON as a `Mixed` field. On save, bump `version`. If two users save simultaneously (version mismatch), return a 409 conflict and ask the frontend to reload.

### 5.6 Notification Model
```
Fields:
  recipient       ObjectId → User
  type            Enum: ['task_assigned', 'task_updated', 'comment_added', 'project_update', 'invite', 'email_sent']
  message         String
  link            String (frontend route, e.g. /projects/abc/tasks/xyz)
  isRead          Boolean, default: false
  createdAt
```

### 5.7 RefreshToken Model
```
Fields:
  token           String, required
  user            ObjectId → User
  expiresAt       Date
  createdAt
```
> This allows server-side refresh token invalidation (logout, revoke). Clean up expired tokens with a cron or TTL index.

---

## 6. BACKEND — API DESIGN & ENDPOINTS

**Base URL**: `/api/v1`

All responses follow the standard wrapper:
```json
{ "success": true/false, "data": {}, "message": "string" }
```

Pagination for list endpoints: `?page=1&limit=10` → response includes `{ data: [], total, page, pages }`.

---

### 6.1 Auth Routes — `/api/v1/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | Register first admin account. If any user exists, block public registration (only admin can invite). Validate: name, email (format), password (min 8 chars, at least one number). Hash password with bcrypt (rounds: 12). Return access token + set refresh token cookie. |
| POST | `/login` | Public | Validate credentials. Check `isActive`. Compare hashed password. Return access token in body + refresh token in HTTP-only cookie. Also return user object (without password). Record `lastSeen`. |
| POST | `/refresh` | Cookie | Read refresh token from cookie. Verify against DB + JWT. Issue new access token. Rotate refresh token (invalidate old, issue new). |
| POST | `/logout` | Auth | Delete refresh token from DB. Clear cookie. |
| POST | `/forgot-password` | Public | Accept email. If user exists, generate a time-limited (1hr) reset token (store hashed version in DB or use JWT). Send reset link via Nodemailer. Do not reveal if email exists or not (always respond 200). |
| POST | `/reset-password/:token` | Public | Validate token. Accept new password. Hash and save. Invalidate all refresh tokens for this user. |
| GET | `/me` | Auth | Return current user profile from JWT. Populates basic info. |

> **Notes:**
> - On login failure, do NOT distinguish "user not found" vs "wrong password" — always "Invalid credentials".
> - Refresh token rotation is critical: store only hashed refresh token in DB.
> - Block brute force: add rate limiting on `/login` and `/forgot-password` (express-rate-limit).

---

### 6.2 User Routes — `/api/v1/users`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Admin | Get all users with pagination. Support `?role=`, `?search=` (name/email), `?isActive=`. |
| GET | `/:id` | Auth | Get user by ID. Members can only get their own profile or team members (non-sensitive fields). Admin gets full profile. |
| PUT | `/:id` | Auth | Update profile. Members can only update their own (name, avatar). Admin can update any user including role and isActive. |
| DELETE | `/:id` | Admin | Soft delete (set `isActive: false`). Never hard delete — preserve task history. |
| POST | `/invite` | Admin | Accept email + role. Check if email already registered. If not, create a pending/inactive user and send invite email with a one-time setup link. If already registered, just add to team. |
| PATCH | `/:id/activate` | Admin | Re-activate a deactivated user. |
| GET | `/:id/activity` | Admin/Manager | Get user's recent task activity, last seen, tasks completed. |

> **Notes:**
> - When an admin changes a user's role, invalidate any active sessions of that user (delete their refresh tokens).
> - `isActive: false` users cannot log in — check this in the login controller.

const app= async()=>{
  const variable= {dkvfirh}
  return(
    
  )
}
---

### 6.3 Project Routes — `/api/v1/projects`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Auth | Get projects. Admin gets all. Manager gets projects they created or manage. Member gets projects they are members of. Support `?status=`, `?priority=`, `?search=`. |
| POST | `/` | Admin, Manager | Create project. Validate name (required), dates (startDate < endDate), assign manager (Admin only — managers can only self-assign). Auto-add creator as a member. |
| GET | `/:id` | Auth + Member of project | Get single project. Includes populated manager, members list, task summary (counts by status). Return 403 if user is not a member. |
| PUT | `/:id` | Admin, Manager (own project) | Update project fields. Manager cannot change the manager field — only Admin can. |
| DELETE | `/:id` | Admin | Soft-archive the project (`status: 'archived'`) or hard delete if no tasks. If hard delete, cascade delete tasks and canvas. |
| POST | `/:id/members` | Admin, Manager (own project) | Add members to a project. Body: `{ userIds: [] }`. Validate users exist and are active. |
| DELETE | `/:id/members/:userId` | Admin, Manager | Remove a member from project. Unassign them from all tasks in that project first. |
| GET | `/:id/stats` | Auth + Member | Return task counts by status, overdue count, member contribution stats, progress %. |

> **Notes:**
> - When a project's `endDate` passes and status is still 'active', mark it 'on_hold' via a scheduled check or on next fetch (lazy update).
> - Progress can be computed: `(done tasks / total tasks) * 100`. Update it whenever a task status changes.

---

### 6.4 Task Routes — `/api/v1/tasks`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/project/:projectId` | Auth + Project Member | Get all tasks for a project. Support `?status=`, `?assignedTo=`, `?priority=`, `?dueDate=`, `?search=`. Returns tasks grouped by status (kanban format) if `?view=kanban`. |
| POST | `/project/:projectId` | Admin, Manager | Create task in a project. Validate all fields. Auto-set `createdBy`. Send notification to assigned users. |
| GET | `/:id` | Auth + Project Member | Get single task with comments populated. |
| PUT | `/:id` | Admin, Manager | Update any task field. |
| PATCH | `/:id/status` | Auth + Assigned Member | Members can ONLY update status of tasks assigned to them. Admins/Managers can update any task's status. |
| DELETE | `/:id` | Admin, Manager | Delete task. If it has subtasks, delete those too. |
| POST | `/:id/comments` | Auth + Project Member | Add a comment. Body: `{ text }`. Validate not empty, max 1000 chars. Emit websocket event to project room. |
| DELETE | `/:id/comments/:commentId` | Auth + Comment Author + Admin | Delete comment. |
| PATCH | `/:id/order` | Admin, Manager | Update task order (for drag-and-drop). Body: `{ order, status }`. Reorder other tasks in column as needed. |
| GET | `/my` | Auth | Get all tasks assigned to the current user across all projects. Support `?status=`, `?dueDate=`. |

> **Notes:**
> - When a task is assigned to someone, create a Notification and emit a WebSocket event.
> - When status changes to 'done', update parent project's progress.
> - Due date validation: warn if dueDate > project endDate (don't block, just return a warning in response).
> - Comments are embedded in the Task document for simplicity — no separate collection needed.

---

### 6.5 Team Routes — `/api/v1/team`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Auth | Get team info — all members with their roles, last seen, active task count. |
| PUT | `/` | Admin | Update team name, description. |
| GET | `/members` | Auth | List all active members with basic info. Used for assignment dropdowns. |
| GET | `/members/:id` | Auth | Get a specific member's profile + their assigned tasks summary. |
| PATCH | `/members/:id/role` | Admin | Change a member's role. Re-validate: cannot demote yourself if you're the last admin. |

---

### 6.6 Canvas Routes — `/api/v1/canvas`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/project/:projectId` | Auth + Project Member | Get canvas state for a project. If none exists, return empty canvas structure. |
| PUT | `/project/:projectId` | Admin, Manager | Full save of canvas state. Body: `{ data, version }`. Check version match — if stale (version mismatch), return 409. Increment version on success. |
| PATCH | `/project/:projectId/element` | Auth + Project Member | Partial update for real-time collaboration (add/update/delete a single element). Used for WebSocket relay. Members can only add sticky notes/text annotations. |

> **Notes:**
> - Canvas auto-save: frontend sends a PATCH every 3–5 seconds if dirty. Use a debounce on the backend save to prevent DB overload.
> - The `data` field stores the full serialized canvas JSON (Fabric.js `canvas.toJSON()` or equivalent).

---

### 6.7 Notification Routes — `/api/v1/notifications`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Auth | Get all notifications for current user. Support `?isRead=false` for unread only. Paginate. |
| PATCH | `/:id/read` | Auth | Mark a single notification as read. Validate ownership. |
| PATCH | `/read-all` | Auth | Mark all notifications as read for current user. |
| DELETE | `/:id` | Auth | Delete a notification (own only). |
| GET | `/unread-count` | Auth | Return `{ count: N }`. Used to show badge in nav. |

---

### 6.8 Email Routes — `/api/v1/email`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/send` | Admin | Send email to a single team member. Body: `{ recipientId, subject, message }`. Validate all fields. Fetch recipient's email from DB. Send via Nodemailer. Log notification in DB. |
| POST | `/send-bulk` | Admin | Send same email to multiple recipients. Body: `{ recipientIds: [], subject, message }`. Loop and send one-by-one (not BCC). Create notification for each. Limit: max 20 recipients per call. |
| GET | `/logs` | Admin | Get history of emails sent (from Notification model, type: 'email_sent'). |

> **Notes:**
> - Never expose SMTP credentials in response.
> - Handle Nodemailer errors gracefully — if one email in bulk fails, continue sending others and report failures in response.
> - Rate-limit this endpoint (max 10 emails/minute per admin).

---

## 7. WEBSOCKET EVENTS DESIGN

Use Socket.io with rooms per project. Auth middleware on connection handshake reads JWT from `auth.token`.

### Connection
- On connect: attach `socket.user` from JWT verification.
- On `join_project`: validate user is a member, then `socket.join(projectId)`.
- On `leave_project`: `socket.leave(projectId)`.
- On `disconnect`: emit `user_offline` to their rooms.

### Events — Client to Server (Emits)

| Event | Payload | Description |
|-------|---------|-------------|
| `join_project` | `{ projectId }` | Join a project's real-time room |
| `leave_project` | `{ projectId }` | Leave a project room |
| `canvas_update` | `{ projectId, element, action }` | Broadcast canvas change to room |
| `task_update` | `{ taskId, projectId, changes }` | Notify others of task change |
| `typing` | `{ projectId, taskId, user }` | Typing indicator in comments |
| `ping` | — | Heartbeat |

### Events — Server to Client (Broadcasts)

| Event | Payload | Description |
|-------|---------|-------------|
| `task_created` | task object | New task in project |
| `task_updated` | `{ taskId, changes }` | Task field changed |
| `task_deleted` | `{ taskId }` | Task removed |
| `canvas_updated` | `{ element, action, editedBy }` | Canvas element changed |
| `new_notification` | notification object | For the specific recipient only |
| `user_joined` | `{ user }` | User joined project room |
| `user_left` | `{ userId }` | User left room |
| `typing_indicator` | `{ user, taskId }` | Show typing in comment box |
| `member_added` | `{ user, projectId }` | New member added to project |
| `project_updated` | project object | Project details changed |

> **Key points:**
> - Emit events from controllers after DB operations succeed: `io.to(projectId).emit(...)`.
> - Pass `io` into controllers via `req.app.get('io')` (set in server.js: `app.set('io', io)`).
> - Canvas events use `socket.to(projectId).emit(...)` (broadcast to room, excluding sender) to avoid echo.
> - Notifications for a specific user: `io.to(userSocketId).emit('new_notification', ...)`. Maintain a `userId → socketId` map in memory (or use Socket.io rooms per user: `socket.join(userId)`).

---

## 8. FRONTEND — FOLDER STRUCTURE

```
client/
├── public/
│   └── favicon.svg
│
├── src/
│   ├── assets/
│   │   ├── images/
│   │   │   └── logo.svg
│   │   └── icons/          ← any custom SVG icons not in lucide
│   │
│   ├── components/
│   │   ├── ui/             ← reusable primitives
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Dropdown.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Avatar.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   ├── Toast.jsx        ← wrapper for react-hot-toast
│   │   │   ├── EmptyState.jsx
│   │   │   └── ConfirmDialog.jsx
│   │   │
│   │   ├── layout/         ← layout building blocks (NOT route wrappers)
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Topbar.jsx
│   │   │   ├── NotificationPanel.jsx
│   │   │   └── Breadcrumb.jsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatsCard.jsx
│   │   │   ├── TaskProgressChart.jsx
│   │   │   ├── RecentActivity.jsx
│   │   │   └── ProjectSummaryCard.jsx
│   │   │
│   │   ├── projects/
│   │   │   ├── ProjectCard.jsx
│   │   │   ├── ProjectForm.jsx
│   │   │   ├── ProjectMemberList.jsx
│   │   │   └── ProjectStatusBadge.jsx
│   │   │
│   │   ├── tasks/
│   │   │   ├── KanbanBoard.jsx
│   │   │   ├── KanbanColumn.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   ├── TaskDetail.jsx
│   │   │   ├── CommentBox.jsx
│   │   │   ├── CommentList.jsx
│   │   │   └── TaskFilters.jsx
│   │   │
│   │   ├── team/
│   │   │   ├── MemberCard.jsx
│   │   │   ├── MemberTable.jsx
│   │   │   ├── InviteMemberForm.jsx
│   │   │   └── RoleBadge.jsx
│   │   │
│   │   ├── canvas/
│   │   │   ├── CanvasBoard.jsx      ← main canvas component
│   │   │   ├── CanvasToolbar.jsx
│   │   │   ├── CanvasTextTool.jsx
│   │   │   ├── CanvasStickyNote.jsx
│   │   │   └── CanvasCollaborators.jsx
│   │   │
│   │   └── settings/
│   │       ├── ProfileForm.jsx
│   │       ├── EmailComposer.jsx
│   │       └── TeamSettingsForm.jsx
│   │
│   ├── layout/
│   │   ├── AppLayout.jsx       ← sidebar + topbar wrapper for auth'd users
│   │   ├── AuthLayout.jsx      ← centered card layout for login/register
│   │   └── RoleLayout.jsx      ← role-specific wrapper (adjusts nav items)
│   │
│   ├── routes/
│   │   ├── AppRoutes.jsx       ← main router with all route definitions
│   │   ├── ProtectedRoute.jsx  ← checks auth + redirects to /login
│   │   └── RoleRoute.jsx       ← checks role + redirects to /forbidden
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx      ← first-time setup only
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   └── ResetPasswordPage.jsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── DashboardPage.jsx
│   │   │
│   │   ├── projects/
│   │   │   ├── ProjectsPage.jsx      ← list all projects
│   │   │   ├── ProjectDetailPage.jsx ← single project overview
│   │   │   └── ProjectCreatePage.jsx
│   │   │
│   │   ├── tasks/
│   │   │   ├── TasksPage.jsx         ← my tasks view
│   │   │   └── TaskDetailPage.jsx
│   │   │
│   │   ├── team/
│   │   │   ├── TeamPage.jsx
│   │   │   └── MemberDetailPage.jsx
│   │   │
│   │   ├── canvas/
│   │   │   └── CanvasPage.jsx
│   │   │
│   │   ├── settings/
│   │   │   └── SettingsPage.jsx      ← tabbed: profile, team (admin), email (admin)
│   │   │
│   │   └── errors/
│   │       ├── NotFoundPage.jsx      ← 404
│   │       ├── ForbiddenPage.jsx     ← 403
│   │       └── ServerErrorPage.jsx   ← 500/network
│   │
│   ├── utils/
│   │   ├── axios.js            ← Axios instance with interceptors
│   │   ├── socket.js           ← Socket.io client singleton
│   │   ├── auth.js             ← token storage helpers (get/set/clear)
│   │   ├── formatters.js       ← date formatting, truncation, etc.
│   │   ├── validators.js       ← form validation helpers
│   │   └── constants.js        ← status colors, role labels, priority maps
│   │
│   ├── context/
│   │   ├── AuthContext.jsx     ← user state, login/logout functions
│   │   ├── SocketContext.jsx   ← socket instance + connection state
│   │   └── NotificationContext.jsx ← unread count, notifications list
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useSocket.js
│   │   ├── useNotifications.js
│   │   └── useDebounce.js
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── index.html
├── vite.config.js
└── tailwind.config.js
```

---

## 9. FRONTEND — ROUTING & LAYOUT STRUCTURE

### Route Map

```
/                        → Redirect to /dashboard (if auth'd) or /login
/login                   → LoginPage (AuthLayout)
/register                → RegisterPage (AuthLayout) — disabled if users exist
/forgot-password         → ForgotPasswordPage (AuthLayout)
/reset-password/:token   → ResetPasswordPage (AuthLayout)

(Protected — requires auth)
/dashboard               → DashboardPage (AppLayout)
/projects                → ProjectsPage (AppLayout)
/projects/new            → ProjectCreatePage (AppLayout) — Admin/Manager only
/projects/:id            → ProjectDetailPage (AppLayout) — tabs: Overview, Tasks, Canvas, Members
/projects/:id/tasks      → Kanban view within ProjectDetailPage (or separate)
/projects/:id/canvas     → CanvasPage (AppLayout, fullscreen-ish)
/tasks                   → TasksPage — "My Tasks" across all projects (AppLayout)
/tasks/:id               → TaskDetailPage (AppLayout)
/team                    → TeamPage (AppLayout)
/team/:id                → MemberDetailPage (AppLayout) — Admin/Manager only
/settings                → SettingsPage (AppLayout) — tabs based on role
/403                     → ForbiddenPage
/404                     → NotFoundPage
*                        → Redirect to /404
```

### ProtectedRoute Logic
- Reads token from AuthContext.
- If no token: redirect to `/login` with `state: { from: location }` (for post-login redirect).
- If token expired: attempt silent refresh via `/auth/refresh`. If that fails, clear auth and redirect.
- On successful auth: render `<Outlet />`.

### RoleRoute Logic
- Accepts `allowedRoles` prop: `<RoleRoute allowedRoles={['admin']} />`.
- Checks `user.role` from AuthContext.
- If role not allowed: redirect to `/403`.
- Do NOT hide routes purely on the frontend — backend must also enforce.

### AppLayout Behavior
- Sidebar items differ by role:
  - **Admin**: Dashboard, Projects, Tasks (My Tasks), Team, Settings
  - **Manager**: Dashboard, Projects, Tasks (My Tasks), Team (view only), Settings (profile only)
  - **Member**: Dashboard, My Tasks, Team (view only), Settings (profile only)
- Topbar: search (global), notification bell with unread count, user avatar + dropdown (profile, logout).
- Sidebar is collapsible on desktop, drawer on mobile.

---

## 10. FRONTEND — PAGES & COMPONENTS GUIDE

### 10.1 Auth Pages

**LoginPage**
- Form: email + password fields. Remember me checkbox (optional).
- Submit: call `/auth/login`. On success, store token, redirect to `/dashboard`.
- Error states: wrong credentials (inline error), network error (toast), inactive account (specific message).
- Link to Forgot Password.
- If no users exist in DB (first run), show "Setup your admin account" variant or redirect to `/register`.

**RegisterPage**
- Only accessible on first run (check via a public `/auth/setup-status` endpoint or hide via env).
- Redirect to `/login` if users already exist.
- Fields: name, email, password, confirm password.

**ForgotPasswordPage**
- One field: email. On submit, always show "If this email is registered, a reset link was sent."
- Disable button and show spinner while pending.

**ResetPasswordPage**
- Token from URL params.
- Fields: new password, confirm password.
- Validate token first on mount — if invalid/expired, show error state immediately (not after submission).

---

### 10.2 Dashboard Page

Render stats and summaries based on role.

**Admin/Manager view:**
- Stats cards: Total Projects, Active Tasks, Team Members, Overdue Tasks.
- Chart: Task status distribution (pie or donut via recharts).
- Chart: Project completion progress (bar chart — projects vs completion %).
- Recent activity feed (last 10 notifications).
- Quick action buttons: "New Project", "Invite Member".

**Member view:**
- Stats cards: My Tasks Today, Tasks Due This Week, Completed This Month.
- My Tasks list (top 5, sorted by due date).
- Projects I'm in (cards).
- No team-wide stats visible.

> Loading state: use Skeleton components for each card and chart.
> Empty state: if no projects/tasks, show an illustrated empty state with a CTA.

---

### 10.3 Projects Pages

**ProjectsPage**
- Filter bar: status, priority, search input.
- View toggle: card grid vs list.
- Each ProjectCard shows: name, status badge, priority badge, due date, member avatars, progress bar.
- "New Project" button (Admin/Manager only — hide for members).
- Empty state if no projects match filters.
- Pagination or infinite scroll.

**ProjectDetailPage**
- Header: project name, status, dates, manager name, edit button (Admin/Manager).
- Tabs: Overview | Tasks | Canvas | Members.
- **Overview tab**: description, stats (task counts by status), member list, progress bar.
- **Tasks tab**: renders KanbanBoard component.
- **Canvas tab**: renders CanvasPage inline or navigates to `/projects/:id/canvas`.
- **Members tab**: list of members with roles, add/remove buttons (Admin/Manager).

**ProjectCreatePage**
- Full form: name, description, status, priority, startDate, endDate, assign manager (Admin only), add initial members.
- Validate: name required, endDate > startDate.
- On success: redirect to `/projects/:newId`.

---

### 10.4 Task Views

**KanbanBoard**
- Columns: To Do | In Progress | In Review | Done | Blocked.
- Drag-and-drop cards between columns (use `@dnd-kit/core` or `react-beautiful-dnd`).
- Each TaskCard: title, priority badge, assignee avatars, due date, comment count.
- "+ Add Task" button at the bottom of each column (Admin/Manager only).
- Members only see a drag handle if the task is assigned to them; otherwise no drag.
- On drop: call `PATCH /tasks/:id/status` and emit WebSocket event.
- If someone else moves a card (WebSocket event received), update UI without full reload.

**TaskForm (Modal)**
- Fields: title, description, status, priority, due date, assignees (multi-select from team), labels.
- Create mode vs Edit mode.
- Due date picker: warn if > project end date (yellow border, warning message). Don't block.

**TaskDetailPage / Modal**
- Full task details + edit button (Admin/Manager).
- Comments section: list of comments with author avatar + timestamp + text + delete (own/admin).
- Comment input box at bottom. Show typing indicator if someone else is typing (WebSocket).
- Status update dropdown (always visible to assignees and above).

---

### 10.5 Team Page

**TeamPage**
- Table/grid of all team members.
- Columns: Name, Role, Email, Last Seen, Active Tasks, Status (active/inactive).
- Invite Member button (Admin only) → opens InviteMemberForm modal.
- Click member → MemberDetailPage.
- Role badge color-coded: Admin (red/gold), Manager (blue), Member (gray).

**MemberDetailPage**
- Profile card: avatar, name, email, role, joined date, last seen.
- Assigned tasks list (paginated).
- Projects they're part of.
- Admin actions: change role, deactivate/activate account.

**InviteMemberForm (Modal)**
- Fields: email, role select.
- On submit: call `/users/invite`. On success: show "Invitation sent" toast.
- If email already in system: show "User already registered. Added to team."

---

### 10.6 Settings Page

Tabbed layout. Tabs rendered based on role.

**Profile tab (All roles)**
- Edit name, avatar upload (or URL input).
- Change password: current password, new password, confirm.
- Save button per section.

**Team Settings tab (Admin only)**
- Edit team name, description.
- Danger zone: clear all archived projects (confirm modal).

**Email tab (Admin only)**
- Compose section: recipient dropdown (team members), subject, message textarea.
- Send button. Spinner on pending.
- Sent Emails log table below (date, recipient, subject, status).
- Validation: all fields required, message max 2000 chars.

**General Settings tab (All roles)**
- Notification preferences: toggle email notifications on/off.
- Theme toggle if implemented (light/dark).
- Language (optional, can be a stub).

---

## 11. CANVAS FEATURE DESIGN

The canvas is a per-project collaborative whiteboard.

### Tools Available
- **Select** — click/drag to select and move elements.
- **Text** — click to place a text box; double-click to edit.
- **Sticky Note** — colored sticky note with text input.
- **Rectangle / Circle** — basic shapes.
- **Freehand Draw** — pencil tool.
- **Line** — straight line connector.
- **Eraser** — delete selected element.
- **Clear All** (Admin/Manager only) — wipe canvas with confirmation.

### Role Restrictions on Canvas
- **Admin/Manager**: full access to all tools.
- **Member**: can only add Text and Sticky Notes. Cannot move other users' shapes. Cannot clear.

### Real-time Collaboration
- On any canvas change (move, add, delete element), emit `canvas_update` WebSocket event.
- Others receive it and apply the delta to their local canvas state.
- Show avatar icons of active collaborators in the top-right corner of the canvas.
- Cursor positions of other users: nice-to-have. Show their mouse position labeled with their name.

### Persistence
- Auto-save dirty state every 5 seconds (debounced). Send full `canvas.toJSON()` to `/canvas/project/:id`.
- On mount: load canvas from API and call `canvas.loadFromJSON()`.
- Version check: if server returns 409 (stale version), show a modal: "Canvas was updated by someone else. Reload to get latest?" Do not overwrite silently.

### Canvas Component Implementation Notes
- Use `fabric.js` (most complete for this use case).
- Initialize `fabric.Canvas` on the `<canvas>` HTML element in a `useEffect`.
- Destroy instance on unmount (`canvas.dispose()`).
- Toolbar is a fixed panel on the left side. Active tool highlighted.
- Canvas takes full remaining viewport height (use `calc(100vh - topbar height)`).

---

## 12. USER FLOW & EDGE CASES

### First Run Flow
1. User hits the app. No users in DB.
2. Backend returns a flag on a public endpoint: `GET /auth/setup-status` → `{ setupRequired: true }`.
3. Frontend redirects to `/register` to create the first admin account.
4. After registration, redirect to `/dashboard`.
5. Once any user exists, `/register` redirects to `/login`.

### Normal Login Flow
1. User lands on `/login`.
2. On success: token stored, role read from token.
3. React Router redirects to `/dashboard` (or the `from` location if they were redirected mid-session).
4. AppLayout renders sidebar based on role.

### Session Expiry Flow
1. Access token expires. Axios interceptor catches 401 response.
2. Interceptor calls `/auth/refresh` silently.
3. If refresh succeeds: retry original request with new token.
4. If refresh fails (expired/revoked): clear auth state, redirect to `/login` with toast "Session expired. Please log in again."
5. Multiple simultaneous 401s: queue them, refresh once, then replay all.

### Role Change Mid-Session
1. Admin changes user X's role.
2. User X's refresh tokens are invalidated server-side.
3. On next token refresh attempt by user X → 401 → forced logout.
4. User X re-logs and gets new token with updated role.

### Project Access Edge Cases
- User tries to navigate to `/projects/:id` they're not a member of → backend returns 403 → frontend shows ForbiddenPage.
- Project is archived → still accessible but in read-only mode (show "Archived" banner, all actions disabled).
- Manager is removed from a project mid-session → their next API call to that project returns 403 → redirect to `/projects` with toast.

### Task Edge Cases
- Assigned user is removed from team → their assignment remains for historical record, but mark them as "(Inactive)" in the assignee list.
- Task due date passes → show red badge "Overdue" on the card.
- All tasks completed → project progress reaches 100% → suggest admin to mark project as "Completed" (notification or banner).
- Drag-drop fails (API error) → revert the card to its original column immediately, show error toast.

### Canvas Edge Cases
- User loses connection mid-edit → WebSocket disconnects → auto-reconnect on restore. Queue local changes and flush on reconnect.
- Two users simultaneously save canvas → version mismatch → show conflict resolution prompt (reload vs keep mine).
- User navigates away with unsaved canvas → `beforeunload` warning or auto-save on `useEffect` cleanup.

### Email Edge Cases
- Recipient email is invalid or bounces → Nodemailer throws → catch and return `{ success: false, message: "Failed to deliver email" }`. Log the failure.
- Admin sends email to themselves → allow it.
- Bulk send partially fails → return `{ sent: [ids], failed: [ids with reasons] }`.

### Form Validation Edge Cases
- Empty task title → inline error, do not submit.
- Project end date before start date → inline error on the end date field.
- Password too weak → show strength indicator + error.
- Duplicate email on invite → show "This user is already in your team."
- XSS prevention → sanitize all user-input text on the backend before storing. Use a library like `xss` or `DOMPurify` on the frontend for rendered HTML content.

---

## 13. EMAIL SYSTEM (NODEMAILER)

### Config (`config/nodemailer.js`)
- Create a `transporter` using `nodemailer.createTransport()` with SMTP settings from env.
- Call `transporter.verify()` on startup to confirm the connection works. Log success or failure.

### Email Templates (HTML strings or files)
Create simple HTML email templates. Keep inline styles since email clients strip stylesheets.

Templates to create:
- **invite_email**: "You've been invited to [Team Name]. Click here to set up your account: [link]"
- **task_assigned**: "You've been assigned a new task: [task title] in [project name]."
- **password_reset**: "Click the link to reset your password. Link expires in 1 hour."
- **general_message**: Admin's custom subject + message body (plain text is fine for this one).

### Email Service (`services/email.service.js`)
- Export named functions: `sendInviteEmail(user, inviteLink)`, `sendTaskAssignedEmail(user, task)`, `sendPasswordResetEmail(user, resetLink)`, `sendCustomEmail(recipient, subject, body)`.
- Each wraps `transporter.sendMail({ from, to, subject, html })` in a try/catch.
- Throw a custom error on failure so the controller can handle it.

### Key Points
- The `from` address should be a friendly format: `"ProjectApp <noreply@yourdomain.com>"`.
- For development, use Mailtrap (fake SMTP inbox) instead of a real email. Document this.
- For Gmail SMTP: use App Passwords (2FA required), not the main account password.
- Never send emails synchronously in a way that blocks the API response for more than 3 seconds. If needed, use a simple queue (or just async with `await` and let it resolve before responding, which is fine for this scale).

---

## 14. FALLBACK SCREENS

### Loading States
- **Full page loading**: centered spinner (used when fetching initial page data in `useEffect`).
- **Skeleton loaders**: for cards, lists, tables — avoid layout shifts.
- **Button loading**: spinner inside button, button disabled (prevents double submissions).
- **Inline loading**: small spinner next to form fields with async validation.

### Error States (Components)
- **EmptyState.jsx**: illustration (or icon) + heading + subtext + optional CTA. Variants: no projects, no tasks, no team members, no notifications.
- **ErrorBoundary**: wrap routes in a React `ErrorBoundary` class component. Catches JS errors and renders `ServerErrorPage.jsx` instead of a blank screen.
- **Network error**: if Axios throws a network error (no response), show a toast "Connection lost. Check your internet."
- **404 Page**: clean design with "Page not found" + back to dashboard button.
- **403 Page**: "You don't have permission to view this page." + role-appropriate CTA.

### Form Feedback
- Success: green inline message or toast. Clear the form.
- Error: red inline message below the relevant field. Never only a toast for form errors — the user needs to see which field failed.
- Required fields: mark with asterisk, validate on blur (not just on submit).

### WebSocket Disconnection
- Show a subtle banner at the top: "You are offline. Some real-time features may be delayed."
- Auto-hide banner when connection restores.
- Do not block the UI — user can still use the app; they just won't get live updates.

---

## 15. SECURITY CHECKLIST

### Backend
- [ ] All passwords hashed with bcrypt (rounds ≥ 10).
- [ ] JWT secret is strong (≥ 32 chars), stored in env.
- [ ] Refresh tokens stored as hashes in DB.
- [ ] HTTP-only, secure, sameSite cookies for refresh token.
- [ ] Role checked in middleware, not inferred from request body.
- [ ] All ObjectId params validated (use `mongoose.Types.ObjectId.isValid()`).
- [ ] Project membership checked before any project/task operation.
- [ ] Input sanitized against NoSQL injection (`express-mongo-sanitize`).
- [ ] CORS configured with `CLIENT_URL` only (no wildcard in production).
- [ ] Helmet.js for security headers.
- [ ] Rate limiting on auth endpoints.
- [ ] Error messages do not leak stack traces in production (`NODE_ENV` check).

### Frontend
- [ ] Access token never logged or exposed in URLs.
- [ ] Role-based UI elements hidden AND routes protected (both must be enforced).
- [ ] Forms validated before submission (client + server both validate).
- [ ] No sensitive data stored in localStorage (only use for non-sensitive UI state).
- [ ] Axios interceptor handles 401 silently.
- [ ] Confirm dialogs before destructive actions (delete project, remove member, clear canvas).

---

## 16. BUILD ORDER RECOMMENDATION

Given 2 days, build in this order to always have a demoable app:

### Day 1 — Core Foundation

**Morning (Backend)**
1. Project setup, DB connection, models (User, Project, Task).
2. Auth routes (register, login, refresh, logout, /me).
3. User routes (CRUD, invite).
4. Project routes (CRUD, member management).
5. Task routes (CRUD, status update, comments).
6. Auth + Role middleware wired up.

**Afternoon (Frontend)**
1. Vite setup, Tailwind, folder structure, Axios instance with interceptors.
2. AuthContext, ProtectedRoute, RoleRoute.
3. LoginPage, AppLayout (sidebar + topbar).
4. DashboardPage (wired to real APIs, skeleton loading).
5. ProjectsPage + ProjectDetailPage (Overview + Tasks tabs).
6. KanbanBoard (static first, then API-wired, then drag-drop).

### Day 2 — Collaboration, Polish, Remaining Features

**Morning**
1. WebSocket setup (backend + frontend context).
2. Real-time task updates on Kanban.
3. Notification system (backend + frontend bell).
4. Team Page + MemberDetailPage.
5. Canvas feature (basic — load/save + tools + WebSocket broadcast).

**Afternoon**
1. Settings Page (profile, team, email tab).
2. Nodemailer integration + email endpoints.
3. Error pages (404, 403), fallback screens, empty states.
4. Mobile responsiveness pass (test at 375px, 768px, 1280px).
5. Final polish: transitions, status colors, typography consistency.
6. Test all role flows end-to-end.

---

## QUICK REFERENCE — STATUS & PRIORITY COLORS

```
Task Status:
  todo         → gray
  in_progress  → blue
  in_review    → yellow/amber
  done         → green
  blocked      → red

Priority:
  low          → slate/gray
  medium       → yellow
  high         → orange
  critical     → red

Project Status:
  planning     → purple
  active       → green
  on_hold      → yellow
  completed    → blue
  archived     → gray
```

These should be defined in `frontend/src/utils/constants.js` and `backend/utils/constants.js` respectively so they're the single source of truth.

---

*End of Guide — Total Estimated Codebase: ~8,000–12,000 lines across frontend + backend.*
*Focus on correctness and completeness over visual complexity. A working, well-structured app will always outscore a visually flashy but broken one.*
