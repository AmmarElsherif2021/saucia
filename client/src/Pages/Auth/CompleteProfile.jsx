import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useAuthContext } from '../../Contexts/AuthContext';
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
  Spinner,
  Select,
  Grid,
  GridItem,
  useToast,
  Card,
  CardBody,
  Progress,
  Icon,
  Flex,
  Container,
  useBreakpointValue,
  Stack,
  FormErrorMessage,
  InputGroup,
  InputLeftElement,
  ScaleFade,
  Badge,
  Divider,
  HStack,
  useColorMode
} from '@chakra-ui/react';
import { FiUser, FiPhone, FiCalendar, FiUsers, FiGlobe, FiClock, FiCheck, FiCheckCircle } from 'react-icons/fi';
import { useI18nContext } from '../../Contexts/I18nContext';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '../../Hooks/userHooks';

// Centralized configuration and mock data
const PROFILE_CONFIG = {
  // Mock data for testing
  mockData: {
    firstName: 'John',
    lastName: 'Doe',
    phone: '+966512345678',
    age: '30',
    gender: 'male',
    language: 'en',
    timezone: 'Asia/Riyadh'
  },
  
  // Field configurations
  fields: {
    firstName: { 
      labelKey: 'firstName', 
      icon: FiUser, 
      required: true, 
      type: 'text',
      validation: (value) => {
        if (!value.trim()) return 'firstNameRequired';
        if (value.trim().length < 2) return 'firstNameMinLength';
        return '';
      }
    },
    lastName: { 
      labelKey: 'lastName', 
      icon: FiUser, 
      required: true, 
      type: 'text',
      validation: (value) => {
        if (!value.trim()) return 'lastNameRequired';
        if (value.trim().length < 2) return 'lastNameMinLength';
        return '';
      }
    },
    phone: { 
      labelKey: 'phoneNumber', 
      icon: FiPhone, 
      required: true, 
      type: 'tel',
      validation: (value) => {
        if (!value.trim()) return 'phoneRequired';
        if (!/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''))) {
          return 'phoneInvalid';
        }
        return '';
      }
    },
    age: { 
      labelKey: 'age', 
      icon: FiCalendar, 
      required: false, 
      type: 'number',
      validation: (value) => {
        if (value && (parseInt(value) < 1 || parseInt(value) > 150)) {
          return 'ageInvalid';
        }
        return '';
      }
    },
    gender: { 
      labelKey: 'gender', 
      icon: FiUsers, 
      required: false, 
      type: 'select',
      options: [
        { value: '', labelKey: 'selectGender' },
        { value: 'male', labelKey: 'male' },
        { value: 'female', labelKey: 'female' },
        { value: 'other', labelKey: 'other' },
        { value: 'prefer_not_to_say', labelKey: 'preferNotToSay' }
      ]
    },
    language: { 
      labelKey: 'language', 
      icon: FiGlobe, 
      required: false, 
      type: 'select',
      options: [
        { value: 'en', labelKey: 'english' },
        { value: 'ar', labelKey: 'arabic' }
      ]
    },
    timezone: { 
      labelKey: 'timezone', 
      icon: FiClock, 
      required: false, 
      type: 'select',
      options: [
        { value: 'Asia/Riyadh', labelKey: 'riyadhTimezone' }
      ]
    }
  },
  
  // Required fields for progress calculation
  requiredFields: ['firstName', 'lastName', 'phone'],
  
  // Initial form state
  initialFormData: {
    firstName: '',
    lastName: '',
    phone: '',
    age: '',
    gender: '',
    language: 'en',
    timezone: 'Asia/Riyadh'
  }
};

// Helper function to extract form data from user profile
const extractFormDataFromProfile = (userProfile) => {
  if (!userProfile) return PROFILE_CONFIG.initialFormData;

  // Split display_name into first and last name
  const displayName = userProfile.display_name || '';
  const nameParts = displayName.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    firstName: firstName,
    lastName: lastName,
    phone: userProfile.phone_number || '',
    age: userProfile.age ? userProfile.age.toString() : '',
    gender: userProfile.gender || '',
    language: userProfile.language || 'en',
    timezone: userProfile.timezone || 'Asia/Riyadh'
  };
};

// Transform form data to match database schema
const transformFormDataForAPI = (formData) => {
  return {
    display_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
    phone_number: formData.phone.trim(),
    age: formData.age ? parseInt(formData.age) : null,
    gender: formData.gender || null,
    language: formData.language,
    timezone: formData.timezone
  };
};

const CompleteProfile = ({ useMockData = false }) => {
  const navigate = useNavigate();
  const { user, completeProfile, consumePendingRedirect } = useAuth();
  const {data: userProfile} = useUserProfile();
  const { currentLanguage } = useI18nContext();
  const { t } = useTranslation();
  const toast = useToast();
  const { colorMode } = useColorMode();
  const isArabic = currentLanguage === 'ar';

  // Responsive values
  const cardPadding = useBreakpointValue({ base: 4, md: 6, lg: 8 });
  const headerPadding = useBreakpointValue({ base: 4, md: 6 });
  const containerPadding = useBreakpointValue({ base: 4, md: 6, lg: 8 });
  const gridColumns = useBreakpointValue({ base: "1fr", md: "repeat(2, 1fr)" });
  const cardMaxWidth = useBreakpointValue({ base: "100%", md: "2xl", lg: "4xl" });
  const buttonSize = useBreakpointValue({ base: "md", md: "lg" });
  const inputSize = useBreakpointValue({ base: "md", md: "lg" });
  
  const [formData, setFormData] = useState(PROFILE_CONFIG.initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [progress, setProgress] = useState(0);
  const [touchedFields, setTouchedFields] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize form data when userProfile is available or when using mock data
  useEffect(() => {
    if (useMockData) {
      setFormData(PROFILE_CONFIG.mockData);
    } else if (userProfile) {
      const extractedData = extractFormDataFromProfile(userProfile);
      setFormData(extractedData);
      
      // Check if profile is already completed
      if (userProfile.profile_completed) {
        setIsCompleted(true);
      }
    }
  }, [userProfile, useMockData]);

  // Translation helper for error messages
  const getTranslatedError = (errorKey) => {
    const errorMessages = {
      'firstNameRequired': t('profile.firstNameRequired', 'First name is required'),
      'firstNameMinLength': t('profile.firstNameMinLength', 'First name must be at least 2 characters'),
      'lastNameRequired': t('profile.lastNameRequired', 'Last name is required'),
      'lastNameMinLength': t('profile.lastNameMinLength', 'Last name must be at least 2 characters'),
      'phoneRequired': t('profile.phoneRequired', 'Phone number is required'),
      'phoneInvalid': t('profile.phoneInvalid', 'Please enter a valid phone number'),
      'ageInvalid': t('profile.ageInvalid', 'Please enter a valid age (1-150)')
    };
    return errorMessages[errorKey] || errorKey;
  };

  // Calculate form completion progress
  useEffect(() => {
    const completedFields = PROFILE_CONFIG.requiredFields.filter(field => 
      formData[field] && formData[field].toString().trim().length > 0
    ).length;
    
    const progressValue = Math.round((completedFields / PROFILE_CONFIG.requiredFields.length) * 100);
    setProgress(progressValue);
  }, [formData]);

  // Centralized field handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear general error
    if (error) {
      setError('');
    }
  };

  const handleBlur = (fieldName) => {
    setTouchedFields(prev => ({
      ...prev,
      [fieldName]: true
    }));
    validateField(fieldName);
  };

  const validateField = (fieldName) => {
    const fieldConfig = PROFILE_CONFIG.fields[fieldName];
    if (!fieldConfig || !fieldConfig.validation) return '';
    
    const errorKey = fieldConfig.validation(formData[fieldName]);
    const errorMessage = getTranslatedError(errorKey);
    
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: errorMessage
    }));
    
    return errorMessage;
  };

  const validateForm = () => {
    const errors = {};
    
    Object.keys(PROFILE_CONFIG.fields).forEach(field => {
      const error = validateField(field);
      if (error) {
        errors[field] = error;
      }
    });
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Centralized form submission with proper API integration
const handleSubmit = async (e) => {
  //debug
  //console.log('Submitting form with data:', formData);
  e.preventDefault(); 
  setLoading(true);
  setError('');

  if (!validateForm()) {
    setLoading(false);
    return;
  }

  try {
    let result;
    
    if (useMockData) {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      result = { success: true, message: 'Profile completed successfully with mock data' };
    } else {
      // Transform form data to match database schema
      const profileData = transformFormDataForAPI(formData);
      
      // Use AuthContext's completeProfile method
      result = await completeProfile(profileData);
      ////console.log('Profile completion result:', result);
    }
    
    if (result) {
      setIsCompleted(true);
      
      toast({
        title: t('profile.profileCompleted', 'Profile Completed!'),
        description: useMockData 
          ? t('profile.mockProfileUpdated', 'Mock profile has been successfully updated.') 
          : t('profile.profileUpdated', 'Your profile has been successfully updated.'),
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      // Handle post-completion navigation
      setTimeout(() => {
        try {
          // Check for pending redirect
          const pendingRedirect = consumePendingRedirect();
          //console.log('Pending redirect result:', pendingRedirect);
          
          if (pendingRedirect && pendingRedirect.path) {
            //console.log('Navigating to pending redirect path:', pendingRedirect.path);
            navigate(pendingRedirect.path, { 
              state: { 
                from: 'complete-profile',
                redirectReason: pendingRedirect.reason,
                ...pendingRedirect
              } 
            });
          } else {
            // Default redirect to account dashboard
            //console.log('No pending redirect, navigating to account dashboard');
            navigate('/account', {
              state: { 
                from: 'complete-profile',
                profileJustCompleted: true
              }
            });
          }
        } catch (redirectError) {
          console.error('Error handling redirect:', redirectError);
          // Fallback to account dashboard on any redirect error
          navigate('/account', {
            state: { 
              from: 'complete-profile',
              profileJustCompleted: true,
              redirectError: true
            }
          });
        }
      }, 1500);
    }
  } catch (error) {
    console.error('Profile completion error:', error);
    const errorMessage = useMockData 
      ? t('profile.mockProfileFailed', 'Mock profile completion failed.') 
      : error.message || t('profile.profileCompletionFailed', 'Profile completion failed. Please try again.');
    
    setError(errorMessage);
    
    toast({
      title: t('profile.error', 'Error'),
      description: errorMessage,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  } finally {
    setLoading(false);
  }
};

  // Success state component
  const SuccessState = () => (
    <VStack spacing={6} textAlign="center" py={8}>
      <Icon 
        as={FiCheckCircle} 
        boxSize={16} 
        color="green.500" 
        opacity={0}
        animation="fadeIn 0.5s ease-in-out 0.5s forwards"
      />
      <VStack spacing={2}>
        <Heading size="lg" color="green.600">
          {t('profile.profileCompleted', 'Profile Completed!')}
        </Heading>
        <Text color="gray.600" maxWidth="md">
          {t('profile.profileCompletedDescription', 'Your profile has been successfully set up. Redirecting you now...')}
        </Text>
      </VStack>
      <Progress 
        size="sm" 
        colorScheme="green" 
        isIndeterminate 
        width="200px" 
        borderRadius="full"
      />
    </VStack>
  );

  // Reusable form field component
  const FormFieldWithIcon = ({ 
    fieldName,
    error, 
    children, 
    ...props 
  }) => {
    const fieldConfig = PROFILE_CONFIG.fields[fieldName];
    if (!fieldConfig) return null;

    return (
      <FormControl isInvalid={!!error} {...props}>
        <FormLabel 
          fontSize={{ base: "sm", md: "md" }}
        >
          <HStack spacing={2}>
            <Icon as={fieldConfig.icon} color="brand.500" boxSize={4} />
            <Text 
              color={colorMode === 'dark' ? 'secondary.200' : 'secondary.900'}
              fontFamily={isArabic ? "'Lalezar', sans-serif" : "'Permanent Marker', sans-serif"}
            >
              {t(`profile.${fieldConfig.labelKey}`, fieldConfig.labelKey)}
            </Text>
            {fieldConfig.required && (
              <Badge colorScheme="red" size="sm" borderRadius="full">
                {t('profile.required', 'Required')}
              </Badge>
            )}
          </HStack>
        </FormLabel>
        {children}
        <FormErrorMessage fontSize="xs" mt={1}>
          {error}
        </FormErrorMessage>
      </FormControl>
    );
  };

  // Reusable input field generator
  const renderInputField = (fieldName) => {
    const fieldConfig = PROFILE_CONFIG.fields[fieldName];
    if (!fieldConfig) return null;

    const commonProps = {
      name: fieldName,
      value: formData[fieldName],
      onChange: handleInputChange,
      onBlur: () => handleBlur(fieldName),
      disabled: loading || isCompleted,
      size: inputSize,
      borderRadius: "lg",
      borderColor: fieldErrors[fieldName] ? "red.400" : "secondary.300",
      borderWidth: "2px",
      focusBorderColor: "secondary.500",
      focusBorderWidth: "4px",
      _hover: { borderColor: "secondary.700" },
    };

    switch (fieldConfig.type) {
      case 'select':
        return (
          <Select {...commonProps} sx={{
            option: {
              border:'none',
              backgroundColor: colorMode === 'dark' ? 'gray.700' : 'secondary.100',
              '&:checked': {
                backgroundColor: colorMode === 'dark' ? 'gray.600' : 'brand.300',
              },
              '&:hover': {
                backgroundColor: colorMode === 'dark' ? 'gray.500' : 'brand.100',
              }
            }
          }}>
            {fieldConfig.options.map(option => (
              <option key={option.value} value={option.value}>
                {t(`profile.${option.labelKey}`, option.labelKey)}
              </option>
            ))}
          </Select>
        );

      case 'tel':
      case 'text':
      case 'number':
      default:
        return (
          <InputGroup>
            <InputLeftElement>
              <Icon as={fieldConfig.icon} color="gray.400" />
            </InputLeftElement>
            <Input
              type={fieldConfig.type}
              {...commonProps}
              pl={10}
              {...(fieldConfig.type === 'number' && { min: "1", max: "150" })}
            />
          </InputGroup>
        );
    }
  };

  // Show loading spinner if user data is not available yet (only for actual mode)
  if (!useMockData && !user) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        bg="gray.50"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.600" fontSize={{ base: "md", md: "lg" }}>
            {t('profile.loadingProfile', 'Loading your profile...')}
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box 
      minHeight="100vh" 
      bg="white"
      py={{ base: 4, md: 8 }}
      px={containerPadding}
      position={'absolute'}
      left={0}
      top={0}
      w={'100vw'}
      flexWrap={'wrap'}
    >
      <Container maxWidth={cardMaxWidth} centerContent>
        <ScaleFade initialScale={0.9} in={true}>
          <Card 
            border="1px solid" 
            borderColor="gray.200"
            borderRadius={{ base: "lg", md: "2xl" }}
            overflow="hidden"
            width="100%"
            bg="white"
          >
            {/* Header */}
            <Box 
              bg={colorMode === 'dark' ? 'gray.700' : 'secondary.100'}
              p={headerPadding}
              textAlign="center"
              position="relative"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                bg: 'blackAlpha.100',
                backdropFilter: 'blur(1px)'
              }}
            >
              <VStack spacing={2} position="relative" zIndex={1}>
                <Heading 
                  size={{ base: "md", md: "lg" }}
                  fontWeight="bold"
                  color={isCompleted ? "green.600" : "brand.600"}
                >
                  {isCompleted ? (
                    <HStack justify="center" spacing={2}>
                      <Icon as={FiCheckCircle} />
                      <Text>{t('profile.profileCompleted', 'Profile Completed!')}</Text>
                    </HStack>
                  ) : (
                    useMockData 
                      ? t('profile.completeProfileMock', 'Complete Your Profile (Mock Mode)') 
                      : t('profile.profileCompletion', 'Complete Your Profile')
                  )}
                </Heading>
                <Text 
                  opacity={0.9}
                  fontSize={{ base: "sm", md: "md" }}
                  maxWidth="md"
                >
                  {isCompleted 
                    ? t('profile.redirectingDescription', 'Taking you to your next step...')
                    : t('profile.profileCompletionDescription', 'Just a few more details to personalize your experience and get started')
                  }
                </Text>
              </VStack>
            </Box>

            <CardBody p={cardPadding}>
              {isCompleted ? (
                <SuccessState />
              ) : (
                <>
                  {/* Progress Section */}
                  <VStack spacing={4} mb={6}>
                    <Box width="100%">
                      <Flex justify="space-between" align="center" mb={3}>
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">
                          {t('profile.profileCompletion', 'Profile Completion')}
                        </Text>
                        <HStack spacing={2}>
                          {progress === 100 && (
                            <Icon as={FiCheck} color="green.500" boxSize={4} />
                          )}
                          <Text 
                            fontSize="sm" 
                            fontWeight="bold" 
                            color={progress === 100 ? "green.500" : "blue.600"}
                          >
                            {progress}%
                          </Text>
                        </HStack>
                      </Flex>
                      <Progress 
                        value={progress} 
                        size="md" 
                        colorScheme={progress === 100 ? "green" : "red"}
                        borderRadius="full"
                        bg="gray.200"
                        hasStripe={progress < 100}
                        isAnimated={progress < 100}
                      />
                    </Box>
                    
                    {progress < 100 && (
                      <Text fontSize="xs" color="gray.500" textAlign="center">
                        {t('profile.completeRequiredFields', 'Please complete all required fields to continue')}
                      </Text>
                    )}
                  </VStack>

                  {error && (
                    <Alert 
                      status="error" 
                      borderRadius="lg" 
                      mb={6}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      <AlertIcon />
                      {error}
                    </Alert>
                  )}

                  <Box as="form" onSubmit={handleSubmit}>
                    <VStack spacing={6}>
                      {/* Personal Information */}
                      <Box width="100%">
                        <Text 
                          fontSize="lg" 
                          fontWeight="semibold" 
                          color="gray.700" 
                          mb={4}
                          textAlign={{ base: "center", md: "left" }}
                        >
                          {t('profile.personalInformation', 'Personal Information')}
                        </Text>
                        
                        <Stack 
                          direction={{ base: "column", md: "row" }} 
                          spacing={4}
                          mb={4}
                        >
                          {['firstName', 'lastName'].map(fieldName => (
                            <FormFieldWithIcon
                              key={fieldName}
                              fieldName={fieldName}
                              error={touchedFields[fieldName] && fieldErrors[fieldName]}
                              flex={1}
                            >
                              {renderInputField(fieldName)}
                            </FormFieldWithIcon>
                          ))}
                        </Stack>

                        <FormFieldWithIcon
                          fieldName="phone"
                          error={touchedFields.phone && fieldErrors.phone}
                          mb={4}
                        >
                          {renderInputField('phone')}
                        </FormFieldWithIcon>
                      </Box>

                      <Divider />

                      {/* Optional Information */}
                      <Box width="100%">
                        <Text 
                          fontSize="lg" 
                          fontWeight="semibold" 
                          color="gray.700" 
                          mb={4}
                          textAlign={{ base: "center", md: "left" }}
                        >
                          {t('profile.additionalDetails', 'Additional Details')}
                          <Text fontSize="sm" color="gray.500" fontWeight="normal" mt={1}>
                            {t('profile.optionalFieldsDescription', 'These fields are optional but help us personalize your experience')}
                          </Text>
                        </Text>

                        <Grid templateColumns={gridColumns} gap={4} mb={4}>
                          {['age', 'gender'].map(fieldName => (
                            <GridItem key={fieldName}>
                              <FormFieldWithIcon
                                fieldName={fieldName}
                                error={touchedFields[fieldName] && fieldErrors[fieldName]}
                              >
                                {renderInputField(fieldName)}
                              </FormFieldWithIcon>
                            </GridItem>
                          ))}
                        </Grid>

                        <Grid templateColumns={gridColumns} gap={4}>
                          {['language', 'timezone'].map(fieldName => (
                            <GridItem key={fieldName}>
                              <FormFieldWithIcon fieldName={fieldName}>
                                {renderInputField(fieldName)}
                              </FormFieldWithIcon>
                            </GridItem>
                          ))}
                        </Grid>
                      </Box>

                      {/* Submit Button */}
                      <Box width="100%" pt={4}>
                        <Button
                          type="submit"
                          colorScheme="brand"
                          size={buttonSize}
                          width="100%"
                          height={{ base: "50px", md: "56px" }}
                          isLoading={loading}
                          loadingText={t('profile.savingProfile', 'Saving Profile...')}
                          isDisabled={progress < 100}
                          opacity={progress < 100 ? 0.7 : 1}
                          fontSize={{ base: "md", md: "lg" }}
                          fontWeight="semibold"
                          borderRadius="xl"
                          bgGradient={progress === 100 ? "linear(to-r, secondary.500, brand.700)" : undefined}
                          _hover={{ 
                            transform: progress === 100 ? "translateY(-2px)" : "none",
                            bgGradient: progress === 100 ? "linear(to-r, secondary.700, brand.800)" : undefined
                          }}
                          _active={{
                            transform: progress === 100 ? "translateY(0)" : "none"
                          }}
                          transition="all 0.2s ease"
                        >
                          {progress === 100 
                            ? t('profile.completeProfile', 'Complete Profile') 
                            : t('profile.fillRequiredFields', 'Please fill required fields')
                          }
                        </Button>

                        <Text 
                          fontSize={{ base: "xs", md: "sm" }} 
                          color="gray.500" 
                          textAlign="center"
                          mt={4}
                        >
                          {t('profile.updateLater', 'You can update this information later in your profile settings')}
                        </Text>
                      </Box>
                    </VStack>
                  </Box>
                </>
              )}
            </CardBody>
          </Card>
        </ScaleFade>
      </Container>
    </Box>
  );
};

export default CompleteProfile;