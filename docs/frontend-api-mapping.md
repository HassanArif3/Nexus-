# Frontend API Mapping Requirements

This document catalogs the existing static frontend features in the Nexus project that will require backend API integration in future development phases.

## 1. Investor & Entrepreneur Dashboards (`/dashboard/investor`, `/dashboard/entrepreneur`)
* **Current State**: Hardcoded statistics, recent activities, and recommended profiles.
* **Required APIs**:
  - `GET /api/dashboard/stats`: Returns key metrics (total investments, active deals, etc.)
  - `GET /api/dashboard/activities`: Returns an activity feed for the user.
  - `GET /api/dashboard/recommendations`: Returns recommended users based on profile preferences.

## 2. User Discovery (`/investors`, `/entrepreneurs`)
* **Current State**: Static lists of users with hardcoded filtering options.
* **Required APIs**:
  - `GET /api/users/investors?search={q}&industry={id}`: Paginated list of investors with filtering.
  - `GET /api/users/entrepreneurs?search={q}&stage={id}`: Paginated list of startups with filtering.

## 3. Messaging System (`/messages`, `/chat`)
* **Current State**: Static UI displaying hardcoded chat conversations.
* **Required APIs**:
  - `GET /api/chat/conversations`: List all active conversations for the user.
  - `GET /api/chat/conversations/:id/messages`: Retrieve message history for a specific chat.
  - `POST /api/chat/conversations/:id/messages`: Send a new message (to be synced with Socket.IO).

## 4. Notifications (`/notifications`)
* **Current State**: Static UI with hardcoded notification alerts.
* **Required APIs**:
  - `GET /api/notifications`: Retrieve a list of the user's notifications.
  - `PATCH /api/notifications/:id/read`: Mark a specific notification as read.
  - `PATCH /api/notifications/read-all`: Mark all notifications as read.

## 5. Deals Management (`/deals`)
* **Current State**: Static kanban-style board or table showing deal flow stages.
* **Required APIs**:
  - `GET /api/deals`: List deals the user is involved in.
  - `POST /api/deals`: Create a new deal pipeline entry.
  - `PATCH /api/deals/:id/stage`: Move a deal between stages (e.g., Screening -> Due Diligence).

## 6. Settings Page (`/settings`)
* **Current State**: UI for changing password, email notifications, and privacy settings.
* **Required APIs**:
  - `PATCH /api/settings/notifications`: Update email/push notification preferences.
  - `PATCH /api/settings/security`: Change password or enable 2FA.
  - `PATCH /api/settings/privacy`: Toggle profile visibility.

## 7. Help & Support (`/help`)
* **Current State**: FAQ accordions and a support contact form.
* **Required APIs**:
  - `GET /api/support/faqs`: (Optional) Fetch dynamic FAQs from the database.
  - `POST /api/support/tickets`: Submit a new support request to the admin dashboard.
