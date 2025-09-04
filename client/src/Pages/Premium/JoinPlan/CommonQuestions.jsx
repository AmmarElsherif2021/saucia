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
  Card,
  CardBody,
} from '@chakra-ui/react'
import { useAuthContext } from '../../../Contexts/AuthContext'
import { 
  useUserProfile, 
  useHealthProfile
} from '../../../Hooks/userHooks'
import { useUserAllergies } from '../../../Hooks/useUserAllergies' 
import { useUserDietaryPreferences } from '../../../Hooks/useUserDietaryPreferences'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { useI18nContext } from '../../../Contexts/I18nContext'

const CommonQuestions = ({ onComplete }) => {
  const {currentLanguage}=useI18nContext();
  const isArabic = currentLanguage === 'ar';
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
    bulkUpdatePreferences,
    dietaryPreferences: availablePreferences,
    userDietaryPreferences,
    isLoading: isLoadingPreferences,
    error: preferencesError
  } = useUserDietaryPreferences()
  
  const { 
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
    if (userProfile || healthProfile || userDietaryPreferences || userAllergies) {
      setFormData(prev => ({
        ...prev,
        age: userProfile?.age?.toString() || '',
        gender: userProfile?.gender || '',
        healthProfile: {
          ...prev.healthProfile,
          // Map userDietaryPreferences to IDs
          dietaryPreferences: userDietaryPreferences?.map(p => p.preference_id) || [],
          // Map userAllergies to IDs
          allergies: userAllergies?.map(a => a.allergy_id) || [],
          height: healthProfile?.height_cm?.toString() || '',
          weight: healthProfile?.weight_kg?.toString() || '',
          activityLevel: healthProfile?.activity_level || 'moderately-active',
          fitnessGoal: healthProfile?.fitness_goal || 'maintenance',
        },
      }))
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

    try {
      if (!user?.id) throw new Error('User not authenticated')

      // Step 1: Update user profile first
      const profileData = {}
      if (formData.age && formData.age !== userProfile?.age?.toString()) {
        profileData.age = parseInt(formData.age)
      }
      if (formData.gender && formData.gender !== userProfile?.gender) {
        profileData.gender = formData.gender
      }

      if (Object.keys(profileData).length > 0) {
        await updateProfile(profileData)
      }

      // Step 2: Update health profile (this will create if it doesn't exist)
      const healthData = {}
      const heightValue = formData.healthProfile.height ? parseInt(formData.healthProfile.height) : null
      const weightValue = formData.healthProfile.weight ? parseInt(formData.healthProfile.weight) : null
      
      if (heightValue !== healthProfile?.height_cm) {
        healthData.height_cm = heightValue
      }
      if (weightValue !== healthProfile?.weight_kg) {
        healthData.weight_kg = weightValue
      }
      if (formData.healthProfile.activityLevel !== healthProfile?.activity_level) {
        healthData.activity_level = formData.healthProfile.activityLevel
      }
      if (formData.healthProfile.fitnessGoal !== healthProfile?.fitness_goal) {
        healthData.fitness_goal = formData.healthProfile.fitnessGoal
      }

      if (Object.keys(healthData).length > 0) {
        await updateHealthProfile(healthData)
      }

      // Step 3: Update allergies (only if there are changes)
      const currentAllergyIds = userAllergies?.map(a => a.allergy_id) || []
      const newAllergyIds = formData.healthProfile.allergies
      
      if (JSON.stringify(currentAllergyIds.sort()) !== JSON.stringify(newAllergyIds.sort())) {
        const allergiesData = newAllergyIds.map(allergyId => ({
          allergy_id: allergyId,
          severity_override: 1
        }))
        await bulkUpdateAllergies(allergiesData)
      }

      // Step 4: Update dietary preferences (only if there are changes)
      const currentPrefIds = userDietaryPreferences?.map(p => p.preference_id) || []
      const newPrefIds = formData.healthProfile.dietaryPreferences
      
      if (JSON.stringify(currentPrefIds.sort()) !== JSON.stringify(newPrefIds.sort())) {
        const preferencesData = newPrefIds.map(prefId => ({
          preference_id: prefId
        }))
        await bulkUpdatePreferences(preferencesData)
      }

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
      const errorMessage = error.message || t('premium.errorUpdatingProfile')
      setFormError(errorMessage)
      toast({
        title: t('premium.error'),
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Loading states - wait for all critical data to load
  const isLoading = isLoadingProfile || isLoadingHealth || 
                   isLoadingAllergies || isLoadingPreferences

  // Error states
  const hasError = profileError || healthError || 
                  allergiesError || preferencesError

  // Theme variables
  const bgColor = { light: 'white', dark: 'gray.800' }
  const borderColor = { light: 'brand.300', dark: 'brand.500' }
  const inputBg = { light: 'white', dark: 'gray.700' }
  const cardBg = { light: 'brand.100', dark: 'gray.700' }

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
    <Card 
      maxW="800px"
      mx="auto"
      mt={8}
      p={[4, 6]}
      variant="outlined"
      bg={cardBg[colorMode]}
      borderWidth={2}
      borderColor={borderColor[colorMode]}
    >
      <CardBody>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            <Heading as="h2" size="lg" mb={2} color="brand.700" textAlign={isArabic ? "right" : "left"}>
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
                <FormLabel color="brand.800">{t('premium.age')}</FormLabel>
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
                    borderColor="brand.300"
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                  />
                )}
              </FormControl>

              {/* Gender */}
              <FormControl>
                <FormLabel color="brand.800">{t('premium.gender')}</FormLabel>
                {isLoading ? (
                  <Skeleton height="40px" borderRadius="md" />
                ) : (
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    placeholder={t('premium.selectGender')}
                    bg={inputBg[colorMode]}
                    borderColor="brand.300"
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
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
                <FormLabel color="brand.800">{t('premium.heightCm')}</FormLabel>
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
                    borderColor="brand.300"
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                  />
                )}
              </FormControl>

              {/* Weight */}
              <FormControl>
                <FormLabel color="brand.800">{t('premium.weightKg')}</FormLabel>
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
                    borderColor="brand.300"
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                  />
                )}
              </FormControl>
            </SimpleGrid>

            {/* Activity Level */}
            <FormControl>
              <FormLabel color="brand.800">{t('premium.activityLevel')}</FormLabel>
              {isLoading ? (
                <Skeleton height="120px" borderRadius="md" />
              ) : (
                <RadioGroup
                  value={formData.healthProfile.activityLevel}
                  onChange={value => handleChange({ target: { name: 'activityLevel', value } })}
                >
                  <Stack direction="column" spacing={3}>
                    <Radio value="sedentary" colorScheme="brand">{t('premium.sedentary')}</Radio>
                    <Radio value="lightly_active" colorScheme="brand">{t('premium.lightlyActive')}</Radio>
                    <Radio value="moderately_active" colorScheme="brand">{t('premium.moderatelyActive')}</Radio>
                    <Radio value="very_active" colorScheme="brand">{t('premium.veryActive')}</Radio>
                    <Radio value="extremely_active" colorScheme="brand">{t('premium.extremelyActive')}</Radio>
                  </Stack>
                </RadioGroup>
              )}
            </FormControl>

            {/* Fitness Goal */}
            <FormControl>
              <FormLabel color="brand.800">{t('premium.fitnessGoal')}</FormLabel>
              {isLoading ? (
                <Skeleton height="40px" borderRadius="md" />
              ) : (
                <Select
                  name="fitnessGoal"
                  value={formData.healthProfile.fitnessGoal}
                  onChange={handleChange}
                  placeholder={t('premium.selectFitnessGoal')}
                  bg={inputBg[colorMode]}
                  borderColor="brand.300"
                  _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
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
              <FormLabel color="brand.800">{t('premium.dietaryPreferences')}</FormLabel>
              {isLoading || !availablePreferences || availablePreferences.length === 0 ? (
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
                        {isArabic ? pref.name_arabic : pref.name}
                      </Button>
                    </WrapItem>
                  ))}
                </Wrap>
              )}
            </FormControl>

            {/* Allergies */}
            <FormControl>
              <FormLabel color="brand.800">{t('premium.allergies')}</FormLabel>
              {isLoading || !availableAllergies || availableAllergies.length === 0 ? (
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
                        {isArabic ? allergy.name_arabic : allergy.name}
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
              mt={4}
              isLoading={isSubmitting}
              loadingText={t('premium.saving')}
              isDisabled={isLoading}
            >
              {t('premium.saveHealthProfile')}
            </Button>
          </VStack>
        </form>
      </CardBody>
    </Card>
  )
}

export default CommonQuestions