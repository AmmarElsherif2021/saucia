# 🥗 Salad Saucia — Production Food Delivery Platform

> **Live Demo:** [https://saucia-web-app.vercel.app/](https://saucia-web-app.vercel.app/)  
> React · Supabase · i18next · Chakra UI · Real-time · Bilingual EN/AR

---

A full-featured, production-deployed food ordering and subscription platform — built from scratch with no pre-designed UI, migrated mid-development from Firebase to Supabase/PostgreSQL, and shipped bilingual (English + Arabic RTL) with a real-time operations dashboard.

This is not a tutorial project. It handles real orders, real subscriptions, and real users.

---

## What Makes This Interesting

**Bilingual Arabic/English — end to end.**
RTL layout implemented across every screen using i18next + react-i18next with dynamic language switching. The database schema mirrors this: every content table carries `name_arabic`, `description_arabic`, `section_arabic`, `ingredients_arabic` columns alongside their English equivalents. Localisation is not a skin — it's baked into the data model.

**A subscription engine with real state machine complexity.**
The subscription flow is a 5-step wizard: plan selection → health & nutrition profiling → TDEE/BMI calculation → meal design → scheduling & payment. Subscriptions transition through `pending → active → paused / cancelled / completed`, enforced at the DB level via triggers and CHECK constraints. Meal consumption is tracked automatically on delivery via `trigger_order_delivery`.

**Financial integrity enforced at the database level.**
Every order satisfies a hard CHECK constraint:
```sql
total_amount = (subtotal + tax_amount + delivery_fee) - discount_amount
```
No application-layer bug can corrupt financial data.

**Real-time, not just reactive.**
Supabase Realtime subscriptions power live order tracking (`pending → active → confirmed → out_for_delivery → delivered`), real-time support chat between customers and staff, and live admin dashboard updates — all over persistent Postgres change streams.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| UI | Chakra UI (custom-themed) + Framer Motion + GSAP |
| State | Redux Toolkit + TanStack Query v5 |
| i18n | i18next + react-i18next (EN/AR, RTL) |
| Backend | Supabase (PostgreSQL + Realtime + Auth) |
| Auth | Supabase Auth — Google OAuth, JWT; Twilio OTP (ready) |
| Maps | OpenLayers — interactive address picker |
| Tables | TanStack Table v8 |
| PDF Export | jsPDF + html2canvas |
| Hosting | Vercel |

---

## Feature Highlights

### 🛒 DIY Order Builder
Customers compose their own meal — selecting a base, adding free and premium items, with the price updating in real time as they build. Financial totals are recalculated live in the UI and re-validated at the DB level on submission.

### 📦 Subscription Engine
Multi-step enrollment wizard with health profiling, a built-in TDEE/BMI calculator, and personalised meal selection from the plan catalog. Subscription state and meal consumption are tracked via DB triggers — delivery scheduling is automated based on the user's `preferred_delivery_time`.

### 📡 Real-time Operations
Live order tracking, live admin dashboard, live support chat — all built on Supabase Realtime Postgres change streams. Admins see order status changes the moment a driver updates them.

### 💬 Support Chat
Room-isolated real-time chat between customers and staff. Each customer session is a separate channel; admins see all rooms. Built on `user_messages` with Supabase Realtime subscriptions.

### 🌐 Bilingual UI (EN / AR)
Full RTL layout on Arabic. Language switching is instant — no page reload. Translation keys cover the entire app including admin panel. Arabic content (meal names, descriptions, categories, allergy names, dietary preferences) is stored natively in the database.

### 🔐 Admin Dashboard
Full CRUD over meals, items, plans, orders, users, subscriptions, and allergy data. Role-based access via `user_profiles.is_admin`. Exports dynamic menu PDFs. Full admin support chat.

---

## Database Design

The schema is production-grade PostgreSQL with deliberate constraint and index design:

- **9 business triggers** handling order numbering, delivery date calculation, subscription meal consumption, rating aggregation, and timestamp management
- **Filtered indexes** for performance-sensitive queries (active meals, paid orders, published reviews, active subscriptions)
- **GIN index** on `meal_items` for fast integer array lookups
- **Multi-language content** columns across every customer-facing table
- **Allergy management** via many-to-many junction tables with cascade deletes and per-user severity overrides
- **Nutritional data** with CHECK constraints on every macronutrient column across both `meals` and `items`

Key tables: `orders`, `order_meals`, `order_items`, `user_subscriptions`, `meals`, `items`, `plans`, `plan_meals`, `meal_items`, `meal_reviews`, `user_profiles`, `user_health_profiles`, `user_addresses`, `user_messages`, `allergies`, `dietary_preferences` + 8 junction/preference tables.

---

## Project Status

| Feature | Status |
|---|---|
| DIY Salad Builder + Menu Browsing | ✅ Complete |
| Real-time Order Tracking | ✅ Complete |
| Google OAuth | ✅ Complete |
| Premium Subscription Engine | ✅ Complete |
| Subscription Dashboard | ✅ Complete |
| Real-time Support Chat | ✅ Complete |
| Admin Dashboard (Full CRUD) | ✅ Complete |
| Bilingual UI (EN / AR + RTL) | ✅ Complete |
| Interactive Map Address Picker | ✅ Complete |
| Dynamic Menu PDF Export | ✅ Complete |
| Promo Code UI | ✅ Displayed |
| Loyalty Points UI | ✅ Displayed |
| BMI / Nutrition Calculator | 🚧 In Development |
| Phone (Twilio) OTP Auth | 🔄 Ready for Activation |
| Delivery Worker Portal | 🔄 Ready for Migration |
| Notification System | 🚧 In Development |
| Loyalty Points Redemption Engine | 🚧 In Development |
| Full RLS Hardening | 📋 Pre-Production |
| Sales Analytics Dashboard | 📋 Phase 2 |

---

## Engineering Notes

**Mid-project database migration.** The project was migrated from Firebase to Supabase/PostgreSQL mid-development — schema redesigned, data model restructured, all without stopping feature work.

**Zero pre-designed UI.** Every component was designed and built from scratch — no template, no pre-built theme, no Figma handoff to copy from.

**RLS hardening is scheduled, not ignored.** RLS policies are intentionally relaxed during active development. A full hardening checklist is documented and planned for pre-production: per-user SELECT/INSERT/UPDATE/DELETE policies, admin bypass policies, Realtime channel security, storage bucket policies, and service role key rotation.

---

## Getting Started

```bash
git clone [repository-url]
cd salad-saucia
npm install
cp .env.example .env.local
# Add REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY, REACT_APP_GOOGLE_CLIENT_ID
npm run dev
```

---

## Related Docs

- [`Subscription_and_ordering_system.pdf`](./docs/Subscription_and_ordering_system.pdf) — Core entities, data flow, order/subscription schema
- [`Support_Chat_System_Documentation.pdf`](./docs/Support_Chat_System_Documentation.pdf) — Real-time chat architecture and isolation model
- [`Project_Flows_Summary.md`](./docs/Project_Flows_Summary.md) — Security flows, RLS notes, mitigation checklist
- [`schema.json`](./docs/schema.json) — Full Supabase table definitions, constraints, indexes, triggers

---

*Built with React and Supabase — Salad Saucia © 2024*