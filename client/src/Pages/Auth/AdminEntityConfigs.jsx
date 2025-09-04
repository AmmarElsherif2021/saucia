import ItemForm from './ItemForm';
import MealForm from './MealsForm';
import PlanForm from './PlanForm';
import UserForm from './UserForm';
import OrderForm from './OrderForm';
import SubscriptionForm from './SubscriptionForm';
import AllergyForm from './AllergyForm';
import DietaryPreferenceForm from './DietaryPreferenceForm';
import { Badge } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

// Helper to wrap label/strings with t()
const withT = (t, value) => (typeof value === 'string' ? t(value) : value);

// Factory to generate configs with translation
export const useEntityConfigs = () => {
  const { t } = useTranslation();

  // Entity configurations with unified operations support
  const ENTITY_CONFIGS = {
    items: {
      title: t('admin.Items'),
      singular: t('admin.Item'),
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
        allergy_ids: []
      },
      columns: [
        { key: 'name', label: t('admin.Name'), width: '15%' },
        { key: 'name_arabic', label: t('admin.Name (Arabic)'), width: '15%' },
        { key: 'category', label: t('admin.Category'), width: '10%' },
        { key: 'category_arabic', label: t('admin.Category (Arabic)'), width: '10%' },
        { key: 'price', label: t('admin.Price'), width: '8%', format: value => `$${parseFloat(value).toFixed(2)}` },
        { key: 'max_free_per_meal', label: t('admin.Free Count'), width: '8%' },
        {
          key: 'is_available',
          label: t('admin.Available'),
          width: '8%',
          render: value => (
            <Badge colorScheme={value ? 'green' : 'red'}>
              {value ? t('admin.Yes') : t('admin.No')}
            </Badge>
          )
        },
          {
          key: 'item_allergies', // Change from 'allergies' to 'item_allergies'
          label: t('admin.Allergies'),
          width: '15%',
          render: value => value?.length > 0 
            ? value.map(ia => ia.allergies.name).join(', ') 
            : t('admin.None')
        },
        { key: 'image_url', label: t('admin.Image'), width: '11%', truncate: true },
      ],
      operations: {
        useGetAll: 'useGetAllItems',
        useGetDetails: 'useGetItemDetails',
        createComplete: 'createItemComplete',
        updateComplete: 'updateItemComplete',
        deleteComplete: 'deleteItemComplete',
        updateAvailability: 'updateItemAvailability',
        bulkUpdate: 'bulkUpdateItems',
        isCreating: 'isCreatingItemComplete',
        isUpdating: 'isUpdatingItemComplete',
        isDeleting: 'isDeletingItemComplete',
        isUpdatingAvailability: 'isUpdatingItemAvailability',
        isBulkUpdating: 'isBulkUpdatingItems',
        error: 'itemCompleteError'
      },
      exportName: 'items.json',
      hasImport: true,
      hasExport: true,
      supportsAvailability: true,
      supportsBulkOperations: true,
    },

    meals: {
      title: t('admin.Meals'),
      singular: t('admin.Meal'),
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
        image_url: '',
        allergy_ids: []
      },
      columns: [
        { key: 'name', label: t('admin.Name') },
        { key: 'name_arabic', label: t('admin.Name (Arabic)') },
        { key: 'section', label: t('admin.Section'), render: (value) => value || t('admin.N/A') },
        { key: 'section_arabic', label: t('admin.Section (Arabic)'), render: (value) => value || t('admin.N/A') },
        { key: 'base_price', label: t('admin.Price'), render: value => `$${parseFloat(value || 0).toFixed(2)}` },
        { key: 'calories', label: t('admin.Calories'), render: (value) => value || 0 },
        { key: 'protein_g', label: t('admin.Protein (g)'), render: (value) => value || 0 },
        { key: 'carbs_g', label: t('admin.Carbs (g)'), render: (value) => value || 0 },
        { key: 'ingredients', label: t('admin.Ingredients'), truncate: true },
        { key: 'description', label: t('admin.description'), truncate: true },
        { key: 'description_arabic', label: t('admin.description_arabic'), truncate: true },
        {
          key: 'is_featured',
          label: t('admin.featured'),
          render: value => (
            <Badge colorScheme={value ? 'green' : 'red'}>
              {value ? t('admin.Yes') : t('admin.No')}
            </Badge>
          )
        },
        {
          key: 'is_available',
          label: t('admin.Available'),
          render: value => (
            <Badge colorScheme={value ? 'green' : 'red'}>
              {value ? t('admin.Yes') : t('admin.No')}
            </Badge>
          )
        },
        {
          key: 'meal_allergies', 
          label: t('admin.Allergies'),
          width: '15%',
          render: value => value?.length > 0 
            ? value.map(ma => ma.allergies.name).join(', ') 
            : t('admin.None')
        },
        { key: 'image_url', label: t('admin.Image'), truncate: true },
      ],
      operations: {
        useGetAll: 'useGetAllMeals',
        useGetDetails: 'useGetMealDetails',
        createComplete: 'createMealComplete',
        updateComplete: 'updateMealComplete',
        deleteComplete: 'deleteMealComplete',
        updateAvailability: 'updateMealAvailability',
        bulkUpdate: 'bulkUpdateMeals',
        bulkUpdateAvailability: 'bulkUpdateMealAvailability',
        isCreating: 'isCreatingMealComplete',
        isUpdating: 'isUpdatingMealComplete',
        isDeleting: 'isDeletingMealComplete',
        isUpdatingAvailability: 'isUpdatingMealAvailability',
        isBulkUpdating: 'isBulkUpdatingMeals',
        isBulkUpdatingAvailability: 'isBulkUpdatingMealAvailability',
        error: 'mealCompleteError'
      },
      exportName: 'meals.json',
      hasImport: true,
      hasExport: true,
      supportsAvailability: true,
      supportsBulkOperations: true,
    },

    plans: {
      title: t('admin.Plans'),
      singular: t('admin.Plan'),
      FormComponent: PlanForm,
      searchFields: ['title', 'title_arabic', 'description'],
      initialData: {
        title: '',
        title_arabic: '',
        description: '',
        description_arabic: '',
        price_per_meal: 0,
        periods: [30],
        carb: 150,
        protein: 120,
        kcal: 2000,
        avatar_url: '',
        soaps: [],
        snacks: [],
        meals: [], 
        additives: [], 
        is_active: true
      },
      columns: [
        { key: 'title', label: t('admin.Title (EN)'), render: (value) => value || t('admin.N/A') },
        { key: 'title_arabic', label: t('admin.Title (AR)'), render: (value) => value || t('admin.N/A') },
        {
          key: 'short_term_meals',
          label: t('admin.Short Term Meals'),
          render: (value) => value ?? 0
        },
        {
          key: 'medium_term_meals',
          label: t('admin.Medium Term Meals'),
          render: (value) => value ?? 0
        },
        { key: 'carb', label: t('admin.Carbs (g)'), render: (value) => value || 0 },
        { key: 'protein', label: t('admin.Protein (g)'), render: (value) => value || 0 },
        { key: 'kcal', label: t('admin.Calories (kcal)'), render: (value) => value || 0 },
        { key: 'price_per_meal', label: t('admin.Price/Meal'), render: (value) => `$${parseFloat(value).toFixed(2)}` },
        {
          key: 'is_active',
          label: t('admin.Status'),
          render: (value) => (
            <Badge colorScheme={value ? 'green' : 'red'}>
              {value ? t('admin.Active') : t('admin.Inactive')}
            </Badge>
          )
        },
      ],
      operations: {
        useGetAll: 'useGetAllPlans',
        useGetDetails: 'useGetPlanDetails',
        createComplete: 'createPlanComplete',
        updateComplete: 'updatePlanComplete',
        deleteComplete: 'deletePlanComplete',
        updateStatus: 'updatePlanStatus',
        isCreating: 'isCreatingPlanComplete',
        isUpdating: 'isUpdatingPlanComplete',
        isDeleting: 'isDeletingPlanComplete',
        isUpdatingStatus: 'isUpdatingPlanStatus',
        error: 'planCompleteError'
      },
      exportName: 'plans.json',
      hasImport: false,
      hasExport: true,
      supportsStatus: true,
      supportsBulkOperations: false,
    },

    users: {
      title: t('admin.Users'),
      singular: t('admin.User'),
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
        { key: 'email', label: t('admin.Email') },
        { key: 'display_name', label: t('admin.Name') },
        { key: 'phone_number', label: t('admin.Phone') },
        { key: 'is_admin', label: t('admin.Role') },
        { key: 'account_status', label: t('admin.Status') },
        { key: 'loyalty_points', label: t('admin.Loyalty Points') },
        {
          key: 'isAdmin',
          label: t('admin.Role'),
          render: (value) => (
            <Badge colorScheme={value ? 'purple' : 'gray'}>
              {value ? t('admin.Admin') : t('admin.User')}
            </Badge>
          )
        },
        {
          key: 'accountStatus',
          label: t('admin.Status'),
          render: (value) => (
            <Badge colorScheme={value === 'active' ? 'green' : 'red'}>
              {t(value)}
            </Badge>
          )
        },
        {
          key: 'loyaltyPoints',
          label: t('admin.Loyalty Points'),
          render: (value) => value || 0
        },
        {
          key: 'allergies',
          label: t('admin.Allergies'),
          render: (value) => value?.length > 0 ? `${value.length} ${t('admin.allergies')}` : t('admin.None')
        },
        {
          key: 'dietary_preferences',
          label: t('admin.Dietary Preferences'),
          render: (value) => value?.length > 0 ? `${value.length} ${t('admin.preferences')}` : t('admin.None')
        },
        {
          key: 'created_at',
          label: t('admin.Created'),
          render: (value) => value ? new Date(value).toLocaleDateString() : t('admin.N/A')
        },
      ],
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
        isUpdating: 'isUpdatingUserComplete',
        isSettingAdmin: 'isSettingAdmin',
        isUpdatingLoyalty: 'isUpdatingLoyalty',
        isUpdatingAccountStatus: 'isUpdatingAccountStatus',
        isBulkUpdating: 'isBulkUpdatingUsers',
        error: 'userCompleteError'
      },
      exportName: 'users.json',
      hasImport: true,
      hasExport: true,
      supportsStatus: true,
      supportsBulkOperations: true,
    },

    orders: {
      title: t('admin.Orders'),
      singular: t('admin.Order'),
      FormComponent: OrderForm,
      searchFields: ['id', 'userId', 'status', 'customer_email'],
      initialData: {
        userId: '',
        status: 'pending',
        totalPrice: 0,
        isPaid: false,
        items: [],
        delivery_address: '',
        delivery_date: '',
        notes: '',
        payment_status: 'unpaid',
        total_amount: 0
      },
      columns: [
        { key: 'id', label: t('admin.Order ID'), width: '10%' },
        { key: 'userId', label: t('admin.User ID'), width: '10%' },
        { key: 'customer_email', label: t('admin.Customer'), width: '15%' },
        { key: 'totalPrice', label: t('admin.Total Price'), width: '10%', format: value => `$${parseFloat(value).toFixed(2)}` },
        { key: 'payment_status', label: t('admin.Payment') },
        { key: 'total_amount', label: t('admin.Total') },
        {
          key: 'status',
          label: t('admin.Status'),
          width: '10%',
          render: (value) => (
            <Badge
              colorScheme={
                value === 'completed' ? 'green' :
                  value === 'processing' ? 'blue' :
                    value === 'cancelled' ? 'red' : 'gray'
              }
            >
              {t(value)}
            </Badge>
          )
        },
        {
          key: 'isPaid',
          label: t('admin.Payment'),
          width: '10%',
          render: (value) => (
            <Badge colorScheme={value ? 'green' : 'orange'}>
              {value ? t('admin.Paid') : t('admin.Unpaid')}
            </Badge>
          )
        },
        {
          key: 'delivery_date',
          label: t('admin.Delivery Date'),
          width: '12%',
          render: (value) => value ? new Date(value).toLocaleDateString() : t('admin.N/A')
        },
        {
          key: 'created_at',
          label: t('admin.Created'),
          width: '12%',
          render: (value) => value ? new Date(value).toLocaleDateString() : t('admin.N/A')
        },
        {
          key: 'items',
          label: t('admin.Items'),
          width: '11%',
          render: (value) => value?.length > 0 ? `${value.length} ${t('admin.items')}` : t('admin.None')
        },
      ],
      operations: {
        useGetAll: 'useGetAllOrders',
        updateStatus: 'updateOrderStatus',
        update: 'updateOrder',
        isUpdatingStatus: 'isUpdatingOrderStatus',
        isUpdating: 'isUpdatingOrder',
        error: 'orderError'
      },
      exportName: 'orders.json',
      hasImport: false,
      hasExport: true,
      supportsStatus: true,
      supportsBulkOperations: false,
    },

    subscriptions: {
      title: t('admin.Subscriptions'),
      singular: t('admin.Subscription'),
      FormComponent: SubscriptionForm,
      searchFields: ['id', 'userId', 'status', 'planId'],
      initialData: {
        userId: '',
        planId: '',
        start_date: new Date().toISOString().split('admin.T')[0],
        end_date: '',
        status: 'active',
        price: 0,
        auto_renew: true,
        meals: [],
        additives: []
      },
      columns: [
        { key: 'id', label: t('admin.ID'), width: '10%' },
        { key: 'userId', label: t('admin.User ID'), width: '12%' },
        { key: 'planId', label: t('admin.Plan ID'), width: '12%' },
        { key: 'plan_title', label: t('admin.Plan Name'), width: '15%' },
        {
          key: 'meals',
          label: t('admin.Meals'),
          width: '10%',
          render: value => value?.length ? `${value.length} meals` : t('admin.None')
        },
        {
          key: 'additives',
          label: t('admin.Additives'),
          width: '10%',
          render: value => value?.length ? `${value.length} items` : t('admin.None')
        },
        {
          key: 'status',
          label: t('admin.Status'),
          width: '10%',
          render: (value) => (
            <Badge
              colorScheme={
                value === 'active' ? 'green' :
                  value === 'paused' ? 'yellow' :
                    value === 'cancelled' ? 'red' : 'gray'
              }
            >
              {t(value)}
            </Badge>
          )
        },
        {
          key: 'start_date',
          label: t('admin.Start Date'),
          width: '12%',
          render: (value) => value ? new Date(value).toLocaleDateString() : t('admin.N/A')
        },
        {
          key: 'end_date',
          label: t('admin.End Date'),
          width: '12%',
          render: (value) => value ? new Date(value).toLocaleDateString() : t('admin.N/A')
        },
        {
          key: 'price',
          label: t('admin.Price'),
          width: '10%',
          format: value => `$${parseFloat(value).toFixed(2)}`
        },
        {
          key: 'auto_renew',
          label: t('admin.Auto Renew'),
          width: '7%',
          render: (value) => (
            <Badge colorScheme={value ? 'green' : 'gray'}>
              {value ? t('admin.Yes') : t('admin.No')}
            </Badge>
          )
        },
      ],
      operations: {
        useGetAll: 'useGetAllSubscriptions',
        updateStatus: 'updateSubscriptionStatus',
        update: 'updateSubscription',
        isUpdatingStatus: 'isUpdatingSubscriptionStatus',
        isUpdating: 'isUpdatingSubscription',
        error: 'subscriptionError'
      },
      exportName: 'subscriptions.json',
      hasImport: false,
      hasExport: true,
      supportsStatus: true,
      supportsBulkOperations: false,
    },

    allergies: {
      title: t('admin.Allergies'),
      singular: t('admin.Allergy'),
      FormComponent: AllergyForm,
      searchFields: ['name', 'name_arabic', 'description'],
      initialData: {
        name: '',
        name_arabic: '',
        severity_level: 1
      },
      columns: [
        { key: 'name', label: t('admin.Name (EN)'), width: '30%' },
        { key: 'name_arabic', label: t('admin.Name (AR)'), width: '30%' },
        {
          key: 'severity_level',
          label: t('admin.Severity'),
          render: value => {
            const levels = { 1: t('admin.Low'), 2: t('admin.Medium'), 3: t('admin.High') };
            return <Badge colorScheme={value === 3 ? 'red' : value === 2 ? 'yellow' : 'green'}>
              {levels[value] || value}
            </Badge>;
          }
        }
      ],
      operations: {
        useGetAll: 'useGetAllAllergies',
        createComplete: 'createAllergyComplete',
        updateComplete: 'updateAllergyComplete',
        deleteComplete: 'deleteAllergyComplete',
        isCreating: 'isCreatingAllergyComplete',
        isUpdating: 'isUpdatingAllergyComplete',
        isDeleting: 'isDeletingAllergyComplete',
        error: 'allergyCompleteError'
      },
      exportName: 'allergies.json',
      hasImport: true,
      hasExport: true,
      supportsBulkOperations: false,
    },

    dietaryPreferences: {
      title: t('admin.Dietary Preferences'),
      singular: t('admin.Dietary Preference'),
      FormComponent: DietaryPreferenceForm,
      searchFields: ['name', 'name_arabic', 'category'],
      initialData: {
        name: '',
        name_arabic: '',
        description: ''
      },
      columns: [
        { key: 'name', label: t('admin.Name (EN)'), width: '35%' },
        { key: 'name_arabic', label: t('admin.Name (AR)'), width: '35%' },
        { key: 'description', label: t('admin.Description'), width: '30%' }
      ],
      operations: {
        useGetAll: 'useGetAllDietaryPreferences',
        createComplete: 'createDietaryPreferenceComplete',
        updateComplete: 'updateDietaryPreferenceComplete',
        deleteComplete: 'deleteDietaryPreferenceComplete',
        isCreating: 'isCreatingDietaryPreferenceComplete',
        isUpdating: 'isUpdatingDietaryPreferenceComplete',
        isDeleting: 'isDeletingDietaryPreferenceComplete',
        error: 'dietaryPreferenceCompleteError'
      },
      exportName: 'dietary-preferences.json',
      hasImport: true,
      hasExport: true,
      supportsBulkOperations: false,
    },

    dashboard: {
      title: t('admin.Dashboard'),
      operations: {
        useGetStats: 'useGetDashboardStats',
        useGetRecentActivity: 'useGetRecentActivity'
      }
    }
  };

  // Helper function to get entity configuration
  const getEntityConfig = (entityType) => {
    return ENTITY_CONFIGS[entityType] || null;
  };

  // Helper function to get all entity types
  const getEntityTypes = () => {
    return Object.keys(ENTITY_CONFIGS);
  };

  // Helper function to get entities that support specific features
  const getEntitiesWithFeature = (feature) => {
    return Object.entries(ENTITY_CONFIGS)
      .filter(([_, config]) => config[feature])
      .map(([entityType, _]) => entityType);
  };

  // Helper function to get operation method name for an entity
  const getOperationMethod = (entityType, operationType) => {
    const config = ENTITY_CONFIGS[entityType];
    return config?.operations?.[operationType] || null;
  };

  // Validation helper for entity data
  const validateEntityData = (entityType, data) => {
    const config = ENTITY_CONFIGS[entityType];
    if (!config) return { isValid: false, errors: [t('admin.Invalid entity type')] };

    const errors = [];
    const initialData = config.initialData;

    Object.keys(initialData).forEach(key => {
      if (initialData[key] === '' && (!data[key] || data[key] === '')) {
        if (typeof initialData[key] === 'string' && ['name', 'email', 'title'].includes(key)) {
          errors.push(t('admin.{{key}} is required', { key: t(key) }));
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return {
    ENTITY_CONFIGS,
    getEntityConfig,
    getEntityTypes,
    getEntitiesWithFeature,
    getOperationMethod,
    validateEntityData
  };
};

export default useEntityConfigs;
