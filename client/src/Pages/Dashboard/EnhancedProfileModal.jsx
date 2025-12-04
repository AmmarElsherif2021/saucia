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
import { useEffect } from 'react';

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
  
  // Debugging logs for retrieved data
  // useEffect(() => {
  //   if (isOpen && formData) {
  //     //console.log('🔍 [EnhancedProfileModal] Retrieved formData:', {
  //       basicInfo: {
  //         display_name: formData.display_name,
  //         phone_number: formData.phone_number,
  //         age: formData.age,
  //         gender: formData.gender,
  //         language: formData.language,
  //         notes: formData.notes,
  //       },
  //       healthProfile: formData.healthProfile,
  //       notificationPreferences: formData.notificationPreferences,
  //       defaultAddress: formData.defaultAddress,
  //       deliveryTime: formData.deliveryTime,
  //     });
      
  //     // Log field-by-field for detailed debugging
  //     //console.log('📋 [EnhancedProfileModal] Field values preset:');
  //     //console.log('- display_name:', formData.display_name);
  //     //console.log('- phone_number:', formData.phone_number);
  //     //console.log('- age:', formData.age);
  //     //console.log('- gender:', formData.gender);
  //     //console.log('- language:', formData.language);
  //     //console.log('- notes:', formData.notes);
  //     //console.log('- healthProfile.height_cm:', formData.healthProfile?.height_cm);
  //     //console.log('- healthProfile.weight_kg:', formData.healthProfile?.weight_kg);
  //     //console.log('- healthProfile.fitness_goal:', formData.healthProfile?.fitness_goal);
  //     //console.log('- healthProfile.activity_level:', formData.healthProfile?.activity_level);
  //     //console.log('- notificationPreferences.email:', formData.notificationPreferences?.email);
  //     //console.log('- notificationPreferences.sms:', formData.notificationPreferences?.sms);
  //     //console.log('- notificationPreferences.push:', formData.notificationPreferences?.push);
  //     //console.log('- defaultAddress:', formData.defaultAddress);
  //     //console.log('- deliveryTime:', formData.deliveryTime);
  //   }
  // }, [isOpen, formData]);

  // Calculate completion percentage based on filled fields
  const calculateCompletion = () => {
    const fields = [
      formData?.display_name,
      formData?.phone_number,
      formData?.age,
      formData?.gender,
      formData?.healthProfile?.height_cm,
      formData?.healthProfile?.weight_kg,
      formData?.healthProfile?.activity_level,
      formData?.healthProfile?.fitness_goal,
    ];
    
    const filledFields = fields.filter(field => field && field !== '' && field !== 0).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();
  const isLoading = isUpdatingProfile || isUpdatingHealthProfile;

  // Log when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      //console.log('🚀 [EnhancedProfileModal] Modal opened with data:', formData);
    } else {
      //console.log('🔒 [EnhancedProfileModal] Modal closed');
    }
  }, [isOpen]);

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
                {t('editProfile')}
              </Text>
              <HStack spacing={2}>
                <Text fontSize="sm" color="gray.500">
                  {t('profileCompletion')}: {completionPercentage}%
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
              <Tooltip label={t('unsavedChanges')}>
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
          {formData ? (
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
                isLoading={false}
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
          ) : (
            <Flex justify="center" align="center" h="200px">
              <Text color="gray.500">
                {t('loadingData') || 'Loading profile data...'}
              </Text>
            </Flex>
          )}
        </ModalBody>

        <ModalFooter 
          borderTop="1px" 
          borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
          pt={4}
        >
          <HStack spacing={3} w="full" justify="space-between">
            <Text fontSize="sm" color="gray.500">
              {hasUnsavedChanges && t('unsavedChangesWarning')}
            </Text>
            
            <HStack spacing={3}>
              <Button 
                variant="ghost" 
                onClick={onClose}
                isDisabled={isLoading}
              >
                {t('cancel')}
              </Button>
              
              <Button
                colorScheme="brand"
                onClick={() => {
                  //console.log('💾 [EnhancedProfileModal] Saving changes:', formData);
                  handleSubmit();
                }}
                isLoading={isLoading}
                loadingText={t('saving')}
                leftIcon={!isLoading ? <CheckIcon /> : undefined}
                size="lg"
                minW="120px"
                isDisabled={!formData}
              >
                {t('saveChanges')}
              </Button>
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EnhancedProfileModal;