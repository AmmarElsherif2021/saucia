/* eslint-disable */
/* global FileReader, alert */
import { useReducer, useEffect, useState } from 'react'
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
} from '@chakra-ui/react'

import { getAdminDashboard, getAllUsers } from '../../API/admin'
import { listItems, createItem, updateItem, deleteItem } from '../../API/items'
import { getMeals, createMeal, updateMeal, deleteMeal } from '../../API/meals'
import { listPlans, createPlan, updatePlan, deletePlan } from '../../API/plans'
import { getAllOrders } from '../../API/orders'
import { auth } from '../../../firebaseConfig.jsx'
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

import { useI18nContext } from '../../Contexts/I18nContext'

// REDUCER
const adminReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        dashboardData: action.payload.dashboardData || state.dashboardData,
        users: action.payload.users || state.users,
        items: action.payload.items || state.items,
        meals: action.payload.meals || state.meals,
        plans: action.payload.plans || state.plans,
        orders: action.payload.orders || state.orders,
      }
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload }
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] }
    case 'ADD_MEAL':
      return { ...state, meals: [...state.meals, action.payload] }
    case 'ADD_PLAN':
      return { ...state, plans: [...state.plans, action.payload] }
    case 'EDIT_ITEM':
      return {
        ...state,
        items: state.items.map((item) => (item.id === action.payload.id ? action.payload : item)),
      }
    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      }
    case 'EDIT_MEAL':
      return {
        ...state,
        meals: state.meals.map((meal) => (meal.id === action.payload.id ? action.payload : meal)),
      }
    case 'DELETE_MEAL':
      return {
        ...state,
        meals: state.meals.filter((meal) => meal.id !== action.payload),
      }
    case 'EDIT_PLAN':
      return {
        ...state,
        plans: state?.plans?.map((plan) => (plan.id === action.payload.id ? action.payload : plan)),
      }
    case 'DELETE_PLAN':
      return {
        ...state,
        plans: state?.plans?.filter((plan) => plan.id !== action.payload),
      }
    case 'SET_SELECTED_ITEM':
      return { ...state, selectedItem: action.payload }
    case 'SET_SELECTED_MEAL':
      return { ...state, selectedMeal: action.payload }
    case 'SET_SELECTED_PLAN':
      return { ...state, selectedPlan: action.payload }
    default:
      return state
  }
}

const initialState = {
  dashboardData: null,
  users: [],
  items: [],
  meals: [],
  plans: [],
  orders: [],
  loading: true,
  error: null,
  selectedItem: null,
  selectedMeal: null,
  selectedPlan: null,
}

// MAIN COMPONENT
const Admin = () => {
  const [state, dispatch] = useReducer(adminReducer, initialState)
  const { dashboardData, users, items, meals, plans, orders, loading, error } = state
  // Responsive table display
  const isTableScrollable = useBreakpointValue({ base: true, lg: false })

  // Modal disclosures
  const itemModals = {
    add: useDisclosure(),
    edit: useDisclosure(),
    delete: useDisclosure(),
  }

  const mealModals = {
    add: useDisclosure(),
    edit: useDisclosure(),
    delete: useDisclosure(),
  }

  const planModals = {
    add: useDisclosure(),
    edit: useDisclosure(),
    delete: useDisclosure(),
  }

  // Data fetching
  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    dispatch({ type: 'FETCH_START' })
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null
      const [dashboardData, users, items, meals, plans, orders] = await Promise.all([
        getAdminDashboard(),
        getAllUsers(),
        listItems(),
        getMeals(),
        listPlans(),
        getAllOrders(token),
      ])

      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          dashboardData,
          users: users || [],
          items: items || [], // Add fallback empty array
          meals: meals || [], // Add fallback empty array
          plans: plans || [], // Add fallback empty array
          orders,
        },
      })
    } catch (error) {
      dispatch({
        type: 'FETCH_ERROR',
        payload: error.message || 'Failed to load admin data',
      })
    }
  }
  // Item handlers
  const handleAddItem = async (itemData) => {
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null
      const newItem = await createItem(token, itemData)
      dispatch({ type: 'ADD_ITEM', payload: newItem })
      itemModals.add.onClose()
    } catch (error) {
      window.alert('Failed to add item: ' + error.message)
    }
  }

  const handleEditItem = async (itemId, updatedData) => {
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null
      const updatedItem = await updateItem(token, itemId, updatedData)
      dispatch({ type: 'EDIT_ITEM', payload: updatedItem })
      itemModals.edit.onClose()
    } catch (error) {
      window.alert('Failed to edit item: ' + error.message)
    }
  }

  const handleDeleteItem = async (itemId) => {
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null
      await deleteItem(token, itemId)
      dispatch({ type: 'DELETE_ITEM', payload: itemId })
      itemModals.delete.onClose()
    } catch (error) {
      window.alert('Failed to delete item: ' + error.message)
    }
  }

  // Meal handlers
  const handleAddMeal = async (mealData) => {
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null
      const newMeal = await createMeal(token, mealData)
      dispatch({ type: 'ADD_MEAL', payload: newMeal })
      mealModals.add.onClose()
    } catch (error) {
      window.alert('Failed to add meal: ' + error.message)
    }
  }

  const handleEditMeal = async (mealId, updatedData) => {
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null
      const updatedMeal = await updateMeal(token, mealId, updatedData)
      dispatch({ type: 'EDIT_MEAL', payload: updatedMeal })
      mealModals.edit.onClose()
    } catch (error) {
      window.alert('Failed to edit meal: ' + error.message)
    }
  }

  const handleDeleteMeal = async (mealId) => {
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null
      await deleteMeal(token, mealId)
      dispatch({ type: 'DELETE_MEAL', payload: mealId })
      mealModals.delete.onClose()
    } catch (error) {
      window.alert('Failed to delete meal: ' + error.message)
    }
  }

  // Plan handlers
  const handleAddPlan = async (planData) => {
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null
      const newPlan = await createPlan(token, planData)
      dispatch({ type: 'ADD_PLAN', payload: newPlan })
      planModals.add.onClose()
    } catch (error) {
      window.alert('Failed to add plan: ' + error.message)
    }
  }

  const handleEditPlan = async (planId, updatedData) => {
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null
      const updatedPlan = await updatePlan(token, planId, updatedData)
      dispatch({ type: 'EDIT_PLAN', payload: updatedPlan })
      planModals.edit.onClose()
    } catch (error) {
      window.alert('Failed to edit plan: ' + error.message)
    }
  }

  const handleDeletePlan = async (planId) => {
    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null
      await deletePlan(token, planId)
      dispatch({ type: 'DELETE_PLAN', payload: planId })
      planModals.delete.onClose()
    } catch (error) {
      window.alert('Failed to delete plan: ' + error.message)
    }
  }

  // Selection helpers
  const selectItem = (item) => {
    dispatch({ type: 'SET_SELECTED_ITEM', payload: item })
  }

  const selectMeal = (meal) => {
    dispatch({ type: 'SET_SELECTED_MEAL', payload: meal })
  }

  const selectPlan = (plan) => {
    dispatch({ type: 'SET_SELECTED_PLAN', payload: plan })
  }
  // ============== SEARCH STATES ==============
  const [userSearch, setUserSearch] = useState('')
  const [itemSearch, setItemSearch] = useState('')
  const [mealSearch, setMealSearch] = useState('')
  const [planSearch, setPlanSearch] = useState('')
  const [orderSearch, setOrderSearch] = useState('')

  // ============== FILTERED DATA ==============
  const filteredUsers =
    users?.length &&
    users.filter((user) =>
      `${user.email} ${user.displayName} ${user.isAdmin ? 'Admin' : 'User'}`
        .toLowerCase()
        .includes(userSearch.toLowerCase()),
    )

  const filteredItems =
    items?.length &&
    items.filter((item) =>
      `${item.name} ${item.name_arabic} ${item.section} ${item.section_arabic}`
        .toLowerCase()
        .includes(itemSearch.toLowerCase()),
    )

  const filteredMeals =
    meals?.length &&
    meals.filter((meal) =>
      `${meal.name} ${meal.name_arabic} ${meal.section} ${meal.section_arabic}`
        .toLowerCase()
        .includes(mealSearch.toLowerCase()),
    )

  const filteredPlans =
    plans?.length &&
    plans.filter((plan) =>
      `${plan.title} ${plan.period}`.toLowerCase().includes(planSearch.toLowerCase()),
    )

  const filteredOrders =
    orders?.length &&
    orders.filter((order) =>
      `${order.id} ${order.userId} ${order.status}`
        .toLowerCase()
        .includes(orderSearch.toLowerCase()),
    )

  //Temporary importing JSON utils
  const handleImportItems = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const items = JSON.parse(e.target.result)
        const token = auth.currentUser ? await auth.currentUser.getIdToken() : null
        for (const itemData of items) {
          const newItem = await createItem(token, itemData)
          dispatch({ type: 'ADD_ITEM', payload: newItem })
        }
        alert('Items imported successfully!')
      } catch (error) {
        window.alert('Failed to import items: ' + error.message)
      }
    }
    reader.readAsText(file)
  }

  const handleImportMeals = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const meals = JSON.parse(e.target.result)
        const token = auth.currentUser ? await auth.currentUser.getIdToken() : null
        for (const mealData of meals) {
          const newMeal = await createMeal(token, mealData)
          dispatch({ type: 'ADD_MEAL', payload: newMeal })
        }
        window.alert('Meals imported successfully!')
      } catch (error) {
        window.alert('Failed to import meals: ' + error.message)
      }
    }
    reader.readAsText(file)
  }
  if (loading) return <LoadingSpinner />
  if (error) return <ErrorAlert message={error} retry={fetchAdminData} />

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
      </Grid>

      {/* Users Section */}
      <Box gap={6} m={12} maxW={'90%'} backgroundColor={'#ffffff'} p={8}>
        <SectionHeading title="Users" />
        <SearchInput value={userSearch} onChange={setUserSearch} />
        <ScrollableTableContainer>
          <TableContainer overflowX={isTableScrollable ? 'auto' : 'visible'}>
            <Table variant="simple" size={{ base: 'sm', md: 'md' }}>
              <Thead>
                <Tr>
                  <Th>Email</Th>
                  <Th>Name</Th>
                  <Th>Role</Th>
                  <Th>Created</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredUsers?.length &&
                  filteredUsers.map((user) => (
                    <Tr key={user.uid}>
                      <Td>{user.email}</Td>
                      <Td>{user.displayName}</Td>
                      <Td>{user.isAdmin ? 'Admin' : 'User'}</Td>
                      <Td>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </Td>
                      <Td>
                        <Button size="sm" colorScheme="brand">
                          Edit
                        </Button>
                      </Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </TableContainer>
        </ScrollableTableContainer>
      </Box>

      {/* Items Section */}
      <Box gap={6} m={12} maxW={'90%'} backgroundColor={'#ffffff'} p={8}>
        <SectionHeading 
         title={'Items'}
         onAddClick={itemModals.add.onOpen} 
          buttonText="Create New"
         />
        <Flex gap={2} mb={4}>
          <SearchInput value={itemSearch} onChange={setItemSearch} />
          <Button as="label" colorScheme="blue" cursor="pointer">
            Import Items
            <input type="file" hidden accept=".json" onChange={handleImportItems} />
          </Button>
        </Flex>
        <ScrollableTableContainer>
          <TableContainer overflow="auto">
            <Table variant="simple" size="sm" style={{ overflowY: 'auto', maxHeight: '30vh' }}>
              <Thead>
                <Tr>
                  <Th w="15%">Name</Th>
                  <Th w="15%">Name (Arabic)</Th>
                  <Th w="10%">Section</Th>
                  <Th w="10%">Section (Arabic)</Th>
                  <Th w="10%">Addon Price</Th>
                  <Th w="10%">Free Count</Th>
                  <Th w="10%">Calories</Th>
                  <Th w="10%">Protein</Th>
                  <Th w="15%">Image</Th>
                  <Th w="15%">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredItems.map((item) => (
                  <Tr key={item.id}>
                    <Td w="15%">{item.name}</Td>
                    <Td w="15%">{item.name_arabic}</Td>
                    <Td w="10%">{item.section}</Td>
                    <Td w="10%">{item.section_arabic}</Td>
                    <Td w="10%">{item.addon_price}</Td>
                    <Td w="10%">{item.free_count}</Td>
                    <Td w="10%">{item.item_kcal}</Td>
                    <Td w="10%">{item.item_protein}</Td>
                    <Td w="15%" isTruncated maxW="150px">
                      {item.image}
                    </Td>
                    <Td w="15%">
                      <Stack direction="row" spacing={2}>
                        <Button
                          size="xs"
                          colorScheme="blue"
                          onClick={() => {
                            selectItem(item)
                            itemModals.edit.onOpen()
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="xs"
                          colorScheme="red"
                          onClick={() => {
                            selectItem(item)
                            itemModals.delete.onOpen()
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
      </Box>

      {/* Meals Section */}
      <Box gap={6} m={12} maxW={'90%'} backgroundColor={'#ffffff'} p={8}>
        <SectionHeading 
        title={'Meals'}
        onAddClick={mealModals.add.onOpen} 
        buttonText="Create New"
        />
        <Flex gap={2} mb={4}>
          <SearchInput value={mealSearch} onChange={setMealSearch} />
          <Button as="label" colorScheme="blue" cursor="pointer">
            Import Meals
            <input type="file" hidden accept=".json" onChange={handleImportMeals} />
          </Button>
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
                  <Th>Name</Th>
                  <Th>Name (Arabic)</Th>
                  <Th>Section</Th>
                  <Th>Section (Arabic)</Th>
                  <Th>Price</Th>
                  <Th>Calories</Th>
                  <Th>Protein</Th>
                  <Th>Carbohydrates</Th>
                  <Th>Policy</Th>
                  <Th>Ingredients</Th>
                  <Th>Ingredients (Arabic)</Th>
                  <Th>Items</Th>
                  <Th>Image</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredMeals?.length &&
                  filteredMeals.map((meal) => (
                    <Tr key={meal.id}>
                      <Td>{meal.name}</Td>
                      <Td>{meal.name_arabic}</Td>
                      <Td>{meal.section || 'N/A'}</Td>
                      <Td>{meal.section_arabic || 'N/A'}</Td>
                      <Td>{meal.price}</Td>
                      <Td>{meal.kcal}</Td>
                      <Td>{meal.protein}</Td>
                      <Td>{meal.carb}</Td>
                      <Td>{meal.policy}</Td>
                      <Td>{meal.ingredients}</Td>
                      <Td>{meal.ingredients_arabic}</Td>
                      <Td>{meal?.items?.length > 0 ? meal.items.join(', ') : 'N/A'}</Td>
                      <Td>{meal?.image}</Td>
                      <Td>
                        <Stack direction="row" spacing={2}>
                          <Button
                            size="sm"
                            colorScheme="brand"
                            onClick={() => {
                              selectMeal(meal)
                              mealModals.edit.onOpen()
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            onClick={() => {
                              selectMeal(meal)
                              mealModals.delete.onOpen()
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
      </Box>

      {/* Plans Section */}
      <Box gap={6} m={12} maxW="90%" bg="white" p={8}>
        <SectionHeading
         title={'Plans'}
         onAddClick={planModals.add.onOpen} 
         buttonText="Create New"
         />
        <SearchInput value={planSearch} onChange={setPlanSearch} />
        <ScrollableTableContainer>
        <TableContainer overflowX="auto">
  <Table variant="simple" size="sm" style={{ overflowY: 'auto', maxHeight: '70vh' }}>
    <Thead>
      <Tr>
        <Th>Title (EN)</Th>
        <Th>Title (AR)</Th>
        <Th>Periods</Th>
        <Th>Carbs (g)</Th>
        <Th>Protein (g)</Th>
        <Th>Calories (kcal)</Th>
        <Th>Members</Th>
        <Th>Carb Meals</Th>
        <Th>Protein Meals</Th>
        <Th>Soaps</Th>
        <Th>Snacks</Th>
        <Th>Actions</Th>
      </Tr>
    </Thead>
    <Tbody>
      {filteredPlans?.length &&
        filteredPlans.map((plan) => (
          <Tr key={plan.id}>
            <Td>{plan.title || 'N/A'}</Td>
            <Td>{plan.title_arabic || 'N/A'}</Td>
            <Td>
              {plan.periods?.length 
                ? plan.periods.join(', ') 
                : 'No periods'}
            </Td>
            <Td>{plan.carb || 0}</Td>
            <Td>{plan.protein || 0}</Td>
            <Td>{plan.kcal || 0}</Td>
            <Td>{plan.members?.length || 0}</Td>
            <Td>{plan.carbMeals?.join(', ') || 'None'}</Td>
            <Td>{plan.proteinMeals?.join(', ') || 'None'}</Td>
            <Td>{plan.soaps?.join(', ') || 'None'}</Td>
            <Td>{plan.snacks?.join(', ') || 'None'}</Td>
            <Td>
              <Stack direction="row" spacing={1}>
                <Button
                  size="xs"
                  colorScheme="blue"
                  onClick={() => {
                    selectPlan(plan)
                    planModals.edit.onOpen()
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="xs"
                  colorScheme="red"
                  onClick={() => {
                    selectPlan(plan)
                    planModals.delete.onOpen()
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
      </Box>
      <Box>
        <SectionHeading title="Orders" />
        <SearchInput value={orderSearch} onChange={setOrderSearch} />
        <ScrollableTableContainer>
          <TableContainer overflowX={isTableScrollable ? 'auto' : 'visible'}>
            <Table
              variant="simple"
              size={{ base: 'sm', md: 'md' }}
              style={{ overflowY: 'auto', maxHeight: '70vh' }}
            >
              <Thead>
                <Tr>
                  <Th>Order ID</Th>
                  <Th>User</Th>
                  <Th>Total Price</Th>
                  <Th>Status</Th>
                  <Th>Payment Status</Th>
                  <Th>Created At</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredOrders?.length &&
                  filteredOrders.map((order) => (
                    <Tr key={order.id}>
                      <Td>{order.id}</Td>
                      <Td>{order.userId || order.user?.email || 'N/A'}</Td>
                      <Td>${parseFloat(order.totalPrice).toFixed(2)}</Td>
                      <Td>
                        <Badge
                          colorScheme={
                            order.status === 'completed'
                              ? 'green'
                              : order.status === 'processing'
                                ? 'blue'
                                : order.status === 'cancelled'
                                  ? 'red'
                                  : 'gray'
                          }
                        >
                          {order.status || 'pending'}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={order.isPaid ? 'green' : 'orange'}>
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </Td>
                      <Td>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </TableContainer>
        </ScrollableTableContainer>
      </Box>

      <FormModal
        isOpen={itemModals.add.isOpen}
        onClose={itemModals.add.onClose}
        title="Add New Item"
        onSubmit={handleAddItem}
        initialData={{
          name: '',
          name_arabic: '',
          section: '',
          section_arabic: '',
          addon_price: 0,
          free_count: 0,
          item_kcal: 0,
          item_protein: 0,
          image: '',
        }}
        FormComponent={ItemForm}
      />

      <FormModal
        isOpen={itemModals.edit.isOpen}
        onClose={itemModals.edit.onClose}
        title="Edit Item"
        onSubmit={(data) => handleEditItem(state.selectedItem?.id, data)}
        initialData={state.selectedItem}
        FormComponent={ItemForm}
        isEdit={true}
      />

      <ConfirmationModal
        isOpen={itemModals.delete.isOpen}
        onClose={itemModals.delete.onClose}
        onConfirm={() => state.selectedItem?.id && handleDeleteItem(state.selectedItem.id)}
        title="Confirm Delete"
        message="Are you sure you want to delete this item?"
      />

      {/* Meal Modals */}
      <FormModal
        isOpen={mealModals.add.isOpen}
        onClose={mealModals.add.onClose}
        title="Add New Meal"
        onSubmit={handleAddMeal}
        initialData={{
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
        }}
        FormComponent={MealForm}
      />

      <FormModal
        isOpen={mealModals.edit.isOpen}
        onClose={mealModals.edit.onClose}
        title="Edit Meal"
        onSubmit={(data) => state.selectedMeal?.id && handleEditMeal(state.selectedMeal.id, data)}
        initialData={state.selectedMeal}
        FormComponent={MealForm}
        isEdit={true}
      />

      <ConfirmationModal
        isOpen={mealModals.delete.isOpen}
        onClose={mealModals.delete.onClose}
        onConfirm={() => state.selectedMeal?.id && handleDeleteMeal(state.selectedMeal.id)}
        title="Confirm Delete"
        message="Are you sure you want to delete this meal?"
      />
      <FormModal
        isOpen={planModals.add.isOpen}
        onClose={planModals.add.onClose}
        title="Add New Plan"
        onSubmit={handleAddPlan}
        initialData={{
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
        }}
        FormComponent={PlanForm}
      />

      <FormModal
        isOpen={planModals.edit.isOpen}
        onClose={planModals.edit.onClose}
        title="Edit Plan"
        onSubmit={(data) => state.selectedPlan?.id && handleEditPlan(state.selectedPlan.id, data)}
        initialData={state.selectedPlan}
        FormComponent={PlanForm}
        isEdit={true}
      />

      <ConfirmationModal
        isOpen={planModals.delete.isOpen}
        onClose={planModals.delete.onClose}
        onConfirm={() => state.selectedPlan?.id && handleDeletePlan(state.selectedPlan.id)}
        title="Confirm Delete"
        message="Are you sure you want to delete this plan?"
      />
    </Box>
  )
}

export default Admin
