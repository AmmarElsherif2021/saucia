import { Box, Heading, Flex, Text, Button, Image, VStack, useColorMode } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import chefImage from '../../assets/chef.svg'
import valuesImage from '../../assets/value.svg'
import missionImage from '../../assets/mission.svg'
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

const AboutCard = ({ title, description, image }) => {
  const { colorMode } = useColorMode()
  const MotionBox = motion(Box)

  return (
    <MotionBox
      variants={itemVariants}
      bg={colorMode === 'dark' ? 'gray.700' : 'white'}
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
        <Heading as="h3" size="lg" color="brand.500">
          {title}
        </Heading>
        <Text fontSize="md" color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
          {description}
        </Text>
      </VStack>
    </MotionBox>
  )
}

export const AboutUs = ({ contactUs }) => {
  const { t } = useTranslation()
  const { colorMode } = useColorMode()
  const MotionBox = motion(Box)

  const aboutSections = [
    {
      id: 1,
      title: t('about.aboutUs'),
      description: t('about.ourStory'),
      image: chefImage,
    },
    {
      id: 2,
      title: t('about.ourValues'),
      description: t('about.ourValuesDescription'),
      image: valuesImage,
    },
    {
      id: 3,
      title: t('about.ourMission'),
      description: t('about.ourMissionDescription'),
      image: missionImage,
    },
  ]

  return (
    <Box
      py={12}
      my={6}
      px={{ base: 4, md: 8 }}
      bg={colorMode === 'dark' ? 'gray.800' : 'brand.200'}
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
          color={colorMode === 'dark' ? 'white' : 'brand.700'}
        >
          {t('about.aboutUs')}
        </Heading>

        <Text
          fontSize="xl"
          mb={10}
          textAlign="center"
          maxW="800px"
          mx="auto"
          color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}
        >
          {t('about.intro')}
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
          <Text fontSize="lg" mb={4} color={colorMode === 'dark' ? 'gray.300' : 'gray.600'}>
            {t('about.contactPrompt')}
          </Text>
          <Button
            colorScheme="brand"
            size="lg"
            onClick={contactUs}
            _hover={{ transform: 'translateY(-2px)' }}
            transition="all 0.3s"
          >
            {t('about.contactUs')}
          </Button>
        </Box>
      </MotionBox>
    </Box>
  )
}
