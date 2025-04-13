import { Box, Heading, Text } from "@chakra-ui/react";
import { Hero } from "./Hero";
import { FeaturedFoodsDemo } from "./FeaturedSlide";
import { OffersSlideDemo } from "./OffersSlide";
import {GetPremium} from "./GetPremium";
import { Footer } from "./Footer";
export const HomePage = () => {
  return (
    
      <Box textAlign="center" p={5}>
        <Hero/>
       
        <FeaturedFoodsDemo/>
     
        <OffersSlideDemo/>
        <GetPremium/>
      
        <Footer/>
      </Box>

  );
}