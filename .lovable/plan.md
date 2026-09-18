
# Urban Self Storage — Investor Portal

## Overview
A secure, role-based investor portal for Urban Self Storage. Lovable Cloud backend (Supabase) for auth, database, and file storage. Mapbox for facility maps. Admin UI for content management.

---

## Phase 1: Foundation & Design System
- Configure Tailwind/CSS variables with USS brand tokens (Navy #29334D, Green #62A348, Warm Gray #D2D1CB, Charcoal #323232, Off White #F5F5F3)
- Set up Georgia Bold (via Google Fonts) for headings/stats, Inter for body
- Build reusable components: StatCard (white bg, 4px green top border), branded Button variants, TopBar (breadcrumbs, timestamp, notification bell)
- Build the persistent 250px navy Sidebar with collapsible mobile hamburger, nav links for all 6 sections, USS logo at top
- Create the authenticated layout shell (sidebar + topbar + main content area)

## Phase 2: Authentication & Roles
- Enable Lovable Cloud auth with email + password
- Create `user_roles` table with `app_role` enum (admin, moderator/advisor, user/investor)
- Create `profiles` table for user display info
- Build Login page with USS branding
- Implement role-based route protection (Admin = full edit, Investor = read-only, Advisor = limited)
- Add 30-minute session timeout with auto-logout

## Phase 3: Dashboard (Home)
- Welcome summary section with CMS-editable text (stored in DB, editable by admins)
- Embedded PDF e-brochure viewer (iframe/PDF component, file in Supabase Storage)
- 4×2 KPI stat card grid: Total Company Value, Facilities, Total Units, Avg Occupancy, Dividend Yield, Annual Revenue, NOI, YoY Revenue Growth — values stored in DB, editable by admins
- Quick action buttons: View Latest Report, Download Brochure, Contact Us

## Phase 4: Asset Portfolio
- Mapbox interactive map of Australia with clickable facility pins (Bunbury, WA region)
- Facility list sidebar with thumbnail, name, address, units, occupancy
- Facility Detail subpage: photo gallery carousel, KPI stats (units, NLA, occupancy, revenue, value, rev/unit), tabbed content (Overview, Financials, Occupancy History, Documents)
- All facility data stored in DB, admin-editable

## Phase 5: Corporate Governance
- Three-column layout: (1) Embedded PDF viewer for Security Holders Agreement + download, (2) Board & Leadership roster with photo placeholders and titles, (3) Values & Mission with 5 company values and mission statement
- Board members and values stored in DB, admin-editable

## Phase 6: Financials & Reporting (Data Room)
- Tabbed document library: All / Quarterly / Annual / Financial Statements / Tax Documents
- Table with columns: Document Name, Type, Date, Size, Actions (View inline + Download)
- Search bar, sort by date, filter by year
- "NEW" badge on documents uploaded within last 30 days
- Inline PDF viewer modal
- Documents stored in Supabase Storage, metadata in DB
- Admin upload interface

## Phase 7: Growth & Strategy
- Horizontal acquisition timeline (2020 → 2028) with milestone markers
- Active pipeline table: opportunity name, location, deal stage (color-coded badges), estimated value
- Target market heat map placeholder (static WA region image for now)
- Acquisition criteria checklist
- Bold 5-year targets banner at bottom
- All content admin-editable

## Phase 8: Admin Content Management
- Admin-only UI for editing: dashboard welcome text, KPI values, facility data, board members, documents upload, pipeline opportunities, timeline milestones
- Role-gated edit buttons/forms that only appear for Admin users

## Recommended Build Order
Phases 1→2→3→4→5→6→7→8 (foundation first, then auth, then pages in order of stakeholder priority, admin UI last since it layers on top of all content)

## Technical Decisions Confirmed
- **Backend**: Lovable Cloud (managed Supabase)
- **Maps**: Mapbox (will need API key stored as secret)
- **Auth**: Email + password, no 2FA for now
- **Content**: Database-driven with admin UI for editing
- **PDF viewing**: react-pdf or iframe-based inline viewer
- **File storage**: Supabase Storage for documents, brochures, photos
