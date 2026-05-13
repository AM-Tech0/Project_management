# Backend Audit Report

Date: 2026-05-13

Scope: full audit of `backend/` modules (config, models, controllers, routes, services, middleware, entry). Notification module intentionally skipped (obsolete).

Summary: the codebase is a solid scaffold but has several correctness, consistency, and security issues that will prevent some flows from running end-to-end without fixes. Below are file-by-file findings and a recommended readiness/completion rate per module.

**Audit legend**
- Ready: can be used as-is for runtime (minor environment wiring)
- Partial: runs after small fixes (1-3 changes)
- Blocked: significant issues will break runtime (requires code changes)

-------------------------

**1) Entry & app wiring** — `index.js`
- Location: `backend/index.js`
- Observations:
  - Socket.IO is initialized with `server = http.createServer(app)`, and `initSocket(server)` is called — but the app uses `app.listen(PORT)` instead of `server.listen(PORT)`. Because Socket.IO is attached to `server`, calling `app.listen` prevents sockets from receiving connections. This is a functional bug.
  - CORS origin is hard-coded to `http://localhost:3000` instead of using `process.env.CLIENT_URL` (inconsistent with `config/socket.js`).
  - `express.json()` is used, but `cookie-parser` is not enabled (controllers expect `req.cookies`).
- Risks: Socket features and cookie-based flows (refresh/logout) will fail.
- Recommended fixes: change to `server.listen(PORT)`, use `process.env.CLIENT_URL` for CORS, add and `app.use(cookieParser())`.
- Completion: 55% (Partial -> requires 2 small changes).

**2) Config**
- `config/db.js` — simple `connectDB()` that uses `process.env.MONGO_URI`. Good error logging but does not exit on failure (ok for dev). Completion: 95% (Ready with env).
- `config/socket.js` — Socket.IO init with JWT handshake and room events. Observations:
  - Uses `process.env.CLIENT_URL` for CORS (good).
  - Auth middleware verifies JWT and loads `User` model; sets `socket.user` and tracks `connectedUsers`.
  - Emits and listens are implemented and sensible.
  - Minor: error messages are generic; fine.
  - Completion: 85% (Partial — works if `server.listen` is used and env is set).
- `config/nodemailer.js` — transporter created using `process.env.SMTP_HOST`, `SMTP_PORT`, and `EMAIL_USER`/`EMAIL_PASS`. Calls `transporter.verify()` on startup. Observations:
  - Environment variable names are inconsistent with usage in `email.service` (see below).
  - Completion: 80% (Partial — env name mismatch to verify in runtime).

**3) Models**
All schemas are in Mongoose and look reasonable. Observations & issues:
- `User.model.js` — fields: `name, email, password(select:false), role` — OK. Completion: 95%.
- `Project.model.js` — field name is `name` (NOT `title`). Many controllers use `title` (mismatch). Completion: 70% (Partial — model fine, controllers must be aligned).
- `Task.model.js` — comprehensive; `comments.createdAt` uses `default: Date.now()` (invoked at schema build, not ideal — should be `Date.now`), minor bug but works; Completion: 90%.
- `Team.model.js` — good. Completion: 95%.
- `Canvas.model.js` — good. Completion: 95%.
- `Notification.model.js` — present but user asked to skip detailed checks; still valid. Completion: 90%.
- `RefreshToken.model.js` — defines `token`, `user`, and `expiresAt` as required. Observations: controllers create RefreshToken documents without supplying `expiresAt` (this will cause Mongo validation error). Completion: 30% (Blocked until controllers set expiresAt).

**4) Middleware**
- `auth.middleware.js` — `verifyToken` & `optionalAuth` implemented.
  - They parse header `Authorization: Bearer ...` and verify JWT with `process.env.JWT_SECRET`.
  - They set `req.user = { id: user._id, role: user.role }` (note: `id` is an ObjectId, not `_id`).
  - This file is used by routes as expected. Completion: 85% (Partial — controllers must use `req.user.id` consistently).
- `role.middleware.js` — `requireRole(...)` done appropriately. Completion: 95%.
- `validate.middleware.js` — file is empty. If routes expect validation middleware, it's missing. Completion: 0% (Blocked/Not implemented).

**5) Services**
- `services/auth.service.js` — file exists but is empty. Controllers currently don't use it, but service is missing (not critical if controllers handle auth directly). Completion: 0% (Missing).
- `services/email.service.js` — implemented `noticeTemplate` and `sendNoticeEmail`. Observations:
  - `sendNoticeEmail` calls `transporter.sendMail({ from: \`"Project Management" <${process.env.SMTP_USER}>\` ... })` — uses `process.env.SMTP_USER` while `config/nodemailer.js` uses `EMAIL_USER`. This env mismatch will cause emails to fail or from-address to be undefined. Completion: 75% (Partial — env variable mismatch).
- `services/socket.service.js` — small helpers to emit socket events; looks fine. Completion: 95%.
- `services/canvas.service.js` — empty. Completion: 0% (Missing, but controllers don't import it currently).

**6) Controllers**
I inspected controllers for correctness and compatibility with models/middleware.

- `auth.controller.js` — KEY FINDINGS:
  - `registerUser` and `loginUser` generate `refreshToken` and call `RefreshToken.create({ token: refreshToken, user: user._id })`. Because `RefreshToken` schema requires `expiresAt`, these inserts will fail (validation error). The code never sets `expiresAt` when creating refresh token documents.
  - Cookies: controllers set cookies via `res.cookie("refreshToken", refreshToken, { httpOnly:true, secure:false, sameSite:"lax" })`. However, `cookie-parser` is not used in `index.js`, and even with `cookie-parser`, `res.cookie` will set cookie fine but reading cookies requires `cookie-parser`. The `refreshAccessToken` and `logoutUser` expect `req.cookies.refreshToken` — not available without `cookie-parser` middleware. This breaks refresh/logout flows.
  - Refresh token rotation/cleanup is incomplete: tokens are stored without `expiresAt`, and tokens are not hashed as recommended (security concern).
  - `forgotPassword` uses `JWT_SECRET` for reset tokens rather than a dedicated secret or hashed token — acceptable but note security.
  - Completion: 25% (Blocked — must set `expiresAt` on RefreshToken create and add cookie-parser; consider hashing refresh tokens and/or TTL index).

- `user.controller.js` — many routes implemented. Observations:
  - Pagination/filtering uses `User.find()` then in-memory filters; this is acceptable for small data but inefficient for production; consider using query filters in DB.
  - `inviteUser` creates a user with plain `password: tempPassword` (not hashed) and `isActive:false`. This will store a plaintext password if not hashed by pre-save hooks (none exist). Security concern and likely unexpected. Completion: 60% (Partial — works but insecure/inefficient).
- `project.controller.js` — Issues:
  - Uses `body.title` and `project.title` while `Project.model` defines the field `name`. This mismatch will cause created documents to have `title` field (not the schema's `name`) and `name` will be empty. Similarly `updateProject` references `project.title`. This is a functional bug and must be aligned.
  - `createProject` requires `body.title` — frontends expecting `name` will fail and created projects will not have `name` populated.
  - Completion: 40% (Partial/Blocked — rename fields or update controller to use `name` consistently).
- `task.controller.js` — Issues:
  - Uses `req.user._id` in `createTask` (line sets `createdBy:req.user._id`). However `auth.middleware` sets `req.user.id` (not `_id`). This will cause `createdBy` to be `undefined`. Several places compare `req.user.id` vs other checks — inconsistent usage of `req.user.id` vs `req.user._id`.
  - `comments.createdAt` default uses `Date.now()` in schema (invoked immediately). Should use `Date.now` (without parentheses) to get per-document timestamp.
  - Overall logic is solid but requires small fixes for `req.user` usage. Completion: 60% (Partial).
- `canvas.controller.js` — Logic is implemented with version checks and emits `canvas_updated` via `io` from `req.app.get('io')`. Observations:
  - Works provided `req.user.id` is present (auth middleware) and `io` is set (requires `server.listen` fix in entry point).
  - Completion: 80% (Partial — dependent on entry and req.user consistency).
- `team.controller.js` — good, but functions assume a single Team document (`Team.findOne()`); acceptable per project design. Completion: 90%.
- `email.controller.js` — calls `sendNoticeEmail`. Observations:
  - Dependent on `services/email.service` env variable `SMTP_USER` vs transporter using `EMAIL_USER` — mismatch.
  - Completion: 70% (Partial).
- `notification.controller.js` — file empty; user asked to skip notification checks. Completion: 0% (Not implemented / obsolete).

**7) Routes**
- Routes are wired and import controllers correctly. However, because of controller-model mismatches and other issues above (refresh token model, missing cookie-parser, server listen), many endpoints will currently fail in practice.
- Example critical route failures:
  - `/api/v1/auth/refresh` relies on `req.cookies.refreshToken` and DB token with `expiresAt` — both missing -> will fail.
  - Socket-based events will not work until server uses `server.listen`.

**8) Other issues & observations**
- Env name inconsistencies: `EMAIL_USER` vs `SMTP_USER` vs `process.env.SMTP_USER` used in different places; unify env names.
- Some controllers use `title` while models use `name` — unify naming.
- Cookie handling: add `cookie-parser` middleware and consider `secure` flag in production.
- Refresh token DB model requires `expiresAt` but controllers don't set it. Also storing refresh token in DB in plaintext is a security risk — prefer hashing or use a TTL index with `expiresAt`.
- Several files are empty (placeholder services and validate middleware). Decide to implement or remove them.
- Error responses are inconsistent (`msg` vs `message`, some controllers return different shapes) — not critical but helpful to standardize.

-------------------------

**Per-module completion summary (high-level)**
- Entry (index.js): 55% — fix server.listen & add cookie-parser; unify CORS.
- Config/db.js: 95% — needs MONGO_URI in env.
- Config/socket.js: 85% — requires entry fix and CLIENT_URL env.
- Config/nodemailer.js: 80% — env names need unification.
- Models (aggregate): 80% — majority ready, but `RefreshToken` requires controllers to set `expiresAt`; `User`/`Project` naming mismatch with controllers.
- Middleware: 60% — `auth` and `role` mostly OK; `validate.middleware` missing.
- Services: 45% — `email` and `socket` OK (subject to env), `auth` and `canvas` empty.
- Controllers: 50% — many implemented, but critical issues (refresh token, field name mismatches, `req.user` inconsistencies) block full integration.
- Routes: 85% — wiring is present and consistent with controllers.

Recommended immediate changes (minimal to get basic flows working):
1. Change `app.listen(PORT)` to `server.listen(PORT)` in `index.js` so Socket.IO works.
2. Add `cookie-parser` to `index.js` and `package.json` (install) and call `app.use(cookieParser())` so `req.cookies` works.
3. Fix `RefreshToken.create(...)` calls in `auth.controller.js` to include `expiresAt` (e.g., calculate from `JWT_REFRESH_EXPIRES_IN` or set TTL) and consider hashing the token before saving.
4. Unify environment variable names (prefer `SMTP_USER` or `EMAIL_USER` — update `config/nodemailer.js` and `email.service.js` to use the same names).
5. Align field names: either rename `Project.model` to use `title` or update `project.controller.js` to use `name` consistently.
6. Normalize `req.user` usage: controllers should use `req.user.id` (or modify middleware to set `_id`) — pick one pattern and apply across controllers.
7. Implement `validate.middleware.js` or remove import references.
8. Hash temporary password generation in `inviteUser` or send an invite flow instead of creating a real user with plaintext password.

-------------------------

If you want, I can:
- create a follow-up patch with the minimal fixes (1-4) to make the app runnable locally (server.listen, cookie-parser, add expiresAt on refresh token creation, fix env names), and run a lightweight smoke test.
- or produce a prioritized tasks PR checklist for the team.

End of audit.
