import { useState, useEffect, useCallback, Suspense, lazy } from 'react'; 
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
  AlertTitle,
  AlertDescription,
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
  Tooltip,
  Checkbox
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

import { useI18nContext } from '../../Contexts/I18nContext';
import { useUserAllergies } from '../../Hooks/userHooks';
import { useUserDietaryPreferences } from '../../Hooks/useUserDietaryPreferences';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
const MapModal = lazy(() => import('../Checkout/MapModal'));
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
          {t('basicInformation')}
        </Heading>
      </HStack>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <BasicFormControl
          label={t('displayName')}
          name="display_name"
          value={formData.display_name || ''}
          onChange={handleInputChange}
          placeholder={t('enterDisplayName')}
          bg={inputBg[colorMode]}
        />
        <BasicFormControl
          label={t('phoneNumber')}
          name="phone_number"
          value={formData.phone_number || ''}
          onChange={handleInputChange}
          placeholder={t('enterPhoneNumber')}
          bg={inputBg[colorMode]}
        />
        <NumberFormControl
          label={t('age')}
          value={formData.age || 0}
          min={10}
          max={120}
          onChange={(_, value) => handleNumberChange('age', value)}
          bg={inputBg[colorMode]}
        />
        <SelectFormControl
          label={t('gender')}
          name="gender"
          value={formData.gender || ''}
          onChange={handleInputChange}
          options={getGenderOptions}
          placeholder={t('selectGender')}
          bg={inputBg[colorMode]}
        />
        <SelectFormControl
          label={t('language')}
          name="language"
          value={formData.language || 'en'}
          onChange={handleInputChange}
          options={getLanguageOptions}
          bg={inputBg[colorMode]}
        />
      </SimpleGrid>
      
      <FormControl mt={4}>
        <FormLabel>{t('notes')}</FormLabel>
        <Textarea
          name="notes"
          value={formData.notes || ''}
          onChange={handleInputChange}
          placeholder={t('enterNotes')}
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
          {t('healthProfile')}
        </Heading>
      </HStack>

      <VStack spacing={5} align="stretch">
        {/* Physical Stats */}
         <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl>
            <FormLabel>{t('heightCm')}</FormLabel>
            {isLoading ? (
              <Skeleton height="40px" borderRadius="md" />
            ) : (
              <Input
                type="number"
                name="height_cm"
                value={formData.healthProfile?.height_cm || ''}
                onChange={handleChange}
                placeholder={t('yourHeight')}
                min="100"
                max="250"
                bg={inputBg[colorMode]}
              />
            )}
          </FormControl>

          <FormControl>
            <FormLabel>{t('weightKg')}</FormLabel>
            {isLoading ? (
              <Skeleton height="40px" borderRadius="md" />
            ) : (
              <Input
                type="number"
                name="weight_kg"
                value={formData.healthProfile?.weight_kg || ''}
                onChange={handleChange}
                placeholder={t('yourWeight')}
                min="30"
                max="200"
                bg={inputBg[colorMode]}
              />
            )}
          </FormControl>
        </SimpleGrid>

        {/* Activity Level */}
        <FormControl>
          <FormLabel>{t('activityLevel')}</FormLabel>
          {isLoading ? (
            <Skeleton height="120px" borderRadius="md" />
          ) : (
            <RadioGroup
               value={formData.healthProfile?.activity_level || 'moderately_active'}
               onChange={value => handleHealthProfileChange('activity_level', value)}
            >
              <Stack direction="column" spacing={3}>
                <Radio value="sedentary">{t('sedentary')}</Radio>
                <Radio value="lightly_active">{t('lightlyActive')}</Radio>
                <Radio value="moderately_active">{t('moderatelyActive')}</Radio>
                <Radio value="very_active">{t('veryActive')}</Radio>
                <Radio value="extremely_active">{t('extremelyActive')}</Radio>
              </Stack>
            </RadioGroup>
          )}
        </FormControl>

        {/* Fitness Goal */}
        <FormControl>
          <FormLabel>{t('fitnessGoal')}</FormLabel>
          {isLoading ? (
            <Skeleton height="40px" borderRadius="md" />
          ) : (
            <Select
              name="fitness_goal"
              value={formData.healthProfile?.fitness_goal || 'maintenance'}
              onChange={handleChange}
              placeholder={t('selectFitnessGoal')}
              bg={inputBg[colorMode]}
            >
              <option value="weight-loss">{t('weightLoss')}</option>
              <option value="weight-gain">{t('weightGain')}</option>
              <option value="maintenance">{t('maintenance')}</option>
              <option value="muscle-gain">{t('muscleGain')}</option>
              <option value="improve-fitness">{t('improveFitness')}</option>
            </Select>
          )}
        </FormControl>

        <Divider />

        {/* Dietary Preferences */}
        <FormControl>
          <FormLabel>{t('dietaryPreferences')}</FormLabel>
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
          <FormLabel>{t('allergies')}</FormLabel>
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
          {t('notificationPreferences')}
        </Heading>
      </HStack>
      
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <SwitchFormControl
          label={t('emailNotifications')}
          isChecked={formData.notificationPreferences?.email ?? true}
          onChange={(e) => handleNotificationChange('email', e.target.checked)}
        />
        <SwitchFormControl
          label={t('smsNotifications')}
          isChecked={formData.notificationPreferences?.sms ?? false}
          onChange={(e) => handleNotificationChange('sms', e.target.checked)}
        />
        <SwitchFormControl
          label={t('pushNotifications')}
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
          {t('deliverySettings')}
        </Heading>
      </HStack>
      
      <VStack spacing={4} align="stretch">
        <AddressInput
          label={t('defaultDeliveryAddress')}
          value={formData.defaultAddress}
          onChange={(value) => handleNestedFieldChange('', 'defaultAddress', value)}
          onMapOpen={onOpenMap}
          bg={inputBg[colorMode]}
        />
        
        <FormControl>
          <FormLabel>{t('defaultDeliveryTime')}</FormLabel>
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
          {user.displayName || t('anonymousUser')}
        </Heading>
        <Text fontSize="md" color="gray.500">
          {user.email}
        </Text>
        
        {user.isAdmin && (
          <Badge colorScheme="red" mt={2} display="inline-block">
            {t('admin')}
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
              {user.loyaltyPoints ?? 0} {t('loyaltyPoints')}
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
        {t('editProfile')}
      </Button>
    </Flex>
  );
};
export const OverviewSection = ({ user, t }) => {
  const personalFields = [
    { label: t('email'), value: user.email, verified: user.emailVerified },
    { label: t('displayName'), value: user.displayName },
    { label: t('phoneNumber'), value: user.phoneNumber },
    { label: t('age'), value: user.age },
    { label: t('gender'), value: user.gender },
    { label: t('language'), value: user.language || 'en' },
    { label: t('accountCreated'), value: new Date(user.createdAt).toLocaleDateString() },
    { label: t('loyaltyPoints'), value: user.loyaltyPoints || 0 },
    { label: t('notes'), value: user.notes },
  ].filter(field => field.value != null);

  const healthFields = user.healthProfile ? [
    { label: t('height'), value: user.healthProfile.height ? `${user.healthProfile.height} cm` : null },
    { label: t('weight'), value: user.healthProfile.weight ? `${user.healthProfile.weight} kg` : null },
    { label: t('fitnessGoal'), value: user.healthProfile.fitnessGoal },
    { label: t('activityLevel'), value: user.healthProfile.activityLevel },
    { 
      label: t('dietaryPreferences'), 
      value: user.healthProfile.dietaryPreferences?.length 
        ? user.healthProfile.dietaryPreferences.join(', ') 
        : null 
    },
    { 
      label: t('allergies'), 
      value: user.healthProfile.allergies?.length 
        ? user.healthProfile.allergies.join(', ') 
        : null 
    },
  ].filter(field => field.value != null) : [];

  const notificationFields = [
    { label: t('emailNotifications'), enabled: user.notificationPreferences?.email },
    { label: t('smsNotifications'), enabled: user.notificationPreferences?.sms },
    { label: t('pushNotifications'), enabled: user.notificationPreferences?.push },
  ];

  return (
    <Box p={4} bg="brand.200" borderRadius="lg">
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
        <VStack align="start" spacing={2}>
          <Heading size="sm">{t('personalInformation')}</Heading>
          {personalFields.map(field => (
            <UserInfoItem key={field.label} {...field} />
          ))}
        </VStack>
        <VStack align="start" spacing={2}>
          {healthFields.length > 0 && (
            <>
              <Heading size="sm">{t('healthProfile')}</Heading>
              {healthFields.map(field => (
                <UserInfoItem key={field.label} {...field} />
              ))}
            </>
          )}
          <Heading size="sm" mt={healthFields.length ? 4 : 0}>
            {t('notificationPreferences')}
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
    <DashboardSection title={t('orderHistory')}>
      <OrderHistoryTable orders={orders} />
      {(!orders || orders.length === 0) && (
        <Box textAlign="center" py={8}>
          <Button 
            colorScheme="brand" 
            onClick={() => navigate('/meals')}
          >
            {t('browseMeals')}
          </Button>
        </Box>
      )}
    </DashboardSection>
  );
};

// Subscription Section
export const SubscriptionSection = ({ 
  subscription, 
  orders, 
  isLoading, 
  t, 
  navigate, 
  refetchOrders,
  onActivateOrder,
  isActivatingOrder,
  refreshSubscription
}) => {
  return (
    <DashboardSection title={t('currentSubscription')}>
        <SubscriptionDetails
          subscription={subscription}
          orders={orders}
          isLoading={isLoading}
          onActivateOrder={onActivateOrder}
          isActivatingOrder={isActivatingOrder}
          refreshSubscription={refreshSubscription}
        />
    </DashboardSection>
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
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  const handleAddAddress = () => {
    setIsAddingAddress(true);
    setEditingAddress(null);
    setIsMapModalOpen(true);
  };

  const handleEditAddress = (address) => {
    setIsAddingAddress(false);
    setEditingAddress(address);
    setIsMapModalOpen(true);
  };

  const handleMapModalClose = () => {
    setIsMapModalOpen(false);
    setEditingAddress(null);
    setIsAddingAddress(false);
  };

  // Mock function for address submission (disabled)
  const handleAddressSubmit = async (addressData) => {
    // This functionality is disabled for now
    console.log('Address submission disabled:', addressData);
    return Promise.resolve(); // Return resolved promise for testing
  };

  return (
    <DashboardSection 
      title={t('addresses')}
      action={
        <Button
          leftIcon={<AddIcon/>}
          colorScheme="brand"
          onClick={handleAddAddress}
        >
          {t('addAddress')}
        </Button>
      }
    >
      <Alert status="warning" mb={4} borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="sm">{t('addresses.disabledTitle')}</AlertTitle>
          <AlertDescription fontSize="xs">
            {t('addresses.disabledMessage')}
          </AlertDescription>
        </Box>
      </Alert>

      {isLoading ? (
        <Center minH="200px"><Spinner /></Center>
      ) : addresses?.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {addresses.map(address => (
            <ResponsiveCard key={address.id}>
              <Flex justify="space-between" align="start">
                <Box flex={1}>
                  <HStack mb={2} align="center">
                    <Text fontWeight="bold" fontSize="lg">
                      {address.label}
                    </Text>
                    {address.is_default && (
                      <Badge colorScheme="green" fontSize="xs">
                        {t('default')}
                      </Badge>
                    )}
                  </HStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm">{address.address_line1}</Text>
                    {address.address_line2 && (
                      <Text fontSize="sm">{address.address_line2}</Text>
                    )}
                    <Text fontSize="sm">{address.city}</Text>
                    {address.coordinates && (
                      <Text fontSize="xs" color="gray.500">
                        {t('coordinates')}: {address.coordinates[0]?.toFixed(4)}, {address.coordinates[1]?.toFixed(4)}
                      </Text>
                    )}
                  </VStack>
                </Box>
                <ActionButtonGroup>
                  <Tooltip label={t('edit')}>
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      variant="ghost"
                      aria-label={t('edit')}
                      onClick={() => handleEditAddress(address)}
                    />
                  </Tooltip>
                  <Tooltip label={t('delete')}>
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      aria-label={t('delete')}
                      onClick={() => deleteAddress(address.id)}
                      isDisabled // Disabled for now
                    />
                  </Tooltip>
                </ActionButtonGroup>
              </Flex>
            </ResponsiveCard>
          ))}
        </SimpleGrid>
      ) : (
        <Center minH="200px" flexDirection="column" gap={4}>
          <Text color="gray.500" textAlign="center">
            {t('addresses.noAddresses')}
          </Text>
          <Button
            colorScheme="brand"
            variant="outline"
            onClick={handleAddAddress}
          >
            {t('addFirstAddress')}
          </Button>
        </Center>
      )}

      {/* Map Modal for adding/editing addresses */}
      <Suspense fallback={<div>Loading map...</div>}>
        <MapModal
          isOpen={isMapModalOpen}
          onClose={handleMapModalClose}
          addressFormData={editingAddress || {}}
          setAddressFormData={(data) => setEditingAddress(data)}
          onAddressSubmit={handleAddressSubmit}
          disabledMessage={t('addresses.disabledMessage')}
        />
      </Suspense>
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
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const handleAddPayment = () => {
    setEditingPayment(null);
    setIsPaymentModalOpen(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async () => {
    // This functionality is disabled for now
    console.log('Payment submission disabled');
    return Promise.resolve();
  };

  return (
    <DashboardSection 
      title={t('paymentMethods')}
      action={
        <Button
          leftIcon={<AddIcon/>}
          colorScheme="brand"
          onClick={handleAddPayment}
        >
          {t('addPayment')}
        </Button>
      }
    >
      <Alert status="warning" mb={4} borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="sm">{t('payment.disabledTitle')}</AlertTitle>
          <AlertDescription fontSize="xs">
            {t('payment.disabledMessage')}
          </AlertDescription>
        </Box>
      </Alert>

      {isLoading ? (
        <Center minH="200px"><Spinner /></Center>
      ) : paymentMethods?.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {paymentMethods.map(payment => (
            <ResponsiveCard key={payment.id}>
              <Flex justify="space-between" align="start">
                <Box flex={1}>
                  <HStack mb={2} align="center">
                    {payment.card_brand === 'visa' && (
                      <Icon as={FiCreditCard} color="blue.500" />
                    )}
                    {payment.card_brand === 'mastercard' && (
                      <Icon as={FiCreditCard} color="red.500" />
                    )}
                    <Text fontWeight="bold" fontSize="lg">
                      {payment.card_brand?.toUpperCase() || 'Card'}
                    </Text>
                    {payment.is_default && (
                      <Badge colorScheme="green" fontSize="xs">
                        {t('default')}
                      </Badge>
                    )}
                  </HStack>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm">
                      **** **** **** {payment.last4 || '1234'}
                    </Text>
                    <Text fontSize="sm">
                      {t('expires')}: {payment.exp_month}/{payment.exp_year}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {t('addedOn')}: {new Date(payment.created_at).toLocaleDateString()}
                    </Text>
                  </VStack>
                </Box>
                <ActionButtonGroup>
                  <Tooltip label={t('edit')}>
                    <IconButton
                      icon={<EditIcon />}
                      size="sm"
                      variant="ghost"
                      aria-label={t('edit')}
                      onClick={() => handleEditPayment(payment)}
                      isDisabled // Disabled for now
                    />
                  </Tooltip>
                  <Tooltip label={t('delete')}>
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      aria-label={t('delete')}
                      onClick={() => deletePaymentMethod(payment.id)}
                      isDisabled // Disabled for now
                    />
                  </Tooltip>
                </ActionButtonGroup>
              </Flex>
            </ResponsiveCard>
          ))}
        </SimpleGrid>
      ) : (
        <Center minH="200px" flexDirection="column" gap={4}>
          <Text color="gray.500" textAlign="center">
            {t('payment.noPaymentMethods')}
          </Text>
          <Button
            colorScheme="brand"
            variant="outline"
            onClick={handleAddPayment}
          >
            {t('addFirstPayment')}
          </Button>
        </Center>
      )}

      {/* Payment Method Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        size="md"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingPayment ? t('editPaymentMethod') : t('addPaymentMethod')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Alert status="info" mb={4} borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="sm">{t('payment.disabledTitle')}</AlertTitle>
                <AlertDescription fontSize="xs">
                  {t('payment.disabledMessage')}
                </AlertDescription>
              </Box>
            </Alert>

            <VStack spacing={4}>
              <FormControl>
                <FormLabel>{t('cardNumber')}</FormLabel>
                <Input
                  placeholder="**** **** **** ****"
                  value={editingPayment?.last4 ? `**** **** **** ${editingPayment.last4}` : ''}
                  isDisabled
                />
              </FormControl>
              
              <HStack spacing={4} width="100%">
                <FormControl>
                  <FormLabel>{t('expiryDate')}</FormLabel>
                  <Input
                    placeholder="MM/YY"
                    value={editingPayment ? `${editingPayment.exp_month}/${editingPayment.exp_year}` : ''}
                    isDisabled
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>{t('cvv')}</FormLabel>
                  <Input placeholder="***" type="password" isDisabled />
                </FormControl>
              </HStack>
              
              <FormControl>
                <FormLabel>{t('cardholderName')}</FormLabel>
                <Input placeholder="John Doe" isDisabled />
              </FormControl>

              <FormControl>
                <Checkbox isDisabled>
                  {t('setAsDefault')}
                </Checkbox>
              </FormControl>

              <Button
                colorScheme="brand"
                width="100%"
                isDisabled
                mt={4}
              >
                {t('savePaymentMethod')}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
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
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  return (
    <DashboardSection 
      title={t('reviews')}
      action={
        <Button
          leftIcon={<AddIcon/>}
          colorScheme="brand"
          onClick={() => setIsReviewModalOpen(true)}
        >
          {t('createReview')}
        </Button>
      }
    >
      <Alert status="warning" mb={4} borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="sm">{t('reviews.disabledTitle')}</AlertTitle>
          <AlertDescription fontSize="xs">
            {t('reviews.disabledMessage')}
          </AlertDescription>
        </Box>
      </Alert>

      {isLoading ? (
        <Center minH="200px"><Spinner /></Center>
      ) : reviews?.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {reviews.map(review => (
            <ResponsiveCard key={review.id}>
              <VStack align="start" spacing={3}>
                <HStack justify="space-between" width="100%">
                  <Text fontWeight="bold" fontSize="lg">
                    {review.meals?.name || review.items?.name || 'Unknown Item'}
                  </Text>
                  <IconButton
                    icon={<DeleteIcon />}
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    aria-label={t('delete')}
                    onClick={() => deleteReview(review.id)}
                    isDisabled // Disabled for now
                  />
                </HStack>
                
                <HStack spacing={1}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon
                      as={StarIcon}
                      key={i}
                      color={i < review.rating ? 'yellow.400' : 'gray.300'}
                      boxSize={4}
                    />
                  ))}
                </HStack>
                
                <Text fontSize="sm" color="gray.600">
                  {review.comment}
                </Text>
                
                <Text fontSize="xs" color="gray.500">
                  {t('reviewedOn')}: {new Date(review.created_at).toLocaleDateString()}
                </Text>
              </VStack>
            </ResponsiveCard>
          ))}
        </SimpleGrid>
      ) : (
        <Center minH="200px" flexDirection="column" gap={4}>
          <Text color="gray.500" textAlign="center">
            {t('reviews.noReviews')}
          </Text>
          <Button
            colorScheme="brand"
            variant="outline"
            onClick={() => setIsReviewModalOpen(true)}
          >
            {t('writeFirstReview')}
          </Button>
        </Center>
      )}

      {/* Review Creation Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        size="md"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('writeReview')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Alert status="info" mb={4} borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="sm">{t('reviews.disabledTitle')}</AlertTitle>
                <AlertDescription fontSize="xs">
                  {t('reviews.disabledMessage')}
                </AlertDescription>
              </Box>
            </Alert>

            <VStack spacing={4}>
              <FormControl>
                <FormLabel>{t('selectItem')}</FormLabel>
                <Select placeholder={t('chooseItem')} isDisabled>
                  <option value="1">Meal 1</option>
                  <option value="2">Meal 2</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>{t('rating')}</FormLabel>
                <HStack spacing={2}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <IconButton
                      key={star}
                      icon={<StarIcon />}
                      aria-label={`${star} stars`}
                      variant="ghost"
                      color="gray.300"
                      isDisabled
                    />
                  ))}
                </HStack>
              </FormControl>
              
              <FormControl>
                <FormLabel>{t('review')}</FormLabel>
                <Textarea
                  placeholder={t('shareExperience')}
                  rows={4}
                  isDisabled
                />
              </FormControl>

              <Button
                colorScheme="brand"
                width="100%"
                isDisabled
                mt={4}
              >
                {t('submitReview')}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
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
    <DashboardSection 
      title={t('favorites')}
    >
      <Alert status="warning" mb={4} borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="sm">{t('favorites.disabledTitle')}</AlertTitle>
          <AlertDescription fontSize="xs">
            {t('favorites.disabledMessage')}
          </AlertDescription>
        </Box>
      </Alert>

      {isLoading ? (
        <Center minH="200px"><Spinner /></Center>
      ) : (
        <VStack spacing={6} align="stretch">
          {/* Favorite Meals */}
          {favoriteMeals?.length > 0 && (
            <Box>
              <Heading size="md" mb={4} color="brand.600">
                {t('favoriteMeals')}
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {favoriteMeals.map(fav => (
                  <ResponsiveCard key={fav.meal_id}>
                    <VStack align="start" spacing={3}>
                      <Flex justify="space-between" width="100%" align="start">
                        <Box flex={1}>
                          <Text fontWeight="bold" fontSize="lg" mb={1}>
                            {fav.meals?.name || 'Unknown Meal'}
                          </Text>
                          <Text fontSize="sm" color="gray.600" noOfLines={2}>
                            {fav.meals?.description || t('noDescription')}
                          </Text>
                        </Box>
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          aria-label={t('remove')}
                          onClick={() => removeFavoriteMeal(fav.meal_id)}
                          isDisabled // Disabled for now
                        />
                      </Flex>
                      <HStack spacing={2}>
                        <Badge colorScheme="green">
                          ${fav.meals?.base_price || '0.00'}
                        </Badge>
                        <Badge colorScheme="blue">
                          {fav.meals?.category || 'General'}
                        </Badge>
                      </HStack>
                    </VStack>
                  </ResponsiveCard>
                ))}
              </SimpleGrid>
            </Box>
          )}

          {/* Favorite Items */}
          {favoriteItems?.length > 0 && (
            <Box>
              <Heading size="md" mb={4} color="brand.600">
                {t('favoriteItems')}
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {favoriteItems.map(fav => (
                  <ResponsiveCard key={fav.item_id}>
                    <VStack align="start" spacing={3}>
                      <Flex justify="space-between" width="100%" align="start">
                        <Box flex={1}>
                          <Text fontWeight="bold" fontSize="lg" mb={1}>
                            {fav.items?.name || 'Unknown Item'}
                          </Text>
                          <Text fontSize="sm" color="gray.600" noOfLines={2}>
                            {fav.items?.description || t('noDescription')}
                          </Text>
                        </Box>
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          aria-label={t('remove')}
                          onClick={() => removeFavoriteItem(fav.item_id)}
                          isDisabled // Disabled for now
                        />
                      </Flex>
                      <HStack spacing={2}>
                        <Badge colorScheme="purple">
                          ${fav.items?.price || '0.00'}
                        </Badge>
                        <Badge colorScheme="orange">
                          {fav.items?.category || 'Item'}
                        </Badge>
                      </HStack>
                    </VStack>
                  </ResponsiveCard>
                ))}
              </SimpleGrid>
            </Box>
          )}

          {/* Empty State */}
          {(!favoriteMeals || favoriteMeals.length === 0) && (!favoriteItems || favoriteItems.length === 0) && (
            <Center minH="200px" flexDirection="column" gap={4}>
              <Icon as={StarIcon} boxSize={12} color="gray.300" />
              <Text color="gray.500" textAlign="center">
                {t('favorites.noFavorites')}
              </Text>
              <Text fontSize="sm" color="gray.400" textAlign="center">
                {t('favorites.emptyMessage')}
              </Text>
            </Center>
          )}
        </VStack>
      )}
    </DashboardSection>
  );
};