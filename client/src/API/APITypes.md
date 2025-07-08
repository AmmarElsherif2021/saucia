# Comprehensive API Documentation with Junction Tables
This documentation covers all API endpoints that interact with junction tables for managing relationships between entities. Each section includes getters and setters for core tables and their associated junction tables.

1. Meal Management
Getters:
getMealDetails(mealId)
Returns meal data including:

meal_items junction table (items in the meal)

meal_allergies junction table (allergies associated with the meal)

meal_reviews (reviews for the meal)

allergies (via meal_allergies)

items (via meal_items)

Setters:
updateMeal(mealId, updateData)
Updates core meal data

updateMealAllergies(mealId, allergyIds)
Replaces all allergy associations in meal_allergies junction table

updateMealItems(mealId, itemsData)
Replaces all item associations in meal_items junction table

2. User Management
Getters:
getUserDetails(userId)
Returns user data including:

user_allergies junction table

user_dietary_preferences junction table

user_addresses

user_subscriptions

orders

Setters:
updateUserProfile(userId, updateData)
Updates core user data

updateUserAllergies(userId, allergyIds)
Replaces all allergy associations in user_allergies junction table

updateUserDietaryPreferences(userId, preferenceIds)
Replaces all dietary preference associations in user_dietary_preferences junction table

3. Plan Management
Getters:
getPlanDetails(planId)
Returns plan data including:

plan_meals junction table (meals in the plan)

subscriptions (users subscribed to plan)

meals (via plan_meals)

Setters:
updatePlan(planId, updateData)
Updates core plan data

addMealToPlan(planId, mealId, weekNumber, dayOfWeek)
Adds to plan_meals junction table

removeMealFromPlan(planId, mealId, weekNumber, dayOfWeek)
Removes from plan_meals junction table

4. Item Management
Getters:
getItemById(itemId)
Returns core item data (no direct junction table relationships)

Setters:
updateItem(itemId, updateData)
Updates core item data (note: item-allergy relationships managed via meal APIs)

5. Favorites Management
Getters:
getUserFavoriteMeals(userId)
Returns user_favorite_meals junction table data

Setters:
addUserFavoriteMeal(userId, mealId)
Adds to user_favorite_meals junction table

removeUserFavoriteMeal(userId, mealId)
Removes from user_favorite_meals junction table

6. Order Management
Getters:
getOrderById(orderId)
Returns order data including:

order_meals junction table

order_items junction table

meals (via order_meals)

items (via order_items)

Setters:
createOrder(orderData)
Creates order with order_meals and order_items junction table entries

updateOrder(orderId, updates)
Updates core order data 

Key Junction Tables:
meal_items - Items in meals

meal_allergies - Allergies associated with meals

user_allergies - User-specific allergies

user_dietary_preferences - User dietary preferences

plan_meals - Meals in subscription plans

user_favorite_meals - User's favorite meals

order_meals - Meals in orders

order_items - Items in orders



