// Pages/Auth/OTPAuth.jsx
// OTP Authentication Component integrated with your AuthContext

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Input,
  Text,
  Heading,
  useColorModeValue,
  PinInput,
  PinInputField,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  useToast,
  Flex,
  Container,
  Divider,
  IconButton,
  useBreakpointValue,
} from '@chakra-ui/react';
import { PhoneIcon, CheckCircleIcon, RepeatIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../Contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { OTPService } from '../../lib/otpService';

export default function OTPAuth() {
  const {
    user,
    pendingRedirect,
    consumePendingRedirect,
    clearPendingRedirect,
  } = useAuthContext();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'processing'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [sessionData, setSessionData] = useState(null);
  const otpInputRef = useRef(null);

  // Responsive values
  const containerMaxW = useBreakpointValue({ base: 'sm', md: 'md' });
  const boxP = useBreakpointValue({ base: 6, md: 8 });
  const headingSize = useBreakpointValue({ base: 'md', md: 'lg' });

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('brand.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-focus OTP input
  useEffect(() => {
    if (step === 'otp' && otpInputRef.current) {
      setTimeout(() => {
        const firstInput = otpInputRef.current.querySelector('input');
        if (firstInput) firstInput.focus();
      }, 100);
    }
  }, [step]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      const redirect = consumePendingRedirect();
      if (redirect) {
        navigate(redirect.path || '/account');
      } else {
        navigate('/account');
      }
    }
  }, [user, consumePendingRedirect, navigate]);

  const maskPhoneNumber = (phone) => {
    if (!phone) return '';
    const formatted = OTPService.formatPhoneNumber(phone);
    return formatted.replace(/(\d{3})(\d{4})(\d{2})/, '$1****$3');
  };

  const handleSendOTP = async () => {
    setError('');

    if (!OTPService.validatePhoneNumber(phoneNumber)) {
      setError(t('auth.invalidPhoneNumber') || 'Please enter a valid Saudi phone number (05xxxxxxxx)');
      return;
    }

    setLoading(true);

    try {
      const result = await OTPService.sendOTP(phoneNumber);
      
      setSessionData(result);
      setStep('otp');
      setCountdown(60);
      setAttempts(0);

      // Show mock OTP in toast (only for testing!)
      if (result._mockOTP) {
        toast({
          title: '🔐 Test OTP',
          description: `Your verification code is: ${result._mockOTP}`,
          status: 'info',
          duration: 15000,
          isClosable: true,
          position: 'top',
        });
      }

      toast({
        title: t('auth.otpSent') || 'Code Sent',
        description: t('auth.otpSentDescription') || 'Verification code sent to your phone',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: t('error') || 'Error',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');

    if (otp.length !== 6) {
      setError(t('auth.enterCompleteOTP') || 'Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);

    try {
      const result = await OTPService.verifyOTP(phoneNumber, otp);

      if (result.verified) {
        // In a real implementation, you would:
        // 1. Create/update user in Supabase with verified phone
        // 2. Sign them in or link phone to existing account
        // For now, we'll show success and redirect

        toast({
          title: t('auth.phoneVerified') || 'Phone Verified',
          description: t('auth.phoneVerifiedDescription') || 'Your phone number has been verified',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });

        // Here you would integrate with Supabase Auth
        // For example: await supabase.auth.signInWithOtp({ phone: phoneNumber })
        
        setStep('processing');

        // Simulate processing and redirect
        setTimeout(() => {
          const redirect = consumePendingRedirect();
          navigate(redirect?.path || '/auth/complete-profile');
        }, 1500);
      }
    } catch (err) {
      setAttempts(attempts + 1);
      setError(err.message);
      setOtp('');

      if (attempts >= 2) {
        toast({
          title: t('auth.tooManyAttempts') || 'Too Many Attempts',
          description: t('auth.requestNewOTP') || 'Please request a new verification code',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setStep('phone');
        setAttempts(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setError('');
    setOtp('');
    setLoading(true);

    try {
      const result = await OTPService.resendOTP(phoneNumber);
      
      setSessionData(result);
      setCountdown(60);
      setAttempts(0);

      // Show mock OTP in toast (only for testing!)
      if (result._mockOTP) {
        toast({
          title: '🔐 New Test OTP',
          description: `Your new verification code is: ${result._mockOTP}`,
          status: 'info',
          duration: 15000,
          isClosable: true,
          position: 'top',
        });
      }

      toast({
        title: t('auth.otpResent') || 'New Code Sent',
        description: t('auth.otpResentDescription') || 'A new verification code has been sent',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      setError(err.message);
      toast({
        title: t('error') || 'Error',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPhone = () => {
    setStep('phone');
    setOtp('');
    setError('');
    setAttempts(0);
    setSessionData(null);
  };

  const handleBackToAuth = () => {
    clearPendingRedirect();
    navigate('/auth');
  };

  const renderPhoneStep = () => (
    <VStack spacing={6} align="stretch">
      <VStack spacing={2} textAlign="center">
        <PhoneIcon boxSize={12} color="brand.500" />
        <Heading size={headingSize} color="brand.500">
          {t('auth.verifyPhoneNumber') || 'Verify Phone Number'}
        </Heading>
        <Text color={textColor} fontSize="sm">
          {t('auth.enterPhoneToReceiveCode') || 'Enter your phone number to receive a verification code'}
        </Text>
      </VStack>

      <Alert status="info" borderRadius="lg" fontSize="sm">
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="sm">{t('auth.testMode') || 'Test Mode'}</AlertTitle>
          <AlertDescription fontSize="xs">
            {t('auth.testModeDescription') || 'This is a mock OTP system for testing. The code will be shown in a notification.'}
          </AlertDescription>
        </Box>
      </Alert>

      {pendingRedirect && (
        <Badge colorScheme="blue" fontSize="xs" p={2} borderRadius="md" textAlign="center">
          {t('auth.continuingAfterVerification') || 'Continuing with your selected plan after verification'}
        </Badge>
      )}

      <FormControl isInvalid={!!error}>
        <FormLabel>{t('auth.phoneNumber') || 'Phone Number'}</FormLabel>
        <Input
          type="tel"
          placeholder="05xxxxxxxx"
          value={phoneNumber}
          onChange={(e) => {
            setPhoneNumber(e.target.value);
            setError('');
          }}
          size="lg"
          fontSize="lg"
          isDisabled={loading}
          dir="ltr"
        />
        <FormErrorMessage>{error}</FormErrorMessage>
      </FormControl>

      <VStack spacing={3}>
        <Button
          colorScheme="brand"
          size="lg"
          onClick={handleSendOTP}
          isLoading={loading}
          loadingText={t('auth.sending') || 'Sending...'}
          w="full"
        >
          {t('auth.sendVerificationCode') || 'Send Verification Code'}
        </Button>

        <Button
          variant="ghost"
          size="md"
          onClick={handleBackToAuth}
          leftIcon={<ArrowBackIcon />}
          w="full"
        >
          {t('auth.backToSignIn') || 'Back to Sign In'}
        </Button>
      </VStack>

      <Text fontSize="xs" color={textColor} textAlign="center">
        {t('auth.smsAgreement') || 'By continuing, you agree to receive SMS messages for verification purposes'}
      </Text>
    </VStack>
  );

  const renderOTPStep = () => (
    <VStack spacing={6} align="stretch">
      <VStack spacing={2} textAlign="center">
        <Badge colorScheme="green" fontSize="lg" px={4} py={2} borderRadius="full">
          {maskPhoneNumber(phoneNumber)}
        </Badge>
        <Heading size="md">{t('auth.enterVerificationCode') || 'Enter Verification Code'}</Heading>
        <Text color={textColor} fontSize="sm">
          {t('auth.sentCodeToPhone') || 'We sent a 6-digit code to your phone'}
        </Text>
      </VStack>

      <FormControl isInvalid={!!error}>
        <VStack spacing={4}>
          <HStack ref={otpInputRef} justify="center">
            <PinInput
              otp
              size="lg"
              value={otp}
              onChange={setOtp}
              onComplete={handleVerifyOTP}
              isDisabled={loading}
              placeholder="·"
            >
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
            </PinInput>
          </HStack>
          <FormErrorMessage justifyContent="center">{error}</FormErrorMessage>
        </VStack>
      </FormControl>

      <VStack spacing={3}>
        <Button
          colorScheme="brand"
          size="lg"
          onClick={handleVerifyOTP}
          isLoading={loading}
          loadingText={t('auth.verifying') || 'Verifying...'}
          w="full"
          isDisabled={otp.length !== 6}
        >
          {t('auth.verifyCode') || 'Verify Code'}
        </Button>

        <HStack spacing={2} justify="center">
          <Text fontSize="sm" color={textColor}>
            {t('auth.didntReceiveCode') || "Didn't receive the code?"}
          </Text>
          {countdown > 0 ? (
            <Text fontSize="sm" fontWeight="bold" color="brand.500">
              {t('auth.resendIn', { seconds: countdown }) || `Resend in ${countdown}s`}
            </Text>
          ) : (
            <Button
              variant="link"
              colorScheme="brand"
              size="sm"
              onClick={handleResendOTP}
              leftIcon={<RepeatIcon />}
              isLoading={loading}
            >
              {t('auth.resendCode') || 'Resend Code'}
            </Button>
          )}
        </HStack>

        <Button variant="ghost" size="sm" onClick={handleEditPhone} isDisabled={loading}>
          {t('auth.changePhoneNumber') || 'Change Phone Number'}
        </Button>
      </VStack>

      {attempts > 0 && (
        <Alert status="warning" borderRadius="lg" fontSize="sm">
          <AlertIcon />
          <Text fontSize="xs">
            {t('auth.attemptsRemaining', { count: 3 - attempts }) || 
              `${3 - attempts} attempt${3 - attempts !== 1 ? 's' : ''} remaining`}
          </Text>
        </Alert>
      )}
    </VStack>
  );

  const renderProcessingStep = () => (
    <VStack spacing={6} align="stretch" textAlign="center">
      <CheckCircleIcon boxSize={16} color="green.500" />
      <Heading size="lg" color="green.500">
        {t('auth.phoneVerified') || 'Phone Verified!'} ✓
      </Heading>
      <Text color={textColor}>
        {t('auth.settingUpAccount') || 'Setting up your account...'}
      </Text>
    </VStack>
  );

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Container maxW={containerMaxW} py={8} px={4}>
        <Box
          p={boxP}
          borderWidth={1}
          borderRadius="xl"
          borderColor={borderColor}
          boxShadow="xl"
          bg={bgColor}
        >
          {step === 'phone' && renderPhoneStep()}
          {step === 'otp' && renderOTPStep()}
          {step === 'processing' && renderProcessingStep()}

          <Divider my={6} />

          <Alert status="warning" borderRadius="lg" fontSize="xs">
            <AlertIcon />
            <AlertDescription>
              <strong>{t('auth.developmentMode') || 'Development Mode'}:</strong>{' '}
              {t('auth.mockImplementation') || 
                'This is a mock implementation. In production, integrate with Authentica.sa API.'}
            </AlertDescription>
          </Alert>
        </Box>
      </Container>
    </Flex>
  );
}