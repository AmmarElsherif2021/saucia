# 🍽️ Saucia Food Store App - UI Components & Widgets Guide

This document provides a structured overview of **generic UI components** alongside **food store-specific components**, ensuring clarity and ease of integration.

---

## 🖥️ Generic UI Components & Widgets

### 🔘 Buttons (BTN)
**Attributes:** `type`, `size`, `color`, `disabled`, `icon`, `onClick`  
**Description:** Used to trigger actions, including navigation and form submissions.

### 📝 Text Input (TXT)
**Attributes:** `placeholder`, `value`, `maxlength`, `disabled`, `onChange`  
**Description:** Allows users to enter short text-based data, like login credentials or search terms.

### 📑 Text Area (TXTAREA)
**Attributes:** `rows`, `cols`, `value`, `maxlength`, `disabled`, `onChange`  
**Description:** Multi-line text input for writing descriptions or feedback.

### ✅ Checkbox (CHK)
**Attributes:** `checked`, `label`, `disabled`, `onChange`  
**Description:** Enables binary selection (checked/unchecked), useful for options and preferences.

### 🔘 Radio Buttons (RDO)
**Attributes:** `name`, `selected`, `disabled`, `onChange`  
**Description:** Allows users to choose a single option from predefined choices.

### 🔽 Dropdown / Select Menu (DD)
**Attributes:** `options`, `selectedItem`, `disabled`, `onChange`  
**Description:** Displays a list for users to select an item.

### 📢 Alert Notification (ALT)
**Attributes:** `message`, `type`, `dismissible`, `icon`, `timeout`  
**Description:** Used for showing warnings, confirmations, or success messages.

### 📆 Date Picker (DP)
**Attributes:** `selectedDate`, `minDate`, `maxDate`, `onSelect`  
**Description:** Widget for choosing a date, commonly used for scheduling.

### 🎚️ Slider (SLD)
**Attributes:** `min`, `max`, `step`, `value`, `onChange`  
**Description:** Allows users to select a numerical value by dragging a control.

### 📊 Progress Bar (PB)
**Attributes:** `value`, `max`, `color`, `animated`  
**Description:** Visualizes progress, such as loading or order completion.

### 🎛️ Toggle Switch (TSW)
**Attributes:** `on`, `off`, `disabled`, `onChange`  
**Description:** Binary control alternative to a checkbox, commonly used for settings.

### 🌟 Rating Component (RATE)
**Attributes:** `stars`, `value`, `maxStars`, `readOnly`, `onRateChange`  
**Description:** Allows users to rate items, often used for reviews.

### 📄 Modal Dialog (MOD)
**Attributes:** `visible`, `title`, `content`, `actions`, `onClose`  
**Description:** Displays pop-ups for alerts, confirmations, or extra details.

### 🗂️ Accordion (ACC)
**Attributes:** `sections`, `expandedItem`, `onToggle`  
**Description:** Expanding/collapsing content sections for organization.

### 📁 Tabs Component (TAB)
**Attributes:** `items`, `activeTab`, `onSelect`, `orientation`  
**Description:** Helps organize content into multiple selectable sections.

### 🗃️ Table (TBL)
**Attributes:** `headers`, `rows`, `sortable`, `filterable`, `paginated`  
**Description:** Displays structured tabular data.

### ⏳ Loader / Spinner (LD)
**Attributes:** `size`, `color`, `type`  
**Description:** Displays loading animations to indicate processing.

---

## 🛍️ **Food Store-Specific UI Components**

### 👤 User Profile (PROF)   ----> DONE
**Attributes:** `name`, `email`, `phoneNumber`, `profilePicture`, `orderHistory`, `favoriteItems`, `savedAddresses`, `dietaryPreferences`, `allergies`, `calorieTracking`, `subscriptionStatus`, `rewardPoints`, `notificationsSettings`  
**Description:** Stores user details, previous orders, preferences, and health-related information like dietary preferences and allergies.
### 🛒 Cart (CRT)   -------> DONE
**Attributes:** `items`, `totalPrice`, `updateQuantity`, `removeItem`, `checkoutButton`  
**Description:** Displays selected food items and allows quantity adjustments.

### 🍽️ Food Product Card (PRD) -----> DONE
**Attributes:** `image`, `name`, `description`, `price`, `addToCartButton`, `favoriteIcon`  
**Description:** Showcases food items with images, descriptions, and prices.

### 🔍 Search Bar (SCH) 
**Attributes:** `placeholder`, `suggestions`, `onSearch`, `filterOptions`  
**Description:** Allows users to search for food items.

### 📜 Menu List (MENU)
**Attributes:** `categories`, `items`, `priceRange`, `sortingOptions`  
**Description:** Displays available food items grouped into categories.

### 📝 Order Summary (ORD)
**Attributes:** `orderedItems`, `subtotal`, `taxes`, `deliveryFee`, `grandTotal`  
**Description:** Provides a breakdown of the user’s order.

### ⭐ Reviews & Ratings (REV)  
**Attributes:** `averageRating`, `userReviews`, `submitReview`, `filterByRating`  
**Description:** Displays customer feedback and allows new reviews.

### 🎨 Hero Section (HERO)
**Attributes:** `backgroundImage`, `headline`, `CTAButton`, `specialOffers`  
**Description:** Highlights promotions and branding.

### 🏷️ Coupons & Discounts (DISC)
**Attributes:** `discountCode`, `applyCoupon`, `validityPeriod`, `discountAmount`  
**Description:** Offers users discounts on purchases.

### 🛍️ Checkout Page (CHKOUT)
**Attributes:** `orderSummary`, `paymentMethods`, `deliveryOptions`, `placeOrderButton`  
**Description:** Guides users through order placement.

### 🚚 Delivery Tracking (TRACK)
**Attributes:** `orderID`, `estimatedTime`, `deliveryUpdates`, `contactSupport`  
**Description:** Provides real-time delivery updates.

### 📆 Deals & Promotions (DEALS)
**Attributes:** `featuredItems`, `limitedTimeOffers`, `discounts`  
**Description:** Displays promotions and discounts.

### 📍 Location & Delivery Zone (LOC)
**Attributes:** `addressInput`, `deliveryRadius`, `storeLocations`, `choosePickup`  
**Description:** Allows users to define their delivery zones.



### 🍕 Featured Food Items (FEAT)
**Attributes:** `trendingItems`, `recommendedItems`, `seasonalSpecials`  
**Description:** Highlights popular and recommended items.

### 🏡 Home Page Sections (HOME)
**Attributes:** `featuredDishes`, `quickLinks`, `restaurantOverview`  
**Description:** Provides an engaging landing page.

### 📖 Food Categories (CATS)
**Attributes:** `vegetarian`, `vegan`, `fastFood`, `desserts`, `beverages`  
**Description:** Helps users browse food groups.

---

