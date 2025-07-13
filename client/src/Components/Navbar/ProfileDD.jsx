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
} from '@chakra-ui/react'
import { PieChart } from 'react-minimal-pie-chart'
import profileIcon from '../../assets/profile-b.svg'
import { useNavigate } from 'react-router-dom'
import { useDisclosure } from '@chakra-ui/react'
import { useAuthContext } from '../../Contexts/AuthContext'
import { motion } from 'framer-motion'

export const ProfileDD = ({ disabled = false }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const navigate = useNavigate()
  const { user, logout } = useAuthContext()

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

  // Animation variants
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
    hidden: { opacity: 0, y: 20 },
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
    <Menu isOpen={isOpen} onClose={onClose} placement="bottom-end">
      <MenuButton 
        as={Button} 
        variant="ghost" 
        onClick={onOpen} 
        isDisabled={disabled}
        p={2}
        minW="auto"
        h="auto"
      >
        <Image src={profileIcon} alt="Profile" boxSize="30px" />
      </MenuButton>

      <MenuList 
        p={4} 
        minW="300px"
        maxW="350px"
        bg="white"
        borderRadius="md"
        boxShadow="lg"
        border="1px solid"
        borderColor="gray.200"
        zIndex={1000}
      >
        <motion.div
          initial="hidden"
          animate={isOpen ? "visible" : "hidden"}
          variants={containerVariants}
        >
          {user ? (
            <VStack align="center" spacing={4}>
              <motion.div variants={itemVariants}>
                <VStack spacing={4}>
                  <Image
                    src={user.photoURL || profileIcon}
                    alt="Profile"
                    boxSize="100px"
                    borderRadius="full"
                    onClick={handleProfileClick}
                    cursor="pointer"
                    _hover={{ opacity: 0.8 }}
                    transition="opacity 0.2s"
                  />
                  <VStack align="center" spacing={0}>
                    <Text fontWeight="bold" fontSize="lg">
                      {user.displayName || 'Anonymous User'}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {user.planTitle || 'Free Plan'}
                    </Text>
                  </VStack>
                </VStack>
              </motion.div>

              {user.nextMeal && (
                <motion.div variants={itemVariants}>
                  <VStack align="center" spacing={0}>
                    <Text fontSize="sm" fontWeight="bold">
                      Next Meal
                    </Text>
                    <Text fontSize="sm" textAlign="center">
                      {user.nextMeal.time || 'N/A'} at {user.nextMeal.location || 'N/A'}
                    </Text>
                  </VStack>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <VStack align="center" spacing={2}>
                  <Text fontSize="sm" fontWeight="bold">
                    Time Remaining
                  </Text>
                  <Box position="relative">
                    <PieChart
                      data={[
                        {
                          value: user.timeRemaining || 0,
                          color: '#3CD3AA',
                        },
                        {
                          value: 100 - (user.timeRemaining || 0),
                          color: '#E2E8F0',
                        },
                      ]}
                      lineWidth={20}
                      rounded
                      totalValue={100}
                      style={{ height: '100px', width: '100px' }}
                    />
                    <Text 
                      position="absolute" 
                      top="50%" 
                      left="50%" 
                      transform="translate(-50%, -50%)"
                      fontSize="sm" 
                      fontWeight="bold"
                    >
                      {user.timeRemaining || 0}%
                    </Text>
                  </Box>
                  <Button 
                    colorScheme="red" 
                    variant="outline"
                    size="sm"
                    w="full" 
                    onClick={handleLogout}
                    mt={2}
                  >
                    Sign Out
                  </Button>
                </VStack>
              </motion.div>
            </VStack>
          ) : (
            <VStack spacing={4} p={2}>
              <motion.div variants={itemVariants}>
                <Text fontSize="lg" fontWeight="bold" textAlign="center">
                  Guest User
                </Text>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Text textAlign="center" fontSize="sm" color="gray.600">
                  Sign in to access your profile and premium features
                </Text>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Button
                  colorScheme="blue"
                  w="full"
                  onClick={() => {
                    navigate('/auth')
                    onClose()
                  }}
                >
                  Sign In
                </Button>
              </motion.div>
            </VStack>
          )}
        </motion.div>
      </MenuList>
    </Menu>
  )
}