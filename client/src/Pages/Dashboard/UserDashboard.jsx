

import { useState, useEffect, Suspense, lazy, useCallback } from 'react';
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

import {
  ResponsiveDashboardLayout,
  ResponsiveTabLayout,
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
  
  const { user: authUser, refreshSubscription } = useAuthContext();

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

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [formState, setFormState] = useState({
    address: {},
    payment: {},
    review: {},
    editingAddress: null,
    editingPayment: null,
    editingReview: null
  });

  // Subscription handler
  const handleOrderActivation = useCallback(async (orderId) => {
    if (!subscription) return;
    
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

  // Profile update handler
  const handleProfileUpdate = async (updateData) => {
    const weight = parseFloat(updateData.healthProfile?.weight_kg);
    const height = parseFloat(updateData.healthProfile?.height_cm);

    // Validation
    if (weight && (weight <= 0 || weight >= 500)) {
      throw new Error(t('weightRangeError'));
    }

    if (height && (height <= 0 || height >= 300)) {
      throw new Error(t('heightRangeError'));
    }

    await updateProfile(updateData);
  };

  // Health profile update handler
  const handleHealthProfileUpdate = async (updateData) => {
    await updateHealthProfile(updateData);
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
        userPlan={subscription?.plans}
        onOpen={() => setActiveTab(0)} // Navigate to Overview tab instead of opening modal
        t={t} 
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
          {/* Overview Tab - Now with in-place editing */}
          <TabPanel>
            <OverviewSection 
              user={userData} 
              onUpdateProfile={handleProfileUpdate}
              onUpdateHealthProfile={handleHealthProfileUpdate}
              isUpdatingProfile={isUpdatingProfile}
              isUpdatingHealthProfile={isUpdatingHealthProfile}
              t={t} 
            />
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
              modalState={{}}
              t={t}
              onOpenModal={() => {}}
              onCloseModal={() => {}}
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
              modalState={{}}
              t={t}
              onOpenModal={() => {}}
              onCloseModal={() => {}}
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
              modalState={{}}
              t={t}
              onOpenModal={() => {}}
              onCloseModal={() => {}}
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
    </ResponsiveDashboardLayout>
  );
};