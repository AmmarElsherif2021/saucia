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
import { useTranslation } from 'react-i18next';
const CommonQuestions = ({ onComplete }) => {
  const {t}= useTranslation();
  const { user, setUser, userPlan } = useUser();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    healthProfile: { 
      dietaryPreferences: [],
      allergies: [],
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
    if (user && user.healthProfile) {
      const newFormData = {
        healthProfile: {
          dietaryPreferences: Array.isArray(user.healthProfile.dietaryPreferences) 
            ? user.healthProfile.dietaryPreferences.join(', ') 
            : '',
          allergies: Array.isArray(user.healthProfile.allergies) 
            ? user.healthProfile.allergies.join(', ') 
            : '',
          age: user.healthProfile.age != null ? user.healthProfile.age.toString() : '',
          height: user.healthProfile.height != null ? user.healthProfile.height.toString() : '',
          weight: user.healthProfile.weight != null ? user.healthProfile.weight.toString() : '',
          gender: user.healthProfile.gender || '',
          activityLevel: user.healthProfile.activityLevel || '',
          fitnessGoal: user.healthProfile.fitnessGoal || '',
        }
      };

      setFormData(newFormData);
      console.log('Health profile initialized:', newFormData);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      // Prepare the update data with proper structure matching the model
      const updateData = {
        age: formData.healthProfile.age ? parseInt(formData.healthProfile.age, 10) : null,
        gender: formData.healthProfile.gender || '',
        healthProfile: {
          // Arrays: split comma-separated strings, trim whitespace, filter empty items
          dietaryPreferences: formData.healthProfile.dietaryPreferences
            ? formData.healthProfile.dietaryPreferences
                .split('premium.,')
                .map(item => item.trim())
                .filter(item => item)
            : [],
          allergies: formData.healthProfile.allergies
            ? formData.healthProfile.allergies
                .split('premium.,')
                .map(item => item.trim())
                .filter(item => item)
            : [],
         
          height: formData.healthProfile.height ? parseInt(formData.healthProfile.height, 10) : null,
          weight: formData.healthProfile.weight ? parseInt(formData.healthProfile.weight, 10) : null,
          activityLevel: formData.healthProfile.activityLevel || '',
          fitnessGoal: formData.healthProfile.fitnessGoal || ''
        }
      };
      
      console.log('Updating user profile with data:', updateData);
      const updatedUser = await updateUserProfile(user.uid, updateData);
      
      // Only update user state if we got a response
      if (updatedUser) {
        // Update only the health profile portion of the user object
        setUser(prevUser => ({
          ...prevUser,
          age:updateData.age,
          gender:updateData.gender,
          healthProfile: {
            ...prevUser.healthProfile,
            ...updateData.healthProfile
          }
        }));
      }

      toast({
        title: t('profile.profileUpdated'),
        description: t('profile.profileSavedSuccessfully'),
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      if (onComplete) {
        navigate('/checkout-plan');
        onComplete();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setFormError(error.message || 'Failed to update profile');
      toast({
        title: t('premium.error'),
        description: error.message || t('premium.errorUpdatingProfile'),
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
          <Heading as="h2" size="lg" mb="4">{t('premium.healthProfile')}</Heading>
          
          {formError && (
            <Box w="full" p="3" bg="red.50" color="red.600" borderRadius="md">
              <Text fontWeight="medium">{formError}</Text>
            </Box>
          )}

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4" w="full">
            <FormControl>
              <FormLabel>{t('premium.age')}</FormLabel>
              <Input
                type="number"
                name="age"
                value={formData.healthProfile.age}
                onChange={handleChange}
                placeholder={t('premium.yourAge')}
                min="10"
                max="100"
              />
            </FormControl>

            <FormControl>
              <FormLabel>{t('premium.gender')}</FormLabel>
              <Select
                name="gender"
                value={formData.healthProfile.gender || ''}
                onChange={handleChange}
                placeholder={t('premium.selectGender')}
              >
                <option value="male">{t('premium.male')}</option>
                <option value="female">{t('premium.female')}</option>
                <option value="other">{t('premium.other')}</option>
                <option value="prefer-not-to-say">{t('premium.preferNotToSay')}</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>{t('premium.heightCm')}</FormLabel>
              <Input
                type="number"
                name="height"
                value={formData.healthProfile.height}
                onChange={handleChange}
                placeholder={t('premium.yourHeight')}
                min="100"
                max="250"
              />
            </FormControl>

            <FormControl>
              <FormLabel>{t('premium.weightKg')}</FormLabel>
              <Input
                type="number"
                name="weight"
                value={formData.healthProfile.weight}
                onChange={handleChange}
                placeholder={t('premium.yourWeight')}
                min="30"
                max="200"
              />
            </FormControl>
          </SimpleGrid>

          <FormControl>
            <FormLabel>{t('premium.activityLevel')}</FormLabel>
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
                <Radio value="sedentary">{t('premium.sedentary')}</Radio>
                <Radio value="lightly-active">{t('premium.lightlyActive')}</Radio>
                <Radio value="moderately-active">{t('premium.moderatelyActive')}</Radio>
                <Radio value="very-active">{t('premium.veryActive')}</Radio>
                <Radio value="extremely-active">{t('premium.extremelyActive')}</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>

          <FormControl>
            <FormLabel>{t('premium.fitnessGoal')}</FormLabel>
            <Select
              name="fitnessGoal"
              value={formData.healthProfile.fitnessGoal || ''}
              onChange={handleChange}
              placeholder={t('premium.selectFitnessGoal')}
            >
              <option value="weight-loss">{t('premium.weightLoss')}</option>
              <option value="weight-gain">{t('premium.weightGain')}</option>
              <option value="maintenance">{t('premium.maintenance')}</option>
              <option value="muscle-gain">{t('premium.muscleGain')}</option>
              <option value="improve-fitness">{t('premium.improveFitness')}</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>{t('premium.dietaryPreferences')}</FormLabel>
            <Textarea
              name="dietaryPreferences"
              value={formData.healthProfile.dietaryPreferences}
              onChange={handleChange}
              placeholder={t('premium.dietaryPreferencesPlaceholder')}
            />
          </FormControl>

          <FormControl>
            <FormLabel>{t('premium.allergies')}</FormLabel>
            <Textarea
              name="allergies"
              value={formData.healthProfile.allergies}
              onChange={handleChange}
              placeholder={t('premium.allergiesPlaceholder')}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            mt="4"
            isLoading={isSubmitting}
            loadingText={t('premium.saving')}
          >
            {t('premium.saveHealthProfile')}
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default CommonQuestions;