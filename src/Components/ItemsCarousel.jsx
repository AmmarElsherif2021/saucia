import React, { useState, useEffect, useRef } from 'react';
import { Box, Flex, IconButton, useColorMode,Button } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { FeaturedItemCard } from './Cards';


export const ItemsCarousel = ({ items, cardType="FeaturedItemCard" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(3);
  const { colorMode } = useColorMode();
  const carouselRef = useRef(null);

  // Calculate the total number of slides needed
  const totalSlides = Math.ceil(items.length / itemsToShow);

  // Responsive items to show based on container width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 600) setItemsToShow(1);
      else if (width < 900) setItemsToShow(2);
      else if (width < 1200) setItemsToShow(3);
      else setItemsToShow(4);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Calculate the visible items based on current index and items to show
  const visibleItems = items.slice(
    currentIndex * itemsToShow,
    (currentIndex + 1) * itemsToShow
  );

  // Fill with empty items if needed to maintain consistent layout
  while (visibleItems.length < itemsToShow) {
    visibleItems.push(null);
  }

  return (
    <Flex
      position="relative"
      overflow="hidden"
      ref={carouselRef}
      mb={8}
      w="100%"
      p={2}
      bg={colorMode === "dark" ? "gray.800" : "accent.700"}
      borderRadius="xl"
      align="center"
      justify="center"
    >
      {/* Previous Button */}
      <IconButton
        icon={<ChevronLeftIcon />}
        aria-label="Prev"
        onClick={prevSlide}
        isDisabled={items.length <= itemsToShow}
        as={Button}
        variant="solid"
        colorScheme="accent"
        zIndex={5}
        sx={{ borderRadius: "50%" }}
      />

      {/* Carousel Content */}
      <Flex
        width="100%"
        justify="center"
        align="center"
        wrap="wrap"
        gap={2}
      >
        {visibleItems.map((item, index) => (
          <Box
            key={item ? item.name + index : `empty-${index}`}
            flex={`0 0 calc(${100 / itemsToShow}% - 16px)`}
            minWidth="250px"
          >
            {item && cardType==="FeaturedItemCard" ? (
              <FeaturedItemCard {...item} />
            ) : (
              <Box height="100%" visibility="hidden" />
            )}
          </Box>
        ))}
      </Flex>

      {/* Next Button */}
      <IconButton
        icon={<ChevronRightIcon />}
        aria-label="Next"
        onClick={nextSlide}
        isDisabled={items.length <= itemsToShow}
        as={Button}
        variant="solid"
        colorScheme="accent"
        zIndex={5}
        sx={{ borderRadius: "50%" }}
      />
    </Flex>
  );
};