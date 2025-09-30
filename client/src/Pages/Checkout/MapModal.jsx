// Updated to restrict to restaurant locations only
import { useEffect, useCallback, useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  VStack,
  HStack,
  Text,
  Box,
  Button,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  SimpleGrid,
  Card,
  CardBody,
} from '@chakra-ui/react'
import MapBox from '../../Components/Map/MapBox'
import { useRestaurantAddresses } from '../../Hooks/userHooks' 


const MapModal = ({ isOpen, onClose, onSelectLocation, restaurantAddresses }) => {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const toast = useToast()

  // Handle location selection from the list
  const handleAddressSelect = useCallback((address) => {
    setSelectedLocation(address)
    toast({
      title: 'Location Selected',
      description: `Selected: ${address.label}`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
  }, [toast])

  // Handle map click (optional - you can disable this if you only want list selection)
  const handleMapLocationSelect = useCallback((locationData) => {
    // Find if the clicked location matches any restaurant address
    const restaurantAddress = restaurantAddresses?.find(addr => 
      addr.coordinates && 
      Math.abs(addr.coordinates[0] - locationData.latlng.lat) < 0.01 &&
      Math.abs(addr.coordinates[1] - locationData.latlng.lng) < 0.01
    )
    
    if (restaurantAddress) {
      setSelectedLocation(restaurantAddress)
      toast({
        title: 'Location Selected',
        description: `Selected: ${restaurantAddress.label}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } else {
      toast({
        title: 'Invalid Location',
        description: 'Please select one of our restaurant locations from the list',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
    }
  }, [restaurantAddresses, toast])

  // Handle confirming the selected location
  const handleConfirm = useCallback(() => {
    if (!selectedLocation) {
      toast({
        title: 'No Location Selected',
        description: 'Please select a restaurant location first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    // Call parent callback with the selected restaurant address
    if (onSelectLocation) {
      onSelectLocation(selectedLocation)
    }
    
    toast({
      title: 'Location Saved',
      description: 'Your pickup location has been set',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
    
    setSelectedLocation(null)
    onClose()
  }, [selectedLocation, onSelectLocation, onClose, toast])

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedLocation(null)
    }
  }, [isOpen])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      closeOnOverlayClick={false}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent maxW="90vw" mx={2} p={2}>
        <ModalHeader>Select Pickup Location</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <VStack spacing={4} align="stretch">
            {/* Info Alert */}
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="500">Pickup Only</Text>
                <Text fontSize="sm">
                  Please select one of our restaurant locations for pickup. Delivery service is coming soon.
                </Text>
              </Box>
            </Alert>

            {/* Map Component - Optional */}
            <Box height="300px" borderRadius="md" overflow="hidden">
              <MapBox 
                onSelectLocation={handleMapLocationSelect}
                predefinedLocations={restaurantAddresses}
              />
            </Box>

            {/* Selected Location Display */}
            {selectedLocation && (
              <Card bg="blue.50" borderColor="blue.200">
                <CardBody p={4}>
                  <Text fontWeight="bold" mb={2}>Selected Location:</Text>
                  <Text fontSize="sm" color="gray.700">
                    {selectedLocation.label} - {selectedLocation.address_line1}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {selectedLocation.city}
                  </Text>
                </CardBody>
              </Card>
            )}

            {/* Restaurant Locations List */}
            <Box>
              <Text fontWeight="bold" mb={3}>Our Restaurant Locations:</Text>
              <SimpleGrid columns={1} spacing={3} maxH="300px" overflowY="auto">
                {restaurantAddresses?.map((address) => (
                  <Card 
                    key={address.id}
                    cursor="pointer"
                    border="2px solid"
                    borderColor={selectedLocation?.id === address.id ? 'blue.500' : 'gray.200'}
                    onClick={() => handleAddressSelect(address)}
                    _hover={{ borderColor: 'blue.300' }}
                  >
                    <CardBody p={4}>
                      <Text fontWeight="600" fontSize="md">{address.label}</Text>
                      <Text fontSize="sm" color="gray.600" mt={1}>
                        {address.address_line1}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {address.city}
                      </Text>
                      {address.address_line2 && (
                        <Text fontSize="xs" color="gray.500">
                          {address.address_line2}
                        </Text>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </Box>
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleConfirm}
              isDisabled={!selectedLocation}
            >
              Confirm Location
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default MapModal