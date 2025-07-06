import { useState, useEffect } from 'react'
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
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { useAuthContext } from '../../../Contexts/AuthContext'
import { useUserProfile, useHealthProfile } from '../../../hooks/userHooks'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'

const CommonQuestions = ({ onComplete }) => {
  const { t } = useTranslation()
  const { user } = useAuthContext()
  const toast = useToast()
  const navigate = useNavigate()
  
  // Use the custom hooks
  const { 
    data: userProfile, 
    updateProfile, 
    isUpdatingProfile 
  } = useUserProfile()
  
  const { 
    data: healthProfile, 
    updateHealthProfile, 
    isUpdatingHealthProfile 
  } = useHealthProfile()

  const [formError, setFormError] = useState(null)

  // Predefined options
  const dietaryPreferencesOptions = [
    { value: 'vegetarian', label: t('premium.vegetarian') || 'Vegetarian' },
    { value: 'vegan', label: t('premium.vegan') || 'Vegan' },
    { value: 'pescatarian', label: t('premium.pescatarian') || 'Pescatarian' },
    { value: 'keto', label: t('premium.keto') || 'Ketogenic' },
    { value: 'paleo', label: t('premium.paleo') || 'Paleo' },
    { value: 'mediterranean', label: t('premium.mediterranean') || 'Mediterranean' },
    { value: 'low-carb', label: t('premium.lowCarb') || 'Low Carb' },
    { value: 'gluten-free', label: t('premium.glutenFree') || 'Gluten Free' },
    { value: 'dairy-free', label: t('premium.dairyFree') || 'Dairy Free' },
    { value: 'halal', label: t('premium.halal') || 'Halal' },
    { value: 'kosher', label: t('premium.kosher') || 'Kosher' },
    { value: 'none', label: t('premium.none') || 'None' },
  ]

  const allergiesOptions = [
    { value: 'nuts', label: t('premium.nuts') || 'Nuts' },
    { value: 'peanuts', label: t('premium.peanuts') || 'Peanuts' },
    { value: 'shellfish', label: t('premium.shellfish') || 'Shellfish' },
    { value: 'fish', label: t('premium.fish') || 'Fish' },
    { value: 'eggs', label: t('premium.eggs') || 'Eggs' },
    { value: 'milk', label: t('premium.milk') || 'Milk/Dairy' },
    { value: 'soy', label: t('premium.soy') || 'Soy' },
    { value: 'wheat', label: t('premium.wheat') || 'Wheat' },
    { value: 'sesame', label: t('premium.sesame') || 'Sesame' },
    { value: 'sulfites', label: t('premium.sulfites') || 'Sulfites' },
    { value: 'none', label: t('premium.none') || 'None' },
  ]

  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    healthProfile: {
      dietaryPreferences: ['none'],
      allergies: ['none'],
      height: '',
      weight: '',
      activityLevel: 'moderately-active',
      fitnessGoal: 'maintenance',
    },
  })

  // Initialize form with user data from hooks
  useEffect(() => {
    if (userProfile || healthProfile) {
      const newFormData = {
        age: userProfile?.age != null ? userProfile.age.toString() : '',
        gender: userProfile?.gender || '',
        healthProfile: {
          dietaryPreferences:
            Array.isArray(healthProfile?.dietaryPreferences) &&
            healthProfile.dietaryPreferences.length > 0
              ? healthProfile.dietaryPreferences
              : ['none'],
          allergies:
            Array.isArray(healthProfile?.allergies) && 
            healthProfile.allergies.length > 0
              ? healthProfile.allergies
              : ['none'],
          height: healthProfile?.height != null ? healthProfile.height.toString() : '',
          weight: healthProfile?.weight != null ? healthProfile.weight.toString() : '',
          activityLevel: healthProfile?.activityLevel || 'moderately-active',
          fitnessGoal: healthProfile?.fitnessGoal || 'maintenance',
        },
      }

      setFormData(newFormData)
      console.log('Health profile initialized:', newFormData)
    }
  }, [userProfile, healthProfile])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'age' || name === 'gender') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        healthProfile: {
          ...prev.healthProfile,
          [name]: value,
        },
      }))
    }
  }

  const handleDietaryPreferencesChange = (values) => {
    // If 'none' is selected, only keep 'none'
    if (values.includes('none')) {
      setFormData((prev) => ({
        ...prev,
        healthProfile: {
          ...prev.healthProfile,
          dietaryPreferences: ['none'],
        },
      }))
    } else {
      // If other values are selected, remove 'none'
      const filteredValues = values.filter((v) => v !== 'none')
      setFormData((prev) => ({
        ...prev,
        healthProfile: {
          ...prev.healthProfile,
          dietaryPreferences: filteredValues.length > 0 ? filteredValues : ['none'],
        },
      }))
    }
  }

  const handleAllergiesChange = (values) => {
    // If 'none' is selected, only keep 'none'
    if (values.includes('none')) {
      setFormData((prev) => ({
        ...prev,
        healthProfile: {
          ...prev.healthProfile,
          allergies: ['none'],
        },
      }))
    } else {
      // If other values are selected, remove 'none'
      const filteredValues = values.filter((v) => v !== 'none')
      setFormData((prev) => ({
        ...prev,
        healthProfile: {
          ...prev.healthProfile,
          allergies: filteredValues.length > 0 ? filteredValues : ['none'],
        },
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    try {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // Prepare user profile data
      const userProfileData = {
        age: formData.age ? parseInt(formData.age, 10) : null,
        gender: formData.gender || '',
      }

      // Prepare health profile data
      const healthProfileData = {
        dietaryPreferences: formData.healthProfile.dietaryPreferences || ['none'],
        allergies: formData.healthProfile.allergies || ['none'],
        height: formData.healthProfile.height
          ? parseInt(formData.healthProfile.height, 10)
          : null,
        weight: formData.healthProfile.weight
          ? parseInt(formData.healthProfile.weight, 10)
          : null,
        activityLevel: formData.healthProfile.activityLevel || 'moderately-active',
        fitnessGoal: formData.healthProfile.fitnessGoal || 'maintenance',
      }

      console.log('Updating user profile with data:', userProfileData)
      console.log('Updating health profile with data:', healthProfileData)

      // Update both user profile and health profile using hooks
      await Promise.all([
        updateProfile(userProfileData),
        updateHealthProfile(healthProfileData)
      ])

      toast({
        title: t('profile.profileUpdated'),
        status: 'success',
        duration: 5000,
        isClosable: false,
      })

      if (onComplete) {
        navigate('/checkout-plan')
        onComplete()
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setFormError(error.message || 'Failed to update profile')
      toast({
        title: t('premium.error'),
        description: error.message || t('premium.errorUpdatingProfile'),
        status: 'error',
        duration: 5000,
        isClosable: false,
      })
    }
  }

  // Check if either update is in progress
  const isSubmitting = isUpdatingProfile || isUpdatingHealthProfile

  return (
    <Box
      maxW="800px"
      mx="auto"
      mt="8"
      p="6"
      borderWidth="1px"
      borderRadius="lg"
      backgroundColor={'brand.100'}
    >
      <form onSubmit={handleSubmit}>
        <VStack spacing="4">
          <Heading as="h2" size="lg" mb="4">
            {t('premium.healthProfile')}
          </Heading>

          {formError && (
            <Box w="full" p="3" bg="red.50" color="red.600" borderRadius="md">
              <Text fontWeight="medium">{formError}</Text>
            </Box>
          )}

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4" w="full">
            <FormControl maxW={'90%'} mx={8}>
              <FormLabel>{t('premium.age')}</FormLabel>
              <Input
                variant={'ghost'}
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder={t('premium.yourAge')}
                min="10"
                max="100"
                maxW={'90%'}
              />
            </FormControl>

            <FormControl maxW={'90%'} mx={8}>
              <FormLabel>{t('premium.gender')}</FormLabel>
              <Select
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                placeholder={t('premium.selectGender')}
                maxW={'95%'}
                variant={'outline'}
                px={3}
                mx={1}
              >
                <option value="male">{t('premium.male')}</option>
                <option value="female">{t('premium.female')}</option>
                <option value="other">{t('premium.other')}</option>
                <option value="prefer-not-to-say">{t('premium.preferNotToSay')}</option>
              </Select>
            </FormControl>

            <FormControl maxW={'90%'} mx={8}>
              <FormLabel>{t('premium.heightCm')}</FormLabel>
              <Input
                variant={'ghost'}
                type="number"
                name="height"
                value={formData.healthProfile.height}
                onChange={handleChange}
                placeholder={t('premium.yourHeight')}
                min="100"
                max="250"
                maxW={'90%'}
                backgroundColor={'white'}
              />
            </FormControl>

            <FormControl maxW={'90%'} mx={8}>
              <FormLabel>{t('premium.weightKg')}</FormLabel>
              <Input
                variant={'ghost'}
                type="number"
                name="weight"
                value={formData.healthProfile.weight}
                onChange={handleChange}
                placeholder={t('premium.yourWeight')}
                min="30"
                max="200"
                maxW={'90%'}
                backgroundColor={'white'}
              />
            </FormControl>
          </SimpleGrid>

          <FormControl maxW={'90%'} mx={8}>
            <FormLabel>{t('premium.activityLevel')}</FormLabel>
            <RadioGroup
              value={formData.healthProfile.activityLevel || 'moderately-active'}
              onChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  healthProfile: {
                    ...prev.healthProfile,
                    activityLevel: value,
                  },
                }))
              }
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

          <FormControl maxW={'90%'} mx={8}>
            <FormLabel>{t('premium.fitnessGoal')}</FormLabel>
            <Select
              name="fitnessGoal"
              value={formData.healthProfile.fitnessGoal || 'maintenance'}
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

          <FormControl maxW={'90%'} mx={8}>
            <FormLabel>{t('premium.dietaryPreferences')}</FormLabel>
            <Wrap spacing={3}>
              {dietaryPreferencesOptions.map((option) => (
                <WrapItem key={option.value}>
                  <Button
                    size="sm"
                    variant={
                      formData.healthProfile.dietaryPreferences.includes(option.value)
                        ? 'solid'
                        : 'outline'
                    }
                    colorScheme={
                      formData.healthProfile.dietaryPreferences.includes(option.value)
                        ? 'brand'
                        : 'gray'
                    }
                    onClick={() => {
                      const currentValues = formData.healthProfile.dietaryPreferences
                      let newValues

                      if (option.value === 'none') {
                        // If clicking 'none', set only 'none'
                        newValues = currentValues.includes('none') ? [] : ['none']
                      } else {
                        // If clicking any other option
                        if (currentValues.includes(option.value)) {
                          // Remove the option
                          newValues = currentValues.filter((v) => v !== option.value)
                        } else {
                          // Add the option and remove 'none' if present
                          newValues = [...currentValues.filter((v) => v !== 'none'), option.value]
                        }
                      }

                      // Ensure we always have at least 'none' if nothing else is selected
                      if (newValues.length === 0) {
                        newValues = ['none']
                      }

                      handleDietaryPreferencesChange(newValues)
                    }}
                  >
                    {option.label}
                  </Button>
                </WrapItem>
              ))}
            </Wrap>
          </FormControl>

          <FormControl maxW={'90%'} mx={8}>
            <FormLabel>{t('premium.allergies')}</FormLabel>
            <Wrap spacing={3}>
              {allergiesOptions.map((option) => (
                <WrapItem key={option.value}>
                  <Button
                    size="sm"
                    variant={
                      formData.healthProfile.allergies.includes(option.value) ? 'solid' : 'outline'
                    }
                    colorScheme={
                      formData.healthProfile.allergies.includes(option.value) ? 'red' : 'gray'
                    }
                    onClick={() => {
                      const currentValues = formData.healthProfile.allergies
                      let newValues

                      if (option.value === 'none') {
                        // If clicking 'none', set only 'none'
                        newValues = currentValues.includes('none') ? [] : ['none']
                      } else {
                        // If clicking any other option
                        if (currentValues.includes(option.value)) {
                          // Remove the option
                          newValues = currentValues.filter((v) => v !== option.value)
                        } else {
                          // Add the option and remove 'none' if present
                          newValues = [...currentValues.filter((v) => v !== 'none'), option.value]
                        }
                      }

                      // Ensure we always have at least 'none' if nothing else is selected
                      if (newValues.length === 0) {
                        newValues = ['none']
                      }

                      handleAllergiesChange(newValues)
                    }}
                  >
                    {option.label}
                  </Button>
                </WrapItem>
              ))}
            </Wrap>
          </FormControl>

          <Button
            type="submit"
            colorScheme="brand"
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
  )
}

export default CommonQuestions