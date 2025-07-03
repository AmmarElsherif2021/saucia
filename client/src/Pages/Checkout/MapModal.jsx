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
  IconButton,
  Skeleton,
  Input,
  Button,
  useToast,
  Divider,
} from '@chakra-ui/react'
import { useEffect, useCallback, useState, useRef } from 'react'
import { FaCrosshairs, FaMapMarkerAlt, FaSearch, FaCopy } from 'react-icons/fa'
import MapBox from '../../Components/Map/MapBox'
const MapModal = ({ isOpen, onClose }) => {
  const toast = useToast()
  const center = [26.386145, 50.075073]
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

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
        <ModalHeader>Select Location</ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={4}>
          <MapBox />
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleClose}>
              Confirm Selection
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default MapModal
