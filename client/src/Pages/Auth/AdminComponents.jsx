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
    <ModalContent px={2}>
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