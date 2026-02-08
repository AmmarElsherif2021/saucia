/* eslint-disable */
/* global FileReader, alert */
import { useState, useEffect, useMemo } from 'react'
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
  Checkbox,
  Text,
  IconButton
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
import { ArrowUpDownIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from '@chakra-ui/icons';
// TanStack Table imports
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'

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
  FaSearch as SearchIcon,
  FaSort as SortIcon,
  FaSortUp as SortUpIcon,
  FaSortDown as SortDownIcon
} from 'react-icons/fa'
import MealDeliveryDashboard from './DailySceduleDashboard.jsx';
import AdminAddressManager from './AdminAddressManager.jsx';
import { useDebugUser } from '../../Hooks/useDebugUser.jsx';
import InstantOrdersMonitoring from './InstantOrdersSchedule.jsx';
import MenuPDFPortal from './MenPDF.jsx';
import { useI18nContext } from '../../Contexts/I18nContext.jsx';
import AdminSupportPortal from './AdminSupportPortal.jsx';

// Enhanced Table Component with TanStack
const EnhancedTable = ({ 
  data, 
  columns, 
  isLoading = false,
  onRowClick,
  enableSorting = true,
  enablePagination = true,
  enableRowSelection = false,
  maxHeight = '500px'
}) => {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState({});
  const {currentLanguage}=useI18nContext();
  const isArabic = currentLanguage==='ar'
  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      sorting,
      globalFilter,
      rowSelection,
    },
    enableSorting,
    enableRowSelection,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
  });

  return (
    <Box>
      {/* Table Controls */}
      <Flex justify="space-between" align="center" mb={4}>
        {enableRowSelection && (
          <Text fontSize="sm" color="gray.600">
            {Object.keys(rowSelection).length} of {data?.length} row(s) selected
          </Text>
        )}
        
        {enablePagination && (
          <Flex align="center" gap={2}>
            <IconButton 
              icon={<ChevronLeftIcon/>}
              size="sm"
              borderRadius={'full'}
              onClick={() => table.previousPage()}
              isDisabled={!table.getCanPreviousPage()}
            />
             
            <Text fontSize="sm">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </Text>
            <IconButton 
              icon={<ChevronRightIcon/>}
              size="sm"
              borderRadius={'full'}
              onClick={() => table.nextPage()}
              isDisabled={!table.getCanNextPage()}
            />
             
          </Flex>
        )}
      </Flex>

      {/* Table Container with Sticky Headers & Actions */}
      <Box 
        position="relative" 
        border="2px" 
        borderColor="brand.600" 
        borderRadius="md" 
        overflow="hidden"
      >
        <Box 
          overflowX="auto"
          overflowY="auto"
          maxHeight={maxHeight}
        >
          <Table variant="striped" size="sm">
            <Thead>
              {table.getHeaderGroups().map(headerGroup => (
                <Tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isActionsColumn = header.id === 'actions';
                    return (
                      <Th 
                        key={header.id}
                        onClick={!isActionsColumn ? header.column.getToggleSortingHandler() : undefined}
                        cursor={enableSorting && header.column.getCanSort() && !isActionsColumn ? 'pointer' : 'default'}
                        userSelect="none"
                        position="sticky"
                        top={0}
                        right={isActionsColumn && !isArabic ? 0 : 'auto'}
                        left={isActionsColumn && isArabic ? 0 : 'auto'}
                        borderRight={isActionsColumn && isArabic && 'dashed #039156ff 2px'}
                        bg="white"
                        zIndex={isActionsColumn ? 30 : 10}
                        boxShadow={isActionsColumn ? '-2px 0 4px rgba(0,0,0,0.1)' : 'none'}
                        color={'brand.700'}
                        minW={isActionsColumn ? '140px' : '150px'}
                        whiteSpace="nowrap"
                        _hover={enableSorting && header.column.getCanSort() && !isActionsColumn ? { bg: 'gray.100' } : {}}
                      >
                        <Flex align="center" gap={2}>
                          {enableRowSelection && header.id === 'select' ? (
                            <Checkbox
                              isChecked={table.getIsAllRowsSelected()}
                              isIndeterminate={table.getIsSomeRowsSelected()}
                              onChange={table.getToggleAllRowsSelectedHandler()}
                            />
                          ) : (
                            flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )
                          )}
                          
                          {enableSorting && header.column.getCanSort() && !isActionsColumn && (
                            <Box color="gray.400" fontSize="xs">
                              {header.column.getIsSorted() === 'asc' ? (
                                <ChevronUpIcon />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ChevronDownIcon />
                              ) : (
                                <ArrowUpDownIcon />
                              )}
                            </Box>
                          )}
                        </Flex>
                      </Th>
                    );
                  })}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {table.getRowModel().rows.map((row, rowIndex) => (
                <Tr 
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  cursor={onRowClick ? 'pointer' : 'default'}
                  _hover={onRowClick ? { bg: 'gray.100' } : {}}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isActionsColumn = cell.column.id === 'actions';
                    return (
                      <Td 
                        key={cell.id}
                        position={isActionsColumn ? 'sticky' : 'relative'}
                        right={isActionsColumn && !isArabic ? 0 : 'auto'}
                        left={isActionsColumn && isArabic ? 0 : 'auto'}
                        bg={isActionsColumn ? (rowIndex % 2 === 0 ? 'white' : 'gray.50') : 'inherit'}
                        zIndex={isActionsColumn ? 10 : 0}
                        boxShadow={isActionsColumn ? '-2px 0 4px rgba(0,0,0,0.05)' : 'none'}
                        whiteSpace="nowrap"
                        py={0}
                        
                      >
                        {enableRowSelection && cell.column.id === 'select' ? (
                          <Checkbox
                            isChecked={row.getIsSelected()}
                            onChange={row.getToggleSelectedHandler()}
                          />
                        ) : (
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </Td>
                    );
                  })}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>

      {/* Empty State */}
      {!isLoading && table.getRowModel().rows.length === 0 && (
        <Flex justify="center" align="center" py={8} color="gray.500">
          <Text>No data available</Text>
        </Flex>
      )}
    </Box>
  );
};
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
  const {currentLanguage}=useI18nContext();
  const isArabic = currentLanguage==='ar'
  // Transform columns for TanStack Table
  const tableColumns = useMemo(() => [
    ...(config?.columns?.map(column => ({
      accessorKey: column.key,
      header: column.label,
      cell: ({ getValue, row }) => {
        const value = getValue();
        const rowData = row.original;
        
        if (column.render) {
          try {
            return column.render(value, rowData);
          } catch (error) {
            console.error(`Error rendering ${column.key}:`, error);
            return <Text color="red">Error</Text>;
          }
        }
        
        // For nested objects, handle them appropriately
        if (value && typeof value === 'object') {
          return <Text>{JSON.stringify(value)}</Text>;
        }
        
        return <Text>{value || 'N/A'}</Text>;
      },
      size: column.width ? parseInt(column.width) : 150,
      enableSorting: true,
    })) || []),
    {
      id: 'actions',
      header: <span style={{backgroundColor:'#ffffff'}}>Actions</span>,
      cell: ({ row }) => (
        <Stack direction="row" spacing={2} borderLeft={!isArabic && 'dashed #24857dff 1px'} borderRight={isArabic && 'dashed #24857dff 1px'} my={0}>
          <Button
            size="sm"
            colorScheme="brand"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedEntity(row.original)
              modals.edit.onOpen()
            }}
            aria-label="Edit"
            leftIcon={<EditIcon />}
          />
          <Button
            size="sm"
            colorScheme="red"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedEntity(row.original)
              modals.delete.onOpen()
            }}
            aria-label="Delete"
            leftIcon={<DeleteIcon />}
          />
        </Stack>
      ),
      enableSorting: false,
      size: 120,
    }
  ], [config?.columns, setSelectedEntity, modals])

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
        title={t(config.titleKey || `${entityType}.title`, { defaultValue: config.title })}
        description={t(config.descriptionKey || `${entityType}.description`, { defaultValue: config.description })}
        onAddClick={modals.add.onOpen}
        buttonText={t('actions.add_entity', {
          entity: t(config.singularKey || `${entityType}.singular`, { defaultValue: config.singular }),
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
           label={t('actions.import', { defaultValue: "Import" })}
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

      {/* Debug info */}
      <Box mb={2} p={2} bg="gray.50" borderRadius="md">
        <Text fontSize="sm" color="gray.600">
          Showing {filteredData?.length || 0} {config.title.toLowerCase()}
        </Text>
      </Box>

      {/* Enhanced Table */}
      <EnhancedTable
        data={filteredData}
        columns={tableColumns}
        isLoading={isLoading || entityManager.isLoading}
        enableSorting={true}
        enablePagination={true}
        enableRowSelection={false}
      />

      {/* Modals */}
      <FormModal
        isOpen={modals.add.isOpen}
        onClose={modals.add.onClose}
        title={t('modals.add_entity', {
          entity: t(config.singularKey || `${entityType}.singular`, { defaultValue: config.singular }),
          defaultValue: `Add New ${config.singular}`
        })}
        onSubmit={handlers.handleAdd}
        initialData={config.initialData}
        FormComponent={config.FormComponent}
        isLoading={entityManager.isCreating}
      />

      <FormModal
        key={selectedEntity?.id}
        isOpen={modals.edit.isOpen}
        onClose={modals.edit.onClose}
        title={t('modals.edit_entity', {
          entity: t(config.singularKey || `${entityType}.singular`, { defaultValue: config.singular }),
          defaultValue: `Edit ${config.singular}`
        })}
        onSubmit={(data) => handlers.handleEdit(selectedEntity?.id, data)}  // Make sure this passes the ID
        initialData={selectedEntity}
        FormComponent={config.FormComponent}
        isEdit={true}
        isLoading={entityManager.isUpdating}
      />

      <ConfirmationModal
        isOpen={modals.delete.isOpen}
        onClose={modals.delete.onClose}
        title={t('modals.delete_entity', {
          entity: t(config.singularKey || `${entityType}.singular`, { defaultValue: config.singular }),
          defaultValue: `Delete ${config.singular}`
        })}
        onConfirm={() => handlers.handleDelete(selectedEntity?.id)}
        message={`Are you sure you want to delete this ${config?.title?.slice(0, -1).toLowerCase()}?`}
        isLoading={entityManager.isDeleting}
      />
    </Box>
  )
}

// MAIN COMPONENT
const Admin = () => {
  const { user } = useAuthContext()
  const userInfo = useDebugUser();
  const adminFunctions = useAdminFunctions()
  const toast = useToast()
  const {
    // Queries
    useGetDashboardStats,
    useGetAllUsers,
    useGetAllItems,
    useGetAllMeals,
    useGetAllPlans,
    useGetRecentActivity,
    useGetAllAllergies,
    useGetAllDietaryPreferences,
    
    // Mutations
    useSetAdminStatus,
    useUpdateAccountStatus,
    useUpdateLoyaltyPoints,
  } = adminFunctions

  const { t } = useTranslation();
  
  // Fetch data using React Query hooks
  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useGetDashboardStats()
  const { data: users = [], isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useGetAllUsers()
  const { data: items = [], isLoading: itemsLoading, error: itemsQueryError } = useGetAllItems()
  const { data: meals = [], isLoading: mealsLoading, error: mealsQueryError } = useGetAllMeals({
    limit: 1000,
  });
  const { data: plans = [], isLoading: plansLoading, error: plansQueryError } = useGetAllPlans()
  const { data: allergies = [], isLoading: allergiesLoading, error: allergiesError } = useGetAllAllergies()
  const { data: dietaryPreferences = [], isLoading: dietaryLoading, error: dietaryError } = useGetAllDietaryPreferences()
  const { data: recentActivityResponse, isLoading: activityLoading } = useGetRecentActivity()
  const recentActivity = Array.isArray(recentActivityResponse) ? recentActivityResponse : [];
  
  // Mutations
  const setAdminStatusMutation = useSetAdminStatus()
  const updateAccountStatusMutation = useUpdateAccountStatus()
  const updateLoyaltyPointsMutation = useUpdateLoyaltyPoints()
  
  // Entity managers
  const itemsManager = useEntityManager('items', adminFunctions)
  const mealsManager = useEntityManager('meals', adminFunctions)
  const plansManager = useEntityManager('plans', adminFunctions)
  const usersManager = useEntityManager('users', adminFunctions)
  const allergiesManager = useEntityManager('allergies', adminFunctions)
  const dietaryManager = useEntityManager('dietaryPreferences', adminFunctions)

  // User quick actions state
  const [selectedUser, setSelectedUser] = useState(null)
  const [adminAction, setAdminAction] = useState('')
  const [loyaltyPoints, setLoyaltyPoints] = useState('')
  const [accountStatus, setAccountStatus] = useState('')

  // Modals
  const userActionModal = useDisclosure()

  // User search state
  const [userSearch, setUserSearch] = useState('')

  // Responsive table display
  const isTableScrollable = useBreakpointValue({ base: true, lg: false })

  // Loading and error states
  const isLoading = dashboardLoading || usersLoading || itemsLoading || 
                   mealsLoading || plansLoading || 
                   allergiesLoading || dietaryLoading || 
                   activityLoading
                   
  const error = dashboardError || usersError || itemsQueryError || 
                mealsQueryError || plansQueryError || 
                allergiesError || dietaryError

  // Filtered data
  const filteredUsers = users?.filter((user) =>
    `${user.email} ${user.display_name} ${user.is_admin ? 'Admin' : 'User'}`
      .toLowerCase()
      .includes(userSearch.toLowerCase()),
  )

  // Handle user quick actions
  const handleUserAction = async () => {
    if (!selectedUser) return
    
    try {
      if (adminAction === 'setAdmin') {
        await setAdminStatusMutation.mutateAsync({ userId: selectedUser.id, isAdmin: true })
        toast({ title: 'Admin status updated', status: 'success' })
      } 
      else if (adminAction === 'removeAdmin') {
        await setAdminStatusMutation.mutateAsync({ userId: selectedUser.id, isAdmin: false })
        toast({ title: 'Admin status updated', status: 'success' })
      }
      else if (adminAction === 'updateStatus') {
        await updateAccountStatusMutation.mutateAsync({ 
          userId: selectedUser.id, 
          status: accountStatus 
        })
        toast({ title: 'Account status updated', status: 'success' })
      }
      else if (adminAction === 'updateLoyalty') {
        await updateLoyaltyPointsMutation.mutateAsync({ 
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

  // Retry function for error handling
  const handleRetry = () => {
    window.location.reload()
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorAlert message={error?.message || 'Failed to load admin data'} retry={handleRetry} />
  if (!user || !userInfo.profile.is_admin) return (
    <ErrorAlert message="Access denied. Admins only." />
  )

  return (
    <Box
      sx={{
        p: '20px',
        m: 0,
        maxW: '100vw',
        backgroundColor: '#f0f0f0',
      }}
    >
      <Heading mb={6}>{t('title', { defaultValue: "Admin Dashboard" })}</Heading>

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
          title={t('total_users', { defaultValue: "Total Users" })} 
          value={dashboardData?.totalUsers || 0} 
          colorScheme={'brand'}
          icon={<FaUsers size={20} />}
        />

        <StatCard 
          title={t('admin_users', { defaultValue: "Admin Users" })} 
          value={dashboardData?.totalAdmins || 0} 
          colorScheme={'warning'}
          icon={<FaUserShield size={20} />}
        />

        <StatCard 
          title={t('items', { defaultValue: "Items" })} 
          value={items?.length || 0} 
          colorScheme='orange'
          icon={<FaBox size={20} />}
        />

        <StatCard 
          title={t('plans', { defaultValue: "Plans" })} 
          value={plans?.length || 0} 
          colorScheme='error'
          icon={<FaClipboardList size={20} />}
        />

        <StatCard 
          title={t('active_orders', { defaultValue: "Active Orders" })} 
          value={dashboardData?.activeOrders || 0} 
          colorScheme='teal'
          icon={<FaShoppingCart size={20} />}
        />

        <StatCard 
          title={t('todays_revenue', { defaultValue: "Today's Revenue" })} 
          value={`$${dashboardData?.dailyRevenue?.toFixed(2) || 0}`} 
          colorScheme='green'
          icon={<FaDollarSign size={20} />}
        />

        <StatCard 
          title={t('active_subscriptions', { defaultValue: "Active Subscriptions" })} 
          value={dashboardData?.activeSubscriptions || 0} 
          colorScheme='purple'
          icon={<FaSync size={20} />}
        />

        <StatCard 
          title={t('available_meals', { defaultValue: "Available Meals" })} 
          value={dashboardData?.totalMeals || 0} 
          colorScheme='blue'
          icon={<FaUtensils size={20} />}
        />
      </Grid>
      <Box gap={6} m={12} maxW={'90%'} backgroundColor={'#ffffff'} p={8}>
        <AdminSupportPortal/>
      </Box>
      <Box gap={6} m={12} maxW={'90%'} backgroundColor={'#ffffff'} p={8}>
        <AdminAddressManager/>
      </Box>
      
      <Box gap={6} m={12} maxW={'90%'} backgroundColor={'#ffffff'} p={8}>
        <InstantOrdersMonitoring/>
      </Box>
      
      <Box gap={6} m={12} maxW={'90%'} backgroundColor={'#ffffff'} p={8}>
        <MealDeliveryDashboard/>
      </Box>

      {/* Recent Activity Section */}
      <Box gap={6} m={12} maxW={'90%'} backgroundColor={'#ffffff'} p={8}>
        <SectionHeading title={t('sections.recent_activity', { defaultValue: "Recent Activity" })} />
        {activityLoading ? (
          <LoadingSpinner />
        ) : (
          <ScrollableTableContainer>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>{t('activity.action', { defaultValue: "Action" })}</Th>
                    <Th>{t('activity.user', { defaultValue: "User" })}</Th>
                    <Th>{t('activity.target', { defaultValue: "Target" })}</Th>
                    <Th>{t('activity.time', { defaultValue: "Time" })}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity, index) => (
                      <Tr key={index}>
                        <Td>{activity.action}</Td>
                        <Td>{activity.userName || activity.userEmail || t('activity.system', { defaultValue: "System" })}</Td>
                        <Td>{activity.target}</Td>
                        <Td>{new Date(activity.timestamp).toLocaleString()}</Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={4} textAlign="center">
                        {t('activity.no_recent', { defaultValue: "No recent activity" })}
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
      
      <MenuPDFPortal/>
      
      {/* User Action Modal */}
      <Modal isOpen={userActionModal.isOpen} onClose={userActionModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {t('modals.user_actions.title', { defaultValue: "User Quick Actions" })}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {adminAction === 'setAdmin' && (
              <Box>
                <Heading size="sm" mb={4}>
                  {t('modals.set_admin_status', { 
                    email: selectedUser?.email,
                    defaultValue: `Set Admin Status for ${selectedUser?.email}`
                  })}
                </Heading>
                <Button 
                  colorScheme="blue" 
                  onClick={() => handleUserAction('setAdmin')}
                  isLoading={setAdminStatusMutation.isPending}
                >
                  {t('actions.confirm_make_admin', { defaultValue: "Confirm Make Admin" })}
                </Button>
              </Box>
            )}
            
            {adminAction === 'removeAdmin' && (
              <Box>
                <Heading size="sm" mb={4}>
                  {t('modals.remove_admin_status', { 
                    email: selectedUser?.email,
                    defaultValue: `Remove Admin Status from ${selectedUser?.email}`
                  })}
                </Heading>
                <Button 
                  colorScheme="red" 
                  onClick={() => handleUserAction('removeAdmin')}
                  isLoading={setAdminStatusMutation.isPending}
                >
                  {t('actions.confirm_remove_admin', { defaultValue: "Confirm Remove Admin" })}
                </Button>
              </Box>
            )}
            
            {adminAction === 'updateStatus' && (
              <FormControl>
                <FormLabel>
                  {t('fields.account_status', { defaultValue: "Account Status" })}
                </FormLabel>
                <Select 
                  value={accountStatus} 
                  onChange={(e) => setAccountStatus(e.target.value)}
                >
                  <option value="active">{t('status.active', { defaultValue: "Active" })}</option>
                  <option value="suspended">{t('status.suspended', { defaultValue: "Suspended" })}</option>
                  <option value="deleted">{t('status.deleted', { defaultValue: "Deleted" })}</option>
                </Select>
              </FormControl>
            )}
            
            {adminAction === 'updateLoyalty' && (
              <FormControl>
                <FormLabel>
                  {t('fields.loyalty_points', { defaultValue: "Loyalty Points" })}
                </FormLabel>
                <Input 
                  type="number" 
                  value={loyaltyPoints} 
                  onChange={(e) => setLoyaltyPoints(e.target.value)}
                  placeholder={t('placeholders.enter_points', { defaultValue: "Enter points" })}
                />
              </FormControl>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={userActionModal.onClose}>
              {t('actions.cancel', { defaultValue: "Cancel" })}
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleUserAction}
              isDisabled={
                (adminAction === 'updateStatus' && !accountStatus) ||
                (adminAction === 'updateLoyalty' && !loyaltyPoints)
              }
              isLoading={
                setAdminStatusMutation.isPending || 
                updateAccountStatusMutation.isPending || 
                updateLoyaltyPointsMutation.isPending
              }
            >
            
              {t('actions.apply_action', { defaultValue: "Apply Action" })}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default Admin