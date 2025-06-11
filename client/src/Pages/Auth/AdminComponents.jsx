import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useBreakpointValue,
  TableContainer,
  Input,
} from '@chakra-ui/react'

export const StatCard = ({ title, value }) => (
  <Box bg="white" p={4} borderRadius="md" shadow="md">
    <Heading size="md" mb={2}>
      {title}
    </Heading>
    <Text fontSize="2xl" fontWeight="bold">
      {value}
    </Text>
  </Box>
)

export const LoadingSpinner = () => (
  <Flex justify="center" align="center" h="100vh">
    <Spinner size="xl" />
  </Flex>
)

export const ErrorAlert = ({ message, retry }) => (
  <Alert status="error" borderRadius="md" mb={4}>
    <AlertIcon />
    <Box>
      <AlertTitle>Error!</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Box>
    <Button ml="auto" onClick={retry} colorScheme="brand">
      Try Again
    </Button>
  </Alert>
)

export const SectionHeading = ({ title, onAddClick, buttonText = 'Add New' }) => (
  <Flex
    justify="space-between"
    align="center"
    mb={4}
    direction={{ base: 'column', md: 'row' }}
    gap={2}
  >
    <Heading size="lg">{title}</Heading>
    {onAddClick && (
      <Button colorScheme="green" onClick={onAddClick}>
        {buttonText}
      </Button>
    )}
  </Flex>
)

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this item?',
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>{title}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text>{message}</Text>
        <Flex mt={4} justify="flex-end">
          <Button mr={2} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="red" onClick={onConfirm}>
            Delete
          </Button>
        </Flex>
      </ModalBody>
    </ModalContent>
  </Modal>
)
export const FormModal = ({
  isOpen,
  onClose,
  title,
  onSubmit,
  initialData,
  FormComponent,
  isEdit = false,
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>{title}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <FormComponent
          onSubmit={onSubmit}
          onCancel={onClose}
          initialData={initialData}
          isEdit={isEdit}
        />
      </ModalBody>
    </ModalContent>
  </Modal>
)
export const SearchInput = ({ value, onChange }) => (
  <Input
    placeholder="Search..."
    value={value}
    onChange={(e) => onChange(e.target.value)}
    mb={4}
    maxW="300px"
  />
)
export const ScrollableTableContainer = ({ children }) => {
  const isTableScrollable = useBreakpointValue({ base: true, lg: false })
  return (
    <TableContainer
      maxHeight="45vh"
      overflowY="auto"
      overflowX={isTableScrollable ? 'auto' : 'visible'}
    >
      {children}
    </TableContainer>
  )
}
