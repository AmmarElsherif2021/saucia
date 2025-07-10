import ItemForm from './ItemForm';
import MealForm from './MealsForm';
import PlanForm from './PlanForm';
import UserForm from './UserForm';
import OrderForm from './OrderForm';
import SubscriptionForm from './SubscriptionForm';
import AllergyForm from './AllergyForm';
import DietaryPreferenceForm from './DietaryPreferenceForm';
import { Badge } from '@chakra-ui/react';

// Entity configurations with unified operations support
export const ENTITY_CONFIGS = {
  items: {
    title: 'Items',
    singular: 'Item',
    FormComponent: ItemForm,
    searchFields: ['name', 'name_arabic', 'category', 'category_arabic', 'description'],
    initialData: {
      name: '',
      name_arabic: '',
      description: '',
      description_arabic: '',
      category: '',
      category_arabic: '',
      price: 0,
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      max_free_per_meal: 0,
      image_url: '',
      is_available: true,
      sort_order: 0,
      allergy_ids: [] // For junction table operations
    },
    columns: [
      { key: 'name', label: 'Name', width: '15%' },
      { key: 'name_arabic', label: 'Name (Arabic)', width: '15%' },
      { key: 'category', label: 'Category', width: '10%' },
      { key: 'category_arabic', label: 'Category (Arabic)', width: '10%' },
      { key: 'price', label: 'Price', width: '8%', format: value => `$${parseFloat(value).toFixed(2)}` },
      { key: 'max_free_per_meal', label: 'Free Count', width: '8%' },
      { 
        key: 'is_available', 
        label: 'Available', 
        width: '8%',
        render: value => (
          <Badge colorScheme={value ? 'green' : 'red'}>
            {value ? 'Yes' : 'No'}
          </Badge>
        )
      },
      { 
        key: 'allergies', 
        label: 'Allergies', 
        width: '15%',
        render: value => value?.length > 0 ? value.map(a => a.name).join(', ') : 'None'
      },
      { key: 'image_url', label: 'Image', width: '11%', truncate: true },
    ],
    // Operations using unified API methods
    operations: {
      useGetAll: 'useGetAllItems',
      useGetDetails: 'useGetItemDetails',
      createComplete: 'createItemComplete',
      updateComplete: 'updateItemComplete',
      deleteComplete: 'deleteItemComplete',
      updateAvailability: 'updateItemAvailability',
      bulkUpdate: 'bulkUpdateItems',
      // Loading states
      isCreating: 'isCreatingItemComplete',
      isUpdating: 'isUpdatingItemComplete',
      isDeleting: 'isDeletingItemComplete',
      isUpdatingAvailability: 'isUpdatingItemAvailability',
      isBulkUpdating: 'isBulkUpdatingItems',
      // Error states
      error: 'itemCompleteError'
    },
    exportName: 'items.json',
    hasImport: true,
    hasExport: true,
    supportsAvailability: true,
    supportsBulkOperations: true,
  },

  meals: {
    title: 'Meals',
    singular: 'Meal',
    FormComponent: MealForm,
    searchFields: ['name', 'name_arabic', 'section', 'section_arabic'],
    initialData: {
      name: '',
      name_arabic: '',
      section: '',
      section_arabic: '',
      base_price: 0, 
      calories: 0,   
      protein_g: 0, 
      carbs_g: 0,
      ingredients: '',
      ingredients_arabic: '',
      is_available: true,
      image_url: '' // Add this if missing
    },
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'name_arabic', label: 'Name (Arabic)' },
      { key: 'section', label: 'Section', render: (value) => value || 'N/A' },
      { key: 'section_arabic', label: 'Section (Arabic)', render: (value) => value || 'N/A' },
      { key: 'base_price', label: 'Price', render: value => `$${parseFloat(value || 0).toFixed(2)}` },
      { key: 'calories', label: 'Calories', render: (value) => value || 0 },
      { key: 'protein_g', label: 'Protein (g)', render: (value) => value || 0 },
      { key: 'carbs_g', label: 'Carbs (g)', render: (value) => value || 0 },
      { key: 'ingredients', label: 'Ingredients', truncate: true },
      { 
        key: 'is_available', 
        label: 'Available',
        render: value => (
          <Badge colorScheme={value ? 'green' : 'red'}>
            {value ? 'Yes' : 'No'}
          </Badge>
        )
      },
      { key: 'image_url', label: 'Image', truncate: true },
    ],
    // Operations using unified API methods
    operations: {
      useGetAll: 'useGetAllMeals',
      useGetDetails: 'useGetMealDetails',
      createComplete: 'createMealComplete',
      updateComplete: 'updateMealComplete',
      deleteComplete: 'deleteMealComplete',
      updateAvailability: 'updateMealAvailability',
      bulkUpdate: 'bulkUpdateMeals',
      bulkUpdateAvailability: 'bulkUpdateMealAvailability',
      // Loading states
      isCreating: 'isCreatingMealComplete',
      isUpdating: 'isUpdatingMealComplete',
      isDeleting: 'isDeletingMealComplete',
      isUpdatingAvailability: 'isUpdatingMealAvailability',
      isBulkUpdating: 'isBulkUpdatingMeals',
      isBulkUpdatingAvailability: 'isBulkUpdatingMealAvailability',
      // Error states
      error: 'mealCompleteError'
    },
    exportName: 'meals.json',
    hasImport: true,
    hasExport: true,
    supportsAvailability: true,
    supportsBulkOperations: true,
  },

  plans: {
    title: 'Plans',
    singular: 'Plan',
    FormComponent: PlanForm,
    searchFields: ['title', 'title_arabic', 'description'],
    initialData: {
      title: '',
      title_arabic: '',
      description: '',
      description_arabic: '',
      price_per_meal: 0,
      periods: [30], // Default period
      carb: 150,
      protein: 120,
      kcal: 2000,
      avatar_url: '',
      //members: [], // For junction table operations
      soaps: [], // For junction table operations
      snacks: [], // For junction table operations

        is_active: true
        },
        columns: [
        { key: 'title', label: 'Title (EN)', render: (value) => value || 'N/A' },
        { key: 'title_arabic', label: 'Title (AR)', render: (value) => value || 'N/A' },
        { 
          key: 'short_term_meals', 
          label: 'Short Term Meals',
          render: (value) => value ?? 0
        },
        { 
          key: 'medium_term_meals', 
          label: 'Medium Term Meals',
          render: (value) => value ?? 0
        },
        { key: 'carb', label: 'Carbs (g)', render: (value) => value || 0 },
        { key: 'protein', label: 'Protein (g)', render: (value) => value || 0 },
        { key: 'kcal', label: 'Calories (kcal)', render: (value) => value || 0 },
        { key: 'price_per_meal', label: 'Price/Meal', render: (value) => `$${parseFloat(value).toFixed(2)}` },
      { 
        key: 'is_active', 
        label: 'Status',
        render: (value) => (
          <Badge colorScheme={value ? 'green' : 'red'}>
            {value ? 'Active' : 'Inactive'}
          </Badge>
        )
      },
    ],
    // Operations using unified API methods
    operations: {
      useGetAll: 'useGetAllPlans',
      useGetDetails: 'useGetPlanDetails',
      createComplete: 'createPlanComplete',
      updateComplete: 'updatePlanComplete',
      deleteComplete: 'deletePlanComplete',
      updateStatus: 'updatePlanStatus',
      // Loading states
      isCreating: 'isCreatingPlanComplete',
      isUpdating: 'isUpdatingPlanComplete',
      isDeleting: 'isDeletingPlanComplete',
      isUpdatingStatus: 'isUpdatingPlanStatus',
      // Error states
      error: 'planCompleteError'
    },
    exportName: 'plans.json',
    hasImport: false,
    hasExport: true,
    supportsStatus: true,
    supportsBulkOperations: false,
  },

  users: {
    title: 'Users',
    singular: 'User',
    FormComponent: UserForm,
    searchFields: ['email', 'displayName', 'phone'],
    initialData: {
      display_name: '',
      phone_number: '',
      is_admin: false,
      account_status: 'active',
      loyalty_points: 0
    },
    columns: [
      { key: 'email', label: 'Email' },
      { key: 'display_name', label: 'Name' },
      { key: 'phone_number', label: 'Phone' },
      { key: 'is_admin', label: 'Role' },
      { key: 'account_status', label: 'Status' },
      { key: 'loyalty_points', label: 'Loyalty Points' },
      { 
        key: 'isAdmin', 
        label: 'Role',
        render: (value) => (
          <Badge colorScheme={value ? 'purple' : 'gray'}>
            {value ? 'Admin' : 'User'}
          </Badge>
        )
      },
      { 
        key: 'accountStatus', 
        label: 'Status',
        render: (value) => (
          <Badge colorScheme={value === 'active' ? 'green' : 'red'}>
            {value}
          </Badge>
        )
      },
      { 
        key: 'loyaltyPoints', 
        label: 'Loyalty Points',
        render: (value) => value || 0
      },
      { 
        key: 'allergies', 
        label: 'Allergies',
        render: (value) => value?.length > 0 ? `${value.length} allergies` : 'None'
      },
      { 
        key: 'dietary_preferences', 
        label: 'Dietary Preferences',
        render: (value) => value?.length > 0 ? `${value.length} preferences` : 'None'
      },
      { 
        key: 'created_at', 
        label: 'Created',
        render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
      },
    ],
    // Operations using unified API methods
    operations: {
      useGetAll: 'useGetAllUsers',
      useGetDetails: 'useGetUserDetails',
      useGetAllergies: 'useGetUserAllergies',
      useGetDietaryPreferences: 'useGetUserDietaryPreferences',
      updateComplete: 'updateUserComplete',
      setAdminStatus: 'setAdminStatus',
      updateLoyaltyPoints: 'updateLoyaltyPoints',
      updateAccountStatus: 'updateAccountStatus',
      bulkUpdate: 'bulkUpdateUsers',
      // Loading states
      isUpdating: 'isUpdatingUserComplete',
      isSettingAdmin: 'isSettingAdmin',
      isUpdatingLoyalty: 'isUpdatingLoyalty',
      isUpdatingAccountStatus: 'isUpdatingAccountStatus',
      isBulkUpdating: 'isBulkUpdatingUsers',
      // Error states
      error: 'userCompleteError'
    },
    exportName: 'users.json',
    hasImport: true,
    hasExport: true,
    supportsStatus: true,
    supportsBulkOperations: true,
  },

  orders: {
    title: 'Orders',
    singular: 'Order',
    FormComponent: OrderForm,
    searchFields: ['id', 'userId', 'status', 'customer_email'],
    initialData: {
      userId: '',
      status: 'pending',
      totalPrice: 0,
      isPaid: false,
      items: [], // For junction table operations
      delivery_address: '',
      delivery_date: '',
      notes: '',
      payment_status: 'unpaid',
      total_amount: 0
    },
    columns: [
      { key: 'id', label: 'Order ID', width: '10%' },
      { key: 'userId', label: 'User ID', width: '10%' },
      { key: 'customer_email', label: 'Customer', width: '15%' },
      { key: 'totalPrice', label: 'Total Price', width: '10%', format: value => `$${parseFloat(value).toFixed(2)}` },
      { key: 'payment_status', label: 'Payment' },
      { key: 'total_amount', label: 'Total' },
      { 
        key: 'status', 
        label: 'Status',
        width: '10%',
        render: (value) => (
          <Badge
            colorScheme={
              value === 'completed' ? 'green' :
              value === 'processing' ? 'blue' :
              value === 'cancelled' ? 'red' : 'gray'
            }
          >
            {value}
          </Badge>
        )
      },
      { 
        key: 'isPaid', 
        label: 'Payment',
        width: '10%',
        render: (value) => (
          <Badge colorScheme={value ? 'green' : 'orange'}>
            {value ? 'Paid' : 'Unpaid'}
          </Badge>
        )
      },
      { 
        key: 'delivery_date', 
        label: 'Delivery Date',
        width: '12%',
        render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
      },
      { 
        key: 'created_at', 
        label: 'Created',
        width: '12%',
        render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
      },
      { 
        key: 'items', 
        label: 'Items',
        width: '11%',
        render: (value) => value?.length > 0 ? `${value.length} items` : 'None'
      },
    ],
    // Operations using unified API methods
    operations: {
      useGetAll: 'useGetAllOrders',
      updateStatus: 'updateOrderStatus',
      update: 'updateOrder',
      // Loading states
      isUpdatingStatus: 'isUpdatingOrderStatus',
      isUpdating: 'isUpdatingOrder',
      // Error states
      error: 'orderError'
    },
    exportName: 'orders.json',
    hasImport: false,
    hasExport: true,
    supportsStatus: true,
    supportsBulkOperations: false,
  },

  subscriptions: {
    title: 'Subscriptions',
    singular: 'Subscription',
    FormComponent: SubscriptionForm,
    searchFields: ['id', 'userId', 'status', 'planId'],
    initialData: {
      userId: '',
      planId: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      status: 'active',
      price: 0,
      auto_renew: true
    },
    columns: [
      { key: 'id', label: 'ID', width: '10%' },
      { key: 'userId', label: 'User ID', width: '12%' },
      { key: 'planId', label: 'Plan ID', width: '12%' },
      { key: 'plan_title', label: 'Plan Name', width: '15%' },
      { 
        key: 'status', 
        label: 'Status',
        width: '10%',
        render: (value) => (
          <Badge
            colorScheme={
              value === 'active' ? 'green' :
              value === 'paused' ? 'yellow' :
              value === 'cancelled' ? 'red' : 'gray'
            }
          >
            {value}
          </Badge>
        )
      },
      { 
        key: 'start_date', 
        label: 'Start Date',
        width: '12%',
        render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
      },
      { 
        key: 'end_date', 
        label: 'End Date',
        width: '12%',
        render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
      },
      { 
        key: 'price', 
        label: 'Price',
        width: '10%',
        format: value => `$${parseFloat(value).toFixed(2)}`
      },
      { 
        key: 'auto_renew', 
        label: 'Auto Renew',
        width: '7%',
        render: (value) => (
          <Badge colorScheme={value ? 'green' : 'gray'}>
            {value ? 'Yes' : 'No'}
          </Badge>
        )
      },
    ],
    // Operations using unified API methods
    operations: {
      useGetAll: 'useGetAllSubscriptions',
      updateStatus: 'updateSubscriptionStatus',
      update: 'updateSubscription',
      // Loading states
      isUpdatingStatus: 'isUpdatingSubscriptionStatus',
      isUpdating: 'isUpdatingSubscription',
      // Error states
      error: 'subscriptionError'
    },
    exportName: 'subscriptions.json',
    hasImport: false,
    hasExport: true,
    supportsStatus: true,
    supportsBulkOperations: false,
  },

  allergies: {
    title: 'Allergies',
    singular: 'Allergy',
    FormComponent: AllergyForm,
    searchFields: ['name', 'name_arabic', 'description'],
    initialData: {
      name: '',
      name_arabic: '',
      severity_level: 1 
    },
    columns: [
      { key: 'name', label: 'Name (EN)', width: '30%' },
      { key: 'name_arabic', label: 'Name (AR)', width: '30%' },
      { 
        key: 'severity_level', 
        label: 'Severity',
        render: value => {
          const levels = {1: 'Low', 2: 'Medium', 3: 'High'};
          return <Badge colorScheme={value===3?'red':value===2?'yellow':'green'}>
            {levels[value] || value}
          </Badge>;
        }
      }
    ],
    // Operations using unified API methods
    operations: {
      useGetAll: 'useGetAllAllergies',
      createComplete: 'createAllergyComplete',
      updateComplete: 'updateAllergyComplete',
      deleteComplete: 'deleteAllergyComplete',
      // Loading states
      isCreating: 'isCreatingAllergyComplete',
      isUpdating: 'isUpdatingAllergyComplete',
      isDeleting: 'isDeletingAllergyComplete',
      // Error states
      error: 'allergyCompleteError'
    },
    exportName: 'allergies.json',
    hasImport: true,
    hasExport: true,
    supportsBulkOperations: false,
  },

  dietaryPreferences: {
    title: 'Dietary Preferences',
    singular: 'Dietary Preference',
    FormComponent: DietaryPreferenceForm,
    searchFields: ['name', 'name_arabic', 'category'],
    initialData: {
      name: '',
      name_arabic: '',
      description: ''
    },
    columns: [
      { key: 'name', label: 'Name (EN)', width: '35%' },
      { key: 'name_arabic', label: 'Name (AR)', width: '35%' },
      { key: 'description', label: 'Description', width: '30%' }
    ],
    // Operations using unified API methods
    operations: {
      useGetAll: 'useGetAllDietaryPreferences',
      createComplete: 'createDietaryPreferenceComplete',
      updateComplete: 'updateDietaryPreferenceComplete',
      deleteComplete: 'deleteDietaryPreferenceComplete',
      // Loading states
      isCreating: 'isCreatingDietaryPreferenceComplete',
      isUpdating: 'isUpdatingDietaryPreferenceComplete',
      isDeleting: 'isDeletingDietaryPreferenceComplete',
      // Error states
      error: 'dietaryPreferenceCompleteError'
    },
    exportName: 'dietary-preferences.json',
    hasImport: true,
    hasExport: true,
    supportsBulkOperations: false,
  },

  // Analytics and Dashboard specific configurations
  dashboard: {
    title: 'Dashboard',
    operations: {
      useGetStats: 'useGetDashboardStats',
      useGetRecentActivity: 'useGetRecentActivity'
    }
  }
};

// Helper function to get entity configuration
export const getEntityConfig = (entityType) => {
  return ENTITY_CONFIGS[entityType] || null;
};

// Helper function to get all entity types
export const getEntityTypes = () => {
  return Object.keys(ENTITY_CONFIGS);
};

// Helper function to get entities that support specific features
export const getEntitiesWithFeature = (feature) => {
  return Object.entries(ENTITY_CONFIGS)
    .filter(([_, config]) => config[feature])
    .map(([entityType, _]) => entityType);
};

// Helper function to get operation method name for an entity
export const getOperationMethod = (entityType, operationType) => {
  const config = ENTITY_CONFIGS[entityType];
  return config?.operations?.[operationType] || null;
};

// Validation helper for entity data
export const validateEntityData = (entityType, data) => {
  const config = ENTITY_CONFIGS[entityType];
  if (!config) return { isValid: false, errors: ['Invalid entity type'] };

  const errors = [];
  const initialData = config.initialData;

  // Check required fields based on initial data structure
  Object.keys(initialData).forEach(key => {
    if (initialData[key] === '' && (!data[key] || data[key] === '')) {
      // Only flag as error if it's a string field that's required
      if (typeof initialData[key] === 'string' && ['name', 'email', 'title'].includes(key)) {
        errors.push(`${key} is required`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default ENTITY_CONFIGS;