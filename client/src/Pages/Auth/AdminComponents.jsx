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
import { AddIcon } from '@chakra-ui/icons'

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

// Enhanced StatCard with icon and trend indicator
export const StatCard = ({
  title,
  value,
  icon,
  trend,
  colorScheme = 'brand', 
}) => (
  <Box
    bg="white"
    p={4}
    borderRadius="50%"
    width={'150px'}
    height={'150px'}
    shadow="none"
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    textAlign="center"
    background={`${colorScheme}.300`}
    transition="all 0.2s"
    _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
  >
    <Flex justify="space-between" align="center">
      <Box>
        <Text fontSize="sm" color={`${colorScheme}.700`} mb={1}>
          {title}
        </Text>
        <Text fontSize="2xl" fontWeight="bold" color={`${colorScheme}.800`}>
          {value}
        </Text>
      </Box>
      {icon && (
        <Flex
          align="center"
          justify="center"
          boxSize={12}
          borderRadius="full"
          bg={`${colorScheme}.50`}
          color={`${colorScheme}.500`}
        >
          {icon}
        </Flex>
      )}
    </Flex>
    {trend && (
      <Flex align="center" mt={2}>
        <Text fontSize="sm" color={trend.value > 0 ? 'green.500' : 'red.500'}>
          {trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
        </Text>
        <Text ml={1} fontSize="xs" color="gray.500">
          {trend.label}
        </Text>
      </Flex>
    )}
  </Box>
);

// Enhanced LoadingSpinner with text
export const LoadingSpinner = ({ text }) => (
  <Flex
    direction="column"
    justify="center"
    align="center"
    position="fixed"
    top={0}
    left={0}
    padding={"43vw"}
    w="100vw"
    h="100vh"
    zIndex={9999}
    bg="rgba(255, 255, 255, 0.7)"
  >
    <Spinner size="xl" thickness="3px" color="brand.500" alignContent={"center"}/>
    {text && <Text mt={4}>{text}</Text>}
  </Flex>
);

// Improved SectionHeading with description
export const SectionHeading = ({ 
  title, 
  description, 
  onAddClick, 
  buttonText = 'Add New' 
}) => (
  <Flex
    justify="space-between"
    align={{ base: 'flex-start', md: 'center' }}
    mb={4}
    direction={{ base: 'column', md: 'row' }}
    gap={3}
  >
    <Box>
      <Heading size="lg" mb={1}>{title}</Heading>
      {description && (
        <Text fontSize="sm" color="gray.600">{description}</Text>
      )}
    </Box>
    {onAddClick && (
      <Button 
        colorScheme="brand" 
        onClick={onAddClick}
        size="sm"
        leftIcon={<AddIcon />}
      >
        {buttonText}
      </Button>
    )}
  </Flex>
);

// Enhanced table with striped rows
export const ScrollableTableContainer = ({ children }) => {
  const isTableScrollable = useBreakpointValue({ base: true, lg: false });
  return (
    <TableContainer
      maxHeight="55vh"
      overflowY="auto"
      overflowX={isTableScrollable ? 'auto' : 'visible'}
      border="1px"
      borderColor="gray.100"
      borderRadius="md"
      boxShadow="sm"
    >
      {children}
    </TableContainer>
  );
};