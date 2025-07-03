import { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Switch,
  FormControl,
  FormLabel,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Icon,
  Select,
  Input,
  useToast,
  Spinner,
  Card,
  CardBody,
  CardHeader,
} from '@chakra-ui/react'
import {
  FiPlay,
  FiPause,
  FiClock,
  FiMapPin,
  FiCalendar,
  FiSettings,
  FiTruck,
  FiUser,
} from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useAuthContext } from '../../Contexts/AuthContext'
import { useI18nContext } from '../../Contexts/I18nContext'

const PlanSettingsModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const { user, userPlan, updateUserProfile, planLoading } = useAuthContext()
  const [loading, setLoading] = useState(false)
  const [planStatus, setPlanStatus] = useState('active')
  const [deliveryTime, setDeliveryTime] = useState({ hours: '12', minutes: '00' })
  const [selectedAddress, setSelectedAddress] = useState('')
  const toast = useToast()

  const isArabic = currentLanguage === 'ar'
  const subscription = user?.subscription || {}

  // Helper function to get address display
  const getAddressDisplay = (address) => {
    if (typeof address === 'string') return address
    if (address.display_name) return address.display_name
    if (address.address) return address.address
    return JSON.stringify(address)
  }
  // Initialize state from user data
  useEffect(() => {
    if (user?.subscription) {
      setPlanStatus(user.subscription.status || 'active')

      // Parse delivery time if exists
      if (user.subscription.deliveryTime) {
        const [hours, minutes] = user.subscription.deliveryTime.split(':')
        setDeliveryTime({ hours: hours || '12', minutes: minutes || '00' })
      }

      // Set selected address
      if (user.subscription.deliveryAddress) {
        setSelectedAddress(
          typeof user.subscription.deliveryAddress === 'string'
            ? user.subscription.deliveryAddress
            : getAddressDisplay(user.subscription.deliveryAddress),
        )
      } else if (user.defaultAddress) {
        setSelectedAddress(
          typeof user.defaultAddress === 'string'
            ? user.defaultAddress
            : getAddressDisplay(user.defaultAddress),
        )
      }
    }
  }, [user])
  // Calculate next meal info
  const getNextMealInfo = () => {
    if (!userPlan || !subscription.startDate) return null

    const today = new Date()
    const startDate = new Date(subscription.startDate)
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24))

    // Calculate consumed meals vs total meals
    const consumedMeals = subscription.consumedMeals || 0
    const totalMeals = subscription.mealsCount || 0
    const remainingMeals = totalMeals - consumedMeals

    if (remainingMeals <= 0) {
      return { type: 'completed', message: t('premium.planCompleted') }
    }

    // Mock next meal calculation (you'll need to implement based on your meal scheduling logic)
    const nextMealDate = new Date(today)
    nextMealDate.setDate(today.getDate() + 1)

    return {
      type: 'scheduled',
      date: nextMealDate.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US'),
      time: `${deliveryTime.hours}:${deliveryTime.minutes}`,
      remainingMeals,
      totalMeals,
    }
  }

  const handlePlanStatusToggle = async () => {
    setLoading(true)
    try {
      const newStatus = planStatus === 'active' ? 'paused' : 'active'

      await updateUserProfile(user.uid, {
        subscription: {
          ...subscription,
          status: newStatus,
          pausedAt: newStatus === 'paused' ? new Date().toISOString() : null,
          resumedAt:
            newStatus === 'active' && planStatus === 'paused'
              ? new Date().toISOString()
              : subscription.resumedAt,
        },
      })

      setPlanStatus(newStatus)

      toast({
        title: t('premium.success'),
        description:
          newStatus === 'paused'
            ? t('premium.planPausedSuccessfully')
            : t('premium.planResumedSuccessfully'),
        status: 'success',
        duration: 3000,
        isClosable: false,
      })
    } catch (error) {
      console.error('Error updating plan status:', error)
      toast({
        title: t('premium.error'),
        description: t('premium.failedToUpdatePlanStatus'),
        status: 'error',
        duration: 3000,
        isClosable: false,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeliverySettingsUpdate = async () => {
    setLoading(true)
    try {
      const deliveryTimeString = `${deliveryTime.hours}:${deliveryTime.minutes}`

      await updateUserProfile(user.uid, {
        subscription: {
          ...subscription,
          deliveryTime: deliveryTimeString,
          deliveryAddress: selectedAddress,
        },
      })

      toast({
        title: t('premium.success'),
        description: t('premium.deliverySettingsUpdated'),
        status: 'success',
        duration: 3000,
        isClosable: false,
      })
    } catch (error) {
      console.error('Error updating delivery settings:', error)
      toast({
        title: t('premium.error'),
        description: t('premium.failedToUpdateDeliverySettings'),
        status: 'error',
        duration: 3000,
        isClosable: false,
      })
    } finally {
      setLoading(false)
    }
  }

  const nextMealInfo = getNextMealInfo()

  if (!user?.subscription?.planId) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('premium.planSettings')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>{t('premium.noActivePlan')}</AlertTitle>
              <AlertDescription>{t('premium.pleaseSubscribeToAPlanFirst')}</AlertDescription>
            </Alert>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent maxW="90%" p={4}>
        <ModalHeader>
          <HStack>
            <Icon as={FiSettings} />
            <Text>{t('premium.planSettings')}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Current Plan Overview */}
            <Card>
              <CardHeader>
                <HStack>
                  <Icon as={FiUser} color="brand.500" />
                  <Text fontWeight="bold">{t('premium.currentPlan')}</Text>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <HStack justify="space-between">
                    <Text>{t('premium.planName')}:</Text>
                    <Text fontWeight="medium">
                      {planLoading ? (
                        <Spinner size="sm" />
                      ) : isArabic ? (
                        userPlan?.title_arabic || userPlan?.title
                      ) : (
                        userPlan?.title
                      )}
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text>{t('premium.totalMeals')}:</Text>
                    <Badge colorScheme="blue">{subscription.mealsCount || 0}</Badge>
                  </HStack>

                  <HStack justify="space-between">
                    <Text>{t('premium.consumedMeals')}:</Text>
                    <Badge colorScheme="green">{subscription.consumedMeals || 0}</Badge>
                  </HStack>

                  <HStack justify="space-between">
                    <Text>{t('premium.remainingMeals')}:</Text>
                    <Badge colorScheme="orange">
                      {(subscription.mealsCount || 0) - (subscription.consumedMeals || 0)}
                    </Badge>
                  </HStack>

                  <HStack justify="space-between">
                    <Text>{t('premium.planStatus')}:</Text>
                    <Badge colorScheme={planStatus === 'active' ? 'green' : 'red'}>
                      {t(planStatus)}
                    </Badge>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>

            {/* Plan Control */}
            <Card>
              <CardHeader>
                <HStack>
                  <Icon as={planStatus === 'active' ? FiPause : FiPlay} color="brand.500" />
                  <Text fontWeight="bold">{t('premium.planControl')}</Text>
                </HStack>
              </CardHeader>
              <CardBody>
                <FormControl>
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <FormLabel mb={0}>
                        {planStatus === 'active' ? t('premium.pausePlan') : t('premium.resumePlan')}
                      </FormLabel>
                      <Text fontSize="sm" color="gray.500">
                        {planStatus === 'active'
                          ? t('premium.temporarilyStopMealDeliveries')
                          : t('premium.resumeMealDeliveries')}
                      </Text>
                    </VStack>
                    <Switch
                      isChecked={planStatus === 'active'}
                      onChange={handlePlanStatusToggle}
                      isDisabled={loading}
                      colorScheme="brand"
                      size="lg"
                    />
                  </HStack>
                </FormControl>

                {planStatus === 'paused' && subscription.pausedAt && (
                  <Alert status="warning" mt={4}>
                    <AlertIcon />
                    <Box>
                      <AlertTitle>{t('premium.planCurrentlyPaused')}</AlertTitle>
                      <AlertDescription>
                        {t('premium.pausedSince')}:{' '}
                        {new Date(subscription.pausedAt).toLocaleDateString()}
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}
              </CardBody>
            </Card>

            {/* Next Scheduled Meal */}
            <Card>
              <CardHeader>
                <HStack>
                  <Icon as={FiCalendar} color="brand.500" />
                  <Text fontWeight="bold">{t('premium.nextScheduledMeal')}</Text>
                </HStack>
              </CardHeader>
              <CardBody>
                {nextMealInfo ? (
                  <VStack align="stretch" spacing={3}>
                    {nextMealInfo.type === 'scheduled' ? (
                      <>
                        <HStack>
                          <Icon as={FiClock} />
                          <Text>{t('premium.nextDelivery')}:</Text>
                          <Text fontWeight="medium">
                            {nextMealInfo.date} {t('premium.at')} {nextMealInfo.time}
                          </Text>
                        </HStack>
                        <HStack>
                          <Text>{t('premium.mealsRemaining')}:</Text>
                          <Badge colorScheme="blue">
                            {nextMealInfo.remainingMeals} / {nextMealInfo.totalMeals}
                          </Badge>
                        </HStack>
                      </>
                    ) : (
                      <Alert status="info">
                        <AlertIcon />
                        <AlertDescription>{nextMealInfo.message}</AlertDescription>
                      </Alert>
                    )}
                  </VStack>
                ) : (
                  <Text color="gray.500">{t('premium.noScheduledMeals')}</Text>
                )}
              </CardBody>
            </Card>

            {/* Delivery Settings */}
            <Card>
              <CardHeader>
                <HStack>
                  <Icon as={FiTruck} color="brand.500" />
                  <Text fontWeight="bold">{t('premium.deliverySettings')}</Text>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  {/* Delivery Address */}
                  <FormControl>
                    <FormLabel>{t('premium.deliveryAddress')}</FormLabel>
                    <Select
                      value={selectedAddress}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      placeholder={t('premium.selectAddress')}
                    >
                      {user?.addresses?.map((address, index) => {
                        const addressDisplay = getAddressDisplay(address)
                        return (
                          <option key={index} value={addressDisplay}>
                            {addressDisplay}
                          </option>
                        )
                      })}
                    </Select>
                    {(!user?.addresses || user.addresses.length === 0) && (
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        {t('premium.noAddressesAvailable')}.{' '}
                        {t('premium.pleaseAddAddressInProfile')}
                      </Text>
                    )}
                  </FormControl>

                  {/* Delivery Time */}
                  <FormControl>
                    <FormLabel>{t('premium.selectDeliveryTime')}</FormLabel>
                    <Flex>
                      <Select
                        value={`${deliveryTime.hours}:${deliveryTime.minutes}`}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(':')
                          setDeliveryTime({ hours, minutes })
                        }}
                        maxW="180px"
                      >
                        {['11', '12', '13', '14', '15', '16', '17', '18'].flatMap((hour) =>
                          ['00', '15', '30', '45'].map((minute) => (
                            <option key={`${hour}-${minute}`} value={`${hour}:${minute}`}>
                              {`${hour}:${minute}`}
                            </option>
                          )),
                        )}
                      </Select>
                    </Flex>
                  </FormControl>

                  {/* Current Delivery Info */}
                  {(selectedAddress || subscription.deliveryTime) && (
                    <Box p={3} bg="gray.50" borderRadius="md">
                      <HStack>
                        <Icon as={FiMapPin} />
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" fontWeight="medium">
                            {t('premium.currentDeliverySettings')}:
                          </Text>
                          {selectedAddress && (
                            <Text fontSize="sm">
                              <strong>{t('premium.address')}:</strong> {selectedAddress}
                            </Text>
                          )}
                          <Text fontSize="sm">
                            <strong>{t('premium.time')}:</strong> {deliveryTime.hours}:
                            {deliveryTime.minutes}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  )}

                  <Button
                    onClick={handleDeliverySettingsUpdate}
                    isLoading={loading}
                    loadingText={t('premium.updating')}
                    colorScheme="brand"
                    size="sm"
                  >
                    {t('premium.updateDeliverySettings')}
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Plan Duration Info */}
            {subscription.startDate && subscription.endDate && (
              <Card>
                <CardBody>
                  <VStack align="stretch" spacing={2}>
                    <Text fontWeight="medium">{t('premium.planDuration')}</Text>
                    <HStack justify="space-between">
                      <Text>{t('premium.startDate')}:</Text>
                      <Text>{new Date(subscription.startDate).toLocaleDateString()}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>{t('premium.endDate')}:</Text>
                      <Text>{new Date(subscription.endDate).toLocaleDateString()}</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default PlanSettingsModal
