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
} from '@chakra-ui/react'
import { useEffect, useCallback, useState } from 'react'
import MapBox from '../../Components/Map/MapBox'

const MapModal = ({ isOpen, onClose, onSelectLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null)
  
  const handleMapClick = useCallback(async (e) => {
    const { lat, lng } = e.latlng;
    const address = await getAddressFromCoordinates([lat, lng]);
    setSelectedLocation({
      id: null, // New location won't have ID
      display_name: address,
      coordinates: [lat, lng]
    });
  }, []);

  const handleConfirm = () => {
    if (selectedLocation && onSelectLocation) {
      onSelectLocation(selectedLocation)
    }
    onClose()
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
        <ModalHeader>Select Delivery Location</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          <MapBox onSelectLocation={handleMapClick} />
          {selectedLocation && (
            <Box mt={4} p={3} bg="blue.50" borderRadius="md">
              <Text fontWeight="bold">Selected Location:</Text>
              <Text>{selectedLocation.display_name}</Text>
            </Box>
          )}
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