import { motion } from 'framer-motion'
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Button,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  useColorModeValue,
} from '@chakra-ui/react'
import { PieChart } from 'react-minimal-pie-chart'
import profileIcon from '../../assets/profile-b.svg'
import { useNavigate } from 'react-router'
import { useAuthContext } from '../../Contexts/AuthContext'
import { useTranslation } from 'react-i18next'

export const ProfileModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()

  // Color variables - matching ProfileDD
  const modalBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const accentColor = useColorModeValue('brand.500', 'brand.300')

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

  // Animation variants - matching ProfileDD
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
        <ModalCloseButton />
        <ModalBody p={6}>
          <motion.div
            initial="hidden"
            animate={isOpen ? "visible" : "hidden"}
            variants={containerVariants}
          >
            {user ? (
              <VStack align="stretch" spacing={4}>
                <motion.div variants={itemVariants}>
                  <HStack spacing={4} align="center">
                    <Image
                      src={user.photoURL || profileIcon}
                      alt="Profile"
                      boxSize="80px"
                      borderRadius="full"
                      onClick={handleProfileClick}
                      cursor="pointer"
                      _hover={{ opacity: 0.85 }}
                      transition="opacity 0.2s"
                      border="2px solid"
                      borderColor={accentColor}
                    />
                    <VStack align="flex-start" spacing={0}>
                      <Text fontWeight="bold" fontSize="xl" noOfLines={1}>
                        {user.displayName || 'Anonymous User'}
                      </Text>
                      <Text 
                        fontSize="sm" 
                        color={textColor}
                        bg={accentColor + '10'}
                        px={2}
                        py={1}
                        borderRadius="md"
                        mt={2}
                      >
                        {user.planTitle || 'Free Plan'}
                      </Text>
                    </VStack>
                  </HStack>
                </motion.div>

                {user.nextMeal && (
                  <motion.div variants={itemVariants}>
                    <VStack align="flex-start" spacing={1} bg="blackAlpha.50" p={3} borderRadius="md">
                      <Text fontSize="sm" fontWeight="bold" color={textColor}>
                        NEXT MEAL
                      </Text>
                      <HStack spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          {user.nextMeal.time || 'N/A'}
                        </Text>
                        <Text fontSize="sm" color={textColor}>
                          at
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {user.nextMeal.location || 'N/A'}
                        </Text>
                      </HStack>
                    </VStack>
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <VStack align="center" spacing={3}>
                    <Text fontSize="sm" fontWeight="bold" color={textColor}>
                      {t("profile.noActiveSubscription")}
                    </Text>
                    <Box position="relative" w="110px" h="110px">
                      <PieChart
                        data={[
                          {
                            title: 'Remaining',
                            value: user.timeRemaining || 0,
                            color: '#3CD3AA',
                          },
                          {
                            title: 'Used',
                            value: 100 - (user.timeRemaining || 0),
                            color: useColorModeValue('#E2E8F0', '#4A5568'),
                          },
                        ]}
                        lineWidth={20}
                        rounded
                        totalValue={100}
                        animate
                      />
                      <Text 
                        position="absolute" 
                        top="50%" 
                        left="50%" 
                        transform="translate(-50%, -50%)"
                        fontSize="lg" 
                        fontWeight="bold"
                      >
                        {user.timeRemaining || 0}%
                      </Text>
                    </Box>
                    <Button 
                      colorScheme="brand" 
                      variant="outline"
                      size="sm"
                      w="full" 
                      onClick={handleLogout}
                      mt={2}
                      borderRadius="md"
                    >
                      {t('profile.signOut')}
                    </Button>
                  </VStack>
                </motion.div>
              </VStack>
            ) : (
              <VStack spacing={4} p={2}>
                <motion.div variants={itemVariants}>
                  <Text fontSize="lg" fontWeight="bold" textAlign="center">
                    {t('profile.guestTitle')}
                  </Text>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Text textAlign="center" fontSize="sm" color={textColor}>
                    {t('profile.guestMessage')}
                  </Text>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <Button
                    colorScheme="brand"
                    w="full"
                    borderRadius="md"
                    onClick={() => {
                      navigate('/auth')
                      onClose()
                    }}
                  >
                    {t('profile.signIn')}
                  </Button>
                </motion.div>
              </VStack>
            )}
          </motion.div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}