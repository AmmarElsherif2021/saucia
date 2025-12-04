import { useEffect, useCallback } from 'react'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box
} from '@chakra-ui/react';
import MapBox from '../../Components/Map/MapBox';

const MapModal = ({ 
  isOpen, 
  onClose, 
  addressFormData, 
  setAddressFormData,
  onAddressSubmit,
  disabledMessage
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>
          {disabledMessage ? 'View Location' : 'Add/Edit Address'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {disabledMessage && (
            <Alert status="warning" mb={4} borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle fontSize="sm">Feature Disabled</AlertTitle>
                <AlertDescription fontSize="xs">
                  {disabledMessage}
                </AlertDescription>
              </Box>
            </Alert>
          )}
          <MapBox
            onAddressSubmit={disabledMessage ? undefined : onAddressSubmit}
            predefinedLocations={[]}
            onSelectLocation={(location) => {
              if (!disabledMessage) {
                setAddressFormData({
                  ...addressFormData,
                  coordinates: [location.latlng.lat, location.latlng.lng],
                  address_line1: location.address.address_line1,
                  city: location.address.city
                });
              }
            }}
            disabledMessage={disabledMessage}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default MapModal;