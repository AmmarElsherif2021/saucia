import { Box, Heading, Flex, Text, Button, Image, VStack, useColorMode, Input, InputGroup, InputRightElement } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import chefImage from '../../assets/chef.png'
import valuesImage from '../../assets/value.svg'
import missionImage from '../../assets/experience.png'
import customImage from '../../assets/custom.png' 
import premiumImage from '../../assets/premium.png'
import supportImage from '../../assets/support.png'
import { useState } from 'react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
}

const AboutCard = ({ title, description, image, inputComponent, cardBg }) => {
  const { colorMode } = useColorMode()
  const MotionBox = motion(Box)

  return (
    <MotionBox
      variants={itemVariants}
      bg={colorMode === 'dark' ? 'gray.700' : cardBg}
      p={6}
      borderRadius="lg"
      display="flex"
      flexDirection={{ base: 'column', md: 'row' }}
      alignItems="center"
      justifyContent="space-between"
      mb={10}
      overflow="hidden"
    >
      <Box width={{ base: '75vw', md: '50vw', lg: '50vw' }} mb={{ base: 4, md: 0 }}>
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
        width={{ base: '100%', md: '55%' }}
        alignItems="flex-start"
        spacing={3}
        textAlign="left"
      >
        <Heading as="h3" size="lg" color="brand.700">
          {title}
        </Heading>
        <Text fontSize="md" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
          {description}
        </Text>
        {/* Input component area */}
        {inputComponent && (
          <Box width="100%" mt={3}>
            {inputComponent}
          </Box>
        )}
      </VStack>
    </MotionBox>
  )
}

// Support Form Component
const SupportForm = () => {
  const { t } = useTranslation()
  const [message, setMessage] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    ////console.log('Support message submitted:', message)
    // Here you would typically send the message to your backend
    setMessage('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup size="md">
        <Input
          pr="4.5rem"
          placeholder={t('supportPlaceholder')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          variant={"filled"}
        />
        <InputRightElement width="4.5rem">
          <Button 
            h="1.75rem" 
            size="sm" 
            colorScheme="brand"
            type="submit"
          >
            {t('send')}
          </Button>
        </InputRightElement>
      </InputGroup>
    </form>
  )
}

export const AboutPage = ({ contactUs }) => {
  const { t } = useTranslation()
  const { colorMode } = useColorMode()
  const MotionBox = motion(Box)

  // Navigation handler function - consistent with Navbar
  const handleSectionNavigation = (section) => {
    ////console.log('AboutPage requesting navigation to:', section)
    return { scrollTo: section }
  }

  const aboutSections = [
    {
      id: 1,
      title: t('mealExperienceTitle'),
      description: t('mealExperienceDescription'),
      image: chefImage,
      inputComponent: (
        <Link to="/menu">
          <Button 
            colorScheme="brand" 
            size="sm"
          >
            {t('browseMenu')}
          </Button>
        </Link>
      ),
      cardBg:'teal.200'
    },
    {
      id: 2,
      title: t('customizationFlowTitle'),
      description: t('customizationFlowDescription'),
      image: customImage,
      inputComponent: (
        <Link 
          to="/menu" 
          state={handleSectionNavigation('Make Your Own Salad')}
        >
          <Button 
            colorScheme="teal" 
            size="sm"
          >
            {t('createYourOwn')}
          </Button>
        </Link>
      ),
      cardBg: 'orange.200'
    },
    {
      id: 3,
      title: t('signatureMealsTitle'),
      description: t('signatureMealsDescription'),
      image: missionImage,
      inputComponent: (
        <Link 
          to="/menu" 
          state={handleSectionNavigation('Our signature salad')}
        >
          <Button 
            colorScheme="secondary" 
            size="sm"
          >
            {t('viewSignatureMeals')}
          </Button>
        </Link>
      ),
      cardBg: 'brand.200'
    },
    {
      id: 4,
      title: t('premiumPlansTitle'),
      description: t('premiumPlansDescription'),
      image: premiumImage,
      inputComponent: (
        <Link to="/premium">
          <Button 
            colorScheme="brand" 
            size="sm"
          >
            {t('explorePlans')}
          </Button>
        </Link>
      ),
      cardBg: 'tertiary.400'
    },
    {
      id: 5,
      title: t('supportLineTitle'),
      description: t('supportLineDescription'),
      image: supportImage,
      inputComponent: <SupportForm/>,
      cardBg: 'warning.200'
    },
  ]
  

  return (
    <Box
      py={12}
      my={6}
      px={{ base: 4, md: 8 }}
      bg={colorMode === 'dark' ? 'gray.800' : 'brand.600'}
      borderRadius={'10px'}
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
          color={colorMode === 'dark' ? 'white' : 'brand.800'}
        >
          {t('aboutUs')}
        </Heading>

        <Text
          fontSize="xl"
          mb={10}
          textAlign="center"
          maxW="800px"
          mx="auto"
          color={colorMode === 'dark' ? 'gray.300' : 'tertiary.600'}
        >
          {t('intro')}
        </Text>

        <VStack spacing={8} mb={10}>
          {aboutSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{
                opacity: 0,
                x: index % 2 === 0 ? 50 : -50,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
                transition: {
                  duration: 1,
                },
              }}
              viewport={{ amount: 0.1 }}
              style={{ width: '100%' }}
            >
              <AboutCard
                title={section.title}
                description={section.description}
                image={section.image}
                inputComponent={section.inputComponent}
                cardBg={section.cardBg}
              />
            </motion.div>
          ))}
        </VStack>

      </MotionBox>
    </Box>
  )
}