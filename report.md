# Database Schema Documentation

## Table: allergies

### 📋 Table Definition
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

### 🔗 Constraints
- **allergies_severity_level_check** (CHECK)
  - `CHECK (((severity_level >= 1) AND (severity_level <= 5)))`
- **allergies_name_key** (UNIQUE)
  - `UNIQUE (name)`

### 📊 Indexes
- **allergies_pkey** (UNIQUE, PRIMARY KEY)
  - Columns: id
  - Definition: `CREATE UNIQUE INDEX allergies_pkey ON public.allergies USING btree (id)`
- **allergies_name_key** (UNIQUE)
  - Columns: name
  - Definition: `CREATE UNIQUE INDEX allergies_name_key ON public.allergies USING btree (name)`

---

## Table: dietary_preferences

### 📋 Table Definition
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

### 🔗 Constraints
- **dietary_preferences_name_key** (UNIQUE)
  - `UNIQUE (name)`

### 📊 Indexes
- **dietary_preferences_pkey** (UNIQUE, PRIMARY KEY)
  - Columns: id
  - Definition: `CREATE UNIQUE INDEX dietary_preferences_pkey ON public.dietary_preferences USING btree (id)`
- **dietary_preferences_name_key** (UNIQUE)
  - Columns: name
  - Definition: `CREATE UNIQUE INDEX dietary_preferences_name_key ON public.dietary_preferences USING btree (name)`

---

## Table: item_allergies

### 📋 Table Definition
```sql
CREATE TABLE public.item_allergies (
    item_id integer NOT NULL,
    allergy_id integer NOT NULL,
    CONSTRAINT item_allergies_pkey PRIMARY KEY (item_id, allergy_id)
);
```

### 🔗 Constraints
- **item_allergies_item_id_fkey** (FOREIGN KEY)
  - `FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE`
- **item_allergies_allergy_id_fkey** (FOREIGN KEY)
  - `FOREIGN KEY (allergy_id) REFERENCES allergies(id) ON DELETE CASCADE`

### 📊 Indexes
- **item_allergies_pkey** (UNIQUE, PRIMARY KEY)
  - Columns: item_id, allergy_id
  - Definition: `CREATE UNIQUE INDEX item_allergies_pkey ON public.item_allergies USING btree (item_id, allergy_id)`

---

## Table: items

### 📋 Table Definition
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

### 🔗 Constraints
- **items_fat_g_check** (CHECK)
  - `CHECK ((fat_g >= 0))`
- **items_max_free_per_meal_check** (CHECK)
  - `CHECK ((max_free_per_meal >= 0))`
- **items_price_check** (CHECK)
  - `CHECK ((price >= ((0)::numeric)::double precision))`
- **items_protein_g_check** (CHECK)
  - `CHECK ((protein_g >= 0))`
- **items_calories_check** (CHECK)
  - `CHECK ((calories >= 0))`
- **items_carbs_g_check** (CHECK)
  - `CHECK ((carbs_g >= 0))`

### 📊 Indexes
- **items_pkey** (UNIQUE, PRIMARY KEY)
  - Columns: id
  - Definition: `CREATE UNIQUE INDEX items_pkey ON public.items USING btree (id)`

### ⚡ Triggers & Functions
- **trigger_update_timestamp_items**
  - Timing: BEFORE
  - Events: UPDATE
  - Function: `public.update_timestamp()`
  - Definition:
    ```sql
    CREATE TRIGGER trigger_update_timestamp_items 
    BEFORE UPDATE ON public.items 
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    ```

- **update_timestamp() Function**
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

### 📋 Table Definition
```sql
CREATE TABLE public.meal_allergies (
    meal_id integer NOT NULL,
    allergy_id integer NOT NULL,
    CONSTRAINT meal_allergies_pkey PRIMARY KEY (meal_id, allergy_id)
);
```

### 🔗 Constraints
- **meal_allergies_allergy_id_fkey** (FOREIGN KEY)
  - `FOREIGN KEY (allergy_id) REFERENCES allergies(id) ON DELETE CASCADE`
- **meal_allergies_meal_id_fkey** (FOREIGN KEY)
  - `FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE`

### 📊 Indexes
- **meal_allergies_pkey** (UNIQUE, PRIMARY KEY)
  - Columns: meal_id, allergy_id
  - Definition: `CREATE UNIQUE INDEX meal_allergies_pkey ON public.meal_allergies USING btree (meal_id, allergy_id)`

---

## Table: meal_items

### 📋 Table Definition
```sql
CREATE TABLE public.meal_items (
    meal_id integer NOT NULL,
    item_id integer NOT NULL,
    is_included boolean DEFAULT false NOT NULL,
    max_quantity integer DEFAULT 1 NOT NULL,
    CONSTRAINT meal_items_pkey PRIMARY KEY (meal_id, item_id)
);
```

### 🔗 Constraints
- **meal_items_max_quantity_check** (CHECK)
  - `CHECK ((max_quantity > 0))`
- **meal_items_meal_id_fkey** (FOREIGN KEY)
  - `FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE`
- **meal_items_item_id_fkey** (FOREIGN KEY)
  - `FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE`

### 📊 Indexes
- **meal_items_pkey** (UNIQUE, PRIMARY KEY)
  - Columns: meal_id, item_id
  - Definition: `CREATE UNIQUE INDEX meal_items_pkey ON public.meal_items USING btree (meal_id, item_id)`

---

## Table: meal_reviews

### 📋 Table Definition
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

### 🔗 Constraints
- **meal_reviews_order_id_fkey** (FOREIGN KEY)
  - `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE`
- **meal_reviews_rating_check** (CHECK)
  - `CHECK (((rating >= 1) AND (rating <= 5)))`
- **meal_reviews_user_id_meal_id_order_id_key** (UNIQUE)
  - `UNIQUE (user_id, meal_id, order_id)`
- **meal_reviews_user_id_fkey** (FOREIGN KEY)
  - `FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE`
- **meal_reviews_meal_id_fkey** (FOREIGN KEY)
  - `FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE`

### 📊 Indexes
- **meal_reviews_pkey** (UNIQUE, PRIMARY KEY)
  - Columns: id
  - Definition: `CREATE UNIQUE INDEX meal_reviews_pkey ON public.meal_reviews USING btree (id)`
- **meal_reviews_user_id_meal_id_order_id_key** (UNIQUE)
  - Columns: user_id, meal_id, order_id
  - Definition: `CREATE UNIQUE INDEX meal_reviews_user_id_meal_id_order_id_key ON public.meal_reviews USING btree (user_id, meal_id, order_id)`
- **idx_meal_reviews_rating**
  - Columns: meal_id, rating
  - Definition: `CREATE INDEX idx_meal_reviews_rating ON public.meal_reviews USING btree (meal_id, rating) WHERE (is_published = true)`

### ⚡ Triggers & Functions
- **trigger_update_meal_rating_insert**
  - Timing: AFTER
  - Events: INSERT
  - Function: `public.update_meal_rating()`
  - Definition:
    ```sql
    CREATE TRIGGER trigger_update_meal_rating_insert 
    AFTER INSERT ON public.meal_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_meal_rating();
    ```

- **trigger_update_meal_rating_update**
  - Timing: AFTER
  - Events: UPDATE
  - Function: `public.update_meal_rating()`
  - Definition:
    ```sql
    CREATE TRIGGER trigger_update_meal_rating_update 
    AFTER UPDATE ON public.meal_reviews 
    FOR EACH ROW WHEN (((old.rating <> new.rating) OR (old.is_published <> new.is_published))) 
    EXECUTE FUNCTION update_meal_rating();
    ```

- **update_meal_rating() Function**
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

- **trigger_update_timestamp_meal_reviews**
  - Timing: BEFORE
  - Events: UPDATE
  - Function: `public.update_timestamp()`
  - Definition:
    ```sql
    CREATE TRIGGER trigger_update_timestamp_meal_reviews 
    BEFORE UPDATE ON public.meal_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    ```

---

## Table: meals

### 📋 Table Definition
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

### 🔗 Constraints
- **meals_calories_check** (CHECK)
  - `CHECK ((calories >= 0))`
- **meals_base_price_check** (CHECK)
  - `CHECK ((base_price >= (0)::numeric))`
- **meals_spice_level_check** (CHECK)
  - `CHECK (((spice_level >= 0) AND (spice_level <= 5)))`
- **meals_sugar_g_check** (CHECK)
  - `CHECK ((sugar_g >= 0))`
- **meals_rating_count_check** (CHECK)
  - `CHECK ((rating_count >= 0))`
- **meals_sodium_mg_check** (CHECK)
  - `CHECK ((sodium_mg >= 0))`
- **meals_rating_check** (CHECK)
  - `CHECK (((rating >= (0)::numeric) AND (rating <= (5)::numeric)))`
- **meals_protein_g_check** (SHECK)
  - `CHECK ((protein_g >= 0))`
- **meals_prep_time_minutes_check** (CHECK)
  - `CHECK ((prep_time_minutes > 0))`
- **meals_fiber_g_check** (CHECK)
  - `CHECK ((fiber_g >= 0))`
- **meals_fat_g_check** (CHECK)
  - `CHECK ((fat_g >= 0))`
- **meals_discount_percentage_check** (CHECK)
  - `CHECK (((discount_percentage >= (0)::numeric) AND (discount_percentage <= (100)::numeric)))`
- **meals_carbs_g_check** (CHECK)
  - `CHECK ((carbs_g >= 0))`

### 📊 Indexes
- **meals_pkey** (UNIQUE, PRIMARY KEY)
  - Columns: id
  - Definition: `CREATE UNIQUE INDEX meals_pkey ON public.meals USING btree (id)`
- **idx_meals_discount**
  - Columns: discount_percentage, discount_valid_until
  - Definition: `CREATE INDEX idx_meals_discount ON public.meals USING btree (discount_percentage, discount_valid_until) WHERE ((discount_percentage > (0)::numeric) AND (discount_valid_until > '2023-10-01 00:00:00+00'::timestamp with time zone))`
- **idx_meals_available_featured**
  - Columns: is_available, is_featured
  - Definition: `CREATE INDEX idx_meals_available_featured ON public.meals USING btree (is_available, is_featured) WHERE (is_available = true)`
- **idx_meals_calories**
  - Columns: calories
  - Definition: `CREATE INDEX idx_meals_calories ON public.meals USING btree (calories)`
- **idx_meals_protein**
  - Columns: protein_g
  - Definition: `CREATE INDEX idx_meals_protein ON public.meals USING btree (protein_g)`
- **idx_meals_rating**
  - Columns: rating
  - Definition: `CREATE INDEX idx_meals_rating ON public.meals USING btree (rating DESC) WHERE (rating IS NOT NULL)`
- **idx_meals_dietary**
  - Columns: is_vegetarian, is_vegan, is_gluten_free, is_dairy_free
  - Definition: `CREATE INDEX idx_meals_dietary ON public.meals USING btree (is_vegetarian, is_vegan, is_gluten_free, is_dairy_free)`

### ⚡ Triggers & Functions
- **trigger_update_timestamp_meals**
  - Timing: BEFORE
  - Events: UPDATE
  - Function: `public.update_timestamp()`
  - Definition:
    ```sql
    CREATE TRIGGER trigger_update_timestamp_meals 
    BEFORE UPDATE ON public.meals 
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    ```

---

## Table: order_items

### 📋 Table Definition
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

### 🔗 Constraints
- **order_items_order_meal_id_fkey** (FOREIGN KEY)
  - `FOREIGN KEY (order_meal_id) REFERENCES order_meals(id) ON DELETE CASCADE`
- **order_items_item_id_fkey** (FOREIGN KEY)
  - `FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL`
- **order_items_order_id_fkey** (FOREIGN KEY)
  - `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE`
- **order_items_quantity_check** (CHECK)
  - `CHECK ((quantity > 0))`
- **order_items_total_price_check**