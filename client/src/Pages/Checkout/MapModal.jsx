import { useEffect, useCallback } from 'react'
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

const MapModal = ({
  isOpen,
  onClose,
  addresses = [],
  selectedAddress,
  onSelectAddress,
  loading = false,
  error = null,
}) => {
  const toast = useToast()

  // Handle address selection from the list
  const handleAddressSelect = useCallback(
    (address) => {
      if (onSelectAddress) onSelectAddress(address)
      toast({
        title: 'Location Selected',
        description: `Selected: ${address.label || address.display_name}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    },
    [onSelectAddress, toast]
  )

  // Handle map click
  const handleMapLocationSelect = useCallback(
    (locationData) => {
      const restaurantAddress = addresses?.find(
        (addr) =>
          addr.coordinates &&
          Math.abs(addr.coordinates[0] - locationData.latlng.lat) < 0.01 &&
          Math.abs(addr.coordinates[1] - locationData.latlng.lng) < 0.01
      )

      if (restaurantAddress) {
        if (onSelectAddress) onSelectAddress(restaurantAddress)
        toast({
          title: 'Location Selected',
          description: `Selected: ${restaurantAddress.label || restaurantAddress.display_name}`,
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
    },
    [addresses, onSelectAddress, toast]
  )

  // Confirm selection
  const handleConfirm = useCallback(() => {
    if (!selectedAddress) {
      toast({
        title: 'No Location Selected',
        description: 'Please select a restaurant location first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }
    toast({
      title: 'Location Saved',
      description: 'Your pickup location has been set',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
    onClose()
  }, [selectedAddress, onClose, toast])

  // Show loading state
  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalBody py={10}>
            <VStack spacing={4}>
              <Spinner size="xl" color="brand.500" />
              <Text>Loading restaurant locations...</Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

  // Show error state
  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalBody py={10}>
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="500">Error loading locations</Text>
                <Text fontSize="sm">{error}</Text>
              </Box>
            </Alert>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

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
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="500">Pickup Only</Text>
                <Text fontSize="sm">
                  Please select one of our restaurant locations for pickup. Delivery service is coming soon.
                </Text>
              </Box>
            </Alert>

            <Box height="300px" borderRadius="md" overflow="hidden">
              <MapBox
                onSelectLocation={handleMapLocationSelect}
                predefinedLocations={addresses}
              />
            </Box>

            {selectedAddress && (
              <Card bg="blue.50" borderColor="blue.200">
                <CardBody p={4}>
                  <Text fontWeight="bold" mb={2}>Selected Location:</Text>
                  <Text fontSize="sm" color="gray.700">
                    {selectedAddress.label || selectedAddress.display_name} - {selectedAddress.address_line1}
                  </Text>
                  <Text fontSize="xs" color="gray.600">
                    {selectedAddress.city}
                  </Text>
                </CardBody>
              </Card>
            )}

            <Box>
              <Text fontWeight="bold" mb={3}>Our Restaurant Locations:</Text>
              <SimpleGrid columns={1} spacing={3} maxH="300px" overflowY="auto">
                {addresses?.map((address) => (
                  <Card
                    key={address.id}
                    cursor="pointer"
                    border="2px solid"
                    borderColor={selectedAddress?.id === address.id ? 'blue.500' : 'gray.200'}
                    onClick={() => handleAddressSelect(address)}
                    _hover={{ borderColor: 'blue.300' }}
                  >
                    <CardBody p={4}>
                      <Text fontWeight="600" fontSize="md">
                        {address.label || address.display_name}
                      </Text>
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
              isDisabled={!selectedAddress}
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
