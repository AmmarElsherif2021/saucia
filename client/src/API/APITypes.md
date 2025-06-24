# Supabase Models Documentation

## Item Model

### Properties
| Property             | Type      | Default   | Description                     |
|:---------------------|:----------|:----------|:-------------------------------|
| `id`                 | `number`  | -         | Unique identifier              |
| `name`               | `string`  | `''`      | Item name in English           |
| `name_arabic`        | `string`  | `''`      | Item name in Arabic            |
| `description`        | `string`  | `''`      | Item description in English    |
| `description_arabic` | `string`  | `''`      | Item description in Arabic     |
| `category`           | `string`  | `'side'`  | Item category                 |
| `category_arabic`    | `string`  | `''`      | Category name in Arabic       |
| `price`              | `number`  | `0`       | Item price                   |
| `calories`           | `number`  | `0`       | Calories per serving         |
| `protein_g`          | `number`  | `0`       | Protein content in grams     |
| `carbs_g`            | `number`  | `0`       | Carbohydrates content in grams |
| `fat_g`              | `number`  | `0`       | Fat content in grams         |
| `max_free_per_meal`  | `number`  | `0`       | Maximum free items per meal  |
| `image_url`          | `string`  | `''`      | URL to item image            |
| `is_available`       | `boolean` | `true`    | Availability status          |
| `sort_order`         | `number`  | `0`       | Display order                |
| `created_at`         | `string`  | -         | ISO timestamp                |
| `updated_at`         | `string`  | -         | ISO timestamp                |

### Meal Model

### Properties
| Property                 | Type        | Default   | Description                          |
|:-------------------------|:------------|:----------|:------------------------------------|
| `id`                     | `number`    | -         | Unique identifier                   |
| `name`                   | `string`    | `''`      | Meal name in English                |
| `nameArabic`             | `string`    | `''`      | Meal name in Arabic                 |
| `description`            | `string`    | `''`      | Meal description in English         |
| `descriptionArabic`      | `string`    | `''`      | Meal description in Arabic          |
| `section`                | `string`    | `''`      | Meal section/category               |
| `sectionArabic`          | `string`    | `''`      | Section name in Arabic              |
| `basePrice`              | `number`    | `0`       | Base price of meal                  |
| `calories`               | `number`    | `0`       | Calories per serving                |
| `proteinG`               | `number`    | `0`       | Protein content in grams            |
| `carbsG`                 | `number`    | `0`       | Carbohydrates content in grams      |
| `fatG`                   | `number`    | `0`       | Fat content in grams                |
| `fiberG`                 | `number`    | `0`       | Fiber content in grams              |
| `sugarG`                 | `number`    | `0`       | Sugar content in grams              |
| `sodiumMg`               | `number`    | `0`       | Sodium content in milligrams        |
| `ingredients`            | `string`    | `''`      | Ingredients list in English         |
| `ingredientsArabic`      | `string`    | `''`      | Ingredients list in Arabic          |
| `preparationInstructions`| `string`    | `''`      | Preparation instructions            |
| `imageUrl`               | `string`    | `''`      | URL to meal image                   |
| `thumbnailUrl`           | `string`    | `''`      | URL to thumbnail image              |
| `isPremium`              | `boolean`   | `false`   | Premium meal flag                   |
| `isVegetarian`           | `boolean`   | `false`   | Vegetarian meal flag                |
| `isVegan`                | `boolean`   | `false`   | Vegan meal flag                     |
| `isGlutenFree`           | `boolean`   | `false`   | Gluten-free meal flag               |
| `isDairyFree`            | `boolean`   | `false`   | Dairy-free meal flag                |
| `spiceLevel`             | `number`    | `0`       | Spice level (0-5)                   |
| `prepTimeMinutes`        | `number`    | `0`       | Preparation time in minutes         |
| `rating`                 | `number`    | `0`       | Average rating                      |
| `ratingCount`            | `number`    | `0`       | Number of ratings                   |
| `isFeatured`             | `boolean`   | `false`   | Featured meal flag                  |
| `discountPercentage`     | `number`    | `0`       | Discount percentage                 |
| `discountValidUntil`     | `string|null` | `null`    | Discount expiry date                |
| `isAvailable`            | `boolean`   | `true`    | Availability status                 |
| `createdAt`              | `string`    | -         | ISO timestamp                       |
| `updatedAt`              | `string`    | -         | ISO timestamp                       |

### Order Model

### Properties
| Property               | Type        | Default     | Description                      |
|:-----------------------|:------------|:------------|:--------------------------------|
| `id`                   | `number`    | -           | Unique identifier               |
| `userId`               | `string|null` | `null`      | User ID                         |
| `subscriptionId`       | `number|null` | `null`      | Subscription ID                 |
| `orderNumber`          | `string`    | `''`        | Order number                    |
| `subtotal`             | `number`    | `0`         | Subtotal amount                 |
| `tax`                  | `number`    | `0`         | Tax amount                      |
| `discount`             | `number`    | `0`         | Discount amount                 |
| `deliveryFee`          | `number`    | `0`         | Delivery fee                    |
| `totalPrice`           | `number`    | `0`         | Total amount                    |
| `status`               | `string`    | `'pending'` | Order status                    |
| `paymentStatus`        | `string`    | `'pending'` | Payment status                  |
| `paymentMethod`        | `string|null` | `null`      | Payment method                  |
| `paymentId`            | `string`    | `''`        | Payment reference               |
| `paymentDate`          | `string|null` | `null`      | Payment date                    |
| `deliveryAddressId`    | `number|null` | `null`      | Delivery address ID             |
| `deliveryInstructions` | `string`    | `''`        | Delivery instructions           |
| `deliveryDate`         | `string|null` | `null`      | Scheduled delivery date         |
| `contactPhone`         | `string`    | `''`        | Contact phone number            |
| `notes`                | `string`    | `''`        | Special instructions            |
| `couponCode`           | `string`    | `''`        | Coupon code used                |
| `loyaltyPointsUsed`    | `number`    | `0`         | Loyalty points used             |
| `loyaltyPointsEarned`  | `number`    | `0`         | Loyalty points earned           |
| `createdAt`            | `string`    | -           | ISO timestamp                   |
| `updatedAt`            | `string`    | -           | ISO timestamp                   |

### Plan Model

### Properties
| Property               | Type        | Default   | Description                      |
|:-----------------------|:------------|:----------|:--------------------------------|
| `id`                   | `number`    | -         | Unique identifier               |
| `title`                | `string`    | `''`      | Plan title in English           |
| `titleArabic`          | `string`    | `''`      | Plan title in Arabic            |
| `description`          | `string`    | `''`      | Plan description in English     |
| `descriptionArabic`    | `string`    | `''`      | Plan description in Arabic      |
| `pricePerMeal`         | `number`    | `0`       | Price per meal                  |
| `short_term_meals`     | `number`    | `0`       | Minimum meals per week          |
| `medium_term_meals`    | `number`    | `0`       | Maximum meals per week          |
| `durationDays`         | `number`    | `0`       | Plan duration in days           |
| `targetCaloriesPerMeal`| `number|null` | `null`    | Target calories per meal        |
| `targetProteinPerMeal` | `number|null` | `null`    | Target protein per meal         |
| `targetCarbsPerMeal`   | `number|null` | `null`    | Target carbs per meal           |
| `avatarUrl`            | `string|null` | `null`    | Plan avatar image URL           |
| `isActive`             | `boolean`   | `true`    | Plan active status              |
| `sortOrder`            | `number`    | `0`       | Display order                   |
| `createdAt`            | `string`    | -         | ISO timestamp                   |
| `updatedAt`            | `string`    | -         | ISO timestamp                   |

### User Model

### Properties
| Property           | Type        | Default   | Description                      |
|:-------------------|:------------|:----------|:--------------------------------|
| `id`               | `string`    | -         | Unique identifier (Supabase)    |
| `uid`              | `string`    | -         | Same as id                      |
| `email`            | `string`    | `''`      | User email                      |
| `displayName`      | `string`    | `''`      | Display name                    |
| `firstName`        | `string`    | `''`      | First name                      |
| `lastName`         | `string`    | `''`      | Last name                       |
| `phoneNumber`      | `string`    | `''`      | Phone number                    |
| `avatarUrl`        | `string`    | `''`      | Avatar image URL                |
| `isAdmin`          | `boolean`   | `false`   | Admin status                    |
| `loyaltyPoints`    | `number`    | `0`       | Loyalty points balance          |
| `notes`            | `string`    | `''`      | Admin notes                     |
| `language`         | `string`    | `'en'`    | Preferred language              |
| `age`              | `number|null` | `null`    | User age                        |
| `gender`           | `string|null` | `null`    | User gender                     |
| `createdAt`        | `string`    | -         | ISO timestamp                   |
| `updatedAt`        | `string`    | -         | ISO timestamp                   |
| `lastLogin`        | `string`    | -         | Last login timestamp            |
| `addresses`        | `array`     | `[]`      | User addresses                  |
| `paymentMethods`   | `array`     | `[]`      | Payment methods                 |
| `healthProfile`    | `object|null` | `null`    | Health profile data             |
| `subscriptions`    | `array`     | `[]`      | User subscriptions              |

## Custom React Hooks

### useItems Hook
```javascript
// src/hooks/useItems.js
import { useState, useEffect, useCallback } from 'react';
import { 
  listItems, 
  getItemById, 
  createItem, 
  updateItem, 
  deleteItem,
  getItemsBySection
} from '../api/items';

export function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async (queryParams = {}) => {
    setLoading(true);
    try {
      const data = await listItems(queryParams);
      setItems(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchItem = useCallback(async (itemId) => {
    setLoading(true);
    try {
      return await getItemById(itemId);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback(async (token, itemData) => {
    setLoading(true);
    try {
      const newItem = await createItem(token, itemData);
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const modifyItem = useCallback(async (token, itemId, updates) => {
    setLoading(true);
    try {
      const updatedItem = await updateItem(token, itemId, updates);
      setItems(prev => 
        prev.map(item => item.id === itemId ? updatedItem : item)
      );
      return updatedItem;
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeItem = useCallback(async (token, itemId) => {
    setLoading(true);
    try {
      await deleteItem(token, itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSectionItems = useCallback(async (section) => {
    setLoading(true);
    try {
      const data = await getItemsBySection(section);
      setItems(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    items,
    loading,
    error,
    fetchItems,
    fetchItem,
    addItem,
    modifyItem,
    removeItem,
    fetchSectionItems
  };
}