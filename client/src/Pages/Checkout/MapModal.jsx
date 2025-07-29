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
  Input,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  Spinner,
} from '@chakra-ui/react'
import { useEffect, useCallback, useState } from 'react'
import MapBox from '../../Components/Map/MapBox'
import { useUserAddresses } from '../../Hooks/userHooks'

const MapModal = ({ isOpen, onClose, onSelectLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [addressDetails, setAddressDetails] = useState({
    label: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'BH', // Default to Bahrain
    delivery_instructions: ''
  })
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false)
  const [isSavingAddress, setIsSavingAddress] = useState(false)
  
  const { addAddress } = useUserAddresses()
  const toast = useToast()

  // Function to get address from coordinates using Nominatim API
  const getAddressFromCoordinates = useCallback(async (coordinates) => {
    const [lat, lng] = coordinates
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      )
      
      if (!response.ok) throw new Error('Failed to fetch address')
      
      const data = await response.json()
      
      // Extract structured address components
      const address = data.address || {}
      const addressComponents = {
        display_name: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        address_line1: [
          address.house_number,
          address.road || address.street
        ].filter(Boolean).join(' ') || '',
        address_line2: [
          address.neighbourhood,
          address.suburb,
          address.district
        ].filter(Boolean).join(', ') || '',
        city: address.city || address.town || address.village || '',
        state: address.state || address.governorate || '',
        postal_code: address.postcode || '',
        country: address.country_code?.toUpperCase() || 'BH'
      }
      
      return addressComponents
    } catch (error) {
      console.error('Geocoding error:', error)
      return {
        display_name: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'BH'
      }
    }
  }, [])

  // Handle map click/selection
  const handleMapLocationSelect = useCallback(async (locationData) => {
    setIsGeocodingAddress(true)
    
    try {
      let coordinates, addressInfo
      
      // Handle different location data formats
      if (locationData.latlng) {
        // From map click event
        coordinates = [locationData.latlng.lat, locationData.latlng.lng]
        addressInfo = await getAddressFromCoordinates(coordinates)
      } else if (locationData.coordinates) {
        // From existing location
        coordinates = locationData.coordinates
        addressInfo = locationData
      } else {
        throw new Error('Invalid location data')
      }
      
      setSelectedLocation({
        coordinates,
        ...addressInfo
      })
      
      // Update address details form
      setAddressDetails(prev => ({
        ...prev,
        label: addressInfo.display_name ? `Location at ${addressInfo.city || 'Selected Area'}` : 'New Location',
        address_line1: addressInfo.address_line1 || '',
        address_line2: addressInfo.address_line2 || '',
        city: addressInfo.city || '',
        state: addressInfo.state || '',
        postal_code: addressInfo.postal_code || '',
        country: addressInfo.country || 'BH'
      }))
      
    } catch (error) {
      console.error('Error processing location:', error)
      toast({
        title: 'Location Error',
        description: 'Could not process the selected location',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsGeocodingAddress(false)
    }
  }, [getAddressFromCoordinates, toast])

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setAddressDetails(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle confirming and saving the location
  const handleConfirm = async () => {
    if (!selectedLocation || !selectedLocation.coordinates) {
      toast({
        title: 'No Location Selected',
        description: 'Please select a location on the map first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSavingAddress(true)
    
    try {
      // Prepare address data for saving
      const addressData = {
        ...addressDetails,
        location: `POINT(${selectedLocation.coordinates[1]} ${selectedLocation.coordinates[0]})`, // PostGIS format (lng, lat)
        is_default: false // User can set as default later
      }
      
      // Save to database using the hook
      const savedAddress = await addAddress(addressData)
      
      // Call parent callback with the saved address
      if (onSelectLocation) {
        onSelectLocation({
          ...savedAddress,
          coordinates: selectedLocation.coordinates,
          display_name: selectedLocation.display_name
        })
      }
      
      toast({
        title: 'Address Saved',
        description: 'Your delivery location has been saved successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      // Reset form and close modal
      setSelectedLocation(null)
      setAddressDetails({
        label: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'BH',
        delivery_instructions: ''
      })
      onClose()
      
    } catch (error) {
      console.error('Error saving address:', error)
      toast({
        title: 'Save Error',
        description: 'Could not save the address. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSavingAddress(false)
    }
  }

  // Reset form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedLocation(null)
      setAddressDetails({
        label: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'BH',
        delivery_instructions: ''
      })
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
        <ModalHeader>Select Delivery Location</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <VStack spacing={4} align="stretch">
            {/* Map Component */}
            <Box>
              <MapBox onSelectLocation={handleMapLocationSelect} />
            </Box>

            {/* Loading indicator for geocoding */}
            {isGeocodingAddress && (
              <Alert status="info">
                <AlertIcon />
                <HStack>
                  <Spinner size="sm" />
                  <Text>Getting address information...</Text>
                </HStack>
              </Alert>
            )}

            {/* Selected Location Display */}
            {selectedLocation && (
              <Box p={4} bg="blue.50" borderRadius="md">
                <Text fontWeight="bold" mb={2}>Selected Location:</Text>
                <Text fontSize="sm" color="gray.600">{selectedLocation.display_name}</Text>
                <Text fontSize="xs" color="gray.500">
                  Coordinates: {selectedLocation.coordinates[0].toFixed(6)}, {selectedLocation.coordinates[1].toFixed(6)}
                </Text>
              </Box>
            )}

            {/* Address Details Form */}
            {selectedLocation && (
              <VStack spacing={3} align="stretch">
                <Text fontWeight="bold">Address Details:</Text>
                
                <FormControl>
                  <FormLabel fontSize="sm">Label (e.g., "Home", "Office")</FormLabel>
                  <Input
                    value={addressDetails.label}
                    onChange={(e) => handleInputChange('label', e.target.value)}
                    placeholder="Home, Office, etc."
                    size="sm"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Address Line 1</FormLabel>
                  <Input
                    value={addressDetails.address_line1}
                    onChange={(e) => handleInputChange('address_line1', e.target.value)}
                    placeholder="Street address, building number"
                    size="sm"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm">Address Line 2</FormLabel>
                  <Input
                    value={addressDetails.address_line2}
                    onChange={(e) => handleInputChange('address_line2', e.target.value)}
                    placeholder="Apartment, suite, floor (optional)"
                    size="sm"
                  />
                </FormControl>

                <HStack>
                  <FormControl>
                    <FormLabel fontSize="sm">City</FormLabel>
                    <Input
                      value={addressDetails.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="City"
                      size="sm"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel fontSize="sm">State/Governorate</FormLabel>
                    <Input
                      value={addressDetails.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="State"
                      size="sm"
                    />
                  </FormControl>
                </HStack>

                <FormControl>
                  <FormLabel fontSize="sm">Delivery Instructions</FormLabel>
                  <Input
                    value={addressDetails.delivery_instructions}
                    onChange={(e) => handleInputChange('delivery_instructions', e.target.value)}
                    placeholder="Special delivery instructions (optional)"
                    size="sm"
                  />
                </FormControl>
              </VStack>
            )}
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <HStack spacing={3}>
            <Button 
              variant="ghost" 
              onClick={onClose}
              isDisabled={isSavingAddress}
            >
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleConfirm}
              isDisabled={!selectedLocation || isSavingAddress}
              isLoading={isSavingAddress}
              loadingText="Saving..."
            >
              Save Location
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default MapModal