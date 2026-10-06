# Database Schema Documentation

## 📋 Table of Contents
- [Allergies](#table-allergies)
- [Dietary Preferences](#table-dietary_preferences)
- [Item Allergies](#table-item_allergies)
- [Items](#table-items)
- [Meal Allergies](#table-meal_allergies)
- [Meal Items](#table-meal_items)
- [Meal Reviews](#table-meal_reviews)
- [Meals](#table-meals)
- [Order Items](#table-order_items)
- [Order Meals](#table-order_meals)
- [Orders](#table-orders)
- [Plan Meals](#table-plan_meals)
- [Plans](#table-plans)
- [Spatial Ref Sys](#table-spatial_ref_sys)
- [User Addresses](#table-user_addresses)
- [User Allergies](#table-user_allergies)
- [User Dietary Preferences](#table-user_dietary_preferences)
- [User Favorite Items](#table-user_favorite_items)
- [User Favorite Meals](#table-user_favorite_meals)
- [User Health Profiles](#table-user_health_profiles)
- [User Notification Preferences](#table-user_notification_preferences)
- [User Payment Methods](#table-user_payment_methods)
- [User Profiles](#table-user_profiles)
- [User Subscriptions](#table-user_subscriptions)

---


# Database Schema Documentation

## Table: allergies

### 1️⃣ Table Definition
```sql
CREATE TABLE public.allergies (
    id integer DEFAULT nextval('allergies_id_seq'::regclass) NOT NULL,
    name text NOT NULL,
    name_arabic text,
    severity_level integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT allergies_pkey PRIMARY KEY (id)
);
```

### 2️⃣ Constraints
- **allergies_severity_level_check** (CHECK): `CHECK (((severity_level >= 1) AND (severity_level <= 5)))`
- **allergies_name_key** (UNIQUE): `UNIQUE (name)`
- **allergies_pkey** (PRIMARY KEY): `PRIMARY KEY (id)`

### 3️⃣ Indexes
- **allergies_pkey**: CREATE UNIQUE INDEX allergies_pkey ON public.allergies USING btree (id)
- **allergies_name_key**: CREATE UNIQUE INDEX allergies_name_key ON public.allergies USING btree (name)

### 4️⃣ Triggers
No triggers found for this table.

---

## Table: dietary_preferences

### 1️⃣ Table Definition
```sql
CREATE TABLE public.dietary_preferences (
    id integer DEFAULT nextval('dietary_preferences_id_seq'::regclass) NOT NULL,
    name text NOT NULL,
    name_arabic text,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT dietary_preferences_pkey PRIMARY KEY (id)
);
```

### 2️⃣ Constraints
- **dietary_preferences_name_key** (UNIQUE): `UNIQUE (name)`
- **dietary_preferences_pkey** (PRIMARY KEY): `PRIMARY KEY (id)`

### 3️⃣ Indexes
- **dietary_preferences_pkey**: CREATE UNIQUE INDEX dietary_preferences_pkey ON public.dietary_preferences USING btree (id)
- **dietary_preferences_name_key**: CREATE UNIQUE INDEX dietary_preferences_name_key ON public.dietary_preferences USING btree (name)

### 4️⃣ Triggers
No triggers found for this table.

---

## Table: item_allergies

### 1️⃣ Table Definition
```sql
CREATE TABLE public.item_allergies (
    item_id integer NOT NULL,
    allergy_id integer NOT NULL,
    CONSTRAINT item_allergies_pkey PRIMARY KEY (item_id, allergy_id)
);
```

### 2️⃣ Constraints
- **item_allergies_item_id_fkey** (FOREIGN KEY): `FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE`
- **item_allergies_allergy_id_fkey** (FOREIGN KEY): `FOREIGN KEY (allergy_id) REFERENCES allergies(id) ON DELETE CASCADE`
- **item_allergies_pkey** (PRIMARY KEY): `PRIMARY KEY (item_id, allergy_id)`

### 3️⃣ Indexes
- **item_allergies_pkey**: CREATE UNIQUE INDEX item_allergies_pkey ON public.item_allergies USING btree (item_id, allergy_id)

### 4️⃣ Triggers
No triggers found for this table.

---

## Table: items

### 1️⃣ Table Definition
```sql
CREATE TABLE public.items (
    id integer DEFAULT nextval('items_id_seq'::regclass) NOT NULL,
    name text NOT NULL,
    name_arabic text,
    description text,
    description_arabic text,
    category text NOT NULL,
    category_arabic text,
    price double precision NOT NULL,
    calories integer DEFAULT 0 NOT NULL,
    protein_g integer DEFAULT 0 NOT NULL,
    carbs_g integer DEFAULT 0 NOT NULL,
    fat_g integer DEFAULT 0 NOT NULL,
    max_free_per_meal integer DEFAULT 0 NOT NULL,
    image_url text,
    is_available boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_additive boolean DEFAULT false NOT NULL,
    CONSTRAINT items_pkey PRIMARY KEY (id)
);
```

### 2️⃣ Constraints
- **items_carbs_g_check** (CHECK): `CHECK ((carbs_g >= 0))`
- **items_max_free_per_meal_check** (CHECK): `CHECK ((max_free_per_meal >= 0))`
- **items_fat_g_check** (CHECK): `CHECK ((fat_g >= 0))`
- **items_pkey** (PRIMARY KEY): `PRIMARY KEY (id)`
- **items_price_check** (CHECK): `CHECK ((price >= ((0)::numeric)::double precision))`
- **items_protein_g_check** (CHECK): `CHECK ((protein_g >= 0))`
- **items_calories_check** (CHECK): `CHECK ((calories >= 0))`

### 3️⃣ Indexes
- **items_pkey**: CREATE UNIQUE INDEX items_pkey ON public.items USING btree (id)

### 4️⃣ Triggers
**trigger_update_timestamp_items** (BEFORE UPDATE):
```sql
CREATE OR REPLACE FUNCTION public.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
```

---

## Table: meal_allergies

### 1️⃣ Table Definition
```sql
CREATE TABLE public.meal_allergies (
    meal_id integer NOT NULL,
    allergy_id integer NOT NULL,
    CONSTRAINT meal_allergies_pkey PRIMARY KEY (meal_id, allergy_id)
);
```

### 2️⃣ Constraints
- **meal_allergies_meal_id_fkey** (FOREIGN KEY): `FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE`
- **meal_allergies_pkey** (PRIMARY KEY): `PRIMARY KEY (meal_id, allergy_id)`
- **meal_allergies_allergy_id_fkey** (FOREIGN KEY): `FOREIGN KEY (allergy_id) REFERENCES allergies(id) ON DELETE CASCADE`

### 3️⃣ Indexes
- **meal_allergies_pkey**: CREATE UNIQUE INDEX meal_allergies_pkey ON public.meal_allergies USING btree (meal_id, allergy_id)

### 4️⃣ Triggers
No triggers found for this table.

---

## Table: meal_items

### 1️⃣ Table Definition
```sql
CREATE TABLE public.meal_items (
    meal_id integer NOT NULL,
    item_id integer NOT NULL,
    is_included boolean DEFAULT false NOT NULL,
    max_quantity integer DEFAULT 1 NOT NULL,
    CONSTRAINT meal_items_pkey PRIMARY KEY (meal_id, item_id)
);
```

### 2️⃣ Constraints
- **meal_items_pkey** (PRIMARY KEY): `PRIMARY KEY (meal_id, item_id)`
- **meal_items_meal_id_fkey** (FOREIGN KEY): `FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE`
- **meal_items_max_quantity_check** (CHECK): `CHECK ((max_quantity > 0))`
- **meal_items_item_id_fkey** (FOREIGN KEY): `FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE`

### 3️⃣ Indexes
- **meal_items_pkey**: CREATE UNIQUE INDEX meal_items_pkey ON public.meal_items USING btree (meal_id, item_id)

### 4️⃣ Triggers
No triggers found for this table.

---

## Table: meal_reviews

### 1️⃣ Table Definition
```sql
CREATE TABLE public.meal_reviews (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    meal_id integer NOT NULL,
    order_id uuid NOT NULL,
    rating integer NOT NULL,
    review_text text,
    is_verified_purchase boolean DEFAULT true NOT NULL,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT meal_reviews_pkey PRIMARY KEY (id)
);
```

### 2️⃣ Constraints
- **meal_reviews_user_id_meal_id_order_id_key** (UNIQUE): `UNIQUE (user_id, meal_id, order_id)`
- **meal_reviews_user_id_fkey** (FOREIGN KEY): `FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE`
- **meal_reviews_rating_check** (CHECK): `CHECK (((rating >= 1) AND (rating <= 5)))`
- **meal_reviews_pkey** (PRIMARY KEY): `PRIMARY KEY (id)`
- **meal_reviews_order_id_fkey** (FOREIGN KEY): `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE`
- **meal_reviews_meal_id_fkey** (FOREIGN KEY): `FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE`

### 3️⃣ Indexes
- **meal_reviews_pkey**: CREATE UNIQUE INDEX meal_reviews_pkey ON public.meal_reviews USING btree (id)
- **meal_reviews_user_id_meal_id_order_id_key**: CREATE UNIQUE INDEX meal_reviews_user_id_meal_id_order_id_key ON public.meal_reviews USING btree (user_id, meal_id, order_id)
- **idx_meal_reviews_rating**: CREATE INDEX idx_meal_reviews_rating ON public.meal_reviews USING btree (meal_id, rating) WHERE (is_published = true)

### 4️⃣ Triggers
**trigger_update_meal_rating_insert** (AFTER INSERT):
```sql
CREATE OR REPLACE FUNCTION public.update_meal_rating()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE meals 
    SET 
        rating = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM meal_reviews 
            WHERE meal_id = NEW.meal_id AND is_published = true
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM meal_reviews 
            WHERE meal_id = NEW.meal_id AND is_published = true
        )
    WHERE id = NEW.meal_id;
    
    RETURN NEW;
END;
$function$
```

**trigger_update_timestamp_meal_reviews** (BEFORE UPDATE):
```sql
CREATE OR REPLACE FUNCTION public.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
```

**trigger_update_meal_rating_update** (AFTER UPDATE):
```sql
CREATE OR REPLACE FUNCTION public.update_meal_rating()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE meals 
    SET 
        rating = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM meal_reviews 
            WHERE meal_id = NEW.meal_id AND is_published = true
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM meal_reviews 
            WHERE meal_id = NEW.meal_id AND is_published = true
        )
    WHERE id = NEW.meal_id;
    
    RETURN NEW;
END;
$function$
```

---

## Table: meals

### 1️⃣ Table Definition
```sql
CREATE TABLE public.meals (
    id integer DEFAULT nextval('meals_id_seq'::regclass) NOT NULL,
    name text NOT NULL,
    name_arabic text,
    description text,
    description_arabic text,
    section text NOT NULL,
    section_arabic text,
    base_price numeric(10,2) DEFAULT 0 NOT NULL,
    calories integer DEFAULT 0 NOT NULL,
    protein_g integer DEFAULT 0 NOT NULL,
    carbs_g integer DEFAULT 0 NOT NULL,
    fat_g integer DEFAULT 0 NOT NULL,
    fiber_g integer,
    sugar_g integer,
    sodium_mg integer,
    ingredients text,
    ingredients_arabic text,
    preparation_instructions text,
    image_url text,
    thumbnail_url text,
    is_premium boolean DEFAULT false NOT NULL,
    is_vegetarian boolean DEFAULT false NOT NULL,
    is_vegan boolean DEFAULT false NOT NULL,
    is_gluten_free boolean DEFAULT false NOT NULL,
    is_dairy_free boolean DEFAULT false NOT NULL,
    spice_level integer,
    prep_time_minutes integer,
    rating numeric(3,2),
    rating_count integer DEFAULT 0 NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    discount_percentage numeric(5,2),
    discount_valid_until timestamp with time zone,
    is_available boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT meals_pkey PRIMARY KEY (id)
);
```

### 2️⃣ Constraints
- **meals_discount_percentage_check** (CHECK): `CHECK (((discount_percentage >= (0)::numeric) AND (discount_percentage <= (100)::numeric)))`
- **meals_carbs_g_check** (CHECK): `CHECK ((carbs_g >= 0))`
- **meals_calories_check** (CHECK): `CHECK ((calories >= 0))`
- **meals_sugar_g_check** (CHECK): `CHECK ((sugar_g >= 0))`
- **meals_base_price_check** (CHECK): `CHECK ((base_price >= (0)::numeric))`
- **meals_spice_level_check** (CHECK): `CHECK (((spice_level >= 0) AND (spice_level <= 5)))`
- **meals_sodium_mg_check** (CHECK): `CHECK ((sodium_mg >= 0))`
- **meals_rating_count_check** (CHECK): `CHECK ((rating_count >= 0))`
- **meals_rating_check** (CHECK): `CHECK (((rating >= (0)::numeric) AND (rating <= (5)::numeric)))`
- **meals_protein_g_check** (CHECK): `CHECK ((protein_g >= 0))`
- **meals_prep_time_minutes_check** (CHECK): `CHECK ((prep_time_minutes > 0))`
- **meals_pkey** (PRIMARY KEY): `PRIMARY KEY (id)`
- **meals_fiber_g_check** (CHECK): `CHECK ((fiber_g >= 0))`
- **meals_fat_g_check** (CHECK): `CHECK ((fat_g >= 0))`

### 3️⃣ Indexes
- **meals_pkey**: CREATE UNIQUE INDEX meals_pkey ON public.meals USING btree (id)
- **idx_meals_discount**: CREATE INDEX idx_meals_discount ON public.meals USING btree (discount_percentage, discount_valid_until) WHERE ((discount_percentage > (0)::numeric) AND (discount_valid_until > '2023-10-01 00:00:00+00'::timestamp with time zone))
- **idx_meals_available_featured**: CREATE INDEX idx_meals_available_featured ON public.meals USING btree (is_available, is_featured) WHERE (is_available = true)
- **idx_meals_calories**: CREATE INDEX idx_meals_calories ON public.meals USING btree (calories)
- **idx_meals_protein**: CREATE INDEX idx_meals_protein ON public.meals USING btree (protein_g)
- **idx_meals_rating**: CREATE INDEX idx_meals_rating ON public.meals USING btree (rating DESC) WHERE (rating IS NOT NULL)
- **idx_meals_dietary**: CREATE INDEX idx_meals_dietary ON public.meals USING btree (is_vegetarian, is_vegan, is_gluten_free, is_dairy_free)

### 4️⃣ Triggers
**trigger_update_timestamp_meals** (BEFORE UPDATE):
```sql
CREATE OR REPLACE FUNCTION public.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
```

---

## Table: order_items

### 1️⃣ Table Definition
```sql
CREATE TABLE public.order_items (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    order_meal_id uuid,
    item_id integer,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    name text NOT NULL,
    name_arabic text,
    category text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT order_items_pkey PRIMARY KEY (id)
);
```

### 2️⃣ Constraints
- **order_items_quantity_check** (CHECK): `CHECK ((quantity > 0))`
- **valid_item_total** (CHECK): `CHECK ((total_price = (unit_price * (quantity)::numeric)))`
- **order_items_unit_price_check** (CHECK): `CHECK ((unit_price >= (0)::numeric))`
- **order_items_total_price_check** (CHECK): `CHECK ((total_price >= (0)::numeric))`
- **order_items_item_id_fkey** (FOREIGN KEY): `FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL`
- **order_items_order_id_fkey** (FOREIGN KEY): `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE`
- **order_items_order_meal_id_fkey** (FOREIGN KEY): `FOREIGN KEY (order_meal_id) REFERENCES order_meals(id) ON DELETE CASCADE`
- **order_items_pkey** (PRIMARY KEY): `PRIMARY KEY (id)`

### 3️⃣ Indexes
- **order_items_pkey**: CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id)

### 4️⃣ Triggers
No triggers found for this table.

---

## Table: order_meals

### 1️⃣ Table Definition
```sql
CREATE TABLE public.order_meals (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    order_id uuid NOT NULL,
    meal_id integer,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL,
    name text NOT NULL,
    name_arabic text,
    description text,
    calories integer,
    protein_g integer,
    carbs_g integer,
    fat_g integer,
    customization_notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT order_meals_pkey PRIMARY KEY (id)
);
```

### 2️⃣ Constraints
- **order_meals_quantity_check** (CHECK): `CHECK ((quantity > 0))`
- **order_meals_pkey** (PRIMARY KEY): `PRIMARY KEY (id)`
- **order_meals_order_id_fkey** (FOREIGN KEY): `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE`
- **order_meals_meal_id_fkey** (FOREIGN KEY): `FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE SET NULL`
- **valid_meal_total** (CHECK): `CHECK ((total_price = (unit_price * (quantity)::numeric)))`
- **order_meals_unit_price_check** (CHECK): `CHECK ((unit_price >= (0)::numeric))`
- **order_meals_total_price_check** (CHECK): `CHECK ((total_price >= (0)::numeric))`

### 3️⃣ Indexes
- **order_meals_pkey**: CREATE UNIQUE INDEX order_meals_pkey ON public.order_meals USING btree (id)

### 4️⃣ Triggers
No triggers found for this table.

---

## Table: orders

### 1️⃣ Table Definition
```sql
CREATE TABLE public.orders (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    user_id uuid,
    subscription_id uuid,
    order_number text NOT NULL,
    subtotal numeric(10,2) DEFAULT 0 NOT NULL,
    tax_amount numeric(10,2) DEFAULT 0 NOT NULL,
    discount_amount numeric(10,2) DEFAULT 0 NOT NULL,
    delivery_fee numeric(10,2) DEFAULT 0 NOT NULL,
    total_amount numeric(10,2) DEFAULT 0 NOT NULL,
    status order_status_enum DEFAULT 'pending'::order_status_enum NOT NULL,
    payment_status text DEFAULT 'pending'::text NOT NULL,
    payment_method payment_method_enum,
    payment_reference text,
    paid_at timestamp with time zone,
    delivery_address_id uuid,
    delivery_instructions text,
    scheduled_delivery_date timestamp with time zone,
    actual_delivery_date timestamp with time zone,
    delivery_driver_id uuid,
    contact_phone text,
    special_instructions text,
    coupon_code text,
    loyalty_points_used integer DEFAULT 0 NOT NULL,
    loyalty_points_earned integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT orders_pkey PRIMARY KEY (id)
);
```

### 2️⃣ Constraints
- **orders_payment_status_check** (CHECK): `CHECK ((payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text, 'partial_refund'::text])))`
- **orders_order_number_key** (UNIQUE): `UNIQUE (order_number)`
- **orders_loyalty_points_used_check** (CHECK): `CHECK ((loyalty_points_used >= 0))`
- **orders_loyalty_points_earned_check** (CHECK): `CHECK ((loyalty_points_earned >= 0))`
- **orders_discount_amount_check** (CHECK): `CHECK ((discount_amount >= (0)::numeric))`
- **orders_delivery_fee_check** (CHECK): `CHECK ((delivery_fee >= (0)::numeric))`
- **orders_delivery_address_id_fkey** (FOREIGN KEY): `FOREIGN KEY (delivery_address_id) REFERENCES user_addresses(id)`
- **valid_total** (CHECK): `CHECK ((total_amount = (((subtotal + tax_amount) + delivery_fee) - discount_amount)))`
- **orders_user_id_fkey** (FOREIGN KEY): `FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL`
- **orders_total_amount_check** (CHECK): `CHECK ((total_amount >= (0)::numeric))`
- **orders_tax_amount_check** (CHECK): `CHECK ((tax_amount >= (0)::numeric))`
- **orders_subtotal_check** (CHECK): `CHECK ((subtotal >= (0)::numeric))`
- **orders_subscription_id_fkey** (FOREIGN KEY): `FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE SET NULL`
- **orders_pkey** (PRIMARY KEY): `PRIMARY KEY (id)`

### 3️⃣ Indexes
- **orders_pkey**: CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id)
- **orders_order_number_key**: CREATE UNIQUE INDEX orders_order_number_key ON public.orders USING btree (order_number)
- **idx_orders_user_created**: CREATE INDEX idx_orders_user_created ON public.orders USING btree (user_id, created_at DESC)
- **idx_orders_status_created**: CREATE INDEX idx_orders_status_created ON public.orders USING btree (status, created_at DESC)
- **idx_orders_delivery_date**: CREATE INDEX idx_orders_delivery_date ON public.orders USING btree (scheduled_delivery_date) WHERE (scheduled_delivery_date IS NOT NULL)
- **idx_orders_number**: CREATE INDEX idx_orders_number ON public.orders USING btree (order_number)
- **idx_orders_payment_stats**: CREATE INDEX idx_orders_payment_stats ON public.orders USING btree (payment_status, paid_at) WHERE (payment_status = 'paid'::text)

### 4️⃣ Triggers
**trigger_update_timestamp_orders** (BEFORE UPDATE):
```sql
CREATE OR REPREPLACE FUNCTION public.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
```

**trigger_set_order_number** (BEFORE INSERT):
```sql
CREATE OR REPLACE FUNCTION public.set_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$function$
```

---

## Table: plan_meals

### 1️⃣ Table Definition
```sql
CREATE TABLE public.plan_meals (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    plan_id integer NOT NULL,
    meal_id integer NOT NULL,
    is_substitutable boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT plan_meals_pkey PRIMARY KEY (id)
);
```

### 2️⃣ Constraints
- **plan_meals_pkey** (PRIMARY KEY): `PRIMARY KEY (id)`
- **plan_meals_meal_id_fkey** (FOREIGN KEY): `FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE`
- **plan_meals_plan_id_fkey** (FOREIGN KEY): `FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE`

### 3️⃣ Indexes
- **plan_meals_pkey**: CREATE UNIQUE INDEX plan_meals_pkey ON public.plan_meals USING btree (id)

### 4️⃣ Triggers
No triggers found for this table.

---

## Table: plans

### 1️⃣ Table Definition
```sql
CREATE TABLE public.plans (
    id integer DEFAULT nextval('plans_id_seq'::regclass) NOT NULL,
    title text NOT NULL,
    title_arabic text,
    description text,
    description_arabic text,
    price_per_meal numeric(10,2) NOT NULL,
    short_term_meals integer NOT NULL,
    medium_term_meals integer NOT NULL,
    kcal integer,
    protein integer,
    carb integer,
    avatar_url text,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    duration_days bigint DEFAULT '12'::bigint,
    additives integer[],
    CONSTRAINT plans_pkey PRIMARY KEY (id)
);
```

### 2️⃣ Constraints
- **plans_target_protein_per_meal_check** (CHECK): `CHECK ((protein > 0))`
- **plans_min_meals_per_week_check** (CHECK): `CHECK ((short_term_meals > 0))`
- **plans_pkey** (PRIMARY KEY): `PRIMARY KEY (id)`
- **plans_price_per_meal_check** (CHECK): `CHECK ((price_per_meal >= (0)::numeric))`
- **plans_target_calories_per_meal_check** (CHECK): `CHECK ((kcal > 0))`
- **plans_target_carbs_per_meal_check** (CHECK): `CHECK ((carb >= 0))`
- **plans_check** (CHECK): `CHECK ((medium_term_meals >= short_term_meals))`

### 3️⃣ Indexes
- **plans_pkey**: CREATE UNIQUE INDEX plans_pkey ON public.plans USING btree (id)

### 4️⃣ Triggers
**trigger_update_timestamp_plans** (BEFORE UPDATE):
```sql
CREATE OR REPLACE FUNCTION public.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
```

---

## Table: spatial_ref_sys

### 1️⃣ Table Definition
```sql
CREATE TABLE public.spatial_ref_sys (
    srid integer NOT NULL,
    auth_name character varying(256),
    auth_srid integer,
    srtext character varying(2048),
    proj4text character varying(2048),
    CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid)
);
```

### 2️⃣ Constraints
- **spatial_ref_sys_pkey** (PRIMARY KEY): `PRIMARY KEY (srid)`
- **spatial_ref_sys_srid_check** (CHECK): `CHECK (((srid > 0) AND (srid <= 998999)))`

### 3️⃣ Indexes
- **spatial_ref_sys_pkey**: CREATE UNIQUE INDEX spatial_ref_sys_pkey ON public.spatial_ref_sys USING btree (srid)

### 4️⃣ Triggers
No triggers found for this table.

---

## Table: user_addresses

### 1️⃣ Table Definition
```sql
CREATE TABLE public.user_addresses (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    label text NOT NULL,
    address_line1 text NOT NULL,
    address_line2 text,
    city text NOT NULL,
    state text,
    postal_code text,
    country character(2) DEFAULT 'SA'::bpchar NOT NULL,
    location geography(Point,4326),
    is_default boolean DEFAULT false NOT NULL,
    delivery_instructions text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_addresses_pkey PRIMARY KEY (id)
);
```

### 2️⃣ Constraints
- **user_addresses_user_id_fkey** (FOREIGN KEY): `FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE`
- **user_addresses_pkey** (PRIMARY KEY): `PRIMARY KEY (id)`
- **only_one_default_address_per_user** (EXCLUDE): `EXCLUDE USING btree (user_id WITH =) WHERE ((is_default = true))`

### 3️⃣ Indexes
- **user_addresses_pkey**: CREATE UNIQUE INDEX user_addresses_pkey ON public.user_addresses USING btree (id)
- **only_one_default_address_per_user**: CREATE INDEX only_one_default_address_per_user ON public.user_addresses USING btree (user_id) WHERE (is_default = true)
- **idx_user_addresses_user_default**: CREATE INDEX idx_user_addresses_user_default ON public.user_addresses USING btree (user_id, is_default)
- **idx_user_addresses_location**: CREATE INDEX idx_user_addresses_location ON public.user_addresses USING gist (location) WHERE (location IS NOT NULL)

### 4️⃣ Triggers
**trigger_update_timestamp_user_addresses** (BEFORE UPDATE):
```sql
CREATE OR REPLACE FUNCTION public.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
```

---

## Table: user_allergies

### 1️⃣ Table Definition
```sql
CREATE TABLE public.user_allergies (
    user_id uuid NOT NULL,
    allergy_id integer NOT NULL,
    severity_override integer,
    CONSTRAINT user_allergies_pkey PRIMARY KEY (user_id, allergy_id)
);
```

### 2️⃣ Constraints
- **user_allergies_user_id_fkey** (FOREIGN KEY): `FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE`
- **user_allergies_allergy_id_fkey** (FOREIGN KEY): `FOREIGN KEY (allergy_id) REFERENCES allergies(id) ON DELETE CASCADE`
- **user_allergies_pkey** (PRIMARY KEY): `PRIMARY KEY (user_id, allergy_id)`
- **user_allergies_severity_override_check** (CHECK): `CHECK (((severity_override >= 1) AND (severity_override <= 5)))`

### 3️⃣ Indexes
- **user_allergies_pkey**: CREATE UNIQUE INDEX user_allergies_pkey ON public.user_allergies USING btree (user_id, allergy_id)

### 4️⃣ Triggers
No triggers found for this table.

---

## Table: user_dietary_preferences

### 1️⃣ Table Definition
```sql
CREATE TABLE public.user_dietary_preferences (
    user_id uuid NOT NULL,
    preference_id integer NOT NULL,
    CONSTRAINT user_dietary_preferences_pkey PRIMARY KEY (user_id, preference_id)
);
```

### 2️⃣ Constraints
- **user_dietary_preferences_user_id_fkey** (FOREIGN KEY): `FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE`
- **user_dietary_preferences_pkey** (PRIMARY KEY): `PRIMARY KEY (user_id, preference_id)`
- **user_dietary_preferences_preference_id_fkey** (FOREIGN KEY): `FOREIGN KEY (preference_id) REFERENCES dietary_preferences(id) ON DELETE CASCADE`

### 3️⃣ Indexes
- **user_dietary_preferences_pkey**: CREATE UNIQUE INDEX user_dietary_preferences_pkey ON public.user_dietary_preferences USING btree (user_id, preference_id)

### 4️⃣ Triggers
No triggers found for this table.

---

## Table: user_favorite_items

### 1️⃣ Table Definition
```sql
CREATE TABLE public.user_favorite_items (
    user_id uuid NOT NULL,
    item_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_favorite_items_pkey PRIMARY KEY (user_id, item_id)
);
```

### 2️⃣ Constraints
- **user_favorite_items_item_id_fkey** (FOREIGN KEY): `FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE`
- **user_favorite_items_pkey** (PRIMARY KEY): `PRIMARY KEY (user_id, item_id)`
- **user_favorite_items_user_id_fkey** (FOREIGN KEY): `FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE`

### 3️⃣ Indexes
- **user_favorite_items_pkey**: CREATE UNIQUE INDEX user_favorite_items_pkey ON public.user_favorite_items USING btree (user_id, item_id)

### 4️⃣ Triggers
No triggers found for this table.

---

## Table: user_favorite_meals

### 1️⃣ Table Definition
```sql
CREATE TABLE public.user_favorite_meals (
    user_id uuid NOT NULL,
    meal_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_favorite_meals_pkey PRIMARY KEY (user_id, meal_id)
);
```

### 2️⃣ Constraints
- **user_favorite_meals_meal_id_fkey** (FOREIGN KEY): `FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE`
- **user_favorite_meals_user_id_fkey** (FOREIGN KEY): `FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE`
- **user_favorite_meals_pkey** (PRIMARY KEY): `PRIMARY KEY (user_id, meal_id)`

### 3️⃣ Indexes
- **user_favorite_meals_pkey**: CREATE UNIQUE INDEX user_favorite_meals_pkey ON public.user_favorite_meals USING btree (user_id, meal_id)

### 4️⃣ Triggers
No triggers found for this table.

---

## Table: user_health_profiles

### 1️⃣ Table Definition
```sql
CREATE TABLE public.user_health_profiles (
    user_id uuid NOT NULL,
    fitness_goal text,
    height_cm numeric(5,2),
    weight_kg numeric(5,2),
    activity_level activity_level_enum DEFAULT 'moderately_active'::activity_level_enum NOT NULL,
    target_calories integer,
    target_protein integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_health_profiles_pkey PRIMARY KEY (user_id)
);
```

### 2️⃣ Constraints
- **user_health_profiles_user_id_fkey** (FOREIGN KEY): `FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE`
- **user_health_profiles_weight_kg_check** (CHECK): `CHECK (((weight_kg > (0)::numeric) AND (weight_kg < (500)::numeric)))`
- **user_health_profiles_target_calories_check** (CHECK): `CHECK ((target_calories > 0))`
- **user_health_profiles_target_protein_check** (CHECK): `CHECK ((target_protein > 0))`
- **user_health_profiles_height_cm_check** (CHECK): `CHECK (((height_cm > (0)::numeric) AND (height_cm < (300)::numeric)))`
- **user_health_profiles_pkey** (PRIMARY KEY): `PRIMARY KEY (user_id)`

### 3️⃣ Indexes
- **user_health_profiles_pkey**: CREATE UNIQUE INDEX user_health_profiles_pkey ON public.user_health_profiles USING btree (user_id)

### 4️⃣ Triggers
**trigger_update_timestamp_user_health_profiles** (BEFORE UPDATE):
```sql
CREATE OR REPLACE FUNCTION public.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
```

---

## Table: user_notification_preferences

### 1️⃣ Table Definition
```sql
CREATE TABLE public.user_notification_preferences (
    user_id uuid NOT NULL,
    email_enabled boolean DEFAULT true NOT NULL,
    sms_enabled boolean DEFAULT false NOT NULL,
    push_enabled boolean DEFAULT true NOT NULL,
    order_confirmations boolean DEFAULT true NOT NULL,
    delivery_updates boolean DEFAULT true NOT NULL,
    meal_reminders boolean DEFAULT true NOT NULL,
    plan_updates boolean DEFAULT true NOT NULL,
    promotional_emails boolean DEFAULT false NOT NULL,
    promotional_sms boolean DEFAULT false NOT NULL,
    weekly_reports boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_notification_preferences_pkey PRIMARY KEY (user_id)
);
```

### 2️⃣ Constraints
- **user_notification_preferences_user_id_fkey** (FOREIGN KEY): `FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE`
- **user_notification_preferences_pkey** (PRIMARY KEY): `PRIMARY KEY (user_id)`

### 3️⃣ Indexes
- **user_notification_preferences_pkey**: CREATE UNIQUE INDEX user_notification_preferences_pkey ON public.user_notification_preferences USING btree (user_id)

### 4️⃣ Triggers
**trigger_update_timestamp_user_notification_preferences** (BEFORE UPDATE):
```sql
CREATE OR REPLACE FUNCTION public.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
```

---

## Table: user_payment_methods

### 1️⃣ Table Definition
```sql
CREATE TABLE public.user_payment_methods (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    type payment_method_enum NOT NULL,
    provider text,
    last_four character(4),
    expiry_month integer,
    expiry_year integer,
    cardholder_name text,
    is_default boolean DEFAULT false NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_payment_methods_pkey PRIMARY KEY (id)
);
```

### 2️⃣ Constraints
- **user_payment_methods_expiry_year_check** (CHECK): `CHECK (((expiry_year)::numeric >= EXTRACT(year FROM now())))`
- **user_payment_methods_user_id_fkey** (FOREIGN KEY): `FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE`
- **only_one_default_payment_per_user** (EXCLUDE): `EXCLUDE USING btree (user_id WITH =) WHERE ((is_default = true))`
- **user_payment_methods_expiry_month_check** (CHECK): `CHECK (((expiry_month >= 1) AND (expiry_month <= 12)))`
- **user_payment_methods_pkey** (PRIMARY KEY): `PRIMARY KEY (id)`

### 3️⃣ Indexes
- **user_payment_methods_pkey**: CREATE UNIQUE INDEX user_payment_methods_pkey ON public.user_payment_methods USING btree (id)
- **only_one_default_payment_per_user**: CREATE INDEX only_one_default_payment_per_user ON public.user_payment_methods USING btree (user_id) WHERE (is_default = true)

### 4️⃣ Triggers
**trigger_update_timestamp_user_payment_methods** (BEFORE UPDATE):
```sql
CREATE OR REPLACE FUNCTION public.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
```

---

## Table: user_profiles

### 1️⃣ Table Definition
```sql
CREATE TABLE public.user_profiles (
    id uuid DEFAULT auth.uid() NOT NULL,
    display_name text,
    phone_number text,
    avatar_url text,
    is_admin boolean DEFAULT false NOT NULL,
    loyalty_points integer DEFAULT 0 NOT NULL,
    notes text,
    language character(2) DEFAULT 'en'::bpchar NOT NULL,
    age integer,
    gender text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_login timestamp with time zone,
    email text DEFAULT ''::text,
    google_id text DEFAULT ''::text,
    account_status text DEFAULT 'active'::text NOT NULL,
    timezone text DEFAULT 'Asia/Riyadh'::text NOT NULL,
    phone_verified boolean DEFAULT false NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    profile_completed boolean DEFAULT false NOT NULL,
    CONSTRAINT user_profiles_pkey PRIMARY KEY (id)
);
```

### 2️⃣ Constraints
- **user_profiles_id_key** (UNIQUE): `UNIQUE (id)`
- **user_profiles_gender_check** (CHECK): `CHECK ((gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text, 'prefer_not_to_say'::text])))`
- **user_profiles_age_check** (CHECK): `CHECK (((age > 0) AND (age < 150)))`
- **user_profiles_pkey** (PRIMARY KEY): `PRIMARY KEY (id)`
- **user_profiles_loyalty_points_check** (CHECK): `CHECK ((loyalty_points >= 0))`
- **user_profiles_language_check** (CHECK): `CHECK ((language = ANY (ARRAY['en'::bpchar, 'ar'::bpchar])))`

### 3️⃣ Indexes
- **user_profiles_pkey**: CREATE UNIQUE INDEX user_profiles_pkey ON public.user_profiles USING btree (id)
- **idx_user_profiles_phone**: CREATE INDEX idx_user_profiles_phone ON public.user_profiles USING btree (phone_number) WHERE (phone_number IS NOT NULL)
- **idx_user_profiles_language**: CREATE INDEX idx_user_profiles_language ON public.user_profiles USING btree (language)
- **idx_user_profiles_last_login**: CREATE INDEX idx_user_profiles_last_login ON public.user_profiles USING btree (last_login DESC)
- **user_profiles_id_key**: CREATE UNIQUE INDEX user_profiles_id_key ON public.user_profiles USING btree (id)
- **idx_user_profiles_email**: CREATE INDEX idx_user_profiles_email ON public.user_profiles USING btree (email)
- **idx_user_profiles_google_id**: CREATE INDEX idx_user_profiles_google_id ON public.user_profiles USING btree (google_id)

### 4️⃣ Triggers
**trigger_update_timestamp_user_profiles** (BEFORE UPDATE):
```sql
CREATE OR REPLACE FUNCTION public.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
```

---



## Table: user_subscriptions

### 1️⃣ Table Definition

```sql
CREATE TABLE public.user_subscriptions (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    plan_id integer NOT NULL,
    status subscription_status_enum DEFAULT 'pending'::subscription_status_enum NOT NULL,
    start_date date NOT NULL,
    end_date date,
    price_per_meal numeric(10,2) NOT NULL,
    total_meals integer NOT NULL,
    consumed_meals integer DEFAULT 0 NOT NULL,
    delivery_address_id uuid,
    preferred_delivery_time time without time zone DEFAULT '12:00:00'::time without time zone NOT NULL,
    auto_renewal boolean DEFAULT false NOT NULL,
    payment_method_id uuid,
    is_paused boolean DEFAULT false NOT NULL,
    paused_at timestamp with time zone,
    pause_reason text,
    resume_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    additives integer[],
    delivery_days timestamp with time zone[],
    meals json[],
    next_delivery_date timestamp with time zone,
    next_delivery_status text,
    delivery_history jsonb DEFAULT '[]'::jsonb,
    next_delivery_meals integer,
    CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id)
);

```

### 2️⃣ Constraints

-   **user_subscriptions_user_id_fkey** (FOREIGN KEY): `FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE`
-   **valid_pause_logic** (CHECK): `CHECK (((is_paused = false) OR ((is_paused = true) AND (paused_at IS NOT NULL))))`
-   **user_subscriptions_price_per_meal_check** (CHECK): `CHECK ((price_per_meal >= (0)::numeric))`
-   **user_subscriptions_plan_id_fkey** (FOREIGN KEY): `FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT`
-   **user_subscriptions_pkey** (PRIMARY KEY): `PRIMARY KEY (id)`
-   **user_subscriptions_payment_method_id_fkey** (FOREIGN KEY): `FOREIGN KEY (payment_method_id) REFERENCES user_payment_methods(id)`
-   **user_subscriptions_delivery_address_id_fkey** (FOREIGN KEY): `FOREIGN KEY (delivery_address_id) REFERENCES user_addresses(id)`
-   **user_subscriptions_consumed_meals_check** (CHECK): `CHECK ((consumed_meals >= 0))`
-   **consumed_not_exceed_total** (CHECK): `CHECK ((consumed_meals <= total_meals))`
-   **user_subscriptions_total_meals_check** (CHECK): `CHECK ((total_meals > 0))`
-   **valid_end_date** (CHECK): `CHECK (((end_date IS NULL) OR (end_date > start_date)))`

### 3️⃣ Indexes

-   **user_subscriptions_pkey**: CREATE UNIQUE INDEX user_subscriptions_pkey ON public.user_subscriptions USING btree (id)
-   **idx_subscriptions_user_status**: CREATE INDEX idx_subscriptions_user_status ON public.user_subscriptions USING btree (user_id, status)
-   **idx_subscriptions_active**: CREATE INDEX idx_subscriptions_active ON public.user_subscriptions USING btree (status, end_date) WHERE (status = 'active'::subscription_status_enum)
-   **idx_subscriptions_active_with_delivery_days**: CREATE INDEX idx_subscriptions_active_with_delivery_days ON public.user_subscriptions USING btree (status, delivery_days) WHERE ((status = 'active'::subscription_status_enum) AND (delivery_days IS NOT NULL))
-   **idx_subscriptions_active_with_next_delivery**: CREATE INDEX idx_subscriptions_active_with_next_delivery ON public.user_subscriptions USING btree (status, next_delivery_date) WHERE ((status = 'active'::subscription_status_enum) AND (next_delivery_date IS NOT NULL))
-   **idx_subscriptions_delivery_history**: CREATE INDEX idx_subscriptions_delivery_history ON public.user_subscriptions USING gin (delivery_history) WHERE (delivery_history IS NOT NULL)
-   **idx_subscriptions_pending_cleanup**: CREATE INDEX idx_subscriptions_pending_cleanup ON public.user_subscriptions USING btree (status, created_at) WHERE (status = 'pending'::subscription_status_enum)
-   **idx_subscriptions_user_status_next_delivery**: CREATE INDEX idx_subscriptions_user_status_next_delivery ON public.user_subscriptions USING btree (user_id, status, next_delivery_date)

### 4️⃣ Triggers

-   **trigger_subscription_lifecycle_before** (BEFORE INSERT OR UPDATE): Executes `handle_subscription_lifecycle()` function
-   **trigger_delivery_completion_after** (AFTER UPDATE): Executes `handle_delivery_completion()` function when `next_delivery_status` changes
-   **trigger_update_timestamp_user_subscriptions** (BEFORE UPDATE): Executes `update_timestamp()` function

**Function Definitions:**

```sql
CREATE OR REPLACE FUNCTION public.handle_subscription_lifecycle()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_next_delivery_date      timestamp with time zone;
    v_meals_count             integer;
    v_status_changed          boolean := false;
    v_preferred_time_changed  boolean := false;
    v_delivery_days_changed   boolean := false;
BEGIN
    ------------------------------------------------------------------
    -- 1️⃣ Detect what changed (INSERT vs UPDATE)
    ------------------------------------------------------------------
    IF TG_OP = 'UPDATE' THEN
        v_status_changed          := (OLD.status <> NEW.status);
        v_preferred_time_changed  := (OLD.preferred_delivery_time <> NEW.preferred_delivery_time);
        v_delivery_days_changed   := (OLD.delivery_days IS DISTINCT FROM NEW.delivery_days);
    ELSE
        -- INSERT – treat as a status change so the rest of the logic runs
        v_status_changed := true;
    END IF;

    ------------------------------------------------------------------
    -- 2️⃣ Preferred‑delivery‑time change – delegate to helper function
    ------------------------------------------------------------------
    IF TG_OP = 'UPDATE' AND v_preferred_time_changed THEN
        PERFORM update_delivery_times_for_preferred_time(NEW.id, NEW.preferred_delivery_time);
        -- The helper may issue another UPDATE; the trigger will fire again but
        -- the guard logic above prevents an endless loop.
    END IF;

    ------------------------------------------------------------------
    -- 3️⃣ Main active‑subscription processing
    ------------------------------------------------------------------
    IF NEW.status = 'active'
       AND NEW.delivery_days IS NOT NULL
       AND array_length(NEW.delivery_days, 1) > 0
       AND NEW.consumed_meals < NEW.total_meals
       AND NOT NEW.is_paused THEN

        -- 3a️⃣ Compute the next delivery date (respecting preferred time)
        v_next_delivery_date := get_next_delivery_date_with_time(
                                    NEW.delivery_days,
                                    NEW.preferred_delivery_time
                                );

        -- 3b️⃣ Retrieve just the meals count
        SELECT meals_count
        INTO v_meals_count
        FROM calculate_next_meal_delivery(NEW)
        LIMIT 1;

        IF NOT FOUND OR v_meals_count IS NULL OR v_meals_count = 0 THEN
            -- No meals can be scheduled – clear delivery columns
            NEW.next_delivery_date   := NULL;
            NEW.next_delivery_meals  := NULL;
            NEW.next_delivery_status := NULL;
        ELSE
            -- A valid delivery can be scheduled
            NEW.next_delivery_date   := v_next_delivery_date;
            NEW.next_delivery_meals  := v_meals_count;
            NEW.next_delivery_status := 'scheduled';
            RAISE NOTICE
                'Scheduled next delivery for subscription % on % with % meals',
                NEW.id, v_next_delivery_date, v_meals_count;
        END IF;

    ELSE
        -- Inactive / paused / completed – clear fields
        NEW.next_delivery_date   := NULL;
        NEW.next_delivery_meals  := NULL;
        NEW.next_delivery_status := NULL;
    END IF;

    ------------------------------------------------------------------
    -- 4️⃣ Completion handling – when all meals are consumed
    ------------------------------------------------------------------
    IF NEW.consumed_meals >= NEW.total_meals THEN
        NEW.end_date := CURRENT_DATE;
        NEW.next_delivery_date   := NULL;
        NEW.next_delivery_meals  := NULL;
        NEW.next_delivery_status := NULL;
        RAISE NOTICE 'Subscription % completed – all meals consumed', NEW.id;
    END IF;

    ------------------------------------------------------------------
    -- 5️⃣ Touch the audit column
    ------------------------------------------------------------------
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$function$

```

```sql
CREATE OR REPLACE FUNCTION public.handle_delivery_completion()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_next_delivery_date timestamp with time zone;
    v_meal_delivery_info record;
BEGIN
    -- Check if delivery status changed to 'delivered'
    IF TG_OP = 'UPDATE' AND 
       OLD.next_delivery_status != 'delivered' AND 
       NEW.next_delivery_status = 'delivered' THEN
        
        -- Add to delivery history
        PERFORM add_delivery_to_history(
            NEW.id,
            OLD.next_delivery_date,
            OLD.next_delivery_meals,
            'delivered'
        );
        
        -- Increment consumed meals
        UPDATE user_subscriptions 
        SET consumed_meals = LEAST(consumed_meals + OLD.next_delivery_meals, total_meals)
        WHERE id = NEW.id;
        
        RAISE NOTICE 'Delivery completed for subscription %, consumed meals updated', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$function$

```

```sql
CREATE OR REPLACE FUNCTION public.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$

```
*Documentation generated from database schema*