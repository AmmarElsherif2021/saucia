import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Stack,
  VStack,
  useToast,
  Select,
  Heading,
  SimpleGrid,
  Wrap,
  WrapItem,
  useColorMode,
  Skeleton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { useAuthContext } from '../../../Contexts/AuthContext'
import { 
  useUserProfile, 
  useHealthProfile
} from '../../../hooks/userHooks'
import { useUserAllergies } from '../../../hooks/useUserAllergies' // Use custom hook
import { useUserDietaryPreferences } from '../../../hooks/useUserDietaryPreferences' // Use custom hook
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'

const CommonQuestions = ({ onComplete }) => {
  const { t } = useTranslation()
  const { user } = useAuthContext()
  const toast = useToast()
  const navigate = useNavigate()
  const { colorMode } = useColorMode()
  
  // Fetch user data  
  const { 
    data: userProfile, 
    isLoading: isLoadingProfile,
    error: profileError,
    updateProfile
  } = useUserProfile()
  
  const { 
    data: healthProfile, 
    isLoading: isLoadingHealth,
    error: healthError,
    updateHealthProfile
  } = useHealthProfile()
  
  // Fetch dietary preferences and allergies
  const { 
    addPreference,
    bulkUpdatePreferences,
    dietaryPreferences: availablePreferences,
    userDietaryPreferences,
    isLoading: isLoadingPreferences,
    error: preferencesError
  } = useUserDietaryPreferences()
  
  const { 
    addAllergy,
    bulkUpdateAllergies,
    allergies: availableAllergies,
    userAllergies,
    isLoading: isLoadingAllergies,
    error: allergiesError
  } = useUserAllergies()
  
  const [formError, setFormError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    healthProfile: {
      dietaryPreferences: [],
      allergies: [],
      height: '',
      weight: '',
      activityLevel: 'moderately-active',
      fitnessGoal: 'maintenance',
    },
  })

   // Initialize form with user data
  useEffect(() => {
    console.log('Initializing form with user data...');
    console.log('User Profile:', userProfile);
    console.log('Health Profile:', healthProfile);
    console.log('User Dietary Preferences:', userDietaryPreferences);
    console.log('User Allergies:', userAllergies);
    
    if (userProfile || healthProfile || userDietaryPreferences || userAllergies) {
      setFormData({
        age: userProfile?.age?.toString() || '',
        gender: userProfile?.gender || '',
        healthProfile: {
          // Map userDietaryPreferences to IDs
          dietaryPreferences: userDietaryPreferences?.map(p => p.preference_id) || [],
          // Map userAllergies to IDs
          allergies: userAllergies?.map(a => a.allergy_id) || [],
          height: healthProfile?.height_cm?.toString() || '',
          weight: healthProfile?.weight_kg?.toString() || '',
          activityLevel: healthProfile?.activity_level || 'moderately-active',
          fitnessGoal: healthProfile?.fitness_goal || 'maintenance',
        },
      })
    }
  }, [userProfile, healthProfile, userDietaryPreferences, userAllergies])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'age' || name === 'gender') {
      setFormData(prev => ({ ...prev, [name]: value }))
    } else {
      setFormData(prev => ({
        ...prev,
        healthProfile: { ...prev.healthProfile, [name]: value }
      }))
    }
  }

  const toggleSelection = (type, value) => {
    setFormData(prev => {
      const currentValues = prev.healthProfile[type]
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]
      
      return {
        ...prev,
        healthProfile: { ...prev.healthProfile, [type]: newValues }
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    setIsSubmitting(true)
    console.log('Submitting form data:', formData);

    try {
      if (!user?.id) throw new Error('User not authenticated')

      // Prepare data
      const profileData = {
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender
      }

      const healthData = {
        height_cm: formData.healthProfile.height ? parseInt(formData.healthProfile.height) : null,
        weight_kg: formData.healthProfile.weight ? parseInt(formData.healthProfile.weight) : null,
        activity_level: formData.healthProfile.activityLevel,
        fitness_goal: formData.healthProfile.fitnessGoal
      }

      console.log('Preparing to update:');
      console.log('Profile Data:', profileData);
      console.log('Health Data:', healthData);
      console.log('Dietary Preferences:', formData.healthProfile.dietaryPreferences);
      console.log('Allergies:', formData.healthProfile.allergies);

      // Prepare bulk data for allergies and preferences
      const allergiesData = formData.healthProfile.allergies.map(allergyId => ({
        allergy_id: allergyId,
        severity_override: 1
      }));

      const preferencesData = formData.healthProfile.dietaryPreferences.map(prefId => ({
        preference_id: prefId
      }));

      // Update profile and health data, and bulk update allergies and preferences
      await Promise.all([
        updateProfile(profileData),
        updateHealthProfile(healthData),
        bulkUpdateAllergies(allergiesData),
        bulkUpdatePreferences(preferencesData)
      ]);

      console.log('Profile updated successfully');

      toast({
        title: t('profile.profileUpdated'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      onComplete?.()
      navigate('/checkout-plan')
    } catch (error) {
      console.error('Update error:', error)
      setFormError(error.message || t('premium.errorUpdatingProfile'))
      toast({
        title: t('premium.error'),
        description: error.message || t('premium.errorUpdatingProfile'),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading states
    const isLoading = isLoadingProfile || isLoadingHealth || 
                   isLoadingAllergies || isLoadingPreferences

  // Error states
  const hasError = profileError || healthError || 
                  allergiesError || preferencesError

  // Theme variables
  const bgColor = { light: 'secondary.400', dark: 'gray.800' }
  const borderColor = { light: 'brand.200', dark: 'gray.700' }
  const inputBg = { light: 'white', dark: 'gray.700' }

  if (hasError) {
    return (
      <Box p={6} borderRadius="lg" bg={bgColor[colorMode]} borderWidth="2px" borderColor={borderColor[colorMode]}>
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          {t('premium.errorLoadingData')}
        </Alert>
        <Button onClick={() => window.location.reload()} colorScheme="brand">
          {t('common.retry')}
        </Button>
      </Box>
    )
  }

  return (
    <Box
      maxW="800px"
      mx="auto"
      mt={8}
      p={[4, 6]}
      borderWidth="2px"
      borderRadius="lg"
      bg={bgColor[colorMode]}
      borderColor={borderColor[colorMode]}
    >
      <form onSubmit={handleSubmit}>
        <VStack spacing={5} align="stretch">
          <Heading as="h2" size="lg" mb={4} color="brand.700">
            {t('premium.healthProfile')}
          </Heading>

          {formError && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {formError}
            </Alert>
          )}

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
            {/* Age */}
            <FormControl>
              <FormLabel>{t('premium.age')}</FormLabel>
              {isLoading ? (
                <Skeleton height="40px" borderRadius="md" />
              ) : (
                <Input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder={t('premium.yourAge')}
                  min="10"
                  max="100"
                  bg={inputBg[colorMode]}
                />
              )}
            </FormControl>

            {/* Gender */}
            <FormControl>
              <FormLabel>{t('premium.gender')}</FormLabel>
              {isLoading ? (
                <Skeleton height="40px" borderRadius="md" />
              ) : (
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  placeholder={t('premium.selectGender')}
                  bg={inputBg[colorMode]}
                >
                  <option value="male">{t('premium.male')}</option>
                  <option value="female">{t('premium.female')}</option>
                  <option value="other">{t('premium.other')}</option>
                  <option value="prefer-not-to-say">{t('premium.preferNotToSay')}</option>
                </Select>
              )}
            </FormControl>

            {/* Height */}
            <FormControl>
              <FormLabel>{t('premium.heightCm')}</FormLabel>
              {isLoading ? (
                <Skeleton height="40px" borderRadius="md" />
              ) : (
                <Input
                  type="number"
                  name="height"
                  value={formData.healthProfile.height}
                  onChange={handleChange}
                  placeholder={t('premium.yourHeight')}
                  min="100"
                  max="250"
                  bg={inputBg[colorMode]}
                />
              )}
            </FormControl>

            {/* Weight */}
            <FormControl>
              <FormLabel>{t('premium.weightKg')}</FormLabel>
              {isLoading ? (
                <Skeleton height="40px" borderRadius="md" />
              ) : (
                <Input
                  type="number"
                  name="weight"
                  value={formData.healthProfile.weight}
                  onChange={handleChange}
                  placeholder={t('premium.yourWeight')}
                  min="30"
                  max="200"
                  bg={inputBg[colorMode]}
                />
              )}
            </FormControl>
          </SimpleGrid>

          {/* Activity Level */}
          <FormControl>
            <FormLabel>{t('premium.activityLevel')}</FormLabel>
            {isLoading ? (
              <Skeleton height="120px" borderRadius="md" />
            ) : (
              <RadioGroup
                value={formData.healthProfile.activityLevel}
                onChange={value => handleChange({ target: { name: 'activityLevel', value } })}
              >
                <Stack direction="column" spacing={3}>
                  <Radio value="sedentary">{t('premium.sedentary')}</Radio>
                  <Radio value="lightly_active">{t('premium.lightlyActive')}</Radio>
                  <Radio value="moderately_active">{t('premium.moderatelyActive')}</Radio>
                  <Radio value="very_active">{t('premium.veryActive')}</Radio>
                  <Radio value="extremely_active">{t('premium.extremelyActive')}</Radio>
                </Stack>
              </RadioGroup>
            )}
          </FormControl>

          {/* Fitness Goal */}
          <FormControl>
            <FormLabel>{t('premium.fitnessGoal')}</FormLabel>
            {isLoading ? (
              <Skeleton height="40px" borderRadius="md" />
            ) : (
              <Select
                name="fitnessGoal"
                value={formData.healthProfile.fitnessGoal}
                onChange={handleChange}
                placeholder={t('premium.selectFitnessGoal')}
                bg={inputBg[colorMode]}
              >
                <option value="weight-loss">{t('premium.weightLoss')}</option>
                <option value="weight-gain">{t('premium.weightGain')}</option>
                <option value="maintenance">{t('premium.maintenance')}</option>
                <option value="muscle-gain">{t('premium.muscleGain')}</option>
                <option value="improve-fitness">{t('premium.improveFitness')}</option>
              </Select>
            )}
          </FormControl>

          {/* Dietary Preferences */}
          <FormControl>
            <FormLabel>{t('premium.dietaryPreferences')}</FormLabel>
            {isLoading || availablePreferences.length === 0 ? (
              <Skeleton height="100px" borderRadius="md" />
            ) : (
              <Wrap spacing={3}>
                {availablePreferences.map(pref => (
                  <WrapItem key={pref.id}>
                    <Button
                      size="sm"
                      variant={
                        formData.healthProfile.dietaryPreferences.includes(pref.id)
                          ? 'solid' 
                          : 'outline'
                      }
                      colorScheme="brand"
                      onClick={() => toggleSelection('dietaryPreferences', pref.id)}
                    >
                      {pref.name}
                    </Button>
                  </WrapItem>
                ))}
              </Wrap>
            )}
          </FormControl>

          {/* Allergies */}
          <FormControl>
            <FormLabel>{t('premium.allergies')}</FormLabel>
            {isLoading || availableAllergies.length === 0 ? (
              <Skeleton height="100px" borderRadius="md" />
            ) : (
              <Wrap spacing={3}>
                {availableAllergies.map(allergy => (
                  <WrapItem key={allergy.id}>
                    <Button
                      size="sm"
                      variant={
                        formData.healthProfile.allergies.includes(allergy.id)
                          ? 'solid' 
                          : 'outline'
                      }
                      colorScheme="red"
                      onClick={() => toggleSelection('allergies', allergy.id)}
                    >
                      {allergy.name}
                    </Button>
                  </WrapItem>
                ))}
              </Wrap>
            )}
          </FormControl>

          <Button
            type="submit"
            colorScheme="brand"
            size="lg"
            mt={6}
            isLoading={isSubmitting}
            loadingText={t('premium.saving')}
            isDisabled={isLoading}
          >
            {t('premium.saveHealthProfile')}
          </Button>
        </VStack>
      </form>
    </Box>
  )
}

export default CommonQuestions