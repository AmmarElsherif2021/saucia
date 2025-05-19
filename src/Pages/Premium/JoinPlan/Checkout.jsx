import { Heading, Box, Button, VStack } from '@chakra-ui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useUser } from '../../Contexts/UserContext'

const CheckoutPlan = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { userPlan } = useUser()

  return (
    <Box p={{ base: 4, md: 8 }} minH="100vh">
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" color="brand.500">
          Complete Your Subscription
        </Heading>

        <Box bg="white" p={6} borderRadius="md" shadow="md">
          <Heading as="h2" size="md" mb={4}>
            Payment Information
          </Heading>
          
          {/* Add your payment form components here */}
          
          <Button 
            colorScheme="brand" 
            size="lg" 
            width="full"
            mt={6}
            onClick={() => {
              // Handle payment processing
              navigate('/account?subscription=success')
            }}
          >
            Complete Subscription
          </Button>
        </Box>
      </VStack>
    </Box>
  )
}

export default CheckoutPlan