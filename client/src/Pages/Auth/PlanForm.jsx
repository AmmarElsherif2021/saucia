import { 
  FormControl, FormLabel, Input, Button, Flex, Switch, Textarea,
  Box, Image, useToast, SimpleGrid, Text, Heading, Divider, Checkbox,
  useBreakpointValue, Skeleton, Stack, Grid, GridItem, Card, CardBody,
  VStack, HStack, Badge
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { uploadImage, deleteImage } from '../../API/imageUtils'; 
import { useAdminFunctions } from '../../Hooks/useAdminFunctions';
import { useTranslation } from 'react-i18next';

const PlanForm = ({ onSubmit, onCancel, initialData = {}, isEdit = false }) => {
  const {t}= useTranslation();
  const { 
    useGetAllMeals, 
    useGetAllItems, 
    useGetPlanDetails 
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
  const toast = useToast();
  
  const isMobile = useBreakpointValue({ base: true, md: false });
  const gridColumns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 });

  useEffect(() => {
    if (initialData?.id && plan?.meals) {
      setFormData(prev => ({
        ...prev,
        meals: plan.meals
      }));
    }
  }, [plan, initialData?.id]);

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
  
  const handleMealToggle = (mealId) => {
    setFormData(prev => {
      const meals = [...prev.meals];
      const index = meals.indexOf(mealId);
      
      if (index > -1) meals.splice(index, 1);
      else meals.push(mealId);
      
      return { ...prev, meals };
    });
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
      
      const processedData = {
        ...formData,
        avatar_url: newAvatarUrl
      };
      
      await onSubmit(processedData);
      
      if (initialData.id && imageFile && oldAvatarUrl && oldAvatarUrl !== newAvatarUrl) {
        await deleteImage(oldAvatarUrl, 'plans');
      }
    } catch (error) {
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
                      alt={t('admin.modals.planPreview')}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />
                  ) : (
                    <Text color="gray.500" textAlign="center" px={2}>
                      {t('admin.modals.noImage')}
                    </Text>
                  )}
                </Box>
                
                <Box position="relative">
                  <Button
                    as="label"
                    colorScheme="blue"
                    cursor="pointer"
                    isLoading={isUploading}
                    loadingText={t('admin.modals.uploading')}
                    size="sm"
                  >
                    {t('admin.modals.chooseImage')}
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
                  {t('admin.modals.imageHint')}
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
                  <FormLabel fontWeight="medium">{t('admin.modals.titleEn')}</FormLabel>
                  <Input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder={t('admin.modals.titleEn')}
                    focusBorderColor="blue.500"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium">{t('admin.modals.titleAr')}</FormLabel>
                  <Input
                    type="text"
                    name="title_arabic"
                    value={formData.title_arabic}
                    onChange={handleChange}
                    placeholder={t('admin.modals.titleAr')}
                    dir="rtl"
                    focusBorderColor="blue.500"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium">{t('admin.modals.descriptionEn')}</FormLabel>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={t('admin.modals.descriptionEn')}
                    rows={3}
                    focusBorderColor="blue.500"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium">{t('admin.modals.descriptionAr')}</FormLabel>
                  <Textarea
                    name="description_arabic"
                    value={formData.description_arabic}
                    onChange={handleChange}
                    placeholder={t('admin.modals.descriptionAr')}
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
            <Heading size="md" mb={4} color="gray.700">{t('admin.modals.nutritionalInfo')}</Heading>
            <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }} gap={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="medium">{t('admin.modals.carbs')} (g)</FormLabel>
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
                <FormLabel fontWeight="medium">{t('admin.modals.protein')} (g)</FormLabel>
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
                <FormLabel fontWeight="medium">{t('admin.modals.calories')} (kcal)</FormLabel>
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
                <FormLabel fontWeight="medium">{t('admin.modals.pricePerMeal')} (SAR)</FormLabel>
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
            <Heading size="md" mb={4} color="gray.700">{t('admin.modals.mealTerms')}</Heading>
            <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }} gap={4}>
              <FormControl>
                <FormLabel fontWeight="medium">{t('admin.modals.shortTermMeals')}</FormLabel>
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
                <FormLabel fontWeight="medium">{t('admin.modals.mediumTermMeals')}</FormLabel>
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
                  {t('admin.modals.isActive')}
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
            <Heading size="md" mb={4} color="gray.700">{t('admin.modals.mealSelection')}</Heading>
            <Text color="gray.600" mb={4} fontSize="sm">
              Select meals to include in this plan
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
                  {meals.map(meal => (
                    <Box
                      key={meal.id}
                      p={4}
                      borderWidth="1px"
                      borderRadius="lg"
                      cursor="pointer"
                      transition="all 0.2s"
                      bg={formData.meals?.includes(meal.id) ? 'blue.50' : 'white'}
                      borderColor={formData.meals?.includes(meal.id) ? 'blue.300' : 'gray.200'}
                      _hover={{ 
                        borderColor: 'blue.400',
                        transform: 'translateY(-2px)',
                        shadow: 'md'
                      }}
                      onClick={() => handleMealToggle(meal.id)}
                    >
                      <Checkbox
                        isChecked={formData.meals?.includes(meal.id)}
                        onChange={() => handleMealToggle(meal.id)}
                        colorScheme="blue"
                        width="100%"
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

        {/* Additives Selection */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4} color="gray.700">{t('admin.modals.additives')}</Heading>
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
            isDisabled={isUploading}
          >
            {t('admin.modals.cancel')}
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            size="md"
            width={{ base: '100%', sm: 'auto' }}
            isLoading={isUploading}
            loadingText={t('admin.modals.saving')}
          >
            {isEdit ? t('admin.modals.update') : t('admin.modals.save')}
          </Button>
        </Flex>
      </VStack>
    </Box>
  )
}

export default PlanForm;