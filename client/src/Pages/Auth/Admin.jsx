/* eslint-disable */
/* global FileReader, alert */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Grid,
  useBreakpointValue,
  Stack,
  TableContainer,
  Badge,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useToast,
} from '@chakra-ui/react'
import { 
  FaUsers, 
  FaUserShield, 
  FaBox, 
  FaClipboardList, 
  FaShoppingCart, 
  FaDollarSign, 
  FaSync, 
  FaUtensils 
} from 'react-icons/fa';

import { useAuthContext } from '../../Contexts/AuthContext.jsx'
import { useAdminFunctions } from '../../Hooks/useAdminFunctions.jsx'
import {
  StatCard,
  LoadingSpinner,
  ErrorAlert,
  SectionHeading,
  ConfirmationModal,
  FormModal,
  ScrollableTableContainer,
  SearchInput,
} from './AdminComponents.jsx'

import { useEntityManager } from './useEntityManager.jsx'
import { 
  FaEdit as EditIcon, 
  FaTrash as DeleteIcon, 
  FaArrowCircleDown as DownloadIcon, 
  FaPlus as AddIcon, 
  FaArrowCircleUp as UploadIcon, 
  FaSearch as SearchIcon 
} from 'react-icons/fa'
import MealDeliveryDashboard from './DailySceduleDashboard.jsx';

// Reusable EntitySection component
const EntitySection = ({ 
  entityType, 
  data, 
  isLoading, 
  entityManager, 
  isTableScrollable 
}) => {
  const { config, filterEntities, searchTerm, setSearchTerm, selectedEntity, setSelectedEntity, modals, handlers } = entityManager
  const filteredData = filterEntities(data)
  const { t } = useTranslation(); 
  const renderCellContent = (item, column) => {
    const value = item[column.key]
    if (column.render) {
      return column.render(value)
    }
    return value
  }

  return (
    <Box 
      gap={6} 
      m={6} 
      maxW={'90%'} 
      backgroundColor={'#ffffff'} 
      p={6}
      borderRadius="md"
      boxShadow="sm"
      border="1px"
      borderColor="gray.100"
    >
      <SectionHeading
        title={t(config.titleKey || `admin.entities.${entityType}.title`, { defaultValue: config.title })}
        description={t(config.descriptionKey || `admin.entities.${entityType}.description`, { defaultValue: config.description })}
        onAddClick={modals.add.onOpen}
        buttonText={t('admin.actions.add_entity', {
          entity: t(config.singularKey || `admin.entities.${entityType}.singular`, { defaultValue: config.singular }),
          defaultValue: `Add ${config.singular}`
        })}
        AddIcon={AddIcon}
      />
      
      <Flex gap={2} mb={4}>
        <SearchInput 
          value={searchTerm} 
          onChange={setSearchTerm} 
          leftElement={<SearchIcon color="gray.400" />} 
        />
        {config.hasImport && (
          <Button 
           h={"2.5rem"} 
           w={"2.5rem"} 
           as="label" 
           colorScheme="orange" 
           cursor="pointer" 
           leftIcon={<UploadIcon />}
           iconSpacing={0}
           label={t('admin.actions.import', { defaultValue: "Import" })}
           >
            <input 
              type="file" 
              hidden 
              accept=".json" 
              onChange={handlers.handleImport} 
            />
          </Button>
        )}
        {config.hasExport && (
          <Button 
            h={"2.5rem"} 
            w={"2.5rem"}
            colorScheme="teal" 
            cursor="pointer" 
            onClick={() => handlers.handleExport(data)}
            leftIcon={<DownloadIcon />}
            iconSpacing={0}
            
          />
        )}
      </Flex>

      <ScrollableTableContainer>
        <TableContainer overflowX={isTableScrollable ? 'auto' : 'visible'}>
          <Table 
            variant="striped"
            size={{ base: 'sm', md: 'md' }}
            style={{ overflowY: 'auto', maxHeight: '70vh' }}
          >
            <Thead position="sticky" top={0} bg="white" zIndex="1">
              <Tr>
                {config?.columns?.map((column) => (
                  <Th 
                    key={column.key} 
                    w={column.width}
                    color="gray.600"
                    fontWeight="600"
                    fontSize="sm"
                    py={3}
                  >
                    {column.label}
                  </Th>
                ))}
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredData?.map((item) => (
                <Tr key={item.id}>
                  {config?.columns?.map((column) => (
                    <Td 
                      key={column.key} 
                      w={column.width}
                      isTruncated={column.truncate}
                      maxW={column.truncate ? "150px" : undefined}
                    >
                      {renderCellContent(item, column)}
                    </Td>
                  ))}
                  <Td>
                    <Stack direction="row" spacing={2}>
                      <Button
                        size="sm"
                        colorScheme="brand"
                        variant="ghost"
                        onClick={() => {
                          setSelectedEntity(item)
                          modals.edit.onOpen()
                        }}
                        aria-label="Edit"
                        leftIcon={<EditIcon />}
                      />
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => {
                          setSelectedEntity(item)
                          modals.delete.onOpen()
                        }}
                        aria-label="Delete"
                        leftIcon={<DeleteIcon />}
                      />
                    </Stack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </ScrollableTableContainer>

      {/* Modals */}
      <FormModal
        isOpen={modals.add.isOpen}
        onClose={modals.add.onClose}
        title={t('admin.modals.add_entity', {
          entity: t(config.singularKey || `admin.entities.${entityType}.singular`, { defaultValue: config.singular }),
          defaultValue: `Add New ${config.singular}`
        })}
        onSubmit={handlers.handleAdd}
        initialData={config.initialData}
        FormComponent={config.FormComponent}
        isLoading={entityManager.isLoading}
      />

      <FormModal
        isOpen={modals.edit.isOpen}
        onClose={modals.edit.onClose}
        title={t('admin.modals.edit_entity', {
          entity: t(config.singularKey || `admin.entities.${entityType}.singular`, { defaultValue: config.singular }),
          defaultValue: `Edit ${config.singular}`
        })}
        onSubmit={(data) => handlers.handleEdit(selectedEntity?.id, data)}
        initialData={selectedEntity} // Pass existing data to form
        FormComponent={config.FormComponent}
        isEdit={true}
        isLoading={entityManager.isLoading}
      />

      <ConfirmationModal
        isOpen={modals.delete.isOpen}
        onClose={modals.delete.onClose}
        title={t('admin.modals.delete_entity', {
          entity: t(config.singularKey || `admin.entities.${entityType}.singular`, { defaultValue: config.singular }),
          defaultValue: `Delete ${config.singular}`
        })}
        onConfirm={() => handlers.handleDelete(selectedEntity?.id)}
        message={`Are you sure you want to delete this ${config?.title?.slice(0, -1).toLowerCase()}?`}
      />
    </Box>
  )
}

// MAIN COMPONENT
const Admin = () => {
  const { user } = useAuthContext()
  const adminFunctions = useAdminFunctions()
  const toast = useToast()
  const {
    // Queries
    useGetDashboardStats,
    useGetAllUsers,
    useGetAllItems,
    useGetAllMeals,
    useGetAllPlans,
    useGetAllOrders,
    useGetAllSubscriptions,
    useGetRecentActivity,
    useGetAllAllergies,
    useGetAllDietaryPreferences,
    
    // Mutations
    setAdminStatus,
    updateAccountStatus,
    updateLoyaltyPoints,
    updateOrderStatus,
    updateSubscriptionStatus,
  } = adminFunctions

  const { t } = useTranslation();
  // Fetch data using React Query hooks
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useGetDashboardStats()
  const { data: users = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useGetAllUsers()
  const { data: items = [], isLoading: itemsLoading, error: itemsQueryError } = useGetAllItems()
  const { data: meals = [], isLoading: mealsLoading,error: mealsQueryError } = useGetAllMeals();
  const { data: plans = [], isLoading: plansLoading, error: plansQueryError } = useGetAllPlans()
  const { data: orders = [], isLoading: ordersLoading, error: ordersError } = useGetAllOrders()
  const { data: subscriptions = [], isLoading: subsLoading, error: subsError } = useGetAllSubscriptions()
  const { data: allergies = [], isLoading: allergiesLoading, error: allergiesError } = useGetAllAllergies()
  const { data: dietaryPreferences = [], isLoading: dietaryLoading, error: dietaryError } = useGetAllDietaryPreferences()
  const { data: recentActivityResponse, isLoading: activityLoading } = useGetRecentActivity()
  const recentActivity = Array.isArray(recentActivityResponse) ? recentActivityResponse : [];
  // Entity managers
  const itemsManager = useEntityManager('items', adminFunctions)
  const mealsManager = useEntityManager('meals', adminFunctions)
  const plansManager = useEntityManager('plans', adminFunctions)
  const usersManager = useEntityManager('users', adminFunctions)
  const ordersManager = useEntityManager('orders', adminFunctions)
  const subsManager = useEntityManager('subscriptions', adminFunctions)
  const allergiesManager = useEntityManager('allergies', adminFunctions)
  const dietaryManager = useEntityManager('dietaryPreferences', adminFunctions)

  // User quick actions state
  const [selectedUser, setSelectedUser] = useState(null)
  const [adminAction, setAdminAction] = useState('')
  const [loyaltyPoints, setLoyaltyPoints] = useState('')
  const [accountStatus, setAccountStatus] = useState('')
  
  // Order status update state
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderStatus, setOrderStatus] = useState('')
  
  // Subscription status update state
  const [selectedSubscription, setSelectedSubscription] = useState(null)
  const [subStatus, setSubStatus] = useState('')

  // Modals
  const userActionModal = useDisclosure()
  const orderStatusModal = useDisclosure()
  const subscriptionStatusModal = useDisclosure()

  // User search state
  const [userSearch, setUserSearch] = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  const [subSearch, setSubSearch] = useState('')

  // Responsive table display
  const isTableScrollable = useBreakpointValue({ base: true, lg: false })

  // Loading and error states
  const isLoading = dashboardLoading || usersLoading || itemsLoading || 
                   mealsLoading || plansLoading || ordersLoading || 
                   subsLoading || allergiesLoading || dietaryLoading || 
                   activityLoading
                   
  const error = dashboardError || usersError || itemsQueryError || 
                mealsQueryError || plansQueryError || ordersError || 
                subsError || allergiesError || dietaryError

  // Filtered data
  const filteredUsers = users?.filter((user) =>
    `${user.email} ${user.displayName} ${user.isAdmin ? 'Admin' : 'User'}`
      .toLowerCase()
      .includes(userSearch.toLowerCase()),
  )

  const filteredOrders = orders?.filter((order) =>
    `${order.id} ${order.userId} ${order.status}`
      .toLowerCase()
      .includes(orderSearch.toLowerCase()),
  )
  
  const filteredSubs = subscriptions?.filter((sub) =>
    `${sub.id} ${sub.userId} ${sub.status}`
      .toLowerCase()
      .includes(subSearch.toLowerCase()),
  )

  // Handle user quick actions
  const handleUserAction = async () => {
    if (!selectedUser) return
    
    try {
      if (adminAction === 'setAdmin') {
        await setAdminStatus({ userId: selectedUser.id, isAdmin: true })
        toast({ title: 'Admin status updated', status: 'success' })
      } 
      else if (adminAction === 'removeAdmin') {
        await setAdminStatus({ userId: selectedUser.id, isAdmin: false })
        toast({ title: 'Admin status updated', status: 'success' })
      }
      else if (adminAction === 'updateStatus') {
        await updateAccountStatus({ 
          userId: selectedUser.id, 
          status: accountStatus 
        })
        toast({ title: 'Account status updated', status: 'success' })
      }
      else if (adminAction === 'updateLoyalty') {
        await updateLoyaltyPoints({ 
          userId: selectedUser.id, 
          points: parseInt(loyaltyPoints) 
        })
        toast({ title: 'Loyalty points updated', status: 'success' })
      }
      
      refetchUsers()
      userActionModal.onClose()
    } catch (error) {
      toast({ 
        title: 'Failed to update user', 
        description: error.message, 
        status: 'error' 
      })
    }
  }
  
  // Handle order status update
  const handleOrderStatusUpdate = async () => {
    if (!selectedOrder || !orderStatus) return
    
    try {
      await updateOrderStatus({ 
        orderId: selectedOrder.id, 
        status: orderStatus 
      })
      
      toast({ title: 'Order status updated', status: 'success' })
      orderStatusModal.onClose()
    } catch (error) {
      toast({ 
        title: 'Failed to update order', 
        description: error.message, 
        status: 'error' 
      })
    }
  }
  
  // Handle subscription status update
  const handleSubscriptionStatusUpdate = async () => {
    if (!selectedSubscription || !subStatus) return
    
    try {
      await updateSubscriptionStatus({ 
        subscriptionId: selectedSubscription.id, 
        status: subStatus 
      })
      
      toast({ title: 'Subscription status updated', status: 'success' })
      subscriptionStatusModal.onClose()
    } catch (error) {
      toast({ 
        title: 'Failed to update subscription', 
        description: error.message, 
        status: 'error' 
      })
    }
  }

  // Retry function for error handling
  const handleRetry = () => {
    window.location.reload()
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorAlert message={error?.message || 'Failed to load admin data'} retry={handleRetry} />

  return (
    <Box
      sx={{
        p: '20px',
        m: 0,
        maxW: '100vw',
        backgroundColor: '#f0f0f0',
      }}
    >
      <Heading mb={6}>{t('admin.dashboard.title', { defaultValue: "Admin Dashboard" })}</Heading>

      {/* Stats Cards */}
      <Grid
        templateColumns={{
          base: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
          xl: 'repeat(4, 1fr)',
        }}
        gap={6}
        m={12}
        maxW={'90%'}
      >
        <StatCard 
          title={t('admin.stats.total_users', { defaultValue: "Total Users" })} 
          value={dashboardData?.totalUsers || 0} 
          colorScheme={'brand'}
          icon={<FaUsers size={20} />}
        />

        <StatCard 
          title={t('admin.stats.admin_users', { defaultValue: "Admin Users" })} 
          value={dashboardData?.totalAdmins || 0} 
          colorScheme={'warning'}
          icon={<FaUserShield size={20} />}
        />

        <StatCard 
          title={t('admin.stats.items', { defaultValue: "Items" })} 
          value={items?.length || 0} 
          colorScheme='orange'
          icon={<FaBox size={20} />}
        />

        <StatCard 
          title={t('admin.stats.plans', { defaultValue: "Plans" })} 
          value={plans?.length || 0} 
          colorScheme='error'
          icon={<FaClipboardList size={20} />}
        />

        <StatCard 
          title={t('admin.stats.active_orders', { defaultValue: "Active Orders" })} 
          value={dashboardData?.activeOrders || 0} 
          colorScheme='teal'
          icon={<FaShoppingCart size={20} />}
        />

        <StatCard 
          title={t('admin.stats.todays_revenue', { defaultValue: "Today's Revenue" })} 
          value={`$${dashboardData?.dailyRevenue?.toFixed(2) || 0}`} 
          colorScheme='green'
          icon={<FaDollarSign size={20} />}
        />

        <StatCard 
          title={t('admin.stats.active_subscriptions', { defaultValue: "Active Subscriptions" })} 
          value={dashboardData?.activeSubscriptions || 0} 
          colorScheme='purple'
          icon={<FaSync size={20} />}
        />

        <StatCard 
          title={t('admin.stats.available_meals', { defaultValue: "Available Meals" })} 
          value={dashboardData?.availableMeals || 0} 
          colorScheme='blue'
          icon={<FaUtensils size={20} />}
        />
      </Grid>
          <Box gap={6} m={12} maxW={'90%'} backgroundColor={'#ffffff'} p={8}>
          <MealDeliveryDashboard/>
          </Box>
      {/* Recent Activity Section */}
      <Box gap={6} m={12} maxW={'90%'} backgroundColor={'#ffffff'} p={8}>
        <SectionHeading title={t('admin.sections.recent_activity', { defaultValue: "Recent Activity" })} />
        {activityLoading ? (
          <LoadingSpinner />
        ) : (
          <ScrollableTableContainer>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>{t('admin.activity.action', { defaultValue: "Action" })}</Th>
                    <Th>{t('admin.activity.user', { defaultValue: "User" })}</Th>
                    <Th>{t('admin.activity.target', { defaultValue: "Target" })}</Th>
                    <Th>{t('admin.activity.time', { defaultValue: "Time" })}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <Tr key={index}>
                        <Td>{activity.action}</Td>
                        <Td>{activity.userName || activity.userEmail || t('admin.activity.system', { defaultValue: "System" })}</Td>
                        <Td>{activity.target}</Td>
                        <Td>{new Date(activity.timestamp).toLocaleString()}</Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={4} textAlign="center">
                        {t('admin.activity.no_recent', { defaultValue: "No recent activity" })}
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </ScrollableTableContainer>
        )}
      </Box>

      {/* Entity Sections */}
      <EntitySection
        entityType="users"
        data={users}
        isLoading={usersLoading}
        entityManager={usersManager}
        isTableScrollable={isTableScrollable}
      />
      
      <EntitySection
        entityType="items"
        data={items}
        isLoading={itemsLoading}
        entityManager={itemsManager}
        isTableScrollable={isTableScrollable}
      />

      <EntitySection
        entityType="meals"
        data={meals.map(meal => ({
          ...meal,
          image_url: meal.image_url || '',
          base_price: meal.base_price || 0,
          calories: meal.calories || 0,
          protein_g: meal.protein_g || 0,
          carbs_g: meal.carbs_g || 0,
          is_available: meal.is_available !== undefined ? meal.is_available : true 
        }))}
        isLoading={mealsLoading}
        entityManager={mealsManager}
        isTableScrollable={isTableScrollable}
      />
      <EntitySection
        entityType="plans"
        data={plans}
        isLoading={plansLoading}
        entityManager={plansManager}
        isTableScrollable={isTableScrollable}
      />
      
      <EntitySection
        entityType="orders"
        data={orders}
        isLoading={ordersLoading}
        entityManager={ordersManager}
        isTableScrollable={isTableScrollable}
      />
      
      <EntitySection
        entityType="subscriptions"
        data={subscriptions}
        isLoading={subsLoading}
        entityManager={subsManager}
        isTableScrollable={isTableScrollable}
      />
      
      <EntitySection
        entityType="allergies"
        data={allergies}
        isLoading={allergiesLoading}
        entityManager={allergiesManager}
        isTableScrollable={isTableScrollable}
      />
      
      <EntitySection
        entityType="dietaryPreferences"
        data={dietaryPreferences}
        isLoading={dietaryLoading}
        entityManager={dietaryManager}
        isTableScrollable={isTableScrollable}
      />
      
      {/* User Action Modal */}
      <Modal isOpen={userActionModal.isOpen} onClose={userActionModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {t('admin.modals.user_actions.title', { defaultValue: "User Quick Actions" })}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {adminAction === 'setAdmin' && (
              <Box>
                <Heading size="sm" mb={4}>
                  {t('admin.modals.set_admin_status', { 
                    email: selectedUser?.email,
                    defaultValue: `Set Admin Status for ${selectedUser?.email}`
                  })}
                </Heading>
                <Button colorScheme="blue" onClick={() => handleUserAction('setAdmin')}>
                  {t('admin.actions.confirm_make_admin', { defaultValue: "Confirm Make Admin" })}
                </Button>
              </Box>
            )}
            
            {adminAction === 'removeAdmin' && (
              <Box>
                <Heading size="sm" mb={4}>
                  {t('admin.modals.remove_admin_status', { 
                    email: selectedUser?.email,
                    defaultValue: `Remove Admin Status from ${selectedUser?.email}`
                  })}
                </Heading>
                <Button 
                  colorScheme="red" 
                  onClick={() => handleUserAction('removeAdmin')}
                >
                  {t('admin.actions.confirm_remove_admin', { defaultValue: "Confirm Remove Admin" })}
                </Button>
              </Box>
            )}
            
            {adminAction === 'updateStatus' && (
              <FormControl>
                <FormLabel>
                  {t('admin.fields.account_status', { defaultValue: "Account Status" })}
                </FormLabel>
                <Select 
                  value={accountStatus} 
                  onChange={(e) => setAccountStatus(e.target.value)}
                >
                  <option value="active">{t('admin.status.active', { defaultValue: "Active" })}</option>
                  <option value="suspended">{t('admin.status.suspended', { defaultValue: "Suspended" })}</option>
                  <option value="deleted">{t('admin.status.deleted', { defaultValue: "Deleted" })}</option>
                </Select>
              </FormControl>
            )}
            
            {adminAction === 'updateLoyalty' && (
              <FormControl>
                <FormLabel>
                  {t('admin.fields.loyalty_points', { defaultValue: "Loyalty Points" })}
                </FormLabel>
                <Input 
                  type="number" 
                  value={loyaltyPoints} 
                  onChange={(e) => setLoyaltyPoints(e.target.value)}
                  placeholder={t('admin.placeholders.enter_points', { defaultValue: "Enter points" })}
                />
              </FormControl>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={userActionModal.onClose}>
              {t('admin.actions.cancel', { defaultValue: "Cancel" })}
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleUserAction}
              isDisabled={
                (adminAction === 'updateStatus' && !accountStatus) ||
                (adminAction === 'updateLoyalty' && !loyaltyPoints)
              }
            >
              {t('admin.actions.apply_action', { defaultValue: "Apply Action" })}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Modal isOpen={orderStatusModal.isOpen} onClose={orderStatusModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {t('admin.modals.update_order_status', { defaultValue: "Update Order Status" })}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>
                {t('admin.fields.new_status', { defaultValue: "New Status" })}
              </FormLabel>
              <Select 
                value={orderStatus} 
                onChange={(e) => setOrderStatus(e.target.value)}
              >
                <option value="pending">{t('admin.order_status.pending', { defaultValue: "Pending" })}</option>
                <option value="confirmed">{t('admin.order_status.confirmed', { defaultValue: "Confirmed" })}</option>
                <option value="preparing">{t('admin.order_status.preparing', { defaultValue: "Preparing" })}</option>
                <option value="ready">{t('admin.order_status.ready', { defaultValue: "Ready for Pickup" })}</option>
                <option value="in-transit">{t('admin.order_status.in_transit', { defaultValue: "In Transit" })}</option>
                <option value="delivered">{t('admin.order_status.delivered', { defaultValue: "Delivered" })}</option>
                <option value="cancelled">{t('admin.order_status.cancelled', { defaultValue: "Cancelled" })}</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={orderStatusModal.onClose}>
              {t('admin.actions.cancel', { defaultValue: "Cancel" })}
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleOrderStatusUpdate}
              isDisabled={!orderStatus}
            >
              {t('admin.actions.update_status', { defaultValue: "Update Status" })}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {/* Subscription Status Modal */}
      <Modal isOpen={subscriptionStatusModal.isOpen} onClose={subscriptionStatusModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {t('admin.modals.update_subscription_status', { defaultValue: "Update Subscription Status" })}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>
                {t('admin.fields.new_status', { defaultValue: "New Status" })}
              </FormLabel>
              <Select 
                value={subStatus} 
                onChange={(e) => setSubStatus(e.target.value)}
              >
                <option value="active">{t('admin.subscription_status.active', { defaultValue: "Active" })}</option>
                <option value="paused">{t('admin.subscription_status.paused', { defaultValue: "Paused" })}</option>
                <option value="cancelled">{t('admin.subscription_status.cancelled', { defaultValue: "Cancelled" })}</option>
                <option value="expired">{t('admin.subscription_status.expired', { defaultValue: "Expired" })}</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={subscriptionStatusModal.onClose}>
              {t('admin.actions.cancel', { defaultValue: "Cancel" })}
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSubscriptionStatusUpdate}
              isDisabled={!subStatus}
            >
              {t('admin.actions.update_status', { defaultValue: "Update Status" })}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Admin