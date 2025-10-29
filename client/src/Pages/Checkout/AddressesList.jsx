// components/AddressList.jsx
import {
  Box,
  VStack,
  Radio,
  RadioGroup,
  Text,
  Button,
  Icon,
  Flex,
  Badge,
  useColorMode,
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaCheck } from 'react-icons/fa';

const AddressList = ({ 
  addresses, 
  selectedAddress, 
  onSelectAddress, 
  onAddNewAddress,
  isLoading = false 
}) => {
  const { colorMode } = useColorMode();

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Text>Loading addresses...</Text>
      </Box>
    );
  }

  if (!addresses || addresses.length === 0) {
    return (
      <VStack spacing={4} p={4}>
        <Text textAlign="center" color="gray.500">
          No saved addresses found
        </Text>
        <Button
          colorScheme="brand"
          leftIcon={<Icon as={FaMapMarkerAlt} />}
          onClick={onAddNewAddress}
        >
          Add Your First Address
        </Button>
      </VStack>
    );
  }

  return (
    <Box>
      <VStack spacing={3} align="stretch">
        <RadioGroup value={selectedAddress?.id} onChange={onSelectAddress}>
          <VStack spacing={3} align="stretch">
            {addresses.map((address) => (
              <Box
                key={address.id}
                borderWidth="1px"
                borderRadius="lg"
                p={4}
                cursor="pointer"
                bg={colorMode === 'dark' ? 'gray.700' : 'white'}
                _hover={{
                  bg: colorMode === 'dark' ? 'gray.600' : 'gray.50',
                }}
                onClick={() => onSelectAddress(address.id)}
              >
                <Flex align="center" justify="space-between">
                  <Flex align="center" gap={3}>
                    <Radio value={address.id} colorScheme="brand" />
                    <Box>
                      <Flex align="center" gap={2} mb={1}>
                        <Text fontWeight="bold">{address.label}</Text>
                        {address.is_default && (
                          <Badge colorScheme="green" size="sm">
                            Default
                          </Badge>
                        )}
                      </Flex>
                      <Text fontSize="sm" color="gray.600">
                        {address.address_line1}
                        {address.address_line2 && `, ${address.address_line2}`}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {address.city}
                      </Text>
                    </Box>
                  </Flex>
                  {selectedAddress?.id === address.id && (
                    <Icon as={FaCheck} color="green.500" />
                  )}
                </Flex>
              </Box>
            ))}
          </VStack>
        </RadioGroup>

        <Button
          variant="outline"
          colorScheme="brand"
          leftIcon={<Icon as={FaMapMarkerAlt} />}
          onClick={onAddNewAddress}
          mt={2}
        >
          Use Different Address
        </Button>
      </VStack>
    </Box>
  );
};

export default AddressList;