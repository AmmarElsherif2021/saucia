# Database Schema Documentation
*Generated on: 9/13/2025, 1:49:03 PM*

## Table of Contents
- [allergies](#allergies)
- [dietary_preferences](#dietary_preferences)
- [item_allergies](#item_allergies)
- [items](#items)
- [meal_allergies](#meal_allergies)
- [meal_items](#meal_items)
- [meal_reviews](#meal_reviews)
- [meals](#meals)
- [order_items](#order_items)
- [order_meals](#order_meals)
- [orders](#orders)
- [plan_meals](#plan_meals)
- [plans](#plans)
- [spatial_ref_sys](#spatial_ref_sys)
- [user_addresses](#user_addresses)
- [user_allergies](#user_allergies)
- [user_dietary_preferences](#user_dietary_preferences)
- [user_favorite_items](#user_favorite_items)
- [user_favorite_meals](#user_favorite_meals)
- [user_health_profiles](#user_health_profiles)
- [user_notification_preferences](#user_notification_preferences)
- [user_payment_methods](#user_payment_methods)
- [user_profiles](#user_profiles)
- [user_subscriptions](#user_subscriptions)

## allergies

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
CREATE TABLE public.allergies (
    id integer DEFAULT nextval('allergies_id_seq'::regclass) NOT NULL,
    name text NOT NULL,
    name_arabic text,
    severity_level integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT allergies_pkey PRIMARY KEY (id)
);
```

### Constraints
- **CHECK**: allergies_severity_level_check
  ```sql
  CHECK (((severity_level >= 1) AND (severity_level <= 5)))
  ```
- **UNIQUE**: allergies_name_key
  ```sql
  UNIQUE (name)
  ```

### Indexes
- **UNIQUE**: allergies_pkey
  - Columns: id
  - Definition: ```sql
    CREATE UNIQUE INDEX allergies_pkey ON public.allergies USING btree (id)
    ```
- **UNIQUE**: allergies_name_key
  - Columns: name
  - Definition: ```sql
    CREATE UNIQUE INDEX allergies_name_key ON public.allergies USING btree (name)
    ```

---

## dietary_preferences

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
CREATE TABLE public.dietary_preferences (
    id integer DEFAULT nextval('dietary_preferences_id_seq'::regclass) NOT NULL,
    name text NOT NULL,
    name_arabic text,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT dietary_preferences_pkey PRIMARY KEY (id)
);
```

### Constraints
- **UNIQUE**: dietary_preferences_name_key
  ```sql
  UNIQUE (name)
  ```

### Indexes
- **UNIQUE**: dietary_preferences_pkey
  - Columns: id
  - Definition: ```sql
    CREATE UNIQUE INDEX dietary_preferences_pkey ON public.dietary_preferences USING btree (id)
    ```
- **UNIQUE**: dietary_preferences_name_key
  - Columns: name
  - Definition: ```sql
    CREATE UNIQUE INDEX dietary_preferences_name_key ON public.dietary_preferences USING btree (name)
    ```

---

## item_allergies

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
CREATE TABLE public.item_allergies (
    item_id integer NOT NULL,
    allergy_id integer NOT NULL,
    CONSTRAINT item_allergies_pkey PRIMARY KEY (item_id, allergy_id)
);
```

### Constraints
- **FOREIGN KEY**: item_allergies_item_id_fkey
  ```sql
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
  ```
- **FOREIGN KEY**: item_allergies_allergy_id_fkey
  ```sql
  FOREIGN KEY (allergy_id) REFERENCES allergies(id) ON DELETE CASCADE
  ```

### Indexes
- **UNIQUE**: item_allergies_pkey
  - Columns: item_id, allergy_id
  - Definition: ```sql
    CREATE UNIQUE INDEX item_allergies_pkey ON public.item_allergies USING btree (item_id, allergy_id)
    ```

---

## items

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
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

### Constraints
- **CHECK**: items_fat_g_check
  ```sql
  CHECK ((fat_g >= 0))
  ```
- **CHECK**: items_max_free_per_meal_check
  ```sql
  CHECK ((max_free_per_meal >= 0))
  ```
- **CHECK**: items_price_check
  ```sql
  CHECK ((price >= ((0)::numeric)::double precision))
  ```
- **CHECK**: items_protein_g_check
  ```sql
  CHECK ((protein_g >= 0))
  ```
- **CHECK**: items_calories_check
  ```sql
  CHECK ((calories >= 0))
  ```
- **CHECK**: items_carbs_g_check
  ```sql
  CHECK ((carbs_g >= 0))
  ```

### Indexes
- **UNIQUE**: items_pkey
  - Columns: id
  - Definition: ```sql
    CREATE UNIQUE INDEX items_pkey ON public.items USING btree (id)
    ```

### Triggers & Functions
#### 🔥 trigger_update_timestamp_items
- **Timing**: BEFORE
- **Events**: UPDATE
- **Function**: public.update_timestamp()

**Trigger Definition**:
```sql
CREATE TRIGGER trigger_update_timestamp_items BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE FUNCTION update_timestamp()

```

**Function Definition**:
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

## meal_allergies

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
CREATE TABLE public.meal_allergies (
    meal_id integer NOT NULL,
    allergy_id integer NOT NULL,
    CONSTRAINT meal_allergies_pkey PRIMARY KEY (meal_id, allergy_id)
);
```

### Constraints
- **FOREIGN KEY**: meal_allergies_allergy_id_fkey
  ```sql
  FOREIGN KEY (allergy_id) REFERENCES allergies(id) ON DELETE CASCADE
  ```
- **FOREIGN KEY**: meal_allergies_meal_id_fkey
  ```sql
  FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
  ```

### Indexes
- **UNIQUE**: meal_allergies_pkey
  - Columns: meal_id, allergy_id
  - Definition: ```sql
    CREATE UNIQUE INDEX meal_allergies_pkey ON public.meal_allergies USING btree (meal_id, allergy_id)
    ```

---

## meal_items

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
CREATE TABLE public.meal_items (
    meal_id integer NOT NULL,
    item_id integer NOT NULL,
    is_included boolean DEFAULT false NOT NULL,
    max_quantity integer DEFAULT 1 NOT NULL,
    CONSTRAINT meal_items_pkey PRIMARY KEY (meal_id, item_id)
);
```

### Constraints
- **CHECK**: meal_items_max_quantity_check
  ```sql
  CHECK ((max_quantity > 0))
  ```
- **FOREIGN KEY**: meal_items_meal_id_fkey
  ```sql
  FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
  ```
- **FOREIGN KEY**: meal_items_item_id_fkey
  ```sql
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
  ```

### Indexes
- **UNIQUE**: meal_items_pkey
  - Columns: meal_id, item_id
  - Definition: ```sql
    CREATE UNIQUE INDEX meal_items_pkey ON public.meal_items USING btree (meal_id, item_id)
    ```

---

## meal_reviews

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
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

### Constraints
- **FOREIGN KEY**: meal_reviews_order_id_fkey
  ```sql
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  ```
- **CHECK**: meal_reviews_rating_check
  ```sql
  CHECK (((rating >= 1) AND (rating <= 5)))
  ```
- **UNIQUE**: meal_reviews_user_id_meal_id_order_id_key
  ```sql
  UNIQUE (user_id, meal_id, order_id)
  ```
- **FOREIGN KEY**: meal_reviews_user_id_fkey
  ```sql
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
  ```
- **FOREIGN KEY**: meal_reviews_meal_id_fkey
  ```sql
  FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
  ```

### Indexes
- **UNIQUE**: meal_reviews_pkey
  - Columns: id
  - Definition: ```sql
    CREATE UNIQUE INDEX meal_reviews_pkey ON public.meal_reviews USING btree (id)
    ```
- **UNIQUE**: meal_reviews_user_id_meal_id_order_id_key
  - Columns: meal_id, rating
  - Definition: ```sql
    CREATE INDEX idx_meal_reviews_rating ON public.meal_reviews USING btree (meal_id, rating) WHERE (is_published = true)
    ```
- **UNIQUE**: meal_reviews_user_id_meal_id_order_id_key
  - Columns: meal_id, rating
  - Definition: ```sql
    CREATE INDEX idx_meal_reviews_rating ON public.meal_reviews USING btree (meal_id, rating) WHERE (is_published = true)
    ```

### Triggers & Functions
#### 🔥 trigger_update_meal_rating_insert
- **Timing**: AFTER
- **Events**: INSERT
- **Function**: public.update_meal_rating()

**Trigger Definition**:
```sql
CREATE TRIGGER trigger_update_meal_rating_insert AFTER INSERT ON public.meal_reviews FOR EACH ROW EXECUTE FUNCTION update_meal_rating()

```

**Function Definition**:
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
#### 🔥 trigger_update_meal_rating_update
- **Timing**: AFTER
- **Events**: UPDATE
- **Function**: public.update_meal_rating()

**Trigger Definition**:
```sql
CREATE TRIGGER trigger_update_meal_rating_update AFTER UPDATE ON public.meal_reviews FOR EACH ROW WHEN (((old.rating <> new.rating) OR (old.is_published <> new.is_published))) EXECUTE FUNCTION update_meal_rating()

```

**Function Definition**:
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
#### 🔥 trigger_update_timestamp_meal_reviews
- **Timing**: BEFORE
- **Events**: UPDATE
- **Function**: public.update_timestamp()

**Trigger Definition**:
```sql
CREATE TRIGGER trigger_update_timestamp_meal_reviews BEFORE UPDATE ON public.meal_reviews FOR EACH ROW EXECUTE FUNCTION update_timestamp()

```

**Function Definition**:
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

## meals

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
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

### Constraints
- **CHECK**: meals_calories_check
  ```sql
  CHECK ((calories >= 0))
  ```
- **CHECK**: meals_base_price_check
  ```sql
  CHECK ((base_price >= (0)::numeric))
  ```
- **CHECK**: meals_spice_level_check
  ```sql
  CHECK (((spice_level >= 0) AND (spice_level <= 5)))
  ```
- **CHECK**: meals_sugar_g_check
  ```sql
  CHECK ((sugar_g >= 0))
  ```
- **CHECK**: meals_rating_count_check
  ```sql
  CHECK ((rating_count >= 0))
  ```
- **CHECK**: meals_sodium_mg_check
  ```sql
  CHECK ((sodium_mg >= 0))
  ```
- **CHECK**: meals_rating_check
  ```sql
  CHECK (((rating >= (0)::numeric) AND (rating <= (5)::numeric)))
  ```
- **CHECK**: meals_protein_g_check
  ```sql
  CHECK ((protein_g >= 0))
  ```
- **CHECK**: meals_prep_time_minutes_check
  ```sql
  CHECK ((prep_time_minutes > 0))
  ```
- **CHECK**: meals_fiber_g_check
  ```sql
  CHECK ((fiber_g >= 0))
  ```
- **CHECK**: meals_fat_g_check
  ```sql
  CHECK ((fat_g >= 0))
  ```
- **CHECK**: meals_discount_percentage_check
  ```sql
  CHECK (((discount_percentage >= (0)::numeric) AND (discount_percentage <= (100)::numeric)))
  ```
- **CHECK**: meals_carbs_g_check
  ```sql
  CHECK ((carbs_g >= 0))
  ```

### Indexes
- **UNIQUE**: meals_pkey
  - Columns: is_vegetarian, is_vegan, is_gluten_free, is_dairy_free
  - Definition: ```sql
    CREATE INDEX idx_meals_dietary ON public.meals USING btree (is_vegetarian, is_vegan, is_gluten_free, is_dairy_free)
    ```
- **UNIQUE**: meals_pkey
  - Columns: is_vegetarian, is_vegan, is_gluten_free, is_dairy_free
  - Definition: ```sql
    CREATE INDEX idx_meals_dietary ON public.meals USING btree (is_vegetarian, is_vegan, is_gluten_free, is_dairy_free)
    ```
- **UNIQUE**: meals_pkey
  - Columns: is_vegetarian, is_vegan, is_gluten_free, is_dairy_free
  - Definition: ```sql
    CREATE INDEX idx_meals_dietary ON public.meals USING btree (is_vegetarian, is_vegan, is_gluten_free, is_dairy_free)
    ```
- **UNIQUE**: meals_pkey
  - Columns: is_vegetarian, is_vegan, is_gluten_free, is_dairy_free
  - Definition: ```sql
    CREATE INDEX idx_meals_dietary ON public.meals USING btree (is_vegetarian, is_vegan, is_gluten_free, is_dairy_free)
    ```
- **UNIQUE**: meals_pkey
  - Columns: is_vegetarian, is_vegan, is_gluten_free, is_dairy_free
  - Definition: ```sql
    CREATE INDEX idx_meals_dietary ON public.meals USING btree (is_vegetarian, is_vegan, is_gluten_free, is_dairy_free)
    ```
- **UNIQUE**: meals_pkey
  - Columns: is_vegetarian, is_vegan, is_gluten_free, is_dairy_free
  - Definition: ```sql
    CREATE INDEX idx_meals_dietary ON public.meals USING btree (is_vegetarian, is_vegan, is_gluten_free, is_dairy_free)
    ```
- **UNIQUE**: meals_pkey
  - Columns: is_vegetarian, is_vegan, is_gluten_free, is_dairy_free
  - Definition: ```sql
    CREATE INDEX idx_meals_dietary ON public.meals USING btree (is_vegetarian, is_vegan, is_gluten_free, is_dairy_free)
    ```

### Triggers & Functions
#### 🔥 trigger_update_timestamp_meals
- **Timing**: BEFORE
- **Events**: UPDATE
- **Function**: public.update_timestamp()

**Trigger Definition**:
```sql
CREATE TRIGGER trigger_update_timestamp_meals BEFORE UPDATE ON public.meals FOR EACH ROW EXECUTE FUNCTION update_timestamp()

```

**Function Definition**:
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

## order_items

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
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

### Constraints
- **FOREIGN KEY**: order_items_order_meal_id_fkey
  ```sql
  FOREIGN KEY (order_meal_id) REFERENCES order_meals(id) ON DELETE CASCADE
  ```
- **FOREIGN KEY**: order_items_item_id_fkey
  ```sql
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL
  ```
- **FOREIGN KEY**: order_items_order_id_fkey
  ```sql
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  ```
- **CHECK**: order_items_quantity_check
  ```sql
  CHECK ((quantity > 0))
  ```
- **CHECK**: order_items_total_price_check
  ```sql
  CHECK ((total_price >= (0)::numeric))
  ```
- **CHECK**: order_items_unit_price_check
  ```sql
  CHECK ((unit_price >= (0)::numeric))
  ```
- **CHECK**: valid_item_total
  ```sql
  CHECK ((total_price = (unit_price * (quantity)::numeric)))
  ```

### Indexes
- **UNIQUE**: order_items_pkey
  - Columns: id
  - Definition: ```sql
    CREATE UNIQUE INDEX order_items_pkey ON public.order_items USING btree (id)
    ```

---

## order_meals

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
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

### Constraints
- **CHECK**: order_meals_total_price_check
  ```sql
  CHECK ((total_price >= (0)::numeric))
  ```
- **FOREIGN KEY**: order_meals_meal_id_fkey
  ```sql
  FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE SET NULL
  ```
- **FOREIGN KEY**: order_meals_order_id_fkey
  ```sql
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  ```
- **CHECK**: order_meals_quantity_check
  ```sql
  CHECK ((quantity > 0))
  ```
- **CHECK**: valid_meal_total
  ```sql
  CHECK ((total_price = (unit_price * (quantity)::numeric)))
  ```
- **CHECK**: order_meals_unit_price_check
  ```sql
  CHECK ((unit_price >= (0)::numeric))
  ```

### Indexes
- **UNIQUE**: order_meals_pkey
  - Columns: id
  - Definition: ```sql
    CREATE UNIQUE INDEX order_meals_pkey ON public.order_meals USING btree (id)
    ```

---

## orders

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
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
    loyalty_points_used integer DEFAULT 0,
    loyalty_points_earned integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT orders_pkey PRIMARY KEY (id)
);
```

### Constraints
- **CHECK**: orders_tax_amount_check
  ```sql
  CHECK ((tax_amount >= (0)::numeric))
  ```
- **CHECK**: orders_subtotal_check
  ```sql
  CHECK ((subtotal >= (0)::numeric))
  ```
- **FOREIGN KEY**: orders_subscription_id_fkey
  ```sql
  FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE SET NULL
  ```
- **CHECK**: orders_payment_status_check
  ```sql
  CHECK ((payment_status = ANY (ARRAY['pending'::text, 'paid'::text, 'failed'::text, 'refunded'::text, 'partial_refund'::text])))
  ```
- **UNIQUE**: orders_order_number_key
  ```sql
  UNIQUE (order_number)
  ```
- **CHECK**: orders_loyalty_points_used_check
  ```sql
  CHECK ((loyalty_points_used >= 0))
  ```
- **CHECK**: orders_loyalty_points_earned_check
  ```sql
  CHECK ((loyalty_points_earned >= 0))
  ```
- **CHECK**: orders_discount_amount_check
  ```sql
  CHECK ((discount_amount >= (0)::numeric))
  ```
- **CHECK**: valid_total
  ```sql
  CHECK ((total_amount = (((subtotal + tax_amount) + delivery_fee) - discount_amount)))
  ```
- **CHECK**: orders_delivery_fee_check
  ```sql
  CHECK ((delivery_fee >= (0)::numeric))
  ```
- **FOREIGN KEY**: orders_delivery_address_id_fkey
  ```sql
  FOREIGN KEY (delivery_address_id) REFERENCES user_addresses(id)
  ```
- **FOREIGN KEY**: orders_user_id_fkey
  ```sql
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL
  ```
- **CHECK**: orders_total_amount_check
  ```sql
  CHECK ((total_amount >= (0)::numeric))
  ```

### Indexes
- **UNIQUE**: orders_pkey
  - Columns: id
  - Definition: ```sql
    CREATE UNIQUE INDEX orders_pkey ON public.orders USING btree (id)
    ```
- **UNIQUE**: orders_order_number_key
  - Columns: payment_status, paid_at
  - Definition: ```sql
    CREATE INDEX idx_orders_payment_stats ON public.orders USING btree (payment_status, paid_at) WHERE (payment_status = 'paid'::text)
    ```
- **UNIQUE**: orders_order_number_key
  - Columns: payment_status, paid_at
  - Definition: ```sql
    CREATE INDEX idx_orders_payment_stats ON public.orders USING btree (payment_status, paid_at) WHERE (payment_status = 'paid'::text)
    ```
- **UNIQUE**: orders_order_number_key
  - Columns: payment_status, paid_at
  - Definition: ```sql
    CREATE INDEX idx_orders_payment_stats ON public.orders USING btree (payment_status, paid_at) WHERE (payment_status = 'paid'::text)
    ```
- **UNIQUE**: orders_order_number_key
  - Columns: payment_status, paid_at
  - Definition: ```sql
    CREATE INDEX idx_orders_payment_stats ON public.orders USING btree (payment_status, paid_at) WHERE (payment_status = 'paid'::text)
    ```
- **UNIQUE**: orders_order_number_key
  - Columns: payment_status, paid_at
  - Definition: ```sql
    CREATE INDEX idx_orders_payment_stats ON public.orders USING btree (payment_status, paid_at) WHERE (payment_status = 'paid'::text)
    ```
- **UNIQUE**: orders_order_number_key
  - Columns: payment_status, paid_at
  - Definition: ```sql
    CREATE INDEX idx_orders_payment_stats ON public.orders USING btree (payment_status, paid_at) WHERE (payment_status = 'paid'::text)
    ```

### Triggers & Functions
#### 🔥 trigger_set_order_number
- **Timing**: BEFORE
- **Events**: INSERT
- **Function**: public.set_order_number()

**Trigger Definition**:
```sql
CREATE TRIGGER trigger_set_order_number BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION set_order_number()

```

**Function Definition**:
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
#### 🔥 trigger_update_timestamp_orders
- **Timing**: BEFORE
- **Events**: UPDATE
- **Function**: public.update_timestamp()

**Trigger Definition**:
```sql
CREATE TRIGGER trigger_update_timestamp_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_timestamp()

```

**Function Definition**:
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

## plan_meals

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
CREATE TABLE public.plan_meals (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    plan_id integer NOT NULL,
    meal_id integer NOT NULL,
    is_substitutable boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT plan_meals_pkey PRIMARY KEY (id)
);
```

### Constraints
- **FOREIGN KEY**: plan_meals_meal_id_fkey
  ```sql
  FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
  ```
- **FOREIGN KEY**: plan_meals_plan_id_fkey
  ```sql
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
  ```

### Indexes
- **UNIQUE**: plan_meals_pkey
  - Columns: id
  - Definition: ```sql
    CREATE UNIQUE INDEX plan_meals_pkey ON public.plan_meals USING btree (id)
    ```

---

## plans

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
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

### Constraints
- **CHECK**: plans_price_per_meal_check
  ```sql
  CHECK ((price_per_meal >= (0)::numeric))
  ```
- **CHECK**: plans_target_calories_per_meal_check
  ```sql
  CHECK ((kcal > 0))
  ```
- **CHECK**: plans_check
  ```sql
  CHECK ((medium_term_meals >= short_term_meals))
  ```
- **CHECK**: plans_target_protein_per_meal_check
  ```sql
  CHECK ((protein > 0))
  ```
- **CHECK**: plans_target_carbs_per_meal_check
  ```sql
  CHECK ((carb >= 0))
  ```
- **CHECK**: plans_min_meals_per_week_check
  ```sql
  CHECK ((short_term_meals > 0))
  ```

### Indexes
- **UNIQUE**: plans_pkey
  - Columns: id
  - Definition: ```sql
    CREATE UNIQUE INDEX plans_pkey ON public.plans USING btree (id)
    ```

### Triggers & Functions
#### 🔥 trigger_update_timestamp_plans
- **Timing**: BEFORE
- **Events**: UPDATE
- **Function**: public.update_timestamp()

**Trigger Definition**:
```sql
CREATE TRIGGER trigger_update_timestamp_plans BEFORE UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION update_timestamp()

```

**Function Definition**:
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

## spatial_ref_sys

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
CREATE TABLE public.spatial_ref_sys (
    srid integer NOT NULL,
    auth_name character varying(256),
    auth_srid integer,
    srtext character varying(2048),
    proj4text character varying(2048),
    CONSTRAINT spatial_ref_sys_pkey PRIMARY KEY (srid)
);
```

### Constraints
- **CHECK**: spatial_ref_sys_srid_check
  ```sql
  CHECK (((srid > 0) AND (srid <= 998999)))
  ```

### Indexes
- **UNIQUE**: spatial_ref_sys_pkey
  - Columns: srid
  - Definition: ```sql
    CREATE UNIQUE INDEX spatial_ref_sys_pkey ON public.spatial_ref_sys USING btree (srid)
    ```

---

## user_addresses

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
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

### Constraints
- **EXCLUDE**: only_one_default_address_per_user
  ```sql
  EXCLUDE USING btree (user_id WITH =) WHERE ((is_default = true))
  ```
- **FOREIGN KEY**: user_addresses_user_id_fkey
  ```sql
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
  ```

### Indexes
- **UNIQUE**: user_addresses_pkey
  - Columns: location
  - Definition: ```sql
    CREATE INDEX idx_user_addresses_location ON public.user_addresses USING gist (location) WHERE (location IS NOT NULL)
    ```
- **UNIQUE**: user_addresses_pkey
  - Columns: location
  - Definition: ```sql
    CREATE INDEX idx_user_addresses_location ON public.user_addresses USING gist (location) WHERE (location IS NOT NULL)
    ```
- **UNIQUE**: user_addresses_pkey
  - Columns: location
  - Definition: ```sql
    CREATE INDEX idx_user_addresses_location ON public.user_addresses USING gist (location) WHERE (location IS NOT NULL)
    ```
- **UNIQUE**: user_addresses_pkey
  - Columns: location
  - Definition: ```sql
    CREATE INDEX idx_user_addresses_location ON public.user_addresses USING gist (location) WHERE (location IS NOT NULL)
    ```

### Triggers & Functions
#### 🔥 trigger_update_timestamp_user_addresses
- **Timing**: BEFORE
- **Events**: UPDATE
- **Function**: public.update_timestamp()

**Trigger Definition**:
```sql
CREATE TRIGGER trigger_update_timestamp_user_addresses BEFORE UPDATE ON public.user_addresses FOR EACH ROW EXECUTE FUNCTION update_timestamp()

```

**Function Definition**:
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

## user_allergies

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
CREATE TABLE public.user_allergies (
    user_id uuid NOT NULL,
    allergy_id integer NOT NULL,
    severity_override integer,
    CONSTRAINT user_allergies_pkey PRIMARY KEY (user_id, allergy_id)
);
```

### Constraints
- **FOREIGN KEY**: user_allergies_user_id_fkey
  ```sql
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
  ```
- **CHECK**: user_allergies_severity_override_check
  ```sql
  CHECK (((severity_override >= 1) AND (severity_override <= 5)))
  ```
- **FOREIGN KEY**: user_allergies_allergy_id_fkey
  ```sql
  FOREIGN KEY (allergy_id) REFERENCES allergies(id) ON DELETE CASCADE
  ```

### Indexes
- **UNIQUE**: user_allergies_pkey
  - Columns: user_id, allergy_id
  - Definition: ```sql
    CREATE UNIQUE INDEX user_allergies_pkey ON public.user_allergies USING btree (user_id, allergy_id)
    ```

---

## user_dietary_preferences

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
CREATE TABLE public.user_dietary_preferences (
    user_id uuid NOT NULL,
    preference_id integer NOT NULL,
    CONSTRAINT user_dietary_preferences_pkey PRIMARY KEY (user_id, preference_id)
);
```

### Constraints
- **FOREIGN KEY**: user_dietary_preferences_preference_id_fkey
  ```sql
  FOREIGN KEY (preference_id) REFERENCES dietary_preferences(id) ON DELETE CASCADE
  ```
- **FOREIGN KEY**: user_dietary_preferences_user_id_fkey
  ```sql
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
  ```

### Indexes
- **UNIQUE**: user_dietary_preferences_pkey
  - Columns: user_id, preference_id
  - Definition: ```sql
    CREATE UNIQUE INDEX user_dietary_preferences_pkey ON public.user_dietary_preferences USING btree (user_id, preference_id)
    ```

---

## user_favorite_items

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
CREATE TABLE public.user_favorite_items (
    user_id uuid NOT NULL,
    item_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_favorite_items_pkey PRIMARY KEY (user_id, item_id)
);
```

### Constraints
- **FOREIGN KEY**: user_favorite_items_user_id_fkey
  ```sql
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
  ```
- **FOREIGN KEY**: user_favorite_items_item_id_fkey
  ```sql
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
  ```

### Indexes
- **UNIQUE**: user_favorite_items_pkey
  - Columns: user_id, item_id
  - Definition: ```sql
    CREATE UNIQUE INDEX user_favorite_items_pkey ON public.user_favorite_items USING btree (user_id, item_id)
    ```

---

## user_favorite_meals

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
CREATE TABLE public.user_favorite_meals (
    user_id uuid NOT NULL,
    meal_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_favorite_meals_pkey PRIMARY KEY (user_id, meal_id)
);
```

### Constraints
- **FOREIGN KEY**: user_favorite_meals_user_id_fkey
  ```sql
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
  ```
- **FOREIGN KEY**: user_favorite_meals_meal_id_fkey
  ```sql
  FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE
  ```

### Indexes
- **UNIQUE**: user_favorite_meals_pkey
  - Columns: user_id, meal_id
  - Definition: ```sql
    CREATE UNIQUE INDEX user_favorite_meals_pkey ON public.user_favorite_meals USING btree (user_id, meal_id)
    ```

---

## user_health_profiles

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
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

### Constraints
- **CHECK**: user_health_profiles_target_calories_check
  ```sql
  CHECK ((target_calories > 0))
  ```
- **CHECK**: user_health_profiles_target_protein_check
  ```sql
  CHECK ((target_protein > 0))
  ```
- **CHECK**: user_health_profiles_weight_kg_check
  ```sql
  CHECK (((weight_kg > (0)::numeric) AND (weight_kg < (500)::numeric)))
  ```
- **CHECK**: user_health_profiles_height_cm_check
  ```sql
  CHECK (((height_cm > (0)::numeric) AND (height_cm < (300)::numeric)))
  ```
- **FOREIGN KEY**: user_health_profiles_user_id_fkey
  ```sql
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
  ```

### Indexes
- **UNIQUE**: user_health_profiles_pkey
  - Columns: user_id
  - Definition: ```sql
    CREATE UNIQUE INDEX user_health_profiles_pkey ON public.user_health_profiles USING btree (user_id)
    ```

### Triggers & Functions
#### 🔥 trigger_update_timestamp_user_health_profiles
- **Timing**: BEFORE
- **Events**: UPDATE
- **Function**: public.update_timestamp()

**Trigger Definition**:
```sql
CREATE TRIGGER trigger_update_timestamp_user_health_profiles BEFORE UPDATE ON public.user_health_profiles FOR EACH ROW EXECUTE FUNCTION update_timestamp()

```

**Function Definition**:
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

## user_notification_preferences

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
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

### Constraints
- **FOREIGN KEY**: user_notification_preferences_user_id_fkey
  ```sql
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
  ```

### Indexes
- **UNIQUE**: user_notification_preferences_pkey
  - Columns: user_id
  - Definition: ```sql
    CREATE UNIQUE INDEX user_notification_preferences_pkey ON public.user_notification_preferences USING btree (user_id)
    ```

### Triggers & Functions
#### 🔥 trigger_update_timestamp_user_notification_preferences
- **Timing**: BEFORE
- **Events**: UPDATE
- **Function**: public.update_timestamp()

**Trigger Definition**:
```sql
CREATE TRIGGER trigger_update_timestamp_user_notification_preferences BEFORE UPDATE ON public.user_notification_preferences FOR EACH ROW EXECUTE FUNCTION update_timestamp()

```

**Function Definition**:
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

## user_payment_methods

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
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

### Constraints
- **CHECK**: user_payment_methods_expiry_year_check
  ```sql
  CHECK (((expiry_year)::numeric >= EXTRACT(year FROM now())))
  ```
- **CHECK**: user_payment_methods_expiry_month_check
  ```sql
  CHECK (((expiry_month >= 1) AND (expiry_month <= 12)))
  ```
- **FOREIGN KEY**: user_payment_methods_user_id_fkey
  ```sql
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
  ```
- **EXCLUDE**: only_one_default_payment_per_user
  ```sql
  EXCLUDE USING btree (user_id WITH =) WHERE ((is_default = true))
  ```

### Indexes
- **UNIQUE**: user_payment_methods_pkey
  - Columns: user_id
  - Definition: ```sql
    CREATE INDEX only_one_default_payment_per_user ON public.user_payment_methods USING btree (user_id) WHERE (is_default = true)
    ```
- **UNIQUE**: user_payment_methods_pkey
  - Columns: user_id
  - Definition: ```sql
    CREATE INDEX only_one_default_payment_per_user ON public.user_payment_methods USING btree (user_id) WHERE (is_default = true)
    ```

### Triggers & Functions
#### 🔥 trigger_update_timestamp_user_payment_methods
- **Timing**: BEFORE
- **Events**: UPDATE
- **Function**: public.update_timestamp()

**Trigger Definition**:
```sql
CREATE TRIGGER trigger_update_timestamp_user_payment_methods BEFORE UPDATE ON public.user_payment_methods FOR EACH ROW EXECUTE FUNCTION update_timestamp()

```

**Function Definition**:
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

## user_profiles

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
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

### Constraints
- **CHECK**: user_profiles_loyalty_points_check
  ```sql
  CHECK ((loyalty_points >= 0))
  ```
- **CHECK**: user_profiles_language_check
  ```sql
  CHECK ((language = ANY (ARRAY['en'::bpchar, 'ar'::bpchar])))
  ```
- **UNIQUE**: user_profiles_id_key
  ```sql
  UNIQUE (id)
  ```
- **CHECK**: user_profiles_gender_check
  ```sql
  CHECK ((gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text, 'prefer_not_to_say'::text])))
  ```
- **CHECK**: user_profiles_age_check
  ```sql
  CHECK (((age > 0) AND (age < 150)))
  ```

### Indexes
- **UNIQUE**: user_profiles_pkey
  - Columns: last_login
  - Definition: ```sql
    CREATE INDEX idx_user_profiles_last_login ON public.user_profiles USING btree (last_login DESC)
    ```
- **UNIQUE**: user_profiles_pkey
  - Columns: last_login
  - Definition: ```sql
    CREATE INDEX idx_user_profiles_last_login ON public.user_profiles USING btree (last_login DESC)
    ```
- **UNIQUE**: user_profiles_pkey
  - Columns: last_login
  - Definition: ```sql
    CREATE INDEX idx_user_profiles_last_login ON public.user_profiles USING btree (last_login DESC)
    ```
- **UNIQUE**: user_profiles_pkey
  - Columns: last_login
  - Definition: ```sql
    CREATE INDEX idx_user_profiles_last_login ON public.user_profiles USING btree (last_login DESC)
    ```
- **UNIQUE**: user_profiles_id_key
  - Columns: google_id
  - Definition: ```sql
    CREATE INDEX idx_user_profiles_google_id ON public.user_profiles USING btree (google_id)
    ```
- **UNIQUE**: user_profiles_id_key
  - Columns: google_id
  - Definition: ```sql
    CREATE INDEX idx_user_profiles_google_id ON public.user_profiles USING btree (google_id)
    ```
- **UNIQUE**: user_profiles_id_key
  - Columns: google_id
  - Definition: ```sql
    CREATE INDEX idx_user_profiles_google_id ON public.user_profiles USING btree (google_id)
    ```

### Triggers & Functions
#### 🔥 trigger_update_timestamp_user_profiles
- **Timing**: BEFORE
- **Events**: UPDATE
- **Function**: public.update_timestamp()

**Trigger Definition**:
```sql
CREATE TRIGGER trigger_update_timestamp_user_profiles BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_timestamp()

```

**Function Definition**:
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

## user_subscriptions

### Table Definition
```sql
1️⃣  CREATE TABLE Definition
-------------------------------------------------
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

### Constraints
- **CHECK**: user_subscriptions_total_meals_check
  ```sql
  CHECK ((total_meals > 0))
  ```
- **CHECK**: user_subscriptions_price_per_meal_check
  ```sql
  CHECK ((price_per_meal >= (0)::numeric))
  ```
- **FOREIGN KEY**: user_subscriptions_plan_id_fkey
  ```sql
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT
  ```
- **FOREIGN KEY**: user_subscriptions_payment_method_id_fkey
  ```sql
  FOREIGN KEY (payment_method_id) REFERENCES user_payment_methods(id)
  ```
- **FOREIGN KEY**: user_subscriptions_delivery_address_id_fkey
  ```sql
  FOREIGN KEY (delivery_address_id) REFERENCES user_addresses(id)
  ```
- **CHECK**: user_subscriptions_consumed_meals_check
  ```sql
  CHECK ((consumed_meals >= 0))
  ```
- **CHECK**: consumed_not_exceed_total
  ```sql
  CHECK ((consumed_meals <= total_meals))
  ```
- **CHECK**: valid_pause_logic
  ```sql
  CHECK (((is_paused = false) OR ((is_paused = true) AND (paused_at IS NOT NULL))))
  ```
- **CHECK**: valid_end_date
  ```sql
  CHECK (((end_date IS NULL) OR (end_date > start_date)))
  ```
- **FOREIGN KEY**: user_subscriptions_user_id_fkey
  ```sql
  FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
  ```

### Indexes
- **UNIQUE**: user_subscriptions_pkey
  - Columns: user_id, status, next_delivery_date
  - Definition: ```sql
    CREATE INDEX idx_subscriptions_user_status_next_delivery ON public.user_subscriptions USING btree (user_id, status, next_delivery_date)
    ```
- **UNIQUE**: user_subscriptions_pkey
  - Columns: user_id, status, next_delivery_date
  - Definition: ```sql
    CREATE INDEX idx_subscriptions_user_status_next_delivery ON public.user_subscriptions USING btree (user_id, status, next_delivery_date)
    ```
- **UNIQUE**: user_subscriptions_pkey
  - Columns: user_id, status, next_delivery_date
  - Definition: ```sql
    CREATE INDEX idx_subscriptions_user_status_next_delivery ON public.user_subscriptions USING btree (user_id, status, next_delivery_date)
    ```
- **UNIQUE**: user_subscriptions_pkey
  - Columns: user_id, status, next_delivery_date
  - Definition: ```sql
    CREATE INDEX idx_subscriptions_user_status_next_delivery ON public.user_subscriptions USING btree (user_id, status, next_delivery_date)
    ```
- **UNIQUE**: user_subscriptions_pkey
  - Columns: user_id, status, next_delivery_date
  - Definition: ```sql
    CREATE INDEX idx_subscriptions_user_status_next_delivery ON public.user_subscriptions USING btree (user_id, status, next_delivery_date)
    ```
- **UNIQUE**: user_subscriptions_pkey
  - Columns: user_id, status, next_delivery_date
  - Definition: ```sql
    CREATE INDEX idx_subscriptions_user_status_next_delivery ON public.user_subscriptions USING btree (user_id, status, next_delivery_date)
    ```
- **UNIQUE**: user_subscriptions_pkey
  - Columns: user_id, status, next_delivery_date
  - Definition: ```sql
    CREATE INDEX idx_subscriptions_user_status_next_delivery ON public.user_subscriptions USING btree (user_id, status, next_delivery_date)
    ```
- **UNIQUE**: user_subscriptions_pkey
  - Columns: user_id, status, next_delivery_date
  - Definition: ```sql
    CREATE INDEX idx_subscriptions_user_status_next_delivery ON public.user_subscriptions USING btree (user_id, status, next_delivery_date)
    ```

### Triggers & Functions
#### 🔥 trigger_delivery_completion_after
- **Timing**: AFTER
- **Events**: UPDATE
- **Function**: public.handle_delivery_completion()

**Trigger Definition**:
```sql
CREATE TRIGGER trigger_delivery_completion_after AFTER UPDATE ON public.user_subscriptions FOR EACH ROW WHEN ((old.next_delivery_status IS DISTINCT FROM new.next_delivery_status)) EXECUTE FUNCTION handle_delivery_completion()

```

**Function Definition**:
```sql
CREATE OR REPLACE FUNCTION public.handle_delivery_completion()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_next_delivery_date timestamp with time zone;
    v_meal_delivery_info record;
    v_meals_to_add integer;
    v_remaining_meals integer;
BEGIN
    -- Check if delivery status changed to 'delivered'
    IF TG_OP = 'UPDATE' AND 
       OLD.next_delivery_status != 'delivered' AND 
       NEW.next_delivery_status = 'delivered' THEN
        -- Determine meals to add (default to 1 if next_delivery_meals is null)
        v_meals_to_add := COALESCE(OLD.next_delivery_meals, 1);
        -- Add to delivery history
        PERFORM add_delivery_to_history(
            NEW.id,
            OLD.next_delivery_date,
            v_meals_to_add,
            'delivered'
        );
        -- Update consumed meals and calculate remaining meals
        UPDATE user_subscriptions 
        SET consumed_meals = LEAST(consumed_meals + v_meals_to_add, total_meals)
        WHERE id = NEW.id
        RETURNING (total_meals - consumed_meals) INTO v_remaining_meals;
        RAISE NOTICE 'Delivery completed for subscription %, consumed meals updated by %, remaining meals: %', 
                     NEW.id, v_meals_to_add, v_remaining_meals;
    -- Alternative: Handle ANY change to next_delivery_meals (not just status change)
    ELSIF TG_OP = 'UPDATE' AND 
          OLD.next_delivery_meals IS DISTINCT FROM NEW.next_delivery_meals AND 
          NEW.next_delivery_meals IS NOT NULL THEN
        -- This handles updates to next_delivery_meals regardless of status
        -- Increment consumed_meals by 1 as requested
        UPDATE user_subscriptions 
        SET consumed_meals = LEAST(consumed_meals + 1, total_meals)
        WHERE id = NEW.id
        RETURNING (total_meals - consumed_meals) INTO v_remaining_meals;
        RAISE NOTICE 'Next delivery meals updated for subscription %, consumed meals incremented by 1, remaining meals: %', 
                     NEW.id, v_remaining_meals;
    END IF;
    RETURN NEW;
END;
$function$

```
#### 🔥 trigger_subscription_lifecycle_before
- **Timing**: BEFORE
- **Events**: INSERT, UPDATE
- **Function**: public.handle_subscription_lifecycle()

**Trigger Definition**:
```sql
CREATE TRIGGER trigger_subscription_lifecycle_before BEFORE INSERT OR UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION handle_subscription_lifecycle()

```

**Function Definition**:
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
#### 🔥 trigger_update_timestamp_user_subscriptions
- **Timing**: BEFORE
- **Events**: UPDATE
- **Function**: public.update_timestamp()

**Trigger Definition**:
```sql
CREATE TRIGGER trigger_update_timestamp_user_subscriptions BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_timestamp()

```

**Function Definition**:
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

