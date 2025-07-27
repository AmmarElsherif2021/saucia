import { 
    FormControl, 
    FormLabel, 
    Flex, 
    Input, 
    IconButton, 
    Text, 
    Badge, 
    NumberInput, 
    NumberInputField, 
    NumberInputStepper, 
    NumberIncrementStepper, 
    NumberDecrementStepper, 
    Select, 
    Checkbox, 
    SimpleGrid, 
    Image,
    Spinner,
    Box,
    Button,
    Switch,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Heading,
    VStack,
    HStack,
    Center,
    Stack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import locationPin from '../../assets/locationPin.svg'
import { useNavigate } from "react-router";

// Responsive wrapper component for consistent centering
const ResponsiveWrapper = ({ children, ...props }) => (
  <Box
    w="100%"
    maxW="container.xl"
    mx="auto"
    px={{ base: 4, md: 6, lg: 8 }}
    {...props}
  >
    {children}
  </Box>
);

// Centered form container
const CenteredFormContainer = ({ children, maxWidth = "md", ...props }) => (
  <Center w="100%" {...props}>
    <Box w="100%" maxW={maxWidth}>
      {children}
    </Box>
  </Center>
);

//Reusable address component - Enhanced responsiveness
export const AddressInput = ({ label, value, onChange, onMapOpen }) => {
    const { t } = useTranslation();
    return (
      <ResponsiveWrapper>
        <FormControl w="100%">
          <FormLabel fontSize={{ base: "sm", md: "md" }} mb={2}>
            {label}
          </FormLabel>
          <Stack 
            direction={{ base: "column", sm: "row" }} 
            spacing={2}
            align={{ base: "stretch", sm: "center" }}
          >
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t('profile.enterDeliveryAddress')}
              variant={'ghost'}
              size={{ base: "md", md: "lg" }}
              flex={1}
            />
            <IconButton
              aria-label={t('checkout.selectFromMap')}
              icon={<Image src={locationPin} boxSize={{ base: "20px", md: "24px" }} />}
              onClick={onMapOpen}
              size={{ base: "md", md: "lg" }}
              flexShrink={0}
            />
          </Stack>
        </FormControl>
      </ResponsiveWrapper>
    )
};
  
// UserInfoItem - Better mobile layout
export const UserInfoItem = ({ label, value, verified = false }) => {
    const { t } = useTranslation();
    return (
      <Box w="100%" mb={2}>
        <Stack 
          direction={{ base: "column", sm: "row" }} 
          spacing={{ base: 1, sm: 3 }}
          align={{ base: "flex-start", sm: "center" }}
        >
          <Text fontWeight="bold" color={'brand.700'} fontSize={{ base: "sm", md: "md" }} minW="fit-content">
            {label}:
          </Text>
          <Flex align="center" gap={2} flex={1}>
            <Text fontSize={{ base: "sm", md: "md" }}>
              {value || 'N/A'}
            </Text>
            {verified && (
              <Badge 
                colorScheme="green" 
                size={{ base: "sm", md: "md" }}
                borderRadius="full"
              >
                {t('profile.verified')}
              </Badge>
            )}
          </Flex>
        </Stack>
      </Box>
    )
};

// Notification Status - Enhanced mobile view
export const NotificationStatus = ({ label, enabled }) => {
    const { t } = useTranslation();
    if (enabled === undefined) return null; 
    
    return (
      <Box w="100%" mb={3}>
        <Stack 
          direction={{ base: "column", sm: "row" }} 
          spacing={{ base: 1, sm: 3 }}
          align={{ base: "flex-start", sm: "center" }}
        >
          <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }} minW="fit-content">
            {label}:
          </Text>
          <Badge 
            colorScheme={enabled ? 'green' : 'red'}
            size={{ base: "sm", md: "md" }}
            borderRadius="full"
          >
            {enabled ? t('profile.enabled') : t('profile.disabled')}
          </Badge>
        </Stack>
      </Box>
    )
};

// Basic Form Control - Fully responsive and centered
export const BasicFormControl = ({ label, name, value, placeholder, type = 'text', handleInputChange }) => {
    const { t } = useTranslation();
    
    // Enhanced validation
    if (!label) return null;
    if (!value && !placeholder) return null;
    if (type === 'number' && value && isNaN(value)) return null; 
    if (type === 'email' && value && !value.includes('@')) return null; 
    if (type === 'tel' && value && !/^\+?[\d\s\-\(\)]+$/.test(value)) return null; 
    if (type === 'password' && value && value.length < 6) return null;
    
    return (
      <CenteredFormContainer maxWidth="lg" mb={4}>
        <FormControl w="100%">
          <FormLabel fontSize={{ base: "sm", md: "md" }} mb={2}>
            {label}
          </FormLabel>
          <Input
            variant={'ghost'}
            name={name}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            type={type}
            size={{ base: "md", md: "lg" }}
            sx={{
              '::placeholder': {
                color: 'gray.500',
                opacity: 1,
                fontSize: { base: "sm", md: "md" }
              },
            }}
          />
        </FormControl>
      </CenteredFormContainer>
    )
};

// Number Form Control - Better mobile experience
export const NumberFormControl = ({ label, value, min, max, onChange }) => {
    const { t } = useTranslation();
    
    return (
      <CenteredFormContainer maxWidth="md" mb={4}>
        <FormControl w="100%">
          <FormLabel fontSize={{ base: "sm", md: "md" }} mb={2}>
            {label}
          </FormLabel>
          <NumberInput
            variant={'ghost'}
            value={value}
            onChange={onChange}
            min={min}
            max={max}
            size={{ base: "md", md: "lg" }}
            px={4}
            
          >
            <NumberInputField justifyContent={'space-between'} />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>
      </CenteredFormContainer>
    )
};

// Select Form Control - Responsive and centered
export const SelectFormControl = ({ label, name, value, onChange, options, placeholder }) => {
    const { t } = useTranslation();
    
    return (
      <CenteredFormContainer maxWidth="lg" mb={4}>
        <FormControl w="100%">
          <FormLabel fontSize={{ base: "sm", md: "md" }} mb={2}>
            {t(label)}
          </FormLabel>
          <Select 
            name={name} 
            value={value} 
            onChange={onChange} 
            size={{ base: "md", md: "lg" }}
            placeholder={placeholder}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.label)}
              </option>
            ))}
          </Select>
        </FormControl>
      </CenteredFormContainer>
    )
};

// Checkbox Grid - Improved responsive layout
export const CheckboxGrid = ({ 
  items, 
  selectedItems, 
  fieldPath, 
  columns = { base: 1, sm: 2, md: 3, lg: 4 }, 
  handleCheckboxArrayChange 
}) => {
  const { t } = useTranslation();
  
  return (
    <ResponsiveWrapper>
      <SimpleGrid columns={columns} spacing={{ base: 3, md: 4 }} w="100%">
        {items?.map((item) => (
          <Box key={item.id} p={2}>
            <Checkbox
              isChecked={selectedItems?.includes(item.id)}
              onChange={(e) => handleCheckboxArrayChange(fieldPath, item.id, e.target.checked)}
              value={item.value}
              size={{ base: "md", md: "lg" }}
              colorScheme="brand"
            >
              <Text fontSize={{ base: "sm", md: "md" }}>
                {t(item.label) || item.label}
              </Text>
            </Checkbox>
          </Box>
        ))}
      </SimpleGrid>
    </ResponsiveWrapper>
  )
};

// Switch Form Control - Better mobile layout
export const SwitchFormControl = ({ label, id, checked, onChange }) => {
    return (
      <CenteredFormContainer maxWidth="md" mb={4}>
        <FormControl 
          display="flex" 
          alignItems="center" 
          justifyContent="space-between"
          w="100%"
          flexDirection={{ base: "column", sm: "row" }}
          gap={{ base: 2, sm: 0 }}
        >
          <FormLabel 
            htmlFor={id} 
            mb="0" 
            fontSize={{ base: "sm", md: "md" }}
            textAlign={{ base: "center", sm: "left" }}
          >
            {label}
          </FormLabel>
          <Switch 
            id={id} 
            isChecked={checked} 
            onChange={onChange} 
            size={{ base: "md", md: "lg" }}
            colorScheme="brand"
          />
        </FormControl>
      </CenteredFormContainer>
    )
};
  
// Order History Table - Mobile-first responsive design
export const OrderHistoryTable = ({ orders }) => {
    const { t } = useTranslation();
    
    if (!orders || orders.length === 0) {
      return (
        <Center w="100%" py={8}>
          <Text textAlign="center" color="gray.500" fontSize={{ base: "sm", md: "md" }}>
            {t('profile.noOrdersFound')}
          </Text>
        </Center>
      )
    }
    
    return (
      <ResponsiveWrapper>
        <Box overflowX="auto" w="100%">
          <TableContainer>
            <Table variant="striped" size={{ base: "sm", md: "md" }}>
              <Thead>
                <Tr>
                  <Th fontSize={{ base: "xs", md: "sm" }}>{t('profile.orderID')}</Th>
                  <Th fontSize={{ base: "xs", md: "sm" }}>{t('profile.date')}</Th>
                  <Th fontSize={{ base: "xs", md: "sm" }}>{t('profile.items')}</Th>
                  <Th fontSize={{ base: "xs", md: "sm" }} isNumeric>{t('profile.total')}</Th>
                  <Th fontSize={{ base: "xs", md: "sm" }}>{t('profile.status')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {orders?.map((order) => (
                  <Tr key={order.id}>
                    <Td fontSize={{ base: "xs", md: "sm" }}>
                      <Text isTruncated maxW={{ base: "60px", md: "100px" }}>
                        {order.id.slice(0, 8)}...
                      </Text>
                    </Td>
                    <Td fontSize={{ base: "xs", md: "sm" }}>
                      <Text>
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: '2-digit',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    </Td>
                    <Td fontSize={{ base: "xs", md: "sm" }}>
                      <VStack align="start" spacing={1}>
                        {order.items?.map((item) => (
                          <Text key={item.id} isTruncated maxW={{ base: "80px", md: "150px" }}>
                            {item.name} x{item.quantity}
                          </Text>
                        ))}
                      </VStack>
                    </Td>
                    <Td fontSize={{ base: "xs", md: "sm" }} isNumeric>
                      <Text fontWeight="bold">
                        ${order.totalPrice?.toFixed(2)}
                      </Text>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          order.status === 'completed'
                            ? 'green'
                            : order.status === 'pending'
                              ? 'yellow'
                              : 'red'
                        }
                        size={{ base: "sm", md: "md" }}
                        borderRadius="full"
                      >
                        {order.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </ResponsiveWrapper>
    )
};
  
// Subscription Details - Mobile-optimized layout
export const SubscriptionDetails = ({ subscription, isLoading }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    
    if (isLoading) {
      return (
        <Center w="100%" py={8}>
          <Spinner size={{ base: "md", md: "lg" }} />
        </Center>
      );
    }
    if (!subscription) return <Text>{t('profile.nosubscription')}</Text>;
    
    return (
      <ResponsiveWrapper>
        <Center w="100%">
          <Box 
            w="100%" 
            maxW="lg" 
            bg="secondary.200" 
            borderRadius="lg" 
            overflow="hidden"
          >
            {subscription ? (
              <Box p={{ base: 4, md: 6 }} borderWidth="1px" borderRadius="lg">
                <VStack spacing={4} align="stretch">
                  <Heading 
                    size={{ base: "md", md: "lg" }} 
                    textAlign="center"
                    color="brand.600"
                  >
                    {subscription.plans?.title || t('profile.subscription')}
                  </Heading>
                  
                  <Center>
                    <Text 
                      fontWeight="bold" 
                      fontSize={{ base: "xl", md: "2xl" }}
                      color="brand.500"
                    >
                      ${subscription.plans?.price_per_meal}/meal
                    </Text>
                  </Center>
                  
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium">
                        {t('profile.status')}:
                      </Text>
                      <Badge 
                        colorScheme="green" 
                        size={{ base: "sm", md: "md" }}
                        borderRadius="full"
                      >
                        {subscription.status}
                      </Badge>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium">
                        {t('profile.startDate')}:
                      </Text>
                      <Text fontSize={{ base: "sm", md: "md" }}>
                        {new Date(subscription.start_date).toLocaleDateString()}
                      </Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium">
                        {t('profile.consumedMeals')}:
                      </Text>
                      <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold">
                        {subscription.consumed_meals}
                      </Text>
                    </HStack>
                  </VStack>
                  
                  <Center pt={4}>
                    <Button 
                      colorScheme="brand" 
                      onClick={() => navigate('/subscriptions')}
                      size={{ base: "md", md: "lg" }}
                      w={{ base: "100%", sm: "auto" }}
                    >
                      {t('profile.manageSubscription')}
                    </Button>
                  </Center>
                </VStack>
              </Box>
            ) : (
              <Box p={{ base: 4, md: 6 }} borderWidth="1px" borderRadius="lg">
                <VStack spacing={4}>
                  <Text 
                    textAlign="center" 
                    fontSize={{ base: "md", md: "lg" }}
                    color="gray.600"
                  >
                    {t('profile.nosubscription')}
                  </Text>
                  <Button 
                    colorScheme="brand"
                    size={{ base: "md", md: "lg" }}
                    w={{ base: "100%", sm: "auto" }}
                  >
                    {t('profile.browsePlans')}
                  </Button>
                </VStack>
              </Box>
            )}
          </Box>
        </Center>
      </ResponsiveWrapper>
    )
};

// Enhanced Card Component for consistent layouts
export const ResponsiveCard = ({ children, ...props }) => (
  <Box
    p={{ base: 4, md: 6 }}
    borderWidth="1px"
    borderRadius="lg"
    shadow="sm"
    bg="white"
    _dark={{ bg: "gray.800" }}
    w="100%"
    {...props}
  >
    {children}
  </Box>
);

// Enhanced Grid Container for consistent spacing
export const ResponsiveGrid = ({ children, columns, spacing = 4, ...props }) => (
  <ResponsiveWrapper>
    <SimpleGrid 
      columns={columns || { base: 1, md: 2, lg: 3 }} 
      spacing={{ base: spacing, md: spacing + 2 }}
      w="100%"
      {...props}
    >
      {children}
    </SimpleGrid>
  </ResponsiveWrapper>
);

// Action Button Group for consistent button layouts
export const ActionButtonGroup = ({ children, ...props }) => (
  <HStack 
    spacing={{ base: 2, md: 3 }}
    justify={{ base: "center", sm: "flex-end" }}
    wrap="wrap"
    {...props}
  >
    {children}
  </HStack>
);

// Enhanced UserDashboard Layout Component
export const ResponsiveDashboardLayout = ({ children }) => {
  return (
    <Box
      minH="100vh"
      bg={{ base: "gray.50", dark: "gray.900" }}
    >
      <ResponsiveWrapper>
        <Box
          py={{ base: 4, md: 6, lg: 8 }}
          w="100%"
        >
          {children}
        </Box>
      </ResponsiveWrapper>
    </Box>
  );
};

// Enhanced Tab Layout for mobile
export const ResponsiveTabLayout = ({ children }) => (
  <Box w="100%">
    <Tabs 
      variant="enclosed" 
      size={{ base: "sm", md: "md" }}
      isLazy
      lazyBehavior="keepMounted"
    >
      {children}
    </Tabs>
  </Box>
);

// Mobile-optimized Tab List
export const MobileTabList = ({ tabs }) => {
  const { t } = useTranslation();
  
  return (
    <TabList 
      overflowX="auto" 
      overflowY="hidden"
      css={{
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
          display: 'none'
        }
      }}
      borderBottom="2px solid"
      borderColor="gray.200"
      _dark={{ borderColor: "gray.600" }}
    >
      {tabs.map((tab, index) => (
        <Tab 
          key={index}
          fontSize={{ base: "xs", sm: "sm", md: "md" }}
          px={{ base: 2, sm: 3, md: 4 }}
          py={{ base: 2, md: 3 }}
          whiteSpace="nowrap"
          _selected={{
            color: "brand.600",
            borderColor: "brand.600",
            fontWeight: "bold"
          }}
        >
          {t(tab)}
        </Tab>
      ))}
    </TabList>
  );
};

// Enhanced Modal Layout for mobile
export const ResponsiveModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = "lg",
  ...props 
}) => (
  <Modal 
    isOpen={isOpen} 
    onClose={onClose} 
    size={{ base: "full", sm: "md", md: size }}
    scrollBehavior="inside"
    {...props}
  >
    <ModalOverlay />
    <ModalContent 
      mx={{ base: 0, sm: 4 }}
      my={{ base: 0, sm: "auto" }}
      borderRadius={{ base: 0, sm: "lg" }}
      maxH={{ base: "100vh", sm: "90vh" }}
    >
      <ModalHeader
        fontSize={{ base: "lg", md: "xl" }}
        fontWeight="bold"
        textAlign="center"
        pb={4}
        borderBottom="1px solid"
        borderColor="gray.200"
        _dark={{ borderColor: "gray.600" }}
      >
        {title}
      </ModalHeader>
      <ModalCloseButton 
        size={{ base: "sm", md: "md" }}
        top={{ base: 3, md: 4 }}
        right={{ base: 3, md: 4 }}
      />
      <ModalBody p={{ base: 4, md: 6 }}>
        {children}
      </ModalBody>
    </ModalContent>
  </Modal>
);

// Profile Header Component with better mobile layout
export const ResponsiveProfileHeader = ({ user, onOpen, t }) => (
  <ResponsiveCard mb={6}>
    <VStack spacing={4} align="center" textAlign="center">
      <Heading 
        size={{ base: "lg", md: "xl" }} 
        color="brand.600"
      >
        {t('profile.welcome')}, {user?.display_name || user?.email}
      </Heading>
      
      <Text 
        fontSize={{ base: "sm", md: "md" }} 
        color="gray.600"
        maxW="md"
      >
        {t('profile.manageYourAccount')}
      </Text>
      
      <Button
        colorScheme="brand"
        onClick={onOpen}
        size={{ base: "md", md: "lg" }}
        w={{ base: "100%", sm: "auto" }}
        minW="200px"
      >
        {t('profile.editProfile')}
      </Button>
    </VStack>
  </ResponsiveCard>
);

// Enhanced Section Component
export const DashboardSection = ({ title, children, action, ...props }) => {
  const { t } = useTranslation();
  
  return (
    <ResponsiveCard {...props}>
      <VStack spacing={4} align="stretch">
        {title && (
          <Flex 
            justify="space-between" 
            align={{ base: "flex-start", sm: "center" }}
            direction={{ base: "column", sm: "row" }}
            gap={{ base: 2, sm: 0 }}
          >
            <Heading 
              size={{ base: "md", md: "lg" }}
              color="brand.700"
              _dark={{ color: "gray.200" }}
            >
              {typeof title === 'string' ? t(title) : title}
            </Heading>
            {action && (
              <Box>
                {action}
              </Box>
            )}
          </Flex>
        )}
        {children}
      </VStack>
    </ResponsiveCard>
  );
};

export default {
  ResponsiveWrapper,
  CenteredFormContainer,
  ResponsiveCard,
  ResponsiveGrid,
  ActionButtonGroup,
  ResponsiveDashboardLayout,
  ResponsiveTabLayout,
  MobileTabList,
  ResponsiveModal,
  ResponsiveProfileHeader,
  DashboardSection
};