// AdminComponents.jsx - Enhanced version
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
  InputGroup,
  InputLeftElement,
  Icon,
} from '@chakra-ui/react'
import { AddIcon, SearchIcon } from '@chakra-ui/icons'

// Enhanced SearchInput with better UX
export const SearchInput = ({ value, onChange, placeholder = "Search..." }) => (
  <InputGroup maxW="300px">
    <InputLeftElement pointerEvents="none">
      <Icon as={SearchIcon} color="gray.400" />
    </InputLeftElement>
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      variant="filled"
      _focus={{ bg: 'white', borderColor: 'brand.500' }}
    />
  </InputGroup>
)

// Enhanced LoadingSpinner with overlay
export const LoadingSpinner = ({ text, size = "lg" }) => (
  <Flex
    direction="column"
    justify="center"
    align="center"
    py={12}
    w="100%"
  >
    <Spinner 
      size={size} 
      thickness="3px" 
      color="brand.500" 
      speed="0.65s"
      mb={4}
    />
    {text && (
      <Text color="gray.600" fontSize="sm">
        {text}
      </Text>
    )}
  </Flex>
)

// Enhanced SectionHeading with better spacing
export const SectionHeading = ({ 
  title, 
  description, 
  onAddClick, 
  buttonText = 'Add New',
  children 
}) => (
  <Flex
    justify="space-between"
    align={{ base: 'flex-start', md: 'center' }}
    mb={6}
    direction={{ base: 'column', md: 'row' }}
    gap={4}
  >
    <Box flex={1}>
      <Heading size="lg" mb={2} color="gray.800">
        {title}
      </Heading>
      {description && (
        <Text fontSize="md" color="gray.600" maxW="2xl">
          {description}
        </Text>
      )}
    </Box>
    
    <Flex gap={3} align="center">
      {children}
      {onAddClick && (
        <Button 
          colorScheme="brand" 
          onClick={onAddClick}
          size="md"
          leftIcon={<AddIcon />}
          minW="auto"
        >
          {buttonText}
        </Button>
      )}
    </Flex>
  </Flex>
)

// Enhanced table container with better scrolling
export const ScrollableTableContainer = ({ children, maxHeight = "400px" }) => {
  const isMobile = useBreakpointValue({ base: true, lg: false })
  
  return (
    <Box
      border="1px"
      borderColor="gray.200"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="sm"
    >
      <TableContainer
        maxH={maxHeight}
        overflowY="auto"
        overflowX={isMobile ? 'auto' : 'visible'}
        sx={{
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'gray.100',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'gray.400',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'gray.500',
          },
        }}
      >
        {children}
      </TableContainer>
    </Box>
  )
}

// Quick Actions Component for user management
export const QuickActions = ({ onAction, isLoading = false }) => (
  <Flex gap={2} wrap="wrap">
    <Button
      size="sm"
      colorScheme="blue"
      variant="outline"
      onClick={() => onAction('setAdmin')}
      isLoading={isLoading}
      loadingText="Setting..."
    >
      Make Admin
    </Button>
    <Button
      size="sm"
      colorScheme="orange"
      variant="outline"
      onClick={() => onAction('removeAdmin')}
      isLoading={isLoading}
      loadingText="Removing..."
    >
      Remove Admin
    </Button>
    <Button
      size="sm"
      colorScheme="green"
      variant="outline"
      onClick={() => onAction('updateStatus')}
    >
      Update Status
    </Button>
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
  isLoading = false, 
}) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent px={2} maxH={"90vh"} minW={'70vw'} overflowY="auto">
      <ModalHeader>{title}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <FormComponent
          onSubmit={onSubmit}
          onCancel={onClose}
          initialData={initialData}
          isEdit={isEdit}
          isLoading={isLoading} 
        />
      </ModalBody>
    </ModalContent>
  </Modal>
);

// Enhanced StatCard with icon and trend indicator
export const StatCard = ({
  title,
  value,
  icon,
  trend,
  colorScheme = 'brand', 
}) => (
  <Box
    bg={`${colorScheme}.100`}
    p={6}
    borderRadius="xl"
    minWidth="180px"
    height="auto"
    borderColor={`${colorScheme}.300`}
    borderWidth={'3px'}
    display="flex"
    flexDirection="column"
    gap={4}
    position="relative"
    overflow="hidden"
    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    _hover={{ 
      transform: 'translateY(-4px)',
      borderColor: `${colorScheme}.700`
    }}
    _before={{
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: `linear-gradient(90deg, ${colorScheme}.400, ${colorScheme}.600)`,
    }}
  >
    {/* Header Section */}
    <Flex justify="space-between" align="flex-start">
      <Box flex={1}>
        <Text 
          fontSize="sm" 
          fontWeight="medium"
          color="gray.600" 
          mb={2}
          letterSpacing="wide"
          textTransform="uppercase"
        >
          {title}
        </Text>
        <Text 
          fontSize="3xl" 
          fontWeight="bold" 
          color="gray.800"
          lineHeight="shorter"
        >
          {value}
        </Text>
      </Box>
      
      {icon && (
        <Flex
          align="center"
          justify="center"
          boxSize={12}
          borderRadius="lg"
          bg={`${colorScheme}.50`}
          color={`${colorScheme}.500`}
          flexShrink={0}
          ml={4}
        >
          {icon}
        </Flex>
      )}
    </Flex>

    {/* Trend Section */}
    {trend && (
      <Flex align="center" justify="space-between" mt={2}>
        <Flex align="center">
          <Box
            display="inline-flex"
            alignItems="center"
            px={2}
            py={1}
            borderRadius="md"
            bg={trend.value > 0 ? 'green.50' : 'red.50'}
            color={trend.value > 0 ? 'green.600' : 'red.600'}
            fontSize="sm"
            fontWeight="medium"
          >
            <Text mr={1}>
              {trend.value > 0 ? '↗' : '↘'}
            </Text>
            <Text>
              {Math.abs(trend.value)}%
            </Text>
          </Box>
          <Text ml={2} fontSize="sm" color="gray.500">
            {trend.label}
          </Text>
        </Flex>
      </Flex>
    )}

    {/* Optional background decoration */}
    <Box
      position="absolute"
      top={-2}
      right={-2}
      width="80px"
      height="80px"
      borderRadius="full"
      bg={`${colorScheme}.25`}
      opacity={0.3}
      zIndex={0}
    />
  </Box>
);

