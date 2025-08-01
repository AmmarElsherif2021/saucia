
# Supabase Models Documentation

  

## Item Model

  

### Properties

| Property | Type | Default | Description |

|----------|------|---------|-------------|

| `id` | `number` | - | Unique identifier |

| `name` | `string` | `''` | Item name in English |

| `name_arabic` | `string` | `''` | Item name in Arabic |

| `description` | `string` | `''` | Item description in English |

| `description_arabic` | `string` | `''` | Item description in Arabic |

| `category` | `string` | `'side'` | Item category |

| `category_arabic` | `string` | `''` | Category name in Arabic |

| `price` | `number` | `0` | Item price |

| `calories` | `number` | `0` | Calories per serving |

| `protein_g` | `number` | `0` | Protein content in grams |

| `carbs_g` | `number` | `0` | Carbohydrates content in grams |

| `fat_g` | `number` | `0` | Fat content in grams |

| `max_free_per_meal` | `number` | `0` | Maximum free items per meal |

| `image_url` | `string` | `''` | URL to item image |

| `is_available` | `boolean` | `true` | Availability status |

| `sort_order` | `number` | `0` | Display order |

| `created_at` | `string` | - | ISO timestamp |

| `updated_at` | `string` | - | ISO timestamp |

  

### Static Methods

-  `create(itemData)` - Create new item

-  `getById(id)` - Get item by ID

-  `getByCategory(category)` - Get items by category

-  `getBySection(section)` - Legacy method, same as getByCategory

-  `getAll(availableOnly = false)` - Get all items

-  `getAvailable()` - Get only available items

-  `update(id, updatedData)` - Update item

-  `delete(id)` - Delete item

-  `toggleAvailability(id)` - Toggle item availability

-  `bulkUpdateAvailability(ids, isAvailable)` - Bulk update availability

-  `search(searchTerm, options)` - Search items

  

### Legacy Field Mappings

-  `item_kcal` → `calories`

-  `item_protein` → `protein_g`

-  `free_count` → `max_free_per_meal`

-  `image` → `image_url`

  

---

  

## Meal Model

  

### Properties (Serialized)

| Property | Type | Default | Description |

|----------|------|---------|-------------|

| `id` | `number` | - | Unique identifier |

| `name` | `string` | `''` | Meal name in English |

| `nameArabic` | `string` | `''` | Meal name in Arabic |

| `description` | `string` | `''` | Meal description in English |

| `descriptionArabic` | `string` | `''` | Meal description in Arabic |

| `section` | `string` | `''` | Meal section/category |

| `sectionArabic` | `string` | `''` | Section name in Arabic |

| `basePrice` | `number` | `0` | Base price of meal |

| `calories` | `number` | `0` | Calories per serving |

| `proteinG` | `number` | `0` | Protein content in grams |

| `carbsG` | `number` | `0` | Carbohydrates content in grams |

| `fatG` | `number` | `0` | Fat content in grams |

| `fiberG` | `number` | `0` | Fiber content in grams |

| `sugarG` | `number` | `0` | Sugar content in grams |

| `sodiumMg` | `number` | `0` | Sodium content in milligrams |

| `ingredients` | `string` | `''` | Ingredients list in English |

| `ingredientsArabic` | `string` | `''` | Ingredients list in Arabic |

| `preparationInstructions` | `string` | `''` | Preparation instructions |

| `imageUrl` | `string` | `''` | URL to meal image |

| `thumbnailUrl` | `string` | `''` | URL to thumbnail image |

| `isPremium` | `boolean` | `false` | Premium meal flag |

| `isVegetarian` | `boolean` | `false` | Vegetarian meal flag |

| `isVegan` | `boolean` | `false` | Vegan meal flag |

| `isGlutenFree` | `boolean` | `false` | Gluten-free meal flag |

| `isDairyFree` | `boolean` | `false` | Dairy-free meal flag |

| `spiceLevel` | `number` | `0` | Spice level (0-5) |

| `prepTimeMinutes` | `number` | `0` | Preparation time in minutes |

| `rating` | `number` | `0` | Average rating |

| `ratingCount` | `number` | `0` | Number of ratings |

| `isFeatured` | `boolean` | `false` | Featured meal flag |

| `discountPercentage` | `number` | `0` | Discount percentage |

| `discountValidUntil` | `string|null` | `null` | Discount expiry date |

| `isAvailable` | `boolean` | `true` | Availability status |

| `createdAt` | `string` | - | ISO timestamp |

| `updatedAt` | `string` | - | ISO timestamp |

  

### Static Methods

-  `create(mealData)` - Create new meal

-  `getAll(options)` - Get all meals with filters

-  `getById(mealId)` - Get meal by ID

-  `getFeatured()` - Get featured meals

-  `getBySection(section)` - Get meals by section

-  `searchMeals(query, options)` - Search meals

-  `update(mealId, updateData)` - Update meal

-  `delete(mealId)` - Delete meal

-  `updateRating(mealId, newRating, reviewCount)` - Update meal rating

-  `toggleAvailability(mealId)` - Toggle availability

-  `applyDiscount(mealId, discountPercentage, validUntil)` - Apply discount

-  `removeDiscount(mealId)` - Remove discount

-  `getDiscountedMeals()` - Get meals with active discounts

  

### Search Options

```javascript

{

category: string,

availableOnly: boolean,

vegetarian: boolean,

vegan: boolean,

glutenFree: boolean,

minPrice: number,

maxPrice: number,

minCalories: number,

maxCalories: number,

maxSpiceLevel: number,

orderBy: string,

orderDirection: 'asc' | 'desc',

limit: number

}

```

  

---

  

## Order Model

  

### Properties (Serialized)

| Property | Type | Default | Description |

|----------|------|---------|-------------|

| `id` | `number` | - | Unique identifier |

| `userId` | `string|null` | `null` | User ID |

| `subscriptionId` | `number|null` | `null` | Subscription ID |

| `orderNumber` | `string` | `''` | Order number |

| `subtotal` | `number` | `0` | Subtotal amount |

| `tax` | `number` | `0` | Tax amount |

| `discount` | `number` | `0` | Discount amount |

| `deliveryFee` | `number` | `0` | Delivery fee |

| `totalPrice` | `number` | `0` | Total amount |

| `status` | `string` | `'pending'` | Order status |

| `paymentStatus` | `string` | `'pending'` | Payment status |

| `paymentMethod` | `string|null` | `null` | Payment method |

| `paymentId` | `string` | `''` | Payment reference |

| `paymentDate` | `string|null` | `null` | Payment date |

| `deliveryAddressId` | `number|null` | `null` | Delivery address ID |

| `deliveryInstructions` | `string` | `''` | Delivery instructions |

| `deliveryDate` | `string|null` | `null` | Scheduled delivery date |

| `contactPhone` | `string` | `''` | Contact phone number |

| `notes` | `string` | `''` | Special instructions |

| `couponCode` | `string` | `''` | Coupon code used |

| `loyaltyPointsUsed` | `number` | `0` | Loyalty points used |

| `loyaltyPointsEarned` | `number` | `0` | Loyalty points earned |

| `createdAt` | `string` | - | ISO timestamp |

| `updatedAt` | `string` | - | ISO timestamp |

  

### Static Methods

-  `create(orderData)` - Create new order

-  `getByUser(userId)` - Get orders by user

-  `getById(orderId)` - Get order by ID

-  `update(orderId, updateData)` - Update order

  

### Order Status Values

-  `'pending'` - Order placed, awaiting processing

-  `'confirmed'` - Order confirmed

-  `'preparing'` - Order being prepared

-  `'ready'` - Order ready for delivery/pickup

-  `'delivered'` - Order delivered

-  `'cancelled'` - Order cancelled

  

### Payment Status Values

-  `'pending'` - Payment pending

-  `'paid'` - Payment completed

-  `'failed'` - Payment failed

-  `'refunded'` - Payment refunded

  

---

  

## Plan Model

  

### Properties (Serialized)

| Property | Type | Default | Description |

|----------|------|---------|-------------|

| `id` | `number` | - | Unique identifier |

| `title` | `string` | `''` | Plan title in English |

| `titleArabic` | `string` | `''` | Plan title in Arabic |

| `description` | `string` | `''` | Plan description in English |

| `descriptionArabic` | `string` | `''` | Plan description in Arabic |

| `pricePerMeal` | `number` | `0` | Price per meal |

| `short_term_meals` | `number` | `0` | Minimum meals per week |

| `medium_term_meals` | `number` | `0` | Maximum meals per week |

| `durationDays` | `number` | `0` | Plan duration in days |

| `targetCaloriesPerMeal` | `number|null` | `null` | Target calories per meal |

| `targetProteinPerMeal` | `number|null` | `null` | Target protein per meal |

| `targetCarbsPerMeal` | `number|null` | `null` | Target carbs per meal |

| `avatarUrl` | `string|null` | `null` | Plan avatar image URL |

| `isActive` | `boolean` | `true` | Plan active status |

| `sortOrder` | `number` | `0` | Display order |

| `createdAt` | `string` | - | ISO timestamp |

| `updatedAt` | `string` | - | ISO timestamp |

  

### Static Methods

-  `create(planData)` - Create new plan

-  `getAll(options)` - Get all plans with filters

-  `getById(id)` - Get plan by ID

-  `getActive()` - Get active plans only

-  `getByPriceRange(minPrice, maxPrice)` - Get plans by price range

-  `update(id, updateData)` - Update plan

-  `delete(id)` - Delete plan (checks for active subscriptions)

-  `deactivate(id)` - Deactivate plan

-  `activate(id)` - Activate plan

-  `getWithMeals(id)` - Get plan with associated meals

  

### Get All Options

```javascript

{

activeOnly: boolean,

sortBy: string, // default: 'sort_order'

sortOrder: 'asc' | 'desc', // default: 'asc'

limit: number,

offset: number

}

```

  

---

  

## User Model

  

### Properties (Serialized)

| Property | Type | Default | Description |

|----------|------|---------|-------------|

| `id` | `string` | - | Unique identifier (Supabase Auth ID) |

| `uid` | `string` | - | Same as id |

| `email` | `string` | `''` | User email |

| `displayName` | `string` | `''` | Display name |

| `firstName` | `string` | `''` | First name |

| `lastName` | `string` | `''` | Last name |

| `phoneNumber` | `string` | `''` | Phone number |

| `avatarUrl` | `string` | `''` | Avatar image URL |

| `isAdmin` | `boolean` | `false` | Admin status |

| `loyaltyPoints` | `number` | `0` | Loyalty points balance |

| `notes` | `string` | `''` | Admin notes |

| `language` | `string` | `'en'` | Preferred language |

| `age` | `number|null` | `null` | User age |

| `gender` | `string|null` | `null` | User gender |

| `createdAt` | `string` | - | ISO timestamp |

| `updatedAt` | `string` | - | ISO timestamp |

| `lastLogin` | `string` | - | Last login timestamp |

| `addresses` | `array` | `[]` | User addresses |

| `paymentMethods` | `array` | `[]` | Payment methods |

| `healthProfile` | `object|null` | `null` | Health profile data |

| `subscriptions` | `array` | `[]` | User subscriptions |

  

### Static Methods

-  `create(uid, userData)` - Create new user profile

-  `getCurrentUser()` - Get current authenticated user

  

### Language Values

-  `'en'` - English

-  `'ar'` - Arabic

  

### Gender Values

-  `'male'` - Male

-  `'female'` - Female

-  `'other'` - Other

-  `null` - Not specified

  

---

  

## Common Patterns for React Components

  

### Loading States

```javascript

const [loading, setLoading] = useState(true)

const [error, setError] = useState(null)

```

  

### Error Handling

```javascript

try {

const  result = await  Model.methodName()

// Handle success

} catch (error) {

setError(error.message)

console.error('Operation failed:', error)

}

```

  

### Data Fetching Hook Example

```javascript

const  useItems = (category = null) => {

const [items, setItems] = useState([])

const [loading, setLoading] = useState(true)

const [error, setError] = useState(null)

  

useEffect(() => {

const  fetchItems = async () => {

try {

setLoading(true)

const  data = category

? await  Item.getByCategory(category)

: await  Item.getAvailable()

setItems(data)

} catch (err) {

setError(err.message)

} finally {

setLoading(false)

}

}

  

fetchItems()

}, [category])

  

return { items, loading, error, refetch:  fetchItems }

}

```

  

### Form Handling

```javascript

const [formData, setFormData] = useState({

name:  '',

price:  0,

calories:  0,

is_available:  true

})

  

const  handleSubmit = async (e) => {

e.preventDefault()

try {

await  Item.create(formData)

// Handle success

} catch (error) {

// Handle error

}

}

```

  

### TypeScript Interfaces (Optional)

```typescript

interface  ItemType {

id: number

name: string

name_arabic: string

description: string

description_arabic: string

category: string

category_arabic: string

price: number

calories: number

protein_g: number

carbs_g: number

fat_g: number

max_free_per_meal: number

image_url: string

is_available: boolean

sort_order: number

created_at: string

updated_at: string

}

```