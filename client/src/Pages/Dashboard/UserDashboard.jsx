// UserDashboard.jsx - Refactored Version
import { useState, useEffect, Suspense, lazy,useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  TabPanels,
  TabPanel,
  TabList,
  Tab,
  useColorMode, 
  useToast, 
  Spinner, 
  Box 
} from '@chakra-ui/react';
// Import dashboard components and sections
import {
  ResponsiveDashboardLayout,
  ResponsiveTabLayout,
  MobileTabList,
  OrderHistoryTable,
  SubscriptionDetails
} from './DashboardComponents';

import {
  ProfileHeader,
  OverviewSection,
  OrderHistorySection,
  SubscriptionSection,
  AddressesSection,
  PaymentMethodsSection,
  ReviewsSection,
  FavoritesSection
} from './DashboardSections';

import EnhancedProfileModal from './EnhancedProfileModal';

// Context and hooks
import { useAuthContext } from '../../Contexts/AuthContext';
import { 
  useUserProfile, 
  useHealthProfile, 
  useUserAddresses, 
  useUserOrders,
  useUserAllergies,
  useDietaryPreferences,
  useFavorites,
  useUserReviews
} from '../../Hooks/userHooks';
import { useUserSubscriptions } from '../../Hooks/useUserSubscriptions';
import { usePaymentMethods } from '../../Hooks/usePaymentMethods';

const MapModal = lazy(() => import('../Checkout/MapModal'));

export const UserDashboard = () => {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const { t } = useTranslation();
  const toast = useToast();
  
  const { user: authUser,refreshSubscription } = useAuthContext();

  // Data hooks
  const { 
    data: profile, 
    isLoading: isProfileLoading,
    updateProfile,
    isUpdatingProfile
  } = useUserProfile();

  const { 
    data: healthProfile,
    updateHealthProfile,
    isUpdatingHealthProfile
  } = useHealthProfile();

  const { 
    addresses, 
    isLoading: isAddressLoading,
    addAddress,
    updateAddress,
    deleteAddress
  } = useUserAddresses();

  const { 
    orders, 
    isLoading: isOrdersLoading,
    refetch: refetchOrders
  } = useUserOrders();

  const {
    paymentMethods,
    isLoading: isPaymentLoading,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    isAddingPayment,
    isUpdatingPayment
  } = usePaymentMethods();

  const {
    allergies,
    isLoading: isAllergiesLoading
  } = useUserAllergies();

  const {
    preferences: dietaryPreferences,
    isLoading: isDietaryLoading
  } = useDietaryPreferences();

  const {
    favoriteMeals,
    favoriteItems,
    isLoadingMeals,
    isLoadingItems,
    removeFavoriteMeal,
    removeFavoriteItem
  } = useFavorites();

  const {
    reviews,
    isLoading: isReviewsLoading,
    deleteReview
  } = useUserReviews();
  const { 
  activateOrder,
  isActivatingOrder,
  subscription,
  isLoading: isSubLoading,
} = useUserSubscriptions();



  // Debug: Log JSON data from selected hooks
  useEffect(() => {
    //console.log('profile:', JSON.stringify(profile, null, 2));
    //console.log('healthProfile:', JSON.stringify(healthProfile, null, 2));
    //console.log('addresses:', JSON.stringify(addresses, null, 2));
    //console.log('orders:', JSON.stringify(orders, null, 2));
    //console.log('subscription:', JSON.stringify(subscription, null, 2));
    //console.log('paymentMethods:', JSON.stringify(paymentMethods, null, 2));
    //console.log('allergies:', JSON.stringify(allergies, null, 2));
    //console.log('dietaryPreferences:', JSON.stringify(dietaryPreferences, null, 2));
    //console.log('favoriteMeals:', JSON.stringify(favoriteMeals, null, 2));
    //console.log('favoriteItems:', JSON.stringify(favoriteItems, null, 2));
    //console.log('reviews:', JSON.stringify(reviews, null, 2));
  }, [
    profile,
    healthProfile,
    addresses,
    orders,
    subscription,
    paymentMethods,
    allergies,
    dietaryPreferences,
    favoriteMeals,
    favoriteItems,
    reviews
  ]);

  // State management
  const [formData, setFormData] = useState({});
  const [initialFormData, setInitialFormData] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Modal states
  const [modalState, setModalState] = useState({
    profile: false,
    map: false,
    address: false,
    payment: false,
    review: false
  });

  const [formState, setFormState] = useState({
    address: {},
    payment: {},
    review: {},
    editingAddress: null,
    editingPayment: null,
    editingReview: null
  });

  // Modal handlers
  const openModal = (modalName) => setModalState(prev => ({ ...prev, [modalName]: true }));
  const closeModal = (modalName) => setModalState(prev => ({ ...prev, [modalName]: false }));

  // Initialize form data
  useEffect(() => {
    if (profile && !initialFormData) {
      const defaultAddress = addresses?.find(addr => addr.is_default) || null;
      
      const initialData = {
        display_name: profile.display_name || '',
        phone_number: profile.phone_number || '',
        age: profile.age || 0,
        gender: profile.gender || '',
        language: profile.language || 'en',
        notes: profile.notes || '',
        
        healthProfile: {
          height_cm: healthProfile?.height_cm || '',
          weight_kg: healthProfile?.weight_kg || '',
          fitness_goal: healthProfile?.fitness_goal || '',
          activity_level: healthProfile?.activity_level || 'moderately_active',
          target_calories: healthProfile?.target_calories || '',
          target_protein: healthProfile?.target_protein || '',
        },
        
        notificationPreferences: {
          email: profile.notification_preferences?.email_enabled ?? true,
          sms: profile.notification_preferences?.sms_enabled ?? false,
          push: profile.notification_preferences?.push_enabled ?? true,
        },
        
        defaultAddress: defaultAddress?.address_line1 || '',
        deliveryTime: subscription?.preferred_delivery_time || '12:00:00'
      };

      setInitialFormData(initialData);
      setFormData(initialData);
    }
  }, [profile, healthProfile, subscription, addresses, initialFormData]);

  // Form handlers
  const formHandlers = {
    handleInputChange: (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
      setHasUnsavedChanges(true);
    },

    handleNumberChange: (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      setHasUnsavedChanges(true);
    },

    handleHealthProfileChange: (field, value) => {
      setFormData(prev => ({
        ...prev,
        healthProfile: {
          ...prev.healthProfile,
          [field]: value
        }
      }));
      setHasUnsavedChanges(true);
    },

    handleNotificationChange: (field, value) => {
      setFormData(prev => ({
        ...prev,
        notificationPreferences: {
          ...prev.notificationPreferences,
          [field]: value
        }
      }));
      setHasUnsavedChanges(true);
    },

    handleNestedFieldChange: (parent, field, value) => {
      if (parent) {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [field]: value
          }
        }));
      } else {
        setFormData(prev => ({ ...prev, [field]: value }));
      }
      setHasUnsavedChanges(true);
    },

    handleDeliveryTimeChange: (e) => {
      setFormData(prev => ({ ...prev, deliveryTime: e.target.value }));
      setHasUnsavedChanges(true);
    },

  };
  //Subscription handler
  const handleOrderActivation = useCallback(async (orderId) => {
  if (!subscription) return;
  
  // Get next available date
  const getNextAvailableDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const defaultDate = getNextAvailableDate();
  const preferredTime = subscription.preferred_delivery_time || '12:00:00';
  const [hours, minutes] = preferredTime.split(':');
  
  try {
    const deliveryDateTime = new Date(defaultDate);
    deliveryDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

    await activateOrder({
      orderId: orderId,
      deliveryTime: `${hours}:${minutes}`,
      deliveryDate: deliveryDateTime.toISOString()
    });

    // Refetch subscription and orders
    await Promise.all([
      refetchOrders(),
      refreshSubscription ? refreshSubscription() : Promise.resolve()
    ]);

    toast({
      title: t('success'),
      description: t('mealActivatedSuccessfully'),
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  } catch (error) {
    console.error('Error activating order:', error);
    toast({
      title: t('error'),
      description: t('failedToActivateMeal'),
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }
}, [subscription, activateOrder, refetchOrders, refreshSubscription, toast, t]);

  // Enhanced Profile update handler
  const handleSubmit = async () => {
    const weight = parseFloat(formData.healthProfile?.weight_kg);
    const height = parseFloat(formData.healthProfile?.height_cm);

    // Validation
    if (weight && (weight <= 0 || weight >= 500)) {
      toast({
        title: t('invalidWeight'),
        description: t('weightRangeError'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (height && (height <= 0 || height >= 300)) {
      toast({
        title: t('invalidHeight'),
        description: t('heightRangeError'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const profileUpdateData = {
        display_name: formData.display_name,
        phone_number: formData.phone_number,
        age: formData.age,
        gender: formData.gender,
        language: formData.language,
        notes: formData.notes,
        notification_preferences: {
          email_enabled: formData.notificationPreferences?.email ?? true,
          sms_enabled: formData.notificationPreferences?.sms ?? false,
          push_enabled: formData.notificationPreferences?.push ?? true,
        }
      };

      await updateProfile(profileUpdateData);

      if (formData.healthProfile) {
        const healthUpdateData = {
          height_cm: height || null,
          weight_kg: weight || null,
          fitness_goal: formData.healthProfile.fitness_goal,
          activity_level: formData.healthProfile.activity_level,
          target_calories: formData.healthProfile.target_calories ? parseInt(formData.healthProfile.target_calories) : null,
          target_protein: formData.healthProfile.target_protein ? parseInt(formData.healthProfile.target_protein) : null
        };
        await updateHealthProfile(healthUpdateData);
      }

      toast({
        title: t('profileUpdated'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      setHasUnsavedChanges(false);
      closeModal('profile');
    } catch (error) {
      toast({
        title: t('updateError'),
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Close profile modal with reset
  const closeProfileModal = () => {
    if (initialFormData) {
      setFormData(initialFormData);
    }
    setHasUnsavedChanges(false);
    closeModal('profile');
  };
  
  // Transform user data for display
  const transformUserData = () => {
  return {
    id: authUser?.id,
    email: authUser?.email || profile?.email,
    displayName: profile?.display_name,
    phoneNumber: profile?.phone_number,
    age: profile?.age,
    gender: profile?.gender,
    language: profile?.language,
    loyaltyPoints: profile?.loyalty_points,
    notes: profile?.notes,
    isAdmin: profile?.is_admin,
    profileCompleted: profile?.profile_completed,
    emailVerified: profile?.email_verified,
    phoneVerified: profile?.phone_verified,
    createdAt: profile?.created_at,
    lastLogin: profile?.last_login,
    
    healthProfile: healthProfile ? {
      height: healthProfile.height_cm,
      weight: healthProfile.weight_kg,
      fitnessGoal: healthProfile.fitness_goal,
      activityLevel: healthProfile.activity_level,
      targetCalories: healthProfile.target_calories,
      targetProtein: healthProfile.target_protein,
      allergies: allergies?.map(a => a.allergies?.name).filter(Boolean) || [],
      dietaryPreferences: dietaryPreferences?.map(p => p.dietary_preferences?.name).filter(Boolean) || []
    } : null,
    
    notificationPreferences: {
      email: profile?.notification_preferences?.email_enabled ?? true,
      sms: profile?.notification_preferences?.sms_enabled ?? false,
      push: profile?.notification_preferences?.push_enabled ?? true,
    },
    
    subscription: subscription ? {
      id: subscription.id,
      status: subscription.status,
      startDate: subscription.start_date,
      endDate: subscription.end_date,
      consumedMeals: subscription.consumed_meals,
      totalMeals: subscription.total_meals,
      preferredDeliveryTime: subscription.preferred_delivery_time,
      plan: subscription.plans ? {
        title: subscription.plans.title,
        title_arabic: subscription.plans.title_arabic,
        price_per_meal: subscription.plans.price_per_meal,
        duration_days: subscription.plans.duration_days
      } : null
    } : null,
    
    addresses: addresses || [],
    orders: orders || [],
    paymentMethods: paymentMethods || [],
    allergies: allergies || [],
    dietaryPreferences: dietaryPreferences || [],
    favoriteMeals: favoriteMeals || [],
    favoriteItems: favoriteItems || [],
    reviews: reviews || []
  };
};

  const userData = transformUserData();

  if (isProfileLoading) {
    return (
      <ResponsiveDashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minH="50vh">
          <Spinner size="xl" />
        </Box>
      </ResponsiveDashboardLayout>
    );
  }

  // Tab configuration
  const tabConfig = [
    { key: 'overview', label: 'profile.overview' },
    { key: 'orderHistory', label: 'profile.orderHistory' },
    { key: 'subscription', label: 'profile.subscription' },
    { key: 'addresses', label: 'profile.addresses' },
    { key: 'paymentMethods', label: 'profile.paymentMethods' },
    { key: 'reviews', label: 'profile.reviews' },
    { key: 'favorites', label: 'profile.favorites' }
  ];

  return (
    <ResponsiveDashboardLayout>
      <ProfileHeader 
        user={userData} 
        userPlan={subscription?.plans} // Add this line
        onOpen={() => openModal('profile')} 
        t={t} 
      />
      
      {/* Enhanced Profile Modal */}
      <EnhancedProfileModal
        isOpen={modalState.profile}
        onClose={closeProfileModal}
        t={t}
        formData={formData}
        handlers={formHandlers}
        onOpenMap={() => openModal('map')}
        handleSubmit={handleSubmit}
        isUpdatingProfile={isUpdatingProfile}
        isUpdatingHealthProfile={isUpdatingHealthProfile}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Dashboard Sections */}
      <ResponsiveTabLayout>
        <TabList>
          {tabConfig.map((tab, index) => (
            <Tab 
              key={tab.key}
              onClick={() => setActiveTab(index)}
              fontSize={{ base: "xs", sm: "sm", md: "md" }}
              px={{ base: 2, sm: 3, md: 4 }}
              py={{ base: 2, md: 3 }}
              whiteSpace="nowrap"
              _selected={{
                color: "brand.600",
                borderColor: "brand.600",
                fontWeight: "bold"
              }}
            >
              {t(tab.label)}
            </Tab>
          ))}
        </TabList>
        
        <TabPanels>
          {/* Overview Tab */}
          <TabPanel>
            <OverviewSection user={userData} t={t} />
          </TabPanel>

          {/* Order History Tab */}
          <TabPanel>
            <OrderHistorySection
              orders={orders}
              isLoading={isOrdersLoading}
              t={t}
              navigate={navigate}
            />
          </TabPanel>

          {/* Subscription Tab */}
          <TabPanel>
            <SubscriptionSection
              subscription={subscription}
              orders={orders}
              isLoading={isSubLoading}
              t={t}
              navigate={navigate}
              refetchOrders={refetchOrders}
              onActivateOrder={handleOrderActivation}
              isActivatingOrder={isActivatingOrder}
              refreshSubscription={refreshSubscription}
            />
          </TabPanel>

          {/* Addresses Tab */}
          <TabPanel>
            <AddressesSection
              addresses={addresses}
              isLoading={isAddressLoading}
              formState={formState}
              modalState={modalState}
              t={t}
              onOpenModal={() => openModal('addresses')}  // ✅ Fixed: wrap in arrow function
              onCloseModal={closeModal}
              setFormState={setFormState}
              addAddress={addAddress}
              updateAddress={updateAddress}
              deleteAddress={deleteAddress}
            />
          </TabPanel>

          {/* Payment Methods Tab */}
          <TabPanel>
            <PaymentMethodsSection
              paymentMethods={paymentMethods}
              isLoading={isPaymentLoading}
              formState={formState}
              modalState={modalState}
              t={t}
              onOpenModal={() => openModal('payment')}  // ✅ Fixed: wrap in arrow function
              onCloseModal={closeModal}
              setFormState={setFormState}
              addPaymentMethod={addPaymentMethod}
              updatePaymentMethod={updatePaymentMethod}
              deletePaymentMethod={deletePaymentMethod}
              isAddingPayment={isAddingPayment}
              isUpdatingPayment={isUpdatingPayment}
            />
          </TabPanel>

          {/* Reviews Tab */}
          <TabPanel>
            <ReviewsSection
              reviews={reviews}
              isLoading={isReviewsLoading}
              formState={formState}
              modalState={modalState}
              t={t}
              onOpenModal={() => openModal('review')}  // ✅ Fixed: wrap in arrow function
              onCloseModal={closeModal}
              setFormState={setFormState}
              deleteReview={deleteReview}
            />
          </TabPanel>
          {/* Favorites Tab */}
          <TabPanel>
            <FavoritesSection
              favoriteMeals={favoriteMeals}
              favoriteItems={favoriteItems}
              isLoading={isLoadingMeals || isLoadingItems}
              t={t}
              removeFavoriteMeal={removeFavoriteMeal}
              removeFavoriteItem={removeFavoriteItem}
            />
          </TabPanel>
        </TabPanels>
      </ResponsiveTabLayout>

      {/* Map Modal */}
      <Suspense fallback={<div>Loading...</div>}>
        <MapModal
          isOpen={modalState.map}
          onClose={() => closeModal('map')}
          addressFormData={formState.address}
          setAddressFormData={(data) => setFormState(prev => ({ ...prev, address: data }))}
          onAddressSubmit={() => {/* Handle address submission */}}
        />
      </Suspense>
    </ResponsiveDashboardLayout>
  );
};