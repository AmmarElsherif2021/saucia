import { useState, useEffect, useRef } from 'react'
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Fade,
  Flex,
  Image,
  Badge,
  SimpleGrid,
  useColorModeValue,
  Spinner,
  Center,
  Divider,
  useToast,
  Alert,
  AlertIcon,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  HStack,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useElements } from '../../Contexts/ElementsContext';
import { useAuthContext } from '../../Contexts/AuthContext';
import { useChosenPlanContext } from '../../Contexts/ChosenPlanContext';
import { CurrentPlanBrief } from './CurrentPlanBrief';
import { Link, useNavigate } from 'react-router-dom';
import { JoinPremiumTeaser } from './JoinPremiumTeaser';
import { useTranslation } from 'react-i18next';
import { useI18nContext } from '../../Contexts/I18nContext';
import { useUserSubscriptions,useSubscriptionValidation } from '../../Hooks/useUserSubscriptions';
import { CardPlanAvatar } from './PlanAvatar'
import profileIcon from '../../assets/profile-b.svg'
// Import plan images 
import gainWeightPlanImage from '../../assets/premium/gainWeight.png'
import keepWeightPlanImage from '../../assets/premium/keepWeight.png'
import loseWeightPlanImage from '../../assets/premium/loseWeight.png'
import dailyMealPlanImage from '../../assets/premium/dailymealplan.png'
import saladsPlanImage from '../../assets/premium/proteinsaladplan.png'
import nonProteinsaladsPlanImage from '../../assets/premium/nonproteinsaladplan.png'

// Map plan titles to images
const planImages = {
  'Protein Salad Plan': saladsPlanImage,
  'Non-Protein Salad Plan': nonProteinsaladsPlanImage,
  'Daily Plan': dailyMealPlanImage,
  'Gain Weight': gainWeightPlanImage,
  'Keep Weight': keepWeightPlanImage,
  'Lose Weight': loseWeightPlanImage,
}

// Icons
const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ChevronUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// Enhanced PlanCard with integrated PlanDetails and subscription validation
const EnhancedPlanCard = ({ 
  plan,
  isUserPlan = false, 
  onSelect,
  isArabic = false,
  t,
  canCreateNewSubscription = true, // NEW PROP
  hasActiveSubscription = false // NEW PROP
}) => {
  const { isOpen: showDetails, onToggle: toggleDetails } = useDisclosure()
  const cardBg = useColorModeValue('secondary.100', 'brand.800')
  const borderColor = isUserPlan ? 'brand.500' : 'brand.400'
  const badgeBg = useColorModeValue('brand.50', 'brand.900')
  const badgeColor = useColorModeValue('brand.600', 'brand.200')
  const disabledBg = useColorModeValue('gray.50', 'gray.700')
  const disabledColor = useColorModeValue('gray.400', 'gray.500')

  // Determine if this plan can be selected
  const canSelectPlan = isUserPlan || canCreateNewSubscription

  console.log('🔍 PlanCard State:', {
    planId: plan.id,
    planTitle: plan.title,
    isUserPlan,
    canCreateNewSubscription,
    canSelectPlan,
    hasActiveSubscription
  })

  return (
    <Box
      borderWidth={isUserPlan ? '3px' : '2px'}
      borderRadius="xl"
      borderColor={borderColor}
      overflow="hidden"
      bg={!canSelectPlan && !isUserPlan ? disabledBg : cardBg}
      p={{ base: 4, md: 5 }}
      transition="all 0.2s ease"
      height="100%"
      display="flex"
      flexDirection="column"
      _hover={{
        transform: canSelectPlan ? 'translateY(-4px)' : 'none',
        boxShadow: canSelectPlan ? 'xl' : 'none',
      }}
      opacity={!canSelectPlan && !isUserPlan ? 0.7 : 1}
      position="relative"
    >
      {isUserPlan && (
        <Badge 
          colorScheme="brand" 
          variant="outline"
          position="absolute" 
          top={3} 
          right={isArabic ? 'auto' : 3}
          left={isArabic ? 3 : 'auto'}
          fontSize="xs"
          py={1}
          px={3}
          borderRadius="full"
          bg={badgeBg}
          color={badgeColor}
          fontWeight="semibold"
        >
          {t('premium.currentPlan')}
        </Badge>
      )}

      {/* Active Subscription Warning Badge */}
      {hasActiveSubscription && !isUserPlan && (
        <Badge 
          colorScheme="orange" 
          variant="solid"
          position="absolute" 
          top={3} 
          right={isArabic ? 'auto' : 3}
          left={isArabic ? 3 : 'auto'}
          fontSize="xs"
          py={1}
          px={3}
          borderRadius="full"
          fontWeight="semibold"
        >
          {t('premium.activeSubscriptionExists')}
        </Badge>
      )}

      <VStack align="stretch" spacing={3} flex="1">
        {/* Header */}
        <Heading 
          as="h3" 
          size={{ base: 'sm', md: 'md' }}
          noOfLines={2}
          fontWeight="semibold"
          color={!canSelectPlan && !isUserPlan ? disabledColor : "brand.700"}
          textAlign={isArabic ? 'right' : 'left'}
        >
          {isArabic ? plan.title_arabic : plan.title}
        </Heading>

        {/* Nutrition Info - matching CurrentPlanBrief style */}
        <Flex gap={2} flexWrap="wrap">
          <Badge 
            colorScheme="brand" 
            variant="solid" 
            fontSize="xs" 
            px={2} 
            py={1} 
            borderRadius="md"
            opacity={!canSelectPlan && !isUserPlan ? 0.6 : 1}
          >
            {t('premium.kcal')}: {plan.kcal || 0}
          </Badge>
          <Badge 
            colorScheme="teal" 
            variant="solid" 
            fontSize="xs" 
            px={2} 
            py={1} 
            borderRadius="md"
            opacity={!canSelectPlan && !isUserPlan ? 0.6 : 1}
          >
            {t('premium.carbs')}: {plan.carb || 0}g
          </Badge>
          <Badge 
            colorScheme="warning" 
            variant="solid" 
            fontSize="xs" 
            px={2} 
            py={1} 
            borderRadius="md"
            opacity={!canSelectPlan && !isUserPlan ? 0.6 : 1}
          >
            {t('premium.protein')}: {plan.protein || 0}g
          </Badge>
          <Badge 
            colorScheme="orange" 
            variant="solid" 
            fontSize="xs" 
            px={2} 
            py={1} 
            borderRadius="md"
            opacity={!canSelectPlan && !isUserPlan ? 0.6 : 1}
          >
            {t('premium.fat')}: {plan.fat || 0}g
          </Badge>
        </Flex>

        {/* Actions */}
        <Flex direction="column" gap={2}>
          <Button
            size={{ base: 'sm', md: 'md' }}
            colorScheme="brand"
            variant={showDetails ? "solid" : "outline"}
            onClick={toggleDetails}
            rightIcon={showDetails ? <ChevronUpIcon /> : <ChevronDownIcon />}
            width="full"
            isDisabled={!canSelectPlan && !isUserPlan}
          >
            {showDetails ? t('premium.hideDetails') : t('premium.showDetails')}
          </Button>
          
          <Button
            size={{ base: 'sm', md: 'md' }}
            colorScheme={isUserPlan ? 'gray' : 'brand'}
            variant={isUserPlan ? 'outline' : 'solid'}
            onClick={() => onSelect(plan)}
            width="full"
            fontWeight="semibold"
            isDisabled={!canSelectPlan}
            title={!canSelectPlan ? t('premium.cannotSelectNewPlan') : ''}
          >
            {isUserPlan ? t('premium.viewDetails') : t('premium.select')}
          </Button>
        </Flex>
      </VStack>

      {/* Expandable Details - matching CurrentPlanBrief collapse style */}
      <Collapse in={showDetails} animateOpacity>
        <Box 
          mt={4} 
          pt={4}
          borderTop="2px"
          borderColor="brand.300"
        >
          <VStack align="stretch" spacing={4}>
            <Box>
              <Text fontSize="xs" fontWeight="semibold" color="brand.700" mb={3}>
                {t('checkout.subscriptionPeriod')}
              </Text>
              
              {/* Short Term */}
              <Box 
                p={3} 
                bg="secondary.100" 
                borderRadius="lg"
                mb={2}
                border="2px"
                borderColor="brand.400"
              >
                <Flex justify="space-between" align="center" mb={1}>
                  <Text fontSize="sm" fontWeight="semibold" color="teal.700">
                    {t('premium.shortTerm')}
                  </Text>
                  <Badge colorScheme="teal" fontSize="xs" px={2} py={1}>
                    {plan.short_term_meals} {t('premium.meals')}
                  </Badge>
                </Flex>
              
                <Text fontSize="xs" color="brand.600" fontWeight="bold">
                  {t('premium.overallPrice')}: {plan.price_per_meal * plan.short_term_meals} {t('common.currency')}
                </Text>
              </Box>

              {/* Medium Term */}
              <Box 
                p={3} 
                bg="secondary.100" 
                borderRadius="lg"
                border="2px"
                borderColor="brand.400"
              >
                <Flex justify="space-between" align="center" mb={1}>
                  <Text fontSize="sm" fontWeight="semibold" color="teal.700">
                    {t('premium.mediumTerm')}
                  </Text>
                  <HStack spacing={1}>
                    <Badge colorScheme="teal" fontSize="xs" px={2} py={1}>
                      {plan.medium_term_meals || 30} {t('premium.meals')}
                    </Badge>
                   
                  </HStack>
                </Flex>
                
                <Text fontSize="xs" color="brand.600" fontWeight="bold">
                  {t('premium.overallPrice')}: {plan.price_per_meal * plan.medium_term_meals} {t('common.currency')}
                </Text>
              </Box>
            </Box>

            {/* Active Subscription Warning */}
            {hasActiveSubscription && !isUserPlan && (
              <Alert status="warning" size="sm" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontSize="xs" fontWeight="bold">
                    {t('premium.cannotSubscribeWhileActive')}
                  </Text>
                  <Text fontSize="xs">
                    {t('premium.completeOrCancelCurrentFirst')}
                  </Text>
                </Box>
              </Alert>
            )}
          </VStack>
        </Box>
      </Collapse>
    </Box>
  )
}

// Enhanced Login Modal Component (ORIGINAL FUNCTIONALITY PRESERVED)
const LoginModal = ({ isOpen, onClose, selectedPlan = null, selectedTerm = null }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const modalBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const { setPendingRedirectAfterAuth } = useAuthContext()
  
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.25,
        ease: "easeOut"
      }
    }
  }

  const handleLoginRedirect = () => {
    const redirectData = {
      path: '/premium/join',
      reason: 'subscription_flow'
    };
    
    if (selectedPlan) {
      redirectData.planId = selectedPlan.id;
      redirectData.planTitle = selectedPlan.title;
    }
    
    if (selectedTerm) {
      redirectData.selectedTerm = selectedTerm;
    }
    
    setPendingRedirectAfterAuth(redirectData);
    navigate('/auth');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent 
        as={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        width={['95%', '80%', '60%']} 
        maxWidth="400px" 
        p={2} 
        mx="30px"
        bg={modalBg}
        borderRadius="xl"
        boxShadow="xl"
        border="1px solid"
        borderColor={borderColor}
      >
        <ModalHeader textAlign="center">
          {selectedPlan 
            ? t('premium.signInToSubscribe')
            : t('premium.authenticationRequired')
          }
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={6}>
          <motion.div
            initial="hidden"
            animate={isOpen ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <VStack spacing={4} p={2}>
              <motion.div variants={itemVariants}>
                <HStack spacing={4} align="center" justify="center">
                  <Image
                    src={profileIcon}
                    alt="Profile"
                    boxSize="60px"
                    opacity={0.7}
                  />
                </HStack>
              </motion.div>
              
              {selectedPlan && (
                <motion.div variants={itemVariants}>
                  <VStack spacing={2}>
                    <Badge colorScheme="brand" fontSize="sm" px={3} py={1}>
                      {selectedPlan.title}
                    </Badge>
                    <Text fontSize="xs" color={'highlight.400'} textAlign="center">
                      {t('premium.selectedPlanWillBeReserved')}
                    </Text>
                  </VStack>
                </motion.div>
              )}
              
              <motion.div variants={itemVariants}>
                <Text fontSize="lg" fontWeight="bold" textAlign="center">
                  {t('profile.signInRequired')}
                </Text>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Text textAlign="center" fontSize="sm" color={textColor}>
                  {selectedPlan 
                    ? t('premium.signInToContinueWithPlan')
                    : t('profile.signInToAccessPremium')
                  }
                </Text>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Button
                  colorScheme="brand"
                  w="full"
                  borderRadius="md"
                  onClick={handleLoginRedirect}
                >
                  {t('premium.continueWithLogin')}
                </Button>
              </motion.div>
            </VStack>
          </motion.div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export const PremiumPage = () => {
  const { plans, elementsLoading } = useElements();
  const { 
    user, 
    setPendingRedirectAfterAuth, 
    currentSubscription,
    isSubscriptionLoading 
  } = useAuthContext();
  const navigate = useNavigate();
  const { currentLanguage } = useI18nContext();
  
  const { 
    chosenPlan, 
    setSelectedPlan, 
    subscriptionData,
    updateSubscriptionData,
    resetSubscriptionData
  } = useChosenPlanContext();
  
  // NEW: Subscription validation hook
  const { 
    canCreateSubscription, 
    hasActiveSubscription, 
    isLoading: validationLoading,
    activeSubscription 
  } = useSubscriptionValidation();
  
  const [explorePlans, setExplorePlans] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalContext, setLoginModalContext] = useState({ plan: null, term: null });
  const { t } = useTranslation();
  const toast = useToast();
  const topSectionRef = useRef(null);
  const plansContainerRef = useRef(null);

  const isArabic = currentLanguage === 'ar';

  const userPlan = currentSubscription && plans?.length > 0
    ? plans.find(plan => plan.id === currentSubscription.plan_id)
    : null;

  // Debug subscription validation state
  useEffect(() => {
    console.log('🔍 PremiumPage Subscription Validation:', {
      user,
      hasActiveSubscription,
      canCreateSubscription,
      validationLoading,
      activeSubscription: activeSubscription?.id,
      currentSubscription: currentSubscription?.id,
      userPlan: userPlan?.id
    });
  }, [user, hasActiveSubscription, canCreateSubscription, validationLoading, activeSubscription, currentSubscription, userPlan]);

  useEffect(() => {
    if (userPlan && currentSubscription) {
      updateSubscriptionData({
        plan: userPlan,
        plan_id: userPlan.id,
        status: currentSubscription.status,
        start_date: currentSubscription.start_date,
        end_date: currentSubscription.end_date,
        price_per_meal: currentSubscription.price_per_meal,
        total_meals: currentSubscription.total_meals,
        consumed_meals: currentSubscription.consumed_meals || 0,
        delivery_address_id: currentSubscription.delivery_address_id,
        preferred_delivery_time: currentSubscription.preferred_delivery_time,
        payment_method_id: currentSubscription.payment_method_id,
        auto_renewal: currentSubscription.auto_renewal,
        is_paused: currentSubscription.is_paused,
        meals: currentSubscription.meals || [],
        selected_term: currentSubscription.total_meals === userPlan.short_term_meals ? 'short' : 'medium'
      });
    } else if (!userPlan) {
      resetSubscriptionData();
    }
  }, [userPlan, currentSubscription, updateSubscriptionData, resetSubscriptionData]);

  // ENHANCED: handlePlanSelect with subscription validation
  const handlePlanSelect = (plan) => {
    console.log('🎯 Plan Selection Attempt:', {
      planId: plan.id,
      planTitle: plan.title,
      user,
      hasActiveSubscription,
      canCreateSubscription,
      isUserPlan: userPlan?.id === plan.id
    });

    // Case 1: User not logged in
    if (!user) {
      console.log('🔐 User not logged in, showing login modal');
      setLoginModalContext({ plan, term: null });
      setShowLoginModal(true);
      return;
    }

    // Case 2: User is selecting their current plan
    if (userPlan?.id === plan.id) {
      console.log('📋 User selecting current plan, allowing view details');
      setSelectedPlan(plan);
      navigate('/premium/join', { 
        state: { 
          planId: plan.id,
          fromPremiumPage: true,
          isCurrentPlan: true // NEW: Indicate this is the current plan
        } 
      });
      return;
    }

    // Case 3: User has active subscription and tries to select different plan
    if (hasActiveSubscription) {
      console.log('🚫 User has active subscription, blocking new plan selection');
      toast({
        title: t('premium.activeSubscriptionExists'),
        description: t('premium.cannotSelectNewPlan'),
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Case 4: User can create new subscription
    console.log('✅ User can create new subscription, proceeding...');
    setSelectedPlan(plan);
    
    updateSubscriptionData({
      plan: plan,
      plan_id: plan.id,
      status: 'pending',
      start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      selected_term: null,
      consumed_meals: 0,
      meals: [],
      is_paused: false,
      auto_renewal: false
    });
    
    // Navigate to join page
    navigate('/premium/join', { 
      state: { 
        planId: plan.id,
        fromPremiumPage: true 
      } 
    });
  };

  const toggleExplorePlans = () => {
    const newState = !explorePlans;
    setExplorePlans(newState);

    if (newState) {
      // Scroll to top first
      setTimeout(() => {
        topSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 50);
      
      // Then scroll to plans
      setTimeout(() => {
        plansContainerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 500);
    } else {
      setTimeout(() => {
        topSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 50);
    }
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    setLoginModalContext({ plan: null, term: null });
  };

  const isLoading = elementsLoading || (user && isSubscriptionLoading) || validationLoading;

  if (isLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" thickness="3px" />
          <Text>{t('common.loading')}</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Top Section - Current Plan or Teaser */}
        <Box ref={topSectionRef}>
          <VStack spacing={6} align="stretch">
            {currentSubscription && userPlan && (
              <CurrentPlanBrief
                plan={userPlan}
                subscription={currentSubscription}
              />
            )}

            <JoinPremiumTeaser explorePlans={explorePlans} newMember={!userPlan} />
            
            <Center>
              {userPlan && (
                <Button 
                  colorScheme="brand" 
                  size={{ base: 'md', md: 'lg' }}
                  onClick={toggleExplorePlans}
                >
                  {explorePlans ? t('premium.hideAvailablePlans') : t('premium.exploreOtherPlans')}
                </Button>
              )}

              {!userPlan && (
                <Button 
                  colorScheme="brand" 
                  size={{ base: 'md', md: 'lg' }}
                  onClick={toggleExplorePlans}
                >
                  {t('premium.browseAvailablePlans')}
                </Button>
              )}
            </Center>
          </VStack>
        </Box>

        {/* Active Subscription Alert */}
        {hasActiveSubscription && explorePlans && (
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">{t('premium.activeSubscriptionAlert')}</Text>
              <Text fontSize="sm">{t('premium.completeOrCancelCurrentFirst')}</Text>
            </Box>
          </Alert>
        )}

        {/* Available Plans Section */}
        {explorePlans && (
          <Fade in={explorePlans}>
            <Box 
              bg="white" 
              p={{ base: 4, md: 6 }} 
              borderRadius="xl"
              border="2px solid"
              borderColor="brand.400"
              ref={plansContainerRef}
            >
              <Heading 
                as="h2" 
                size={{ base: 'md', md: 'lg' }} 
                mb={6}
                color="brand.700"
              >
                {t('premium.availablePremiumPlans')}
              </Heading>

              {plans && plans.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 4, md: 6 }}>
                  {plans.map((plan) => (
                    <EnhancedPlanCard
                      key={plan.id}
                      plan={plan}
                      isUserPlan={userPlan?.id === plan.id}
                      onSelect={handlePlanSelect}
                      isArabic={isArabic}
                      t={t}
                      canCreateNewSubscription={canCreateSubscription} // NEW PROP
                      hasActiveSubscription={hasActiveSubscription} // NEW PROP
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Center p={8}>
                  <Text>{t('premium.noPlansAvailable')}</Text>
                </Center>
              )}
            </Box>
          </Fade>
        )}

        {/* Info Alert for Non-authenticated Users */}
        {!user && !explorePlans && (
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">{t('premium.readyToStart')}</Text>
              <Text fontSize="sm">{t('premium.signInToExploreAndSubscribe')}</Text>
            </Box>
          </Alert>
        )}
      </VStack>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={handleCloseLoginModal}
        selectedPlan={loginModalContext.plan}
        selectedTerm={loginModalContext.term}
      />
    </Box>
  );
};

export default PremiumPage;