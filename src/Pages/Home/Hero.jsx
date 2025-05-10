import { Box, Heading, Text, useColorMode, useBreakpointValue, Flex, Container, Button, VStack } from "@chakra-ui/react";
import { ItemsCarousel } from "../../Components/ItemsCarousel";
import heroA from "../../assets/hero/heroA.svg";
import heroB from "../../assets/hero/heroB.svg";
import heroC from "../../assets/hero/heroC.JPG";
import heroD from "../../assets/hero/heroD.svg";
import heroE from "../../assets/hero/heroE.svg";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { useI18nContext } from "../../Contexts/I18nContext";
import { useTranslation } from "react-i18next";
import { Link as RouterLink } from "react-router-dom";
//import { ArrowForwardIcon, ArrowBackIcon } from "@chakra-ui/icons";

export const AnimatedText = ({ text, delay = 0, color = "inherit" }) => {
  const [displayText, setDisplayText] = useState("");
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  // Safely handle undefined text
  const safeText = text || "";

  useEffect(() => {
    const onChangeHandler = (latest) => {
      setDisplayText(safeText.slice(0, latest));
    };
    rounded.on("change", onChangeHandler);
    return () => rounded.clearListeners("change");
  }, [rounded, safeText]);

  useEffect(() => {
    const controls = animate(count, safeText.length, {
      type: "tween",
      delay: delay,
      duration: safeText.length * 0.1,
      ease: "easeInOut",
    });
    return () => controls.stop();
  }, [safeText, delay, count]);

  return (
    <motion.span style={{ /* ... */ }}>
      {displayText}
    </motion.span>
  );
};
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

const HeroCard = ({item}) => {
    const { id, name, description, image, path } = item || {};
    const { colorMode } = useColorMode();
  const { currentLanguage } = useI18nContext();
  const { t } = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isArabic = currentLanguage === "ar";

  const contentLayout = useBreakpointValue({
    base: "row",
    // sm: "column",
    // md: "row",
    // lg: "row",
  });

  const contentWidth = useBreakpointValue({
    base: "90%",
    md: "50%",
  });

  const optimizedImage = useMemo(() => image, [image]);

  const MotionFlex = motion(Flex);
  const MotionBox = motion(Box);

  return (
    <Box
    key={id}
      bgImage={
        contentLayout === "column"
          ? "none"
          : !hasError
          ? `url(${optimizedImage})`
          : "linear-gradient(to right, #48BB78, #38B2AC)"
      }
      bgSize="cover"
      bgPosition="center"
      height="100vh"
      w="100%"
      mx={-16}
      my={0}
      px={24}
      py={0}
      position="relative"
      overflow="hidden"
      backgroundColor={colorMode === "dark" ? "gray.900" : "gray.100"}
    >
      {!isLoaded && !hasError && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="gray.100"
          as={motion.div}
          animate={{ opacity: [0.4, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}

      <Container
        maxW="container.xl"
        height="100%"
        centerContent
        justifyContent="center"
        alignItems={"center"}
      >
        <MotionFlex
          position="relative"
          zIndex={1}
          alignItems="center"
          justifyContent="space-between"
          flexDirection={contentLayout}
          w="full"
          padding={6}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <MotionBox
            as={VStack}
            width={contentWidth}
            variants={itemVariants}
            textAlign={
              contentLayout === "column" ? "center" : isArabic ? "right" : "left"
            }
            alignItems={
              contentLayout === "column" ? "center" : isArabic ? "right" : "left"
            }
            mb={contentLayout === "column" ? 8 : 0}
          >
            <Box
              as={motion.div}
              color="#ffffff"
              mb={4}
              px={0}
              borderRadius="md"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              maxWidth="100%"
              bgColor="rgba(39, 160, 108, 0.9)"
            >
              <Heading
                as="h1"
                fontSize={["2em", "3em"]}
                className={isArabic ? "readex-pro" : "montserrat"}
                margin={0}
                lineHeight={1.2}
              >
                <AnimatedText text={name} color="#ffffff" />
              </Heading>
            </Box>

            {description && (
              <Box
                as={motion.div}
                display="inline-flex"
                bg="rgba(0, 0, 0, 0.8)"
                color="brand.500"
                px={0}
                borderRadius="md"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                maxWidth="100%"
              >
                <Text
                  fontSize={["1.2em", "1.5em"]}
                  className={isArabic ? "lalezar" : "outfit"}
                  margin={0}
                  lineHeight={1.4}
                >
                  <AnimatedText
                    text={description}
                    delay={name.length * 0.1}
                    color="#ffffff"
                  />
                </Text>
              </Box>
            )}
            
            {path && (
              <Box
                as={motion.div}
                mt={4}
                display="inline-block"
                whileHover={{ scale: 1.05 }}

                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 10,
                  delay: (name.length + (description?.length || 0)) * 0.05 
                }}
              >
                <Button
                  as={RouterLink}
                  to={path}
                  colorScheme="brand"
                  size="lg"
                  bgColor="green.500"
                  color="white"
                  _hover={{ bgColor: "green.600" }}
                >
                  {t("buttons.explore")}
                </Button>
              </Box>
            )}
          </MotionBox>

          <MotionBox
            width={contentWidth}
            height={contentLayout === "column" ? "300px" : "auto"}
            variants={itemVariants}
            borderRadius="lg"
            overflow="hidden"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <Box
              width="100%"
              height="100%"
              bgImage={`url(${optimizedImage})`}
              bgSize="cover"
              bgPosition="center"
              borderRadius="lg"
            />
          </MotionBox>
        </MotionFlex>
      </Container>

      <Box
        as="img"
        src={optimizedImage}
        alt=""
        display="none"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </Box>
  );
};

// Hero
export const Hero = () => {
  const { t } = useTranslation();
  const heroSlides = useMemo(
    () => [
      { id:1,
        name: "Welcome to SauciaSalad!",
        description:
          "! طعم لذيذ واختيارات صحية بإشراف خبراء التغذية، جرب معنا واستمتع بالطعم الصح.",
        image: heroA,
      },
      { 
        id:2,
        name: "Create Your Own Salad & Fruit Bowl",
        description:
          "Pick your favorite ingredients and craft your perfect salad—fresh, tasty, and personalized!",
        image: heroB,
        path: "/menu"
      },
      {
        id:3,
        name: "Signature Salads, Crafted to Perfection",
        description:
          "Our expertly designed salads, packed with fresh ingredients and unique flavors—ready for you to enjoy.",
        image: heroC,
        path: "/menu"
      },
      {
        id:4,
        name: "Meet Our Nutrition Expert",
        description:
          "Balance, taste, and nutrition—our expert ensures every meal is both healthy and delicious!",
        image: heroD,
        path: "/"
      },
      {
        id:5,
        name: "Exclusive Offers & Premium Meal Plans",
        description:
          "Enjoy personalized meal plans, loyalty rewards, and unbeatable offers—crafted for your lifestyle.",
        image: heroE,
        path: "/premium"
      },
    ],
    [t]
  );

  return (
    <Box
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="transparent"
      color="white"
      position="relative"
    >
      <ItemsCarousel
        items={heroSlides}
        CardComponent={HeroCard}
        visibleCount={1}
        auto={true}
        visibleButtons={true}
        transitionDuration={16000}
      />

      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        height="20%"
        bgGradient="linear(to-t, whiteAlpha.600, transparent)"
        pointerEvents="none"
      />
    </Box>
  );
};