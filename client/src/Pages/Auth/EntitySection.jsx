import { useState, useMemo } from 'react'
import {
    Box,
    Flex,
    Button,
    Stack,
    Text,
    Badge,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
} from '@chakra-ui/react'
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table'
import { 
    ChevronUpIcon, 
    ChevronDownIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon,
    DownloadIcon,
    UpDownIcon,//UpDownIcon
    EditIcon,
    DeleteIcon
} from '@chakra-ui/icons'
import {
        SectionHeading,
        SearchInput,
        ConfirmationModal,
        FormModal,
        ScrollableTableContainer,
        LoadingSpinner
} from './AdminComponents.jsx'
import { t } from 'i18next'

export const EntitySection = ({ 
  entityType, 
  data, 
  isLoading, 
  entityManager, 
  isTableScrollable 
}) => {
  const { config, searchTerm, setSearchTerm, selectedEntity, setSelectedEntity, modals, handlers } = entityManager
  const [sorting, setSorting] = useState([])
  const [rowSelection, setRowSelection] = useState({})

  // Transform columns for React Table
  const columns = useMemo(() => [
    ...(config?.columns?.map(col => ({
      accessorKey: col.key,
      header: col.label,
      cell: ({ row, getValue }) => {
        const value = getValue()
        if (col.render) {
          return col.render(value, row.original)
        }
        if (col.format) {
          return col.format(value)
        }
        return value || 'N/A'
      },
      enableSorting: true,
      size: col.width ? parseInt(col.width) : 150,
    })) || []),
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Stack direction="row" spacing={1} justify="flex-end">
          <IconButton
            size="sm"
            colorScheme="blue"
            variant="ghost"
            icon={<EditIcon />}
            onClick={() => {
              setSelectedEntity(row.original)
              modals.edit.onOpen()
            }}
            aria-label="Edit"
          />
          <IconButton
            size="sm"
            colorScheme="red"
            variant="ghost"
            icon={<DeleteIcon />}
            onClick={() => {
              setSelectedEntity(row.original)
              modals.delete.onOpen()
            }}
            aria-label="Delete"
          />
        </Stack>
      ),
      enableSorting: false,
      size: 100,
    },
  ], [config, modals, setSelectedEntity])

  // React Table instance
  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      sorting,
      rowSelection,
      globalFilter: searchTerm,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setSearchTerm,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  })

  if (isLoading) {
    return <LoadingSpinner text={`Loading ${config.title}...`} />
  }

  return (
    <Box 
      gap={6} 
      m={6} 
      maxW={'90%'} 
      backgroundColor={'#ffffff'} 
      p={6}
      borderRadius="lg"
      boxShadow="sm"
      border="1px"
      borderColor="gray.100"
    >
      <SectionHeading
        title={config.title}
        description={config.description}
        onAddClick={modals.add.onOpen}
        buttonText={`Add ${config.singular}`}
      >
        <Flex gap={2} align="center">
          <SearchInput 
            value={searchTerm} 
            onChange={setSearchTerm}
            placeholder={`Search ${config.title.toLowerCase()}...`}
          />
          
          {/* Import/Export Buttons */}
          {config.hasExport && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<DownloadIcon />}
              onClick={() => handlers.handleExport(data)}
            >
              Export
            </Button>
          )}
          
          {config.hasImport && (
            <Button
              size="sm"
              variant="outline"
              as="label"
              leftIcon={<UpDownIcon />}
              cursor="pointer"
            >
              Import
              <input 
                type="file" 
                hidden 
                accept=".json" 
                onChange={handlers.handleImport} 
              />
            </Button>
          )}
        </Flex>
      </SectionHeading>

      {/* React Table */}
      <ScrollableTableContainer maxHeight="55vh">
        <Box as="table" w="100%" sx={{ borderCollapse: 'collapse' }}>
          <Box as="thead" position="sticky" top={0} bg="white" zIndex={1}>
            {table.getHeaderGroups().map(headerGroup => (
              <Box as="tr" key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <Box
                    as="th"
                    key={header.id}
                    px={4}
                    py={3}
                    textAlign="left"
                    fontSize="sm"
                    fontWeight="600"
                    color="gray.700"
                    bg="gray.50"
                    borderBottom="1px"
                    borderColor="gray.200"
                    cursor={header.column.getCanSort() ? 'pointer' : 'default'}
                    onClick={header.column.getToggleSortingHandler()}
                    _hover={header.column.getCanSort() ? { bg: 'gray.100' } : {}}
                  >
                    <Flex align="center" gap={2}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: <ChevronUpIcon boxSize={3} />,
                        desc: <ChevronDownIcon boxSize={3} />,
                      }[header.column.getIsSorted()] ?? null}
                    </Flex>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
          
          <Box as="tbody">
            {table.getRowModel().rows.map(row => (
              <Box
                as="tr"
                key={row.id}
                _even={{ bg: 'gray.50' }}
                _hover={{ bg: 'blue.50' }}
                transition="background-color 0.2s"
              >
                {row.getVisibleCells().map(cell => (
                  <Box
                    as="td"
                    key={cell.id}
                    px={4}
                    py={3}
                    borderBottom="1px"
                    borderColor="gray.100"
                    fontSize="sm"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </ScrollableTableContainer>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <Flex justify="space-between" align="center" mt={4} px={2}>
          <Text fontSize="sm" color="gray.600">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </Text>
          
          <Flex gap={2}>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<ChevronLeftIcon />}
              onClick={() => table.previousPage()}
              isDisabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              rightIcon={<ChevronRightIcon />}
              onClick={() => table.nextPage()}
              isDisabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </Flex>
        </Flex>
      )}

      {/* modals here */}
       {/* Modals */}
            <FormModal
              isOpen={modals.add.isOpen}
              onClose={modals.add.onClose}
              title={t('admin.modals.add_entity', {
                entity: t(config.singularKey || `admin.entities.${entityType}.singular`, { defaultValue: config.singular }),
                defaultValue: `Add New ${config.singular}`
              })}
              onSubmit={handleAddWithDebug}
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
              onSubmit={(data) => handleEditWithDebug(selectedEntity?.id, data)}
              initialData={selectedEntity}
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
              onConfirm={() => handleDeleteWithDebug(selectedEntity?.id)}
              message={`Are you sure you want to delete this ${config.singular.toLowerCase()}?`}
            />
    </Box>
  )
}