import { Box, VStack } from '@chakra-ui/react'
import { Hero } from './Hero'
import { FeaturedMeals } from './FeaturedSlide'
import { OffersSlide } from './OffersSlide'
import { AboutUs } from './GetAbout'
import { Footer } from './Footer'
import { useEffect } from 'react'
import { useElements } from '../../Contexts/ElementsContext'
import ExpertPortal from './ExpertPortal'
import MapBox from '../../Components/Map/MapBox'
const HomePage = () => {
  //const { user }=useUser();
  // const markers = [
  //   {
  //     position: [51.505, -0.09],
  //     content: "Our main office"
  //   }
  // ];
  const {
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
