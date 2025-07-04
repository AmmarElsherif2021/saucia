# Supabase Schema Documentation

## Overview

This document provides comprehensive documentation for the meal delivery service database schema built on Supabase (PostgreSQL). The schema is designed to handle user management, meal planning, subscriptions, orders, and delivery logistics with proper data integrity, performance optimization, and Supabase-specific features.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Tables](#core-tables)
3. [Relationships](#relationships)
4. [Data Types & Enums](#data-types--enums)
5. [Indexing Strategy](#indexing-strategy)
6. [Business Logic & Constraints](#business-logic--constraints)
7. [Security (RLS)](#security-rls)
8. [Functions & Triggers](#functions--triggers)
9. [Usage Examples](#usage-examples)
10. [Migration Guide](#migration-guide)

## Architecture Overview

The schema follows a normalized relational design with the following key principles:

- **Extends Supabase Auth**: Integrates with `auth.users` for authentication
- **Session Management**: Comprehensive session tracking with OAuth provider support
- **Data Integrity**: Comprehensive constraints and foreign keys
- **Performance Optimized**: Strategic indexing and query optimization
- **Scalable**: UUID primary keys and efficient data structures
- **Audit Trail**: Timestamps and historical data preservation
- **Multi-language Support**: Arabic and English field support

### Key Features

- User profile management with health tracking
- Enhanced session management with OAuth provider integration
- Flexible meal and subscription planning
- Order management with delivery tracking
- Review and rating system
- Loyalty points and promotional features
- Geographic delivery optimization
- Real-time capable structure

## Core Tables

### Authentication & Session Management

#### `user_sessions`
Enhanced session management with OAuth provider support.

```sql
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    provider TEXT, -- 'google', 'apple', 'facebook', 'email', etc.
    provider_token TEXT, -- OAuth provider access token
    provider_refresh_token TEXT, -- OAuth provider refresh token
    device_info JSONB, -- Device information for session tracking
    ip_address INET, -- IP address for security tracking
    user_agent TEXT, -- Browser/app information
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_activity TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMPTZ,
    revoked_reason TEXT
);
```

**Key Features:**
- OAuth provider integration
- Device and security tracking
- Session lifecycle management
- Revocation support for security

### User Management

#### `user_profiles`
Extends Supabase auth.users with application-specific data.

```sql
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(uid) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT,
    phone_number TEXT,
    avatar_url TEXT,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    loyalty_points INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
    notes TEXT,
    language CHAR(2) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ar')),
    age INTEGER CHECK (age > 0 AND age < 150),
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    phone_verified BOOLEAN NOT NULL DEFAULT false,
    account_status TEXT NOT NULL DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'deactivated')),
    timezone TEXT DEFAULT 'Asia/Riyadh'
);
```

**Key Features:**
- Extends Supabase auth system
- Multi-language support (English/Arabic)
- Loyalty points tracking
- Admin role management
- Account status management
- Verification status tracking

#### `user_addresses`
Manages multiple delivery addresses per user.

```sql
CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL, -- 'home', 'work', 'other'
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT,
    postal_code TEXT,
    country CHAR(2) NOT NULL DEFAULT 'SA',
    location GEOGRAPHY(POINT, 4326), -- For delivery optimization
    is_default BOOLEAN NOT NULL DEFAULT false,
    delivery_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT only_one_default_address_per_user 
        EXCLUDE (user_id WITH =) WHERE (is_default = true)
);
```

**Key Features:**
- PostGIS integration for geographic queries
- Single default address enforcement
- Delivery optimization support
- Flexible address labeling

#### `user_payment_methods`
Stores payment method information (encrypted data should be handled at application level).

```sql
CREATE TABLE user_payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    type payment_method_enum NOT NULL,
    provider TEXT, -- 'visa', 'mastercard', 'mada', etc.
    last_four CHAR(4),
    expiry_month INTEGER CHECK (expiry_month BETWEEN 1 AND 12),
    expiry_year INTEGER CHECK (expiry_year >= EXTRACT(YEAR FROM NOW())),
    cardholder_name TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT only_one_default_payment_per_user 
        EXCLUDE (user_id WITH =) WHERE (is_default = true)
);
```

### Health & Preferences

#### `user_health_profiles`
Tracks user health and fitness information.

```sql
CREATE TABLE user_health_profiles (
    user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
    fitness_goal TEXT,
    height_cm NUMERIC(5,2) CHECK (height_cm > 0 AND height_cm < 300),
    weight_kg NUMERIC(5,2) CHECK (weight_kg > 0 AND weight_kg < 500),
    activity_level activity_level_enum NOT NULL DEFAULT 'moderately_active',
    target_calories INTEGER CHECK (target_calories > 0),
    target_protein INTEGER CHECK (target_protein > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `allergies` & `dietary_preferences`
Normalized reference tables for health constraints.

```sql
CREATE TABLE allergies (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    name_arabic TEXT,
    severity_level INTEGER CHECK (severity_level BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE dietary_preferences (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    name_arabic TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Meal Management

#### `meals`
Core meal catalog with nutritional and business information.

```sql
CREATE TABLE meals (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    name_arabic TEXT,
    description TEXT,
    description_arabic TEXT,
    section TEXT NOT NULL,
    section_arabic TEXT,
    base_price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (base_price >= 0),
    calories INTEGER NOT NULL DEFAULT 0 CHECK (calories >= 0),
    protein_g INTEGER NOT NULL DEFAULT 0 CHECK (protein_g >= 0),
    carbs_g INTEGER NOT NULL DEFAULT 0 CHECK (carbs_g >= 0),
    fat_g INTEGER NOT NULL DEFAULT 0 CHECK (fat_g >= 0),
    fiber_g INTEGER CHECK (fiber_g >= 0),
    sugar_g INTEGER CHECK (sugar_g >= 0),
    sodium_mg INTEGER CHECK (sodium_mg >= 0),
    ingredients TEXT,
    ingredients_arabic TEXT,
    preparation_instructions TEXT,
    image_url TEXT,
    thumbnail_url TEXT,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    is_vegetarian BOOLEAN NOT NULL DEFAULT false,
    is_vegan BOOLEAN NOT NULL DEFAULT false,
    is_gluten_free BOOLEAN NOT NULL DEFAULT false,
    is_dairy_free BOOLEAN NOT NULL DEFAULT false,
    spice_level INTEGER CHECK (spice_level BETWEEN 0 AND 5),
    prep_time_minutes INTEGER CHECK (prep_time_minutes > 0),
    rating NUMERIC(3,2) CHECK (rating >= 0 AND rating <= 5),
    rating_count INTEGER NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    discount_percentage NUMERIC(5,2) CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    discount_valid_until TIMESTAMPTZ,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Key Features:**
- Comprehensive nutritional information
- Multi-language support
- Dietary restriction flags
- Dynamic pricing with discounts
- Rating system integration
- Availability management

#### `items`
Add-on items and extras for meals.

```sql
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    name_arabic TEXT,
    description TEXT,
    description_arabic TEXT,
    category TEXT NOT NULL, -- 'sauce', 'side', 'drink', 'utensil'
    category_arabic TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    calories INTEGER NOT NULL DEFAULT 0 CHECK (calories >= 0),
    protein_g INTEGER NOT NULL DEFAULT 0 CHECK (protein_g >= 0),
    carbs_g INTEGER NOT NULL DEFAULT 0 CHECK (carbs_g >= 0),
    fat_g INTEGER NOT NULL DEFAULT 0 CHECK (fat_g >= 0),
    max_free_per_meal INTEGER NOT NULL DEFAULT 0 CHECK (max_free_per_meal >= 0),
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Subscription Management

#### `plans`
Subscription plan definitions.

```sql
CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    title_arabic TEXT,
    description TEXT,
    description_arabic TEXT,
    price_per_meal NUMERIC(10,2) NOT NULL CHECK (price_per_meal >= 0),
    short_term_meals INTEGER NOT NULL CHECK (short_term_meals > 0),
    medium_term_meals INTEGER NOT NULL CHECK (medium_term_meals >= short_term_meals),
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    target_calories_per_meal INTEGER CHECK (target_calories_per_meal > 0),
    target_protein_per_meal INTEGER CHECK (target_protein_per_meal > 0),
    target_carbs_per_meal INTEGER CHECK (target_carbs_per_meal >= 0),
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `user_subscriptions`
Active user subscriptions with pause/resume functionality.

```sql
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    status subscription_status_enum NOT NULL DEFAULT 'pending',
    start_date DATE NOT NULL,
    end_date DATE,
    price_per_meal NUMERIC(10,2) NOT NULL CHECK (price_per_meal >= 0),
    meals_per_week INTEGER NOT NULL CHECK (meals_per_week > 0),
    total_meals INTEGER NOT NULL CHECK (total_meals > 0),
    consumed_meals INTEGER NOT NULL DEFAULT 0 CHECK (consumed_meals >= 0),
    delivery_address_id UUID REFERENCES user_addresses(id),
    preferred_delivery_time TIME NOT NULL DEFAULT '12:00',
    delivery_days INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5}', -- 1=Monday, 7=Sunday
    auto_renewal BOOLEAN NOT NULL DEFAULT false,
    payment_method_id UUID REFERENCES user_payment_methods(id),
    
    -- Pause functionality
    is_paused BOOLEAN NOT NULL DEFAULT false,
    paused_at TIMESTAMPTZ,
    pause_reason TEXT,
    resume_date DATE,
    
    -- Next delivery tracking
    next_delivery_date DATE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_end_date CHECK (end_date IS NULL OR end_date > start_date),
    CONSTRAINT valid_pause_logic CHECK (
        (is_paused = false) OR 
        (is_paused = true AND paused_at IS NOT NULL)
    ),
    CONSTRAINT consumed_not_exceed_total CHECK (consumed_meals <= total_meals)
);
```

### Order Management

#### `orders`
Order headers with comprehensive pricing and delivery tracking.

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
    order_number TEXT NOT NULL UNIQUE, -- Human-readable order number
    
    -- Pricing breakdown
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0),
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    
    -- Status and payment
    status order_status_enum NOT NULL DEFAULT 'pending',
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partial_refund')),
    payment_method payment_method_enum,
    payment_reference TEXT,
    paid_at TIMESTAMPTZ,
    
    -- Delivery information
    delivery_address_id UUID REFERENCES user_addresses(id),
    delivery_instructions TEXT,
    scheduled_delivery_date TIMESTAMPTZ,
    actual_delivery_date TIMESTAMPTZ,
    delivery_driver_id UUID, -- Reference to driver/delivery service
    
    -- Additional info
    contact_phone TEXT,
    special_instructions TEXT,
    coupon_code TEXT,
    loyalty_points_used INTEGER DEFAULT 0 CHECK (loyalty_points_used >= 0),
    loyalty_points_earned INTEGER DEFAULT 0 CHECK (loyalty_points_earned >= 0),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_total CHECK (total_amount = subtotal + tax_amount + delivery_fee - discount_amount)
);
```

#### `order_meals`
Individual meal items within orders.

```sql
CREATE TABLE order_meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE RESTRICT,
    name TEXT NOT NULL, -- Snapshot of meal name at time of order
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
    special_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_order_meal_total CHECK (total_price = unit_price * quantity)
);
```

#### `order_items`
Add-on items within orders.

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    name TEXT NOT NULL, -- Snapshot of item name at time of order
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(10,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT valid_order_item_total CHECK (total_price = unit_price * quantity)
);
```

### Reviews & Ratings

#### `meal_reviews`
User reviews and ratings for meals.

```sql
CREATE TABLE meal_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    is_published BOOLEAN NOT NULL DEFAULT true,
    helpful_count INTEGER NOT NULL DEFAULT 0 CHECK (helpful_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT unique_user_meal_review UNIQUE (user_id, meal_id, order_id)
);
```

## Data Types & Enums

### Custom ENUM Types

```sql
-- Order status progression
CREATE TYPE order_status_enum AS ENUM (
    'pending', 
    'confirmed', 
    'preparing', 
    'out_for_delivery', 
    'delivered', 
    'cancelled', 
    'refunded'
);

-- Payment methods
CREATE TYPE payment_method_enum AS ENUM (
    'cash', 
    'credit_card', 
    'debit_card', 
    'apple_pay', 
    'google_pay', 
    'bank_transfer',
    'stc_pay',
    'mada'
);

-- Meal categorization
CREATE TYPE meal_type_enum AS ENUM (
    'carb', 
    'protein', 
    'soup', 
    'snack', 
    'dessert', 
    'beverage'
);

-- Subscription states
CREATE TYPE subscription_status_enum AS ENUM (
    'active', 
    'paused', 
    'cancelled', 
    'expired', 
    'pending'
);

-- Activity levels for health profiles
CREATE TYPE activity_level_enum AS ENUM (
    'sedentary', 
    'lightly_active', 
    'moderately_active', 
    'very_active', 
    'extremely_active'
);
```

### Junction Tables

```sql
-- Meal-Item relationships
CREATE TABLE meal_items (
    meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    is_included BOOLEAN NOT NULL DEFAULT false, -- true if included in base price
    max_quantity INTEGER NOT NULL DEFAULT 1 CHECK (max_quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (meal_id, item_id)
);

-- User allergies
CREATE TABLE user_allergies (
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    allergy_id INTEGER NOT NULL REFERENCES allergies(id) ON DELETE CASCADE,
    severity_level INTEGER CHECK (severity_level BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, allergy_id)
);

-- User dietary preferences
CREATE TABLE user_dietary_preferences (
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    preference_id INTEGER NOT NULL REFERENCES dietary_preferences(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, preference_id)
);

-- Meal allergies
CREATE TABLE meal_allergies (
    meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    allergy_id INTEGER NOT NULL REFERENCES allergies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (meal_id, allergy_id)
);

-- Plan meals
CREATE TABLE plan_meals (
    plan_id INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL CHECK (week_number > 0),
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (plan_id, meal_id, week_number, day_of_week)
);

-- User favorite meals
CREATE TABLE user_favorite_meals (
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    meal_id INTEGER NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, meal_id)
);


```

## Relationships

### Entity Relationship Overview

```
auth.users (Supabase Auth)
    ↓ (1:1)
user_profiles
    ↓ (1:many)
    ├── user_sessions
    ├── user_addresses
    ├── user_payment_methods  
    ├── user_subscriptions
    ├── orders
    ├── user_health_profiles (1:1)
    ├── user_allergies (many:many via allergies)
    ├── user_dietary_preferences (many:many via dietary_preferences)
    ├── user_favorite_meals (many:many via meals)
    └── meal_reviews

plans
    ↓ (1:many)
    ├── user_subscriptions
    └── plan_meals (many:many via meals)

meals
    ↓ (many:many)
    ├── meal_items (via items)
    ├── meal_allergies (via allergies)
    ├── plan_meals (via plans)
    ├── user_favorite_meals (via user_profiles)
    ├── meal_reviews
    └── order_meals

orders
    ↓ (1:many)
    ├── order_meals
    └── order_items
```

## Indexing Strategy

### Performance-Critical Indexes

```sql
-- Session management
CREATE INDEX idx_user_sessions_user_active ON user_sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_user_sessions_token ON user_sessions(access_token) WHERE is_active = true;
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at) WHERE expires_at > NOW();
CREATE INDEX idx_user_sessions_provider ON user_sessions(provider) WHERE provider IS NOT NULL;

-- User-centric queries
CREATE INDEX idx_user_profiles_phone ON user_profiles(phone_number) WHERE phone_number IS NOT NULL;
CREATE INDEX idx_user_profiles_language ON user_profiles(language);
CREATE INDEX idx_user_profiles_email ON user_profiles(email) WHERE email IS NOT NULL;

-- Address and location queries
CREATE INDEX idx_user_addresses_user_default ON user_addresses(user_id, is_default);
CREATE INDEX idx_user_addresses_location ON user_addresses USING GIST(location) WHERE location IS NOT NULL;

-- Meal discovery and filtering
CREATE INDEX idx_meals_available_featured ON meals(is_available, is_featured) WHERE is_available = true;
CREATE INDEX idx_meals_dietary ON meals(is_vegetarian, is_vegan, is_gluten_free, is_dairy_free);
CREATE INDEX idx_meals_rating ON meals(rating DESC) WHERE rating IS NOT NULL;
CREATE INDEX idx_meals_section ON meals(section, is_available) WHERE is_available = true;

-- Order processing
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_delivery_date ON orders(scheduled_delivery_date) WHERE scheduled_delivery_date IS NOT NULL;

-- Subscription management
CREATE INDEX idx_subscriptions_user_status ON user_subscriptions(user_id, status);
CREATE INDEX idx_subscriptions_active ON user_subscriptions(status, end_date) WHERE status = 'active';
CREATE INDEX idx_subscriptions_next_delivery ON user_subscriptions(next_delivery_date) WHERE next_delivery_date IS NOT NULL;

-- Review system
CREATE INDEX idx_meal_reviews_meal_published ON meal_reviews(meal_id, is_published) WHERE is_published = true;
CREATE INDEX idx_meal_reviews_user ON meal_reviews(user_id, created_at DESC);
```

### Partial Indexes

Used for conditional queries to improve performance:

```sql
-- Only index active sessions
CREATE INDEX idx_user_sessions_active_user ON user_sessions(user_id, last_activity DESC) 
    WHERE is_active = true AND expires_at > NOW();

-- Only index active meals with discounts
CREATE INDEX idx_meals_discount ON meals(discount_percentage, discount_valid_until) 
    WHERE discount_percentage > 0 AND discount_valid_until > NOW();

-- Only index published reviews
CREATE INDEX idx_meal_reviews_rating ON meal_reviews(meal_id, rating, created_at DESC) 
    WHERE is_published = true;
```

## Business Logic & Constraints

### Data Validation

The schema includes comprehensive validation through CHECK constraints:

```sql
-- Positive values for pricing
CHECK (price >= 0)
CHECK (loyalty_points >= 0)

-- Realistic health metrics
CHECK (age > 0 AND age < 150)
CHECK (height_cm > 0 AND height_cm < 300)
CHECK (weight_kg > 0 AND weight_kg < 500)

-- Valid ranges for ratings
CHECK (rating >= 0 AND rating <= 5)
CHECK (spice_level BETWEEN 0 AND 5)

-- Business logic validation
CHECK (consumed_meals <= total_meals)
CHECK (end_date IS NULL OR end_date > start_date)

-- Session validation
CHECK (expires_at > created_at)
```

### Exclusion Constraints

Ensures business rules at database level:

```sql
-- Only one default address per user
CONSTRAINT only_one_default_address_per_user 
    EXCLUDE (user_id WITH =) WHERE (is_default = true)

-- Only one default payment method per user  
CONSTRAINT only_one_default_payment_per_user 
    EXCLUDE (user_id WITH =) WHERE (is_default = true)

-- Unique user review per meal per order
CONSTRAINT unique_user_meal_review UNIQUE (user_id, meal_id, order_id)
```

## Security (RLS)

### Row Level Security Setup

```sql
-- Enable RLS on user-related tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_reviews ENABLE ROW LEVEL SECURITY;
```

### Example Policies

```sql
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Session management policies
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (
        user_id IN (SELECT id FROM user_profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can insert own sessions" ON user_sessions
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM user_profiles WHERE id = auth.uid())
    );

-- Admin access
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Public meal access
CREATE POLICY "Anyone can view available meals" ON meals
    FOR SELECT USING (is_available = true);

-- Review policies
CREATE POLICY "Users can view published reviews" ON meal_reviews
    FOR SELECT USING (is_published = true);

CREATE POLICY "Users can manage own reviews" ON meal_reviews
    FOR ALL USING (user_id = auth.uid());
```

## Functions & Triggers

### Session Management Functions

```sql
-- Clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() AND is_active = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Update last activity
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_activity
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_session_activity();
```

### Automatic Order Number Generation

```sql
CREATE SEQUENCE order_number_seq;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number = generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();
```

### Automatic Rating Updates

```sql
CREATE OR REPLACE FUNCTION update_meal_rating()
RETURNS