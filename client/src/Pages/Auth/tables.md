# dietary_preferences:
id: integer	int4		
name: text	text		
name_arabic: text	text		
description: text	text		
created_at: timestamp with time zone	timestamptz		

# allergies: 
id: integer	int4		
name: text	text		
name_arabic: text	text		
severity_level: integer	int4		
created_at: timestamp with time zone	timestamptz		

# item_allergies:
item_id: integer	int4		
allergy_id: integer	int4

# items:
id: integer	int4		
name: text	text		
name_arabic: text	text		
description: text	text		
description_arabic: text	text		
category: text	text		
category_arabic: text	text		
price: double precision	float8		
calories: integer	int4		
protein_g: integer	int4		
carbs_g: integer	int4		
fat_g: integer	int4		
max_free_per_meal: integer	int4		
image_url: text	text		
is_available: boolean	bool		
sort_order: integer	int4		
created_at: timestamp with time zone	timestamptz		
updated_at: timestamp with time zone	timestamptz

# meal_allergies:
meal_id: integer	int4		
allergy_id: integer	int4

# meal_items:
meal_id: integer	int4		
item_id: integer	int4		
is_included: boolean	bool		
max_quantity: integer	int4

# meal_reviews:
id: uuid	uuid		
user_id: uuid	uuid		
meal_id: integer	int4		
order_id: uuid	uuid		
rating: integer	int4		
review_text: text	text		
is_verified_purchase: boolean	bool		
is_published: boolean	bool		
created_at: timestamp with time zone	timestamptz		
updated_at: timestamp with time zone	timestamptz

# meals:
id: integer	int4		
name: text	text		
name_arabic: text	text		
description: text	text		
description_arabic: text	text		
section: text	text		
section_arabic: text	text		
base_price: numeric	numeric		
calories: integer	int4		
protein_g: integer	int4		
carbs_g: integer	int4		
fat_g: integer	int4		
fiber_g: integer	int4		
sugar_g: integer	int4		
sodium_mg: integer	int4		
ingredients:text	text		
ingredients_arabic: text	text		
preparation_instructions: text	text		
image_url: text	text		
thumbnail_url: text	text		
is_premium: boolean	bool		
is_vegetarian: boolean	bool		
is_vegan: boolean	bool		
is_gluten_free: boolean	bool		
is_dairy_free: boolean	bool		
spice_level: integer	int4		
prep_time_minutes: integer	int4		
rating: numeric	numeric		
rating_count: integer	int4		
is_featured: boolean	bool		
discount_percentage: numeric	numeric		
discount_valid_until: timestamp with time zone	timestamptz		
is_available: boolean	bool		
created_at: timestamp with time zone	timestamptz		
updated_at: timestamp with time zone	timestamptz

# order_items:
id: uuid	uuid		
order_id: uuid	uuid		
order_meal_id: uuid	uuid		
item_id: integer	int4		
quantity: integer	int4		
unit_price: numeric	numeric		
total_price: numeric	numeric		
name: text	text		
name_arabic: text	text		
category: text	text		
created_at: timestamp with time zone	timestamptz	

# order_meals:
id: uuid	uuid		
order_id: uuid	uuid		
meal_id: integer	int4		
quantity: integer	int4		
unit_price: numeric	numeric		
total_price: numeric	numeric		
name: text	text		
name_arabic: text	text		
description: text	text		
calories: integer	int4		
protein_g: integer	int4		
carbs_g: integer	int4		
fat_g: integer	int4		
customization_notes: text	text		
created_at: timestamp with time zone	timestamptz

# orders:
id: uuid	uuid		
user_id: uuid	uuid		
subscription_id: uuid	uuid		
order_number: text	text		
subtotal: numeric	numeric		
tax_amount: numeric	numeric		
discount_amount: numeric	numeric		
delivery_fee: numeric	numeric		
total_amount: numeric	numeric		
status: USER-DEFINED	order_status_enum		
payment_status: text	text		
payment_method: USER-DEFINED	payment_method_enum		
payment_reference: text	text		
paid_at: timestamp with time zone	timestamptz		
delivery_address_id: uuid	uuid		
delivery_instructions: text	text		
scheduled_delivery_date: timestamp with time zone	timestamptz		
actual_delivery_date: timestamp with time zone	timestamptz		
delivery_driver_id: uuid	uuid		
contact_phone: text	text		
special_instructions: text	text		
coupon_code: text	text		
loyalty_points_used: integer	int4		
loyalty_points_earned: integer	int4		
created_at: timestamp with time zone	timestamptz		
updated_at: timestamp with time zone	timestamptz		

# plan_meals:
id: uuid	uuid		
plan_id:integer	int4		
meal_id: integer	int4		
meal_type: USER-DEFINED	meal_type_enum		
day_of_week: integer	int4		
is_substitutable: boolean	bool		
created_at: timestamp with time zone	timestamptz

# plans:
id: integer	int4		
title: text	text		
title_arabic: text	text		
description: text	text		
description_arabic: text	text		
price_per_meal: numeric	numeric		
short_term_meals: integer	int4 // user should either choose short_term or medium term subscription		
medium_term_meals: integer	int4		
kcal: integer	int4		
protein: integer	int4		
carb: integer	int4		
avatar_url: text	text		
is_active: boolean	bool		
sort_order: integer	int4		
created_at: timestamp with time zone	timestamptz		
updated_at: timestamp with time zone	timestamptz		
duration_days: bigint	int8

# user_addresses:
id: uuid	uuid		
user_id: uuid	uuid		
label: text	text		
address_line1: text	text		
address_line2: text	text		
city: text	text		
state: text	text		
postal_code: text	text		
country: character	bpchar		
location: USER-DEFINED	geography		
is_default: boolean	bool		
delivery_instructions: text	text		
created_at: timestamp with time zone	timestamptz		
updated_at: timestamp with time zone	timestamptz

# user_allergies:
user_id: uuid	uuid		
allergy_id: integer	int4		
severity_override: integer	int4

# user_dietary_preferences:
user_id: uuid	uuid		
preference_id: integer	int4

# user_favourite_meals:
user_id: uuid	uuid		
meal_id: integer	int4		
created_at: timestamp with time zone	timestamptz

# user_health_profiles:
user_id: uuid	uuid		
fitness_goal: text	text		
height_cm: numeric	numeric		
weight_kg: numeric	numeric		
activity_level: USER-DEFINED	activity_level_enum		
target_calories: integer	int4		
target_protein: integer	int4		
created_at: timestamp with time zone	timestamptz		
updated_at: timestamp with time zone	timestamptz

# user_notification_preferences:
user_id: uuid	uuid		
email_enabled: boolean	bool		
sms_enabled: boolean	bool		
push_enabled: boolean	bool		
order_confirmations: boolean	bool		
delivery_updates: boolean	bool		
meal_reminders: boolean	bool		
plan_updates: boolean	bool		
promotional_emails: boolean	bool		
promotional_sms: boolean	bool		
weekly_reports: boolean	bool		
created_at: timestamp with time zone	timestamptz		
updated_at: timestamp with time zone

# user_payment_methods:
id: uuid	uuid		
user_id: uuid	uuid		
type: USER-DEFINED	payment_method_enum		
provider: text	text		
last_four: character	bpchar		
expiry_month: integer	int4		
expiry_year: integer	int4		
cardholder_name: text	text		
is_default: boolean	bool		
is_verified: boolean	bool		
created_at: timestamp with time zone	timestamptz		
updated_at: timestamp with time zone	timestamptz

# user_profiles:
id: uuid	uuid		
display_name: text	text		
phone_number: text	text		
avatar_url: text	text		
is_admin: boolean	bool		
loyalty_points: integer	int4		
notes: text	text		
language: character	bpchar		
age: integer	int4		
gender: text	text		
created_at: timestamp with time zone	timestamptz		
updated_at: timestamp with time zone	timestamptz		
last_login: timestamp with time zone	timestamptz		
email: text	text		
google_id: text	text		
account_status: text	text		
timezone: text	text		
phone_verified: boolean	bool		
email_verified: boolean	bool		
profile_completed: boolean	bool

# user_subscriptions:
id: uuid	uuid		
user_id: uuid	uuid		
plan_id: integer	int4		
status: USER-DEFINED	subscription_status_enum		
start_date: date	date		
end_date: date	date		
price_per_meal: numeric	numeric			
total_meals: integer	int4 //number of meals should be consumed		
consumed_meals: integer	int4 //number of consumed meals		
delivery_address_id: uuid	uuid		
preferred_delivery_time: time without time zone	time		
delivery_days: ARRAY	_int4		
auto_renewal: boolean	bool		
payment_method_id: uuid	uuid		
is_paused: boolean	bool		
paused_at: timestamp with time zone	timestamptz		
pause_reason: text	text		
resume_date: date	date		
next_delivery_date: date	date
meals: [int4] 'foreign key'	// refers to meals IDs chosen by user
created_at: timestamp with time zone	timestamptz		
updated_at: timestamp with time zone	timestamptz