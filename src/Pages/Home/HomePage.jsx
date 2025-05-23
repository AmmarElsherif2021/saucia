import { Box, VStack } from '@chakra-ui/react'
import { Hero } from './Hero'
import { FeaturedMeals } from './FeaturedSlide'
import { OffersSlide } from './OffersSlide'
import { AboutUs } from './GetAbout'
import { Footer } from './Footer'
//import { useUser } from "../../Contexts/UserContext";
import { useEffect } from 'react'
import { useElements } from '../../Contexts/ElementsContext'
import ExpertPortal from './ExpertPortal'
const HomePage = () => {
  //const { user }=useUser();
  const {
    //items,
    //meals,
    //plans,
    featuredMeals,
    offersMeals,
    //elementsLoading
  } = useElements()
  useEffect(() => {
    //console.log(`From home user is ${user?.displayName}`)
    // console.log(
    //   'From elements context',
    //    items,
    // meals,
    // plans,
    // featuredMeals,
    // offersMeals,
    // elementsLoading
    // )
  }, [])
  return (
    <Box textAlign="center" p={5}>
      <Hero />
      <FeaturedMeals featuredMeals={featuredMeals} />
      <OffersSlide offersMeals={offersMeals} />
      <ExpertPortal />
      <AboutUs />
      <Footer />
    </Box>
  )
}
export default HomePage
