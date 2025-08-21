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
import { useUserSubscriptions } from '../../Hooks/useUserSubscriptions';
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

// Enhanced Login Modal Component
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
    // Set up enhanced redirect with plan context
    const redirectData = {
      path: '/premium/join',
      reason: 'subscription_flow'
    };
    
    // Include plan context if available
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
                    <Text fontSize="sm" color={textColor} textAlign="center">
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
                  {t('buttons.continueWithLogin')}
                </Button>
              </motion.div>
            </VStack>
          </motion.div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

const PlanCard = ({ plan, isUserPlan, onSelect }) => {
  const cardBg = useColorModeValue('secondary.500', 'gray.700')
  const borderColor = isUserPlan ? 'teal.400' : 'gray.200'
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const isArabic = currentLanguage === 'ar'
  
  return (
    <Box
      borderWidth={isUserPlan ? '2px' : 'none'}
      borderRadius="lg"
      borderColor={borderColor}
      overflow="hidden"
      bg={cardBg}
      p={4}
      position="relative"
      transition="transform 0.2s 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
      }}
    >
      {isUserPlan && (
        <Badge colorScheme="warning" position="absolute" top={2} right={2}>
          {t('premium.currentPlan')}
        </Badge>
      )}

      <CardPlanAvatar 
        plan={plan}
        mb={4}
        bg={useColorModeValue('gray.50', 'gray.600')}
      />

      <Heading as="h3" size="md" mb={2}>
        {isArabic ? plan.title_arabic : plan.title}
      </Heading>
      <Text mb={2}>
        <Badge colorScheme="error">
          {plan.periods?.length || 0} {t('premium.periods')}
        </Badge>
      </Text>

      <Flex justify="space-between" mt={3}>
        <Box>
          <Text fontSize="sm">
            {t('premium.kcal')}: {plan.kcal}
          </Text>
          <Text fontSize="sm">
            {t('premium.carbs')}: {plan.carb}g
          </Text>
          <Text fontSize="sm">
            {t('premium.protein')}: {plan.protein}g
          </Text>
        </Box>

        <Button
          size="sm"
          colorScheme={isUserPlan ? 'error' : 'brand'}
          onClick={() => onSelect(plan)}
        >
          {isUserPlan ? t('premium.viewDetails') : t('premium.select')}
        </Button>
      </Flex>
    </Box>
  )
}

const PlanDetails = ({ plan }) => {
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const isArabic = currentLanguage === 'ar'
  
  return (
    <Box>
      <Heading as="h3" size="sm" mb={2}>
        {isArabic ? plan.title_arabic : plan.title}
      </Heading>
      <Heading as="h4" size="xs" mb={2}>
        {t('premium.nutritionalInformation')}
      </Heading>

      <Flex mb={4} gap={4} flexWrap="wrap">
        <Badge colorScheme="green">
          {t('premium.kcal')}: {plan.kcal}
        </Badge>
        <Badge colorScheme="brand">
          {t('premium.carbs')}: {plan.carb}g
        </Badge>
        <Badge colorScheme="red">
          {t('premium.protein')}: {plan.protein}g
        </Badge>
      </Flex>

      <Heading as="h4" size="xs" mb={2}>
        {t('checkout.subscriptionPeriod')}
      </Heading>

      <VStack align="stretch" spacing={3}>
        {/* Short Term */}
        <Box p={3} bg="gray.50" borderRadius="md">
          <Heading as="h5" size="xs" mb={1}>
            {t('premium.shortTerm')}
          </Heading>
          <Text fontSize="sm">
            {t('premium.mealsOver')} {plan.short_term_meals} {t('premium.days')}
          </Text>
          <Text fontSize="sm" fontWeight="bold">
            {t('premium.overallPrice')}: ${plan.price_per_meal * plan.short_term_meals}
          </Text>
        </Box>

        {/* Medium Term */}
        <Box p={3} bg="gray.50" borderRadius="md">
          <Heading as="h5" size="xs" mb={1}>
            {t('premium.mediumTerm')}
          </Heading>
          <Text fontSize="sm">
            {t('premium.mealsOver')} {plan.medium_term_meals} {t('premium.days')}
          </Text>
          <Text fontSize="sm" fontWeight="bold">
            {t('premium.overallPrice')}: ${plan.price_per_meal * plan.medium_term_meals} <Badge colorScheme="green">10% off</Badge>
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}

export const PremiumPage = () => {
  const { plans, elementsLoading } = useElements();
  const { user, setPendingRedirectAfterAuth } = useAuthContext();
  const navigate = useNavigate();
  
  // Only call useUserSubscriptions if user exists
  const { 
    subscriptions, 
    createSubscription, 
    updateSubscription,
    isLoading: isSubscriptionsLoading 
  } = user ? useUserSubscriptions() : { subscriptions: [], isLoading: false };
  
  // Use the context properly
  const { 
    chosenPlan, 
    setSelectedPlan, 
    subscriptionData,
    updateSubscriptionData,
    resetSubscriptionData
  } = useChosenPlanContext();
  
  const [explorePlans, setExplorePlans] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginModalContext, setLoginModalContext] = useState({ plan: null, term: null });
  const { t } = useTranslation();
  const toast = useToast();
  const detailsSectionRef = useRef(null);
  const plansContainerRef = useRef(null);

  // Find user's active subscription - with safe check
  const activeSubscription = user && subscriptions?.length > 0 
    ? subscriptions.find(sub => sub.status === 'active' || sub.status === 'paused')
    : null;
  
  // Find the plan associated with active subscription
  const userPlan = activeSubscription && plans?.length > 0
    ? plans.find(plan => plan.id === activeSubscription.plan_id)
    : null;

  // Initialize context with user's current plan
  useEffect(() => {
    if (userPlan && activeSubscription) {
      // Initialize the context with existing subscription data
      updateSubscriptionData({
        plan: userPlan,
        plan_id: userPlan.id,
        status: activeSubscription.status,
        start_date: activeSubscription.start_date,
        end_date: activeSubscription.end_date,
        price_per_meal: activeSubscription.price_per_meal,
        total_meals: activeSubscription.total_meals,
        consumed_meals: activeSubscription.consumed_meals || 0,
        delivery_address_id: activeSubscription.delivery_address_id,
        preferred_delivery_time: activeSubscription.preferred_delivery_time,
        payment_method_id: activeSubscription.payment_method_id,
        auto_renewal: activeSubscription.auto_renewal,
        is_paused: activeSubscription.is_paused,
        meals: activeSubscription.meals || [],
        // Determine term based on total meals
        selected_term: activeSubscription.total_meals === userPlan.short_term_meals ? 'short' : 'medium'
      });
    } else if (!userPlan) {
      // Reset if no active subscription
      resetSubscriptionData();
    }
  }, [userPlan, activeSubscription, updateSubscriptionData, resetSubscriptionData]);

  const handlePlanSelect = (plan) => {
    // Check if user is authenticated
    if (!user) {
      setLoginModalContext({ plan, term: null });
      setShowLoginModal(true);
      return;
    }

    // Set the selected plan in context
    setSelectedPlan(plan);
    
    // If this is a new plan selection (not the user's current plan), reset other data
    if (!userPlan || plan.id !== userPlan.id) {
      updateSubscriptionData({
        plan: plan,
        plan_id: plan.id,
        status: 'pending',
        // Set start_date to tomorrow
        start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        selected_term: null,
        consumed_meals: 0,
        meals: [],
        is_paused: false,
        auto_renewal: false
      });
    }
    
    setTimeout(() => {
      detailsSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }, 50);
  };

  const toggleExplorePlans = () => {
    const newState = !explorePlans;
    setExplorePlans(newState);

    if (newState) {
      setTimeout(() => {
        plansContainerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
        });
      }, 50);
    }
  };

  const handleSubscribeRedirect = (plan, selectedTerm = null) => {
    if (!user) {
      setLoginModalContext({ plan, term: selectedTerm });
      setShowLoginModal(true);
      return;
    }

    // Set up redirect context for subscription flow
    const redirectData = {
      path: '/premium/join',
      reason: 'subscription_flow',
      planId: plan.id,
      planTitle: plan.title
    };
    
    if (selectedTerm) {
      redirectData.selectedTerm = selectedTerm;
    }

    // Navigate to premium join page
    navigate('/premium/join', { 
      state: { 
        planId: plan.id,
        selectedTerm: selectedTerm,
        fromPremiumPage: true 
      } 
    });
  };

  const handleSubscribe = async () => {
    if (!user) {
      setLoginModalContext({ plan: chosenPlan, term: null });
      setShowLoginModal(true);
      return;
    }

    if (!chosenPlan) {
      toast({
        title: t('premium.noPlanSelected'),
        description: t('premium.pleaseSelectAPlan'),
        status: 'warning',
        duration: 3000,
        isClosable: false,
      });
      return;
    }

    try {
      setSubscribing(true);
      
      if (activeSubscription) {
        // Update existing subscription
        await updateSubscription({
          subscriptionId: activeSubscription.id,
          subscriptionData: { 
            plan_id: chosenPlan.id,
            price_per_meal: subscriptionData.price_per_meal,
            total_meals: subscriptionData.total_meals,
            end_date: subscriptionData.end_date
          }
        });

        toast({
          title: t('premium.planUpdated'),
          description: t('premium.nowSubscribedToPlan', { planTitle: chosenPlan.title }),
          status: 'success',
          duration: 5000,
          isClosable: false,
        });
        
        setExplorePlans(false);
      } else {
        // For new subscriptions, redirect to join page
        handleSubscribeRedirect(chosenPlan);
        return;
      }
    } catch (error) {
      toast({
        title: t('premium.subscriptionFailed'),
        description: error.message || t('premium.failedToUpdatePlanSubscription'),
        status: 'error',
        duration: 5000,
        isClosable: false,
      });
    } finally {
      setSubscribing(false);
    }
  };

  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    setLoginModalContext({ plan: null, term: null });
  };

  const isLoading = elementsLoading || (user && isSubscriptionsLoading);

  if (isLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text>{t('common.loading')}</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }} bg="gray.50" minH="100vh">
      <VStack spacing={8} align="stretch">
        {/* Current Plan Section */}
        <Box as={VStack} bg="white" p={6} borderRadius="xl" alignItems={'center'}>
          <JoinPremiumTeaser />
          {userPlan && (
            <CurrentPlanBrief
              plan={userPlan}
              subscription={activeSubscription}
            />
          )}

          {userPlan && (
            <Button mt={4} colorScheme="brand" size="sm" onClick={toggleExplorePlans}>
              {explorePlans ? t('premium.hideAvailablePlans') : t('premium.exploreOtherPlans')}
            </Button>
          )}

          {!userPlan && (
            <Button mt={4} colorScheme="brand" onClick={toggleExplorePlans}>
              {t('premium.browseAvailablePlans')}
            </Button>
          )}
        </Box>

        {/* Available Plans Section */}
        {explorePlans && (
          <Fade in={explorePlans}>
            <Box bg="brand.50" p={6} borderRadius="xl" ref={plansContainerRef}>
              <Heading as="h2" size="md" mb={6}>
                {t('premium.availablePremiumPlans')}
              </Heading>

              {plans && plans.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {plans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={{
                        ...plan,
                        image: plan.avatar_url || planImages[plan.title] || dailyMealPlanImage,
                      }}
                      isUserPlan={userPlan?.id === plan.id}
                      onSelect={handlePlanSelect}
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

        {/* Selected Plan Details Section */}
        {chosenPlan && explorePlans && (
          <Box bg="secondary.200" borderRadius={'xl'} p={6} ref={detailsSectionRef}>
            <Heading as="h2" size="md" mb={4}>
              {t('premium.planDetails')}
            </Heading>

            <PlanDetails plan={chosenPlan} />

            <Divider my={4} />

            {userPlan?.id !== chosenPlan.id && (
              <Button
                mt={4}
                colorScheme="brand"
                size="lg"
                width="full"
                isLoading={subscribing}
                loadingText={t('premium.processingSubscription')}
                onClick={() => handleSubscribeRedirect(chosenPlan)}
              >
                {t('premium.subscribeToPlan')}
              </Button>
            )}

            {userPlan?.id === chosenPlan.id && (
              <Button
                mt={4}
                colorScheme="brand"
                size="lg"
                width="full"
                onClick={handleSubscribe}
                isLoading={subscribing}
                loadingText={t('premium.updatingSubscription')}
              >
                {t('premium.updateSubscription')}
              </Button>
            )}
          </Box>
        )}

        {/* Quick Action Alert for Non-authenticated Users */}
        {!user && !explorePlans && (
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">{t('premium.readyToStart')}</Text>
              <Text fontSize="sm">{t('premium.signInToExploreAndSubscribe')}</Text>
            </Box>
          </Alert>
        )}
      </VStack>

      {/* Enhanced Login Modal */}
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