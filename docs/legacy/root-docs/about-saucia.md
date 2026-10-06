# 🥗 Salad Saucia — Web Application

**A full-featured food ordering and premium subscription management platform built with React and Supabase.**

> Live Demo: [https://saucia-web-app.vercel.app/](https://saucia-web-app.vercel.app/)

----------

## Table of Contents

1.  [Project Overview](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#project-overview)
2.  [Tech Stack](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#tech-stack)
3.  [Architecture Overview](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#architecture-overview)
4.  [Feature Flows](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#feature-flows)
    -   [Menu & DIY Ordering](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#1-menu--diy-ordering)
    -   [Authentication](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#2-authentication)
    -   [Subscription Flow](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#3-premium-subscription-flow)
    -   [Subscription Dashboard](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#4-subscription-dashboard--order-tracking)
    -   [Real-time Support Chat](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#5-real-time-support-chat)
    -   [Promo Codes & Loyalty Points](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#6-promo-codes--loyalty-points)
    -   [Notifications](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#7-notification-system)
    -   [Admin Dashboard](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#8-admin-dashboard)
5.  [Database Schema](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#database-schema)
    -   [Core Tables](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#core-tables)
    -   [Junction & Relationship Tables](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#junction--relationship-tables)
    -   [Key Triggers & Business Logic](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#key-triggers--business-logic)
6.  [Security & RLS Notes](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#security--rls-notes)
7.  [Planned Improvements & Roadmap](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#planned-improvements--roadmap)
8.  [Getting Started](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#getting-started)
9.  [Environment Variables](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#environment-variables)
10.  [Project Status](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#project-status)

----------

## Project Overview

Salad Saucia is a commercial food delivery platform offering:

-   À la carte DIY salad/meal ordering with real-time price calculation
-   A premium subscription engine with nutritional profiling and personalized meal planning
-   Full admin control panel for operations, content, and logistics
-   Real-time support chat between customers and staff
-   Bilingual interface (English & Arabic)

The project evolved from a WordPress concept into a production-grade React/Supabase application. It overcame significant challenges including a mid-development database migration (Firebase → Supabase/PostgreSQL), a zero pre-designed UI, and continuously changing feature requirements.

----------


## Tech Stack

| Layer                   | Technology                                      |
|--------------------------|------------------------------------------------|
| Frontend Framework       | React                                          |
| UI Library               | Chakra UI (custom-themed)                      |
| Animations               | Framer Motion                                  |
| State Management         | Redux Toolkit + Context API                    |
| Backend / Database       | Supabase (PostgreSQL)                          |
| Authentication           | Supabase Auth — Google OAuth, JWT              |
| Real-time                | Supabase Realtime (Postgres Changes)           |
| Maps                     | OpenLayers (interactive address picker)        |
| SMS Auth (pending)       | Twilio                                         |
| ERP Integration (planned)| Foodics                                        |
| Hosting                  | Vercel                                         |

----------

## Feature Flows

### 1. Menu & DIY Ordering

Customers browse the menu organized into three categories: **Salads, Juices, and Fruits**. The platform supports a **DIY Salad Builder** where customers compose their own meal by:

1.  Selecting a **base meal** from the catalog (`meals` table)
2.  Adding **premium or free add-ons** from the items catalog (`items` table, `meal_items` junction)
3.  The price updates **in real-time** as items are added — free items up to `max_free_per_meal`, then priced per additional item
4.  Adding **special notes / customization text** to the order (`customization_notes` on `order_meals`)
5.  **Proceeding to checkout** — if unauthenticated, Google OAuth is triggered inline before the order is placed
6.  After order placement, the customer can **track the order phase in real-time** via Supabase Realtime subscriptions listening on `orders.status` changes (`pending → active → confirmed → out_for_delivery → delivered`)

**Order financial integrity** is enforced at the DB level:

```
total_amount = (subtotal + tax_amount + delivery_fee) - discount_amount

```

Auto-incremented `order_number` is generated by `trigger_set_order_number`.

----------

### 2. Authentication

Authentication is handled entirely through **Supabase Auth**:

-   **Google OAuth** — fully implemented; triggers user profile creation in `user_profiles` on first sign-in
-   **Phone / OTP via Twilio** — implemented, ready for migration/activation
-   **JWT session management** — sessions are issued and refreshed via Supabase client
-   `user_profiles.is_admin` boolean controls role-based access throughout the app and in Supabase queries

> ⚠️ **Security Note:** RLS policies are currently **relaxed** for development/testing convenience. Full per-user RLS enforcement is scheduled before production hardening (see [Security & RLS Notes](https://claude.ai/chat/c5d5d7cb-35ec-4ff5-a4f4-e21c5d17c355#security--rls-notes)).

----------

### 3. Premium Subscription Flow

The subscription enrollment is a multi-step wizard:

**Step 1 — Plan Selection** The user picks a subscription plan (`plans` table). Each plan defines:

-   `price_per_meal`, `short_term_meals`, `medium_term_meals`, `duration_days`
-   Nutritional targets: `kcal`, `protein`, `carb`
-   Optional allowed additives (`additives integer[]`)

**Step 2 — Health & Nutrition Profile Collection** The user fills in their health data, stored in `user_health_profiles`:

-   Physical metrics: height, weight, age, gender, activity level
-   Dietary preferences (Keto / Vegan / Gluten-Free / etc.) stored in `user_dietary_preferences`
-   Allergy declarations stored in `user_allergies` with optional `severity_override` per allergy

**Step 3 — Nutrition Calculator** A built-in BMI / TDEE calculator uses the health profile data to generate personalized daily calorie and macronutrient targets. The recommended subscription plan is suggested based on the result.

**Step 4 — Meal Design (Pick 5 Meals)** The user hand-picks up to 5 meals from the available plan catalog (`plan_meals`) to rotate through during the subscription period. These are stored as a **JSONB array** in `user_subscriptions.meals`, allowing flexible per-subscription meal configurations.

**Step 5 — Scheduling & Payment** The user sets their `preferred_delivery_time` and payment method. The subscription record is created in `user_subscriptions` with status `pending` until confirmed.

**Subscription State Machine:**

```
pending → active → paused / cancelled / completed

```

Meal consumption is tracked via `consumed_meals` (incremented on each delivery by `trigger_order_delivery`) against `total_meals`. `end_date > start_date` and `consumed_meals <= total_meals` are enforced at the DB level.

----------

### 4. Subscription Dashboard & Order Tracking

Once subscribed, the user accesses their **Subscription Dashboard**:

-   View active plan details, remaining meals, and consumed meals progress
-   **Order from pre-designed meals** — one-click ordering from the subscription's meal pool
-   **Real-time order phase tracking** — Supabase Realtime listens to `orders.status` changes and reflects them live in the UI (phases: pending → active → confirmed → out for delivery → delivered)
-   Delivery scheduling is automated: `trigger_order_delivery_dates` calculates the nearest occurrence of `preferred_delivery_time` when an order goes active

----------

### 5. Real-time Support Chat

A WebSocket-based support chat system built with **Supabase Realtime** (Postgres Changes).

**Architecture:**

-   Each end user has exactly **one room**, identified by their `user_id`
-   Multiple admins can connect to the same user's room simultaneously
-   Messages are stored in the `user_messages` table

**Message Schema:**

```sql
user_messages (
  id         uuid PRIMARY KEY,
  user_id    uuid NOT NULL,   -- Always the END USER's ID (room identifier)
  admin_id   uuid,            -- The admin who sent (NULL for user messages)
  content    text NOT NULL,
  sender_type message_sender_type,  -- 'user' | 'admin'
  is_read    boolean,
  read_at    timestamptz
)

```

**Security / Isolation:**

-   Realtime channels are namespaced as `support_chat:{userId}`
-   Postgres filter `user_id=eq.{roomId}` prevents cross-room message leakage
-   Each incoming Realtime event is **double-verified** client-side: if `payload.new.user_id !== roomId`, the message is rejected
-   Unread counts are scoped by `sender_type`: users count unread admin messages, admins count unread user messages

----------

### 6. Promo Codes & Loyalty Points

-   **Promo codes** — UI entry point exists; the `orders.coupon_code` field stores the applied code, and `discount_amount` reflects the reduction. Backend validation and code management is surfaced in the admin dashboard.
-   **Loyalty Points** — Users accumulate points (`user_profiles.loyalty_points`). Orders track `loyalty_points_used` and `loyalty_points_earned`. Redemption UI is displayed; full redemption engine is staged for Phase 2.

----------

### 7. Notification System

Notification preferences are stored in `user_notification_preferences` per user. A notification UI layer is present and under active development. Delivery-phase status changes and support chat messages are the primary notification triggers.

> 🚧 **Status: Under Development**

----------

### 8. Admin Dashboard

A comprehensive operations panel accessible to users with `user_profiles.is_admin = true`.

**Content Management (Full CRUD):**

-   Meals — create/edit/delete with multilingual content, nutritional data, dietary flags, pricing, images, discount schedules
-   Items / Add-ons — manage components that compose meals, pricing, availability, `max_free_per_meal`
-   Subscription Plans — configure plan tiers, meal counts, nutritional targets, pricing
-   Allergies & Dietary Preferences — reference data management

**Order Management:**

-   View and update statuses for all instant orders and subscription-linked orders
-   Filter by status, payment state, delivery date, customer

**Subscription Management:**

-   View all active/pending/cancelled subscriptions
-   Manually override meal counts, delivery dates, or plan status

**Support Chat:**

-   Admin portal connects to any user's support room
-   Admins can handle multiple conversations; `admin_id` identifies the responding agent per message

**Address Management:**

-   Interactive **OpenLayers map** for adding/editing delivery addresses with geographic point capture (`geography(Point, 4326)` stored on `user_addresses`)

**Menu PDF Export:**

-   Generates a dynamically composed, consistently designed PDF of the current menu — nutritional data and availability pulled live from the database, no manual redesign required

**Data Operations:**

-   Bulk import/export functionality for catalog and operational data

----------

## Database Schema

### Core Tables

Table

Purpose

Key Fields

`meals`

Central meal catalog

`name`, `base_price`, `calories`, `protein_g`, `carbs_g`, `fat_g`, `is_vegetarian`, `is_vegan`, `is_gluten_free`, `is_dairy_free`, `spice_level`, `rating`, `discount_percentage`, `is_available`, `is_featured`, `is_selective`

`items`

Individual food components / add-ons

`name`, `price`, `calories`, `max_free_per_meal`, `is_additive`, `is_available`

`plans`

Subscription plan tiers

`price_per_meal`, `short_term_meals`, `medium_term_meals`, `duration_days`, `kcal`, `protein`, `carb`, `additives[]`

`orders`

Customer orders

`user_id`, `subscription_id`, `order_number`, `status` (enum), `payment_status`, `subtotal`, `tax_amount`, `delivery_fee`, `discount_amount`, `total_amount`, `coupon_code`, `loyalty_points_used`, `loyalty_points_earned`

`user_subscriptions`

Active subscription records

`user_id`, `plan_id`, `status` (enum), `start_date`, `end_date`, `price_per_meal`, `total_meals`, `consumed_meals`, `preferred_delivery_time`, `meals` (JSONB array)

`user_profiles`

User account & preferences

`id` (= `auth.uid()`), `display_name`, `email`, `is_admin`, `loyalty_points`, `language`, `age`, `gender`

`user_health_profiles`

Nutritional & health data

Height, weight, activity level, health goals

`user_addresses`

Delivery addresses

`label`, `address_line1`, `city`, `country`, `location` (PostGIS Point), `is_default`

`user_messages`

Support chat messages

`user_id` (room), `admin_id`, `content`, `sender_type`, `is_read`

`meal_reviews`

Verified purchase reviews

`user_id`, `meal_id`, `order_id`, `rating` (1–5), `is_published`

### Junction & Relationship Tables

Table

Relationship

`order_meals`

Orders → Meals (with quantity, pricing, customization snapshot)

`order_items`

Orders / order_meals → Items (add-ons with quantity and pricing)

`meal_items`

Meals → Items (integer array, GIN-indexed, validated by trigger)

`plan_meals`

Plans → Meals (`is_substitutable` flag)

`meal_allergies`

Meals ↔ Allergies (many-to-many, cascade delete)

`item_allergies`

Items ↔ Allergies (many-to-many, cascade delete)

`user_allergies`

Users ↔ Allergies (with optional `severity_override`)

`user_dietary_preferences`

Users ↔ Dietary Preferences

`user_favorite_meals`

Users ↔ Meals (saved favourites)

`user_favorite_items`

Users ↔ Items (saved favourites)

`user_payment_methods`

Users → saved payment methods

`user_notification_preferences`

Users → notification channel settings

### Key Triggers & Business Logic

Trigger

Table

Effect

`trigger_set_order_number`

`orders` (INSERT)

Auto-generates sequential `order_number` from sequence

`trigger_order_delivery`

`orders` (UPDATE)

On status → `delivered`: sets `actual_delivery_date`, increments `consumed_meals` on linked subscription

`trigger_order_delivery_dates`

`orders` (UPDATE)

On status → `active`: calculates `scheduled_delivery_date` from subscription's `preferred_delivery_time`; on status → `confirmed`: sets `actual_delivery_date`

`trigger_update_meal_rating_insert/update`

`meal_reviews`

Recalculates `meals.rating` and `rating_count` in real-time on review insert/update

`trg_validate_meal_items_array`

`meal_items`

Validates that all item IDs in the integer array exist in `items`

`trigger_validate_subscription`

`user_subscriptions`

Validates subscription data integrity before save

`trigger_update_timestamp_*`

All major tables

Keeps `updated_at` current on every UPDATE

**Financial integrity constraint on `orders`:**

```sql
CHECK (total_amount = (subtotal + tax_amount + delivery_fee) - discount_amount)

```

**Address uniqueness constraint:**

```sql
EXCLUDE USING btree (user_id WITH =) WHERE (is_default = true)
-- Ensures only one default address per user at the DB level

```

----------

## Security & RLS Notes

> ⚠️ **Current State:** Row Level Security (RLS) policies are **intentionally relaxed** across most tables to facilitate active development and testing. This is a **known, temporary posture** and is not suitable for a hardened production deployment.

### Planned RLS Hardening (Pre-Production Checklist)

The following actions are scheduled for implementation before full production launch:

-   [ ] **Enable RLS on all sensitive tables** (`orders`, `user_subscriptions`, `user_profiles`, `user_addresses`, `user_health_profiles`, `user_messages`, `user_allergies`, `user_dietary_preferences`, `meal_reviews`, `user_payment_methods`)
-   [ ] **Add per-user SELECT/INSERT/UPDATE/DELETE policies** using the `(SELECT auth.uid()) = user_id` pattern on all user-scoped tables
-   [ ] **Admin bypass policies** using `user_profiles.is_admin = true` check for admin dashboard operations
-   [ ] **RLS on `user_messages`** scoped by room: users see only their own room; admins see all
-   [ ] **Public read-only tables** (`meals`, `items`, `plans`, `allergies`, `dietary_preferences`) — allow `SELECT` to `anon` and `authenticated`, restrict `INSERT/UPDATE/DELETE` to admin role only
-   [ ] **Rotate `SUPABASE_SERVICE_ROLE_KEY`** — confirm it is never present in any client-side code or public repository
-   [ ] **Realtime channel security** — set support chat channels to private; add RLS policies on `realtime.messages`
-   [ ] **Storage bucket policies** — any user-uploaded assets should be private with signed URL access
-   [ ] **Index policy columns** — ensure `user_id`, `admin_id`, `plan_id` columns used in policies have appropriate indexes
-   [ ] **Revoke public GRANTs** on tables not intended for unauthenticated access

### Authentication Security Notes

-   JWT expiry should be tuned in Supabase settings; client-side session refresh is in place
-   Google OAuth is the primary production auth method; phone/OTP is ready for activation
-   `user_profiles.is_admin` is the current authorization mechanism — a dedicated roles table is recommended for scale

----------

## Planned Improvements & Roadmap

### Phase 1 — Completion

Item

Status

RLS policies — full hardening

📋 Scheduled

BMI / TDEE calculator integration into subscription wizard

🚧 In Development

Twilio phone authentication activation

🔄 Ready for Migration

Delivery worker portal

🔄 Ready for Migration

Notification system — delivery & chat triggers

🚧 In Development

Loyalty points redemption engine

🚧 In Development

Promo code validation backend

📋 Scheduled

### Phase 2 — Enhancements

Item

Status

Advanced sales analytics dashboard

📋 Phase 2

Customer loyalty program (tiers, rewards)

📋 Phase 2

Foodics ERP integration

📋 Phase 2

Mobile app (React Native)

📋 Phase 2

SIEM / monitoring pipeline for audit logs

📋 Phase 2

Separate service keys per background job type

📋 Phase 2

### Architecture Improvements

-   Split `service_role` usage: isolate background job keys from client-facing keys
-   Introduce a CI check to prevent any Supabase secrets from being committed to source control
-   Add an automated RLS test suite that verifies access patterns for multiple roles/users
-   Move all secrets to Supabase Secrets / environment variables; establish a 90-day key rotation policy
-   Rate-limit and add auth checks to any Edge Functions introduced for webhooks or background processing

----------

## Getting Started

### Prerequisites

-   Node.js v14+
-   npm or yarn
-   Supabase account with a configured project

### Installation

```bash
# 1. Clone the repository
git clone [repository-url]
cd salad-saucia

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local

```

### Environment Variables

Configure `.env.local` with the following:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_GOOGLE_CLIENT_ID=your_google_oauth_client_id

```

> 🔒 Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code or `.env` files committed to source control. It must only be used in server-side contexts (Edge Functions / backend environment variables).

```bash
# 4. Start development server
npm start

```

----------

## Project Status

Feature

Status

DIY Salad Builder + Menu Browsing

✅ Complete

Real-time Order Tracking

✅ Complete

Google OAuth

✅ Complete

Premium Subscription Engine

✅ Complete

Subscription Dashboard

✅ Complete

Real-time Support Chat

✅ Complete

Promo Code UI

✅ Displayed

Loyalty Points UI

✅ Displayed

Admin Dashboard (Full CRUD)

✅ Complete

Admin Support Chat

✅ Complete

Interactive OL/Map Address Picker

✅ Complete

Dynamic Menu PDF Export

✅ Complete

Bilingual UI (EN / AR)

✅ Complete

BMI / Nutrition Calculator

🚧 In Development

Phone (Twilio) Authentication

🔄 Ready for Migration

Delivery Worker Portal

🔄 Ready for Migration

Notification System

🚧 In Development

Loyalty Points Redemption Engine

🚧 In Development

Full RLS Hardening

📋 Scheduled

Sales Analytics

📋 Phase 2

----------

## Related Documentation

-   [`Subscription_and_ordering_system.pdf`](https://claude.ai/chat/docs/Subscription_and_ordering_system.pdf) — Core entities, data flow, order/subscription schema
-   [`Support_Chat_System_Documentation.pdf`](https://claude.ai/chat/docs/Support_Chat_System_Documentation.pdf) — Real-time chat architecture, isolation model, debugging guide
-   [`Project_Flows_Summary.md`](https://claude.ai/chat/docs/Project_Flows_Summary.md) — Supabase security flows, RLS notes, and mitigation checklist
-   [`schema.json`](https://claude.ai/chat/docs/schema.json) — Full Supabase table definitions, constraints, indexes, and trigger functions

----------

_Built with ❤️ using React and Supabase — Salad Saucia © 2024_
