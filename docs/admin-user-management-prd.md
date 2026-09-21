# IEJF Admin User Management & Single-Session Access

Pasted by the client 2026-09-21. Implemented the same day (Phase 1 + Phase 2's
Active Sessions/Terminate, per section 15) — see
`docs/admin-build-status.md` and project memory for status/gotchas.

**Requires `supabase/migrations/0011_admin_user_management.sql` run manually in the
Supabase SQL Editor** before Add/session-enforcement actually persists — same
constraint as every other migration in this project (no exec-SQL RPC available to
the service-role key). Deliberately built to fail *open* (not lock everyone out) if
this migration hasn't run yet when the code deploys — see `src/lib/auth/admin.ts`
and `src/lib/auth/sessionStore.ts` for the `42703` (undefined_column) fallback.

---

<!-- Original PRD text below, verbatim. -->

# IEJF Admin User Management & Single-Session Access
## Product Requirements Document (PRD)

**Project:** IEJF Website Admin
**Feature Area:** Settings → User Management
**Document Type:** Product Requirements Document
**Status:** Proposed for implementation
**Priority:** High for multi-user admin access

---

## 1. Overview

The IEJF admin area may be used by more than one authorised person. To avoid shared credentials, conflicting changes, accidental publishing, and unclear accountability, the system should provide a dedicated **User Management** feature and enforce a **One Account, One Active Session** rule.

User Management must be placed as a branch under **Settings**, not as a primary navigation item.

The intended rule is:

> **One person = one Admin account = one active session.**

All authorised users will use the same **Admin** account type. There will be no Editor, Publisher, Reviewer, Super Admin, or other role levels in this version.

Each authorised person should have their own Admin account. If the same account is used to sign in from another browser or device, the newly authenticated session becomes the only active session and the previous session is signed out.

---

## 2. Problem Statement

Without individual Admin accounts and session controls, multiple people may share one login. This can cause:

- Two people using the same account at the same time.
- Accidental or untraceable publishing changes.
- Difficulty identifying who made a change.
- Conflicting edits or overwritten changes.
- Unnecessary sharing of admin credentials.
- Difficulty removing access from one person without affecting everyone else.

IEJF needs a simple admin access model where every authorised person has their own Admin account and only one active session can exist for each account at a time.

---

## 3. Goals

The feature must:

1. Give every authorised IEJF administrator an individual Admin account.
2. Allow Admin users to add, update, disable, and manage other authorised Admin accounts.
3. Enforce only one active session for each account at any time.
4. Prevent the same account from being used simultaneously on multiple devices or browsers.
5. Keep User Management organised inside **Settings**.
6. Improve accountability for important actions, especially publishing.
7. Reduce the risk of conflicting changes between administrators.
8. Keep the access model simple by using only one user type: **Admin**.

---

## 4. Non-Goals

The first version does not need to include:

- Public user registration.
- Multiple admin roles or permission tiers.
- Editor, Publisher, Reviewer, or Super Admin accounts.
- Social login unless later requested.
- Permanent device locking.
- Multiple simultaneous sessions for one account.
- Complex organisation or department structures.
- Advanced enterprise identity features unless separately approved.

---

## 5. Admin Navigation Structure

User Management should appear under Settings.

```text
Admin
├── Dashboard
├── Pages / Content
├── Insights
├── Media
├── Preview
└── Settings
    ├── General
    ├── Publishing
    └── User Management
        ├── Users
        └── Active Sessions
```

All authenticated IEJF Admin users use the same account type and access model.

---

## 6. Admin Account Model

The system must use a single account type:

### Admin

An Admin can access the IEJF administration area and perform the administrative functions available in the system, including:

- Manage website content.
- Preview changes.
- Publish changes.
- Access Settings.
- View User Management.
- Add authorised Admin users.
- Update Admin user details.
- Disable or reactivate Admin accounts.
- View active session status.
- End an active session when necessary.

There are no separate role levels in this version. Every authorised user added through User Management is an **Admin**.

---

## 7. One Account, One Active Session Policy

### 7.1 Core Rule

Each Admin account may have only **one valid active session at a time**.

### 7.2 Login Behaviour

When an Admin successfully signs in:

1. The system checks whether that account already has an active session.
2. If no active session exists, the new session starts normally.
3. If another active session already exists, the newly authenticated session becomes the valid session.
4. The previous session is immediately invalidated.
5. When the previous device refreshes or performs another protected action, it is returned to the login screen.

Suggested message:

> **Your account was signed in on another device. For security, this session has been ended.**

### 7.3 Reason for the Rule

This prevents two people from using the same Admin account at the same time and reduces the risk of conflicting edits or unexpected publishing changes.

### 7.4 No Permanent Device Lock

The system should **not permanently bind an Admin account to one physical device**. An Admin may move to another device when necessary, but only one session can remain active.

---

## 8. User Management Requirements

### FR-01 — View Admin Users

Admin users must be able to open **Settings → User Management → Users** and see:

- Name
- Email / login identifier
- Account type: Admin
- Account status
- Last sign-in
- Current session status
- Date added

### FR-02 — Add Admin User

An existing Admin must be able to add a new authorised Admin user.

Required information:

- Full name
- Email
- Account status

The new account type is automatically set to **Admin**. No role selection is required.

The system should use a secure account activation or password setup process rather than exposing passwords in plain text.

### FR-03 — Edit Admin User

An Admin must be able to update:

- Name
- Email where allowed
- Account status

No role or permission selector is required.

### FR-04 — Disable Admin User

An Admin must be able to disable another Admin account without deleting its historical activity.

When an account is disabled:

- The user can no longer sign in.
- Any active session is immediately invalidated.
- Existing activity history remains available.

### FR-05 — Reactivate Admin User

A previously disabled Admin account may be reactivated by an authorised Admin.

### FR-06 — Active Session View

Inside **Settings → User Management → Active Sessions**, Admin users should be able to see relevant session information such as:

- User
- Browser / device description
- Sign-in time
- Last activity time
- Session status

The system should avoid displaying unnecessary sensitive device information.

### FR-07 — Terminate Session

An Admin must be able to end another Admin user's active session when required.

Possible reasons include:

- A device was lost.
- A user forgot to sign out.
- Suspicious access is detected.
- Access must be removed immediately.

---

## 9. Publishing Protection

Publishing is a sensitive action even though all authorised users are Admins.

The system should ensure that:

1. Only authenticated and active Admin accounts can publish.
2. The currently authenticated Admin is recorded for each publishing action.
3. A disabled or expired session cannot publish.
4. If an Admin's session has been replaced by a newer login, the old session cannot save or publish changes.
5. Previewing content does not automatically publish it.
6. Publishing requires an intentional **Publish** action.
7. The system records which individual Admin account performed the publish action.

Recommended confirmation:

```text
Publish these changes?

The selected updates will become visible on the live website.

[Cancel] [Publish]
```

---

## 10. Activity & Accountability

The system should maintain an activity record for important Admin actions.

Recommended events include:

- Admin signed in.
- Admin signed out.
- Session replaced by a new login.
- Admin account created.
- Admin account updated.
- Admin account disabled or reactivated.
- Draft saved.
- Content updated.
- Content published.
- Published content updated again.

For each recorded action, store at minimum:

- Admin user
- Action
- Date and time
- Related page/content where applicable

This allows IEJF to identify who performed important changes without using shared accounts.

---

## 11. Security Requirements

### SR-01
Passwords must never be stored or displayed in plain text.

### SR-02
All protected admin actions must verify that the session is still valid.

### SR-03
When a new session replaces an old session, the previous session must no longer be authorised to edit, save, or publish.

### SR-04
Disabling an Admin account must immediately end its active session.

### SR-05
The system should automatically expire inactive or long-running sessions based on the agreed security policy.

### SR-06
Admins should be able to sign out normally, which immediately invalidates their current session.

### SR-07
Every authorised person should use their own Admin account. Shared Admin credentials should not be part of the intended workflow.

---

## 12. User Experience Requirements

User Management should remain simple and understandable for non-technical administrators.

### User List Example

```text
Settings > User Management

Users
---------------------------------------------------------
Name            Account Type    Status      Session
Yudi            Admin           Active      Active
Admin User 2    Admin           Active      Offline
Admin User 3    Admin           Disabled    —
---------------------------------------------------------

[ + Add Admin User ]
```

### Add User Flow

```text
Settings
   ↓
User Management
   ↓
Add Admin User
   ↓
Enter Name + Email
   ↓
Create Account
   ↓
User receives secure account setup instructions
```

### Session Replacement Flow

```text
Admin account logs in on Device A
          ↓
Device A session is active
          ↓
Same account logs in on Device B
          ↓
Device B becomes the active session
          ↓
Device A session is invalidated
          ↓
Device A is returned to login on next request/refresh
```

---

## 13. Key User Stories

### US-01 — Individual Admin Accounts

**As an IEJF administrator,** I want each authorised person to have their own Admin account so that login credentials do not need to be shared.

### US-02 — Single Active Session

**As an IEJF administrator,** I want each account to have only one active session so that the same account cannot be used simultaneously by multiple people.

### US-03 — Add More Admin Users

**As an IEJF administrator,** I want to add other authorised Admin users through User Management so that each person can have their own account.

### US-04 — Remove Access

**As an IEJF administrator,** I want to disable an Admin account so that access can be removed without affecting other users.

### US-05 — Publishing Accountability

**As an IEJF administrator,** I want publishing actions recorded against the individual Admin account that performed them so that changes can be traced.

### US-06 — Session Protection

**As an IEJF administrator,** I want an old session to stop working when the same account signs in somewhere else so that two people cannot use one account simultaneously.

---

## 14. Acceptance Criteria

The feature is considered complete when all of the following are true:

### User Management

- [ ] User Management exists under **Settings**.
- [ ] All authorised users use the **Admin** account type.
- [ ] There are no Editor, Publisher, Reviewer, or Super Admin roles.
- [ ] An Admin can add a new Admin user.
- [ ] An Admin can update an Admin user's details.
- [ ] An Admin can disable and reactivate an Admin account.
- [ ] Disabling an account ends its active session.
- [ ] User accounts are individual and do not require shared credentials.

### Single Session

- [ ] Each Admin account supports only one active session.
- [ ] Signing in again invalidates the previous session for the same account.
- [ ] The previous session cannot edit, save, or publish after invalidation.
- [ ] The previous session receives a clear signed-out message.
- [ ] A normal logout invalidates the current session.

### Publishing

- [ ] Only a valid authenticated Admin session can publish.
- [ ] Publishing records the Admin user responsible for the action.
- [ ] An invalidated or disabled session cannot publish.
- [ ] Previewing changes does not automatically make them live.
- [ ] Publishing requires an intentional Publish action.

### Usability

- [ ] User Management is understandable for non-technical users.
- [ ] Account status is clearly visible.
- [ ] Active/offline session state is understandable.
- [ ] Important actions such as disabling a user or terminating a session require confirmation.

---

## 15. Suggested Implementation Priority

### Phase 1 — Required

- Individual Admin accounts
- User Management under Settings
- Add/edit/disable Admin users
- One account, one active session
- Session invalidation on new login
- Publishing protection
- Basic activity tracking for publishing and user changes

### Phase 2 — Recommended Enhancements

- Active Sessions page
- Manual session termination
- Expanded activity history and filtering
- Security notifications for important account events

---

## 16. Success Criteria

The feature is successful when:

- IEJF administrators no longer need to share one account.
- Every authorised person has their own Admin account.
- One Admin account cannot be actively used on two devices at the same time.
- Additional Admin users can be added through User Management.
- Removing one Admin user's access does not affect other users.
- IEJF can identify which Admin account made important changes or published content.
- User Management remains inside Settings and does not clutter the main admin navigation.
- The account model stays simple with only one user type: **Admin**.

---

## 17. Final Product Rule

The IEJF admin access model should follow this rule:

> **Every authorised person receives an individual Admin account. Every account may have only one active session at a time. User Management is located under Settings so additional Admin users can be granted or removed access without sharing accounts.**
