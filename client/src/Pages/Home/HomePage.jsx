import { Box, useColorMode } from '@chakra-ui/react'
import { Hero } from './Hero'
import { FeaturedMeals } from './FeaturedSlide'
import { AboutPage } from './GetAbout'
import { Footer } from './Footer'
import { useRef } from 'react'
import { useElements } from '../../Contexts/ElementsContext'
import { useScrollNavigation } from '../../Hooks/useScrollNavigation'
import { ScrollingBadgesTrail } from '../../Components/Navbar/ScrollingBadgesTrail'

const HomePage = () => {
  const {
    featuredMeals,
    offersMeals,
  } = useElements()
  const { colorMode } = useColorMode()
  
  // Create refs for all sections
  const sectionRefs = {
    'about us': useRef(null),
    'hero': useRef(null),
    'features': useRef(null),
  }

  // Use the custom hook
  const { scrollToSection } = useScrollNavigation(sectionRefs)

  return (
    <Box textAlign="center" pt={1} px={2} bg={colorMode === "dark" ? "teal.800" : "none"}>
      <ScrollingBadgesTrail />
      
      <Box ref={sectionRefs.hero}>
        <Hero />
      </Box>
      
      <Box ref={sectionRefs.features}>
        <FeaturedMeals featuredMeals={featuredMeals} />
      </Box>
      
      <Box ref={sectionRefs['about us']}>
        <AboutPage />
      </Box>
      
      <Footer />
    </Box>
  )
}

export default HomePage
