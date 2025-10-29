// components/AdminAddressManager.jsx
import { useState } from 'react';
import { Box, Heading, useToast } from '@chakra-ui/react';
import MapBox from '../../Components/Map/MapBox';
import { useInsertAddress } from '../../Hooks/useRestaurantAddress';
import { useDebugUser } from '../../Hooks/useDebugUser';

const AdminAddressManager = () => {
  const toast = useToast();
  const { insertAddress, isLoading } = useInsertAddress();
  //const userInfo = useDebugUser();

  const handleAddressSubmit = async (addressData) => {
    try {
      await insertAddress(addressData);
      
      toast({
        title: 'Address added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error adding address',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      console.error('Error inserting address:', error);
    }
  };

  return (
    <Box p={6}>
      <Heading as="h2" size="xl" mb={6}>
        Add New Address
      </Heading>
     
      <MapBox 
        onAddressSubmit={handleAddressSubmit}
      />
      
      {isLoading && (
        <Box mt={4} p={4} bg="blue.50" borderRadius="md">
          Adding address...
        </Box>
      )}
    </Box>
  );
};

export default AdminAddressManager;