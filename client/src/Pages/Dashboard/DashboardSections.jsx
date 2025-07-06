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
OrderHistoryTable
} from './DashboardComponents';
import MapModal from '../Checkout/MapModal';
import { get } from 'ol/proj';
//Options getters
// Extracted form options generators

const getGenderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
];

const getLanguageOptions = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'عربي' },
];

const getFitnessGoalOptions = [
    { id: 1, value: 'lose-weight', label: 'Lose Weight' },
    { id: 2, value: 'gain-weight', label: 'Gain Weight' },
    { id: 3, value: 'maintain-weight', label: 'Maintain Weight' },
    { id: 4, value: 'build-muscle', label: 'Build Muscle' },
    { id: 5, value: 'improve-endurance', label: 'Improve Endurance' },
];

const getActivityLevelOptions = [
    { id: 1, value: 'sedentary', label: 'Sedentary' },
    { id: 2, value: 'lightly-active', label: 'Lightly Active' },
    { id: 3, value: 'moderately-active', label: 'Moderately Active' },
    { id: 4, value: 'very-active', label: 'Very Active' },
    { id: 5, value: 'extremely-active', label: 'Extremely Active' },
];

const getDietaryPreferences = [
    { id: 1, value: 'vegetarian', label: 'Vegetarian' },
    { id: 2, value: 'vegan', label: 'Vegan' },
    { id: 3, value: 'pescatarian', label: 'Pescatarian' },
    { id: 4, value: 'keto', label: 'Ketogenic' },
    { id: 5, value: 'paleo', label: 'Paleo' },
    { id: 6, value: 'mediterranean', label: 'Mediterranean' },
    { id: 7, value: 'low-carb', label: 'Low Carb' },
    { id: 8, value: 'gluten-free', label: 'Gluten Free' },
    { id: 9, value: 'dairy-free', label: 'Dairy Free' },
    { id: 10, value: 'none', label: 'None' },
];

const getAllergies = [
    { id: 1, value: 'nuts', label: 'Nuts' },
    { id: 2, value: 'peanuts', label: 'Peanuts' },
    { id: 3, value: 'shellfish', label: 'Shellfish' },
    { id: 4, value: 'fish', label: 'Fish' },
    { id: 5, value: 'eggs', label: 'Eggs' },
    { id: 6, value: 'milk', label: 'Milk/Dairy' },
    { id: 7, value: 'soy', label: 'Soy' },
    { id: 8, value: 'wheat', label: 'Wheat' },
    { id: 9, value: 'sesame', label: 'Sesame' },
    { id: 10, value: 'sulfites', label: 'Sulfites' },
    { id: 11, value: 'none', label: 'None' },
];

// Extracted modal sections
export const BasicInfoSection = ({ formData, handlers,t}) => {
  const { handleInputChange, handleNumberChange } = handlers
  return (
    <Box>
      <Heading size="sm" mb={4} color="brand.500">
        {t('profile.basicInformation')}
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        <BasicFormControl
          label={t('profile.displayName')}
          name="display_name"
          value={formData.display_name || ''}
          onChange={handleInputChange}
          placeholder={t('profile.enterDisplayName')}
        />
        <BasicFormControl
          label={t('profile.phoneNumber')}
          name="phone_number"
          value={formData.phone_number || ''}
          onChange={handleInputChange}
          placeholder={t('profile.enterPhoneNumber')}
        />
        <NumberFormControl
          label={t('profile.age')}
          value={formData.age || 0}
          min={0}
          max={120}
          onChange={(_, value) => handleNumberChange('age', value)}
        />
        <SelectFormControl
          label={t('profile.gender')}
          name="gender"
          value={formData.gender || ''}
          onChange={handleInputChange}
          options={getGenderOptions}
          placeholder={t('profile.selectGender')}
        />
        <SelectFormControl
          label={t('profile.language')}
          name="language"
          value={formData.language || 'en'}
          onChange={handleInputChange}
          options={getLanguageOptions}
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
        />
      </FormControl>
    </Box>
  )
}

export const HealthProfileSection = ({ formData, handlers,t}) => {
    const { handleHealthProfileChange, handleCheckboxArrayChange } = handlers
    return (
      <Box>
        <Heading size="sm" mb={4} color="brand.500">
          {t('profile.healthProfile')}
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          <NumberFormControl
            label={t('profile.height')} 
            value={formData.healthProfile?.height || 0}
            min={50}
            max={100}
            onChange={(_, value) => handleHealthProfileChange('height', value)}
          />
          <NumberFormControl
            label={t('profile.weight')}
            value={formData.healthProfile?.weight || 0}
            min={50}
            max={150}
            onChange={(_, value) => handleHealthProfileChange('weight', value)}
          />
        </SimpleGrid>
        <FormControl mt={4}>
          <FormLabel>{t('profile.dietaryPreferences')}</FormLabel>
          <CheckboxGrid
              items={getDietaryPreferences}
              selectedItems={formData.healthProfile?.dietaryPreferences || []}
              fieldPath="healthProfile.dietaryPreferences" 
              handleCheckboxArrayChange={handlers.handleCheckboxArrayChange}
              />
        </FormControl>
        <FormControl mt={4}>
          <FormLabel>{t('profile.allergies')}</FormLabel>
          <CheckboxGrid
            items={getAllergies}
            selectedItems={formData.healthProfile?.allergies || []}
            // Add the missing fieldPath prop here
            fieldPath="healthProfile.allergies"
            handleCheckboxArrayChange={handlers.handleCheckboxArrayChange}
          />
        </FormControl>
      </Box>
    )
  }

export const NotificationSection = ({ formData, handlers,t}) => {
  const { handleNotificationChange } = handlers
  return (
    <Box>
      <Heading size="sm" mb={4} color="brand.500">
        {t('profile.notificationPreferences')}
      </Heading>
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
  )
}

export const DeliverySection = ({ formData, handlers, onOpenMap,t}) => {
  const { handleNestedFieldChange, handleDeliveryTimeChange } = handlers
  return (
    <Box>
      <Heading size="sm" mb={4} color="brand.500">
        {t('premium.deliverySettings')}
      </Heading>
      <AddressInput
        label={t('profile.defaultDeliveryAddress')}
        value={formData.defaultAddress}
        onChange={(value) => handleNestedFieldChange('', 'defaultAddress', value)}
        onMapOpen={onOpenMap}
      />
      <FormControl mt={4}>
        <FormLabel>{t('profile.defaultDeliveryTime')}</FormLabel>
        <Select
          value={formData.deliveryTime}
          onChange={handleDeliveryTimeChange}
        >
          {Array.from({ length: 10 }, (_, i) => {
            const hour = 9 + i
            const time = `${hour < 10 ? '0' + hour : hour}:00`
            const display = hour < 12 ? `${time} AM` : 
                          hour === 12 ? `${time} PM` : 
                          `${hour - 12}:00 PM`
            return <option key={time} value={time}>{display}</option>
          })}
        </Select>
      </FormControl>
    </Box>
  )
}

export const ProfileHeader = ({ user, userPlan, onOpen,t}) => {
  return(
  <Flex align="center" mb={8} direction={{ base: 'column', md: 'row' }} gap={4}>
    <Avatar
      size="2xl"
      name={user.displayName}
      src={user.photoURL}
      bg="brand.500"
      color="white"
    />
    <Box textAlign={{ base: 'center', md: 'left' }}>
      <Heading size="lg" mb={2}>
        {user.displayName || t('profile.anonymousUser')}
      </Heading>
      <Text fontSize="lg" color="gray.500">
        {user.email}
      </Text>
      {user.isAdmin && (
        <Badge colorScheme="red" mt={2}>
          {t('profile.admin')}
        </Badge>
      )}
      <Flex mt={4} gap={3} wrap="wrap" justify={{ base: 'center', md: 'start' }}>
        {userPlan && (
          <Badge colorScheme="brand" px={3} py={1} borderRadius="md">
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
    </Box>
    <Button
      ml="auto"
      leftIcon={<EditIcon />}
      onClick={onOpen}
      variant="outline"
      colorScheme="brand"
    >
      {t('profile.editProfile')}
    </Button>
  </Flex>
)}

export const OverviewSection = ({ user,t}) => {
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
  ].filter(field => field.value != null)

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
  ].filter(field => field.value != null) : []

  const notificationFields = [
    { label: t('profile.emailNotifications'), enabled: user.notificationPreferences?.email },
    { label: t('profile.smsNotifications'), enabled: user.notificationPreferences?.sms },
    { label: t('profile.pushNotifications'), enabled: user.notificationPreferences?.push },
  ]

  return (
    <Box p={4} bg="brand.200" borderRadius="lg">
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <VStack align="start" spacing={3}>
          <Heading size="sm">{t('profile.personalInformation')}</Heading>
          {personalFields.map(field => (
            <UserInfoItem key={field.label} {...field} />
          ))}
        </VStack>
        <VStack align="start" spacing={3}>
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
  )
}

