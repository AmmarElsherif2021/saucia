import { motion } from 'framer-motion'
import {
  Box,
  VStack,
  Text,
  Image,
  Button,
  Modal,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
} from '@chakra-ui/react'
import { PieChart } from 'react-minimal-pie-chart'
import profileIcon from '../../assets/profile-b.svg'
import { useNavigate } from 'react-router'
import { useAuthContext } from '../../Contexts/AuthContext' // <-- Use new AuthContext hook
import { useTranslation } from 'react-i18next'

export const ProfileModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const { user, logout } = useAuthContext() // <-- Use new AuthContext
  const navigate = useNavigate()

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
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
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
    >
      <ModalHeader>{t('profile.title')}</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <VStack 
          spacing={4}
          as={motion.div}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {user ? (
            <>
              <VStack 
                as={motion.div}
                variants={itemVariants}
                spacing={4}
              >
                <Image
                  src={user.photoURL || profileIcon}
                  alt="Profile"
                  boxSize="100px"
                  borderRadius="full"
                  onClick={handleProfileClick}
                  cursor="pointer"
                />
                <VStack spacing={0}>
                  <Text fontWeight="bold">{user.displayName || 'Anonymous User'}</Text>
                  <Text fontSize="sm" color="gray.500">
                    {user.planTitle || 'Free Plan'}
                  </Text>
                </VStack>
              </VStack>

              <VStack 
                as={motion.div}
                variants={itemVariants}
                spacing={0} 
                w="full"
              >
                <Text fontWeight="bold">Next Meal</Text>
                <Text>
                  {user.nextMeal?.time || 'N/A'} at {user.nextMeal?.location || 'N/A'}
                </Text>
              </VStack>

              <Box 
                as={motion.div}
                variants={itemVariants}
                w="full"
              >
                <Text fontWeight="bold">Time Remaining</Text>
                <PieChart
                  data={[
                    { value: user.timeRemaining || 0, color: '#DDD' },
                    {
                      value: 100 - (user.timeRemaining || 0),
                      color: '#3CD3AA',
                    },
                  ]}
                  lineWidth={20}
                  rounded
                  totalValue={100}
                  style={{ height: '100px' }}
                />
                <Text textAlign="center">{user.timeRemaining || 0}% Remaining</Text>
              </Box>

              <Button 
                as={motion.div}
                variants={itemVariants}
                colorScheme="red" 
                w="full" 
                onClick={handleLogout}
              >
                {t('profile.signOut')}
              </Button>
            </>
          ) : (
            <VStack 
              as={motion.div}
              variants={containerVariants}
              spacing={4}
            >
              <Text 
                as={motion.div}
                variants={itemVariants}
                fontSize="lg" 
                fontWeight="bold"
              >
                {t('profile.guestTitle')}
              </Text>
              <Text 
                as={motion.div}
                variants={itemVariants}
                textAlign="center"
              >
                {t('profile.guestMessage')}
              </Text>
              <Button
                as={motion.div}
                variants={itemVariants}
                colorScheme="brand"
                w="full"
                onClick={() => {
                  navigate('/auth')
                  onClose()
                }}
              >
                {t('profile.signIn')}
              </Button>
            </VStack>
          )}
        </VStack>
      </ModalBody>
    </ModalContent>
  </Modal>
)
}