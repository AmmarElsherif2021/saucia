import { useState, useEffect } from 'react';
import { EditIcon, StarIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Heading,
  SimpleGrid,
  FormControl,
  FormLabel,
  Textarea,
  Flex,
  Avatar,
  Text,
  Badge,
  Button,
  Select,
  VStack,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Wrap,
  WrapItem,
  useColorMode,
  Skeleton,
  Alert,
  AlertIcon,
  Divider,
  HStack,
  Icon,
  IconButton,
  Center,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Progress,
  Tooltip
} from '@chakra-ui/react';
import {
  BasicFormControl,
  NumberFormControl,
  SelectFormControl,
  SwitchFormControl,
  CheckboxGrid,
  AddressInput,
  UserInfoItem, 
  NotificationStatus,
  OrderHistoryTable,
  DashboardSection,
  ResponsiveCard,
  ActionButtonGroup,
  SubscriptionDetails
} from './DashboardComponents';
import MapModal from '../Checkout/MapModal';
import { useI18nContext } from '../../Contexts/I18nContext';
import { useUserAllergies } from '../../Hooks/userHooks';
import { useUserDietaryPreferences } from '../../Hooks/useUserDietaryPreferences';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
// Options getters AddIcon
const getGenderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

const getLanguageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'عربي' },
];

const getFitnessGoalOptions = [
    { value: 'weight-loss', label: 'Weight Loss' },
    { value: 'weight-gain', label: 'Weight Gain' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'muscle-gain', label: 'Muscle Gain' },
    { value: 'improve-fitness', label: 'Improve Fitness' },
];

const getActivityLevelOptions = [
    { value: 'sedentary', label: 'Sedentary' },
    { value: 'lightly_active', label: 'Lightly Active' },
    { value: 'moderately_active', label: 'Moderately Active' },
    { value: 'very_active', label: 'Very Active' },
    { value: 'extremely_active', label: 'Extremely Active' },
];

// Extracted modal sections
export const BasicInfoSection = ({ formData, handlers, t }) => { 
  const { handleInputChange, handleNumberChange } = handlers;
  const { colorMode } = useColorMode();
  const inputBg = { light: 'white', dark: 'gray.700' };
  
  return (
    <Box p={6} borderRadius="lg" bg={colorMode === 'light' ? 'gray.50' : 'gray.800'} borderWidth="1px">
      <HStack mb={4} spacing={3}>
        <Icon viewBox="0 0 24 24" color="brand.500">
          <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
        </Icon>
        <Heading size="md" color="brand.500">
          {t('profile.basicInformation')}
        </Heading>
      </HStack>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <BasicFormControl
          label={t('profile.displayName')}
          name="display_name"
          value={formData.display_name || ''}
          onChange={handleInputChange}
          placeholder={t('profile.enterDisplayName')}
          bg={inputBg[colorMode]}
        />
        <BasicFormControl
          label={t('profile.phoneNumber')}
          name="phone_number"
          value={formData.phone_number || ''}
          onChange={handleInputChange}
          placeholder={t('profile.enterPhoneNumber')}
          bg={inputBg[colorMode]}
        />
        <NumberFormControl
          label={t('profile.age')}
          value={formData.age || 0}
          min={10}
          max={120}
          onChange={(_, value) => handleNumberChange('age', value)}
          bg={inputBg[colorMode]}
        />
        <SelectFormControl
          label={t('profile.gender')}
          name="gender"
          value={formData.gender || ''}
          onChange={handleInputChange}
          options={getGenderOptions}
          placeholder={t('profile.selectGender')}
          bg={inputBg[colorMode]}
        />
        <SelectFormControl
          label={t('profile.language')}
          name="language"
          value={formData.language || 'en'}
          onChange={handleInputChange}
          options={getLanguageOptions}
          bg={inputBg[colorMode]}
        />
      </SimpleGrid>
      
      <FormControl mt={4}>
        <FormLabel>{t('profile.notes')}</FormLabel>
        <Textarea
          name="notes"
          value={formData.notes || ''}
          onChange={handleInputChange}
          placeholder={t('profile.enterNotes')}
          rows={3}
          bg={inputBg[colorMode]}
          resize="vertical"
        />
      </FormControl>
    </Box>
  );
};

// Enhanced HealthProfileSection cloned from CommonQuestions
export const HealthProfileSection = ({ formData, handlers, t, isLoading = false }) => {
  const { handleHealthProfileChange, handleCheckboxArrayChange, toggleSelection } = handlers;
  const { colorMode } = useColorMode();
  const { currentLanguage } = useI18nContext();
  const isArabic = currentLanguage === 'ar';
  const inputBg = { light: 'white', dark: 'gray.700' };
  const {handleInputChange} = handlers;
  // Fetch dietary preferences and allergies using hooks
  const { 
    dietaryPreferences: availablePreferences = [],
    userDietaryPreferences = [],
    isLoading: isLoadingPreferences,
  } = useUserDietaryPreferences();
  
  const { 
    allergies: availableAllergies = [],
    userAllergies = [],
    isLoading: isLoadingAllergies,
  } = useUserAllergies();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData) {
      handleInputChange(e);
    } else {
      handleHealthProfileChange(name, value);
    }
  };

  const togglePreferenceSelection = (preferenceId) => {
    if (toggleSelection) {
      toggleSelection('dietaryPreferences', preferenceId);
    }
  };

  const toggleAllergySelection = (allergyId) => {
    if (toggleSelection) {
      toggleSelection('allergies', allergyId);
    }
  };

  return (
    <Box p={6} borderRadius="lg" bg={colorMode === 'light' ? 'gray.50' : 'gray.800'} borderWidth="1px">
      <HStack mb={4} spacing={3}>
        <Icon viewBox="0 0 24 24" color="brand.500">
          <path fill="currentColor" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M12,8A3,3 0 0,1 15,11A3,3 0 0,1 12,14A3,3 0 0,1 9,11A3,3 0 0,1 12,8Z" />
        </Icon>
        <Heading size="md" color="brand.500">
          {t('profile.healthProfile')}
        </Heading>
      </HStack>

      <VStack spacing={5} align="stretch">
        {/* Physical Stats */}
         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl>
            <FormLabel>{t('premium.heightCm')}</FormLabel>
            {isLoading ? (
              <Skeleton height="40px" borderRadius="md" />
            ) : (
              <Input
                type="number"
                name="height_cm"
                value={formData.healthProfile?.height_cm || ''}
                onChange={handleChange}
                placeholder={t('premium.yourHeight')}
                min="100"
                max="250"
                bg={inputBg[colorMode]}
              />
            )}
          </FormControl>

          <FormControl>
            <FormLabel>{t('premium.weightKg')}</FormLabel>
            {isLoading ? (
              <Skeleton height="40px" borderRadius="md" />
            ) : (
              <Input
                type="number"
                name="weight_kg"
                value={formData.healthProfile?.weight_kg || ''}
                onChange={handleChange}
                placeholder={t('premium.yourWeight')}
                min="30"
                max="200"
                bg={inputBg[colorMode]}
              />
            )}
          </FormControl>
        </SimpleGrid>

        {/* Activity Level */}
        <FormControl>
          <FormLabel>{t('premium.activityLevel')}</FormLabel>
          {isLoading ? (
            <Skeleton height="120px" borderRadius="md" />
          ) : (
            <RadioGroup
               value={formData.healthProfile?.activity_level || 'moderately_active'}
               onChange={value => handleHealthProfileChange('activity_level', value)}
            >
              <Stack direction="column" spacing={3}>
                <Radio value="sedentary">{t('premium.sedentary')}</Radio>
                <Radio value="lightly_active">{t('premium.lightlyActive')}</Radio>
                <Radio value="moderately_active">{t('premium.moderatelyActive')}</Radio>
                <Radio value="very_active">{t('premium.veryActive')}</Radio>
                <Radio value="extremely_active">{t('premium.extremelyActive')}</Radio>
              </Stack>
            </RadioGroup>
          )}
        </FormControl>

        {/* Fitness Goal */}
        <FormControl>
          <FormLabel>{t('premium.fitnessGoal')}</FormLabel>
          {isLoading ? (
            <Skeleton height="40px" borderRadius="md" />
          ) : (
            <Select
              name="fitness_goal"
              value={formData.healthProfile?.fitness_goal || 'maintenance'}
              onChange={handleChange}
              placeholder={t('premium.selectFitnessGoal')}
              bg={inputBg[colorMode]}
            >
              <option value="weight-loss">{t('premium.weightLoss')}</option>
              <option value="weight-gain">{t('premium.weightGain')}</option>
              <option value="maintenance">{t('premium.maintenance')}</option>
              <option value="muscle-gain">{t('premium.muscleGain')}</option>
              <option value="improve-fitness">{t('premium.improveFitness')}</option>
            </Select>
          )}
        </FormControl>

        <Divider />

        {/* Dietary Preferences */}
        <FormControl>
          <FormLabel>{t('premium.dietaryPreferences')}</FormLabel>
          {isLoading || isLoadingPreferences || availablePreferences.length === 0 ? (
            <Skeleton height="100px" borderRadius="md" />
          ) : (
            <Wrap spacing={3}>
              {availablePreferences.map(pref => (
                <WrapItem key={pref.id}>
                  <Button
                    size="sm"
                    variant={
                      formData.healthProfile?.dietaryPreferences?.includes(pref.id) ||
                      userDietaryPreferences?.some(up => up.preference_id === pref.id)
                        ? 'solid' 
                        : 'outline'
                    }
                    colorScheme="brand"
                    onClick={() => togglePreferenceSelection(pref.id)}
                  >
                    {isArabic ? pref.name_arabic : pref.name}
                  </Button>
                </WrapItem>
              ))}
            </Wrap>
          )}
        </FormControl>

        {/* Allergies */}
        <FormControl>
          <FormLabel>{t('premium.allergies')}</FormLabel>
          {isLoading || isLoadingAllergies || availableAllergies.length === 0 ? (
            <Skeleton height="100px" borderRadius="md" />
          ) : (
            <Wrap spacing={3}>
              {availableAllergies.map(allergy => (
                <WrapItem key={allergy.id}>
                  <Button
                    size="sm"
                    variant={
                      formData.healthProfile?.allergies?.includes(allergy.id) ||
                      userAllergies?.some(ua => ua.allergy_id === allergy.id)
                        ? 'solid' 
                        : 'outline'
                    }
                    colorScheme="red"
                    onClick={() => toggleAllergySelection(allergy.id)}
                  >
                    {isArabic ? allergy.name_arabic : allergy.name}
                  </Button>
                </WrapItem>
              ))}
            </Wrap>
          )}
        </FormControl>
      </VStack>
    </Box>
  );
};

export const NotificationSection = ({ formData, handlers, t }) => {
  const { handleNotificationChange } = handlers;
  const { colorMode } = useColorMode();
  
  return (
    <Box p={6} borderRadius="lg" bg={colorMode === 'light' ? 'gray.50' : 'gray.800'} borderWidth="1px">
      <HStack mb={4} spacing={3}>
        <Icon viewBox="0 0 24 24" color="brand.500">
          <path fill="currentColor" d="M21,19V20H3V19L5,17V11A7,7 0 0,1 12,4A7,7 0 0,1 19,11V17L21,19M12,2A9,9 0 0,0 3,11V18L1,20V21H23V20L21,18V11A9,9 0 0,0 12,2M12,22A2,2 0 0,1 10,20H14A2,2 0 0,1 12,22Z" />
        </Icon>
        <Heading size="md" color="brand.500">
          {t('profile.notificationPreferences')}
        </Heading>
      </HStack>
      
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <SwitchFormControl
          label={t('profile.emailNotifications')}
          isChecked={formData.notificationPreferences?.email ?? true}
          onChange={(e) => handleNotificationChange('email', e.target.checked)}
        />
        <SwitchFormControl
          label={t('profile.smsNotifications')}
          isChecked={formData.notificationPreferences?.sms ?? false}
          onChange={(e) => handleNotificationChange('sms', e.target.checked)}
        />
        <SwitchFormControl
          label={t('profile.pushNotifications')}
          isChecked={formData.notificationPreferences?.push ?? true}
          onChange={(e) => handleNotificationChange('push', e.target.checked)}
        />
      </SimpleGrid>
    </Box>
  );
};

export const DeliverySection = ({ formData, handlers, onOpenMap, t }) => {
  const { handleNestedFieldChange, handleDeliveryTimeChange } = handlers;
  const { colorMode } = useColorMode();
  const inputBg = { light: 'white', dark: 'gray.700' };
  
  return (
    <Box p={6} borderRadius="lg" bg={colorMode === 'light' ? 'gray.50' : 'gray.800'} borderWidth="1px">
      <HStack mb={4} spacing={3}>
        <Icon viewBox="0 0 24 24" color="brand.500">
          <path fill="currentColor" d="M3,8L9,2L10.5,3.5L11,3L17,9L15,11C15.8,12.37 16,14.05 16,15A4,4 0 0,1 12,19A4,4 0 0,1 8,15C8,14.05 8.2,12.37 9,11L3,8M9,16A1,1 0 0,0 10,15A1,1 0 0,0 9,14A1,1 0 0,0 8,15A1,1 0 0,0 9,16M12,14L11,13L10,14L11,15L12,14M17,12L19,10L20.5,11.5L22,10L20,8L18.5,9.5L17,8L15,10L17,12Z" />
        </Icon>
        <Heading size="md" color="brand.500">
          {t('premium.deliverySettings')}
        </Heading>
      </HStack>
      
      <VStack spacing={4} align="stretch">
        <AddressInput
          label={t('profile.defaultDeliveryAddress')}
          value={formData.defaultAddress}
          onChange={(value) => handleNestedFieldChange('', 'defaultAddress', value)}
          onMapOpen={onOpenMap}
          bg={inputBg[colorMode]}
        />
        
        <FormControl>
          <FormLabel>{t('profile.defaultDeliveryTime')}</FormLabel>
          <Select
            value={formData.deliveryTime}
            onChange={handleDeliveryTimeChange}
            bg={inputBg[colorMode]}
          >
            {Array.from({ length: 10 }, (_, i) => {
              const hour = 9 + i;
              const time = `${hour < 10 ? '0' + hour : hour}:00`;
              const display = hour < 12 ? `${time} AM` : 
                            hour === 12 ? `${time} PM` : 
                            `${hour - 12}:00 PM`;
              return <option key={time} value={time}>{display}</option>;
            })}
          </Select>
        </FormControl>
      </VStack>
    </Box>
  );
};

// ProfileHeader
export const ProfileHeader = ({ user, userPlan, onOpen, t }) => {
  return (
    <Flex 
      align="center"
      mb={8} 
      direction={{ base: 'column', md: 'row' }} 
      textAlign={{ base: 'center', md: 'left' }}
      justify={{ base: 'center', md: 'flex-start' }}
      gap={4}
    >
      <Avatar
        size="2xl"
        name={user.displayName}
        src={user.avatar_url}
        bg="brand.500"
        color="white"
      />

      <VStack
        align={{ base: 'center', md: 'flex-start' }}
        flex={1}
      >
        <Heading size="lg" mb={1}>
          {user.displayName || t('profile.anonymousUser')}
        </Heading>
        <Text fontSize="md" color="gray.500">
          {user.email}
        </Text>
        
        {user.isAdmin && (
          <Badge colorScheme="red" mt={2} display="inline-block">
            {t('profile.admin')}
          </Badge>
        )}

        <Flex 
          mt={2} 
          gap={3} 
          justify="center"
          direction={{ base: 'column', sm: 'row' }}
          align="center"
          wrap="wrap"
        >
          {userPlan && (
            <Badge 
              colorScheme="brand" 
              px={3} 
              py={1} 
              borderRadius="md"
            >
              {userPlan.title}
            </Badge>
          )}
          
          <Flex align="center" gap={2}>
            <StarIcon color="brand.500" />
            <Text>
              {user.loyaltyPoints ?? 0} {t('profile.loyaltyPoints')}
            </Text>
          </Flex>
        </Flex>
      </VStack>

      <Button
        leftIcon={<EditIcon />}
        onClick={onOpen}
        variant="outline"
        colorScheme="brand"
        size="lg"
        mt={{ base: 4, md: 0 }}
      >
        {t('profile.editProfile')}
      </Button>
    </Flex>
  );
};
export const OverviewSection = ({ user, t }) => {
  const personalFields = [
    { label: t('profile.email'), value: user.email, verified: user.emailVerified },
    { label: t('profile.displayName'), value: user.displayName },
    { label: t('profile.phoneNumber'), value: user.phoneNumber },
    { label: t('profile.age'), value: user.age },
    { label: t('profile.gender'), value: user.gender },
    { label: t('profile.language'), value: user.language || 'en' },
    { label: t('profile.accountCreated'), value: new Date(user.createdAt).toLocaleDateString() },
    { label: t('profile.loyaltyPoints'), value: user.loyaltyPoints || 0 },
    { label: t('profile.notes'), value: user.notes },
  ].filter(field => field.value != null);

  const healthFields = user.healthProfile ? [
    { label: t('profile.height'), value: user.healthProfile.height ? `${user.healthProfile.height} cm` : null },
    { label: t('profile.weight'), value: user.healthProfile.weight ? `${user.healthProfile.weight} kg` : null },
    { label: t('profile.fitnessGoal'), value: user.healthProfile.fitnessGoal },
    { label: t('profile.activityLevel'), value: user.healthProfile.activityLevel },
    { 
      label: t('profile.dietaryPreferences'), 
      value: user.healthProfile.dietaryPreferences?.length 
        ? user.healthProfile.dietaryPreferences.join(', ') 
        : null 
    },
    { 
      label: t('profile.allergies'), 
      value: user.healthProfile.allergies?.length 
        ? user.healthProfile.allergies.join(', ') 
        : null 
    },
  ].filter(field => field.value != null) : [];

  const notificationFields = [
    { label: t('profile.emailNotifications'), enabled: user.notificationPreferences?.email },
    { label: t('profile.smsNotifications'), enabled: user.notificationPreferences?.sms },
    { label: t('profile.pushNotifications'), enabled: user.notificationPreferences?.push },
  ];

  return (
    <Box p={4} bg="brand.200" borderRadius="lg">
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
        <VStack align="start" spacing={2}>
          <Heading size="sm">{t('profile.personalInformation')}</Heading>
          {personalFields.map(field => (
            <UserInfoItem key={field.label} {...field} />
          ))}
        </VStack>
        <VStack align="start" spacing={2}>
          {healthFields.length > 0 && (
            <>
              <Heading size="sm">{t('profile.healthProfile')}</Heading>
              {healthFields.map(field => (
                <UserInfoItem key={field.label} {...field} />
              ))}
            </>
          )}
          <Heading size="sm" mt={healthFields.length ? 4 : 0}>
            {t('profile.notificationPreferences')}
          </Heading>
          {notificationFields.map(field => (
            <NotificationStatus key={field.label} {...field} />
          ))}
        </VStack>
      </SimpleGrid>
    </Box>
  );
};
// Add these components to your existing DashboardSections.jsx

// Order History Section
export const OrderHistorySection = ({ orders, isLoading, t, navigate }) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
        <Spinner />
      </Box>
    );
  }

  return (
    <DashboardSection title={t('profile.orderHistory')}>
      <OrderHistoryTable orders={orders} />
      {(!orders || orders.length === 0) && (
        <Box textAlign="center" py={8}>
          <Button 
            colorScheme="brand" 
            onClick={() => navigate('/meals')}
          >
            {t('profile.browseMeals')}
          </Button>
        </Box>
      )}
    </DashboardSection>
  );
};

// Subscription Section
export const SubscriptionSection = ({ subscription, orders, isLoading, t, navigate, refetchOrders }) => {
  return (
    <VStack spacing={6} align="stretch">
      <DashboardSection title={t('profile.currentSubscription')}>
        <SubscriptionDetails 
          subscription={subscription} 
          isLoading={isLoading} 
        />
      </DashboardSection>

      {subscription && (
        <DashboardSection title={t('profile.subscriptionManagement')}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Button 
              colorScheme="blue" 
              variant="outline"
              onClick={() => navigate(`/subscriptions/${subscription.id}`)}
            >
              {t('profile.viewSubscriptionDetails')}
            </Button>
            <Button 
              colorScheme="orange" 
              variant="outline"
              onClick={() => navigate(`/subscriptions/${subscription.id}/meals`)}
            >
              {t('profile.manageMealSelection')}
            </Button>
          </SimpleGrid>
        </DashboardSection>
      )}
    </VStack>
  );
};

// Addresses Section
export const AddressesSection = ({ 
  addresses, 
  isLoading, 
  formState, 
  modalState, 
  t, 
  onOpenModal, 
  onCloseModal, 
  setFormState, 
  addAddress, 
  updateAddress, 
  deleteAddress 
}) => {
  const handleAddressSubmit = async () => {
    // Implementation from original
  };

  return (
    <DashboardSection 
      title={t('profile.addresses')}
      action={
        <Button
          leftIcon={<AddIcon/>}
          colorScheme="brand"
          onClick={() => {
            setFormState(prev => ({ ...prev, address: {}, editingAddress: null }));
            onOpenModal('address');
          }}
        >
          {t('profile.addAddress')}
        </Button>
      }
    >
      {isLoading ? (
        <Center minH="200px"><Spinner /></Center>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {addresses?.map(address => (
            <ResponsiveCard key={address.id}>
              <Flex justify="space-between" align="start">
                <Box>
                  <Text fontWeight="bold">{address.label}</Text>
                  <Text>{address.address_line1}</Text>
                  {address.address_line2 && <Text>{address.address_line2}</Text>}
                  <Text>{address.city}, {address.state} {address.postal_code}</Text>
                  {address.is_default && (
                    <Badge colorScheme="green" mt={2}>
                      {t('profile.default')}
                    </Badge>
                  )}
                </Box>
                <ActionButtonGroup>
                  <IconButton
                    icon={<EditIcon />}
                    size="sm"
                    aria-label={t('common.edit')}
                    onClick={() => {
                      setFormState(prev => ({
                        ...prev, 
                        address: { ...address, street: address.address_line1 },
                        editingAddress: address
                      }));
                      onOpenModal('address');
                    }}
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    aria-label={t('common.delete')}
                    onClick={() => deleteAddress(address.id)}
                  />
                </ActionButtonGroup>
              </Flex>
            </ResponsiveCard>
          ))}
        </SimpleGrid>
      )}
    </DashboardSection>
  );
};

// Payment Methods Section
export const PaymentMethodsSection = ({ 
  paymentMethods, 
  isLoading, 
  formState, 
  modalState, 
  t, 
  onOpenModal, 
  onCloseModal, 
  setFormState, 
  addPaymentMethod, 
  updatePaymentMethod, 
  deletePaymentMethod,
  isAddingPayment,
  isUpdatingPayment
}) => {
  // Similar structure to AddressesSection
  return (
    <DashboardSection 
      title={t('profile.paymentMethods')}
      action={
        <Button
          leftIcon={< AddIcon/>}
          colorScheme="brand"
          onClick={() => {
            setFormState(prev => ({ ...prev, payment: {}, editingPayment: null }));
            onOpenModal('payment');
          }}
        >
          {t('profile.addPayment')}
        </Button>
      }
    >
      {/* Payment methods grid */}
    </DashboardSection>
  );
};

// Reviews Section
export const ReviewsSection = ({ 
  reviews, 
  isLoading, 
  formState, 
  modalState, 
  t, 
  onOpenModal, 
  onCloseModal, 
  setFormState, 
  deleteReview 
}) => {
  // Similar structure to other sections
  return (
    <DashboardSection 
      title={t('profile.reviews')}
      action={
        <Button
          leftIcon={<AddIcon/>}
          colorScheme="brand"
          onClick={() => {
            setFormState(prev => ({ ...prev, review: {}, editingReview: null }));
            onOpenModal('review');
          }}
        >
          {t('profile.createReview')}
        </Button>
      }
    >
      {/* Reviews grid */}
    </DashboardSection>
  );
};

// Favorites Section
export const FavoritesSection = ({ 
  favoriteMeals, 
  favoriteItems, 
  isLoading, 
  t, 
  removeFavoriteMeal, 
  removeFavoriteItem 
}) => {
  return (
    <DashboardSection title={t('profile.favorites')}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        {favoriteMeals?.map(fav => (
          <ResponsiveCard key={fav.meal_id}>
            <Flex justify="space-between" align="start">
              <Box>
                <Text fontWeight="bold">{fav.meals?.name}</Text>
                <Text>{fav.meals?.description}</Text>
                <Text color="brand.500">${fav.meals?.base_price}</Text>
              </Box>
              <IconButton
                icon={<DeleteIcon />}
                size="sm"
                colorScheme="red"
                aria-label={t('common.delete')}
                onClick={() => removeFavoriteMeal(fav.meal_id)}
              />
            </Flex>
          </ResponsiveCard>
        ))}
        {/* Similar for favoriteItems   */}
      </SimpleGrid>
    </DashboardSection>
  );
};