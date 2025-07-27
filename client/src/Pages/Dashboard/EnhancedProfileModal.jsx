import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  Button,
  useColorMode,
  HStack,
  Divider,
  Progress,
  Text,
  Flex,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import {
  BasicInfoSection,
  HealthProfileSection,
  NotificationSection,
  DeliverySection,
} from './DashboardSections';

const EnhancedProfileModal = ({ 
  isOpen, 
  onClose, 
  t, 
  formData, 
  handlers,
  onOpenMap,
  handleSubmit,
  isUpdatingProfile,
  isUpdatingHealthProfile,
  hasUnsavedChanges = false
}) => {
  const { colorMode } = useColorMode();
  
  // Calculate completion percentage based on filled fields
  const calculateCompletion = () => {
    const fields = [
      formData.display_name,
      formData.phone_number,
      formData.age,
      formData.gender,
      formData.healthProfile?.height_cm,
      formData.healthProfile?.weight_kg,
      formData.healthProfile?.activity_level,
      formData.healthProfile?.fitness_goal,
    ];
    
    const filledFields = fields.filter(field => field && field !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();
  const isLoading = isUpdatingProfile || isUpdatingHealthProfile;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="xl" 
      scrollBehavior="inside"
      closeOnOverlayClick={!hasUnsavedChanges}
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
      <ModalContent 
        h={"90%"}
        bg={colorMode === 'light' ? 'white' : 'gray.900'}
        borderRadius="xl"
        p={4}
        mx={8}
      >
        <ModalHeader 
          borderBottom="1px" 
          borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
          pb={4}
        >
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Text fontSize="xl" fontWeight="bold">
                {t('profile.editProfile')}
              </Text>
              <HStack spacing={2}>
                <Text fontSize="sm" color="gray.500">
                  {t('profile.profileCompletion')}: {completionPercentage}%
                </Text>
                <Progress 
                  value={completionPercentage} 
                  size="sm" 
                  colorScheme="brand" 
                  w="100px" 
                  borderRadius="full"
                />
              </HStack>
            </VStack>
            
            {hasUnsavedChanges && (
              <Tooltip label={t('profile.unsavedChanges')}>
                <IconButton
                  icon={<CheckIcon />}
                  colorScheme="orange"
                  variant="ghost"
                  size="sm"
                />
              </Tooltip>
            )}
          </Flex>
        </ModalHeader>
        
        <ModalCloseButton 
          size="lg"
          _hover={{
            bg: colorMode === 'light' ? 'gray.100' : 'gray.700'
          }}
        />
        
        <ModalBody py={1} h={'95%'} >
          <VStack spacing={8} align="stretch">
            <BasicInfoSection 
              formData={formData} 
              handlers={handlers}
              t={t}
            />

            <Divider />

            <HealthProfileSection 
              formData={formData}
              handlers={handlers}
              t={t}
              isLoading={false} // You can pass actual loading state here
            />

            <Divider />

            <NotificationSection 
              formData={formData}
              handlers={handlers}
              t={t}
            />

            <Divider />

            <DeliverySection 
              formData={formData}
              handlers={handlers}
              onOpenMap={onOpenMap}
              t={t}
            />
          </VStack>
        </ModalBody>

        <ModalFooter 
          borderTop="1px" 
          borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
          pt={4}
        >
          <HStack spacing={3} w="full" justify="space-between">
            <Text fontSize="sm" color="gray.500">
              {hasUnsavedChanges && t('profile.unsavedChangesWarning')}
            </Text>
            
            <HStack spacing={3}>
              <Button 
                variant="ghost" 
                onClick={onClose}
                isDisabled={isLoading}
              >
                {t('common.cancel')}
              </Button>
              
              <Button
                colorScheme="brand"
                onClick={handleSubmit}
                isLoading={isLoading}
                loadingText={t('profile.saving')}
                leftIcon={!isLoading ? <CheckIcon /> : undefined}
                size="lg"
                minW="120px"
              >
                {t('profile.saveChanges')}
              </Button>
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EnhancedProfileModal;