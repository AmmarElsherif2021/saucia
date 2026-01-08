import { motion, useInView } from 'framer-motion'

import {
  Heading,
  Image,
  useColorMode,
  SimpleGrid,
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  FormControl,
  FormLabel,
  Flex,
  Text,
  Alert,
  AlertIcon,
  useDisclosure,
  Spinner,
  HStack,
  Icon,
  VStack,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next'; 
import { MdMailOutline, MdSend } from 'react-icons/md';
import { useI18nContext } from '../../Contexts/I18nContext';
import { Link } from 'react-router-dom'
import chefImage from '../../assets/about/chef.png'
import missionImage from '../../assets/about/experience.png'
import customImage from '../../assets/about/custom.png' 
import premiumImage from '../../assets/about/premium.png'
import supportImage from '../../assets/about/support.png'

//patterns
import mealsPattern from '../../assets/about/mealsPattern.png'
import missionPattern from '../../assets/about/experiencePattern.png'
import customPattern from '../../assets/about/customPattern.png' 
import signaturePattern from '../../assets/about/signaturePattern.png'
import premiumPattern from '../../assets/about/premiumPattern.png'
import supportPattern from '../../assets/about/supportPattern.png'
import { useState, useRef } from 'react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { 
    opacity: 0,
    y: 50,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      duration: 0.6
    },
  },
}

const imageVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      delay: 0.2,
      duration: 0.5
    }
  }
}

const AboutCard = ({ title, description, image, inputComponent, usedColor, patternImg }) => {
  const { colorMode } = useColorMode()
  const MotionBox = motion(Box)
  const MotionImage = motion(Image)
  const cardRef = useRef(null)
  const isInView = useInView(cardRef, { once: true, amount: 0.3 })
  const {currentLanguage}=useI18nContext();

  return (
    <MotionBox
      ref={cardRef}
      bgImage={`url(${patternImg})`}
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3 }
      }}
      //bg='transparent' //{colorMode === 'dark' ? 'gray.700' : usedColor}
      p={6}
      borderRadius="35px"
      boxShadow={colorMode === 'dark' ? 'lg' : 'none'}
      display="flex"
      flexDirection="column"
      alignItems="center"
      height="100%"
      minHeight={'500px'}
      position="relative"
      overflow="hidden"
      _hover={{
        boxShadow: colorMode === 'dark' ? '2xl' : 'lg',
      }}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: colorMode === 'dark' 
          ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)'
          : 'transparent',
        pointerEvents: 'none',
        borderRadius: '3xl'
      }}
    >
      {/* <MotionBox
        variants={imageVariants}
        mb={4}
        width="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <MotionImage
          src={image}
          alt={title}
          borderRadius="lg"
          objectFit="contain"
          maxWidth="200px"
          maxHeight="200px"
          width="auto"
          height="auto"
          whileHover={{ 
            scale: 1.1,
            transition: { duration: 0.5 }
          }}
        />
      </MotionBox> */}

      <VStack
        width="100%"
        alignItems="center"
        spacing={3}
        textAlign="center"
        flex="1"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Heading 
            as="h1" 
            size="3xl" 
            color={usedColor}
            mb={2}
            fontFamily={currentLanguage === 'ar'?'"Lalezar",sans_serif':'"Delicious Handrawn", cursive'}
          >
            {title}
          </Heading>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ width: '80%' }}
        >
          <Text 
            fontSize="xl" 
            color= 'brand.800' //{colorMode === 'dark' ? 'gray.300' : 'brand.800'}
            bg={'whiteAlpha.500'}
            borderRadius={'lg'}
            mb={4}
          >
            {description}
          </Text>
        </motion.div>

        {inputComponent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ width: '100%', marginTop: 'auto' }}
          >
            <Box width="100%">
              {inputComponent}
            </Box>
          </motion.div>
        )}
      </VStack>
    </MotionBox>
  )
}

const SupportForm = () => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // { type: 'success' | 'error', message }
  const [statusMessage, setStatusMessage] = useState('');

  const maxChars = 2000;
  const isValid = message.trim().length > 0 && message.length <= maxChars;
  const charPercentage = (message.length / maxChars) * 100;

  const handleOpenForm = () => {
    setSubmitStatus(null);
    setMessage('');
    onOpen();
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1200));

      /* Example API call:
      const response = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
        })
      });
      if (!response.ok) throw new Error('Failed to send');
      */

      setSubmitStatus('success');
      setStatusMessage(t('support.messageSent'));
      setMessage('');

      // Auto close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setSubmitStatus('error');
      setStatusMessage(t('support.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey && isValid) {
      handleSubmit();
    }
  };

  return (
    <>
      {/* Quick Access Button */}
      <Button
        onClick={handleOpenForm}
        width="full"
        colorScheme="brand"
        size="3xl"
        leftIcon={<MdMailOutline />}
        isDisabled={isSubmitting}
      >
        {t('support.title')}
      </Button>

      {/* Error/Success Messages */}
      {submitStatus && (
        <Alert
          status={submitStatus}
          borderRadius="md"
          mt={3}
          variant="subtle"
        >
          <AlertIcon />
          {statusMessage}
        </Alert>
      )}

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          {/* Header */}
          <ModalHeader>
            <VStack align="flex-start" spacing={1}>
              <Text fontSize="xl" fontWeight="bold">
                {t('support.title')}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {t('support.description')}
              </Text>
            </VStack>
          </ModalHeader>
          <ModalCloseButton isDisabled={isSubmitting} />

          {/* Body */}
          <ModalBody>
            <VStack spacing={4}>
              {/* Textarea */}
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="600">
                  {t('support.message')}
                </FormLabel>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('support.placeholder')}
                  maxLength={maxChars}
                  disabled={isSubmitting}
                  minH="150px"
                  resize="vertical"
                  variant="filled"
                  _focus={{
                    borderColor: 'blue.500',
                    boxShadow: '0 0 0 1px #3182ce'
                  }}
                />

                {/* Character Counter */}
                <Flex justify="space-between" align="center" mt={2}>
                  <Text fontSize="xs" color="gray.500">
                    {message.length} / {maxChars} {t('support.characters')}
                  </Text>
                  {charPercentage > 90 && (
                    <Text fontSize="xs" color="orange.600" fontWeight="600">
                      ⚠️ {t('support.nearLimit')}
                    </Text>
                  )}
                </Flex>

                {/* Character Progress Bar */}
                <Box mt={2} h={1} bg="gray.200" borderRadius="full" overflow="hidden">
                  <Box
                    h="full"
                    bg={charPercentage > 90 ? 'orange.400' : 'blue.500'}
                    w={`${Math.min(charPercentage, 100)}%`}
                    transition="width 0.2s ease"
                  />
                </Box>
              </FormControl>

              {/* Info Box */}
              <Alert
                status="info"
                variant="subtle"
                borderRadius="md"
                fontSize="sm"
              >
                <AlertIcon />
                <Box>
                  <Text fontWeight="600" mb={1}>
                    💡 {t('support.tip')}
                  </Text>
                  <Text fontSize="xs">
                    {t('support.tipDescription')}
                  </Text>
                </Box>
              </Alert>
            </VStack>
          </ModalBody>

          {/* Footer */}
          <ModalFooter>
            <HStack spacing={2} width="full">
              <Button
                variant="ghost"
                onClick={onClose}
                isDisabled={isSubmitting}
              >
                {t('support.cancel')}
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSubmit}
                isDisabled={!isValid || isSubmitting}
                isLoading={isSubmitting}
                loadingText={t('support.sending')}
                leftIcon={!isSubmitting && <MdSend />}
              >
                {t('support.send')}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
const AboutPage = ({ contactUs }) => {
  const { t } = useTranslation()
  const { colorMode } = useColorMode()
  const MotionBox = motion(Box)
  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true })

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
      patternImage: mealsPattern,
      inputComponent: (
        <Link to="/menu">
          <Button 
            colorScheme="brand" 
            size="sm"
            width="100%"
          >
            {t('browseMenu')}
          </Button>
        </Link>
      ),
      usedColor:'brand.700'
    },
    {
      id: 2,
      title: t('customizationFlowTitle'),
      description: t('customizationFlowDescription'),
      image: customImage,
      patternImage: customPattern,
      inputComponent: (
        <Link 
          to="/menu" 
          state={handleSectionNavigation('Make Your Own Salad')}
        >
          <Button 
            colorScheme="teal" 
            size="sm"
            width="100%"
          >
            {t('createYourOwn')}
          </Button>
        </Link>
      ),
      usedColor: 'brand.600'
    },
    {
      id: 3,
      title: t('signatureMealsTitle'),
      description: t('signatureMealsDescription'),
      image: missionImage,
      patternImage: signaturePattern,
      inputComponent: (
        <Link 
          to="/menu" 
          state={handleSectionNavigation('Our signature salad')}
        >
          <Button 
            colorScheme="secondary" 
            size="sm"
            width="100%"
          >
            {t('viewSignatureMeals')}
          </Button>
        </Link>
      ),
      usedColor: '#55b08aff'
    },
    {
      id: 4,
      title: t('premiumPlansTitle'),
      description: t('premiumPlansDescription'),
      image: premiumImage,
      patternImage: premiumPattern,
      inputComponent: (
        <Link to="/premium">
          <Button 
            colorScheme="brand" 
            size="sm"
            width="100%"
          >
            {t('explorePlans')}
          </Button>
        </Link>
      ),
      usedColor: 'teal.600'
    },
    {
      id: 5,
      title: t('supportLineTitle'),
      description: t('supportLineDescription'),
      image: supportImage,
      patternImage: supportPattern,
      inputComponent: <SupportForm/>,
      usedColor: '#389170ff'
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
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: -30 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ duration: 0.6, type: 'spring' }}
        >
          <Heading
            as="h2"
            size="2xl"
            mb={4}
            textAlign="center"
            color={colorMode === 'dark' ? 'white' : 'brand.800'}
            fontWeight="bold"
          >
            {t('aboutUs')}
          </Heading>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Text
            fontSize="xl"
            mb={12}
            textAlign="center"
            maxW="800px"
            mx="auto"
            color={colorMode === 'dark' ? 'gray.300' : 'tertiary.600'}
          >
            {t('intro')}
          </Text>
        </motion.div>

        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3 }}
          spacing={{ base: 6, md: 8, lg: 10 }}
          mb={10}
        >
          {aboutSections.map((section, index) => (
            <AboutCard
              key={section.id}
              title={section.title}
              description={section.description}
              image={section.image}
              patternImg={section.patternImage}
              inputComponent={section.inputComponent}
              usedColor={section.usedColor}
            />
          ))}
        </SimpleGrid>

      </MotionBox>
    </Box>
  )
}
export default AboutPage