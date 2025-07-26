import { 
  FormControl, FormLabel, Input, Button, Flex, Switch, Textarea,
  Box, Image, useToast, SimpleGrid, Text, Heading, Divider, Checkbox,
  useBreakpointValue, Skeleton, Stack
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { uploadImage, deleteImage } from '../../API/imageUtils'; 
import { useAdminFunctions } from '../../Hooks/useAdminFunctions';
import { useTranslation } from 'react-i18next';
const PlanForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const {t}= useTranslation();
  const { 
    useGetAllMeals, 
    useGetAllItems, 
    useGetPlanDetails 
  } = useAdminFunctions();
  
  // Add loading states for all queries
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
  
  // Safely set meals from plan data when available
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
  
  const gridColumns = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 });

  return (
    <form onSubmit={handleSubmit}>
  {/* Image Upload Section */}
  <Box mb={6}>
    <Flex direction="column" align="center" gap={3}>
      {imagePreview ? (
        <Image
          src={imagePreview}
          alt={t('admin.modals.planPreview')}
          maxW="200px"
          maxH="150px"
          objectFit="contain"
          borderRadius="md"
          border="1px solid"
          borderColor="gray.200"
        />
      ) : (
        <Box
          w="200px"
          h="150px"
          border="2px dashed"
          borderColor="gray.300"
          borderRadius="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text color="gray.500">{t('admin.modals.noImage')}</Text>
        </Box>
      )}

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
      <Text fontSize="sm" color="gray.500">
        {t('admin.modals.imageHint')}
      </Text>
    </Flex>
  </Box>

  <SimpleGrid columns={[1, 2]} spacing={4} mb={6}>
    <FormControl isRequired>
      <FormLabel>{t('admin.modals.titleEn')}</FormLabel>
      <Input
        type="text"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder={t('admin.modals.titleEn')}
      />
    </FormControl>

    <FormControl isRequired>
      <FormLabel>{t('admin.modals.titleAr')}</FormLabel>
      <Input
        type="text"
        name="title_arabic"
        value={formData.title_arabic}
        onChange={handleChange}
        placeholder={t('admin.modals.titleAr')}
        dir="rtl"
      />
    </FormControl>
  </SimpleGrid>

  <Heading size="md" mb={4}>{t('admin.modals.nutritionalInfo')}</Heading>
  <Divider mb={4} />
  <SimpleGrid columns={[1, 2, 3]} spacing={4} mb={6}>
    <FormControl isRequired>
      <FormLabel>{t('admin.modals.carbs')}</FormLabel>
      <Input
        type="number"
        name="carb"
        value={formData.carb}
        onChange={handleChange}
        min={0}
      />
    </FormControl>

    <FormControl isRequired>
      <FormLabel>{t('admin.modals.protein')}</FormLabel>
      <Input
        type="number"
        name="protein"
        value={formData.protein}
        onChange={handleChange}
        min={0}
      />
    </FormControl>

    <FormControl isRequired>
      <FormLabel>{t('admin.modals.calories')}</FormLabel>
      <Input
        type="number"
        name="kcal"
        value={formData.kcal}
        onChange={handleChange}
        min={0}
      />
    </FormControl>
  </SimpleGrid>

  <Heading size="md" mb={4}>{t('admin.modals.mealTerms')}</Heading>
  <Divider mb={4} />
  <SimpleGrid columns={[1, 2]} spacing={4} mb={6}>
    <FormControl>
      <FormLabel>{t('admin.modals.shortTermMeals')}</FormLabel>
      <Input
        type="number"
        name="short_term_meals"
        value={formData.short_term_meals}
        onChange={handleChange}
        min={0}
      />
    </FormControl>

    <FormControl>
      <FormLabel>{t('admin.modals.mediumTermMeals')}</FormLabel>
      <Input
        type="number"
        name="medium_term_meals"
        value={formData.medium_term_meals}
        onChange={handleChange}
        min={0}
      />
    </FormControl>
  </SimpleGrid>

  <SimpleGrid columns={[1, 2]} spacing={4} mb={6}>
    <FormControl>
      <FormLabel>{t('admin.modals.descriptionEn')}</FormLabel>
      <Textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder={t('admin.modals.descriptionEn')}
        rows={4}
      />
    </FormControl>

    <FormControl>
      <FormLabel>{t('admin.modals.descriptionAr')}</FormLabel>
      <Textarea
        name="description_arabic"
        value={formData.description_arabic}
        onChange={handleChange}
        placeholder={t('admin.modals.descriptionAr')}
        dir="rtl"
        rows={4}
      />
    </FormControl>
  </SimpleGrid>

  {/* Meals */}
  <Box mb={6}>
    <Heading size="md" mb={4}>{t('admin.modals.mealSelection')}</Heading>
    <Divider mb={4} />
    {(isLoadingMeals || (initialData?.id && isLoadingPlan)) ? (
      <Stack spacing={3}>
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} height="60px" borderRadius="md" />
        ))}
      </Stack>
    ) : (
      <Box maxH="300px" overflowY="auto" pr={2} border="1px solid" borderColor="gray.200" borderRadius="md">
        <SimpleGrid columns={gridColumns} spacing={4} p={2}>
          {meals.map(meal => (
            <Box
              key={meal.id}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              cursor="pointer"
              transition="0.2s"
              bg={formData.meals?.includes(meal.id) ? 'blue.50' : 'white'}
              borderColor={formData.meals?.includes(meal.id) ? 'blue.300' : 'gray.200'}
              _hover={{ borderColor: 'blue.400' }}
            >
              <Checkbox
                isChecked={formData.meals?.includes(meal.id)}
                onChange={() => handleMealToggle(meal.id)}
                colorScheme="blue"
              >
                {meal.name}
              </Checkbox>
              <Text fontSize="sm" color="gray.500" mt={1}>
                {meal.category} - ${meal.base_price}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    )}
  </Box>

  {/* Additives */}
  <Box mb={6}>
    <Heading size="md" mb={4}>{t('admin.modals.additives')}</Heading>
    <Divider mb={4} />
    {isLoadingItems ? (
      <Stack spacing={3}>
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} height="60px" borderRadius="md" />
        ))}
      </Stack>
    ) : (
      <Box maxH="300px" overflowY="auto" pr={2} border="1px solid" borderColor="gray.200" borderRadius="md">
        <SimpleGrid columns={gridColumns} spacing={4} p={2}>
          {additiveItems.map(item => (
            <Box
              key={item.id}
              p={3}
              borderWidth="1px"
              borderRadius="md"
              cursor="pointer"
              transition="0.2s"
              bg={formData.additives?.includes(item.id) ? 'teal.50' : 'white'}
              borderColor={formData.additives?.includes(item.id) ? 'teal.300' : 'gray.200'}
              _hover={{ borderColor: 'teal.400' }}
            >
              <Checkbox
                isChecked={formData.additives?.includes(item.id)}
                onChange={() => handleAdditiveToggle(item.id)}
                colorScheme="teal"
              >
                {item.name}
              </Checkbox>
              <Text fontSize="sm" color="gray.500" mt={1}>
                ${item.price}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>
    )}
  </Box>

  <SimpleGrid columns={[1, 2]} spacing={4} mb={6}>
    <FormControl isRequired>
      <FormLabel>{t('admin.modals.pricePerMeal')}</FormLabel>
      <Input
        type="number"
        name="price_per_meal"
        value={formData.price_per_meal}
        onChange={handleChange}
        min={0}
      />
    </FormControl>

    <FormControl display="flex" alignItems="center">
      <FormLabel htmlFor="is_active" mb="0">
        {t('admin.modals.isActive')}
      </FormLabel>
      <Switch
        id="is_active"
        name="is_active"
        isChecked={formData.is_active}
        onChange={handleChange}
        size="lg"
      />
    </FormControl>
  </SimpleGrid>

  <Flex justify="flex-end" gap={2} mt={6}>
    <Button
      onClick={onCancel}
      variant="outline"
      width="20%"
      isDisabled={isUploading}
    >
      {t('admin.modals.cancel')}
    </Button>
    <Button
      type="submit"
      colorScheme="brand"
      width="20%"
      isLoading={isUploading}
      loadingText={t('admin.modals.saving')}
    >
      {t('admin.modals.save')}
    </Button>
  </Flex>
</form>

  )
}

export default PlanForm;