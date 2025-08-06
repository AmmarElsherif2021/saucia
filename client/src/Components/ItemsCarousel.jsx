import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, IconButton, Flex, useBreakpointValue, Image } from '@chakra-ui/react';
import chevronLeft from '../assets/chevron-left.svg';
import chevronRight from '../assets/chevron-right.svg';
import { motion } from 'framer-motion';

export const ItemsCarousel = ({
  items = [],
  CardComponent,
  visibleCount = { base: 1, sm: 2, md: 3, lg: 3, xl: 4 },
  visibleButtons = true,
  auto = false,
  transitionDuration = 300,
  autoPlayDelay = 5000,
  pauseOnHover = true,
  carouselBg = 'gray.100',
  baseWidth = { base: 280, sm: 280, md: 280, lg: 300, xl: 320 },
  round = false,
  style = {},
  spacing = 1,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const autoPlayRef = useRef();
  const containerRef = useRef();
  
  // Smart responsive visible count
  const responsiveVisibleCount = useBreakpointValue(
    typeof visibleCount === 'object' ? visibleCount : 
    { base: 1, sm: 2, md: 2, lg: Math.min(visibleCount, 3), xl: Math.min(visibleCount, 4) },
    { fallback: 'md' }
  );
  
  // Smart responsive width calculation
  const responsiveBaseWidth = useBreakpointValue(
    typeof baseWidth === 'object' ? baseWidth : 
    { base: '100%', sm: Math.min(baseWidth, 250), md: baseWidth, lg: baseWidth, xl: baseWidth },
    { fallback: 'md' }
  );

  // Smart responsive spacing
  const responsiveSpacing = useBreakpointValue(
    typeof spacing === 'object' ? spacing : 
    { base: Math.max(spacing, 1), sm: spacing, md: spacing + 2 },
    { fallback: 'sm' }
  );

  // Calculate dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Dynamic width calculation
  const gap = responsiveSpacing; // Convert to pixels (4px per spacing unit)
  const actualVisibleCount = Math.min(responsiveVisibleCount, items.length);
  
  // Calculate item width based on container
  const calculateItemWidth = () => {
    if (typeof responsiveBaseWidth === 'string' && responsiveBaseWidth.includes('%')) {
      const containerWidth = containerDimensions.width || 800; // fallback
      const availableWidth = containerWidth - (gap * (actualVisibleCount - 1)) - 32; // padding
      return Math.max(availableWidth / actualVisibleCount, 200); // minimum 200px
    }
    return responsiveBaseWidth;
  };

  const itemWidth = calculateItemWidth();
  const maxIndex = Math.max(0, items.length - actualVisibleCount);
  const containerWidth = itemWidth * actualVisibleCount + gap * (actualVisibleCount - 1);

  const goNext = useCallback(() => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]); 

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  const jumpTo = useCallback((index) => {
    setCurrentIndex(Math.min(Math.max(index, 0), maxIndex));
  }, [maxIndex]);

  // Reset index when responsive count changes
  useEffect(() => {
    setCurrentIndex(prev => Math.min(prev, maxIndex));
  }, [maxIndex, responsiveVisibleCount]);

  // Auto-play effect
  useEffect(() => {
    if (!auto || isHovered || items.length <= actualVisibleCount) return;

    autoPlayRef.current = setInterval(goNext, autoPlayDelay);
    return () => clearInterval(autoPlayRef.current);
  }, [auto, isHovered, items.length, actualVisibleCount, autoPlayDelay, goNext]);

  // Responsive button sizes and positions
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'sm', lg: 'md' });
  const buttonOffset = useBreakpointValue({ base: 1, md: 2, lg: 4 });

  if (!items?.length || !CardComponent) {
    return (
      <Box 
        ref={containerRef}
        width="100%"
        maxWidth={{ base: '90%', md: `${containerWidth}px` }}
        height={{ base: '300px', md: '400px' }}
        bg={carouselBg}
        borderRadius={round ? "20px" : "8px"}
        display="flex"
        alignItems="center"
        justifyContent="center"
        margin="0 auto"
        px={{ base: 4, md: 0 }}
        {...style}
      >
        <Box color="gray.500" fontSize={{ base: 'md', md: 'lg' }}>
          No items to display
        </Box>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      position="relative"
      width={{ base: '100%', md: '90%' }}
      maxWidth={{ base: '100vw', md: `${containerWidth + 48}px` }}
      height="auto"
      minHeight={{ base: '350px', sm: '400px', md: '450px' }}
      bg={carouselBg}
      borderRadius={round ? { base: '12px', md: '20px' } : { base: '6px', md: '8px' }}
      overflow="hidden"
      onMouseEnter={() => pauseOnHover && setIsHovered(true)}
      onMouseLeave={() => pauseOnHover && setIsHovered(false)}
      margin="0 auto"
      px={{ base: '10px', md: 0 }}
      {...style}
    >
       {/* Navigation Buttons */}
      {visibleButtons && items.length > actualVisibleCount && (
        <>
          <IconButton
            aria-label="Previous items"
            icon={<Image src={chevronLeft} alt="Previous" width="20px" height="20px" />}
            position="absolute"
            left={buttonOffset}
            top="50%"
            transform="translateY(-50%)"
            zIndex={2}
            colorScheme="secondary"
            variant="outline"
            borderRadius="full"
            size={buttonSize}
            onClick={goPrev}
            display={{ base: currentIndex > 0 ? 'flex' : 'none', md: 'flex' }}
            bg={'secondary.300'}
            _hover={{ transform: "translateY(-50%) scale(1.1)" , backgroundColor: 'secondary.500',borderColor:'brand.600' }}
            transition="all 0.2s"
          />
          </>)}
      <Flex
        as={motion.div}
        initial={false}
        animate={{ x: -(currentIndex * (itemWidth + gap)) }}
        transition={{ duration: transitionDuration / 1000 }}
        width={`${((itemWidth + 2*gap) * items.length - gap)}px`}
        mx="auto"
        height="100%"
        justify="flex-start"
        gap={0}
        align="stretch"
        position="absolute"
        left={{ base: 0 }}
        top={0}
        py={{ base: 3, md: 4 }}
        px={{ base: "10%", md: 10 }}
      >
        {items.map((item, index) => (
          <Box
            key={`${index}-${item.id || index}`}
            width={`${itemWidth}px`}
            height="100%"
            marginRight={index !== items.length - 1 ? `${gap}px` : 0}
            flexShrink={0}
            display="flex"
            alignItems="stretch"
          >
            <Box width="100%" height="100%">
              <CardComponent item={item} />
            </Box>
          </Box>
        ))}
      </Flex>

      {/* Navigation Buttons */}
      {visibleButtons && items.length > actualVisibleCount && (
        <>
          <IconButton
            aria-label="Next items"
            icon={<Image src={chevronRight} alt="Next" width="20px" height="20px" />}
            position="absolute"
            right={buttonOffset}
            top="50%"
            transform="translateY(-50%)"
            zIndex={2}
            colorScheme="secondary"
            variant="outline"
            borderRadius="full"
            size={buttonSize}
            onClick={goNext}
            display={{ base: currentIndex < maxIndex ? 'flex' : 'none', md: 'flex' }}
            bg={'secondary.300'}
            _hover={{ transform: "translateY(-50%) scale(1.1)", backgroundColor: 'secondary.500',borderColor:'brand.600'}}
            transition="all 0.2s"
          />
        </>
      )}

      {/* Pagination Dots */}
      {items.length > actualVisibleCount && (
        <Flex
          position="absolute"
          bottom={{ base: 0, md: '8px' }}
          left={0}
          right={0}
          gap={{ base: 1, md: 2 }}
          zIndex={2}
          justify="center"
          wrap="wrap"
          px={4}
          mt={{ base: 8, md: 4 }}
        >
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <Box
              key={`dot-${index}`}
              width={{ base: '8px', md: '10px' }}
              height={{ base: '8px', md: '10px' }}
              borderRadius="full"
              bg={index === currentIndex ? "brand.500" : "gray.300"}
              cursor="pointer"
              onClick={() => jumpTo(index)}
              aria-label={`Go to slide ${index + 1}`}
              _hover={{ transform: "scale(1.3)" }}
              transform={index === currentIndex ? "scale(1.2)" : "scale(1)"}
              opacity={index === currentIndex ? 1 : 0.7}
              transition="all 0.2s"
              minWidth={{ base: '8px', md: '10px' }}
            />
          ))}
        </Flex>
      )}

      {/* Touch/Swipe indicators for mobile */}
    </Box>
  );
};