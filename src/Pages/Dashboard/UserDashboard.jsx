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
} from '@chakra-ui/react'
import { StarIcon, EditIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'
import { useUser } from '../../Contexts/UserContext'
import { useState } from 'react'

export const UserDashboard = () => {
  const { colorMode } = useColorMode()
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user, loading, refreshOrders } = useUser()
  const [isOrdersLoading, setIsOrdersLoading] = useState(false)

  const handleRefreshOrders = async () => {
    setIsOrdersLoading(true)
    try {
      await refreshOrders()
    } finally {
      setIsOrdersLoading(false)
    }
  }

  const OrderHistoryTable = () => (
    <TableContainer>
      <Table variant="striped" size="sm">
        <Thead>
          <Tr>
            <Th>Order ID</Th>
            <Th>Date</Th>
            <Th>Items</Th>
            <Th>Total</Th>
            <Th>Status</Th>
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
          No orders found
        </Text>
      )}
    </TableContainer>
  )

  //=========================  render =================================
  if (loading) return <Box p={4}>Loading user data...</Box>
  if (!user) return <Box p={4}>Please login to view dashboard</Box>

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
            {user.displayName || t('anonymousUser')}
          </Heading>
          <Text fontSize="lg" color="gray.500">
            {user.email}
          </Text>

          <Flex mt={4} gap={3} wrap="wrap" justify={{ base: 'center', md: 'start' }}>
            <Badge colorScheme="brand" px={3} py={1} borderRadius="md" cursor="pointer">
              {t(user.planTitle?.toLowerCase() || 'freePlan')}
            </Badge>

            <Flex align="center" gap={2}>
              <StarIcon color="brand.500" />
              <Text>
                {user.rewardPoints ?? 0} {t('rewardPoints')}
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
          {t('editProfile')}
        </Button>
      </Flex>

      {/* Edit Profile Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent sx={{ minWidth: '60%' }}>
          <ModalHeader>{t('editProfile')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {/* Basic Information Section */}
            <Flex gap={4} mb={6}>
              <FormControl flex={1}>
                <FormLabel>{t('displayName')}</FormLabel>
                <Input defaultValue={user.displayName} placeholder={t('enterName')} width={'90%'} />
              </FormControl>
            </Flex>

            {/* Meal Plan Details */}
            <Flex gap={4} mb={6}>
              <FormControl flex={1}>
                <FormLabel>{t('nextMealTime')}</FormLabel>
                <Input type="time" defaultValue={user.nextMeal?.time} width={'40%'} />
              </FormControl>

              <FormControl flex={1}>
                <FormLabel>{t('mealLocation')}</FormLabel>
                <Input
                  defaultValue={user.nextMeal?.location}
                  placeholder={t('enterLocation')}
                  width={'90%'}
                />
              </FormControl>
            </Flex>

            {/* Progress and Preferences */}
            <Flex gap={4} mb={6}>
              <FormControl flex={1}>
                <FormLabel>{t('planProgress')}</FormLabel>
                <Input
                  type="number"
                  defaultValue={user.timeRemaining}
                  suffix="%"
                  max={100}
                  min={0}
                  width={'40%'}
                />
              </FormControl>

              <FormControl flex={1}>
                <FormLabel>{t('currentPlan')}</FormLabel>
                <Input defaultValue={user.planTitle} isReadOnly variant="filled" width={'40%'} />
              </FormControl>
            </Flex>

            {/* Dietary Preferences */}
            <FormControl mt={4}>
              <FormLabel>{t('dietaryPreferences')}</FormLabel>
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
                    defaultChecked={user.dietaryPreferences?.includes(pref)}
                    value={pref}
                  >
                    {t(pref.toLowerCase())}
                  </Checkbox>
                ))}
              </Flex>
              <Input
                mt={2}
                placeholder={t('enterOtherPreferences')}
                defaultValue={user.dietaryPreferences
                  ?.filter(
                    (p) =>
                      ![
                        'Vegetarian',
                        'Vegan',
                        'Gluten-Free',
                        'Dairy-Free',
                        'Keto',
                        'Paleo',
                        'Low-Carb',
                        'Mediterranean',
                      ].includes(p),
                  )
                  .join(', ')}
                width={'90%'}
              />
            </FormControl>

            {/* Allergies & Restrictions */}
            <FormControl mt={4}>
              <FormLabel>{t('allergies')}</FormLabel>
              <Flex wrap="wrap" gap={3}>
                {['Nuts', 'Shellfish', 'Soy', 'Eggs', 'Fish', 'Dairy', 'Wheat', 'Sesame'].map(
                  (allergy) => (
                    <Checkbox
                      key={allergy}
                      defaultChecked={user.allergies?.includes(allergy)}
                      value={allergy}
                    >
                      {t(allergy.toLowerCase())}
                    </Checkbox>
                  ),
                )}
              </Flex>
              <Input
                mt={2}
                placeholder={t('enterOtherAllergies')}
                defaultValue={user.allergies
                  ?.filter(
                    (a) =>
                      ![
                        'Nuts',
                        'Shellfish',
                        'Soy',
                        'Eggs',
                        'Fish',
                        'Dairy',
                        'Wheat',
                        'Sesame',
                      ].includes(a),
                  )
                  .join(', ')}
                width={'90%'}
              />
            </FormControl>

            <Button colorScheme="brand" mt={6} w="full">
              {t('saveChanges')}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Main Content Tabs */}
      <Tabs variant="enclosed" colorScheme="brand">
        <TabList gap={12}>
          <Tab>{t('mealPlan')}</Tab>
          <Tab>{t('orderHistory')}</Tab>
          <Tab>{t('subscription')}</Tab>
        </TabList>

        <TabPanels mt={4}>
          <TabPanel>
            <Heading size="md" mb={4}>
              {t('yourMealPlan')}
            </Heading>
            {/* Meal plan content */}
          </TabPanel>

          <TabPanel>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">{t('orderHistory')}</Heading>
              <Button
                onClick={handleRefreshOrders}
                isLoading={isOrdersLoading}
                size="sm"
                variant="ghost"
              >
                Refresh
              </Button>
            </Flex>
            <OrderHistoryTable />
          </TabPanel>

          <TabPanel>
            <Heading size="md" mb={4}>
              {t('subscriptionDetails')}
            </Heading>
            {/* Subscription management */}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Preferences Section */}
      <Box mt={8} p={4} bg="gray.50" borderRadius="md">
        <Heading size="md" mb={4}>
          {t('preferences')}
        </Heading>
        <Flex gap={4} wrap="wrap">
          <Badge colorScheme="green">{t('dietaryPreferences')}</Badge>
          <Badge colorScheme="red">{t('allergies')}</Badge>
          <Badge colorScheme="blue">{t('nutritionGoals')}</Badge>
        </Flex>
      </Box>
    </Box>
  )
}
