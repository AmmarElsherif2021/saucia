import { Box, useColorMode, Spinner, Center, Alert, AlertIcon, Button } from '@chakra-ui/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Hero } from './Hero'
import { FeaturedMeals } from './FeaturedSlide'
import { AboutPage } from './GetAbout'
import { Footer } from './Footer'
import { useRef, useEffect } from 'react'
import { useScrollNavigation } from '../../Hooks/useScrollNavigation'
import { ScrollingBadgesTrail } from '../../Components/Navbar/ScrollingBadgesTrail'
import { mealsAPI } from '../../API/mealAPI'
import { useElements } from '../../Contexts/ElementsContext'
import { smartPrefetch } from '../../lib/prefetchQueries'
import { useAuthContext } from '../../Contexts/AuthContext'
import { useNavigate } from 'react-router'
import Intro from './Intro'
import FloatingShapesLayout from './Hero/FloatingShapesLayout'
import { CurrentPlanBrief } from '../Premium/CurrentPlanBrief'
// Loading component for better UX
const FeaturedMealsLoading = () => (
  <Center h="300px">
    <Box textAlign="center" maxW="96vw">
      <Spinner size="xl" color="brand.500" mb={4} />
    </Box>
  </Center>
)

// Error component with retry functionality
const FeaturedMealsError = ({ error, onRetry }) => (
  <Center h="300px">
    <Alert status="error" borderRadius="md" maxW="md">
      <AlertIcon />
      <Box>
        <Box fontWeight="bold">Unable to load featured meals</Box>
        <Box fontSize="sm" color="gray.600" mb={2}>
          {error?.message || 'Something went wrong'}
        </Box>
        <Button size="sm" colorScheme="red" variant="outline" onClick={onRetry}>
          Try Again
        </Button>
      </Box>
    </Alert>
  </Center>
)

// Optimized featured meals section with its own data fetching
// In HomePage.jsx, update the FeaturedMealsSection component:
const FeaturedMealsSection = ({ sectionRef }) => {
  const { featuredMeals, elementsLoading, elementsError, refetchMeals } = useElements();
  if (elementsLoading) {
    return <FeaturedMealsLoading />;
  }

  if (elementsError) {
    return <FeaturedMealsError error={elementsError} onRetry={() => refetchMeals()} />;
  }

  return (
    <Box ref={sectionRef}>
      <FeaturedMeals 
        featuredMeals={featuredMeals || []} 
        visibleCount={3}
        autoPlay={true}
        transitionDuration={600}
        pauseOnHover={true}
      />
    </Box>
  );
}

const HomePage = () => {
  const { colorMode } = useColorMode()
  const queryClient = useQueryClient()
  const { pendingRedirect} = useAuthContext();
  const navigate = useNavigate();
  // Create refs for all sections
  const sectionRefs = {
    'about us': useRef(null),
    'hero': useRef(null),
    'features': useRef(null),
  }

  const { scrollToSection } = useScrollNavigation(sectionRefs)
  // Initial Redirection Logic
  useEffect(() => {
    const handleInitialRedirect = async () => {
      if (pendingRedirect) {
        console.log('Handling initial redirect:', pendingRedirect);
        // Scroll to the section if it exists
        navigate(pendingRedirect.path || '/');
      } else {
        // Default to hero section
        scrollToSection('hero');
      }
    };

    handleInitialRedirect();
  }, []);
  // Predictive prefetching for likely next pages
  useEffect(() => {
    const prefetchTimer = setTimeout(() => {
      smartPrefetch.predictivePrefetch('/', queryClient)
    }, 2000) // Wait 2 seconds after initial load

    return () => clearTimeout(prefetchTimer)
  }, [queryClient]) // Add queryClient to dependencies

  return (
    <Box 
      textAlign="center" 
      pt={1} 
      px={2} 
      bg={colorMode === "dark" ? "teal.800" : "none"}
      minH="100vh"
      overflowX={'hidden'}
      ref={sectionRefs.hero}
    >
      <ScrollingBadgesTrail />
      <CurrentPlanBrief/>
      
      {/* Hero section - always renders immediately */}
      <Box overflowX={'hidden'}>
        <Hero />
      </Box>
      <Intro />
      {/* Featured meals section - with its own loading state */}
      
      {/* 
      <FeaturedMealsSection sectionRef={sectionRefs.features} />
      */}
      {/* About section - static content */}
      <Box ref={sectionRefs['about us']}>
        <AboutPage />
      </Box>
      
      {/* Footer - static content */}
      <Footer />
    </Box>
  )
}

export default HomePage