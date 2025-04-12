
# Food Store Web App Structure

## Main Navigation Structure

/
├── /home
├── /menu
├── /offers
├── /account
│   ├── /profile
│   ├── /orders
│   ├── /favorites
│   └── /settings
├── /cart
└── /checkout
    ├── /delivery
    ├── /payment
    └── /confirmation
```

## Page Details

### 1. Home Page (`/home`)
- Hero banner with featured offers
- Popular categories quick access
- Recommended items section
- Special deals carousel
- Newsletter signup

### 2. Menu Page (`/menu`)
```
/menu
├── /categories
│   ├── /breakfast
│   ├── /lunch
│   ├── /dinner
│   ├── /desserts
│   └── /beverages
├── /featured
├── /new-arrivals
└── /combos
```
- Category filtering system
- Search functionality
- Dietary filters (vegetarian, vegan, gluten-free)
- Price range selector
- Sorting options (popularity, price, rating)

### 3. Offers Page (`/offers`)

- Daily deals
- Combo offers
- Limited-time specials
- Loyalty program discounts
- Coupon code input

### 4. User Account Section (`/account`)
#### 4.1 Profile (`/account/profile`)
- Personal information
- Dietary preferences
- Allergies/special requirements
- Avatar/photo upload

#### 4.2 Orders (`/account/orders`)
- Order history with status tracking
- Reorder functionality
- Receipt download
- Order details modal
- Rating/review system

#### 4.3 Favorites (`/account/favorites`)
- Saved favorite items
- Frequent orders
- Custom meal combinations
- "Try something new" suggestions

#### 4.4 Settings (`/account/settings`)
- Notification preferences
- Password change
- Payment methods
- Address book
- Subscription management

### 5. Cart Page (`/cart`)
- Items summary with quantities
- Modifiers for each item
- Special instructions
- Promo code application
- Estimated delivery time
- Order minimum indicator

### 6. Checkout Flow (`/checkout`)
#### 6.1 Delivery (`/checkout/delivery`)
- Address selection
- Delivery time selection
- Contact information
- Delivery instructions

#### 6.2 Payment (`/checkout/payment`)
- Payment method selection
- Card details form
- Digital wallet options
- Billing address
- Order summary sidebar

#### 6.3 Confirmation (`/checkout/confirmation`)
- Order number display
- Estimated delivery time
- Restaurant contact info
- Order tracking link
- Suggested next actions (track order, new order)

## Special Routes

### Authentication
```
/auth
├── /login
├── /register
├── /forgot-password
└── /reset-password
```

### Static Pages
```
/info
├── /about
├── /contact
├── /faq
└── /privacy
```

### Admin Panel (Protected)
```
/admin
├── /dashboard
├── /menu-management
├── /orders
├── /customers
└── /reports
```

## Component Structure

1. **Layout Components**
   - MainNavigation.astro
   - Footer.astro
   - PageHeader.astro

2. **Menu Components**
   - CategoryFilter.astro
   - MenuItemCard.astro
   - NutritionInfoModal.astro

3. **Cart Components**
   - CartItem.astro
   - OrderSummary.astro
   - DeliveryTimer.astro

4. **Account Components**
   - ProfileSection.astro
   - OrderHistoryItem.astro
   - AddressCard.astro

5. **Checkout Components**
   - DeliveryOptions.astro
   - PaymentMethod.astro
   - OrderConfirmation.astro
```

## Key Features

1. **Responsive Design**
   - Mobile-first approach
   - Tablet-optimized layouts
   - Desktop enhancements

2. **Performance Optimizations**
   - Image lazy-loading
   - Menu category prefetching
   - Cart persistence

3. **Accessibility**
   - WCAG 2.1 AA compliant
   - Keyboard navigation
   - Screen reader support

4. **Localization**
   - Multi-language support
   - Currency conversion
   - Regional menu variations


```