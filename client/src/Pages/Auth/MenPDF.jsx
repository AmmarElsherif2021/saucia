import React, { useState, useRef, useEffect } from 'react';
import { adminAPI } from '../../API/adminAPI';
import { useReactToPrint } from 'react-to-print';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Grid,
  useToast,
  Card,
  CardBody,
  IconButton,
  Flex,
  Spinner,
  Badge,
  Divider,
  useColorModeValue,
  SimpleGrid,
  Icon,
  Image,
} from '@chakra-ui/react';
import { DownloadIcon, RepeatIcon, StarIcon, EmailIcon } from '@chakra-ui/icons';
import { FaInstagram, FaSnapchat, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { useAdminFunctions } from '../../Hooks/useAdminFunctions';
import patternImg from './admin-assets/pattern.png';
import logoIcon from './admin-assets/logo.png';
import menuIcon from './admin-assets/menuIcon.svg';
import customIcon from './admin-assets/customIcon.svg';
import currencyIcon from './admin-assets/sar.svg'
// ============================================================================
// CONFIGURATION & THEME
// ============================================================================

/**
 * Menu PDF Theme Configuration
 * Contains all styling constants, colors, gradients, and contact info
 */
const menuPDFTheme = {
  colors: {
    primary: {
      light: '#e6f0ea',
      main: '#217655ff', 
      dark: '#1d7355ff'
    },
    secondary: {
      light: '#f0f7e6',
      main: '#7faf41',
      dark: '#7faf41'
    },
    teal: {
      light: 'teal.100',
      main: 'teal.500',
      dark: 'teal.700'
    },
    warning: {
      light: 'warning.100',
      main: 'warning.500',
      dark: 'warning.700'
    }
  },
  gradients: {
    primary: 'linear(to-r, #e6f0ea, #b8d4c0)',
    secondary: 'linear(to-r, #7faf41, #6a9436)',
    primaryToSecondary: 'linear(to-r, #f0f9f4, #f0f7e6)',
    secondaryToBrand: 'linear(to-r, #f0f7e6, #e6f0ea)',
    brandGradient: 'linear(to-r, #2b5e43ff, #135231ff)',
    secondaryGradient: 'linear(to-r, #a8c97a, #7faf41)',
  },
  sizes: {
    page: {
      width: '297mm',  // A4 width in landscape
      height: '210mm', // A4 height in landscape
    },
    logo: {
      width: '60px',
      height: '60px',
    }
  },
  contactInfo: {
    whatsapp: '+966 55 108 3528',
    email: 'info@meal-service.com',
    instagram: 'salad.saucia.ksa',
    snapchat: '@saladsaucia',
    tiktok: '@salad.saucia',
    address_1: '',
    address_2: ''
  }
};

/**
 * Card styling variants for different meal types
 */
export const cardStyles = {
  regular: {
    borderColor:'brand.300',
    bg: 'white',
    borderWidth: '1px',
    boxShadow: 'none',
  },
  selective: {
    borderColor: 'secondary.500',
    bg: menuPDFTheme.colors.secondary.light,//'secondary.100',
    borderWidth: '2px',
  },
  additive: {
    borderColor: 'secondary.300',
    borderWidth: '1px',
    bg: 'white',
  }
};

/**
 * Badge styling variants for nutritional information
 */
const badgeStyles = {
  nutrition: {
    colorScheme: 'brand',
    fontSize: '3xs',
    size: 'xs',
    px: 1,
    bg: 'brand.100',
    color: 'brand.700'
  },
  protein: {
    colorScheme: 'teal',
    fontSize: '3xs',
    size: 'xs',
    px: 1,
    bg: 'teal.100',
    color: 'teal.700'
  },
  carbs: {
    colorScheme: 'secondary',
    fontSize: '3xs',
    size: 'xs',
    px: 1,
    bg: 'secondary.100',
    color: 'secondary.700'
  },
  fat: {
    colorScheme: 'warning',
    fontSize: '3xs',
    size: 'xs',
    px: 1,
    bg: 'warning.100',
    color: 'warning.700'
  },
  availability: (isAvailable) => ({
    colorScheme: isAvailable ? 'brand' : 'warning',
    fontSize: '2xs',
    size: 'sm',
    bg: isAvailable ? 'brand.100' : 'warning.100',
    color: isAvailable ? 'brand.700' : 'warning.700'
  })
};

// ============================================================================
// REUSABLE UI COMPONENTS
// ============================================================================

/**
 * Page Header Component
 * Displays the main page title with logo and icon
 * @param {string} title - English title
 * @param {string} titleArabic - Arabic title
 * @param {string} gradient - Background gradient
 * @param {string} icon - Icon image source
 */
const PageHeader = ({ title, titleArabic, gradient, icon }) => (
  <Flex 
    align="center" 
    justify="space-between" 
    mb={2}
    p={2}
    //borderRadius="lg"
    //color="white"
    boxShadow="none"
    position="relative"
    overflow="hidden"
    _before={{
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
    }}
  >
    {/* Logo Box */}
    <Box
      width={menuPDFTheme.sizes.logo.width}
      height={menuPDFTheme.sizes.logo.height}
      bg="white"
      borderRadius="lg"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      border="2px solid"
      borderColor={'brand.600'}
      fontWeight="bold"
      fontSize="xs"
      color={gradient.includes('brand') ? 'brand.500' : 'secondary.500'}
      textAlign="center"
      lineHeight="1.2"
      flexShrink={0}
      zIndex={1}
    >
      <Image src={logoIcon} sx={{width:'50px'}}/>
    </Box>

    {/* Title Container */}
    <HStack 
      spacing={4} 
      justify={'space-between'} 
      flex="1" 
      mx={3} 
      zIndex={1} 
      //borderWidth={'2px'} 
      //borderColor={'secondary.400'} 
      //bg={"rgba(236, 245, 232, 0.99)"} 
      borderRadius={"md"} 
      p={2} 
      width={'100%'}
    >
      <Heading size="md" color={'brand.700'} letterSpacing="tight" fontFamily="'Outfit', sans-serif">
        {title}
      </Heading>
      <Heading size="md" fontFamily={"'Lalezar', sans-serif"} color={'brand.700'} dir="rtl" textAlign={'right'}>
        {titleArabic}
      </Heading>
    </HStack>

    {/* Icon Box */}
    
      <Box boxSize={14} p={0}><Image src={icon}/></Box>
   
  </Flex>
);

/**
 * Section Header Component
 * Displays section title with gradient background
 * @param {string} title - English section title
 * @param {string} titleArabic - Arabic section title
 * @param {string} gradient - Background gradient
 */
const SectionHeader = ({ title, titleArabic, gradient }) => (
  <Box 
    //bgGradient={gradient}
    p={1.5}
    borderRadius="md"
    mb={1.5}
    position="relative"
    overflow="hidden"
    _before={{
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
    }}
  >
    <HStack justify={'space-between'} position="relative" zIndex={1}>
      <Heading size="xs" color={'brand.700'} fontWeight="bold" dir="rtl" fontFamily={"'Lalezar', sans-serif"}>
        {titleArabic}
      </Heading>
      <Heading size="xs" color={'brand.700'} fontWeight="bold" fontFamily={'"Outfit", sans_serif'}>
        {title}
      </Heading>
      
    </HStack>
  </Box>
);

/**
 * Nutrition Badges Component
 * Displays nutritional information badges for a meal
 * @param {Object} meal - Meal object with nutritional data
 */
const NutritionBadges = ({ meal }) => (
  <HStack spacing={1} flexWrap="wrap">
    <Badge {...badgeStyles.fat}>
      {meal.weight || 0}gm
    </Badge>
    <Badge {...badgeStyles.nutrition}>
      KCal {meal.calories || 0}
    </Badge>
    {meal.is_vegan && (
      <Badge bg="teal.100" color="teal.700" fontSize="3xs" size={'3xs'} px={1}>
        <Icon as={StarIcon} boxSize={2} mr={0.5} /> Veg
      </Badge>
    )}
    {meal.is_gluten_free && (
      <Badge bg="warning.100" color="warning.700" fontSize="3xs" size={'xs'} px={1}>
        Gluten Free
      </Badge>
    )}
  </HStack>
);

/**
 * Price Display Component
 * Shows price with currency in styled format
 * @param {number} price - Price value
 * @param {string} currency - Currency text (default: "ريال")
 * @param {string} size - Font size variant
 */
const PriceDisplay = ({ price, currency = "ريال", size = "md" }) => (
  <HStack spacing={0.25}>
    <Box 
      justifyContent={"center"} 
      bg={'warning.200'} 
      borderRadius={"md"} 
      width={'fit-content'} 
      height={"30px"} 
      p={'5px'}
      mr={'15px'}
    >
      <Text 
        fontSize={size} 
        fontWeight="black" 
        color={size === "md" ? "brand.600" : "secondary.600"}
      >
        {price || 0}
      </Text>
    </Box>
    <Text 
    fontSize={size === "md" ? "2xs" : "2xs"} 
    color={size === "md" ? "brand.600" : "secondary.600"}
    fontWeight="bold"
    fontFamily={"'Lalezar', sans-serif"}
  >
    <Image src={currencyIcon} boxSize={4} minW={'20px'} alt="SAR" />
  </Text>
  </HStack>
);

/**
 * Background Pattern Component
 * Displays the decorative background pattern
 */
const BackgroundPattern = () => (
  <Box
    position="absolute"
    top={0}
    left={0}
    right={0}
    bottom={0}
    bgImage={`url(${patternImg})`}
    bgSize="cover"
    bgPosition="center"
    opacity={0.5}
    zIndex={0}
  />
);

/**
 * Loading Spinner Component
 * Displays while data is being fetched
 */
const LoadingSpinner = () => (
  <Flex justify="center" align="center" height="400px">
    <Spinner size="xl" color="brand.500" />
    <VStack ml={4} spacing={1}>
      <Text fontWeight="bold">Loading menu data...</Text>
      <Text fontSize="sm" dir="rtl">جاري تحميل بيانات القائمة...</Text>
    </VStack>
  </Flex>
);

// ============================================================================
// MEAL CARD COMPONENTS
// ============================================================================

/**
 * Regular Meal Card Component
 * Displays a single regular (non-selective) meal
 * @param {Object} meal - Meal object with all meal data
 */
const RegularMealCard = ({ meal }) => (
  <Card 
    size="md"
    as={Flex}
    flex={'reverse'}
    variant="outline"
    {...cardStyles.regular}
    width="auto"
    height={"auto"}
    sx={{
      '@media print': {
        breakInside: 'avoid',
      }
    }}
    _hover={{
      transform: 'translateY(-1px)',
      boxShadow: 'md'
    }}
    transition="all 0.2s"
  >
    <CardBody p={'1'}>
      <HStack justify={"right"} p={0}>
        <VStack align="stretch" spacing={1}>
          {/* Meal Names */}
          <VStack align="start" spacing={0} width="full">
            <Flex 
              justify={"space-between"} 
              minW={'123%'} 
              flexDirection={meal.ingredients ? "row" : "column"}
            >  
              <Text 
                fontSize="xs" 
                fontWeight="bold" 
                color="brand.600" 
                dir="rtl" 
                fontFamily={"'Lalezar', sans-serif"}
              >
                {meal.name_arabic || meal.name} 
              </Text>
              <Text textAlign={'left'} fontSize="2xs" fontWeight="bold" color="brand.700" fontFamily={'"Outfit", sans_serif'}>
                {meal.name}
              </Text>
              
            </Flex>
            <Text 
              fontSize={"2xs"} 
              fontWeight={'light'} 
              color={"secondary.800"} 
              fontFamily={"'Lalezar', sans_serif"}
            >
              {meal.ingredients_arabic}
            </Text>
            <Text 
              fontSize={"3xs"} 
              fontWeight={'light'} 
              color={"secondary.800"} 
              fontFamily={"'Lalezar', sans_serif"}
            >
              {meal.ingredients}
            </Text>
          </VStack>
        
        </VStack>
        
        {/* Price */}
        <Flex align={'center'} justify="flex-end">
          <PriceDisplay price={meal.base_price} />
          <Box 
            w={3} 
            h={3} 
            border={'solid 2px'} 
            borderColor={'brand.600'} 
            mr={"5px"}
          />
        </Flex>
      </HStack>
       <NutritionBadges meal={meal} />
    </CardBody>
  </Card>
);

/**
 * Selective Meal Card Component
 * Displays a selective (build-your-own) meal header
 * @param {Object} meal - Meal object with all meal data
 */
const SelectiveMealCard = ({ meal }) => (
  <Card 
    size="sm"
    variant="outline"
    {...cardStyles.selective}
    width="full"
    mb={1}
    _hover={{
      transform: 'translateY(-1px)',
    }}
    transition="all 0.2s"
  >
    <CardBody p={0.5}>
      <VStack align="stretch" spacing={0.5}>
        <HStack justify="space-between">
          <VStack align="start" spacing={0}>
            <Text 
              fontSize="xs" 
              fontFamily={"'Lalezar',sans_serif"} 
              fontWeight="bold" 
              color="secondary.700" 
              dir="rtl"
            >
              {meal.name_arabic || meal.name}
            </Text>
            <Text fontSize="2xs" fontWeight="bold" color="secondary.800">
              {meal.name}
            </Text>
          </VStack>
          <VStack spacing={0} align="end">
            <PriceDisplay price={meal.base_price} currency="ريال" size="md" />
            <Text 
              fontSize="3xs" 
              color="secondary.600" 
              fontFamily={'"Lalezar",sans_serif'} 
              dir="rtl"
            >
              + إضافات
            </Text>
          </VStack>
        </HStack>
        <NutritionBadges meal={meal} />
      </VStack>
    </CardBody>
  </Card>
);

/**
 * Item Category Header Component
 * Displays category name and free item info for selective meals
 * @param {string} category - Category name in English
 * @param {string} categoryArabic - Category name in Arabic
 * @param {number} maxFreeItems - Maximum free items allowed
 */
const ItemCategoryHeader = ({ category, categoryArabic, maxFreeItems, price }) => (
  <Flex 
    justify="space-between" 
    align="center" 
    p={0.5}
    bgGradient={`linear(to-r, secondary.900 , brand.700)`} //${'brand.700'}
    borderRadius="sm"
    mb={0.5}
         dir='rtl'

  >
    <HStack justifyContent="space-between" w="100%">
      
      <Text 
        fontSize="xs" 
        color="secondary.50" 
        dir="rtl" 
        fontFamily={"'Lalezar',sans_serif"} 
        textAlign="right"
        mb={0}
        pb={0}
      >
        {categoryArabic}
        {' '}
        {maxFreeItems > 0 && (
          <Text
            as="span"
            display="inline-block"
            dir="rtl"
            style={{ direction: 'rtl', unicodeBidi: 'isolate', textAlign: 'right' }}
            fontSize="2xs"
            fontWeight={600}
            mr={1}
            mt={0}
            pt={0}
            color={'secondary.50'}
            fontFamily={'"harmattan",sans_serif'}
          >
            اختر حتى {maxFreeItems} عنصر مجاني، الزيادة بـ {price} ريال
          </Text>
        )}
      </Text>

      <Text fontFamily={'"Outfit", sans_serif'} fontSize="xs" fontWeight="bold" color="secondary.50" textAlign={'left'} pb={0} mb={0}>
        {category}
        {' '}
        {maxFreeItems > 0 && (
          <Text as="span" fontFamily={'"Outfit", sans_serif'} display="inline-block" ml={1} fontSize="2xs" color="secondary.50">
            pick up to {maxFreeItems} free items, extra item {price} SAR
          </Text>
        )}
      </Text>
    </HStack>
  </Flex>
);

/**
 * Additive Item Component
 * Displays individual additive items for selective meals
 * @param {Object} item - Item object with all item data
 */
const AdditiveItem = ({ item }) => (
  <Box
    p={0.5}
    {...cardStyles.additive}
    borderRadius="md"
    fontSize="2xs"
    width="fit-content"  // Changed from "full" to "fit-content"
    minW="fit-content"    // Ensure minimum width fits content
    height="fit-content"  // Fixed height
    _hover={{
      bg: 'secondary.50',
      transform: 'scale(1.02)'
    }}
    transition="all 0.1s"
  >
    <Flex justify="space-between" align="center" gap={0.5}>
      <VStack align="start" spacing={0} flex="1" minW="0">
        <Text 
          color="brand.700" 
          dir="rtl" 
          whiteSpace="nowrap"  // Prevent text wrapping
          fontSize="sm" 
          fontFamily={"'Lalezar',sans_serif"}
        >
          {item.name_arabic || item.name}
        </Text>
        <Text 
          fontWeight="semibold" 
          color="secondary.700" 
          whiteSpace="nowrap"  // Prevent text wrapping
          fontSize="3xs"
        >
          {item.name}
        </Text>
        {item.description && (
          <Text 
            fontWeight="semibold" 
            color="gray.800" 
            whiteSpace="nowrap"  // Prevent text wrapping
            fontSize="3xs"
          >
            {item.description}
          </Text>
        )}
      </VStack>
      
      <VStack spacing={0.25} flexShrink={0}>
        {item.max_free_per_meal === 0 && (
          <HStack borderRadius={'sm'} spacing={0} ml={1} bg={'secondary.200'}>
            <Text fontFamily={"'Lalezar',sans_serif"} color="secondary.900" fontSize="xs">
              ريال
            </Text>
            <Text fontWeight="bold" color="secondary.900" fontSize="xs">
              +{item.price || 0}
            </Text>
          </HStack>
        )}
        {item.weight && item.weight>0 && <Badge ml={1} {...badgeStyles.fat}>
          {item.weight}gm
        </Badge>}
        <Badge ml={1} {...badgeStyles.nutrition}>
          {item.calories || 0}kcal
        </Badge>
      </VStack>
      <Box 
        w={2} 
        h={2} 
        border={'solid 1px'} 
        borderColor={'brand.600'} 
        ml={1}
        flexShrink={0}
      />
    </Flex>
  </Box>
);

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

/**
 * Regular Meals Section Component
 * Displays all regular meals organized by section in masonry layout
 * @param {Object} regularMealsBySection - Object containing meals grouped by section
 */
const RegularMealsSection = ({ regularMealsBySection }) => (
  <Box 
    flex="1"
    overflow="hidden"
    maxHeight="calc(100% - 70px)"
    
  >
    <Box 
      sx={{
        columnCount: 2,
        columnGap: '8px',
        height: '100%',
        '@media print': {
          columnCount: 2,
        }
      }}
    >
      {Object.entries(regularMealsBySection)
        .sort(([sectionA, dataA], [sectionB, dataB]) => dataB.meals.length - dataA.meals.length)
        .map(([section, sectionData]) => (
          <Box 
            key={section}
            sx={{
              breakInside: 'avoid',
              pageBreakInside: 'avoid',
              display: 'inline-block',
              width: '100%',
              marginBottom: '3px'
            }}
          >
            <SectionHeader
              title={section}
              titleArabic={sectionData.section_arabic}
              gradient={menuPDFTheme.gradients.brandGradient}
            />

            {/* Meals Grid */}
            <Box
              className="masonry-grid"
                  borderRadius="md"
                  border={'dashed'}
                  borderColor={'secondary.300'}
                  p={1}
              sx={{
                height: 'fit-content',
                columnCount: sectionData.meals[0].ingredients ? 2 : 3,
                columnGap: '2px',
                '& > *': {
                  breakInside: 'avoid',
                  mb: '2px',
                }
              }}
            >
              {sectionData.meals.map((meal) => (
                <RegularMealCard key={meal.id} meal={meal} />
              ))}
            </Box>
          </Box>
        ))}
    </Box>
  </Box>
);

/**
 * Selective Meals Section Component
 * Displays all selective meals with their categorized items
 * @param {Object} selectiveMealsWithItems - Object containing selective meals with items
 */
const SelectiveMealsSection = ({ selectiveMealsWithItems }) => (
  <Box flex="1" overflow="hidden" maxHeight="calc(100% - 140px)">
    <Grid templateColumns="repeat(1, 1fr)" gap={3} height="100%">
      {Object.entries(selectiveMealsWithItems).map(([section, sectionData]) => (
        <Box key={section}>
          <SectionHeader
            title={section}
            titleArabic={sectionData.section_arabic}
            gradient={menuPDFTheme.gradients.brandGradient}
          />

          {/* Selective Meals with their Items */}
          <Box
            className="masonry-grid"
            sx={{
              columnCount: { base: 1 },
              columnGap: '8px',
              '& > *': {
                breakInside: 'avoid',
                mb: '8px',
              }
            }}
          >
            {sectionData.meals.map((meal) => (
              <Box key={meal.id} width="full">
                {/* Meal Card */}
                <SelectiveMealCard meal={meal} />

                {/* Categorized Items */}
                {meal.itemsByCategory && Object.keys(meal.itemsByCategory).length > 0 && (
                  <Box
                    className="nested-masonry"
                    sx={{
                      columnCount: 3,
                      columnGap: '8px',
                      ml: 2,
                      mt: 1,
                      '& > *': {
                        breakInside: 'avoid',
                        mb: '8px',
                      }
                    }}
                  >
                    {Object.entries(meal.itemsByCategory).map(([category, categoryData]) => (
                      <Box key={category} mb={1}>
                        <ItemCategoryHeader
                          category={category}
                          categoryArabic={categoryData.categoryArabic}
                          maxFreeItems={categoryData.items[0]?.max_free_per_meal || 0}
                          price={categoryData.items[0]?.max_free_per_meal ? categoryData.items[0]?.price : null}
                        />

                        {/* Items - Horizontal Masonry Layout */}
                        <Flex
                          flexWrap="wrap"
                          gap={0.5}
                          alignItems="flex-start"
                        >
                          {categoryData.items.map((item) => (
                            <AdditiveItem key={item.id} item={item} />
                          ))}
                        </Flex>
                        {category==='dressings' &&                        
                        <HStack
                          mt={1}
                          p={0.5}
                          {...cardStyles.additive}
                          borderRadius="md"
                          fontSize="2xs"
                          width="auto"  // Changed from "full" to "fit-content"
                          minW="fit-content"    // Ensure minimum width fits content
                          height="fit-content"  // Fixed height
                          _hover={{
                            bg: 'secondary.50',
                            transform: 'scale(1.02)'
                          }}
                          transition="all 0.1s"
                        >
                            <HStack align="stretch" p={0} w={'auto'} spacing={1} flex="1">
                         
                                <Box 
                              w={3} 
                              h={3} 
                              border={'solid 1px'} 
                              borderColor={'brand.600'} 
                              ml={1}
                              flexShrink={0}
                            /> 
                            <Text fontSize={'6xs'}>Inside</Text><Text fontFamily={'"Lalezar", sans_serif'} fontSize={'2xs'}>داخلي </Text> 
                      
                              <Text 
                                fontWeight="semibold" 
                                color="gray.800" 
                                whiteSpace="nowrap"  // Prevent text wrapping
                                fontSize="3xs"
                              >
                              </Text>
                            </HStack>

                            <HStack align="center" w={'auto'} spacing={1} flex="1">
                          
                                <Box 
                              w={3} 
                              h={3} 
                              border={'solid 1px'} 
                              borderColor={'brand.600'} 
                              ml={1}
                              flexShrink={0}
                            /> <Text  fontSize={'6xs'}>External</Text><Text fontFamily={'"Lalezar", sans_serif'} fontSize={'2xs'}>خارجي </Text>                     
                            </HStack>
                            </HStack>
                      }
                      </Box>
                    ))}
                   
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Grid>
  </Box>
);

/**
 * Footer Component
 * Displays contact information and QR code placeholder
 */
const Footer = () => (
  <Box mt={0.5} p={0.5} h={'5mm'}>
    <Grid templateColumns="1fr auto" gap={2} alignItems="center" >
      {/* Contact Information */}
      <Box p={1.5}>
        <SimpleGrid columns={2} spacing={1} fontSize="xs">
          {/* Left Column */}
          <Box textAlign="left">
            <VStack align="start" spacing={0}>
              <Text color="brand.600" fontSize="sm">
                <Icon as={FaWhatsapp} boxSize={3} ml={2} />
                {menuPDFTheme.contactInfo.whatsapp}
              </Text>
              <Text color="brand.600" fontSize="sm">
                <Icon as={EmailIcon} boxSize={3} ml={2} />
                {menuPDFTheme.contactInfo.email}
              </Text>
            </VStack>
          </Box>
          {/* Right Column */}
          <Box textAlign="right">
            <VStack align="end" spacing={0}>
              <Text color="brand.600" fontSize="sm">
                {menuPDFTheme.contactInfo.instagram}{` `}
                <Icon as={FaInstagram} boxSize={3} mr={1}/>
              </Text>
              <Text color="brand.600" fontSize="sm">
                {menuPDFTheme.contactInfo.snapchat}{` `}
                <Icon as={FaSnapchat} boxSize={3} mr={1}/>
              </Text>
              <Text color="brand.600" fontSize="sm">
                {menuPDFTheme.contactInfo.tiktok} {` `}
                <Icon as={FaTiktok} boxSize={3} mr={1}/>
              </Text>
            </VStack>
          </Box>
        </SimpleGrid>
      </Box>
     
      {/* QR Code Placeholder */}
      {/* <VStack spacing={0.5}>
        <Box
          width="40px"
          height="40px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text color="gray.500" fontSize="3xs" textAlign="center" fontWeight="bold">
            QR
            <br />
            كود
          </Text>
        </Box>
        <Text fontSize="3xs" fontWeight="bold" color="gray.700">
          امسح للطلب
        </Text>
      </VStack> */}
    </Grid>
   
    <Divider my={1} borderColor="gray.200" />
   
    {/* Generation Date */}
    <VStack spacing={0}>
      <Text fontSize="3xs" color="gray.600" textAlign="center">
        Generated: {new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })}
      </Text>
      <Text fontSize="3xs" color="gray.600" textAlign="center" dir="rtl">
        تاريخ الإنشاء: {new Date().toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </Text>
    </VStack>
  </Box>
);

// ============================================================================
// PAGE COMPONENTS
// ============================================================================

/**
 * Page 1: Regular Meals Page
 * Displays all regular (non-selective) meals in 2-column masonry layout
 * @param {Object} regularMealsBySection - Regular meals grouped by section
 */
const RegularMealsPage = ({ regularMealsBySection }) => (
  <Box 
    {...menuPDFTheme.sizes.page}
    bg="white"
    padding={2}
    position="relative"
    overflow="hidden"
    sx={{
      '@media print': {
        pageBreakAfter: 'always',
        overflow: 'hidden !important',
      }
    }}
  >
    <BackgroundPattern />
    
    <Box position="relative" zIndex="1" p={3} height="100%" display="flex" flexDirection="column">
      <PageHeader
        title="Meal Service Menu"
        titleArabic="قائمة خدمة الوجبات"
        gradient={menuPDFTheme.gradients.brandGradient}
        icon={menuIcon}
      />
      
      <RegularMealsSection regularMealsBySection={regularMealsBySection} />
    </Box>
  </Box>
);

/**
 * Page 2: Selective Meals Page
 * Displays all selective (build-your-own) meals with their categorized items
 * @param {Object} selectiveMealsWithItems - Selective meals with items grouped by category
 */
const SelectiveMealsPage = ({ selectiveMealsWithItems }) => (
  <Box 
    {...menuPDFTheme.sizes.page}
    bg="white"
    position="relative"
    overflow="hidden"
  >
    <BackgroundPattern />
    
    <Box position="relative" zIndex="1" p={3} height="100%" display="flex" flexDirection="column">
      <PageHeader
        title="Build Your Own"
        titleArabic="اصنع وجبتك الخاصة"
        gradient={menuPDFTheme.gradients.secondaryGradient}
        icon={customIcon}
      />
      
      <SelectiveMealsSection selectiveMealsWithItems={selectiveMealsWithItems} />
      
      <Footer />
    </Box>
  </Box>
);

/**
 * Control Header Component
 * Displays the control panel with refresh and print buttons
 * @param {Function} handleRefresh - Function to refresh data
 * @param {Function} handlePrint - Function to trigger print
 * @param {boolean} isRefetching - Loading state for refresh
 * @param {boolean} isPrinting - Loading state for printing
 */
const ControlHeader = ({ handleRefresh, handlePrint, isRefetching, isPrinting }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Flex 
      justify="space-between" 
      align="center" 
      mb={2} 
      p={4} 
      bg={bgColor} 
      borderRadius="lg" 
      border="1px" 
      borderColor={borderColor} 
      boxShadow="sm" 
      className="no-print"
    >
      <VStack align="start" spacing={1}>
        <Heading size="lg" color="brand.600" bgGradient="linear(to-r, brand.500, brand.700)" bgClip="text">
          A4 Landscape Menu Print Portal
        </Heading>
        <Text color="gray.600">بوابة قائمة الطباعة بحجم A4 أفقي</Text>
        <Text fontSize="sm" color="gray.500">
          Generate stunning printable menu (2 A4 landscape pages)
        </Text>
      </VStack>
      
      <HStack spacing={3}>
        <IconButton
          icon={<RepeatIcon />}
          onClick={handleRefresh}
          isLoading={isRefetching}
          aria-label="Refresh data / تحديث البيانات"
          colorScheme="brand"
          variant="outline"
        />
        <Button
          leftIcon={<DownloadIcon />}
          onClick={handlePrint}
          isLoading={isPrinting}
          loadingText="جاري التحضير..."
          colorScheme="brand"
          size="lg"
          bgGradient="linear(to-r, brand.400, brand.600)"
          _hover={{
            bgGradient: 'linear(to-r, brand.500, brand.700)',
            transform: 'translateY(-2px)',
            boxShadow: 'lg'
          }}
          transition="all 0.2s"
        >
          Print Menu / طباعة
        </Button>
      </HStack>
    </Flex>
  );
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

/**
 * Custom Hook: useMealItemsData
 * Fetches meal items for all selective meals
 */
const useMealItemsData = (selectiveMealIds) => {
  const { useGetMealItems } = useAdminFunctions();
  const [mealItemsMap, setMealItemsMap] = useState({});

  useEffect(() => {
    if (!selectiveMealIds.length) return;

    const fetchAllMealItems = async () => {
      const itemsMap = {};
      
      for (const mealId of selectiveMealIds) {
        try {
          // You'll need to modify useGetMealItems to support direct API call
          // or create a new function in adminAPI that can be called directly
          const items = await adminAPI.getMealItems(mealId);
          itemsMap[mealId] = items;
          console.log(`Fetched ${items.length} items for meal ${mealId}`);
        } catch (error) {
          console.error(`Error fetching items for meal ${mealId}:`, error);
          itemsMap[mealId] = [];
        }
      }
      
      setMealItemsMap(itemsMap);
    };

    fetchAllMealItems();
  }, [selectiveMealIds]);

  return mealItemsMap;
};

/**
 * Custom Hook: useMenuData
 * Handles fetching and organizing menu data
 * @returns {Object} Menu data and loading states
 */
const useMenuData = () => {
  const { 
    useGetAllMeals,
    useGetAllItems,
  } = useAdminFunctions();

  // Fetch meals
  const { 
    data: mealsData = [], 
    isLoading: isLoadingMeals, 
    refetch: refetchMeals,
    isRefetching: isRefetchingMeals
  } = useGetAllMeals({ 
    limit: 1000,
    select: `*, meal_items(*), meal_allergies(allergies(id, name))`
  });

  const { 
    data: itemsData = [], 
    isLoading: isLoadingItems, 
    refetch: refetchItems,
    isRefetching: isRefetchingItems
  } = useGetAllItems({ limit: 1000 });

  // Get selective meal IDs
  const selectiveMealIds = React.useMemo(() => {
    if (!mealsData || !Array.isArray(mealsData)) return [];
    return mealsData
      .filter(meal => meal.is_selective)
      .map(meal => meal.id);
  }, [mealsData]);

  // Fetch meal items for selective meals
  const mealItemsMap = useMealItemsData(selectiveMealIds);

  const isLoading = isLoadingMeals || isLoadingItems;
  const isRefetching = isRefetchingMeals || isRefetchingItems;

  // Process selective meals with their items
  const selectiveMealsWithItems = React.useMemo(() => {
    if (!mealsData || !Array.isArray(mealsData) || !itemsData || !Array.isArray(itemsData)) {
      return {};
    }
    
    const selectiveMeals = mealsData.filter(meal => meal.is_selective);
    const result = {};
    
    selectiveMeals.forEach(meal => {
      const section = meal.section || 'Other';
      if (!result[section]) {
        result[section] = {
          meals: [],
          section_arabic: meal.section_arabic || section
        };
      }
      
      let mealItems = [];
      const mealItemIds = mealItemsMap[meal.id] || [];
      
      console.log(`Processing meal ${meal.id} (${meal.name}) with item IDs:`, mealItemIds);
      
      if (mealItemIds.length > 0) {
        mealItems = mealItemIds
          .map(itemId => itemsData.find(item => item.id === itemId))
          .filter(item => item && item.is_available);
          
        console.log(`Found ${mealItems.length} items for meal ${meal.name}`, mealItems);
      } else {
        console.log(`No meal items found for meal: ${meal.name} (${meal.id})`);
        
        // Fallback: try to use meal.item_ids if available
        if (meal.item_ids && Array.isArray(meal.item_ids)) {
          mealItems = meal.item_ids
            .map(itemId => itemsData.find(item => item.id === itemId))
            .filter(item => item && item.is_available);
        }
      }

      const itemsByCategory = {};
      if (mealItems.length > 0) {
        mealItems.forEach(item => {
          const category = item.category || 'Other';
          if (!itemsByCategory[category]) {
            itemsByCategory[category] = {
              items: [],
              categoryArabic: item.category_arabic || category
            };
          }
          itemsByCategory[category].items.push(item);
        });
      } else {
        console.warn(`No items found for selective meal: ${meal.name} (ID: ${meal.id})`);
      }
      
      result[section].meals.push({
        ...meal,
        items: mealItems,
        itemsByCategory
      });
    });
    
    console.log('Processed selective meals with items:', result);
    return result;
  }, [mealsData, itemsData, mealItemsMap]);

  // Process regular meals (non-selective) - same as before
  const regularMealsBySection = React.useMemo(() => {
    if (!mealsData || !Array.isArray(mealsData)) {
      return {};
    }
    
    return mealsData
      .filter(meal => !meal.is_selective)
      .reduce((acc, meal) => {
        const section = meal.section || 'Other';
        if (!acc[section]) {
          acc[section] = {
            meals: [],
            section_arabic: meal.section_arabic || section
          };
        }
        acc[section].meals.push(meal);
        return acc;
      }, {});
  }, [mealsData]);

  return {
    selectiveMealsWithItems,
    regularMealsBySection,
    isLoading,
    isRefetching,
    refetchMeals,
    refetchItems
  };
};

/**
 * Custom Hook: usePrintHandler
 * Handles print functionality and state management
 * @param {React.RefObject} menuRef - Reference to menu content
 * @returns {Object} Print handler and state
 */
const usePrintHandler = (menuRef) => {
  const toast = useToast();
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = useReactToPrint({
    contentRef: menuRef,
    documentTitle: `Menu-A4-Landscape-${new Date().toISOString().split('T')[0]}`,
    onBeforeGetContent: () => {
      setIsPrinting(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsPrinting(false);
      toast({
        title: 'تم التحضير للطباعة بنجاح',
        description: 'Print dialog opened successfully',
        status: 'success',
        duration: 3000,
      });
    },
    onPrintError: (error) => {
      setIsPrinting(false);
      console.error('Print error:', error);
      toast({
        title: 'خطأ في الطباعة',
        description: 'Error preparing print',
        status: 'error',
        duration: 5000,
      });
    },
    pageStyle: `
      @page {
        size: A4 landscape;
        margin: 0;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `
  });

  return { handlePrint, isPrinting };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * MenuPDFPortal - Main Component
 * Orchestrates the entire menu PDF generation and printing functionality
 */
const MenuPDFPortal = () => {
  const toast = useToast();
  const menuRef = useRef();

  // Fetch and organize menu data
  const {
    selectiveMealsWithItems,
    regularMealsBySection,
    isLoading,
    isRefetching,
    refetchMeals,
    refetchItems
  } = useMenuData();

  // Handle printing
  const { handlePrint, isPrinting } = usePrintHandler(menuRef);
  useEffect(()=>{
    console.log(`Items data from menuPDF ${JSON.stringify(selectiveMealsWithItems)}`)
  },[]) // returns empty object
  // Refresh data handler
  const handleRefresh = async () => {
    try {
      await Promise.all([refetchMeals(), refetchItems()]);
      toast({
        title: 'تم تحديث البيانات',
        description: 'Data refreshed successfully',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'خطأ في تحديث البيانات',
        description: 'Error refreshing data',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Show loading spinner while fetching initial data
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box p={2}>
      {/* Control Header */}
      <ControlHeader
        handleRefresh={handleRefresh}
        handlePrint={handlePrint}
        isRefetching={isRefetching}
        isPrinting={isPrinting}
      />

      {/* Menu Content for Print - 2 A4 Landscape Pages */}
      <Box ref={menuRef}>
        {/* Page 1: Regular Meals */}
        <RegularMealsPage regularMealsBySection={regularMealsBySection} />

        {/* Page 2: Selective Meals */}
        <SelectiveMealsPage selectiveMealsWithItems={selectiveMealsWithItems} />
      </Box>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            color-adjust: exact;
          }
        }
      `}</style>
    </Box>
  );
};

export default MenuPDFPortal;