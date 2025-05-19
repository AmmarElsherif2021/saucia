import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Textarea,
  VStack,
  useToast,
  Select,
  Heading,
  SimpleGrid,
  Text
} from '@chakra-ui/react';
import { useUser } from '../../../Contexts/UserContext';
import { updateUserProfile } from '../../../API/users';
import { useNavigate } from 'react-router';
const CommonQuestions = ({ onComplete }) => {
  const { user, setUser } = useUser();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    dietaryPreferences: '',
    allergies: '',
    healthProfile: {
      age: '',
      height: '',
      weight: '',
      gender: '',
      activityLevel: '',
      fitnessGoal: '',
    }
  });

  // Safely initialize form with user data
  useEffect(() => {
    if (user) {
      const newFormData = {
        dietaryPreferences: '',
        allergies: '',
        healthProfile: {
          age: '',
          height: '',
          weight: '',
          gender: '',
          activityLevel: '',
          fitnessGoal: '',
        }
      };

      // Handle dietaryPreferences
      if (Array.isArray(user.dietaryPreferences)) {
        newFormData.dietaryPreferences = user.dietaryPreferences.join(', ');
      } else if (typeof user.dietaryPreferences === 'string') {
        newFormData.dietaryPreferences = user.dietaryPreferences;
      }

      // Handle allergies
      if (Array.isArray(user.allergies)) {
        newFormData.allergies = user.allergies.join(', ');
      } else if (typeof user.allergies === 'string') {
        newFormData.allergies = user.allergies;
      }

      // Handle healthProfile
      if (user.healthProfile && typeof user.healthProfile === 'object') {
        newFormData.healthProfile = {
          age: user.healthProfile.age != null ? user.healthProfile.age.toString() : '',
          height: user.healthProfile.height != null ? user.healthProfile.height.toString() : '',
          weight: user.healthProfile.weight != null ? user.healthProfile.weight.toString() : '',
          gender: user.healthProfile.gender || '',
          activityLevel: user.healthProfile.activityLevel || '',
          fitnessGoal: user.healthProfile.fitnessGoal || '',
        };
      }

      setFormData(newFormData);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      healthProfile: {
        ...prev.healthProfile,
        [name]: value
      }
    }));
  };

  const handleArrayInput = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      // Safely prepare the update data
      const updateData = {
        dietaryPreferences: formData.dietaryPreferences
          .split(',')
          .map(item => item.trim())
          .filter(item => item),
        allergies: formData.allergies
          .split(',')
          .map(item => item.trim())
          .filter(item => item),
        healthProfile: {
          age: formData.healthProfile.age ? parseInt(formData.healthProfile.age, 10) : null,
          height: formData.healthProfile.height ? parseInt(formData.healthProfile.height, 10) : null,
          weight: formData.healthProfile.weight ? parseInt(formData.healthProfile.weight, 10) : null,
          gender: formData.healthProfile.gender || null,
          activityLevel: formData.healthProfile.activityLevel || null,
          fitnessGoal: formData.healthProfile.fitnessGoal || null,
          ...user
        }
      };
      
      console.log(`Updating user profile with data:`, updateData);
      const updatedUser = await updateUserProfile(user.uid, updateData);
      
      // Only update user state if we got a response
      if (updatedUser) {
        // Be careful not to completely overwrite the user object
        setUser(prevUser => ({
          ...prevUser,
          dietaryPreferences: updateData.dietaryPreferences,
          allergies: updateData.allergies,
          healthProfile: updateData.healthProfile
        }));
        navigate('/checkout-plan')
      }

      toast({
        title: 'Profile updated',
        description: 'Your health profile has been saved successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setFormError(error.message || 'Failed to update profile');
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxW="600px" mx="auto" mt="8" p="6" borderWidth="1px" borderRadius="lg" boxShadow="md">
      <form onSubmit={handleSubmit}>
        <VStack spacing="4">
          <Heading as="h2" size="lg" mb="4">Health Profile</Heading>
          
          {formError && (
            <Box w="full" p="3" bg="red.50" color="red.600" borderRadius="md">
              <Text fontWeight="medium">{formError}</Text>
            </Box>
          )}

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4" w="full">
            <FormControl>
              <FormLabel>Age</FormLabel>
              <Input
                type="number"
                name="age"
                value={formData.healthProfile.age}
                onChange={handleChange}
                placeholder="Your age"
                min="10"
                max="100"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Gender</FormLabel>
              <Select
                name="gender"
                value={formData.healthProfile.gender || ''}
                onChange={handleChange}
                placeholder="Select gender"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Height (cm)</FormLabel>
              <Input
                type="number"
                name="height"
                value={formData.healthProfile.height}
                onChange={handleChange}
                placeholder="Your height"
                min="100"
                max="250"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Weight (kg)</FormLabel>
              <Input
                type="number"
                name="weight"
                value={formData.healthProfile.weight}
                onChange={handleChange}
                placeholder="Your weight"
                min="30"
                max="200"
              />
            </FormControl>
          </SimpleGrid>

          <FormControl>
            <FormLabel>Activity Level</FormLabel>
            <RadioGroup
              value={formData.healthProfile.activityLevel || ''}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                healthProfile: {
                  ...prev.healthProfile,
                  activityLevel: value
                }
              }))}
            >
              <Stack direction="column">
                <Radio value="sedentary">Sedentary (little or no exercise)</Radio>
                <Radio value="lightly-active">Lightly active (light exercise 1-3 days/week)</Radio>
                <Radio value="moderately-active">Moderately active (moderate exercise 3-5 days/week)</Radio>
                <Radio value="very-active">Very active (hard exercise 6-7 days/week)</Radio>
                <Radio value="extremely-active">Extremely active (very hard exercise & physical job)</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>

          <FormControl>
            <FormLabel>Fitness Goal</FormLabel>
            <Select
              name="fitnessGoal"
              value={formData.healthProfile.fitnessGoal || ''}
              onChange={handleChange}
              placeholder="Select your goal"
            >
              <option value="weight-loss">Weight Loss</option>
              <option value="weight-gain">Weight Gain</option>
              <option value="maintenance">Weight Maintenance</option>
              <option value="muscle-gain">Muscle Gain</option>
              <option value="improve-fitness">Improve Fitness</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Dietary Preferences (comma separated)</FormLabel>
            <Textarea
              name="dietaryPreferences"
              value={formData.dietaryPreferences}
              onChange={handleArrayInput}
              placeholder="E.g., vegetarian, gluten-free, dairy-free"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Allergies (comma separated)</FormLabel>
            <Textarea
              name="allergies"
              value={formData.allergies}
              onChange={handleArrayInput}
              placeholder="E.g., peanuts, shellfish, soy"
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            mt="4"
            isLoading={isSubmitting}
            loadingText="Saving..."
          >
            Save Health Profile
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default CommonQuestions;