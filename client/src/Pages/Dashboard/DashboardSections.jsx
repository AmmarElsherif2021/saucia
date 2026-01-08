import { useState, useEffect, useCallback, Suspense, lazy } from 'react'; 
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  StackDivider,
  useColorModeValue,
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
  Checkbox,
  useToast
} from '@chakra-ui/react';

import {StarIcon, EditIcon, CheckIcon, CloseIcon, AddIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
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
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiStar,
  FiHeart,
  FiBell,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiXCircle,
} from 'react-icons/fi';
import { useI18nContext } from '../../Contexts/I18nContext';
import { useUserAllergies } from '../../Hooks/userHooks';
import { useUserDietaryPreferences } from '../../Hooks/useUserDietaryPreferences';
import CommonQuestions from '../Premium/JoinPlan/CommonQuestions';
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


//Helper components
const getIconForLabel = (label) => {
  const iconMap = {
    'email': FiMail,
    'displayName': FiUser,
    'phoneNumber': FiPhone,
    'age': FiCalendar,
    'gender': FiUser,
    'language': FiInfo,
    'accountCreated': FiCalendar,
    'loyaltyPoints': FiStar,
    'notes': FiInfo,
    'height': FiUser,
    'weight': FiUser,
    'fitnessGoal': FiHeart,
    'activityLevel': FiHeart,
    'dietaryPreferences': FiInfo,
    'allergies': FiAlertCircle,
  };
  
  const key = Object.keys(iconMap).find(key => label.toLowerCase().includes(key.toLowerCase()));
  return iconMap[key] || FiInfo;
};
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
// DashboardSections.jsx - Refactored OverviewSection with in-place editing



// Personal Information Section with In-Place Editing
const PersonalInfoSection = ({ 
  user, 
  onUpdate, 
  isUpdating 
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerColor = useColorModeValue('gray.800', 'white');
  const inputBg = useColorModeValue('white', 'gray.700');

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: user.displayName || '',
    phone_number: user.phoneNumber || '',
    age: user.age || '',
    gender: user.gender || '',
    language: user.language || 'en',
    notes: user.notes || '',
  });

  const getGenderOptions = [
    { value: 'male', label: t('male') },
    { value: 'female', label: t('female') },
    { value: 'other', label: t('other') },
    { value: 'prefer-not-to-say', label: t('preferNotToSay') },
  ];

  const getLanguageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'عربي' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await onUpdate(formData);
      setIsEditing(false);
      toast({
        title: t('profileUpdated'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
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

  const handleCancel = () => {
    setFormData({
      display_name: user.displayName || '',
      phone_number: user.phoneNumber || '',
      age: user.age || '',
      gender: user.gender || '',
      language: user.language || 'en',
      notes: user.notes || '',
    });
    setIsEditing(false);
  };

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

  return (
    <Card 
      bg={cardBg}
      borderRadius="lg"
      border="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <CardBody>
        <VStack 
          align="start" 
          spacing={4}
          divider={<StackDivider borderColor={borderColor} />}
        >
          <HStack justify="space-between" width="100%">
            <Heading size="md" color={headerColor} display="flex" alignItems="center" gap={2}>
              <Icon as={FiUser} />
              {t('personalInformation')}
            </Heading>
            {!isEditing ? (
              <Button
                size="sm"
                leftIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                colorScheme="brand"
                variant="ghost"
              >
                {t('edit')}
              </Button>
            ) : (
              <HStack>
                <Button
                  size="sm"
                  leftIcon={<CheckIcon />}
                  onClick={handleSave}
                  colorScheme="brand"
                  isLoading={isUpdating}
                >
                  {t('save')}
                </Button>
                <Button
                  size="sm"
                  leftIcon={<CloseIcon />}
                  onClick={handleCancel}
                  variant="ghost"
                >
                  {t('cancel')}
                </Button>
              </HStack>
            )}
          </HStack>

          {!isEditing ? (
            <VStack align="start" spacing={1} width="100%">
              {personalFields.map(field => (
                <UserInfoItem key={field.label} {...field} />
              ))}
            </VStack>
          ) : (
            <VStack spacing={4} width="100%" pt={2}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
                <BasicFormControl
                  label={t('displayName')}
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleInputChange}
                  placeholder={t('enterDisplayName')}
                  bg={inputBg}
                />
                <BasicFormControl
                  label={t('phoneNumber')}
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  placeholder={t('enterPhoneNumber')}
                  bg={inputBg}
                />
                <NumberFormControl
                  label={t('age')}
                  value={formData.age || 0}
                  min={10}
                  max={120}
                  onChange={(_, value) => handleNumberChange('age', value)}
                  bg={inputBg}
                />
                <SelectFormControl
                  label={t('gender')}
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  options={getGenderOptions}
                  placeholder={t('selectGender')}
                  bg={inputBg}
                />
                <SelectFormControl
                  label={t('language')}
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  options={getLanguageOptions}
                  bg={inputBg}
                />
              </SimpleGrid>
              
              <FormControl>
                <FormLabel>{t('notes')}</FormLabel>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder={t('enterNotes')}
                  rows={3}
                  bg={inputBg}
                  resize="vertical"
                />
              </FormControl>
            </VStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

// Notification Preferences Section with In-Place Editing
const NotificationPreferencesSection = ({ 
  user, 
  onUpdate, 
  isUpdating 
}) => {
  const { t } = useTranslation();
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headerColor = useColorModeValue('gray.800', 'white');

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    email: user.notificationPreferences?.email ?? true,
    sms: user.notificationPreferences?.sms ?? false,
    push: user.notificationPreferences?.push ?? true,
  });

  const handleNotificationChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await onUpdate({
        notification_preferences: {
          email_enabled: formData.email,
          sms_enabled: formData.sms,
          push_enabled: formData.push,
        }
      });
      setIsEditing(false);
      toast({
        title: t('notificationsUpdated'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
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

  const handleCancel = () => {
    setFormData({
      email: user.notificationPreferences?.email ?? true,
      sms: user.notificationPreferences?.sms ?? false,
      push: user.notificationPreferences?.push ?? true,
    });
    setIsEditing(false);
  };

  const notificationFields = [
    { label: t('emailNotifications'), enabled: user.notificationPreferences?.email },
    { label: t('smsNotifications'), enabled: user.notificationPreferences?.sms },
    { label: t('pushNotifications'), enabled: user.notificationPreferences?.push },
  ];

  return (
    <Card 
      bg={cardBg}
      borderRadius="lg"
      border="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <CardBody>
        <VStack 
          align="start" 
          spacing={4}
          divider={<StackDivider borderColor={borderColor} />}
        >
          <HStack justify="space-between" width="100%">
            <Heading size="md" color={headerColor} display="flex" alignItems="center" gap={2}>
              <Icon as={FiBell} />
              {t('notificationPreferences')}
            </Heading>
            {!isEditing ? (
              <Button
                size="sm"
                leftIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
                colorScheme="brand"
                variant="ghost"
              >
                {t('edit')}
              </Button>
            ) : (
              <HStack>
                <Button
                  size="sm"
                  leftIcon={<CheckIcon />}
                  onClick={handleSave}
                  colorScheme="brand"
                  isLoading={isUpdating}
                >
                  {t('save')}
                </Button>
                <Button
                  size="sm"
                  leftIcon={<CloseIcon />}
                  onClick={handleCancel}
                  variant="ghost"
                >
                  {t('cancel')}
                </Button>
              </HStack>
            )}
          </HStack>

          {!isEditing ? (
            <VStack align="start" spacing={2} width="100%">
              {notificationFields.map(field => (
                <NotificationStatus key={field.label} {...field} />
              ))}
            </VStack>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} width="100%" pt={2}>
              <SwitchFormControl
                label={t('emailNotifications')}
                isChecked={formData.email}
                onChange={(e) => handleNotificationChange('email', e.target.checked)}
              />
              <SwitchFormControl
                label={t('smsNotifications')}
                isChecked={formData.sms}
                onChange={(e) => handleNotificationChange('sms', e.target.checked)}
              />
              <SwitchFormControl
                label={t('pushNotifications')}
                isChecked={formData.push}
                onChange={(e) => handleNotificationChange('push', e.target.checked)}
              />
            </SimpleGrid>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

// Refactored OverviewSection
export const OverviewSection = ({ 
  user, 
  onUpdateProfile,
  onUpdateHealthProfile,
  isUpdatingProfile,
  isUpdatingHealthProfile,
  t 
}) => {
  const sectionBg = useColorModeValue('brand.50', 'brand.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box 
      p={{ base: 4, md: 6 }} 
      bg={sectionBg}
      borderRadius="xl"
      border="1px"
      borderColor={borderColor}
      boxShadow="sm"
    >
      <VStack spacing={6} align="stretch">
        {/* Personal Information Section */}
        <PersonalInfoSection 
          user={user}
          onUpdate={onUpdateProfile}
          isUpdating={isUpdatingProfile}
        />

        {/* Health Profile Section */}
        <Card 
          bg={useColorModeValue('white', 'gray.800')}
          borderRadius="lg"
          border="1px"
          borderColor={borderColor}
          boxShadow="sm"
        >
          <CardBody>
            <VStack 
              align="start" 
              spacing={4}
              divider={<StackDivider borderColor={borderColor} />}
            >
              <Heading 
                size="md" 
                color={useColorModeValue('gray.800', 'white')} 
                display="flex" 
                alignItems="center" 
                gap={2}
              >
                <Icon as={FiHeart} />
                {t('healthProfile')}
              </Heading>
              <Box width="100%">
                <CommonQuestions onComplete={() => {}} />
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Notification Preferences Section */}
        <NotificationPreferencesSection 
          user={user}
          onUpdate={onUpdateProfile}
          isUpdating={isUpdatingProfile}
        />
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
        leftIcon={<ViewIcon />}
        onClick={onOpen}
        variant="outline"
        colorScheme="brand"
        size="lg"
        mt={{ base: 4, md: 0 }}
      >
        {t('viewProfile')}
      </Button>
    </Flex>
  );
};



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