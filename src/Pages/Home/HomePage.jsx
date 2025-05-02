import { Box, Heading, Text } from "@chakra-ui/react";
import { Hero } from "./Hero";
import { FeaturedFoodsDemo } from "./FeaturedSlide";
import { OffersSlideDemo } from "./OffersSlide";
import {GetPremium} from "./GetPremium";
import { Footer } from "./Footer";
import { useUser } from "../../Contexts/UserContext";
import { useEffect } from "react";
export const HomePage = () => {
  const { user, loading, logout }=useUser();
  useEffect(()=>{
    console.log(`From home user is ${user?.displayName}`)
  },[])
    return (
    
      <Box textAlign="center" p={5}>
        <Heading pb={8}>{user && user.displayName && `welcome ${user.displayName}` }</Heading>
        <Hero/>
        <FeaturedFoodsDemo/>
     
        <OffersSlideDemo/>
        <GetPremium/>
      
        <Footer/>
      </Box>

  );
}