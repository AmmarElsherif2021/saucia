// components/AdminAddressManager.jsx
import { useState } from 'react';
import { Box, Heading, HStack, Text, useToast } from '@chakra-ui/react';
import MapBox from '../../Components/Map/MapBox';
import { useInsertAddress, useRestaurantAddress } from '../../Hooks/useRestaurantAddress';
import { useDebugUser } from '../../Hooks/useDebugUser';

const AdminAddressManager = () => {
  const toast = useToast();
  const { insertAddress, isLoading } = useInsertAddress();
  const {addresses}= useRestaurantAddress();
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
     
      <Box>
        {addresses?.map((add) => (
          <HStack key={add?.id} border={"solid 2px #125748ff"} borderRadius={'md'} p={2} m={2} bg={'secondary.100'}>
            <Text fontSize="md">{add?.label}</Text>  
            <Text fontSize="2xs">{add?.address_line1}</Text>
            <Text fontSize="2xs">{add?.address_line1}</Text>
            <Text fontSize="xs">{add?.city}</Text>
          </HStack>
        ))}
      </Box>
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