import { Text, Flex, Box, Button, Collapse, Spinner, Badge } from '@chakra-ui/react'
import { useState } from 'react'

export const CurrentPlanBrief = ({ plan, loading }) => {
  const [showDetails, setShowDetails] = useState(false)
  
  if (loading) {
    return (
      <Flex justify="center" py={6}>
        <Spinner size="md" color="brand.500" />
        <Text ml={3}>Loading plan details...</Text>
      </Flex>
    )
  }
  
  if (!plan) {
    return (
      <Text>You are not currently subscribed to any plan.</Text>
    )
  }

  // Get plan image from a mapping or use default
  const planImage = plan.image || `/assets/plans/${plan.title?.toLowerCase().replace(/\s+/g, '-')}.png`

  return (
    <>
      <Text>
        You are currently subscribed to the <strong>{plan.title}</strong> plan.
      </Text>
      
      <Flex mt={4} alignItems="center" flexWrap={{ base: "wrap", md: "nowrap" }} gap={4}>
        <Box w="90px" h="90px" mb={{ base: 2, md: 0 }}>
          <img
            src={planImage}
            alt={plan.title}
            style={{ width: '7rem', height: '7rem', borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.src = '/assets/plans/default.png' // Fallback image
            }}
          />
        </Box>
        
        <Box flex="1">
          <Text fontSize="lg" color="gray.600">
            {plan.description || `This plan is designed to help you with your ${plan.title.toLowerCase()} goals.`}
          </Text>
          
          <Flex mt={2} gap={2} flexWrap="wrap">
            <Badge colorScheme="green">Kcal: {plan.kcal}</Badge>
            <Badge colorScheme="blue">Carbs: {plan.carb}g</Badge>
            <Badge colorScheme="red">Protein: {plan.protein}g</Badge>
          </Flex>
          
          {plan.nextMeal && (
            <Box mt={2}>
              <Text fontSize="sm" color="gray.500">
                <strong>Upcoming Meal:</strong> {plan.nextMeal.name}
              </Text>
              {plan.nextMeal.time && (
                <Text fontSize="sm" color="gray.500">
                  <strong>Time:</strong> {plan.nextMeal.time}
                </Text>
              )}
              {plan.nextMeal.location && (
                <Text fontSize="sm" color="gray.500">
                  <strong>Location:</strong> {plan.nextMeal.location}
                </Text>
              )}
            </Box>
          )}
        </Box>
        
        <Button onClick={() => setShowDetails(!showDetails)} colorScheme="brand" size="sm">
          {showDetails ? 'Hide Details' : 'Show Details'}
        </Button>
      </Flex>

      <Collapse in={showDetails} animateOpacity>
        <Box mt={4} p={4} bg="gray.50" borderRadius="md">
          <Text fontWeight="medium" mb={2}>
            Plan Details
          </Text>
          
          <Flex direction={{ base: "column", md: "row" }} gap={4}>
            <Box flex="1">
              <Text fontSize="sm"><strong>Full Name:</strong> {plan.title}</Text>
              {plan.title_arabic && (
                <Text fontSize="sm"><strong>Arabic Name:</strong> {plan.title_arabic}</Text>
              )}
              <Text fontSize="sm"><strong>Calories:</strong> {plan.kcal} kcal</Text>
              <Text fontSize="sm"><strong>Carbohydrates:</strong> {plan.carb}g</Text>
              <Text fontSize="sm"><strong>Protein:</strong> {plan.protein}g</Text>
            </Box>
            
            {plan.periods && plan.periods.length > 0 && (
              <Box flex="1">
                <Text fontSize="sm" fontWeight="medium">Available Periods:</Text>
                {plan.periods.map((period, index) => (
                  <Text key={index} fontSize="sm">{period} days</Text>
                ))}
              </Box>
            )}
          </Flex>
          
          <Button mt={4} size="sm" colorScheme="blue">
            Manage Plan Settings
          </Button>
        </Box>
      </Collapse>
    </>
  )
}