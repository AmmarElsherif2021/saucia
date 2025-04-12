import { Box, Heading, Text } from "@chakra-ui/react";
import { Hero } from "./Hero";
import { FeaturedFoodsDemo } from "./FeaturedSlide";
import { OffersSlideDemo } from "./OffersSlide";
export const HomePage = () => {
  return (
    
      <Box textAlign="center" p={5}>
        <Hero/>
        <Text fontSize="lg" mt={4}>
          Explore the features and our specials.
        </Text>
        <FeaturedFoodsDemo/>
        <Text fontSize="lg" mt={4}>
          Explore our offers.
        </Text>
        <OffersSlideDemo/>
        <Text fontSize="lg" mt={4}>
          Join us on this exciting journey!
        </Text>
        <Text fontSize="lg" mt={4}>
          Contact us for more information.
        </Text> 
        <Text fontSize="lg" mt={4}>
          Follow us on social media for updates.
        </Text>
        <Text fontSize="lg" mt={4}>
          Subscribe to our newsletter for exclusive offers.
        </Text>
      </Box>

  );
}