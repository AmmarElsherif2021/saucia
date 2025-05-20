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
} from '@chakra-ui/react'
import { StarIcon, EditIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'
import { useUser } from '../../Contexts/UserContext'
import { useState, useEffect } from 'react'
import { updateUserProfile } from '../../API/users'

export const UserDashboard = () => {
  const { colorMode } = useColorMode()
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user, loading, userPlan, planLoading, refreshOrders, updateUserSubscription } = useUser()
  const [isOrdersLoading, setIsOrdersLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({})
  const toast = useToast()

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      console.log(` From user dashboard user data ${JSON.stringify(user)}`)
      setFormData({
        displayName: user.displayName || '',
        dietaryPreferences: user.dietaryPreferences || [],
        allergies: user.allergies || [],
      })
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (field, value, isChecked) => {
    setFormData(prev => ({
      ...prev,
      [field]: isChecked
        ? [...(prev[field] || []), value]
        : (prev[field] || []).filter(item => item !== value)
    }))
  }

  const handleSubmit = async () => {
    if (!user?.uid) return
    
    setIsUpdating(true)
    try {
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
      <Box>
        {user.subscription.planId ? (
          <Box p={4} borderWidth="1px" borderRadius="lg">
            <Heading size="md" mb={2}>{user.subscription.planName}</Heading>
           
            <Text fontWeight="bold" mb={2}>${user.subscription.price}/month</Text>
            {user.subscriptionEndDate && (
              <Text>
                {t('profile.renewsOn')}: {new Date(user.subscription.subscriptionEndDate).toLocaleDateString()}
              </Text>
            )}
        
                  <Heading size="sm" mt={4} mb={2}>{t('profile.subscriptionInfo')}</Heading>
                  <Text><strong>{t('profile.status')}:</strong> <Badge colorScheme={user.subscription.status === 'active' ? 'green' : 'orange'}>{user.subscription.status}</Badge></Text>
                  <Text><strong>{t('profile.paymentMethod')}:</strong> {user.subscription.paymentMethod}</Text>
                  <Text><strong>{t('profile.startDate')}:</strong> {new Date(user.subscription.startDate).toLocaleDateString()}</Text>
                  <Text><strong>{t('profile.endDate')}:</strong> {new Date(user.subscription.endDate).toLocaleDateString()}</Text>
                  <Text><strong>{t('profile.price')}:</strong> ${user.subscription.price.toFixed(2)}</Text>

            <Button mt={4} colorScheme="brand">
              {t('profile.manageSubscription')}
            </Button>
          </Box>
        ) : (
          <Box p={4} borderWidth="1px" borderRadius="lg">
            <Text mb={4}>{t('profile.noActiveSubscription')}</Text>
            <Button colorScheme="brand">
              {t('profile.browsePlans')}
            </Button>
          </Box>
        )}
      </Box>
    )
  }

  if (loading) return <Box p={4}><Spinner size="xl" /></Box>
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
                {user.rewardPoints ?? 0} {t('profile.rewardPoints')}
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
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('profile.editProfile')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {/* Basic Information Section */}
            <Flex gap={4} mb={6}>
              <FormControl flex={1}>
                <FormLabel>{t('profile.displayName')}</FormLabel>
                <Input 
                  name="displayName"
                  value={formData.displayName || ''}
                  onChange={handleInputChange}
                  placeholder={t('profile.enterName')}
                />
              </FormControl>
            </Flex>

            {/* Dietary Preferences */}
            <FormControl mt={4}>
              <FormLabel>{t('profile.dietaryPreferences')}</FormLabel>
              <Flex wrap="wrap" gap={3}>
                {[
                  'Vegetarian',
                  'Vegan',
                  'Gluten-Free',
                  'Dairy-Free',
                  'Keto',
                  'Paleo',
                  'Low-Carb',
                  'Mediterranean',
                ].map((pref) => (
                  <Checkbox
                    key={pref}
                    isChecked={formData.dietaryPreferences?.includes(pref)}
                    onChange={(e) => handleCheckboxChange('dietaryPreferences', pref, e.target.checked)}
                    value={pref}
                  >
                    {t(pref.toLowerCase())}
                  </Checkbox>
                ))}
              </Flex>
            </FormControl>

            {/* Allergies & Restrictions */}
            <FormControl mt={4}>
              <FormLabel>{t('profile.allergies')}</FormLabel>
              <Flex wrap="wrap" gap={3}>
                {['Nuts', 'Shellfish', 'Soy', 'Eggs', 'Fish', 'Dairy', 'Wheat', 'Sesame'].map(
                  (allergy) => (
                    <Checkbox
                      key={allergy}
                      isChecked={formData.allergies?.includes(allergy)}
                      onChange={(e) => handleCheckboxChange('allergies', allergy, e.target.checked)}
                      value={allergy}
                    >
                      {t(allergy.toLowerCase())}
                    </Checkbox>
                  ),
                )}
              </Flex>
            </FormControl>

            <Button 
              colorScheme="brand" 
              mt={6} 
              w="full"
              onClick={handleSubmit}
              isLoading={isUpdating}
            >
              {t('profile.saveChanges')}
            </Button>
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
          <Box p={4} borderWidth="1px" borderRadius="lg">
            <Flex direction="column" gap={3}>
              <Text><strong>{t('profile.email')}:</strong> {user.email} {user.emailVerified && <Badge colorScheme="green" ml={2}>{t('profile.verified')}</Badge>}</Text>
              <Text><strong>{t('profile.accountCreated')}:</strong> {new Date(user.createdAt).toLocaleDateString()}</Text>
              <Text><strong>{t('profile.lastUpdated')}:</strong> {new Date(user.updatedAt?.seconds * 1000).toLocaleString()}</Text>
              <Text><strong>{t('profile.lastLogin')}:</strong> {new Date(user.lastLogin?.seconds * 1000).toLocaleString()}</Text>
              <Text><strong>{t('profile.age')}:</strong> {user.age}</Text>
              <Text><strong>{t('profile.gender')}:</strong> {user.gender}</Text>
              
              {user.healthProfile && (
                <>
                  <Heading size="sm" mt={4} mb={2}>{t('profile.healthProfile')}</Heading>
                  <Text><strong>{t('profile.height')}:</strong> {user.healthProfile.height} cm</Text>
                  <Text><strong>{t('profile.weight')}:</strong> {user.healthProfile.weight} kg</Text>
                  <Text><strong>{t('profile.activityLevel')}:</strong> {user.healthProfile.activityLevel.split('profile.-').join(' ')}</Text>
                  <Text><strong>{t('profile.fitnessGoal')}:</strong> {user.healthProfile.fitnessGoal.split('profile.-').join(' ')}</Text>
                  {user.healthProfile.dietaryPreferences?.length > 0 && (
                    <Text>
                      <strong>{t('profile.dietaryPreferences')}:</strong> {user.healthProfile.dietaryPreferences.join(', ')}
                    </Text>
                  )}
                  {user.healthProfile.allergies?.length > 0 && (
                    <Text>
                      <strong>{t('profile.allergies')}:</strong> {user.healthProfile.allergies.join(', ')}
                    </Text>
                  )}
                </>
              )}
              
              
            </Flex>
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