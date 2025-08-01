import { Box, useColorMode, VStack } from '@chakra-ui/react'
import { Hero } from './Hero'
import { FeaturedMeals } from './FeaturedSlide'
import { OffersSlide } from './OffersSlide'
import {AboutPage} from './GetAbout'
import { Footer } from './Footer'
import { useEffect } from 'react'
import { useElements } from '../../Contexts/ElementsContext'
import SupportPortal from './SupportPortal'
import MapBox from '../../Components/Map/MapBox'
import { MealPlanCardDemo } from '../Checkout/MealPlanCard'
const HomePage = () => {

  const {
    featuredMeals,
    offersMeals,
    //elementsLoading
  } = useElements()
  const {colorMode}= useColorMode();
  // <OffersSlide offersMeals={offersMeals} />
  return (
    <Box textAlign="center" pt={1} px={2} bg={colorMode === "dark" ? "teal.800":"none"}>
      <Hero />
      <FeaturedMeals featuredMeals={featuredMeals} />
      <AboutPage/>
      <Footer />
    </Box>
  )
}
export default HomePage
