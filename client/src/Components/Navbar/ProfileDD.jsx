import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  Text,
  Image,
  VStack,
  HStack,
  useColorModeValue,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Badge,
  Flex,
  Icon,
  Spacer,
} from '@chakra-ui/react'
import profileIcon from '../../assets/profile-b.svg'
import { useNavigate } from 'react-router-dom'
import { useDisclosure } from '@chakra-ui/react'
import { useAuthContext } from '../../Contexts/AuthContext'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FiLogOut, FiUser, FiCalendar, FiPackage, FiChevronRight } from 'react-icons/fi'

export const ProfileDD = ({ disabled = false }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const navigate = useNavigate()
  const { user, logout, subscription } = useAuthContext()
  const { t } = useTranslation()
  
  const handleProfileClick = () => {
    if (user) {
      navigate('/account')
      onClose()
    }
  }

  const handleLogout = () => {
    if (user) {
      logout()
      navigate('/')
      onClose()
    }
  }

  // Color variables
  const menuBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const accentColor = useColorModeValue('brand.500', 'brand.300')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const cardBg = useColorModeValue('gray.50', 'gray.900')
  
  // Calculate percentage for progress
  const consumptionPercentage = subscription && subscription.total_meals > 0 
    ? Math.round((subscription.consumed_meals / subscription.total_meals) * 100)
    : 0
  
  const remainingMeals = subscription 
    ? subscription.total_meals - (subscription.consumed_meals || 0)
    : 0

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut",
        staggerChildren: 0.05,
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.15 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    }
  }

  return (
    <Menu 
      isOpen={isOpen} 
      onClose={onClose} 
      placement="bottom-end"
      closeOnBlur={true}
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 8],
          },
        },
      ]}
    >
      <MenuButton 
        as={Button} 
        variant="ghost" 
        onClick={onOpen} 
        isDisabled={disabled}
        p={2}
        minW="auto"
        h="auto"
        borderRadius="full"
        position="relative"
        _hover={{ 
          bg: useColorModeValue('blackAlpha.100', 'whiteAlpha.100'),
          transform: 'scale(1.05)'
        }}
        _active={{ 
          bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
          transform: 'scale(0.95)'
        }}
        transition="all 0.2s"
      >
        <Image 
          src={user?.photoURL || profileIcon} 
          alt="Profile" 
          boxSize="36px"
          borderRadius="full"
          border="2px solid"
          borderColor={useColorModeValue('gray.200', 'gray.600')}
          _hover={{ borderColor: accentColor }}
          transition="border-color 0.2s"
        />
        {user && (
          <Box
            position="absolute"
            bottom="0"
            right="0"
            w="10px"
            h="10px"
            bg="green.400"
            borderRadius="full"
            border="2px solid"
            borderColor={menuBg}
          />
        )}
      </MenuButton>

      <MenuList 
        p={0}
        minW="320px"
        maxW="380px"
        bg={menuBg}
        borderRadius="xl"
        boxShadow="sm"
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
        zIndex={2000}
      >
        <motion.div
          initial="hidden"
          animate={isOpen ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {user ? (
            <VStack align="stretch" spacing={0}>
              {/* User Header */}
              <motion.div variants={itemVariants}>
                <Box 
                  p={6} 
                  bgGradient={useColorModeValue(
                    'linear(to-br, brand.50, blue.50)',
                    'linear(to-br, gray.800, gray.900)'
                  )}
                  cursor="pointer"
                  onClick={handleProfileClick}
                  _hover={{ bgGradient: useColorModeValue(
                    'linear(to-br, brand.100, blue.100)',
                    'linear(to-br, gray.700, gray.800)'
                  )}}
                  transition="all 0.2s"
                >
                  <HStack spacing={4} align="center">
                    <Image
                      src={user.photoURL || profileIcon}
                      alt="Profile"
                      boxSize="60px"
                      borderRadius="full"
                      border="3px solid"
                      borderColor="white"
                      shadow="md"
                    />
                    <VStack align="flex-start" spacing={1} flex={1}>
                      <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
                        {user.displayName || t('profile.anonymousUser')}
                      </Text>
                      <Badge 
                        colorScheme={user.planTitle === 'Premium' ? 'purple' : 'gray'}
                        variant="subtle"
                        px={3}
                        py={1}
                        borderRadius="full"
                        fontSize="xs"
                        fontWeight="semibold"
                      >
                        {user.planTitle || t('profile.freePlan')}
                      </Badge>
                    </VStack>
                    <Icon as={FiChevronRight} color={textColor} />
                  </HStack>
                </Box>
              </motion.div>

              {/* Next Meal Section */}
              {user.nextMeal && (
                <>
                  <Divider />
                  <motion.div variants={itemVariants}>
                    <Box p={4}>
                      <HStack spacing={3} align="center" mb={2}>
                        <Icon as={FiCalendar} color={accentColor} />
                        <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                          {t('profile.nextMeal')}
                        </Text>
                      </HStack>
                      <Box 
                        bg={cardBg}
                        p={4}
                        borderRadius="lg"
                        border="1px solid"
                        borderColor={borderColor}
                      >
                        <VStack align="flex-start" spacing={2}>
                          <HStack spacing={2}>
                            <Box w="8px" h="8px" bg="green.400" borderRadius="full" />
                            <Text fontSize="sm" fontWeight="medium">
                              {user.nextMeal.time || 'N/A'}
                            </Text>
                            <Spacer />
                            <Text fontSize="sm" color={textColor}>
                              {user.nextMeal.location || 'N/A'}
                            </Text>
                          </HStack>
                          {user.nextMeal.meal && (
                            <Text fontSize="xs" color={textColor} fontStyle="italic">
                              {user.nextMeal.meal}
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    </Box>
                  </motion.div>
                </>
              )}

              {/* Subscription Progress */}
              <Divider />
              <motion.div variants={itemVariants}>
                <Box p={4}>
                  <HStack spacing={3} align="center" mb={4}>
                    <Icon as={FiPackage} color={accentColor} />
                    <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                      {t('profile.subscriptionStatus')}
                    </Text>
                  </HStack>

                  {subscription && subscription.id ? (
                    <VStack spacing={4} align="stretch">
                      {/* Circular Progress */}
                      <Flex justify="center" position="relative">
                        <CircularProgress
                          value={consumptionPercentage}
                          size="120px"
                          thickness="8px"
                          color={accentColor}
                          trackColor={useColorModeValue('gray.200', 'gray.700')}
                        >
                          <CircularProgressLabel>
                            <VStack spacing={0}>
                              <Text fontSize="2xl" fontWeight="bold">
                                {remainingMeals}
                              </Text>
                              <Text fontSize="xs" color={textColor}>
                                {t('profile.remaining')}
                              </Text>
                            </VStack>
                          </CircularProgressLabel>
                        </CircularProgress>
                      </Flex>

                      {/* Progress Details */}
                      <HStack justify="space-between" px={2}>
                        <VStack align="center" spacing={0}>
                          <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                            {t('profile.used')}
                          </Text>
                          <Text fontSize="lg" fontWeight="bold">
                            {subscription.consumed_meals || 0}
                          </Text>
                        </VStack>
                        
                        <Divider orientation="vertical" h="40px" />
                        
                        <VStack align="center" spacing={0}>
                          <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                            {t('profile.total')}
                          </Text>
                          <Text fontSize="lg" fontWeight="bold">
                            {subscription.total_meals}
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  ) : (
                    <Box 
                      bg={cardBg}
                      p={6}
                      borderRadius="lg"
                      textAlign="center"
                    >
                      <Icon as={FiPackage} boxSize={8} color={textColor} mb={3} />
                      <Text fontSize="sm" color={textColor} mb={4}>
                        {t('profile.noActiveSubscription')}
                      </Text>
                      <Button
                        colorScheme="brand"
                        size="sm"
                        onClick={() => navigate('/pricing')}
                      >
                        {t('profile.upgradeNow')}
                      </Button>
                    </Box>
                  )}
                </Box>
              </motion.div>

              {/* Logout Button */}
              <Divider />
              <motion.div variants={itemVariants}>
                <Box p={4}>
                  <Button
                    leftIcon={<FiLogOut />}
                    variant="ghost"
                    colorScheme="red"
                    size="md"
                    w="full"
                    onClick={handleLogout}
                    borderRadius="lg"
                    justifyContent="flex-start"
                    _hover={{ bg: useColorModeValue('red.100', 'red.900') }}
                    alignItems={'center'}
                  >
                    {t('profile.signOut')}
                  </Button>
                </Box>
              </motion.div>
            </VStack>
          ) : (
            /* Guest State */
            <VStack spacing={6} p={8} align="center">
              <motion.div variants={itemVariants}>
                <Box
                  w="80px"
                  h="80px"
                  borderRadius="full"
                  bg={useColorModeValue('gray.100', 'gray.700')}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mb={4}
                >
                  <Icon as={FiUser} boxSize={8} color={textColor} />
                </Box>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <VStack spacing={2}>
                  <Text fontSize="lg" fontWeight="bold" textAlign="center">
                    {t('authenticationRequired')}
                  </Text>
                  <Text 
                    textAlign="center" 
                    fontSize="sm" 
                    color={textColor}
                    maxW="280px"
                  >
                    {t('signInRequired')}
                  </Text>
                </VStack>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Button
                  colorScheme="brand"
                  w="full"
                  size="lg"
                  borderRadius="lg"
                  onClick={() => {
                    navigate('/auth')
                    onClose()
                  }}
                  shadow="md"
                  _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                  transition="all 0.2s"
                >
                  {t('login')}
                </Button>
              </motion.div>
            </VStack>
          )}
        </motion.div>
      </MenuList>
    </Menu>
  )
}