/* eslint-disable */
import { useState, useEffect, useRef } from 'react'
import { Box, Flex, IconButton, useColorMode, Button, useBreakpointValue } from '@chakra-ui/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'
import { FeaturedItemCard } from './Cards'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 30,
    },
  },
}

export const ItemsCarousel = ({
  items,
  CardComponent = FeaturedItemCard, // eslint-disable-line no-unused-vars
  visibleCount = 1,
  auto = false,
  visibleButtons = true,
  transitionDuration = 15000,
  carouselBg = 'brand.200',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { colorMode } = useColorMode()
  const { t } = useTranslation()
  const carouselRef = useRef(null)
  const carouselContentRef = useRef(null)

  // Use Chakra UI's useBreakpointValue to handle responsiveness
  const itemsToShow =
    useBreakpointValue({
      base: 1, // Mobile screens
      sm: visibleCount === 1 ? 1 : 1, // Small screens
      md: visibleCount === 1 ? 1 : 2, // Medium screens
      lg: visibleCount === 1 ? 1 : 3, // Large screens
      xl: visibleCount === 1 ? 1 : 4, // Extra-large screens
    }) || visibleCount

  const totalSlides = Math.max(1, Math.ceil(items.length / itemsToShow))
  const showControls = visibleButtons
  useEffect(() => {
    if (auto && items.length > itemsToShow) {
      const interval = setInterval(() => {
        nextSlide()
      }, transitionDuration)
      return () => clearInterval(interval)
    }
  }, [auto, items.length, itemsToShow, currentIndex, transitionDuration])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex >= totalSlides - 1 ? 0 : prevIndex + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex <= 0 ? totalSlides - 1 : prevIndex - 1))
  }

  const getVisibleItems = () => {
    if (items.length <= itemsToShow) {
      return items
    }

    const startIdx = (currentIndex * itemsToShow) % items.length
    let endIdx = startIdx + itemsToShow

    // Handle circular wrap around
    if (endIdx > items.length) {
      return [...items.slice(startIdx), ...items.slice(0, endIdx - items.length)]
    }

    return items.slice(startIdx, endIdx)
  }

  const visibleItems = getVisibleItems()

  return (
    <Flex
      position="relative"
      width="100%"
      height="auto"
      ref={carouselRef}
      align="center"
      justifyContent="center"
      overflow="hidden"
      bg={carouselBg}
      borderRadius="20px"
      py={4}
    >
      {showControls && (
        <IconButton
          icon={<ChevronLeftIcon />}
          aria-label={t('buttons.previous')}
          onClick={prevSlide}
          position="absolute"
          left={2}
          zIndex={5}
          as={Button}
          variant="solid"
          colorScheme="brand"
          sx={{
            borderRadius: '50%',
            //boxShadow: "lg",
          }}
        />
      )}

      <Box width="100%" overflow="hidden">
        <Flex
          as={motion.div}
          ref={carouselContentRef}
          width="100%"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          alignItems="center"
          justifyContent="center !important"
          flexDirection="row"
          flexWrap="nowrap"
          gap={3}
          bg={'transparent'}
          px={8}
        >
          {visibleItems.map((item, index) => (
            <Box
              key={`item-${index}-${currentIndex}`}
              as={motion.div}
              variants={itemVariants}
              flex={itemsToShow === 1 ? '0 0 auto' : `0 0 ${100 / itemsToShow}%`} // Modified this line
              maxWidth={itemsToShow === 1 ? '100%' : `${100 / itemsToShow}%`} // Modified this line
              display="flex"
              justifyContent="center"
              alignItems="center"
              px={0}
            >
              <Box width={itemsToShow === 1 ? '100%' : '100%'} px={0}>
                {' '}
                {/* Modified this line */}
                {item ? <CardComponent key={item.id} item={item} /> : <Box visibility="hidden" />}
              </Box>
            </Box>
          ))}
        </Flex>
      </Box>

      {showControls && (
        <IconButton
          icon={<ChevronRightIcon />}
          aria-label={t('buttons.next')}
          onClick={nextSlide}
          position="absolute"
          right={2}
          zIndex={5}
          as={Button}
          variant="solid"
          colorScheme="brand"
          sx={{
            borderRadius: '50%',
            //boxShadow: "lg",
          }}
        />
      )}
    </Flex>
  )
}
