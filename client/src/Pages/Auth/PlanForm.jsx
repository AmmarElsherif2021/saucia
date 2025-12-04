import { 
  FormControl, FormLabel, Input, Button, Flex, Switch, Textarea,
  Box, Image, useToast, SimpleGrid, Text, Heading, Divider, Checkbox,
  useBreakpointValue, Skeleton, Stack, Grid, GridItem, Card, CardBody,
  VStack, HStack, Badge, Alert, AlertIcon
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { uploadImage, deleteImage } from '../../API/imageUtils'; 
import { useAdminFunctions } from '../../Hooks/useAdminFunctions';
import { useTranslation } from 'react-i18next';

const PlanForm = ({ onSubmit, onCancel, initialData = {}, isEdit = false, key }) => {
  const { t } = useTranslation();
  const { 
    useGetAllMeals, 
    useGetAllItems, 
    useGetPlanDetails,
    useCreateMeal,
    useUpdateMeal
  } = useAdminFunctions();
  
  const { 
    data: meals = [], 
    isLoading: isLoadingMeals 
  } = useGetAllMeals();
  
  const { 
    data: items = [], 
    isLoading: isLoadingItems 
  } = useGetAllItems();
  
  const {
    data: plan,
    isLoading: isLoadingPlan
  } = useGetPlanDetails(initialData?.id);

  // Mutations for creating/updating meals
  const createMealMutation = useCreateMeal();
  const updateMealMutation = useUpdateMeal();

  const [formData, setFormData] = useState({
    title: initialData.title || '',
    title_arabic: initialData.title_arabic || '',
    short_term_meals: initialData.short_term_meals || 0,
    medium_term_meals: initialData.medium_term_meals || 0,
    carb: Math.max(Number(initialData.carb) || 0),
    protein: Math.max(Number(initialData.protein) || 0),
    kcal: Math.max(Number(initialData.kcal) || 0),
    avatar_url: initialData.avatar_url || '',
    description: initialData.description || '',
    description_arabic: initialData.description_arabic || '',
    price_per_meal: initialData.price_per_meal || 0,
    is_active: initialData.is_active ?? true,
    meals: initialData.meals || [], 
    additives: initialData.additives || []
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData.avatar_url || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingMeals, setIsProcessingMeals] = useState(false);
  const toast = useToast();
  
  const isMobile = useBreakpointValue({ base: true, md: false });
  const gridColumns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 });

  useEffect(() => {
    if (initialData?.id && plan?.meals) {
      console.log('📥 Loading plan meals from plan details:', plan.meals);
      
      const transformedMeals = plan.meals.map(m => ({
        id: m.id,
        meal_id: m.id,
        is_substitutable: m.is_substitutable || false
      }));
      
      console.log('🔄 Transformed meals:', transformedMeals);
      
      setFormData(prev => ({
        ...prev,
        meals: transformedMeals
      }));
    } else if (!initialData?.id) {
      // For new plans, ensure meals is empty array
      setFormData(prev => ({
        ...prev,
        meals: []
      }));
    }
  }, [plan, initialData?.id]);
 
  useEffect(() => {
    console.log('📊 PlanForm formData updated:', {
      meals: formData.meals,
      mealsCount: formData.meals?.length || 0,
      price_per_meal: formData.price_per_meal
    });
  }, [formData.meals, formData.price_per_meal]);

  const additiveItems = items || [];
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name.startsWith('title') || name.startsWith('description')
          ? value
          : Math.max(Number(value), 0),
    }));
  };
  
  const handleAdditiveToggle = (itemId) => {
    setFormData(prev => {
      const additives = [...prev.additives];
      const index = additives.indexOf(itemId);
      
      if (index > -1) additives.splice(index, 1);
      else additives.push(itemId);
      
      return { ...prev, additives };
    });
  };

  const handleMealToggle = (mealId) => {
    setFormData(prev => {
      const meals = [...(prev.meals || [])];
      const existingIndex = meals.findIndex(m => 
        (typeof m === 'object' ? m.meal_id : m) === mealId
      );
      
      if (existingIndex > -1) {
        meals.splice(existingIndex, 1);
      } else {
        meals.push({
          meal_id: mealId,
          is_substitutable: false
        });
      }
      
      return { ...prev, meals };
    });
  };

  const handleMealSubstitutabilityToggle = (mealId, isSubstitutable) => {
    setFormData(prev => {
      const meals = prev.meals.map(meal => {
        const id = typeof meal === 'object' ? meal.meal_id : meal;
        if (id === mealId) {
          return {
            meal_id: mealId,
            is_substitutable: isSubstitutable
          };
        }
        return meal;
      });
      
      return { ...prev, meals };
    });
  };

  // Create a new meal for the plan
  const handleCreateNewMeal = async (mealData) => {
    try {
      // Ensure the new meal has the correct price and availability
      const mealToCreate = {
        ...mealData,
        base_price: formData.price_per_meal, // Match plan's price
        is_available: false, // Always false for plan meals
        is_selective: false,
        section: mealData.section || 'main',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('🆕 Creating new meal for plan:', mealToCreate);
      
      const newMeal = await createMealMutation.mutateAsync(mealToCreate);
      
      // Add the new meal to the plan meals array
      setFormData(prev => ({
        ...prev,
        meals: [
          ...prev.meals,
          {
            meal_id: newMeal.id,
            is_substitutable: false
          }
        ]
      }));

      toast({
        title: 'Meal created successfully',
        description: 'New meal has been added to the plan',
        status: 'success',
        duration: 3000,
        isClosable: true
      });

      return newMeal;
    } catch (error) {
      console.error('Failed to create meal:', error);
      toast({
        title: 'Failed to create meal',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      throw error;
    }
  };

  // Update existing meal to match plan requirements
  const updateMealForPlan = async (mealId) => {
    try {
      const updateData = {
        base_price: formData.price_per_meal,
        is_available: false,
        updated_at: new Date().toISOString()
      };

      console.log('🔄 Updating meal for plan:', { mealId, updateData });
      
      await updateMealMutation.mutateAsync({
        mealId,
        updateData
      });

      console.log('✅ Meal updated successfully for plan');
    } catch (error) {
      console.error('Failed to update meal:', error);
      toast({
        title: 'Failed to update meal',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      throw error;
    }
  };

  // Process all meals to ensure they meet plan requirements
  const processMealsForPlan = async (meals) => {
    setIsProcessingMeals(true);
    
    try {
      for (const meal of meals) {
        const mealId = typeof meal === 'object' ? meal.meal_id : meal;
        
        // Update the existing meal to match plan requirements
        await updateMealForPlan(mealId);
      }
      
      console.log('✅ All meals processed for plan');
    } catch (error) {
      throw error;
    } finally {
      setIsProcessingMeals(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload JPEG, PNG, or WebP images',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast({
        title: 'File too large',
        description: 'Maximum image size is 5MB',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
      return;
    }

    try {
      setIsUploading(true);
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      toast({
        title: 'Image ready',
        description: 'Image will be saved when you submit the form',
        status: 'success',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      toast({
        title: 'Image upload failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let newAvatarUrl = formData.avatar_url;
      const oldAvatarUrl = formData.avatar_url;
      
      if (imageFile) {
        setIsUploading(true);
        newAvatarUrl = await uploadImage(imageFile, 'plans');
      }

      // PROCESS MEALS: Ensure all meals meet plan requirements
      if (formData.meals && formData.meals.length > 0) {
        await processMealsForPlan(formData.meals);
      }

      // Prepare the final data for submission
      // Remove any internal fields and ensure proper structure
      const { meals: planMeals, ...planData } = formData;
      
      const processedData = {
        ...planData,
        avatar_url: newAvatarUrl,
        // meals field will be handled by the parent component via updatePlanMeals
        meals: planMeals.map(meal => ({
          meal_id: typeof meal === 'object' ? meal.meal_id : meal,
          is_substitutable: typeof meal === 'object' ? meal.is_substitutable : false
        }))
      };
      
      console.log('📤 Submitting plan data:', {
        planData: processedData,
        mealsCount: processedData.meals.length,
        meals: processedData.meals
      });
      
      // Pass the processed data to parent onSubmit
      // The parent should handle:
      // 1. Creating/updating the plan in 'plans' table
      // 2. Updating the 'plan_meals' junction table with the meals array
      await onSubmit(processedData);
      
      if (initialData.id && imageFile && oldAvatarUrl && oldAvatarUrl !== newAvatarUrl) {
        await deleteImage(oldAvatarUrl, 'plans');
      }

      toast({
        title: isEdit ? 'Plan updated successfully' : 'Plan created successfully',
        description: `All meals have been configured with price $${formData.price_per_meal} and marked as unavailable for individual purchase`,
        status: 'success',
        duration: 5000,
        isClosable: true
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Form submission failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Quick Meal Creation Form
  const QuickMealCreation = () => {
    const [showQuickCreate, setShowQuickCreate] = useState(false);
    const [newMealData, setNewMealData] = useState({
      name: '',
      name_arabic: '',
      description: '',
      section: 'main',
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0
    });

    const handleQuickCreate = async () => {
      if (!newMealData.name.trim()) {
        toast({
          title: 'Meal name required',
          description: 'Please enter a name for the new meal',
          status: 'warning',
          duration: 3000,
          isClosable: true
        });
        return;
      }

      try {
        await handleCreateNewMeal(newMealData);
        setNewMealData({
          name: '',
          name_arabic: '',
          description: '',
          section: 'main',
          calories: 0,
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0
        });
        setShowQuickCreate(false);
      } catch (error) {
        // Error handled in handleCreateNewMeal
      }
    };

    return (
      <Box mb={6}>
        <Button
          colorScheme="green"
          variant="outline"
          onClick={() => setShowQuickCreate(!showQuickCreate)}
          mb={4}
        >
          {showQuickCreate ? 'Cancel Quick Create' : '+ Create New Meal for Plan'}
        </Button>

        {showQuickCreate && (
          <Card bg="green.50" borderColor="green.200">
            <CardBody>
              <Heading size="sm" mb={4} color="green.700">
                Create New Meal for This Plan
              </Heading>
              <Alert status="info" mb={4}>
                <AlertIcon />
                This meal will be created with: Price ${formData.price_per_meal} • Not available for individual purchase
              </Alert>
              
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <FormControl isRequired>
                  <FormLabel>Meal Name (EN)</FormLabel>
                  <Input
                    value={newMealData.name}
                    onChange={(e) => setNewMealData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter meal name"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Meal Name (AR)</FormLabel>
                  <Input
                    value={newMealData.name_arabic}
                    onChange={(e) => setNewMealData(prev => ({ ...prev, name_arabic: e.target.value }))}
                    placeholder="اسم الوجبة"
                    dir="rtl"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    value={newMealData.description}
                    onChange={(e) => setNewMealData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Meal description"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Section</FormLabel>
                  <Input
                    value={newMealData.section}
                    onChange={(e) => setNewMealData(prev => ({ ...prev, section: e.target.value }))}
                    placeholder="main, breakfast, etc."
                  />
                </FormControl>
              </Grid>

              <Flex justify="flex-end" mt={4}>
                <Button
                  colorScheme="green"
                  onClick={handleQuickCreate}
                  isLoading={createMealMutation.isPending}
                >
                  Create Meal & Add to Plan
                </Button>
              </Flex>
            </CardBody>
          </Card>
        )}
      </Box>
    );
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2} color="gray.800">
            {isEdit ? 'Edit Plan' : 'Create New Plan'}
          </Heading>
          <Text color="gray.600" fontSize="sm">
            {isEdit ? 'Update plan details and configuration' : 'Create a new meal plan for your customers'}
          </Text>
        </Box>

        {/* Quick Meal Creation */}
        <QuickMealCreation />

        {/* Rest of the form remains the same */}
        {/* Image Upload & Basic Info */}
        <Grid templateColumns={{ base: '1fr', lg: 'auto 1fr' }} gap={6}>
          {/* Image Upload */}
          <Card>
            <CardBody>
              <Heading size="md" mb={4} color="gray.700">Plan Image</Heading>
              <VStack spacing={4}>
                <Box
                  w="200px"
                  h="150px"
                  border="2px dashed"
                  borderColor={imagePreview ? 'transparent' : 'gray.300'}
                  borderRadius="lg"
                  overflow="hidden"
                  bg={imagePreview ? 'transparent' : 'gray.50'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt={t('modals.planPreview')}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />
                  ) : (
                    <Text color="gray.500" textAlign="center" px={2}>
                      {t('modals.noImage')}
                    </Text>
                  )}
                </Box>
                
                <Box position="relative">
                  <Button
                    as="label"
                    colorScheme="blue"
                    cursor="pointer"
                    isLoading={isUploading}
                    loadingText={t('modals.uploading')}
                    size="sm"
                  >
                    {t('modals.chooseImage')}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      position="absolute"
                      top={0}
                      left={0}
                      opacity={0}
                      width="100%"
                      height="100%"
                      cursor="pointer"
                    />
                  </Button>
                </Box>
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  {t('modals.imageHint')}
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardBody>
              <Heading size="md" mb={4} color="gray.700">Basic Information</Heading>
              <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
                <FormControl isRequired>
                  <FormLabel fontWeight="medium">{t('modals.titleEn')}</FormLabel>
                  <Input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder={t('modals.titleEn')}
                    focusBorderColor="blue.500"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium">{t('modals.titleAr')}</FormLabel>
                  <Input
                    type="text"
                    name="title_arabic"
                    value={formData.title_arabic}
                    onChange={handleChange}
                    placeholder={t('modals.titleAr')}
                    dir="rtl"
                    focusBorderColor="blue.500"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium">{t('modals.descriptionEn')}</FormLabel>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={t('modals.descriptionEn')}
                    rows={3}
                    focusBorderColor="blue.500"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium">{t('modals.descriptionAr')}</FormLabel>
                  <Textarea
                    name="description_arabic"
                    value={formData.description_arabic}
                    onChange={handleChange}
                    placeholder={t('modals.descriptionAr')}
                    dir="rtl"
                    rows={3}
                    focusBorderColor="blue.500"
                  />
                </FormControl>
              </Grid>
            </CardBody>
          </Card>
        </Grid>

        {/* Nutritional Information */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4} color="gray.700">{t('modals.nutritionalInfo')}</Heading>
            <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }} gap={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="medium">{t('modals.carbs')} (g)</FormLabel>
                <Input
                  type="number"
                  name="carb"
                  value={formData.carb}
                  onChange={handleChange}
                  min={0}
                  focusBorderColor="blue.500"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="medium">{t('modals.protein')} (g)</FormLabel>
                <Input
                  type="number"
                  name="protein"
                  value={formData.protein}
                  onChange={handleChange}
                  min={0}
                  focusBorderColor="blue.500"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="medium">{t('modals.calories')} (kcal)</FormLabel>
                <Input
                  type="number"
                  name="kcal"
                  value={formData.kcal}
                  onChange={handleChange}
                  min={0}
                  focusBorderColor="blue.500"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="medium">{t('modals.pricePerMeal')} (SAR)</FormLabel>
                <Input
                  type="number"
                  name="price_per_meal"
                  value={formData.price_per_meal}
                  onChange={handleChange}
                  min={0}
                  step="0.01"
                  focusBorderColor="blue.500"
                />
              </FormControl>
            </Grid>
          </CardBody>
        </Card>

        {/* Meal Terms */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4} color="gray.700">{t('modals.mealTerms')}</Heading>
            <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }} gap={4}>
              <FormControl>
                <FormLabel fontWeight="medium">{t('modals.shortTermMeals')}</FormLabel>
                <Input
                  type="number"
                  name="short_term_meals"
                  value={formData.short_term_meals}
                  onChange={handleChange}
                  min={0}
                  focusBorderColor="blue.500"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="medium">{t('modals.mediumTermMeals')}</FormLabel>
                <Input
                  type="number"
                  name="medium_term_meals"
                  value={formData.medium_term_meals}
                  onChange={handleChange}
                  min={0}
                  focusBorderColor="blue.500"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="is_active" mb="0" fontWeight="medium">
                  {t('modals.isActive')}
                </FormLabel>
                <Switch
                  id="is_active"
                  name="is_active"
                  isChecked={formData.is_active}
                  onChange={handleChange}
                  size="lg"
                  colorScheme="green"
                />
              </FormControl>
            </Grid>
          </CardBody>
        </Card>

        {/* Meals Selection */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4} color="gray.700">
              {t('modals.mealSelection')}
            </Heading>
            <Alert status="warning" mb={4}>
              <AlertIcon />
              Selected meals will be updated: Price set to ${formData.price_per_meal} • Marked as unavailable for individual purchase
            </Alert>
            <Text color="gray.600" mb={4} fontSize="sm">
              Select meals to include in this plan and mark them as substitutable if needed
            </Text>
            
            {(isLoadingMeals || (initialData?.id && isLoadingPlan)) ? (
              <Stack spacing={3}>
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} height="60px" borderRadius="md" />
                ))}
              </Stack>
            ) : (
              <Box 
                maxH="400px" 
                overflowY="auto" 
                border="1px solid" 
                borderColor="gray.200" 
                borderRadius="md"
                p={4}
              >
                <SimpleGrid columns={gridColumns} spacing={4}>
                  {meals.map(meal => {
                    const isSelected = formData.meals?.some(m => 
                      (typeof m === 'object' ? m.meal_id : m) === meal.id
                    );
                    const selectedMeal = formData.meals?.find(m => 
                      (typeof m === 'object' ? m.meal_id : m) === meal.id
                    );
                    const isSubstitutable = typeof selectedMeal === 'object' 
                      ? selectedMeal.is_substitutable 
                      : false;

                    return (
                      <Box
                        key={meal.id}
                        p={4}
                        borderWidth="1px"
                        borderRadius="lg"
                        bg={isSelected ? 'blue.50' : 'white'}
                        borderColor={isSelected ? 'blue.300' : 'gray.200'}
                        transition="all 0.2s"
                        _hover={{ 
                          borderColor: 'blue.400',
                          transform: 'translateY(-2px)',
                          shadow: 'md'
                        }}
                      >
                        <VStack align="stretch" spacing={2}>
                          <Checkbox
                            isChecked={isSelected}
                            onChange={() => handleMealToggle(meal.id)}
                            colorScheme="blue"
                          >
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium" fontSize="sm">{meal.name}</Text>
                              <HStack spacing={2}>
                                <Badge colorScheme="green" size="sm">
                                  ${meal.base_price}
                                </Badge>
                                <Badge colorScheme="gray" size="sm">
                                  {meal.calories} kcal
                                </Badge>
                                <Badge 
                                  colorScheme={meal.is_available ? 'green' : 'red'} 
                                  size="sm"
                                >
                                  {meal.is_available ? 'Available' : 'Plan Only'}
                                </Badge>
                              </HStack>
                            </VStack>
                          </Checkbox>
                          
                          {isSelected && (
                            <Checkbox
                              size="sm"
                              isChecked={isSubstitutable}
                              onChange={(e) => handleMealSubstitutabilityToggle(meal.id, e.target.checked)}
                              colorScheme="purple"
                              ml={6}
                            >
                              <Text fontSize="xs" color="gray.600">
                                Substitutable
                              </Text>
                            </Checkbox>
                          )}
                        </VStack>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Additives Selection */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4} color="gray.700">{t('modals.additives')}</Heading>
            <Text color="gray.600" mb={4} fontSize="sm">
              Select additional items available with this plan
            </Text>
            
            {isLoadingItems ? (
              <Stack spacing={3}>
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} height="60px" borderRadius="md" />
                ))}
              </Stack>
            ) : (
              <Box 
                maxH="400px" 
                overflowY="auto" 
                border="1px solid" 
                borderColor="gray.200" 
                borderRadius="md"
                p={4}
              >
                <SimpleGrid columns={gridColumns} spacing={4}>
                  {additiveItems.map(item => (
                    <Box
                      key={item.id}
                      p={4}
                      borderWidth="1px"
                      borderRadius="lg"
                      cursor="pointer"
                      transition="all 0.2s"
                      bg={formData.additives?.includes(item.id) ? 'teal.50' : 'white'}
                      borderColor={formData.additives?.includes(item.id) ? 'teal.300' : 'gray.200'}
                      _hover={{ 
                        borderColor: 'teal.400',
                        transform: 'translateY(-2px)',
                        shadow: 'md'
                      }}
                      onClick={() => handleAdditiveToggle(item.id)}
                    >
                      <Checkbox
                        isChecked={formData.additives?.includes(item.id)}
                        onChange={() => handleAdditiveToggle(item.id)}
                        colorScheme="teal"
                        width="100%"
                      >
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium" fontSize="sm">{item.name}</Text>
                          <HStack spacing={2}>
                            <Badge colorScheme="orange" size="sm">
                              ${item.price}
                            </Badge>
                            <Badge colorScheme="gray" size="sm">
                              {item.category}
                            </Badge>
                          </HStack>
                        </VStack>
                      </Checkbox>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <Flex 
          justify="flex-end" 
          gap={3} 
          pt={4}
          borderTop="1px solid"
          borderColor="gray.100"
        >
          <Button
            onClick={onCancel}
            variant="outline"
            size="md"
            width={{ base: '100%', sm: 'auto' }}
            isDisabled={isUploading || isProcessingMeals}
          >
            {t('modals.cancel')}
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            size="md"
            width={{ base: '100%', sm: 'auto' }}
            isLoading={isUploading || isProcessingMeals}
            loadingText={isProcessingMeals ? "Configuring meals..." : t('modals.saving')}
          >
            {isEdit ? t('modals.update') : t('modals.save')}
          </Button>
        </Flex>
      </VStack>
    </Box>
  )
}

export default PlanForm;