import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Box, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  VStack, 
  Heading, 
  Text,
  Alert,
  AlertIcon,
  Spinner
} from '@chakra-ui/react';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, completeProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    age: 0,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    setError('');
  
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required');
      setLoading(false);
      return;
    }
  
    try {
      const result = await completeProfile({
        firstName: formData.firstName, 
        lastName: formData.lastName,   
        phoneNumber: formData.phone,   
        age: formData.age // Optional, backend doesn't use it yet
      });
      
      if (result) {
        navigate('/');
      }
    } catch (error) {
      setError(error.message || 'Profile completion failed');
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner if user data is not available yet
  if (!user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto" p={6}>
      <VStack spacing={6}>
        <Heading size="lg">Complete Your Profile</Heading>
        <Text color="gray.600" textAlign="center">
          Please provide additional information to complete your account setup.
        </Text>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Box as="form" onSubmit={handleSubmit} width="100%">
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>First Name</FormLabel>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                disabled={loading}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Last Name</FormLabel>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                disabled={loading}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Phone Number</FormLabel>
              <Input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                disabled={loading}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Age</FormLabel>
              <Input
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                disabled={loading}
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              width="100%"
              isLoading={loading}
              loadingText="Completing Profile..."
            >
              Complete Profile
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default CompleteProfile;