import { Box, Heading, Text, useColorMode } from "@chakra-ui/react";
import { ItemsCarousel } from "../../Components/ItemsCarousel";
import heroA from "../../assets/hero-1.JPG";
import heroB from "../../assets/hero-2.JPG";
import heroC from "../../assets/hero-3.JPG";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

const AnimatedText = ({ text,delay=0 }) => {
  const [displayText, setDisplayText] = useState("");
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const unsubscribe = rounded.onChange((latest) => {
      setDisplayText(text.slice(0, latest));
    });
    return () => unsubscribe();
  }, [rounded, text]);

  useEffect(() => {
    const controls = animate(count, text.length, {
      type: "tween",
      delay: delay,
      duration: 2,
      ease: "easeIn",
    });
    
    return () => controls.stop();
  }, [text]);

  return <motion.span>{displayText}</motion.span>;
};

const HeroCard = ({ name, description, image }) => {
  const { colorMode } = useColorMode();
  
  return (
    <Box
      bgImage={`url(${image})`}
      bgSize="cover"
      bgPosition="center"
      height="100vh"
      w={"100vw"}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      color="white"
      textAlign="center"
      px={0}
      mx={0}
    
    >
      <Heading as="h1" opacity={"0.9"} bg="brand.600" color="brand.50" mb={1} p={4} sx={{ fontSize: "3em" }}>
        <AnimatedText text={name} />
      </Heading>
      <Text fontSize="1.5em" bg="black" color="brand.500" sx={{ paddingY: 0 }}>
        <AnimatedText  text={description} delay={2} />
      </Text>
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
      <ItemsCarousel items={heroSlides} CardComponent={HeroCard} visibleCount={1} auto={true}/>
    </Box>
  );
};