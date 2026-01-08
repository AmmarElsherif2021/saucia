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
  Tooltip,
} from '@chakra-ui/react';
import { DownloadIcon, RepeatIcon, StarIcon, EmailIcon } from '@chakra-ui/icons';
import { FaInstagram, FaSnapchat, FaTiktok, FaWhatsapp } from 'react-icons/fa';
import { useAdminFunctions } from '../../Hooks/useAdminFunctions';
import patternImg from './admin-assets/pattern.png';
import logoIcon from './admin-assets/logo.png';
import menuIcon from './admin-assets/menuIcon.svg';
import customIcon from './admin-assets/customIcon.svg';
import currencyIcon from './admin-assets/sar.svg';
import dairyIcon from './admin-assets/dairyIcon.svg';
import eggIcon from './admin-assets/eggIcon.svg';
import glutenIcon from './admin-assets/glutenIcon.svg';
import mustardIcon from './admin-assets/mustardIcon.svg';
import nutsIcon from './admin-assets/nutsIcon.svg';
import sesameIcon from './admin-assets/sesameIcon.svg';
import shellIcon from './admin-assets/shellIcon.svg';
import soyIcon from './admin-assets/soyIcon.svg';
import qrImage from './admin-assets/qr.jpg';
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
    A4: {
      width: '297mm',
      height: '210mm',
    },
    A5: {
      width: '210mm',
      height: '148mm',
    },
    logo: {
      width: '40px',
      height: '40px',
    }
  },
  contactInfo: {
    whatsapp: '+966 55 108 3528',
    email: 'saladsaucia@gmail.com',
    instagram: 'salad.saucia.ksa',
    snapchat: '@saladsaucia',
    tiktok: '@salad.saucia',
    address_1: '',
    address_2: ''
  },
  arabicText: {
    regularMenu: "قائمة وجبات سالاد صوصيا",
    buildYourOwn: "اصنع طبقك المفضل",
    selectUpTo: "اختر حتى",
    freeItems: "عناصر مجانية",
    extraItem: "للعنصر الإضافي",
    sar: "ريال ",
    scanToOrder: "امسح للطلب السريع",
    contactUs: "تواصل معنا",
    followUs: "تابعنا على",
    generatedOn: "تم الإنشاء في",
    inside: "داخلي",
    external: "خارجي",
    vegan: "نباتي",
    glutenFree: "خالي من الجلوتين",
    calories: "سعرة حرارية",
    weight: "جرام",
    allergyGuide: "دليل الحساسية"
  },
  allergyIcons: {
    dairy: dairyIcon,
    egg: eggIcon,
    gluten: glutenIcon,
    mustard: mustardIcon,
    nuts: nutsIcon,
    sesame: sesameIcon,
    shellfish: shellIcon,
    soy: soyIcon
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
    bg: menuPDFTheme.colors.secondary.light,
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
// ALLERGY ICON COMPONENT
// ============================================================================

/**
 * Allergy Icons Component
 * Displays allergy icons for meals or items
 */

const AllergyIcons = ({ allergies, size = 3 }) => {
  if (!allergies || allergies.length === 0) return null;

  const getAllergyIcon = (allergyName) => {
    const lowerName = allergyName.toLowerCase();
    if (lowerName.includes('dairy') || lowerName.includes('milk')) return menuPDFTheme.allergyIcons.dairy;
    if (lowerName.includes('egg')) return menuPDFTheme.allergyIcons.egg;
    if (lowerName.includes('gluten') || lowerName.includes('wheat')) return menuPDFTheme.allergyIcons.gluten;
    if (lowerName.includes('mustard')) return menuPDFTheme.allergyIcons.mustard;
    if (lowerName.includes('nut') || lowerName.includes('peanut')) return menuPDFTheme.allergyIcons.nuts;
    if (lowerName.includes('sesame')) return menuPDFTheme.allergyIcons.sesame;
    if (lowerName.includes('shell') || lowerName.includes('seafood') || lowerName.includes('fish')) return menuPDFTheme.allergyIcons.shellfish;
    if (lowerName.includes('soy')) return menuPDFTheme.allergyIcons.soy;
    return null;
  };

  // Normalize allergies array to handle different data structures
  const normalizedAllergies = allergies.map(allergy => {
    // For regular meals: {id: 8, name: "Sesame"}
    if (allergy.name) {
      return { name: allergy.name };
    }
    // For additive items: {allergies: {id: 7, name: "Fish", ...}}
    else if (allergy.allergies && allergy.allergies.name) {
      return { name: allergy.allergies.name };
    }
    // For direct allergy objects in items array
    else if (typeof allergy === 'object') {
      return { name: Object.values(allergy).find(val => val && typeof val === 'string' && (val.includes('Dairy') || val.includes('Egg') || val.includes('Gluten') || val.includes('Mustard') || val.includes('Nut') || val.includes('Sesame') || val.includes('Shell') || val.includes('Soy') || val.includes('Fish'))) || '' };
    }
    return null;
  }).filter(allergy => allergy && allergy.name);

  return (
    <HStack m={0} bg={'yellow.300'} w={'70%'}borderRadius={'md'} mx={'1px'} spacing={0.5} flexWrap="wrap" align={'center'} justify={'center'}>
      {normalizedAllergies.map((allergy, index) => {
        const icon = getAllergyIcon(allergy.name);
        if (!icon) return null;
        
        return (
          <Tooltip key={index} label={allergy.name} fontSize="2xs">
            <Image 
              src={icon} 
              boxSize={size} 
              alt={allergy.name}
            />
          </Tooltip>
        );
      })}
    </HStack>
  );
};


/**
 * Allergy Guide Component
 * Displays legend for allergy icons
 */
const AllergyGuide = ({ isA5 }) => (
  <Box 
    my={1} 
    p={isA5 ? 1 : 1.5} 
    bg="yellow.200" 
    borderRadius="md" 
    border="3px solid" 
    borderColor="orange.200"
    w={'70%'}
    alignSelf={'start'}
    py={'0.5px'}
  >
    <Text fontSize={isA5 ? "2xs" : "xs"} fontWeight="bold" mb={1} textAlign="center" fontFamily={'"Lalezar",sans_serif'}>
      {menuPDFTheme.arabicText.allergyGuide} / Allergy Guide
    </Text>
    <SimpleGrid columns={4} spacing={1}>
      <HStack spacing={1}>
        <Image src={dairyIcon} boxSize={isA5 ? 3 : 4} />
        <VStack spacing={0}>
          <Text fontSize="3xs">Dairy</Text>
          <Text fontFamily={'"Lalezar",sans_serif'} fontSize="3xs">حليب</Text>
        </VStack>
      </HStack>
      <HStack spacing={1}>
        <Image src={eggIcon} boxSize={isA5 ? 3 : 4} />
        <VStack spacing={0}>
          <Text fontSize="3xs">Egg</Text>
          <Text fontFamily={'"Lalezar",sans_serif'} fontSize="3xs">بيض</Text>
        </VStack>
      </HStack>
      <HStack spacing={1}>
        <Image src={glutenIcon} boxSize={isA5 ? 3 : 4} />
        
        <VStack spacing={0}>
          <Text fontSize="3xs">Gluten</Text>
          <Text fontFamily={'"Lalezar",sans_serif'} fontSize="3xs">جلوتين</Text>
        </VStack>
      </HStack>
      <HStack spacing={1}>
        <Image src={mustardIcon} boxSize={isA5 ? 3 : 4} />
        <VStack spacing={0}>
          <Text fontSize="3xs">Mustard</Text>
          <Text fontFamily={'"Lalezar",sans_serif'} fontSize="3xs">خردل</Text>
        </VStack>
      </HStack>
      <HStack spacing={1}>
        <Image src={nutsIcon} boxSize={isA5 ? 3 : 4} />
        <VStack spacing={0}>
          <Text fontSize="3xs">Nuts</Text>
          <Text fontFamily={'"Lalezar",sans_serif'} fontSize="3xs">مكسرات</Text>
        </VStack>        
      </HStack>
      <HStack spacing={1}>
        <Image src={sesameIcon} boxSize={isA5 ? 3 : 4} />
        <VStack spacing={0}>
          <Text fontSize="3xs">Sesame</Text>
          <Text fontFamily={'"Lalezar",sans_serif'} fontSize="3xs">سمسم</Text>
        </VStack>
      </HStack>
      <HStack spacing={1}>
        <Image src={shellIcon} boxSize={isA5 ? 3 : 4} />
        <VStack spacing={0}>
          <Text fontSize="3xs">Shellfish</Text>
          <Text fontFamily={'"Lalezar",sans_serif'} fontSize="3xs">المحار</Text>
        </VStack>
      </HStack>
      <HStack spacing={1}>
        <Image src={soyIcon} boxSize={isA5 ? 3 : 4} />
        <VStack spacing={0}>
          <Text fontSize="3xs">Soy</Text>
          <Text fontFamily={'"Lalezar",sans_serif'} fontSize="3xs">صويا</Text>
        </VStack>
      </HStack>
    </SimpleGrid>
  </Box>
);

// ============================================================================
// CONTROL HEADER
// ============================================================================

const ControlHeader = ({ 
  handleRefresh, 
  handlePrint, 
  isRefetching, 
  isPrinting,
  printSize,
  onPrintSizeChange 
}) => {
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
          Menu Print Portal
        </Heading>
        <Text color="gray.600">بوابة طباعة القوائم</Text>
        <Text fontSize="sm" color="gray.500">
          Generate printable menu in A4 or A5 format
        </Text>
      </VStack>
      
      <HStack spacing={3}>
        <HStack spacing={2}>
          <Text fontSize="sm" fontWeight="medium" color="gray.700">
            Size:
          </Text>
          <Button
            size="sm"
            variant={printSize === 'A4' ? 'solid' : 'outline'}
            colorScheme={printSize === 'A4' ? 'brand' : 'gray'}
            onClick={() => onPrintSizeChange('A4')}
          >
            A4
          </Button>
          <Button
            size="sm"
            variant={printSize === 'A5' ? 'solid' : 'outline'}
            colorScheme={printSize === 'A5' ? 'brand' : 'gray'}
            onClick={() => onPrintSizeChange('A5')}
          >
            A5
          </Button>
        </HStack>

        <IconButton
          icon={<RepeatIcon />}
          onClick={handleRefresh}
          isLoading={isRefetching}
          aria-label="Refresh data"
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
          Print {printSize}
        </Button>
      </HStack>
    </Flex>
  );
};

// ============================================================================
// REUSABLE UI COMPONENTS
// ============================================================================

const PageHeader = ({ title, titleArabic, gradient, icon, isA5 }) => (
  <Flex 
    align="center" 
    justify="space-between" 
    mb={isA5 ? 1 : 2}
    p={isA5 ? 1 : 2}
    position="relative"
    overflow="hidden"
    marginBottom={'0px'}
  >
    <Box
      width={isA5 ? '50px' : menuPDFTheme.sizes.logo.width}
      height={isA5 ? '50px' : menuPDFTheme.sizes.logo.height}
      bg="white"
      borderRadius="lg"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      // border="2px solid"
      // borderColor={'brand.600'}
      fontWeight="bold"
      fontSize={isA5 ? '2xs' : 'xs'}
      color={gradient.includes('brand') ? 'brand.500' : 'secondary.500'}
      textAlign="center"
      lineHeight="1.2"
      flexShrink={0}
      zIndex={1}
      pl={'4px'}
    >
      <Image src={logoIcon} sx={{width: isA5 ? '40px' : '60px'}}/>
    </Box>

    <HStack 
      spacing={isA5 ? 2 : 4} 
      justify={'space-between'} 
      flex="1"
      flexDirection={'row-reverse'} 
      mx={isA5 ? 2 : 3} 
      zIndex={1}
      borderRadius={"md"} 
      p={isA5 ? 1 : 2} 
      width={'100%'}
    >
      <Heading 
        size={isA5 ? "sm" : "lg"} 
        color={'brand.700'} 
        letterSpacing="tight" 
        fontFamily="'Outfit', sans-serif"
      >
        {title}
      </Heading>
      <Heading 
        size={isA5 ? "sm" : "lg"} 
        fontFamily={"'Lalezar', sans-serif"} 
        color={'brand.700'} 
        dir="rtl" 
        textAlign={'right'}
      >
        {titleArabic}
      </Heading>
    </HStack>

    <Box boxSize={isA5 ? 12 : 14} p={0}><Image src={icon}/></Box>
  </Flex>
);

const SectionHeader = ({ title, titleArabic, gradient }) => (
  <Box 
    
    pb={0.5}
    borderRadius="md"
    mb={0}
    position="relative"
    overflow="hidden"
    alignItems={'center'}
    justify={'space-between'}
  >
    <HStack justify={'space-between'} position="relative" zIndex={1} flexDirection={'row-reverse'}>
      <Heading size="sm" color={'brand.700'} fontWeight="bold" fontFamily={'"Outfit", sans_serif'}>
        {title}
      </Heading>
      <Heading size="sm" color={'brand.700'} fontWeight="bold" dir="rtl" fontFamily={"'Lalezar', sans-serif"}>
        {titleArabic}
      </Heading>
    </HStack>
  </Box>
);

const NutritionBadges = ({ meal }) => (
  <HStack spacing={0.25} flexWrap="wrap" justify={'center'} mt={0} px={0} w={'120%'}>
    {meal.calories && meal.calories>0 && (
    <Badge {...badgeStyles.carbs}>
      kcal {meal.calories || 0}
    </Badge>)}
    {meal.weight && meal.weight>0 && (
    <Badge {...badgeStyles.nutrition}>
      g {meal.weight || 0}
    </Badge>)}
    {meal.protein_g && meal.protein_g >0 && (
    <Badge {...badgeStyles.protein}>
      protein {meal.protein_g || 0}
    </Badge>)}
    {meal.fat_g && meal.fat_g>0 && (
    <Badge {...badgeStyles.fat}>
      fats {meal.fat_g || 0}
    </Badge>)}
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

const PriceDisplay = ({ price, currency = "ريال", size = "md" }) => (
  <HStack spacing={0.25} m={'3px'} flexDirection={'row-reverse'}>
    <Text 
    fontSize={size === "md" ? "2xs" : "2xs"} 
    color={size === "md" ? "brand.700" : "secondary.800"}
    fontWeight="bold"
    fontFamily={"'Lalezar', sans-serif"}
  >
    <Image src={currencyIcon} ml={2} boxSize={4} minW={'20px'} alt="SAR" />
  </Text>
  <Box 
      justifyContent={"center"} 
      bg={'warning.200'} 
      borderRadius={"md"} 
      width={'fit-content'} 
      height={"30px"} 
      px={'5px'}
      mr={'15px'}
    >
      <Text 
        fontSize={size} 
        fontWeight="black" 
        color={size === "md" ? "brand.600" : "secondary.800"}
      >
        {price || 0}
      </Text>
    </Box>
  </HStack>
);

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

const RegularMealCard = ({ meal }) => (
  <Card 
    size="md"
    as={Flex}
    flex={'reverse'}
    variant="outline"
    {...cardStyles.regular}
    width="240px"
    minWidth="240px"
    height="auto"
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
        <VStack align="stretch" spacing={1} flex="1">
          <VStack align="start" spacing={0} width="full">
            <Flex 
              justify={"space-between"} 
              width="170%"
              flexDirection={meal.ingredients ? "row-reverse" : "column-reverse"}
              align={'start'}
              px={0}
              mr={0}
              //bg={'orange.200'}
            >  
             <Text 
             p={0} 
             textAlign={meal?.ingredients?'left':'right'} 
             w={'100%'} 
             fontSize="2xs" 
             fontWeight="bold" 
             color="brand.700" 
             fontFamily={'"Outfit", sans_serif'}
             mx={1}
             sx={{
                lineHeight:'12px'
              }}
             >
                {meal.name}
              </Text>
              <Text 
                fontSize="sm" 
                fontWeight="bold" 
                color="brand.600" 
                dir="rtl" 
                p={0}
                mr={0}
                w={'110%'}
                fontFamily={"'Lalezar', sans-serif"}
                textAlign={'right'}
                sx={{
                lineHeight:'12px'
              }}
              >
                {meal.name_arabic || meal.name} 
              </Text>
            </Flex>
            <Text 
              fontSize={"2xs"} 
              fontWeight={'bold'} 
              color={"secondary.800"} 
              fontFamily={"'Lalezar', sans_serif"}
              lineHeight={'3'}
              textAlign={'right'}
              width={'110%'}
            >
              {meal.ingredients_arabic}
            </Text>
            <Text 
              fontSize={"3xs"} 
              fontWeight={400} 
              color={"secondary.800"} 
              fontFamily={"'Outfit', sans_serif"}
              textAlign={'right'}
              mb={'1px'}
              sx={{
                lineHeight:'10px',
              }}
            >
              {meal.ingredients}
            </Text>
          </VStack>
        </VStack>
        
        <Flex align={'flex-start'} justify="flex-end" flexShrink={0}>
          <PriceDisplay price={meal.base_price} />
          <Box 
            w={'15px'} 
            h={'15px'} 
            border={'solid 2px'} 
            borderColor={'brand.600'} 
            ml={"1px"}
            flexShrink={0}
          />
        </Flex>
      </HStack>
      <VStack justify="space-between" align="center" mt={0.5} pt={0} spacing={1}>
        <NutritionBadges meal={meal} />
        <AllergyIcons allergies={meal.allergies} size={3} />
      </VStack>
    </CardBody>
  </Card>
);

const SelectiveMealCard = ({ meal }) => (
  <Card 
    size="sm"
    variant="outline"
    {...cardStyles.selective}
    width="auto"
    mb={1}
    _hover={{
      transform: 'translateY(-1px)',
    }}
    transition="all 0.2s"
    px={4}
  >
    <CardBody p={0.5}>
      <VStack align="stretch" spacing={0.5}>
        <HStack justify="space-between" flexDirection={'row'}>
           <VStack spacing={0} align="end">
            <PriceDisplay price={meal.base_price} currency="ريال" size="md" />
          </VStack>
          <VStack align="start" spacing={0}>
            <Text 
              fontSize="xs" 
              fontFamily={"'Lalezar',sans_serif"} 
              fontWeight="bold" 
              color="secondary.700" 
              dir="rtl"
              textAlign={'right'}
            >
              {meal.name_arabic || meal.name}
            </Text>
            <Text fontSize="2xs" fontWeight="bold" color="secondary.800" >
              {meal.name}
            </Text>
          </VStack>
        </HStack>
        <HStack justify="space-between" align="center">
          <NutritionBadges meal={meal} />
          <AllergyIcons allergies={meal.allergies} size={3} />
        </HStack>
      </VStack>
    </CardBody>
  </Card>
);

const ItemCategoryHeader = ({ category, categoryArabic, maxFreeItems, price, isA5 }) => (
  <Flex 
    justify="space-between" 
    align="center" 
    p={0.5}
    bgGradient={`linear(to-r,brand.600, secondary.700 , brand.600)`}
    borderRadius="sm"
    mb={0.5}
    dir='rtl'
    minH={isA5 ? "20px" : "24px"}
  >
    <HStack justifyContent="space-between" w="100%" spacing={1} align="center">
      <Box alignContent={'right'} textAlign="right" dir='rtl' flex={1}>
        <Text 
          fontSize={isA5 ? "2xs" : "md"} 
          color="secondary.50" 
          fontFamily={"'Lalezar',sans_serif"} 
          lineHeight="1.1"
          mb={0}
          textAlign="right"
        >
          {categoryArabic}
        </Text>
        {maxFreeItems > 0 && (
          <Text
            fontSize={isA5 ? "3xs" : "2xs"}
            color="secondary.100"
            fontFamily={'"Lalezar",sans_serif'}
            lineHeight="1"
            mt={0}
            textAlign="right"
          >
            {menuPDFTheme.arabicText.selectUpTo} {maxFreeItems} {menuPDFTheme.arabicText.freeItems}، +{price} {menuPDFTheme.arabicText.sar}
          </Text>
        )}
      </Box>

      <Box textAlign="left" flex={1}>
        <Text 
          fontFamily={'"Outfit", sans_serif'} 
          fontSize={isA5 ? "2xs" : "md"} 
          fontWeight="bold" 
          color="secondary.50" 
          lineHeight="1.1"
          mb={0}
        >
          {category}
        </Text>
        {maxFreeItems > 0 && (
          <Text 
            fontFamily={'"Outfit", sans_serif'} 
            fontSize={isA5 ? "3xs" : "2xs"} 
            color="secondary.100"
            lineHeight="1"
            mt={0}
          >
            pick {maxFreeItems} free, +{price} SAR
          </Text>
        )}
      </Box>
    </HStack>
  </Flex>
);

const AdditiveItem = ({ item }) => (
  <Box
    p={0.5}
    {...cardStyles.additive}
    borderRadius="md"
    fontSize="2xs"
    width="fit-content"
    minW={'140px'}
    height="fit-content"
    _hover={{
      bg: 'secondary.50',
      transform: 'scale(1.02)'
    }}
    transition="all 0.1s"
  >
    <Flex justify="space-between" align="center" gap={0.5}>
      <VStack align="start" spacing={0} flex="1" minW="70px" >
        <Text 
          color="brand.700" 
          dir="rtl" 
          whiteSpace="nowrap"
          fontSize="sm" 
          fontFamily={"'Lalezar',sans_serif"}
        >
          {item.name_arabic || item.name}
        </Text>
        <Text 
          fontWeight="semibold" 
          color="secondary.700" 
          whiteSpace="nowrap"
          fontSize="3xs"
        >
          {item.name}
        </Text>
        {item.description && (
          <Text 
            fontWeight="semibold" 
            color="gray.800" 
            whiteSpace="nowrap"
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
        
        <NutritionBadges meal={item} />
        {/* Updated to handle both item_allergies and allergies arrays */}
        <AllergyIcons allergies={item.item_allergies || item.allergies} size={2.5} />
      </VStack>
      <Box 
        w={4} 
        h={4} 
        border={'solid 2px'} 
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

const RegularMealsSection = ({ regularMealsBySection, isA5 }) => (
  <Box 
    flex="1"
    overflow="hidden"
    maxHeight={isA5 ? "calc(100% - 60px)" : "calc(100% - 70px)"}
  >
    <Box 
      sx={{
        columnCount: isA5 ? 1 : 2,
        columnGap: isA5 ? '6px' : '8px',
        height: '100%',
        '@media print': {
          columnCount: isA5 ? 1 : 2,
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
              marginBottom: isA5 ? '2px' : '3px'
            }}
          >
            <SectionHeader
              title={section}
              titleArabic={sectionData.section_arabic}
              gradient={menuPDFTheme.gradients.brandGradient}
              isA5={isA5}
            />

            <Box
              className="masonry-grid"
              borderRadius="md"
              border={'dashed'}
              borderColor={'secondary.300'}
              p={isA5 ? 0.5 : 1}
              sx={{
                height: 'fit-content',
                columnCount: isA5 ? 3 : 2,//(sectionData.meals[0].ingredients ? 2 : 3),
                columnGap: isA5 ? '1px' : '2px',
                '& > *': {
                  breakInside: 'avoid',
                  mb: isA5 ? '1px' : '2px',
                }
              }}
            > 
           
              {sectionData.meals.map((meal) => (
                <RegularMealCard key={meal.id} meal={meal} isA5={isA5} />
              ))}
              
            </Box>
          </Box>
        ))}
        <AllergyGuide isA5={isA5} />
    </Box>
  </Box>
);

const SelectiveMealsSection = ({ selectiveMealsWithItems, isA5 }) => (
  <Box flex="1" overflow="hidden" maxHeight="calc(100% - 140px)">
    <Grid templateColumns="repeat(1, 1fr)" gap={3} height="100%">
      {Object.entries(selectiveMealsWithItems).map(([section, sectionData]) => (
        <Box key={section}>
          <SectionHeader
            title={section}
            titleArabic={sectionData.section_arabic}
            gradient={menuPDFTheme.gradients.brandGradient}
          />

          <Box
            className="masonry-grid"
            sx={{
              columnCount: { base: 1 },
              columnGap: '4px',
              '& > *': {
                breakInside: 'avoid',
                mb: '8px',
              }
            }}
          >
            {sectionData.meals.map((meal) => (
              <Box key={meal.id} width="full">
                {/* <SelectiveMealCard meal={meal} /> */}
                <PriceDisplay price={meal.base_price} currency="ريال" size="xl" />

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
                          width="auto"
                          minW="fit-content"
                          height="fit-content"
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
                                whiteSpace="nowrap"
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
                    <AllergyGuide isA5={isA5} />
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

// ============================================================================
// FOOTER COMPONENT - MODIFIED WITH QR CODE SPACE
// ============================================================================

const Footer = ({ isA5 }) => (
  <Box mb={2} pb={2} pt={1} h={isA5 ? '3mm' : '4mm'} borderTop={'2px dashed rgba(5, 182, 143, 0.92)'} dir='ltr'>
    <Grid templateColumns="1fr auto 1fr" gap={1} alignItems="center">
      {/* Contact Info Left */}
      <Box p={isA5 ? 1 : 1.5}>
        <SimpleGrid columns={1} spacing={0.25} fontSize={isA5 ? "2xs" : "xs"}>
          <VStack align="start" spacing={0}>
            <Text color="brand.600" fontSize={isA5 ? "2xs" : "sm"}>
              <Icon as={FaWhatsapp} boxSize={3} mr={2} />
              {menuPDFTheme.contactInfo.whatsapp}
            </Text>
            <Text color="brand.600" fontSize={isA5 ? "2xs" : "sm"}>
              <Icon as={EmailIcon} boxSize={3} mr={2} />
              {menuPDFTheme.contactInfo.email}
            </Text>
          </VStack>
        </SimpleGrid>
      </Box>

      {/* QR Code Space - Center */}
      <Box 
        textAlign="center" 
        p={2}
        mb={2}
        border="2px dashed"
        borderColor="brand.300"
        borderRadius="md"
        bg="white"
        w={isA5 ? "40px" : "80px"}
        h={isA5 ? "40px" : "80px"}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Image src={qrImage} boxSize={isA5 ? "30px" : "60px"} alt="QR Code Placeholder" />
        </Box>
    
      {/* Social Media Right */}
      <Box p={isA5 ? 1 : 1.5}>
        <SimpleGrid columns={1} spacing={0.5} fontSize={isA5 ? "2xs" : "xs"}>
          <VStack align="end" spacing={0}>
            <Text color="brand.600" fontSize={isA5 ? "2xs" : "sm"}>
              {menuPDFTheme.contactInfo.instagram}{` `}
              <Icon as={FaInstagram} boxSize={3} mr={1}/>
            </Text>
            <Text color="brand.600" fontSize={isA5 ? "2xs" : "sm"}>
              {menuPDFTheme.contactInfo.snapchat}{` `}
              <Icon as={FaSnapchat} boxSize={3} mr={1}/>
            </Text>
            <Text color="brand.600" fontSize={isA5 ? "2xs" : "sm"}>
              {menuPDFTheme.contactInfo.tiktok} {` `}
              <Icon as={FaTiktok} boxSize={3} mr={1}/>
            </Text>
          </VStack>
        </SimpleGrid>
      </Box>
    </Grid>
   
    <Divider my={1} borderColor="gray.200" />
  </Box>
);

// ============================================================================
// PAGE COMPONENTS
// ============================================================================

const RegularMealsPage = ({ regularMealsBySection, printSize }) => {
  const isA5 = printSize === 'A5';
  
  return (
    <Box 
      {...menuPDFTheme.sizes[printSize]}
      bg="white"
      padding={isA5 ? 1 : 2}
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
      
      <Box position="relative" zIndex="1" p={isA5 ? 2 : 3} height="100%" display="flex" flexDirection="column">
        <PageHeader
          title="Salad Saucia Meal Service Menu"
          titleArabic={menuPDFTheme.arabicText.regularMenu}
          gradient={menuPDFTheme.gradients.brandGradient}
          icon={menuIcon}
          isA5={isA5}
        />
        
        <RegularMealsSection 
          regularMealsBySection={regularMealsBySection} 
          isA5={isA5}
        />
        
        
      </Box>
    </Box>
  );
};

const SelectiveMealsPage = ({ selectiveMealsWithItems, printSize }) => {
  const isA5 = printSize === 'A5';
  
  return (
    <Box 
      {...menuPDFTheme.sizes[printSize]}
      bg="white"
      position="relative"
      overflow="hidden"
    >
      <BackgroundPattern />
      
      <Box position="relative" zIndex="1" p={isA5 ? 2 : 3} height="100%" display="flex" flexDirection="column">
        {/* <PageHeader
          title="Build Your Own Salad"
          titleArabic={menuPDFTheme.arabicText.buildYourOwn}
          gradient={menuPDFTheme.gradients.secondaryGradient}
          icon={customIcon}
          isA5={isA5}
        /> */}
        
        <SelectiveMealsSection 
          selectiveMealsWithItems={selectiveMealsWithItems} 
          isA5={isA5}
        />
  
        <Footer isA5={isA5} />
      </Box>
    </Box>
  );
};

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

const useMealItemsData = (selectiveMealIds) => {
  const { useGetMealItems } = useAdminFunctions();
  const [mealItemsMap, setMealItemsMap] = useState({});

  useEffect(() => {
    if (!selectiveMealIds.length) return;

    const fetchAllMealItems = async () => {
      const itemsMap = {};
      
      for (const mealId of selectiveMealIds) {
        try {
          const items = await adminAPI.getMealItems(mealId);
          itemsMap[mealId] = items;
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

const useMenuData = () => {
  const { 
    useGetAllMeals,
    useGetAllItems,
  } = useAdminFunctions();

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

  // Filter only available meals
  const availableMeals = React.useMemo(() => {
    if (!mealsData || !Array.isArray(mealsData)) return [];
    return mealsData.filter(meal => meal.is_available === true);
  }, [mealsData]);

  // Filter only available items
  const availableItems = React.useMemo(() => {
    if (!itemsData || !Array.isArray(itemsData)) return [];
    return itemsData.filter(item => item.is_available === true);
  }, [itemsData]);

  const selectiveMealIds = React.useMemo(() => {
    if (!availableMeals || !Array.isArray(availableMeals)) return [];
    return availableMeals
      .filter(meal => meal.is_selective)
      .map(meal => meal.id);
  }, [availableMeals]);

  const mealItemsMap = useMealItemsData(selectiveMealIds);

  const isLoading = isLoadingMeals || isLoadingItems;
  const isRefetching = isRefetchingMeals || isRefetchingItems;

  const selectiveMealsWithItems = React.useMemo(() => {
    if (!availableMeals || !Array.isArray(availableMeals) || !availableItems || !Array.isArray(availableItems)) {
      return {};
    }
    
    const selectiveMeals = availableMeals.filter(meal => meal.is_selective);
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
      
      if (mealItemIds.length > 0) {
        mealItems = mealItemIds
          .map(itemId => availableItems.find(item => item.id === itemId))
          .filter(item => item && item.is_available);
      } else {
        if (meal.item_ids && Array.isArray(meal.item_ids)) {
          mealItems = meal.item_ids
            .map(itemId => availableItems.find(item => item.id === itemId))
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
      }
      
      result[section].meals.push({
        ...meal,
        items: mealItems,
        itemsByCategory
      });
    });
    
    return result;
  }, [availableMeals, availableItems, mealItemsMap]);

  const regularMealsBySection = React.useMemo(() => {
    if (!availableMeals || !Array.isArray(availableMeals)) {
      return {};
    }
    
    return availableMeals
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
  }, [availableMeals]);

  return {
    selectiveMealsWithItems,
    regularMealsBySection,
    isLoading,
    isRefetching,
    refetchMeals,
    refetchItems
  };
};

const usePrintHandler = (menuRef, printSize) => {
  const toast = useToast();
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = useReactToPrint({
    contentRef: menuRef,
    documentTitle: `Menu-${printSize}-${new Date().toISOString().split('T')[0]}`,
    onBeforeGetContent: () => {
      setIsPrinting(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsPrinting(false);
      toast({
        title: 'تم التحضير للطباعة بنجاح',
        description: `Print dialog opened successfully for ${printSize}`,
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
        size: ${printSize} landscape;
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

const MenuPDFPortal = () => {
  const toast = useToast();
  const menuRef = useRef();
  const [printSize, setPrintSize] = useState('A4');

  const {
    selectiveMealsWithItems,
    regularMealsBySection,
    isLoading,
    isRefetching,
    refetchMeals,
    refetchItems
  } = useMenuData();

  const { handlePrint, isPrinting } = usePrintHandler(menuRef, printSize);
  
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

  const handlePrintSizeChange = (size) => {
    setPrintSize(size);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box p={2}>
      
      <ControlHeader
        handleRefresh={handleRefresh}
        handlePrint={handlePrint}
        isRefetching={isRefetching}
        isPrinting={isPrinting}
        printSize={printSize}
        onPrintSizeChange={handlePrintSizeChange}
      />
      {/* <small>
      {

        JSON.stringify(selectiveMealsWithItems)
      }

      </small> */}
      <Box ref={menuRef}>
        <RegularMealsPage 
          regularMealsBySection={regularMealsBySection} 
          printSize={printSize}
        />

        <SelectiveMealsPage 
          selectiveMealsWithItems={selectiveMealsWithItems} 
          printSize={printSize}
        />
      </Box>

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