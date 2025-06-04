import {
  Box,
  Flex,
  Avatar,
  Heading,
  Text,
  Badge,
  Button,
  useColorMode,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useToast,
  Spinner,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Switch,
  SimpleGrid,
  Divider,
  VStack,
  IconButton,
  Image,
  HStack,
  useBreakpointValue,
} from '@chakra-ui/react'
import { StarIcon, EditIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'
import { useUser } from '../../Contexts/UserContext'
import { useState, useEffect } from 'react'
import MapModal from '../Checkout/MapModal'
import locationPin from '../../assets/locationPin.svg'
import { useNavigate } from 'react-router-dom'
export const UserDashboard = () => {
  const navigate = useNavigate()
  const { colorMode } = useColorMode()
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isMapOpen, onOpen: onOpenMap, onClose: onCloseMap } = useDisclosure()
  const {
    user,
    loading,
    userPlan,
    planLoading,
    refreshOrders,
    updateUserSubscription,
    updateUserProfile, // Use context function instead of API directly
  } = useUser()

  const [isOrdersLoading, setIsOrdersLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({})
  const toast = useToast()
  const createDefaultFormData = (userData) => ({
    displayName: userData?.displayName || '',
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    phoneNumber: userData?.phoneNumber || '',
    age: userData?.age || 0,
    gender: userData?.gender || 'male',
    language: userData?.language || 'en',
    notes: userData?.notes || '',
    defaultAddress: userData?.defaultAddress || '',
    deliveryTime: userData?.subscription?.deliveryTime || '12:00',
    healthProfile: {
      height: userData?.healthProfile?.height || null,
      weight: userData?.healthProfile?.weight || null,
      fitnessGoal: userData?.healthProfile?.fitnessGoal || '',
      activityLevel: userData?.healthProfile?.activityLevel || '',
      dietaryPreferences: userData?.healthProfile?.dietaryPreferences || [],
      allergies: userData?.healthProfile?.allergies || [],
    },
    notificationPreferences: {
      email: userData?.notificationPreferences?.email ?? true,
      sms: userData?.notificationPreferences?.sms ?? false,
      push: userData?.notificationPreferences?.push ?? true,
    },
  })

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      console.log(`From user dashboard user data ${JSON.stringify(user)}`)
      setFormData(createDefaultFormData(user))
    }
  }, [user])

  const handleRefreshOrders = async () => {
    setIsOrdersLoading(true)
    try {
      await refreshOrders()
    } finally {
      setIsOrdersLoading(false)
    }
  }

  // Generic input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Generic number change handler
  const handleNumberChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Generic nested field change handler
  const handleNestedFieldChange = (parentField, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [field]: value,
      },
    }))
  }

  // Simplified handlers using the generic function
  const handleHealthProfileChange = (field, value) => {
    handleNestedFieldChange('healthProfile', field, value)
  }

  const handleNotificationChange = (field, value) => {
    handleNestedFieldChange('notificationPreferences', field, value)
  }

  // Generic checkbox array handler
  const handleCheckboxArrayChange = (fieldPath, value, isChecked) => {
    const [parentField, childField] = fieldPath.includes('.')
      ? fieldPath.split('.')
      : [fieldPath, null]

    setFormData((prev) => {
      if (childField) {
        // Handle nested fields like healthProfile.dietaryPreferences
        const currentArray = prev[parentField]?.[childField] || []
        const updatedArray = isChecked
          ? [...currentArray, value]
          : currentArray.filter((item) => item !== value)

        return {
          ...prev,
          [parentField]: {
            ...prev[parentField],
            [childField]: updatedArray,
          },
        }
      } else {
        // Handle top-level fields
        const currentArray = prev[fieldPath] || []
        const updatedArray = isChecked
          ? [...currentArray, value]
          : currentArray.filter((item) => item !== value)

        return {
          ...prev,
          [fieldPath]: updatedArray,
        }
      }
    })
  }
  const handleAddressSelect = (location) => {
    setFormData((prev) => ({
      ...prev,
      defaultAddress: location.display_name,
    }))
  }

  const handleDeliveryTimeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      deliveryTime: e.target.value,
    }))
  }

  const handleSubmit = async () => {
    if (!user?.uid) return

    setIsUpdating(true)
    try {
      // Use context function instead of direct API call
      await updateUserProfile(user.uid, formData)
      toast({
        title: t('profile.profileUpdated'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      onClose()
    } catch (error) {
      toast({
        title: t('profile.errorUpdatingProfile'),
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsUpdating(false)
    }
  }
  //Reusable address component
  const AddressInput = ({ label, value, onChange, onMapOpen }) => (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <Flex alignItems="center">
        <Input
          value={value?.display_name || value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('profile.enterDeliveryAddress')}
          variant={'ghost'}
        />
        <IconButton
          mx={2}
          aria-label={t('checkout.selectFromMap')}
          icon={<Image src={locationPin} boxSize="24px" />}
          onClick={onMapOpen}
        />
      </Flex>
    </FormControl>
  )
  // Reusable component for displaying user info
  const UserInfoItem = ({ label, value, verified = false }) => (
    <Text>
      <strong>{label}:</strong> {value || 'N/A'}{' '}
      {verified && (
        <Badge colorScheme="green" ml={2}>
          {t('profile.verified')}
        </Badge>
      )}
    </Text>
  )

  // Reusable component for notification status
  const NotificationStatus = ({ label, enabled }) => (
    <Text>
      <strong>{label}:</strong>{' '}
      <Badge colorScheme={enabled ? 'green' : 'red'}>
        {enabled ? t('profile.enabled') : t('profile.disabled')}
      </Badge>
    </Text>
  )

  // Reusable form control for basic inputs
  const BasicFormControl = ({ label, name, value, placeholder, type = 'text' }) => (
    <FormControl w={{ base: '95%', md: '60%' }}>
      <FormLabel>{label}</FormLabel>
      <Input
        variant={'ghost'}
        name={name}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        type={type}
        sx={{
          '::placeholder': {
            color: 'gray.500',
            opacity: 1,
            padding: '0.5rem',
          },
        }}
      />
    </FormControl>
  )

  // Reusable form control for number inputs
  const NumberFormControl = ({ label, value, min, max, onChange }) => (
    <FormControl w={{ base: '90%', md: '50%' }}>
      <FormLabel>{label}</FormLabel>
      <NumberInput
        variant={'ghost'}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        // Removed focusInputOnChange to fix stepper/focus issue
        sx={{
          paddingX: '10px',
        }}
      >
        <NumberInputField />
        <NumberInputStepper sx={{ paddingX: '0.2rem' }}>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </FormControl>
  )

  // Reusable form control for select inputs
  const SelectFormControl = ({ label, name, value, onChange, options, placeholder }) => (
    <FormControl w={{ base: '90%', md: '80%' }}>
      <FormLabel>{label}</FormLabel>
      <Select name={name} value={value} onChange={onChange} sx={{ paddingX: '2rem' }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </FormControl>
  )

  // Reusable checkbox grid component
  const CheckboxGrid = ({ items, selectedItems, fieldPath, columns = { base: 2, md: 4 } }) => (
    <SimpleGrid columns={columns} spacing={3}>
      {items.map((item) => (
        <Checkbox
          key={item.id}
          isChecked={selectedItems?.includes(item.id)}
          onChange={(e) => handleCheckboxArrayChange(fieldPath, item.id, e.target.checked)}
          value={item.id}
        >
          {t(`${item?.label?.toLowerCase().replace('-', '')}`) || item.label}
        </Checkbox>
      ))}
    </SimpleGrid>
  )

  // Constants for form options
  const GENDER_OPTIONS = [
    { id: 1, value: 'male', label: t('profile.male') },
    { id: 2, value: 'female', label: t('profile.female') },
    { id: 3, value: 'other', label: t('profile.other') },
    { id: 4, value: 'prefer-not-to-say', label: t('profile.preferNotToSay') },
  ]

  const LANGUAGE_OPTIONS = [
    { id: 1, value: 'en', label: 'English' },
    { id: 2, value: 'es', label: 'Español' },
    { id: 3, value: 'fr', label: 'Français' },
    { id: 4, value: 'de', label: 'Deutsch' },
    { id: 5, value: 'it', label: 'Italiano' },
  ]

  const FITNESS_GOAL_OPTIONS = [
    { id: 1, value: 'lose-weight', label: t('profile.loseWeight') },
    { id: 2, value: 'gain-weight', label: t('profile.gainWeight') },
    { id: 3, value: 'maintain-weight', label: t('profile.maintainWeight') },
    { id: 4, value: 'build-muscle', label: t('profile.buildMuscle') },
    { id: 5, value: 'improve-endurance', label: t('profile.improveEndurance') },
  ]

  const ACTIVITY_LEVEL_OPTIONS = [
    { id: 1, value: 'sedentary', label: t('profile.sedentary') },
    { id: 2, value: 'lightly-active', label: t('profile.lightlyActive') },
    { id: 3, value: 'moderately-active', label: t('profile.moderatelyActive') },
    { id: 4, value: 'very-active', label: t('profile.veryActive') },
    { id: 5, value: 'extremely-active', label: t('profile.extremelyActive') },
  ]

  const DIETARY_PREFERENCES = [
    { id: 1, value: 'vegetarian', label: t('premium.vegetarian') || 'Vegetarian' },
    { id: 2, value: 'vegan', label: t('premium.vegan') || 'Vegan' },
    { id: 3, value: 'pescatarian', label: t('premium.pescatarian') || 'Pescatarian' },
    { id: 4, value: 'keto', label: t('premium.keto') || 'Ketogenic' },
    { id: 5, value: 'paleo', label: t('premium.paleo') || 'Paleo' },
    { id: 6, value: 'mediterranean', label: t('premium.mediterranean') || 'Mediterranean' },
    { id: 7, value: 'low-carb', label: t('premium.lowCarb') || 'Low Carb' },
    { id: 8, value: 'gluten-free', label: t('premium.glutenFree') || 'Gluten Free' },
    { id: 9, value: 'dairy-free', label: t('premium.dairyFree') || 'Dairy Free' },
    { id: 12, value: 'none', label: t('premium.none') || 'None' },
  ]

  const ALLERGIES = [
    { id: 1, value: 'nuts', label: t('premium.nuts') || 'Nuts' },
    { id: 2, value: 'peanuts', label: t('premium.peanuts') || 'Peanuts' },
    { id: 3, value: 'shellfish', label: t('premium.shellfish') || 'Shellfish' },
    { id: 4, value: 'fish', label: t('premium.fish') || 'Fish' },
    { id: 5, value: 'eggs', label: t('premium.eggs') || 'Eggs' },
    { id: 6, value: 'milk', label: t('premium.milk') || 'Milk/Dairy' },
    { id: 7, value: 'soy', label: t('premium.soy') || 'Soy' },
    { id: 8, value: 'wheat', label: t('premium.wheat') || 'Wheat' },
    { id: 9, value: 'sesame', label: t('premium.sesame') || 'Sesame' },
    { id: 10, value: 'sulfites', label: t('premium.sulfites') || 'Sulfites' },
    { id: 11, value: 'none', label: t('premium.none') || 'None' },
  ]

  // Reusable switch control component
  const SwitchFormControl = ({ label, id, checked, onChange }) => (
    <FormControl display="flex" alignItems="center" w={{ base: '90%', md: '50%' }}>
      <FormLabel htmlFor={id} mb="0">
        {label}
      </FormLabel>
      <Switch id={id} isChecked={checked} onChange={onChange} />
    </FormControl>
  )

  const OrderHistoryTable = () => (
    <TableContainer>
      <Table variant="striped" size="sm">
        <Thead>
          <Tr>
            <Th>{t('profile.orderID')}</Th>
            <Th>{t('profile.date')}</Th>
            <Th>{t('profile.items')}</Th>
            <Th>{t('profile.total')}</Th>
            <Th>{t('profile.status')}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {user.orders?.map((order) => (
            <Tr key={order.id}>
              <Td>{order.id.slice(0, 8)}...</Td>
              <Td>
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Td>
              <Td>
                {order.items?.map((item) => (
                  <Text key={item.id}>
                    {item.name} x{item.quantity}
                  </Text>
                ))}
              </Td>
              <Td>${order.totalPrice?.toFixed(2)}</Td>
              <Td>
                <Badge
                  colorScheme={
                    order.status === 'completed'
                      ? 'green'
                      : order.status === 'pending'
                        ? 'yellow'
                        : 'red'
                  }
                >
                  {order.status}
                </Badge>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      {user.orders?.length === 0 && (
        <Text textAlign="center" p={4} color="gray.500">
          {t('profile.noOrdersFound')}
        </Text>
      )}
    </TableContainer>
  )

  const SubscriptionDetails = () => {
    if (planLoading) return <Spinner />

    return (
      <Box bg={'secondary.200'}>
        {user.subscription?.planId ? (
          <Box p={4} borderWidth="1px" borderRadius="lg">
            <Heading size="md" mb={2}>
              {user.subscription.planName}
            </Heading>

            <Text fontWeight="bold" mb={2}>
              ${user.subscription.price}/month
            </Text>
            {user.subscriptionEndDate && (
              <Text>
                {t('profile.renewsOn')}:{' '}
                {new Date(user.subscription.subscriptionEndDate).toLocaleDateString()}
              </Text>
            )}

            <Heading size="sm" mt={4} mb={2}>
              {t('profile.subscriptionInfo')}
            </Heading>
            <Text>
              <strong>{t('profile.status')}:</strong>{' '}
              <Badge colorScheme={user.subscription.status === 'active' ? 'green' : 'orange'}>
                {user.subscription.status}
              </Badge>
            </Text>
            <Text>
              <strong>{t('profile.paymentMethod')}:</strong> {user.subscription.paymentMethod}
            </Text>
            <Text>
              <strong>{t('profile.startDate')}:</strong>{' '}
              {new Date(user.subscription.startDate).toLocaleDateString()}
            </Text>
            <Text>
              <strong>{t('profile.endDate')}:</strong>{' '}
              {new Date(user.subscription.endDate).toLocaleDateString()}
            </Text>
            <Text>
              <strong>{t('profile.price')}:</strong> ${user.subscription.price.toFixed(2)}
            </Text>
            <Text>
              <strong>{t('profile.mealsCount')}:</strong> {user.subscription.mealsCount}
            </Text>
            <Text>
              <strong>{t('profile.consumedMeals')}:</strong> {user.subscription.consumedMeals}
            </Text>

            <Button mt={4} colorScheme="brand" onClick={() => navigate('/premium')}>
              {t('profile.manageSubscription')}
            </Button>
          </Box>
        ) : (
          <Box p={4} borderWidth="1px" borderRadius="lg">
            <Text mb={4}>{t('profile.noActiveSubscription')}</Text>
            <Button colorScheme="brand">{t('profile.browsePlans')}</Button>
          </Box>
        )}
      </Box>
    )
  }

  if (loading)
    return (
      <Box p={4}>
        <Spinner size="xl" />
      </Box>
    )
  if (!user) return <Box p={4}>{t('profile.pleaseLoginToViewDashboard')}</Box>

  return (
    <Box p={4} bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
      {/* Profile Header */}
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

      {/* Edit Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="slideInBottom">
        <ModalOverlay />
        <ModalContent
          maxW={{ base: '80vw', md: '70vw', lg: '60vw' }}
          mx={{ base: 10, md: 'auto' }}
          maxH="70vh"
          mt={{ base: 4, md: 8 }}
          sx={{ overflowY: 'auto', overflowX: 'hidden' }}
        >
          <ModalHeader>{t('profile.editProfile')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={{ base: 2, md: 4 }}>
            <VStack spacing={6} align="stretch">
              {/* Basic Information Section */}
              <Box>
                <Heading size="sm" mb={4} color="brand.500">
                  {t('profile.basicInformation')}
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  <BasicFormControl
                    label={t('profile.displayName')}
                    name="displayName"
                    value={formData.displayName || ''}
                    placeholder={t('profile.enterDisplayName')}
                  />

                  <BasicFormControl
                    label={t('profile.firstName')}
                    name="firstName"
                    value={formData.firstName || ''}
                    placeholder={t('profile.enterFirstName')}
                  />

                  <BasicFormControl
                    label={t('profile.lastName')}
                    name="lastName"
                    value={formData.lastName || ''}
                    placeholder={t('profile.enterLastName')}
                  />

                  <BasicFormControl
                    label={t('profile.phoneNumber')}
                    name="phoneNumber"
                    value={formData.phoneNumber || ''}
                    placeholder={t('profile.enterPhoneNumber')}
                  />

                  <NumberFormControl
                    label={t('profile.age')}
                    value={formData.age || 0}
                    min={0}
                    max={120}
                    onChange={(_, valueNumber) => handleNumberChange('age', valueNumber)}
                  />

                  <SelectFormControl
                    label={t('profile.gender')}
                    name="gender"
                    value={formData.gender || 'male'}
                    onChange={handleInputChange}
                    options={GENDER_OPTIONS}
                  />

                  <SelectFormControl
                    label={t('profile.language')}
                    name="language"
                    value={formData.language || 'en'}
                    onChange={handleInputChange}
                    options={LANGUAGE_OPTIONS}
                  />
                </SimpleGrid>

                <FormControl mt={4}>
                  <FormLabel>{t('profile.notes')}</FormLabel>
                  <Textarea
                    name="notes"
                    variant="ghost"
                    value={formData.notes || ''}
                    onChange={handleInputChange}
                    placeholder={t('profile.enterNotes')}
                    rows={3}
                  />
                </FormControl>
              </Box>

              <Divider />

              {/* Health Profile Section */}
              <Box>
                <Heading size="sm" mb={4} color="brand.500">
                  {t('profile.healthProfile')}
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                  <NumberFormControl
                    label={`${t('profile.height')} (cm)`}
                    name="height"
                    value={formData.healthProfile?.height || ''}
                    min={50}
                    max={300}
                    onChange={(_, valueNumber) => handleHealthProfileChange('height', valueNumber)}
                  />

                  <NumberFormControl
                    label={`${t('profile.weight')} (kg)`}
                    name="weight"
                    value={formData.healthProfile?.weight || ''}
                    min={20}
                    max={500}
                    onChange={(_, valueNumber) => handleHealthProfileChange('weight', valueNumber)}
                  />

                  <SelectFormControl
                    label={t('profile.fitnessGoal')}
                    value={formData.healthProfile?.fitnessGoal || ''}
                    onChange={(e) => handleHealthProfileChange('fitnessGoal', e.target.value)}
                    options={FITNESS_GOAL_OPTIONS}
                    placeholder={t('profile.selectFitnessGoal')}
                  />

                  <SelectFormControl
                    label={t('profile.activityLevel')}
                    value={formData.healthProfile?.activityLevel || ''}
                    onChange={(e) => handleHealthProfileChange('activityLevel', e.target.value)}
                    options={ACTIVITY_LEVEL_OPTIONS}
                    placeholder={t('profile.selectActivityLevel')}
                  />
                </SimpleGrid>

                {/* Dietary Preferences */}
                <FormControl mt={4}>
                  <FormLabel>{t('profile.dietaryPreferences')}</FormLabel>
                  <CheckboxGrid
                    items={DIETARY_PREFERENCES}
                    selectedItems={formData.healthProfile?.dietaryPreferences}
                    fieldPath="healthProfile.dietaryPreferences"
                  />
                </FormControl>

                {/* Allergies & Restrictions */}
                <FormControl mt={4}>
                  <FormLabel>{t('profile.allergies')}</FormLabel>
                  <CheckboxGrid
                    items={ALLERGIES}
                    selectedItems={formData.healthProfile?.allergies}
                    fieldPath="healthProfile.allergies"
                  />
                </FormControl>
              </Box>

              <Divider />

              {/* Notification Preferences Section */}
              <Box>
                <Heading size="sm" mb={4} color="brand.500">
                  {t('profile.notificationPreferences')}
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <SwitchFormControl
                    label={t('profile.emailNotifications')}
                    id="email-notifications"
                    checked={formData.notificationPreferences?.email ?? true}
                    onChange={(e) => handleNotificationChange('email', e.target.checked)}
                  />

                  <SwitchFormControl
                    label={t('profile.smsNotifications')}
                    id="sms-notifications"
                    checked={formData.notificationPreferences?.sms ?? false}
                    onChange={(e) => handleNotificationChange('sms', e.target.checked)}
                  />

                  <SwitchFormControl
                    label={t('profile.pushNotifications')}
                    id="push-notifications"
                    checked={formData.notificationPreferences?.push ?? true}
                    onChange={(e) => handleNotificationChange('push', e.target.checked)}
                  />
                </SimpleGrid>
              </Box>
              <Divider />

              {/* Delivery Settings Section */}
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
                    variant={'outline'}
                  >
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                    <option value="18:00">06:00 PM</option>
                  </Select>
                </FormControl>
                <MapModal
                  isOpen={isMapOpen}
                  onClose={onCloseMap}
                  onSelectLocation={handleAddressSelect}
                />
              </Box>
              <Button
                colorScheme="brand"
                size="lg"
                onClick={handleSubmit}
                isLoading={isUpdating}
                loadingText={t('profile.saving')}
              >
                {t('profile.saveChanges')}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Main Content Tabs */}
      <Tabs variant="enclosed" colorScheme="brand">
        <TabList gap={12}>
          <Tab>{t('profile.overview')}</Tab>
          <Tab>{t('profile.orderHistory')}</Tab>
          <Tab>{t('profile.subscription')}</Tab>
        </TabList>

        <TabPanels mt={4}>
          <TabPanel>
            <Heading size="md" mb={4}>
              {t('profile.accountOverview')}
            </Heading>
            <Box p={4} bg={'brand.200'} borderRadius="lg">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <VStack align="start" spacing={3}>
                  <Heading size="sm">{t('profile.personalInformation')}</Heading>
                  <UserInfoItem
                    label={t('profile.email')}
                    value={user.email}
                    verified={user.emailVerified}
                  />
                  <UserInfoItem label={t('profile.displayName')} value={user.displayName} />
                  <UserInfoItem label={t('profile.firstName')} value={user.firstName} />
                  <UserInfoItem label={t('profile.lastName')} value={user.lastName} />
                  <UserInfoItem label={t('profile.phoneNumber')} value={user.phoneNumber} />
                  <UserInfoItem label={t('profile.age')} value={user.age} />
                  <UserInfoItem label={t('profile.gender')} value={user.gender} />
                  <UserInfoItem label={t('profile.language')} value={user.language || 'en'} />
                  <UserInfoItem
                    label={t('profile.accountCreated')}
                    value={new Date(user.createdAt).toLocaleDateString()}
                  />
                  {/*<UserInfoItem
                    label={t('profile.lastUpdated')}
                    value={new Date(user.updatedAt?.seconds * 1000).toLocaleString()}
                  />
                  <UserInfoItem
                    label={t('profile.lastLogin')}
                    value={new Date(user.lastLogin?.seconds * 1000).toLocaleString()}
                  />*/}
                  <UserInfoItem
                    label={t('profile.loyaltyPoints')}
                    value={user.loyaltyPoints || 0}
                  />
                  {user.notes && <UserInfoItem label={t('profile.notes')} value={user.notes} />}
                </VStack>

                <VStack align="start" spacing={3}>
                  {user.healthProfile && (
                    <>
                      <Heading size="sm">{t('profile.healthProfile')}</Heading>
                      <UserInfoItem
                        label={t('profile.height')}
                        value={user.healthProfile.height ? `${user.healthProfile.height} cm` : null}
                      />
                      <UserInfoItem
                        label={t('profile.weight')}
                        value={user.healthProfile.weight ? `${user.healthProfile.weight} kg` : null}
                      />
                      <UserInfoItem
                        label={t('profile.fitnessGoal')}
                        value={user.healthProfile.fitnessGoal}
                      />
                      <UserInfoItem
                        label={t('profile.activityLevel')}
                        value={user.healthProfile.activityLevel}
                      />
                      {user.healthProfile.dietaryPreferences?.length > 0 && (
                        <UserInfoItem
                          label={t('profile.dietaryPreferences')}
                          value={user.healthProfile.dietaryPreferences.join(', ')}
                        />
                      )}
                      {user.healthProfile.allergies?.length > 0 && (
                        <UserInfoItem
                          label={t('profile.allergies')}
                          value={user.healthProfile.allergies.join(', ')}
                        />
                      )}
                    </>
                  )}

                  <Heading size="sm" mt={4}>
                    {t('profile.notificationPreferences')}
                  </Heading>
                  <NotificationStatus
                    label={t('profile.emailNotifications')}
                    enabled={user.notificationPreferences?.email}
                  />
                  <NotificationStatus
                    label={t('profile.smsNotifications')}
                    enabled={user.notificationPreferences?.sms}
                  />
                  <NotificationStatus
                    label={t('profile.pushNotifications')}
                    enabled={user.notificationPreferences?.push}
                  />
                </VStack>
              </SimpleGrid>
            </Box>
          </TabPanel>

          <TabPanel>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">{t('profile.orderHistory')}</Heading>
              <Button
                onClick={handleRefreshOrders}
                isLoading={isOrdersLoading}
                size="sm"
                variant="ghost"
              >
                {t('profile.refresh')}
              </Button>
            </Flex>
            <OrderHistoryTable />
          </TabPanel>

          <TabPanel>
            <Heading size="md" mb={4}>
              {t('profile.subscriptionDetails')}
            </Heading>
            <SubscriptionDetails />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  )
}
