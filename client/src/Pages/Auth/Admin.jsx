/* eslint-disable */
/* global FileReader, alert */
import { useState, useEffect } from 'react'
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
import ItemForm from './ItemForm'
import MealForm from './MealsForm'
import PlanForm from './PlanForm'
import UserForm from './UserForm'
import OrderForm from './OrderForm'
import SubscriptionForm from './SubscriptionForm'
import AllergyForm from './AllergyForm'
import DietaryPreferenceForm from './DietaryPreferenceForm'


// Entity configurations
const ENTITY_CONFIGS = {
  items: {
    title: 'Items',
    FormComponent: ItemForm,
    searchFields: ['name', 'name_arabic', 'category', 'category_arabic', 'description'],
    initialData: {
      name: '',
      name_arabic: '',
      description: '',
      description_arabic: '',
      category: '',
      category_arabic: '',
      price: 0,
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      max_free_per_meal: 0,
      image_url: '',
      is_available: true,
      sort_order: 0,
      allergy_ids: []
    },
    columns: [
      { key: 'name', label: 'Name', width: '15%' },
      { key: 'name_arabic', label: 'Name (Arabic)', width: '15%' },
      { key: 'category', label: 'Category', width: '10%' },
      { key: 'category_arabic', label: 'Category (Arabic)', width: '10%' },
      { key: 'price', label: 'Price', width: '8%', format: value => `$${parseFloat(value).toFixed(2)}` },
      { key: 'max_free_per_meal', label: 'Free Count', width: '8%' },
      { 
        key: 'is_available', 
        label: 'Available', 
        width: '8%',
        render: value => (
          <Badge colorScheme={value ? 'green' : 'red'}>
            {value ? 'Yes' : 'No'}
          </Badge>
        )
      },
      
      { key: 'image_url', label: 'Image', width: '15%', truncate: true },
    ],
    exportName: 'items.json',
    hasImport: true,
    hasExport: true,
  },
  meals: {
    title: 'Meals',
    FormComponent: MealForm,
    searchFields: ['name', 'name_arabic', 'section', 'section_arabic'],
    initialData: {
      name: '',
      name_arabic: '',
      section: '',
      section_arabic: '',
      price: 0,
      kcal: 0,
      protein: 0,
      carb: 0,
      policy: '',
      ingredients: '',
      ingredients_arabic: '',
      items: [],
      image: '',
    },
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'name_arabic', label: 'Name (Arabic)' },
      { key: 'section', label: 'Section', render: (value) => value || 'N/A' },
      { key: 'section_arabic', label: 'Section (Arabic)', render: (value) => value || 'N/A' },
      { key: 'price', label: 'Price' },
      { key: 'kcal', label: 'Calories' },
      { key: 'protein', label: 'Protein' },
      { key: 'carb', label: 'Carbohydrates' },
      { key: 'policy', label: 'Policy' },
      { key: 'ingredients', label: 'Ingredients' },
      { key: 'ingredients_arabic', label: 'Ingredients (Arabic)' },
      { 
        key: 'items', 
        label: 'Items',
        render: (value) => value?.length > 0 ? value.join(', ') : 'N/A'
      },
      { key: 'image', label: 'Image' },
      { 
        key: 'allergens', 
        label: 'Allergens',
        render: (value) => value?.length > 0 ? value.map(a => `${a.ar} |`) : 'N/A'
      },
    ],
    exportName: 'meals.json',
    hasImport: true,
    hasExport: true,
  },
  plans: {
    title: 'Plans',
    FormComponent: PlanForm,
    searchFields: ['title', 'period'],
    initialData: {
      title: 'New Plan',
      description: 'add description',
      period: 30,
      carb: 150,
      protein: 120,
      kcal: 2000,
      avatar: '',
      members: [],
      carbMeals: [],
      proteinMeals: [],
      soaps: [],
      snacks: [],
    },
    columns: [
      { key: 'title', label: 'Title (EN)', render: (value) => value || 'N/A' },
      { key: 'title_arabic', label: 'Title (AR)', render: (value) => value || 'N/A' },
      { 
        key: 'periods', 
        label: 'Periods',
        render: (value) => value?.length ? value.join(', ') : 'No periods'
      },
      { key: 'carb', label: 'Carbs (g)', render: (value) => value || 0 },
      { key: 'protein', label: 'Protein (g)', render: (value) => value || 0 },
      { key: 'kcal', label: 'Calories (kcal)', render: (value) => value || 0 },
      { 
        key: 'members', 
        label: 'Members',
        render: (value) => value?.length || 0
      },
      { 
        key: 'carbMeals', 
        label: 'Carb Meals',
        render: (value) => value?.join(', ') || 'None'
      },
      { 
        key: 'proteinMeals', 
        label: 'Protein Meals',
        render: (value) => value?.join(', ') || 'None'
      },
      { 
        key: 'soaps', 
        label: 'Soaps',
        render: (value) => value?.join(', ') || 'None'
      },
      { 
        key: 'snacks', 
        label: 'Snacks',
        render: (value) => value?.join(', ') || 'None'
      },
    ],
    exportName: 'plans.json',
    hasImport: false,
    hasExport: true,
  },
  users: {
    title: 'Users',
    FormComponent: UserForm,
    searchFields: ['email', 'displayName'],
    columns: [
      { key: 'email', label: 'Email' },
      { key: 'displayName', label: 'Name' },
      { 
        key: 'isAdmin', 
        label: 'Role',
        render: (value) => value ? 'Admin' : 'User'
      },
      { 
        key: 'accountStatus', 
        label: 'Status',
        render: (value) => (
          <Badge colorScheme={value === 'active' ? 'green' : 'red'}>
            {value}
          </Badge>
        )
      },
      { 
        key: 'loyaltyPoints', 
        label: 'Loyalty Points',
        render: (value) => value || 0
      },
      { 
        key: 'created_at', 
        label: 'Created',
        render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
      },
    ],
    exportName: 'users.json',
    hasImport: true,
    hasExport: true,
  },
  orders: {
    title: 'Orders',
    FormComponent: OrderForm,
    searchFields: ['id', 'userId', 'status'],
    columns: [
      { key: 'id', label: 'Order ID' },
      { key: 'userId', label: 'User ID' },
      { key: 'totalPrice', label: 'Total Price', render: (value) => `$${parseFloat(value).toFixed(2)}` },
      { 
        key: 'status', 
        label: 'Status',
        render: (value) => (
          <Badge
            colorScheme={
              value === 'completed' ? 'green' :
              value === 'processing' ? 'blue' :
              value === 'cancelled' ? 'red' : 'gray'
            }
          >
            {value}
          </Badge>
        )
      },
      { 
        key: 'isPaid', 
        label: 'Payment',
        render: (value) => (
          <Badge colorScheme={value ? 'green' : 'orange'}>
            {value ? 'Paid' : 'Unpaid'}
          </Badge>
        )
      },
      { 
        key: 'created_at', 
        label: 'Created',
        render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
      },
    ],
    exportName: 'orders.json',
    hasImport: false,
    hasExport: true,
  },
  subscriptions: {
    title: 'Subscriptions',
    FormComponent: SubscriptionForm,
    searchFields: ['id', 'userId', 'status'],
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'userId', label: 'User ID' },
      { key: 'planId', label: 'Plan ID' },
      { 
        key: 'status', 
        label: 'Status',
        render: (value) => (
          <Badge
            colorScheme={
              value === 'active' ? 'green' :
              value === 'paused' ? 'yellow' :
              value === 'cancelled' ? 'red' : 'gray'
            }
          >
            {value}
          </Badge>
        )
      },
      { 
        key: 'startDate', 
        label: 'Start Date',
        render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
      },
      { 
        key: 'endDate', 
        label: 'End Date',
        render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
      },
    ],
    exportName: 'subscriptions.json',
    hasImport: false,
    hasExport: true,
  },
  allergies: {
    title: 'Allergies',
    FormComponent: AllergyForm,
    searchFields: ['name', 'name_arabic'],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'name_arabic', label: 'Name (Arabic)' },
      { key: 'description', label: 'Description' },
      { key: 'description_arabic', label: 'Description (Arabic)' },
    ],
    exportName: 'allergies.json',
    hasImport: true,
    hasExport: true,
  },
  dietaryPreferences: {
    title: 'Dietary Preferences',
    FormComponent: DietaryPreferenceForm,
    searchFields: ['name', 'name_arabic'],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'name_arabic', label: 'Name (Arabic)' },
      { key: 'description', label: 'Description' },
      { key: 'description_arabic', label: 'Description (Arabic)' },
    ],
    exportName: 'dietary-preferences.json',
    hasImport: true,
    hasExport: true,
  },
}


// Custom hook for entity management
const useEntityManager = (entityType, adminFunctions) => {
  const [selectedEntity, setSelectedEntity] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  //Sanitize data function to remove empty timestamps
const sanitizeData = (data) => {
  const sanitized = {...data};
  
  // Remove timestamp fields if they're empty
  ['created_at', 'updated_at'].forEach(field => {
    if (sanitized[field] === '') {
      delete sanitized[field];
    }
  });
  
  return sanitized;
};

  const modals = {
    add: useDisclosure(),
    edit: useDisclosure(),
    delete: useDisclosure(),
  }

  const config = ENTITY_CONFIGS[entityType]
  const {
    [`create${entityType.charAt(0).toUpperCase() + entityType.slice(1, -1)}`]: createEntity,
    [`update${entityType.charAt(0).toUpperCase() + entityType.slice(1, -1)}`]: updateEntity,
    [`delete${entityType.charAt(0).toUpperCase() + entityType.slice(1, -1)}`]: deleteEntity,
  } = adminFunctions

  const handleAdd = async (data) => {
    try {
      await createEntity(sanitizeData(data))
      modals.add.onClose()
    } catch (error) {
      window.alert(`Failed to add ${entityType.slice(0, -1)}: ${error.message}`)
    }
  }

  const handleEdit = async (id, data) => {
    try {
      await updateEntity({ 
        [`${entityType.slice(0, -1)}Id`]: id, 
        updateD_ata: sanitizeData(data) 
      })
      modals.edit.onClose()
    } catch (error) {
      window.alert(`Failed to edit ${entityType.slice(0, -1)}: ${error.message}`)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteEntity(id)
      modals.delete.onClose()
    } catch (error) {
      window.alert(`Failed to delete ${entityType.slice(0, -1)}: ${error.message}`)
    }
  }

  const handleImport = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const entitiesData = JSON.parse(e.target.result)
        for (const entityData of entitiesData) {
          await createEntity(entityData)
        }
        window.alert(`${config.title} imported successfully!`)
      } catch (error) {
        window.alert(`Failed to import ${entityType}: ${error.message}`)
      }
    }
    reader.readAsText(file)
  }

  const handleExport = async (data) => {
    try {
      const dataStr = JSON.stringify(data || [])
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', config.exportName)
      document.body.appendChild(linkElement)
      linkElement.click()
      document.body.removeChild(linkElement)
    } catch (error) {
      window.alert(`Failed to export ${entityType}: ${error.message}`)
    }
  }

  const filterEntities = (entities) => {
    if (!searchTerm) return entities
    return entities?.filter((entity) => {
      const searchString = config.searchFields
        .map(field => entity[field] || '')
        .join(' ')
        .toLowerCase()
      return searchString.includes(searchTerm.toLowerCase())
    })
  }

  return {
    selectedEntity,
    setSelectedEntity,
    searchTerm,
    setSearchTerm,
    modals,
    handlers: {
      handleAdd,
      handleEdit,
      handleDelete,
      handleImport,
      handleExport,
    },
    filterEntities,
    config,
  }
}

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

  const renderCellContent = (item, column) => {
    const value = item[column.key]
    if (column.render) {
      return column.render(value)
    }
    return value
  }

  return (
    <Box gap={6} m={12} maxW={'90%'} backgroundColor={'#ffffff'} p={8}>
      <SectionHeading
        title={config.title}
        onAddClick={modals.add.onOpen}
        buttonText="Create New"
      />
      
      <Flex gap={2} mb={4}>
        <SearchInput value={searchTerm} onChange={setSearchTerm} />
        {config.hasImport && (
          <Button as="label" colorScheme="brand" cursor="pointer">
            Import {config.title}
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
            colorScheme="brand" 
            cursor="pointer" 
            onClick={() => handlers.handleExport(data)}
          >
            Export {config.title}
          </Button>
        )}
      </Flex>

      <ScrollableTableContainer>
        <TableContainer overflowX={isTableScrollable ? 'auto' : 'visible'}>
          <Table 
            variant="simple" 
            size={{ base: 'sm', md: 'md' }}
            style={{ overflowY: 'auto', maxHeight: '70vh' }}
          >
            <Thead>
              <Tr>
                {config?.columns?.map((column) => (
                  <Th key={column.key} w={column.width}>
                    {column.label}
                  </Th>
                ))}
                <Th>Actions</Th>
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
                        onClick={() => {
                          setSelectedEntity(item)
                          modals.edit.onOpen()
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={() => {
                          setSelectedEntity(item)
                          modals.delete.onOpen()
                        }}
                      >
                        Delete
                      </Button>
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
        title={`Add New ${config?.title?.slice(0, -1)}`}
        onSubmit={handlers.handleAdd}
        initialData={config.initialData}
        FormComponent={config.FormComponent}
      />

      <FormModal
        isOpen={modals.edit.isOpen}
        onClose={modals.edit.onClose}
        title={`Edit ${config?.title?.slice(0, -1)}`}
        onSubmit={(data) => handlers.handleEdit(selectedEntity?.id, data)}
        initialData={selectedEntity}
        FormComponent={config.FormComponent}
        isEdit={true}
      />

      <ConfirmationModal
        isOpen={modals.delete.isOpen}
        onClose={modals.delete.onClose}
        onConfirm={() => handlers.handleDelete(selectedEntity?.id)}
        title="Confirm Delete"
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

  // Fetch data using React Query hooks
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useGetDashboardStats()
  const { data: users = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useGetAllUsers()
  const { data: items = [], isLoading: itemsLoading, error: itemsQueryError } = useGetAllItems()
  const { data: meals = [], isLoading: mealsLoading, error: mealsQueryError } = useGetAllMeals()
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
      <Heading mb={6}>Admin Dashboard</Heading>

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
        <StatCard title="Total Users" value={dashboardData?.totalUsers || 0} />
        <StatCard title="Admin Users" value={dashboardData?.totalAdmins || 0} />
        <StatCard title="Items" value={items?.length || 0} />
        <StatCard title="Plans" value={plans?.length || 0} />
        <StatCard title="Active Orders" value={dashboardData?.activeOrders || 0} />
        <StatCard title="Today's Revenue" value={`$${dashboardData?.dailyRevenue?.toFixed(2) || 0}`} />
        <StatCard title="Active Subscriptions" value={dashboardData?.activeSubscriptions || 0} />
        <StatCard title="Meals Available" value={dashboardData?.availableMeals || 0} />
      </Grid>
      
      {/* Recent Activity Section */}
      <Box gap={6} m={12} maxW={'90%'} backgroundColor={'#ffffff'} p={8}>
        <SectionHeading title="Recent Activity" />
        {activityLoading ? (
          <LoadingSpinner />
        ) : (
          <ScrollableTableContainer>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Action</Th>
                    <Th>User</Th>
                    <Th>Target</Th>
                    <Th>Time</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <Tr key={index}>
                        <Td>{activity.action}</Td>
                        <Td>{activity.userName || activity.userEmail || 'System'}</Td>
                        <Td>{activity.target}</Td>
                        <Td>{new Date(activity.timestamp).toLocaleString()}</Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={4} textAlign="center">
                        No recent activity
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
        data={meals}
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
          <ModalHeader>User Quick Actions</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {adminAction === 'setAdmin' && (
              <Box>
                <Heading size="sm" mb={4}>
                  Set Admin Status for {selectedUser?.email}
                </Heading>
                <Button 
                  colorScheme="blue" 
                  onClick={() => handleUserAction('setAdmin')}
                >
                  Confirm Make Admin
                </Button>
              </Box>
            )}
            
            {adminAction === 'removeAdmin' && (
              <Box>
                <Heading size="sm" mb={4}>
                  Remove Admin Status from {selectedUser?.email}
                </Heading>
                <Button 
                  colorScheme="red" 
                  onClick={() => handleUserAction('removeAdmin')}
                >
                  Confirm Remove Admin
                </Button>
              </Box>
            )}
            
            {adminAction === 'updateStatus' && (
              <FormControl>
                <FormLabel>Account Status</FormLabel>
                <Select 
                  value={accountStatus} 
                  onChange={(e) => setAccountStatus(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="deleted">Deleted</option>
                </Select>
              </FormControl>
            )}
            
            {adminAction === 'updateLoyalty' && (
              <FormControl>
                <FormLabel>Loyalty Points</FormLabel>
                <Input 
                  type="number" 
                  value={loyaltyPoints} 
                  onChange={(e) => setLoyaltyPoints(e.target.value)}
                  placeholder="Enter points"
                />
              </FormControl>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={userActionModal.onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleUserAction}
              isDisabled={
                (adminAction === 'updateStatus' && !accountStatus) ||
                (adminAction === 'updateLoyalty' && !loyaltyPoints)
              }
            >
              Apply Action
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Order Status Modal */}
      <Modal isOpen={orderStatusModal.isOpen} onClose={orderStatusModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Order Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>New Status</FormLabel>
              <Select 
                value={orderStatus} 
                onChange={(e) => setOrderStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready for Pickup</option>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={orderStatusModal.onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleOrderStatusUpdate}
              isDisabled={!orderStatus}
            >
              Update Status
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Subscription Status Modal */}
      <Modal isOpen={subscriptionStatusModal.isOpen} onClose={subscriptionStatusModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Subscription Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>New Status</FormLabel>
              <Select 
                value={subStatus} 
                onChange={(e) => setSubStatus(e.target.value)}
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={subscriptionStatusModal.onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSubscriptionStatusUpdate}
              isDisabled={!subStatus}
            >
              Update Status
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Admin