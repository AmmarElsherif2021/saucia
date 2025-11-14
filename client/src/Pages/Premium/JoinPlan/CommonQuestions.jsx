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
  Badge,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  HStack,
  Icon,
  Tooltip
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
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useI18nContext } from '../../../Contexts/I18nContext'
import { useDataIntegrity, getInitialFormData } from './dataIntegrityUtils'
import { 
  calculateNutritionProfile, 
  canCalculateNutrition 
} from './nutritionCalculator'
import { InfoIcon } from '@chakra-ui/icons'

const CommonQuestions = ({ onComplete }) => {
  const { currentLanguage } = useI18nContext();
  const isArabic = currentLanguage === 'ar';
  const { t } = useTranslation()
  const { user } = useAuthContext()
  const toast = useToast()
  const navigate = useNavigate()
  const { colorMode } = useColorMode()
  const { logDataState, validateFormData, compareArrays } = useDataIntegrity()
  
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
  
  const [formData, setFormData] = useState(getInitialFormData())
  const [formError, setFormError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Calculate nutrition profile dynamically
  const nutritionProfile = useMemo(() => {
    if (!canCalculateNutrition(formData)) return null;
    
    return calculateNutritionProfile({
      weight: parseInt(formData.healthProfile.weight),
      height: parseInt(formData.healthProfile.height),
      age: parseInt(formData.age),
      gender: formData.gender,
      activityLevel: formData.healthProfile.activityLevel,
      fitnessGoal: formData.healthProfile.fitnessGoal
    });
  }, [formData]);

  // Debug all loaded data
  useEffect(() => {
    if (!hasInitialized && (userProfile || healthProfile || userDietaryPreferences || userAllergies)) {
      //console.log('🎯 CommonQuestions - All Data Loaded:');
      logDataState('User Profile', {
        userProfile,
        hasAge: !!userProfile?.age,
        hasGender: !!userProfile?.gender
      });
      
      logDataState('Health Profile', {
        healthProfile,
        hasHeight: !!healthProfile?.height_cm,
        hasWeight: !!healthProfile?.weight_kg,
        activityLevel: healthProfile?.activity_level,
        fitnessGoal: healthProfile?.fitness_goal
      });
      
      logDataState('Dietary Preferences', {
        availableCount: availablePreferences?.length || 0,
        userPreferences: userDietaryPreferences?.length || 0,
        userPreferenceIds: userDietaryPreferences?.map(p => p.preference_id) || []
      });
      
      logDataState('Allergies', {
        availableCount: availableAllergies?.length || 0,
        userAllergies: userAllergies?.length || 0,
        userAllergyIds: userAllergies?.map(a => a.allergy_id) || []
      });
    }
  }, [userProfile, healthProfile, userDietaryPreferences, userAllergies, availablePreferences, availableAllergies, hasInitialized, logDataState])

  // Initialize form with user data
  const initializeFormData = useCallback(() => {
    if (!userProfile && !healthProfile && !userDietaryPreferences && !userAllergies) {
      //console.log('⏳ Waiting for data to initialize form...');
      return;
    }

    //console.log('🔄 Initializing form with user data...');
    
    const newFormData = getInitialFormData();

    if (userProfile) {
      newFormData.age = userProfile?.age?.toString() || '';
      newFormData.gender = userProfile?.gender || '';
    }

    if (healthProfile) {
      newFormData.healthProfile = {
        ...newFormData.healthProfile,
        height: healthProfile?.height_cm?.toString() || '',
        weight: healthProfile?.weight_kg?.toString() || '',
        activityLevel: healthProfile?.activity_level || 'moderately_active',
        fitnessGoal: healthProfile?.fitness_goal || 'maintenance',
      };
    }

    if (userDietaryPreferences && Array.isArray(userDietaryPreferences)) {
      const preferenceIds = userDietaryPreferences
        .map(p => p.preference_id)
        .filter(id => id != null);
      newFormData.healthProfile.dietaryPreferences = preferenceIds;
      //console.log('📋 Setting dietary preferences:', preferenceIds);
    }

    if (userAllergies && Array.isArray(userAllergies)) {
      const allergyIds = userAllergies
        .map(a => a.allergy_id)
        .filter(id => id != null);
      newFormData.healthProfile.allergies = allergyIds;
      //console.log('⚠️ Setting allergies:', allergyIds);
    }

    setFormData(newFormData);
    setHasInitialized(true);
    
    //console.log('✅ Form initialized with:', newFormData);
  }, [userProfile, healthProfile, userDietaryPreferences, userAllergies]);

  useEffect(() => {
    initializeFormData();
  }, [initializeFormData]);

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
      
      //console.log(`🔄 ${type} updated:`, newValues);
      
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

    //console.log('🚀 Submitting form data:', formData);

    try {
      if (!user?.id) throw new Error('User not authenticated')

      const validation = validateFormData(formData, ['age', 'gender'])
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      const updates = {
        profile: false,
        health: false,
        allergies: false,
        preferences: false
      };

      // Update user profile
      const profileData = {}
      const ageValue = formData.age ? parseInt(formData.age) : null
      
      if (ageValue !== userProfile?.age) {
        profileData.age = ageValue
        updates.profile = true
      }
      if (formData.gender && formData.gender !== userProfile?.gender) {
        profileData.gender = formData.gender
        updates.profile = true
      }

      if (updates.profile) {
        //console.log('👤 Updating profile:', profileData);
        await updateProfile(profileData)
      }

      // Update health profile
      const healthData = {}
      const heightValue = formData.healthProfile.height ? parseInt(formData.healthProfile.height) : null
      const weightValue = formData.healthProfile.weight ? parseInt(formData.healthProfile.weight) : null
      
      if (heightValue !== healthProfile?.height_cm) {
        healthData.height_cm = heightValue
        updates.health = true
      }
      if (weightValue !== healthProfile?.weight_kg) {
        healthData.weight_kg = weightValue
        updates.health = true
      }
      if (formData.healthProfile.activityLevel !== healthProfile?.activity_level) {
        healthData.activity_level = formData.healthProfile.activityLevel
        updates.health = true
      }
      if (formData.healthProfile.fitnessGoal !== healthProfile?.fitness_goal) {
        healthData.fitness_goal = formData.healthProfile.fitnessGoal
        updates.health = true
      }

      if (updates.health) {
        //console.log('💪 Updating health profile:', healthData);
        await updateHealthProfile(healthData)
      }

      // Update allergies
      const currentAllergyIds = userAllergies?.map(a => a.allergy_id) || []
      const newAllergyIds = formData.healthProfile.allergies
      
      if (!compareArrays(currentAllergyIds, newAllergyIds)) {
        const allergiesData = newAllergyIds.map(allergyId => ({
          allergy_id: allergyId,
          severity_override: 1
        }))
        //console.log('⚠️ Updating allergies:', allergiesData);
        await bulkUpdateAllergies(allergiesData)
        updates.allergies = true
      }

      // Update dietary preferences
      const currentPrefIds = userDietaryPreferences?.map(p => p.preference_id) || []
      const newPrefIds = formData.healthProfile.dietaryPreferences
      
      if (!compareArrays(currentPrefIds, newPrefIds)) {
        const preferencesData = newPrefIds.map(prefId => ({
          preference_id: prefId
        }))
        //console.log('📋 Updating dietary preferences:', preferencesData);
        await bulkUpdatePreferences(preferencesData)
        updates.preferences = true
      }

      //console.log('✅ All updates completed:', updates);

      toast({
        title: t('profile.profileUpdated'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      onComplete?.()
      navigate('/checkout-plan')
    } catch (error) {
      console.error('❌ Update error:', error)
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

  const isLoading = isLoadingProfile || isLoadingHealth || 
                   isLoadingAllergies || isLoadingPreferences

  const hasError = profileError || healthError || 
                  allergiesError || preferencesError

  // useEffect(() => {
  //   if (isLoading) {
  //     //console.log('⏳ CommonQuestions Loading States:', {
  //       isLoadingProfile,
  //       isLoadingHealth,
  //       isLoadingAllergies,
  //       isLoadingPreferences
  //     });
  //   }
  // }, [isLoading, isLoadingProfile, isLoadingHealth, isLoadingAllergies, isLoadingPreferences]);

  // Theme variables
  const bgColor = { light: 'white', dark: 'gray.800' }
  const borderColor = { light: 'brand.300', dark: 'brand.500' }
  const inputBg = { light: 'white', dark: 'gray.700' }
  const cardBg = { light: 'brand.100', dark: 'gray.700' }
  const statBg = { light: 'brand.50', dark: 'gray.600' }

  if (hasError) {
    console.error('❌ CommonQuestions Errors:', {
      profileError,
      healthError,
      allergiesError,
      preferencesError
    });
    
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

            {process.env.NODE_ENV === 'development' && (
              <Alert status="info" size="sm" fontSize="xs">
                <AlertIcon />
                Data: {hasInitialized ? '✅ Loaded' : '⏳ Loading'} | 
                Profile: {userProfile ? '✅' : '⏳'} | 
                Health: {healthProfile ? '✅' : '⏳'} | 
                Prefs: {userDietaryPreferences ? '✅' : '⏳'} | 
                Allergies: {userAllergies ? '✅' : '⏳'}
              </Alert>
            )}

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={5}>
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

            {/* Nutrition Profile Display */}
            
            {nutritionProfile && (
              <Box
                bg={statBg[colorMode]}
                p={5}
                borderRadius="lg"
                borderWidth="2px"
                borderColor="brand.400"
              >
                <HStack mb={3}>
                  <Heading size="md" color="brand.700">
                    {t('premium.nutritionTarget')}
                  </Heading>
                  <Tooltip 
                    label={t('premium.nutritionTooltip')}
                    placement="top"
                  >
                    <Icon as={InfoIcon} color="brand.500" />
                  </Tooltip>
                </HStack>
                
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  <Stat>
                    <StatLabel fontSize="sm">{t('premium.bmr')}</StatLabel>
                    <StatNumber color="brand.700">{nutritionProfile.bmr}</StatNumber>
                    <StatHelpText fontSize="xs">{t('premium.bmrHelp')}</StatHelpText>
                  </Stat>
                  
                  <Stat>
                    <StatLabel fontSize="sm">{t('premium.tdee')}</StatLabel>
                    <StatNumber color="brand.700">{nutritionProfile.tdee}</StatNumber>
                    <StatHelpText fontSize="xs">{t('premium.tdeeHelp')}</StatHelpText>
                  </Stat>
                  
                  <Stat>
                    <StatLabel fontSize="sm">{t('premium.targetCalories')}</StatLabel>
                    <StatNumber color="green.600">{nutritionProfile.dailyCalories}</StatNumber>
                    <StatHelpText fontSize="xs">{t('premium.targetCaloriesHelp')}</StatHelpText>
                  </Stat>
                  
                  <Stat>
                    <StatLabel fontSize="sm">{t('premium.adjustment')}</StatLabel>
                    <StatNumber color="teal.600">
                      {nutritionProfile.calculations.goalAdjustment > 0 ? '+' : ''}
                      {(nutritionProfile.calculations.goalAdjustment * 100).toFixed(0)}%
                    </StatNumber>
                    <StatHelpText fontSize="xs">{t('premium.adjustmentHelp')}</StatHelpText>
                  </Stat>
                </SimpleGrid>
                
                <Divider my={4} borderColor="brand.300" />
                
                <Text fontWeight="semibold" mb={3} color="brand.800">
                  {t('premium.dailyMacros')}
                </Text>
                
                <SimpleGrid columns={{ base: 3 }} spacing={4}>
                  <Stat>
                    <StatLabel fontSize="sm" color="blue.600">{t('premium.protein')}</StatLabel>
                    <StatNumber fontSize="2xl" color="blue.700">
                      {nutritionProfile.macros.protein}g
                    </StatNumber>
                    <StatHelpText fontSize="xs">
                      {(nutritionProfile.calculations.macroRatios.protein * 100).toFixed(0)}%
                    </StatHelpText>
                  </Stat>
                  
                  <Stat>
                    <StatLabel fontSize="sm" color="orange.600">{t('premium.carbs')}</StatLabel>
                    <StatNumber fontSize="2xl" color="orange.700">
                      {nutritionProfile.macros.carbs}g
                    </StatNumber>
                    <StatHelpText fontSize="xs">
                      {(nutritionProfile.calculations.macroRatios.carbs * 100).toFixed(0)}%
                    </StatHelpText>
                  </Stat>
                  
                  <Stat>
                    <StatLabel fontSize="sm" color="purple.600">{t('premium.fat')}</StatLabel>
                    <StatNumber fontSize="2xl" color="purple.700">
                      {nutritionProfile.macros.fat}g
                    </StatNumber>
                    <StatHelpText fontSize="xs">
                      {(nutritionProfile.calculations.macroRatios.fat * 100).toFixed(0)}%
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>
                
                <Alert status="info" mt={4} borderRadius="md" fontSize="sm">
                  <AlertIcon />
                  <Text>
                    {t('premium.nutritionDisclaimer')}
                  </Text>
                </Alert>
              </Box>
            )}

            <FormControl>
              <FormLabel color="brand.800">
                {t('premium.dietaryPreferences')} 
                {hasInitialized && (
                  <Badge ml={2} colorScheme="brand">
                    {formData.healthProfile.dietaryPreferences.length} selected
                  </Badge>
                )}
              </FormLabel>
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

            <FormControl>
              <FormLabel color="brand.800">
                {t('premium.allergies')}
                {hasInitialized && (
                  <Badge ml={2} colorScheme="red">
                    {formData.healthProfile.allergies.length} selected
                  </Badge>
                )}
              </FormLabel>
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
              isDisabled={isLoading || !hasInitialized}
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