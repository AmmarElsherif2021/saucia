import { useState, useEffect, useRef } from "react";
import { Box, Flex, IconButton, useColorMode, Button } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useTranslation } from "react-i18next";
import { FeaturedItemCard } from "./Cards";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
};

export const ItemsCarousel = ({
  items,
  CardComponent = FeaturedItemCard,
  visibleCount = 1,
  auto = false,
  visibleButtons = true, // New prop with default value
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(visibleCount);
  const { colorMode } = useColorMode();
  const { t } = useTranslation();
  const carouselRef = useRef(null);

  const totalSlides = Math.max(1, Math.ceil(items.length / itemsToShow));

  useEffect(() => {
    const handleResize = () => {
      if (visibleCount > 0) {
        setItemsToShow(visibleCount);
      } else {
        const width = window.innerWidth;
        if (width < 600) setItemsToShow(1);
        else if (width < 900) setItemsToShow(2);
        else if (width < 1200) setItemsToShow(3);
        else setItemsToShow(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [visibleCount]);

  useEffect(() => {
    if (auto && items.length > itemsToShow) {
      const interval = setInterval(() => {
        nextSlide();
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [auto, items.length, itemsToShow]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= totalSlides - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex <= 0 ? totalSlides - 1 : prevIndex - 1
    );
  };

  const getCircularItems = () => {
    if (items.length <= itemsToShow) {
      return items;
    }

    const startIdx = (currentIndex * itemsToShow) % items.length;
    const endIdx = startIdx + itemsToShow;

    if (endIdx > items.length) {
      return [...items.slice(startIdx), ...items.slice(0, endIdx - items.length)];
    }

    return items.slice(startIdx, endIdx);
  };

  const visibleItems = getCircularItems();

  return (
    <Flex
      position="relative"
      overflow="hidden"
      ref={carouselRef}
      mb={8}
      width="100%"
      height="auto"
      px={0}
      bg={colorMode === "dark" ? "brand.900" : "brand.200"}
      borderRadius="3xl"
      align="center"
      justify="center"
      
    >
      {visibleButtons && (
        <IconButton
          icon={<ChevronLeftIcon />}
          aria-label={t("buttons.previous")} // Translated "Previous" button
          onClick={prevSlide}
          isDisabled={items.length <= itemsToShow}
          as={Button}
          variant="solid"
          colorScheme="brand"
          zIndex={5}
          sx={{ borderRadius: "50%" }}
        />
      )}

      <Flex
        as={motion.div}
        width="100%"
        justify="center"
        align="center"
        wrap="wrap"
        gap={2}
        variants={visibleCount === 1 && containerVariants}
        initial="hidden"
        animate="visible"
      >
        {visibleItems.map((item, index) => (
          <Box
            key={`item-${index}-${currentIndex}`}
            flex={`0 0 calc(${100 / itemsToShow}% - 5%)`}
            minWidth="250px"
            as={motion.div}
            variants={visibleCount === 1 && itemVariants}
            display="flex"
          >
            {item ? (
              <CardComponent {...item} />
            ) : (
              <Box height="100%" visibility="hidden" />
            )}
          </Box>
        ))}
      </Flex>

      {visibleButtons && (
        <IconButton
          icon={<ChevronRightIcon />}
          aria-label={t("buttons.next")} // Translated "Next" button
          onClick={nextSlide}
          isDisabled={items.length <= itemsToShow}
          as={Button}
          variant="solid"
          colorScheme="brand"
          zIndex={5}
          sx={{ borderRadius: "50%" }}
        />
      )}
    </Flex>
  );
};