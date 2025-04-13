import { Box, Heading, Text,useColorMode  } from "@chakra-ui/react";
import { ItemsCarousel } from "../../Components/ItemsCarousel";
import heroA from "../../assets/hero-1.JPG";
import heroB from "../../assets/hero-2.JPG";
import heroC from "../../assets/hero-3.JPG";

const HeroCard = ({ name, description, image }) => {
  const colorMode = useColorMode();
  return (
    <Box
      bgImage={`url(${image})`}
      bgSize="cover"
      bgPosition="stretch"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      color="white"
      textAlign="center"
      py={0}
      mx={"-60px"}
    >
      <Heading as="h2" bg="brand.600" color="brand.50" size="4xl" mb={1} p={0}>
        {name}
      </Heading>
      <Text  fontSize="4xl" bg="black" color="brand.500" sx={{paddingY:0}} >{description}</Text>
    </Box>
  );
}
export const Hero = () => {
  const heroSlides = [
    {
      name: "Welcome to Our Website",
      description: "Discover amazing content and connect with us.",
      image: heroA,
    },
    {
      name: "Explore Our Features",
      description: "Find out what makes us unique and special.",
      image: heroC,
    },
    {
      name: "Join Our Community",
      description: "Be part of something bigger and better.",
      image: heroB,
    },
  ];

  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="transparent"
      color="white"
    >
      <ItemsCarousel items={heroSlides} CardComponent={HeroCard} visibleCount={1}/>
    </Box>
  );
};