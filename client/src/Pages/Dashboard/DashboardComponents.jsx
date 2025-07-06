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
    Switch
} from "@chakra-ui/react";
import { useTranslation } from "react-i18next";
import locationPin from '../../assets/locationPin.svg'
import { useNavigate } from "react-router";
//Reusable address component
export const AddressInput = ({ label, value, onChange, onMapOpen }) => {
    const { t } = useTranslation();
    return (
      <FormControl>
        <FormLabel>{label}</FormLabel>
        <Flex alignItems="center">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t('profile.enterDeliveryAddress')}
            variant={'ghost'}
          />
          <IconButton
            mx={2}
            aria-label={t('checkout.selectFromMap')}
            icon={<Image src={locationPin} boxSize="24px" />}
            onClick={onMapOpen}
          />
        </Flex>
      </FormControl>
    )
  }
  
  // UserInfoItem 
  export const UserInfoItem = ({ label, value, verified = false }) => {
    const { t } = useTranslation();
    return (
      <Text>
        <strong>{label}:</strong> {value || 'N/A'}{' '}
        {verified && (
          <Badge colorScheme="green" ml={2}>
            {t('profile.verified')}
          </Badge>
        )}
      </Text>
    )
  }

// Reusable component for notification status
export const NotificationStatus = ({ label, enabled }) => {
    const { t } = useTranslation();
    if (enabled === undefined) return null; 
    return (
    <Text>
      <strong>{label}:</strong>{' '}
      <Badge colorScheme={enabled ? 'green' : 'red'}>
        {enabled ? t('profile.enabled') : t('profile.disabled')}
      </Badge>
    </Text>
  )}

// Reusable form control for basic inputs
export const BasicFormControl = ({ label, name, value, placeholder, type = 'text',handleInputChange }) => {
    const { t } = useTranslation();
    if (!label) return null;
    if (!value && !placeholder) return null;
    if (type === 'number' && isNaN(value)) return null; 
    if (type === 'email' && !value.includes('@')) return null; 
    if (type === 'tel' && !/^\d+$/.test(value)) return null; 
    if (type === 'password' && value.length < 6) return null;
    return (
    <FormControl w={{ base: '95%', md: '60%' }}>
      <FormLabel>{label}</FormLabel>
      <Input
        variant={'ghost'}
        name={name}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        type={type}
        sx={{
          '::placeholder': {
            color: 'gray.500',
            opacity: 1,
            padding: '0.5rem',
          },
        }}
      />
    </FormControl>
  )}

// Reusable form control for number inputs
export const NumberFormControl = ({ label, value, min, max, onChange }) => {
    const {t}=useTranslation()
    return (
    <FormControl w={{ base: '90%', md: '50%' }}>
      <FormLabel>{label}</FormLabel>
      <NumberInput
        variant={'ghost'}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        sx={{
          paddingX: '10px',
        }}
      >
        <NumberInputField />
        <NumberInputStepper sx={{ paddingX: '0.2rem' }}>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </FormControl>
  )}

// Reusable form control for select inputs
export const SelectFormControl = ({ label, name, value, onChange, options, placeholder }) => {
    const {t}=useTranslation();
    return (
    <FormControl w={{ base: '90%', md: '80%' }}>
      <FormLabel>{t(label)}</FormLabel>
      <Select name={name} value={value} onChange={onChange} sx={{ paddingX: '2rem' }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {t(option.label)}
          </option>
        ))}
      </Select>
    </FormControl>
  )}

// Reusable checkbox grid component
export const CheckboxGrid = ({ 
  items, 
  selectedItems, 
  fieldPath, 
  columns = { base: 2, md: 4 }, 
  handleCheckboxArrayChange 
}) => {
  const { t } = useTranslation();
  return (
    <SimpleGrid columns={columns} spacing={3}>
      {items?.map((item) => (
        <Checkbox
          key={item.id}
          isChecked={selectedItems?.includes(item.id)}
          onChange={(e) => handleCheckboxArrayChange(fieldPath, item.id, e.target.checked)}
          value={item.value}
        >
          {t(item.label) || item.label}
        </Checkbox>
      ))}
    </SimpleGrid>
  )
}
// Reusable switch control component
export const SwitchFormControl = ({ label, id, checked, onChange }) => {
    
    return (
      <FormControl display="flex" alignItems="center" w={{ base: '90%', md: '50%' }}>
        <FormLabel htmlFor={id} mb="0">
          {label}
        </FormLabel>
        <Switch id={id} isChecked={checked} onChange={onChange} />
      </FormControl>
    )}
  
export const OrderHistoryTable = ({orders}) => {
    const { t } = useTranslation();
    if (!orders || orders.length === 0) {
      return (
        <Text textAlign="center" p={4} color="gray.500">
          {t('profile.noOrdersFound')}
        </Text>
      )
    }
    return (
      <TableContainer>
        <Table variant="striped" size="sm">
          <Thead>
            <Tr>
              <Th>{t('profile.orderID')}</Th>
              <Th>{t('profile.date')}</Th>
              <Th>{t('profile.items')}</Th>
              <Th>{t('profile.total')}</Th>
              <Th>{t('profile.status')}</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders?.map((order) => (
              <Tr key={order.id}>
                <Td>{order.id.slice(0, 8)}...</Td>
                <Td>
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Td>
                <Td>
                  {order.items?.map((item) => (
                    <Text key={item.id}>
                      {item.name} x{item.quantity}
                    </Text>
                  ))}
                </Td>
                <Td>${order.totalPrice?.toFixed(2)}</Td>
                <Td>
                  <Badge
                    colorScheme={
                      order.status === 'completed'
                        ? 'green'
                        : order.status === 'pending'
                          ? 'yellow'
                          : 'red'
                    }
                  >
                    {order.status}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        {orders ?.length === 0 && (
          <Text textAlign="center" p={4} color="gray.500">
            {t('profile.noOrdersFound')}
          </Text>
        )}
      </TableContainer>
    )}
  
    export const SubscriptionDetails = ({ subscriptions, isLoading }) => {
        const { t } = useTranslation();
        const navigate = useNavigate();
        
        if (isLoading) return <Spinner />;
        
        const activeSubscription = subscriptions?.find(sub => sub.status === 'active');
        
        return (
          <Box bg={'secondary.200'}>
            {activeSubscription ? (
              <Box p={4} borderWidth="1px" borderRadius="lg">
                <Heading size="md" mb={2}>
                  {activeSubscription.plans?.title || t('profile.activeSubscription')}
                </Heading>
                
                <Text fontWeight="bold" mb={2}>
                  ${activeSubscription.plans?.price_per_meal}/meal
                </Text>
                
                <Text>
                  {t('profile.status')}:{' '}
                  <Badge colorScheme="green">
                    {activeSubscription.status}
                  </Badge>
                </Text>
                
                <Text>
                  {t('profile.startDate')}:{' '}
                  {new Date(activeSubscription.start_date).toLocaleDateString()}
                </Text>
                
                <Text>
                  {t('profile.consumedMeals')}: {activeSubscription.consumed_meals}
                </Text>
                
                <Button mt={4} colorScheme="brand" onClick={() => navigate('/subscriptions')}>
                  {t('profile.manageSubscription')}
                </Button>
              </Box>
            ) : (
              <Box p={4} borderWidth="1px" borderRadius="lg">
                <Text mb={4}>{t('profile.noActiveSubscription')}</Text>
                <Button colorScheme="brand">{t('profile.browsePlans')}</Button>
              </Box>
            )}
          </Box>
        )
      }