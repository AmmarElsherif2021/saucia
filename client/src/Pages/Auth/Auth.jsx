import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../../supabaseClient'
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Container,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Center,
  Stack,
  useBreakpointValue,
  Icon,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router'
import { useAuthContext } from '../../Contexts/AuthContext'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircleIcon } from '@chakra-ui/icons'

export default function OAuth() {
  const { 
    user, 
    isLoading, 
    error, 
    logout,
    supabaseSession,
    requiresCompletion 
  } = useAuthContext();
  
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Responsive values
  const containerMaxW = useBreakpointValue({ base: 'sm', md: 'md', lg: 'lg' });
  const containerPy = useBreakpointValue({ base: 4, md: 8, lg: 10 });
  const boxP = useBreakpointValue({ base: 4, md: 6, lg: 8 });
  const headingSize = useBreakpointValue({ base: 'md', md: 'lg', lg: 'xl' });
  const buttonSize = useBreakpointValue({ base: 'md', md: 'lg' });

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('brand.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const shadowColor = useColorModeValue('lg', 'dark-lg');

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDashboardClick = () => {
    if (requiresCompletion) {
      navigate('/complete-profile');
    } else {
      navigate('/account');
    }
  };

  // Timeout fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.error('Auth loading timeout');
        setError(t('profile.timeoutError'));
      }
    }, 10000); // 10 second timeout
  
    return () => clearTimeout(timer);
  }, [isLoading, t]);

  // Show loading state
  if (isLoading) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <Container maxW={containerMaxW} py={containerPy}>
          <Center>
            <Box
              p={boxP}
              borderWidth={1}
              borderRadius="xl"
              borderColor={borderColor}
              boxShadow={shadowColor}
              bg={bgColor}
              textAlign="center"
              w="full"
              maxW="400px"
            >
              <VStack spacing={4}>
                <Spinner size="xl" color="brand.500" thickness="4px" />
                <Text fontSize="lg" fontWeight="medium">
                  {t('common.loading')}
                </Text>
                <Text fontSize="sm" color={textColor}>
                  {t('common.pleaseWait')}
                </Text>
              </VStack>
            </Box>
          </Center>
        </Container>
      </Flex>
    );
  }

  // Show error state
  if (error) {
    return (
      <Flex minH="100vh" align="center" justify="center" bg="gray.50">
        <Container maxW={containerMaxW} py={containerPy}>
          <Center>
            <Box
              p={boxP}
              borderWidth={1}
              borderRadius="xl"
              borderColor={borderColor}
              boxShadow={shadowColor}
              bg={bgColor}
              w="full"
              maxW="500px"
            >
              <Alert status="error" borderRadius="lg" flexDirection="column" textAlign="center">
                <AlertIcon boxSize="40px" mr={0} mb={4} />
                <AlertTitle fontSize="lg" mb={2}>
                  {t('profile.authenticationError')}
                </AlertTitle>
                <AlertDescription fontSize="sm" textAlign="center">
                  {error}
                </AlertDescription>
                <Button
                  mt={4}
                  colorScheme="red"
                  variant="outline"
                  onClick={() => window.location.reload()}
                  size={buttonSize}
                >
                  {t('profile.refresh')}
                </Button>
              </Alert>
            </Box>
          </Center>
        </Container>
      </Flex>
    );
  }

  // Show login form if not authenticated
  if (!user || !supabaseSession) {
    return (
    <Flex minH="100vh" alignItems="center" justifyContent="center" bg="gray.50">
      <Container 
        w={{ base: "90vw", md: "70vw", lg: "50vw" }}
        mx={{ base: "5vw", md: "15vw", lg: "25vw" }}
        py={0}
        px={4}
        centerContent
      >
        <Box
          p={boxP}
          borderWidth={3}
          borderRadius="xl"
          borderColor={borderColor}
          bg={bgColor}
          w="full"
        >
          <VStack spacing={6}>
            {/* Header */}
            <VStack spacing={3} align={'center'} textAlign="center">
              <Heading size={headingSize} color="brand.500" textAlign="center">
                {t('common.welcome')}
              </Heading>
              <Text color={textColor} fontSize={{ base: 'sm', md: 'md' }}>
                {t('profile.signInToContinue')}
              </Text>
            </VStack>
            
            {/* Auth Component */}
            <Box w="full">
              <Auth
                supabaseClient={supabase}
                appearance={{ 
                  theme: ThemeSupa,
                  style: {
                    button: {
                      borderRadius: '8px',
                      fontSize: '16px',
                      padding: '12px 16px',
                    },
                    input: {
                      borderRadius: '8px',
                      fontSize: '16px',
                      padding: '12px 16px',
                    }
                  }
                }}
                providers={['google']}
                onlyThirdPartyProviders
                redirectTo={window.location.origin}
                localization={{
                  variables: {
                    sign_in: {
                      button_label: t('profile.signIn'),
                      loading_button_label: t('profile.signingIn'),
                    },
                    sign_up: {
                      button_label: t('profile.signUp'),
                      loading_button_label: t('profile.signingUp'),
                    }
                  }
                }}
              />
            </Box>

            {/* Footer text */}
            <Text fontSize="xs" color={textColor} textAlign="center">
              {t('profile.termsAgreement')}
            </Text>
          </VStack>
        </Box>
      </Container>
    </Flex>
  );
  }

  // Show authenticated state
  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Container maxW={containerMaxW} py={containerPy} px={{ base: 4, md: 6 }}>
        <Center>
          <Box
            p={boxP}
            borderWidth={1}
            borderRadius="xl"
            borderColor={borderColor}
            boxShadow={shadowColor}
            bg={bgColor}
            w="full"
            maxW="600px"
          >
            <VStack spacing={6} align="stretch">
              {/* Success Header */}
              <VStack spacing={3} textAlign="center">
                <Icon as={CheckCircleIcon} boxSize={12} color="green.500" />
                <Heading size={headingSize} color="green.500">
                  {t('profile.successfullyLoggedIn')} 🎉
                </Heading>
                <Text fontSize="lg" fontWeight="medium">
                  {t('profile.welcomeBack', { name: user.displayName || user.email })}
                </Text>
              </VStack>
              
              {/* User Info */}
              <Box 
                p={4} 
                bg={useColorModeValue('gray.50', 'gray.700')} 
                borderRadius="lg"
              >
                <Stack spacing={2} fontSize="sm">
                  <Text>
                    <Text as="span" fontWeight="bold">{t('profile.email')}:</Text> {user.email}
                  </Text>
                  <Text>
                    <Text as="span" fontWeight="bold">{t('profile.name')}:</Text> {user.display_name || t('profile.notProvided')}
                  </Text>
                  <Text>
                    <Text as="span" fontWeight="bold">{t('profile.role')}:</Text> {user.is_admin ? t('profile.administrator') : t('profile.user')}
                  </Text>
                  <Text>
                    <Text as="span" fontWeight="bold">{t('profile.profileStatus')}:</Text> {user.profile_completed ? t('profile.complete') : t('profile.incomplete')}
                  </Text>
                </Stack>
              </Box>
              
              {/* Profile completion alert */}
              {requiresCompletion && (
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize="md">
                      {t('profile.profileIncomplete')}
                    </AlertTitle>
                    <AlertDescription fontSize="sm">
                      {t('profile.completeProfileMessage')}
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
              
              {/* Action Buttons */}
              <VStack spacing={3}>
                <Button 
                  colorScheme="brand" 
                  onClick={handleDashboardClick}
                  size={buttonSize}
                  w="full"
                  borderRadius="lg"
                >
                  {requiresCompletion ? t('profile.completeProfile') : t('profile.goToDashboard')}
                </Button>
                
                <Button 
                  colorScheme="red" 
                  variant="outline"
                  onClick={handleLogout}
                  size={buttonSize}
                  w="full"
                  borderRadius="lg"
                >
                  {t('profile.logout')}
                </Button>
              </VStack>
            </VStack>
          </Box>
        </Center>
      </Container>
    </Flex>
  );
}