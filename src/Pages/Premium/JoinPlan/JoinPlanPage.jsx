import { Heading, Box, Button, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import CommonQuestions from './CommonQuestions'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../../Contexts/UserContext'

const JoinPlanPage = () => {
  const navigate = useNavigate()
  const { userPlan } = useUser()
  const [currentStep, setCurrentStep] = useState(0)

  const handleCompleteQuestions = () => {
    setCurrentStep(1)
  }

  const handleBackToPlans = () => {
    navigate('/premium')
  }

  return (
    <Box p={{ base: 4, md: 8 }} minH="100vh">
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" color="brand.500">
          {currentStep === 0 ? 'Complete Your Profile' : 'Subscription Confirmation'}
        </Heading>

        {currentStep === 0 ? (
          <CommonQuestions onComplete={handleCompleteQuestions} />
        ) : (
          <Box bg="white" p={6} borderRadius="md" shadow="md">
            <Heading as="h2" size="md" mb={4}>
              Confirm Your Subscription
            </Heading>
            <Text mb={4}>You're about to subscribe to: {userPlan?.title}</Text>
            <Text mb={6}>Please review your information before proceeding to payment.</Text>

            <Button
              colorScheme="brand"
              size="lg"
              width="full"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Payment
            </Button>
            <Button mt={4} variant="outline" width="full" onClick={handleBackToPlans}>
              Back to Plans
            </Button>
          </Box>
        )}
      </VStack>
    </Box>
  )
}

export default JoinPlanPage
