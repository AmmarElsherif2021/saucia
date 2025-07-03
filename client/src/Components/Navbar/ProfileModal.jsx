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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent width={['95%', '80%', '60%']} maxWidth="400px" p={2} mx="30px">
        <ModalHeader>{t('profile.title')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            {user ? (
              <>
                <VStack spacing={4}>
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

                <VStack spacing={0} w="full">
                  <Text fontWeight="bold">Next Meal</Text>
                  <Text>
                    {user.nextMeal?.time || 'N/A'} at {user.nextMeal?.location || 'N/A'}
                  </Text>
                </VStack>

                <Box w="full">
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

                <Button colorScheme="red" w="full" onClick={handleLogout}>
                  {t('profile.signOut')}
                </Button>
              </>
            ) : (
              <VStack spacing={4}>
                <Text fontSize="lg" fontWeight="bold">
                  {t('profile.guestTitle')}
                </Text>
                <Text textAlign="center">{t('profile.guestMessage')}</Text>
                <Button
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
