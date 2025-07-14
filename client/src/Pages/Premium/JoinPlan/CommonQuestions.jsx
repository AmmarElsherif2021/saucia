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
  useColorMode,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { useAuthContext } from '../../../Contexts/AuthContext'
import { 
  useUserProfile, 
  useHealthProfile,
  useUserAllergies,
  useDietaryPreferences 
} from '../../../hooks/userHooks'
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
    error: profileError
  } = useUserProfile()
  
  const { 
    data: healthProfile, 
    isLoading: isLoadingHealth,
    error: healthError
  } = useHealthProfile()
  
  // Fetch available options
  const { 
    allergies: availableAllergies,
    isLoading: isLoadingAllergies,
    error: allergiesError
  } = useUserAllergies()
  
  const { 
    preferences: availablePreferences,
    isLoading: isLoadingPreferences,
    error: preferencesError
  } = useDietaryPreferences()

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
    if (userProfile || healthProfile) {
      setFormData({
        age: userProfile?.age?.toString() || '',
        gender: userProfile?.gender || '',
        healthProfile: {
          dietaryPreferences: healthProfile?.dietaryPreferences || [],
          allergies: healthProfile?.allergies || [],
          height: healthProfile?.height?.toString() || '',
          weight: healthProfile?.weight?.toString() || '',
          activityLevel: healthProfile?.activityLevel || 'moderately-active',
          fitnessGoal: healthProfile?.fitnessGoal || 'maintenance',
        },
      })
    }
  }, [userProfile, healthProfile])

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

    try {
      if (!user?.id) throw new Error('User not authenticated')

      // Prepare data
      const profileData = {
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender
      }

      const healthData = {
        dietaryPreferences: formData.healthProfile.dietaryPreferences,
        allergies: formData.healthProfile.allergies,
        height: formData.healthProfile.height ? parseInt(formData.healthProfile.height) : null,
        weight: formData.healthProfile.weight ? parseInt(formData.healthProfile.weight) : null,
        activityLevel: formData.healthProfile.activityLevel,
        fitnessGoal: formData.healthProfile.fitnessGoal
      }

      // In a real app, you would call update APIs here
      // await updateProfile(profileData)
      // await updateHealthProfile(healthData)

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
  const bgColor = { light: 'white', dark: 'gray.800' }
  const borderColor = { light: 'gray.200', dark: 'gray.700' }
  const inputBg = { light: 'white', dark: 'gray.700' }

  if (hasError) {
    return (
      <Box p={6} borderRadius="lg" bg={bgColor[colorMode]} borderWidth="1px" borderColor={borderColor[colorMode]}>
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
      borderWidth="1px"
      borderRadius="lg"
      bg={bgColor[colorMode]}
      borderColor={borderColor[colorMode]}
      boxShadow={colorMode === 'light' ? 'md' : 'dark-lg'}
    >
      <form onSubmit={handleSubmit}>
        <VStack spacing={5} align="stretch">
          <Heading as="h2" size="lg" mb={4} color="brand.500">
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
                  <Radio value="lightly-active">{t('premium.lightlyActive')}</Radio>
                  <Radio value="moderately-active">{t('premium.moderatelyActive')}</Radio>
                  <Radio value="very-active">{t('premium.veryActive')}</Radio>
                  <Radio value="extremely-active">{t('premium.extremelyActive')}</Radio>
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
            {isLoading ? (
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
            {isLoading ? (
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