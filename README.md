
# Salad Saucia Web Application

A comprehensive food ordering and subscription management platform built with React and Supabase, featuring real-time meal customization and premium subscription services.

## 🚀 Live Demo

[https://saucia-web-app.vercel.app/](https://saucia-web-app.vercel.app/)

## 📋 Project Overview

Salad Saucia evolved from a simple WordPress site concept into a full-featured React application with advanced meal customization, subscription management, and admin dashboard capabilities. The project overcame significant technical challenges including database migration and fluid requirements to deliver a production-grade solution.

## ✨ Key Features

### Customer Experience

-   **Interactive Homepage**
    
    -   Animated hero carousel with meal sliders
    -   Fully responsive design (mobile/desktop)
    -   Smooth animations powered by Framer Motion
    -   Dual langauges: Arabic and English
-   **Smart Menu System**
    
    -   **DIY Salad Builder** with real-time price calculation
    -   Base ingredients + premium add-ons selection
    -   Category-based browsing (Salads/Juices/Fruits)
-   **Premium Subscription Engine**
    
    -   Dietary preference filters (Keto/Vegan/Gluten-free)
    -   Allergies tracker and management
    -   Delivery scheduling with calendar integration
    -   BMI calculator with activity integration (in development)

### Admin Dashboard

-   **Comprehensive Management System**
    -   Full CRUD operations for meals, inventory, and subscription plans
    -   Bulk data import/export functionality
    -   Delivery scheduling with geo-mapping
    -   Custom pricing and meal allocation for subscriptions

### Authentication & Security

-   **Multi-tier Authentication**
    -   Google OAuth integration (fully implemented)
    -   Twilio phone authentication (ready for migration)
    -   Secure user session management

## 🛠️ Tech Stack

### Frontend

-   **React** - Core framework
-   **Chakra UI** - Component library with custom designs
-   **Framer Motion** - Animation library
-   **Redux Toolkit** - State management
-   **Context API** - Additional state management

### Backend

-   **Supabase** - Backend-as-a-Service
    -   PostgreSQL database
    -   Real-time subscriptions
    -   Authentication
    -   Row Level Security (RLS)

### Additional Integrations

-   **Foodics** - Management system integration (planned)
-   **Google Maps API** - Delivery geo-mapping
-   **Twilio** - SMS authentication

## 🏗️ Architecture

```
src/
├── components/           # Reusable UI components
├── pages/               # Main application pages
├── hooks/               # Custom React hooks
├── store/               # Redux store configuration
├── services/            # API services and Supabase client
├── utils/               # Helper functions
├── styles/              # Global styles and theme
└── assets/              # Static assets

```

## 🚧 Project Challenges & Solutions

### Database Migration

-   **Challenge**: Initial Firebase (NoSQL) setup became incompatible with complex relational data requirements
-   **Solution**: Migrated to Supabase (PostgreSQL) with complete schema redesign

### Zero Pre-Designed UI

-   **Challenge**: No existing templates or design system
-   **Solution**: Built custom UI from scratch using Chakra UI with consistent design patterns

### Fluid Requirements

-   **Challenge**: 5+ major feature changes during development
-   **Solution**: Implemented flexible architecture with modular components and scalable state management

### Real-time Features

-   **Challenge**: Complex meal customization with live pricing
-   **Solution**: Optimized state management with real-time calculations and Supabase subscriptions

## 📊 Current Status

Feature

Status

DIY Salad Builder

✅ Complete

Premium Subscription Plans

✅ Complete

Admin CRUD Operations

✅ Complete

Google OAuth

✅ Complete

Phone Authentication

🔄 Ready for Migration

Delivery Worker Portal

🔄 Ready for Migration

BMI Calculator

🚧 In Development

Sales Analytics

📋 Phase 2

## 🚀 Getting Started

### Prerequisites

-   Node.js (v14 or higher)
-   npm or yarn
-   Supabase account

### Installation

1.  Clone the repository

```bash
git clone [repository-url]
cd salad-saucia

```

2.  Install dependencies

```bash
npm install

```

3.  Set up environment variables

```bash
cp .env.example .env.local

```

4.  Configure your `.env.local` with:

```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id

```

5.  Start the development server

```bash
npm start

```

## 🔮 Upcoming Features

-   **Phase 1 Completion**
    
    -   BMI calculator integration
    -   Twilio phone authentication migration
    -   Delivery worker portal
-   **Phase 2 Enhancements**
    
    -   Advanced sales analytics
    -   Customer loyalty programs
    -   Mobile app development

## 🤝 Contributing

This is a commercial project. For business inquiries or collaboration opportunities, please contact the developer.

## 📄 License

This project is proprietary software developed for Salad Saucia.

----------

_Built with ❤️ using React and Supabase_