import { Box, Heading, Flex, Text, Button, Image, VStack, useColorMode } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useI18nContext } from "../../Contexts/I18nContext.jsx"
import chefImage from "../../assets/chef.svg"
import valuesImage from "../../assets/value.svg";
import missionImage from "../../assets/mission.svg";

// Motion variants for animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

const AboutCard = ({ title, description, image }) => {
  const { colorMode } = useColorMode();
  const { currentLanguage } = useI18nContext();
  const isArabic = currentLanguage === "ar";
  
  const MotionBox = motion(Box);
  
  return (
    <MotionBox
      variants={itemVariants}
      bg={colorMode === "dark" ? "gray.700" : "white"}
      p={6}
      borderRadius="lg"
      display="flex"
      flexDirection={{ base: "column", md: "row" }}
      alignItems="center"
      justifyContent="space-between"
      mb={10}
      overflow="hidden"
    >
      <Box width={{ base: "100%", md: "40%" }} mb={{ base: 4, md: 0 }}>
        <Image 
          src={image} 
          alt={title}
          borderRadius="md"
          objectFit="cover"
          width="230px"
          height="auto"
        />
      </Box>
      
      <VStack 
        width={{ base: "100%", md: "55%" }} 
        alignItems={isArabic ? "flex-end" : "flex-start"}
        spacing={3}
        textAlign={isArabic ? "right" : "left"}
      >
        <Heading as="h3" size="lg" color="brand.500">
          {title}
        </Heading>
        <Text fontSize="md" color={colorMode === "dark" ? "gray.300" : "gray.600"}>
          {description}
        </Text>
      </VStack>
    </MotionBox>
  );
};

export const AboutUs = ({ contactUs }) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const MotionBox = motion(Box);
  
  const aboutSections = [
    {
      id: 1,
      title: "Our Story",
      description: "SauciaSalad was founded in 2022 with a simple mission: to make healthy eating delicious and accessible to everyone. What started as a small family business has grown into a beloved destination for fresh, nutritious meals without compromising on flavor. Our journey began when our founder, Sarah, struggled to find quick, healthy food options that actually tasted good. Frustrated with the limited choices, she decided to create her own solution, and SauciaSalad was born.",
      image: chefImage
    },
    {
      id: 2,
      title: "Our Values",
      description: "At SauciaSalad, we're committed to quality, sustainability, and community. We source our ingredients from local farmers whenever possible, ensuring freshness while supporting the local economy. Our packaging is eco-friendly, and we're constantly looking for ways to reduce our environmental footprint. We believe that healthy eating should be enjoyable, not a chore, which is why our nutrition experts work with skilled chefs to create recipes that nourish the body and delight the palate.",
      image: valuesImage
    },
    {
      id: 3,
      title: "Our Mission",
      description: "We're on a mission to revolutionize the way people think about healthy eating. By combining nutritional science with culinary creativity, we create salads and bowls that prove eating well can be a pleasure, not a sacrifice. Every meal is designed to provide balanced nutrition while tantalizing your taste buds. We're committed to helping our customers build healthy habits that last a lifetime, supported by education and personalized meal plans developed by our nutrition experts.",
      image: missionImage
    }
  ];

  return (
    <Box 
      py={12} 
      my={6}
      px={{ base: 4, md: 8 }} 
      bg={colorMode === "dark" ? "gray.800" : "brand.200"}
      borderRadius={"10px"}
    >
      <MotionBox
        maxW="container.xl"
        mx="auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Heading 
          as="h2" 
          size="xl" 
          mb={8} 
          textAlign="center"
          color={colorMode === "dark" ? "white" : "brand.700"}
        >
          About SauciaSalad
        </Heading>
        
        <Text 
          fontSize="xl" 
          mb={10} 
          textAlign="center" 
          maxW="800px" 
          mx="auto"
          color={colorMode === "dark" ? "gray.300" : "gray.600"}
        >
          Discover the story behind SauciaSalad, where nutrition meets flavor in perfect harmony. 
          We're passionate about creating delicious, healthy meals that fuel your body and delight your taste buds.
        </Text>
        
        <VStack spacing={8} mb={10}>
          {aboutSections.map((section) => (
            <AboutCard
              key={section.id}
              title={section.title}
              description={section.description}
              image={section.image}
            />
          ))}
        </VStack>
        
        <Box textAlign="center" mt={8}>
          <Text 
            fontSize="lg" 
            mb={4}
            color={colorMode === "dark" ? "gray.300" : "gray.600"}
          >
            Have questions or want to learn more about our journey? We'd love to hear from you!
          </Text>
          <Button 
            colorScheme="brand" 
            size="lg" 
            onClick={contactUs}
            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
            transition="all 0.3s"
          >
            Contact Our Team
          </Button>
        </Box>
      </MotionBox>
    </Box>
  );
};