

## Plan: Admin account, password change, and signup approval workflow

### 1. Admin account for wes@urbanselfstorage.com.au
Cannot create auth users directly via SQL (auth.users is managed by Supabase). Two options:

- **Option A (recommended):** You sign up at `/login` using `wes@urbanselfstorage.com.au` / `12345678`. Then I run a one-line migration to insert the `admin` role into `user_roles` for that user. Confirms email + password are real.
- **Option B:** I write an edge function using the service role key to create the user programmatically and assign the admin role. More complex, only worth it if you can't do the signup yourself.

Going with Option A. After you sign up I'll run:
```sql
INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'wes@urbanselfstorage.com.au';
```

### 2. Signup approval workflow
New users sign up but stay locked out until an admin approves them.

**DB changes (migration):**
- Add `approval_status` enum: `pending`, `approved`, `rejected`
- Add `approval_status` column to `profiles` (default `pending`), plus `approved_at`, `approved_by`
- Update `handle_new_user()` trigger so new profiles default to `pending`
- Add helper function `is_user_approved(_user_id uuid)` — security definer, returns boolean
- Add RLS so admins can update `approval_status` on profiles

**Frontend changes:**
- New `useApprovalStatus` hook — reads current user's profile approval status
- Update `ProtectedRoute.tsx`: if logged in but `approval_status != 'approved'` AND not admin → render a "Pending Approval" screen (full page alert, sign-out button) instead of the app
- Special case: the admin you create is auto-approved via the migration that grants the role
- Update `handle_new_user()` to auto-approve users who already have an admin role (defensive)

**Admin UI:**
- New page `/admin/users` (admin-only nav link in sidebar)
- Lists all profiles with: name, email, signup date, status badge, role
- Actions per row: Approve, Reject, Assign Role (admin/advisor/investor), Remove
- Pending users sorted to top

### 3. Password change for logged-in users
- New `/account` page accessible from TopBar user menu (or sidebar)
- Form: current password (re-auth), new password, confirm new password
- Uses `supabase.auth.updateUser({ password })`
- Show success toast, no forced sign-out

### Files to create / edit

**Migration:**
- New migration: approval_status enum + columns + updated trigger + helper function + admin role grant for wes

**New files:**
- `src/pages/Account.tsx` — change password form
- `src/pages/AdminUsers.tsx` — user management table
- `src/components/PendingApproval.tsx` — locked-out screen
- `src/hooks/useApprovalStatus.ts`
- `src/hooks/useAllUsers.ts` (admin-only fetch of profiles + roles)

**Edited files:**
- `src/components/ProtectedRoute.tsx` — gate on approval status
- `src/components/AppSidebar.tsx` — conditional admin nav links
- `src/components/TopBar.tsx` — add Account link / user menu
- `src/App.tsx` — register `/account` and `/admin/users` routes

### Updated `.lovable/plan.md`
Append a Phase 8 section covering: admin account provisioning, signup approval gate, password self-service, user management UI.

### What I need from you before building
Just confirm: after I push the migration, **you** will sign up at `/login` with `wes@urbanselfstorage.com.au` / `12345678` so the auth user exists. Then the role grant takes effect on next login. Sound good?

