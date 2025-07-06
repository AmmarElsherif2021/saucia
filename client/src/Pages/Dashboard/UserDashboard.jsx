import { BasicInfoSection, HealthProfileSection, NotificationSection, DeliverySection, ProfileHeader, OverviewSection } from './DashboardSections'
import { OrderHistoryTable, SubscriptionDetails } from './DashboardComponents'
import { 
  Box,
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
  useToast, 
  Spinner,
  VStack,
  SimpleGrid,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  IconButton,
  Badge,
  Text,
  Flex,
  Heading,
  Switch
} from '@chakra-ui/react'
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons'

import { useTranslation } from 'react-i18next'
import { useAuthContext } from '../../Contexts/AuthContext'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MapModal from '../Checkout/MapModal'
// Import all necessary hooks
import { 
  useUserProfile, 
  useHealthProfile, 
  useUserAddresses, 
  useUserOrders,
  useUserAllergies,
  useDietaryPreferences,
  useFavorites,
  useUserReviews
} from '../../Hooks/userHooks'
import { useUserSubscriptions } from '../../Hooks/useUserSubscriptions'
import { usePaymentMethods } from '../../Hooks/usePaymentMethods'

export const UserDashboard = () => {
  const navigate = useNavigate()
  const { colorMode } = useColorMode()
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isMapOpen, onOpen: onOpenMap, onClose: onCloseMap } = useDisclosure()
  const { isOpen: isAddressOpen, onOpen: onAddressOpen, onClose: onAddressClose } = useDisclosure()
  const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onClose: onPaymentClose } = useDisclosure()
  const { isOpen: isReviewOpen, onOpen: onReviewOpen, onClose: onReviewClose } = useDisclosure()

  // Auth context for core user (id, email, etc)
  const { user } = useAuthContext()

  // Data hooks using custom hooks instead of direct queries
  const { 
    data: profile, 
    isLoading: isProfileLoading,
    updateProfile,
    isUpdatingProfile,
    completeProfile,
    isCompletingProfile
  } = useUserProfile()

  const { 
    data: healthProfile,
    updateHealthProfile,
    isUpdatingHealthProfile
  } = useHealthProfile()

  const { 
    addresses, 
    isLoading: isAddressLoading,
    addAddress,
    updateAddress,
    deleteAddress
  } = useUserAddresses()

  const { 
    orders, 
    isLoading: isOrdersLoading,
    refetch: refetchOrders
  } = useUserOrders()

  const { 
    subscriptions, 
    isLoading: isSubLoading,
    createSubscription,
    updateSubscription,
    pauseSubscription,
    resumeSubscription,
    isCreating: isCreatingSubscription,
    isUpdating: isUpdatingSubscription,
    isPausing: isPausingSubscription,
    isResuming: isResumingSubscription
  } = useUserSubscriptions()

  const {
    paymentMethods,
    isLoading: isPaymentLoading,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    isAddingPayment,
    isUpdatingPayment,
    isDeletingPayment
  } = usePaymentMethods()

  const {
    allergies,
    isLoading: isAllergiesLoading,
    addAllergy,
    removeAllergy,
    isAddingAllergy,
    isRemovingAllergy
  } = useUserAllergies()

  const {
    preferences: dietaryPreferences,
    isLoading: isDietaryLoading,
    addPreference,
    removePreference,
    isAddingPreference,
    isRemovingPreference
  } = useDietaryPreferences()

  const {
    favoriteMeals,
    favoriteItems,
    isLoadingMeals,
    isLoadingItems,
    addFavoriteMeal,
    removeFavoriteMeal,
    addFavoriteItem,
    removeFavoriteItem,
    isAddingMeal,
    isRemovingMeal,
    isAddingItem,
    isRemovingItem
  } = useFavorites()

  const {
    reviews,
    isLoading: isReviewsLoading,
    createReview,
    updateReview,
    deleteReview,
    isCreating: isCreatingReview,
    isUpdating: isUpdatingReview,
    isDeleting: isDeletingReview
  } = useUserReviews()

  // State management
  const [formData, setFormData] = useState({})
  const [addressFormData, setAddressFormData] = useState({})
  const [paymentFormData, setPaymentFormData] = useState({})
  const [reviewFormData, setReviewFormData] = useState({})
  const [editingAddress, setEditingAddress] = useState(null)
  const [editingPayment, setEditingPayment] = useState(null)
  const [editingReview, setEditingReview] = useState(null)

  const toast = useToast()

  // Default address
  const defaultAddress = addresses?.find(addr => addr.is_default) || null

  // Initialize form data
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        phone_number: profile.phone_number || '',
        age: profile.age || 0,
        gender: profile.gender || '',
        language: profile.language || 'en',
        notes: profile.notes || '',
        healthProfile: {
          height: healthProfile?.height_cm || 0,
          weight: healthProfile?.weight_kg || 0,
          fitnessGoal: healthProfile?.fitness_goal || '',
          activityLevel: healthProfile?.activity_level || '',
        },
        notificationPreferences: {
          email: profile.notification_preferences?.email ?? true,
          sms: profile.notification_preferences?.sms ?? false,
          push: profile.notification_preferences?.push ?? true,
        }
      })
    }
  }, [profile, healthProfile])

  // Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleHealthProfileChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      healthProfile: {
        ...prev.healthProfile,
        [field]: value
      }
    }))
  }

  const handleNotificationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [field]: value
      }
    }))
  }

  const handleCheckboxArrayChange = (fieldPath, value, checked) => {
    setFormData(prev => {
      // Split the fieldPath into parts (e.g., "healthProfile.dietaryPreferences")
      const pathParts = fieldPath.split('.');
      let current = {...prev};
      
      // Traverse the nested structure
      let temp = current;
      for (let i = 0; i < pathParts.length - 1; i++) {
        temp = temp[pathParts[i]] = {...temp[pathParts[i]]};
      }
      
      // Get the final property name
      const finalKey = pathParts[pathParts.length - 1];
      const arr = temp[finalKey] || [];
      
      // Update the array
      let newArr;
      if (checked) {
        newArr = [...arr, value];
      } else {
        newArr = arr.filter(v => v !== value);
      } 
      // Update the final property
      temp[finalKey] = newArr;
      return current;
    });
  }
  
  const handleNestedFieldChange = (parent, field, value) => {
    if (parent) {
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleDeliveryTimeChange = (e) => {
    setFormData(prev => ({ ...prev, deliveryTime: e.target.value }))
  }

  // Profile update handler
  const handleSubmit = async () => {
    try {
      // Update user profile
      await updateProfile({
        display_name: formData.display_name,
        phone_number: formData.phone_number,
        age: formData.age,
        gender: formData.gender,
        language: formData.language,
        notes: formData.notes,
        notification_preferences: formData.notificationPreferences
      })

      // Update health profile
      if (formData.healthProfile) {
        await updateHealthProfile({
          height_cm: formData.healthProfile.height,
          weight_kg: formData.healthProfile.weight,
          fitness_goal: formData.healthProfile.fitnessGoal,
          activity_level: formData.healthProfile.activityLevel
        })
      }

      toast({
        title: t('profile.profileUpdated'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      onClose()
    } catch (error) {
      toast({
        title: t('profile.updateError'),
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // Address handlers
  const handleAddressSubmit = async () => {
    try {
      if (editingAddress) {
        await updateAddress({
          addressId: editingAddress.id,
          addressData: addressFormData
        })
        toast({
          title: t('profile.addressUpdated'),
          status: 'success',
          duration: 3000,
        })
      } else {
        await addAddress(addressFormData)
        toast({
          title: t('profile.addressAdded'),
          status: 'success',
          duration: 3000,
        })
      }
      setAddressFormData({})
      setEditingAddress(null)
      onAddressClose()
    } catch (error) {
      toast({
        title: t('profile.addressError'),
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    }
  }

  const handleDeleteAddress = async (addressId) => {
    try {
      await deleteAddress(addressId)
      toast({
        title: t('profile.addressDeleted'),
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: t('profile.deleteError'),
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    }
  }

  // Payment method handlers
  const handlePaymentSubmit = async () => {
    try {
      if (editingPayment) {
        await updatePaymentMethod({
          paymentMethodId: editingPayment.id,
          paymentData: paymentFormData
        })
        toast({
          title: t('profile.paymentUpdated'),
          status: 'success',
          duration: 3000,
        })
      } else {
        await addPaymentMethod(paymentFormData)
        toast({
          title: t('profile.paymentAdded'),
          status: 'success',
          duration: 3000,
        })
      }
      setPaymentFormData({})
      setEditingPayment(null)
      onPaymentClose()
    } catch (error) {
      toast({
        title: t('profile.paymentError'),
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    }
  }

  const handleDeletePaymentMethod = async (paymentId) => {
    try {
      await deletePaymentMethod(paymentId)
      toast({
        title: t('profile.paymentDeleted'),
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: t('profile.deleteError'),
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    }
  }

  // Review handlers
  const handleReviewSubmit = async () => {
    try {
      if (editingReview) {
        await updateReview({
          reviewId: editingReview.id,
          reviewData: reviewFormData
        })
        toast({
          title: t('profile.reviewUpdated'),
          status: 'success',
          duration: 3000,
        })
      } else {
        await createReview(reviewFormData)
        toast({
          title: t('profile.reviewCreated'),
          status: 'success',
          duration: 3000,
        })
      }
      setReviewFormData({})
      setEditingReview(null)
      onReviewClose()
    } catch (error) {
      toast({
        title: t('profile.reviewError'),
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    }
  }

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview(reviewId)
      toast({
        title: t('profile.reviewDeleted'),
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: t('profile.deleteError'),
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    }
  }

  // Allergy handlers
  const handleAddAllergy = async (allergyId, severityLevel) => {
    try {
      await addAllergy({ allergyId, severityLevel })
      toast({
        title: t('profile.allergyAdded'),
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: t('profile.allergyError'),
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    }
  }

  const handleRemoveAllergy = async (allergyId) => {
    try {
      await removeAllergy(allergyId)
      toast({
        title: t('profile.allergyRemoved'),
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: t('profile.allergyError'),
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    }
  }

  // Dietary preference handlers
  const handleAddPreference = async (preferenceId) => {
    try {
      await addPreference(preferenceId)
      toast({
        title: t('profile.preferenceAdded'),
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: t('profile.preferenceError'),
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    }
  }

  const handleRemovePreference = async (preferenceId) => {
    try {
      await removePreference(preferenceId)
      toast({
        title: t('profile.preferenceRemoved'),
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: t('profile.preferenceError'),
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    }
  }

  // Subscription handlers
  const handlePauseSubscription = async (subscriptionId, pauseReason) => {
    try {
      await pauseSubscription({ subscriptionId, pauseReason })
      toast({
        title: t('profile.subscriptionPaused'),
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: t('profile.subscriptionError'),
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    }
  }

  const handleResumeSubscription = async (subscriptionId, resumeDate) => {
    try {
      await resumeSubscription({ subscriptionId, resumeDate })
      toast({
        title: t('profile.subscriptionResumed'),
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: t('profile.subscriptionError'),
        description: error.message,
        status: 'error',
        duration: 5000,
      })
    }
  }

  // Combined user data for display
  const userData = {
    ...user,
    ...profile,
    healthProfile,
    addresses,
    orders,
    subscriptions,
    paymentMethods,
    allergies,
    dietaryPreferences,
    favoriteMeals,
    favoriteItems,
    reviews
  }

  if (isProfileLoading) return <Spinner size="xl" />

  return (
    <Box p={4} bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
      <ProfileHeader 
        user={userData} 
        onOpen={onOpen} 
        t={t} 
      />
      
      {/* Edit Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('profile.editProfile')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6}>
              <BasicInfoSection 
                formData={formData} 
                handlers={{
                  handleInputChange,
                  handleNumberChange,
                }}
                t={t}
              />

              <HealthProfileSection 
                formData={formData}
                handlers={{
                  handleHealthProfileChange,
                  handleCheckboxArrayChange
                }}
                t={t}
              />

              <NotificationSection 
                formData={formData}
                handlers={{
                  handleNotificationChange
                }}
                t={t}
              />

              <DeliverySection 
                formData={formData}
                handlers={{
                  handleNestedFieldChange,
                  handleDeliveryTimeChange
                }}
                onOpenMap={onOpenMap}
                t={t}
              />
              
              <Button
                colorScheme="brand"
                onClick={handleSubmit}
                isLoading={isUpdatingProfile || isUpdatingHealthProfile}
                size="lg"
              >
                {t('profile.saveChanges')}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Address Management Modal */}
      <Modal isOpen={isAddressOpen} onClose={onAddressClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingAddress ? t('profile.editAddress') : t('profile.addAddress')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>{t('profile.addressLabel')}</FormLabel>
                <Input
                  value={addressFormData.label || ''}
                  onChange={(e) => setAddressFormData(prev => ({ ...prev, label: e.target.value }))}
                  placeholder={t('profile.enterAddressLabel')}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('profile.streetAddress')}</FormLabel>
                <Input
                  value={addressFormData.street || ''}
                  onChange={(e) => setAddressFormData(prev => ({ ...prev, street: e.target.value }))}
                  placeholder={t('profile.enterStreetAddress')}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('profile.city')}</FormLabel>
                <Input
                  value={addressFormData.city || ''}
                  onChange={(e) => setAddressFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder={t('profile.enterCity')}
                />
              </FormControl>
              <Button
                colorScheme="brand"
                onClick={handleAddressSubmit}
                isLoading={isAddressLoading}
              >
                {editingAddress ? t('profile.updateAddress') : t('profile.addAddress')}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Payment Methods Modal */}
      <Modal isOpen={isPaymentOpen} onClose={onPaymentClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingPayment ? t('profile.editPayment') : t('profile.addPayment')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>{t('profile.cardNumber')}</FormLabel>
                <Input
                  value={paymentFormData.card_number || ''}
                  onChange={(e) => setPaymentFormData(prev => ({ ...prev, card_number: e.target.value }))}
                  placeholder={t('profile.enterCardNumber')}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('profile.cardholderName')}</FormLabel>
                <Input
                  value={paymentFormData.cardholder_name || ''}
                  onChange={(e) => setPaymentFormData(prev => ({ ...prev, cardholder_name: e.target.value }))}
                  placeholder={t('profile.enterCardholderName')}
                />
              </FormControl>
              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>{t('profile.expiryDate')}</FormLabel>
                  <Input
                    value={paymentFormData.expiry_date || ''}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                    placeholder="MM/YY"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>{t('profile.cvv')}</FormLabel>
                  <Input
                    value={paymentFormData.cvv || ''}
                    onChange={(e) => setPaymentFormData(prev => ({ ...prev, cvv: e.target.value }))}
                    placeholder="CVV"
                  />
                </FormControl>
              </SimpleGrid>
              <Button
                colorScheme="brand"
                onClick={handlePaymentSubmit}
                isLoading={isAddingPayment || isUpdatingPayment}
              >
                {editingPayment ? t('profile.updatePayment') : t('profile.addPayment')}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={isReviewOpen} onClose={onReviewClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingReview ? t('profile.editReview') : t('profile.createReview')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>{t('profile.rating')}</FormLabel>
                <Select
                  value={reviewFormData.rating || ''}
                  onChange={(e) => setReviewFormData(prev => ({ ...prev, rating: e.target.value }))}
                >
                  <option value="">Select Rating</option>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>{t('profile.reviewTitle')}</FormLabel>
                <Input
                  value={reviewFormData.title || ''}
                  onChange={(e) => setReviewFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={t('profile.enterReviewTitle')}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('profile.reviewContent')}</FormLabel>
                <Textarea
                  value={reviewFormData.content || ''}
                  onChange={(e) => setReviewFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={t('profile.enterReviewContent')}
                  rows={4}
                />
              </FormControl>
              <Button
                colorScheme="brand"
                onClick={handleReviewSubmit}
                isLoading={isCreatingReview || isUpdatingReview}
              >
                {editingReview ? t('profile.updateReview') : t('profile.createReview')}
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      
      {/* Main Content */}
      <Tabs variant="enclosed">
        <TabList>
          <Tab>{t('profile.overview')}</Tab>
          <Tab>{t('profile.orderHistory')}</Tab>
          <Tab>{t('profile.subscription')}</Tab>
          <Tab>{t('profile.addresses')}</Tab>
          <Tab>{t('profile.paymentMethods')}</Tab>
          <Tab>{t('profile.reviews')}</Tab>
          <Tab>{t('profile.favorites')}</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <OverviewSection user={userData} t={t} />
          </TabPanel>
          
          <TabPanel>
            <OrderHistoryTable orders={orders} isLoading={isOrdersLoading} t={t} />
          </TabPanel>
          
          <TabPanel>
            <SubscriptionDetails 
              subscriptions={subscriptions} 
              isLoading={isSubLoading}
              onPause={handlePauseSubscription}
              onResume={handleResumeSubscription}
              isPausing={isPausingSubscription}
              isResuming={isResumingSubscription}
              t={t}
            />
          </TabPanel>

          <TabPanel>
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">{t('profile.addresses')}</Heading>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="brand"
                  onClick={() => {
                    setAddressFormData({})
                    setEditingAddress(null)
                    onAddressOpen()
                  }}
                >
                  {t('profile.addAddress')}
                </Button>
              </Flex>
              {isAddressLoading ? (
                <Spinner />
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {addresses?.map(address => (
                    <Box key={address.id} p={4} borderWidth="1px" borderRadius="lg">
                      <Flex justify="space-between" align="start">
                        <Box>
                          <Text fontWeight="bold">{address.label}</Text>
                          <Text>{address.street}</Text>
                          <Text>{address.city}</Text>
                          {address.is_default && (
                            <Badge colorScheme="green" mt={2}>
                              {t('profile.default')}
                            </Badge>
                          )}
                        </Box>
                        <Flex>
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            onClick={() => {
                              setAddressFormData(address)
                              setEditingAddress(address)
                              onAddressOpen()
                            }}
                            mr={2}
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteAddress(address.id)}
                          />
                        </Flex>
                      </Flex>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </Box>
          </TabPanel>

          <TabPanel>
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">{t('profile.paymentMethods')}</Heading>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="brand"
                  onClick={() => {
                    setPaymentFormData({})
                    setEditingPayment(null)
                    onPaymentOpen()
                  }}
                >
                  {t('profile.addPayment')}
                </Button>
              </Flex>
              {isPaymentLoading ? (
                <Spinner />
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {paymentMethods?.map(payment => (
                    <Box key={payment.id} p={4} borderWidth="1px" borderRadius="lg">
                      <Flex justify="space-between" align="start">
                        <Box>
                          <Text fontWeight="bold">
                            **** **** **** {payment.card_number?.slice(-4)}
                          </Text>
                          <Text>{payment.cardholder_name}</Text>
                          <Text>Expires: {payment.expiry_date}</Text>
                        </Box>
                        <Flex>
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            onClick={() => {
                              setPaymentFormData(payment)
                              setEditingPayment(payment)
                              onPaymentOpen()
                            }}
                            mr={2}
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeletePaymentMethod(payment.id)}
                          />
                        </Flex>
                      </Flex>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </Box>
          </TabPanel>

          <TabPanel>
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">{t('profile.reviews')}</Heading>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="brand"
                  onClick={() => {
                    setReviewFormData({})
                    setEditingReview(null)
                    onReviewOpen()
                  }}
                >
                  {t('profile.createReview')}
                </Button>
              </Flex>
              {isReviewsLoading ? (
                <Spinner />
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {reviews?.map(review => (
                    <Box key={review.id} p={4} borderWidth="1px" borderRadius="lg">
                      <Flex justify="space-between" align="start">
                        <Box>
                          <Text fontWeight="bold">{review.title}</Text>
                          <Text>{review.content}</Text>
                          <Text>Rating: {review.rating} Stars</Text>
                        </Box>
                        <Flex>
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            onClick={() => {
                              setReviewFormData(review)
                              setEditingReview(review)
                              onReviewOpen()
                            }}
                            mr={2}
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            size="sm"
                            colorScheme="red"
                            onClick={() => handleDeleteReview(review.id)}
                          />
                        </Flex>
                      </Flex>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </Box>
          </TabPanel>
          <TabPanel>
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">{t('profile.favorites')}</Heading>
              </Flex>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {favoriteMeals?.map(meal => (
                  <Box key={meal.id} p={4} borderWidth="1px" borderRadius="lg">
                    <Text fontWeight="bold">{meal.name}</Text>
                    <Text>{meal.description}</Text>
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => removeFavoriteMeal(meal.id)}
                    />
                  </Box>
                ))}
                {favoriteItems?.map(item => (
                  <Box key={item.id} p={4} borderWidth="1px" borderRadius="lg">
                    <Text fontWeight="bold">{item.name}</Text>
                    <Text>{item.description}</Text>
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => removeFavoriteItem(item.id)}
                    />
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
      {/* Map Modal for Address */}
      <MapModal
        isOpen={isMapOpen}
        onClose={onCloseMap}
        addressFormData={addressFormData}
        setAddressFormData={setAddressFormData}
        onAddressSubmit={handleAddressSubmit}
      />
    </Box>
  )
}