# The following doc is a manifestation for the desired new subsicription system I want to create orders in the number of total meals in the user_subscriptions, I have orders table and its junction tables: 
NOTE THAT the existing definitions are for existent schema, the comments combines between existent comments and desired changes, I prefer to drp the entire tables and recreat them with new constraints, indexes and triggers you shold start with SQL part.
### Input data sample on creating new subscription:
Creating subscription for user: e0054437-50c7-48b5-a388-dbd1da9f7c94 
{plan_id: 3, status: 'pending', start_date: '2025-09-14', end_date: '2025-09-29', price_per_meal: 22, …}
auto_renewal
: 
false
consumed_meals
: 
0
delivery_address_id
: 
null
delivery_days
: 
Array(12)
0
: 
"2025-09-14"
1
: 
"2025-09-15"
2
: 
"2025-09-16"
3
: 
"2025-09-17"
4
: 
"2025-09-18"
5
: 
"2025-09-21"
6
: 
"2025-09-22"
7
: 
"2025-09-23"
8
: 
"2025-09-24"
9
: 
"2025-09-25"
10
: 
"2025-09-28"
11
: 
"2025-09-29"
length
: 
12
[[Prototype]]
: 
Array(0)
end_date
: 
"2025-09-29"
meals
: 
Array(5)
0
: 
25
: 
1
[[Prototype]]
: 
Object
1
: 
{25: 1}
2
: 
{25: 1}
3
: 
{42: 1}
4
: 
{42: 1}
length
: 
5
[[Prototype]]
: 
Array(0)
payment_method_id
: 
null
plan_id
: 
3
preferred_delivery_time
: 
"14:00-15:00"
price_per_meal
: 
22
start_date
: 
"2025-09-14"
status
: 
"pending"
total_meals
: 
12
### Table Definition with comments of desired changes.

```sql

1️⃣ CREATE  TABLE  Definition

-------------------------------------------------

CREATE  TABLE  public.user_subscriptions (
id uuid DEFAULT uuid_generate_v4() NOT NULL,
user_id uuid NOT NULL, 
plan_id integer  NOT NULL,
status subscription_status_enum DEFAULT'pending'::subscription_status_enum NOT NULL,
start_date  date  NOT NULL,
end_date date,
price_per_meal numeric(10,2) NOT NULL,
total_meals integer  NOT NULL,
consumed_meals integer  DEFAULT  0  NOT NULL,
delivery_address_id uuid, //retrieved from user_addresses
preferred_delivery_time time without time zone  DEFAULT  '12:00:00'::time without time zone  NOT NULL,

auto_renewal boolean  DEFAULT false NOT NULL,
payment_method_id uuid, // from user_payment_methods
is_paused boolean  DEFAULT true NOT NULL, //drop
paused_at timestamp with time zone, //drop
pause_reason text Default 'auto', // drop
resume_date timestamp with time zone, //drop

created_at timestamp with time zone  DEFAULT  now() NOT NULL,
updated_at timestamp with time zone  DEFAULT  now() NOT NULL,
additives integer[], // drop
delivery_days timestamp with time zone[], //drop

meals json[], // existing format of each meal is {item id from items table: selected items count}
next_delivery_date timestamp with time zone, //drop
next_delivery_status text, //drop

delivery_history jsonb DEFAULT  '[]'::jsonb, // drop

next_delivery_meal integer default 0, // refers to an index in meals switch


CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id)

);

```

  

### Constraints

-  **CHECK**: user_subscriptions_total_meals_check

```sql

CHECK ((total_meals > 0))

```

-  **CHECK**: user_subscriptions_price_per_meal_check

```sql

CHECK ((price_per_meal >= (0)::numeric))

```

-  **FOREIGN KEY**: user_subscriptions_plan_id_fkey

```sql

FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT

```

-  **FOREIGN KEY**: user_subscriptions_payment_method_id_fkey

```sql

FOREIGN KEY (payment_method_id) REFERENCES user_payment_methods(id)

```

-  **FOREIGN KEY**: user_subscriptions_delivery_address_id_fkey

```sql

FOREIGN KEY (delivery_address_id) REFERENCES user_addresses(id)

```

-  **CHECK**: user_subscriptions_consumed_meals_check

```sql

CHECK ((consumed_meals >= 0))

```

-  **CHECK**: consumed_not_exceed_total

```sql

CHECK ((consumed_meals <= total_meals))

```

-  **CHECK**: valid_pause_logic

```sql

CHECK (((is_paused = false) OR ((is_paused = true) 
// drop this part "AND (paused_at IS NOT NULL))))"

```

-  **CHECK**: valid_end_date

```sql

CHECK (((end_date IS  NULL) OR (end_date > start_date)))

```

-  **FOREIGN KEY**: user_subscriptions_user_id_fkey

```sql

FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE

```

  

### Indexes

-  **UNIQUE**: user_subscriptions_pkey

```
The entire next delivery data it would be replaced br orders table records with subscription id:
- Columns: user_id, status, next_delivery_date

- Definition: ```sql

CREATE INDEX idx_subscriptions_user_status_next_delivery ON public.user_subscriptions USING btree (user_id, status, next_delivery_date)

```

-  **UNIQUE**: user_subscriptions_pkey

- Columns: user_id, status, next_delivery_date

- Definition: ```sql

CREATE INDEX idx_subscriptions_user_status_next_delivery ON public.user_subscriptions USING btree (user_id, status, next_delivery_date)

```

-  **UNIQUE**: user_subscriptions_pkey

- Columns: user_id, status, next_delivery_date

- Definition: ```sql

CREATE INDEX idx_subscriptions_user_status_next_delivery ON public.user_subscriptions USING btree (user_id, status, next_delivery_date)

```

-  **UNIQUE**: user_subscriptions_pkey

- Columns: user_id, status, next_delivery_date

- Definition: ```sql

CREATE INDEX idx_subscriptions_user_status_next_delivery ON public.user_subscriptions USING btree (user_id, status, next_delivery_date)

```

-  **UNIQUE**: user_subscriptions_pkey

- Columns: user_id, status, next_delivery_date

- Definition: ```sql

CREATE INDEX idx_subscriptions_user_status_next_delivery ON public.user_subscriptions USING btree (user_id, status, next_delivery_date)

```

-  **UNIQUE**: user_subscriptions_pkey

- Columns: user_id, status, next_delivery_date

- Definition: ```sql

CREATE INDEX idx_subscriptions_user_status_next_delivery ON public.user_subscriptions USING btree (user_id, status, next_delivery_date)

```

-  **UNIQUE**: user_subscriptions_pkey

- Columns: user_id, status, next_delivery_date

- Definition: ```sql

CREATE INDEX idx_subscriptions_user_status_next_delivery ON public.user_subscriptions USING btree (user_id, status, next_delivery_date)

```

-  **UNIQUE**: user_subscriptions_pkey

- Columns: user_id, status, next_delivery_date

- Definition: ```sql

CREATE INDEX idx_subscriptions_user_status_next_delivery ON public.user_subscriptions USING btree (user_id, status, next_delivery_date)

```

  
End of altered columns and indexes of next delivery data
```
### Triggers & Functions

#### 🔥 trigger_delivery_completion_after //remove

-  **Timing**: AFTER

-  **Events**: UPDATE

-  **Function**: public.handle_delivery_completion()

  

**Trigger Definition**:

```sql

CREATE  TRIGGER  trigger_delivery_completion_after  AFTER  UPDATE  ON public.user_subscriptions FOR EACH ROW  WHEN ((old.next_delivery_status IS  DISTINCT  FROM new.next_delivery_status)) EXECUTE  FUNCTION handle_delivery_completion()

  

```

  

**Function Definition**:

```sql 
--// should be triggered by order record and results into consumed_meals incrementation and switching the index of meals stored in next_delivery_meal (if last index of meal array it is switched back to 0)

CREATE OR REPLACE  FUNCTION  public.handle_delivery_completion()

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

IF TG_OP = 'UPDATE'  AND

OLD.next_delivery_status != 'delivered'  AND

NEW.next_delivery_status = 'delivered'  THEN

-- Determine meals to add (default to 1 if next_delivery_meals is null)

v_meals_to_add := COALESCE(OLD.next_delivery_meals, 1);

-- Add to delivery history

PERFORM add_delivery_to_history(

NEW.id,

OLD.next_delivery_date,

v_meals_to_add,

'delivered'

);


-- remove this as consumed_meals and next delivery meal is updated from order record
UPDATE user_subscriptions 

SET consumed_meals = LEAST(consumed_meals + v_meals_to_add, total_meals)

WHERE id = NEW.id

RETURNING (total_meals - consumed_meals) INTO v_remaining_meals;

RAISE NOTICE 'Delivery completed for subscription %, consumed meals updated by %, remaining meals: %',

NEW.id, v_meals_to_add, v_remaining_meals;

-- Alternative: Handle ANY change to next_delivery_meals (not just status change)

ELSIF TG_OP = 'UPDATE'  AND

OLD.next_delivery_meals IS  DISTINCT  FROM NEW.next_delivery_meals AND

NEW.next_delivery_meals IS NOT NULL  THEN

-- This handles updates to next_delivery_meals regardless of status

-- Increment consumed_meals by 1 as requested

UPDATE user_subscriptions

SET consumed_meals = LEAST(consumed_meals + 1, total_meals)

WHERE id = NEW.id

RETURNING (total_meals - consumed_meals) INTO v_remaining_meals;

RAISE NOTICE 'Next delivery meals updated for subscription %, consumed meals incremented by 1, remaining meals: %',

NEW.id, v_remaining_meals;

END  IF;

RETURN NEW;

END;

$function$

  

```

#### 🔥 trigger_subscription_lifecycle_before

-  **Timing**: BEFORE

-  **Events**: INSERT, UPDATE

-  **Function**: public.handle_subscription_lifecycle()

  

**Trigger Definition**:

```sql

CREATE  TRIGGER  trigger_subscription_lifecycle_before  BEFORE  INSERT  OR  UPDATE  ON public.user_subscriptions FOR EACH ROW  EXECUTE  FUNCTION handle_subscription_lifecycle()

  

```

  

**Function Definition**:

```sql

CREATE OR REPLACE  FUNCTION  public.handle_subscription_lifecycle()

RETURNS trigger

LANGUAGE plpgsql

AS $function$

DECLARE

v_next_delivery_date timestamp with time zone; -- this would be removed

v_meals_count integer; --removed

v_status_changed boolean := false; --not controlled

v_preferred_time_changed boolean := false;

v_delivery_days_changed boolean := false;

BEGIN

------------------------------------------------------------------

-- 1️⃣ Detect what changed (INSERT vs UPDATE)

------------------------------------------------------------------

IF TG_OP = 'UPDATE'  THEN

v_status_changed := (OLD.status <> NEW.status);

v_preferred_time_changed := (OLD.preferred_delivery_time <> NEW.preferred_delivery_time);

v_delivery_days_changed := (OLD.delivery_days IS  DISTINCT  FROM NEW.delivery_days);

ELSE

-- INSERT – treat as a status change so the rest of the logic runs

v_status_changed := true;

END  IF;

------------------------------------------------------------------

-- 2️⃣ Preferred‑delivery‑time change – delegate to helper function

------------------------------------------------------------------

IF TG_OP = 'UPDATE'  AND v_preferred_time_changed THEN

PERFORM update_delivery_times_for_preferred_time(NEW.id, NEW.preferred_delivery_time);

-- The helper may issue another UPDATE; the trigger will fire again but

-- the guard logic above prevents an endless loop.

END  IF;

------------------------------------------------------------------

-- 3️⃣ Main active‑subscription processing

------------------------------------------------------------------

IF NEW.status = 'active'

AND NEW.delivery_days IS NOT NULL

AND array_length(NEW.delivery_days, 1) > 0

AND NEW.consumed_meals < NEW.total_meals

AND  NOT NEW.is_paused THEN

-- 3a️⃣ Compute the next delivery date (respecting preferred time) next delivery date would be delete

v_next_delivery_date := get_next_delivery_date_with_time(

NEW.delivery_days,

NEW.preferred_delivery_time

);

-- There is no meals count

SELECT meals_count  

INTO v_meals_count

FROM calculate_next_meal_delivery(NEW)

LIMIT  1;

IF  NOT FOUND OR v_meals_count IS  NULL  OR v_meals_count = 0  THEN

-- No meals can be scheduled – clear delivery columns

NEW.next_delivery_date := NULL;

NEW.next_delivery_meal := NULL;

NEW.next_delivery_status := NULL;

ELSE

-- A valid delivery can be scheduled

NEW.next_delivery_date := v_next_delivery_date;

NEW.next_delivery_meals:= v_meals_count;

NEW.next_delivery_status := 'scheduled';

RAISE NOTICE

'Scheduled next delivery for subscription % on % with % meals',

NEW.id, v_next_delivery_date, v_meals_count;

END  IF;

ELSE

-- Inactive / paused / completed – clear fields THEY are deleted

NEW.next_delivery_date := NULL;

NEW.next_delivery_meals := NULL;

NEW.next_delivery_status := NULL;

END  IF;

------------------------------------------------------------------

-- 4️⃣ Completion handling – when all meals are consumed

------------------------------------------------------------------
--KEEP THIS
IF NEW.consumed_meals >= NEW.total_meals THEN

NEW.end_date := CURRENT_DATE;


RAISE NOTICE 'Subscription % completed – all meals consumed', NEW.id;

END  IF;

------------------------------------------------------------------

-- 5️⃣ Touch the audit column

------------------------------------------------------------------

NEW.updated_at := NOW();

RETURN NEW;

END;

$function$

  

```

#### 🔥 trigger_update_timestamp_user_subscriptions

-  **Timing**: BEFORE

-  **Events**: UPDATE

-  **Function**: public.update_timestamp()

  

**Trigger Definition**:

```sql

CREATE  TRIGGER  trigger_update_timestamp_user_subscriptions  BEFORE  UPDATE  ON public.user_subscriptions FOR EACH ROW  EXECUTE  FUNCTION update_timestamp()

  

```

  

**Function Definition**:

```sql

CREATE OR REPLACE  FUNCTION  public.update_timestamp()

RETURNS trigger

LANGUAGE plpgsql

AS $function$

BEGIN

NEW.updated_at = NOW();

RETURN NEW;

END;

$function$

--- Note a trigger created for the following :
-- for each new subscription with status active, new orders created in total meals count with no scheduled date, Each generated order should store items from a record meals attrinbute of user_subscriptions ech meal for each order  

```

---
create table public.orders (
  id uuid not null default extensions.uuid_generate_v4 (), 
  user_id uuid null,
  subscription_id uuid null, //from user subscriptions
  order_number text not null, // alter to integer increments over last created order's order_number. 
  subtotal numeric(10, 2) not null default 0,
  tax_amount numeric(10, 2) not null default 0,
  discount_amount numeric(10, 2) not null default 0,
  delivery_fee numeric(10, 2) not null default 0,
  total_amount numeric(10, 2) not null default 0,
  status public.order_status_enum not null default 'pending'::order_status_enum,
  payment_status text not null default 'pending'::text,
  payment_method public.payment_method_enum null,
  payment_reference text null,
  paid_at timestamp with time zone null,
  delivery_address_id uuid null, // from user_addresses
  delivery_instructions text null,
  scheduled_delivery_date timestamp with time zone null,//generated on the same day while changing status from pending to confirmed changed by  user.
  actual_delivery_date timestamp with time zone null //generates data of the same scheduled_delivery_date  when admin user changes status from confirmed to preparing.,
  delivery_driver_id uuid null,
  contact_phone text null, // from users_profile
  special_instructions text null,
  coupon_code text null,
  loyalty_points_used integer null default 0,
  loyalty_points_earned integer null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint orders_pkey primary key (id),
  constraint orders_order_number_key unique (order_number),
  constraint orders_delivery_address_id_fkey foreign KEY (delivery_address_id) references user_addresses (id),
  constraint orders_subscription_id_fkey foreign KEY (subscription_id) references user_subscriptions (id) on delete set null,
  constraint orders_user_id_fkey foreign KEY (user_id) references user_profiles (id) on delete set null,
  constraint orders_discount_amount_check check ((discount_amount >= (0)::numeric)),
  constraint orders_payment_status_check check (
    (
      payment_status = any (
        array[
          'pending'::text,
          'paid'::text,
          'failed'::text,
          'refunded'::text,
          'partial_refund'::text
        ]
      )
    )
  ),
  constraint orders_delivery_fee_check check ((delivery_fee >= (0)::numeric)),
  constraint valid_total check (
    (
      total_amount = (
        ((subtotal + tax_amount) + delivery_fee) - discount_amount
      )
    )
  ),
  constraint orders_subtotal_check check ((subtotal >= (0)::numeric)),
  constraint orders_tax_amount_check check ((tax_amount >= (0)::numeric)),
  constraint orders_total_amount_check check ((total_amount >= (0)::numeric)),
  constraint orders_loyalty_points_earned_check check ((loyalty_points_earned >= 0)),
  constraint orders_loyalty_points_used_check check ((loyalty_points_used >= 0))
) TABLESPACE pg_default;

create index IF not exists idx_orders_user_created on public.orders using btree (user_id, created_at desc) TABLESPACE pg_default;

create index IF not exists idx_orders_status_created on public.orders using btree (status, created_at desc) TABLESPACE pg_default;

create index IF not exists idx_orders_delivery_date on public.orders using btree (scheduled_delivery_date) TABLESPACE pg_default
where
  (scheduled_delivery_date is not null);

create index IF not exists idx_orders_number on public.orders using btree (order_number) TABLESPACE pg_default;

create index IF not exists idx_orders_payment_stats on public.orders using btree (payment_status, paid_at) TABLESPACE pg_default
where
  (payment_status = 'paid'::text);

create trigger trigger_set_order_number BEFORE INSERT on orders for EACH row
execute FUNCTION set_order_number ();

create trigger trigger_update_timestamp_orders BEFORE
update on orders for EACH row
execute FUNCTION update_timestamp ();


create table public.order_items (
  id uuid not null default extensions.uuid_generate_v4 (),
  order_id uuid not null,
  order_meal_id uuid null,
  item_id integer null,
  quantity integer not null default 1,
  unit_price numeric(10, 2) not null,
  total_price numeric(10, 2) not null,
  name text not null,
  name_arabic text null,
  category text null,
  created_at timestamp with time zone not null default now(),
  constraint order_items_pkey primary key (id),
  constraint order_items_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE,
  constraint order_items_order_meal_id_fkey foreign KEY (order_meal_id) references order_meals (id) on delete CASCADE,
  constraint order_items_item_id_fkey foreign KEY (item_id) references items (id) on delete set null,
  constraint valid_item_total check (
    (total_price = (unit_price * (quantity)::numeric))
  ),
  constraint order_items_quantity_check check ((quantity > 0)),
  constraint order_items_total_price_check check ((total_price >= (0)::numeric)),
  constraint order_items_unit_price_check check ((unit_price >= (0)::numeric))
) TABLESPACE pg_default;
create table public.order_meals (
  id uuid not null default extensions.uuid_generate_v4 (),
  order_id uuid not null,
  meal_id integer null,
  quantity integer not null default 1,
  unit_price numeric(10, 2) not null,
  total_price numeric(10, 2) not null,
  name text not null,
  name_arabic text null,
  description text null,
  calories integer null,
  protein_g integer null,
  carbs_g integer null,
  fat_g integer null,
  customization_notes text null,
  created_at timestamp with time zone not null default now(),
  constraint order_meals_pkey primary key (id),
  constraint order_meals_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE,
  constraint order_meals_meal_id_fkey foreign KEY (meal_id) references meals (id) on delete set null,
  constraint valid_meal_total check (
    (total_price = (unit_price * (quantity)::numeric))
  ),
  constraint order_meals_quantity_check check ((quantity > 0)),
  constraint order_meals_total_price_check check ((total_price >= (0)::numeric)),
  constraint order_meals_unit_price_check check ((unit_price >= (0)::numeric))
) TABLESPACE pg_default;