/* eslint-disable */
import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Flex,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Alert,
  Image,
  SkeletonCircle,
  useColorModeValue,
  Tooltip,
  Text,
  CloseButton,
  AlertDescription,
  AlertTitle,
  theme,

} from '@chakra-ui/react'
import 'react-datepicker/dist/react-datepicker.css'
//import { CartDemo } from "./Cart";


// Helper function to apply transparency
const applyTransparency = (hexColor, transparency = '80') => {
  return `${hexColor}${transparency}`;
}

// Alert dialogue
export const ALT = ({
  message,
  type = 'success',
  dismissible = false,
  icon,
  timeout,
  onDismiss,
}) => {
  const [show, setShow] = useState(true)
  //const { colorMode } = useColorMode();

  useEffect(() => {
    if (timeout) {
      const timer = setTimeout(() => setShow(false), timeout)
      return () => clearTimeout(timer)
    }
  }, [timeout])

  if (!show) return null

  return (
    <Alert
      status={type}
      variant="solid"
      border={'solid 2px'}
      colorScheme={
        type === 'success'
          ? 'success'
          : type === 'error'
            ? 'error'
            : type === 'warning'
              ? 'warning'
              : 'info'
      }
      borderRadius="md"
      borderColor={`${type}.400`}
      color={`${type}.700`}
      m={2}
      w={'auto'}
    >
      {icon ? icon : ''}
      <Box flex="1">
        <AlertTitle>{message.title}</AlertTitle>
        <AlertDescription>{message.description}</AlertDescription>
      </Box>
      {dismissible && (
        <CloseButton
          position="absolute"
          right="8px"
          top="8px"
          onClick={onDismiss || (() => setShow(false))}
          color={`${type}.700`}
          _hover={{ color: `${type}.900` }}
          borderColor={`${type}.700`}
        />
      )}
    </Alert>
  )
}



// Enhanced Icon Component for accordion buttons
const AccIcon = ({ 
  src, 
  alt, 
  fallback = "🍽️", 
  size = 32,
  isExpanded = false 
}) => {
  const [imageState, setImageState] = useState({
    isLoading: true,
    hasError: false,
    isLoaded: false
  })

  // Color mode values
  const iconBg = useColorModeValue('white', 'gray.100')
  const shadowColor = useColorModeValue('none', 'none')
  const errorBg = useColorModeValue('gray.50', 'gray.700')

  const handleImageLoad = useCallback(() => {
    setImageState({
      isLoading: false,
      hasError: false,
      isLoaded: true
    })
  }, [])

  const handleImageError = useCallback(() => {
    setImageState({
      isLoading: false,
      hasError: true,
      isLoaded: false
    })
  }, [])

  // Reset loading state when src changes
  useEffect(() => {
    if (src) {
      setImageState({
        isLoading: true,
        hasError: false,
        isLoaded: false
      })
    }
  }, [src])

  const containerSize = `${size}px`
  
  return (
    <Box
      position="relative"
      width={containerSize}
      height={containerSize}
      borderRadius="50%"
      backgroundColor={imageState.hasError ? errorBg : iconBg}
      padding={2}
      boxShadow={`0 2px 8px ${shadowColor}`}
      transition="all 0.3s ease"
      transform={isExpanded ? "scale(1.1)" : "scale(1)"}
      _hover={{
        transform: isExpanded ? "scale(1.15)" : "scale(1.05)",
        boxShadow: `0 4px 12px ${shadowColor}`
      }}
      overflow="hidden"
    >
      {/* Loading skeleton */}
      {imageState.isLoading && src && (
        <SkeletonCircle
          position="absolute"
          top="0px"
          left="0px"
          right="0px"
          bottom="0px"
          startColor="gray.200"
          endColor="gray.300"
          color={'brand.500'}
        />
      )}
      
      {/* Error fallback or no src */}
      {(imageState.hasError || !src) && (
        <Flex
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          alignItems="center"
          justifyContent="center"
          fontSize={`${size * 0.6}px`}
          lineHeight="1"
        >
          <Text role="img" aria-label={alt || "Menu section icon"}>
            {fallback}
          </Text>
        </Flex>
      )}
      
      {/* Actual image */}
      {src && (
        <Image
          src={src}
          alt={alt || "Menu section icon"}
          width="100%"
          height="100%"
          objectFit="contain"
          onLoad={handleImageLoad}
          onError={handleImageError}
          opacity={imageState.isLoaded ? 1 : 0}
          transition="opacity 0.3s ease"
          position="absolute"
          top="0"
          left="0"
          p={2}
        />
      )}
      
      {/* Loading indicator overlay */}
      {imageState.isLoading && src && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          width="13px"
          height="13px"
          borderRadius="50%"
          border="2px solid"
          borderColor="gray.200"
          borderTopColor="blue.500"
          animation="spin 1s linear infinite"
          sx={{
            '@keyframes spin': {
              '0%': { transform: 'translate(-50%, -50%) rotate(0deg)' },
              '100%': { transform: 'translate(-50%, -50%) rotate(360deg)' }
            }
          }}
        />
      )}
    </Box>
  )
}

// Enhanced Accordion Button Component
const EnhancedAccordionButton = ({ 
  section, 
  isExpanded, 
  index 
}) => {
  // Ensure section.theme has a fallback
  const themeColor = section.theme || '#0c705eff';
  // Use the hex color from section theme with transparency using shared function
  const buttonBg = applyTransparency(themeColor, 'ff');
  const buttonHoverBg = applyTransparency(themeColor, 'ff');
  const expandedBorderColor = applyTransparency(themeColor, '0');
  return (
    <AccordionButton
      _expanded={{
        border: `0px solid transparent`,
        bg: buttonBg,
        transform: 'translateY(-2px)',
        borderRadius: '15px 15px 0px 0px',
      }}
      sx={{
        borderColor: 'transparent', //expandedBorderColor,
        borderRadius: '15px',
        bg: buttonBg,
        color: 'brand.900',
        my: -0.5,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        //background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)', shadow
        transition: 'left 0.5s ease',
      }}
      _hover={{
        bg: buttonHoverBg,
        _before: {
          left: '100%'
        }
      }}
    >
      <Box flex="1" textAlign="left" textStyle="heading">
        <Flex align="center" gap={3}>
          <Box>
            <AccIcon
              src={typeof section.icon === 'string' ? section.icon : section.icon?.props?.src}
              alt={`${section.title} icon`}
              fallback={section.iconFallback || "🍽️"}
              size={32}
              isExpanded={isExpanded}
            />
          </Box>
          <Box>
            <Heading 
              size="md" 
              transition="all 0.2s ease"
              transform={isExpanded ? 'translateX(4px)' : 'translateX(0)'}
              color={'brand.800'}
            >
              {section.title} {''}
              {section.subtitle && (
               <small style={{marginX:'15px'}}>{section.subtitle}</small>        
              )}
            </Heading>
          </Box>
        </Flex>
      </Box>
      <AccordionIcon 
        transition="transform 0.3s ease"
        transform={isExpanded ? 'rotate(180deg) scale(1.1)' : 'rotate(0deg) scale(1)'}
        color= {'#177767ff'}// {section.theme}
        boxSize={'14'}
        p={0}
      />
    </AccordionButton>
  )
}

// Main Enhanced Accordion Component
export const ACC = ({ sections = [], expandedIndex, onToggle }) => {
  const indexValue = expandedIndex !== undefined && expandedIndex >= 0 ? [expandedIndex] : [];

  const enhancedSections = sections.map((section, index) => ({
    ...section,
    iconFallback: getIconFallback(section.title),
    subtitle: getSubtitle(section.title),
    theme: section.theme || '#03894f', // Fallback only
    // NEW: Extract transparency from section
    transparency: section.transparency || {
      cardBg: '70',
      border: '90',
      hover: '90',
      content: '40',
      title: 'aa'
    }
  }));

  return (
    <Accordion
      index={indexValue}
      onChange={(indexes) => {
        if (onToggle) {
          onToggle(indexes);
        }
      }}
      allowToggle={true}
    >
      {enhancedSections.map((section, index) => {
        const isExpanded = indexValue.includes(index);
        
        // Use section's theme with transparency
        const applyTransparency = (transparency) => `${section.theme}${transparency}`;
        const sectionBg = applyTransparency('ff');
        const sectionBorder = applyTransparency('ff');
        
        return (
          <AccordionItem
            key={`section-${index}-${section.title}`}
            id={`section-${index}`}
            data-section-name={section.title}
            border="3px solid #0c856fff"
            borderRadius="15px"
            overflow="hidden"
            transition="all 0.3s ease"
            mb={4}
            mx={2}
            bg={isExpanded ? sectionBg : 'transparent'}
            //borderColor={sectionBorder}
          >
            <h2>
              <EnhancedAccordionButton
                section={section}
                isExpanded={isExpanded}
                index={index}
              />
            </h2>
            
            <AccordionPanel
              my={0}
              p={6}
              bg={sectionBg}
              borderTop={`0px dotted transparent`}
              style={{ 
                overflowY: 'auto', 
                maxHeight: '50vh',
                transition: 'all 0.3s ease',
                borderRadius: '0 0 15px 15px',
                paddingLeft: '10px',
              }}
              sx={{
                '&::-webkit-scrollbar': {
                  width: '36px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#ffffff6f',
                  borderRadius: '15px',
                  border: '10px solid transparent',
                  backgroundClip: 'content-box',
                  width: '8px'
                },
                '&::-webkit-scrollbar-thumb': {
                  background: section.theme,
                  borderRadius: '28px',
                  border: '15px solid transparent',
                  backgroundClip: 'content-box',
                  '&:hover': {
                    background: section.theme,
                    opacity: 0.8,
                    backgroundClip: 'content-box',
                  }
                }
              }}
            >
              {section.content}
            </AccordionPanel>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
// Helper functions for enhanced sections
function getIconFallback(title) {
  const fallbacks = {
    'Salads': '🥗',
    'Soups': '🍲',
    'Proteins': '🥩',
    'Cheese': '🧀',
    'Extras': '🥄',
    'Dressings': '🫗',
    'Fruits': '🍎',
    'Make Your Own Salad': '🥗',
    'Make Your Own Fruit Salad': '🍓',
    'Our signature salad': '⭐',
    'Juices': '🧃',
    'Desserts': '🍰',
  }
  
  return fallbacks[title] || '🍽️'
}

function getSubtitle(title) {
  const subtitles = {
    'Make Your Own Salad': 'Customize your perfect salad',
    'Make Your Own Fruit Salad': 'Fresh fruit combinations',
    'Our signature salad': 'Chef\'s special recommendations'
  }
  
  return subtitles[title] || null
}