import { useState, useEffect, useCallback } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Stack,
  Checkbox,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  SimpleGrid,
  Box,
  useToast,
  Switch,
  Image,
  Flex,
  Text,
  Grid,
  VStack,
  HStack,
  Card,
  CardBody,
  Heading,
  Divider,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
} from '@chakra-ui/react';
import { useAdminFunctions } from '../../Hooks/useAdminFunctions';

const MealsForm = ({ initialData, onSubmit, isLoading, isEdit, onCancel}) => {
  const [formData, setFormData] = useState({
    id:'',
    name: '',
    name_arabic: '',
    description: '',
    description_arabic: '',
    section: '',
    section_arabic: '',
    base_price: 0,
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    weight: 0,
    ingredients: '',
    ingredients_arabic: '',
    image_url: '',
    is_available: true,
    is_featured: false,
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    is_selective: false,
    allergy_ids: [],
    item_ids: []
  });

  const adminFunctions = useAdminFunctions();
  const { useGetAllItems, useGetAllAllergies, useGetMealItems } = adminFunctions;
  const { data: items = [] } = useGetAllItems();
  const { data: allergies = [] } = useGetAllAllergies();
  
  // Fetch meal items only when editing a meal with an ID
  const { data: mealItemIds = [], isLoading: loadingMealItems } = useGetMealItems(
    isEdit && formData.id ? formData.id : null
  );

  const [imagePreview, setImagePreview] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const toast = useToast();

  // Memoized initialization to prevent unnecessary re-renders
  const initializeFormData = useCallback((data) => {
    if (!data) return;

    //console.log('Initializing form with data:', data);

    // Extract allergy_ids - already provided by transformed data
    const allergyIds = data.allergy_ids || [];
    
    // Extract item_ids - already provided by transformed data
    const itemIds = data.item_ids || [];
    
    const newFormData = {
      id: data.id || '',
      name: data.name || '',
      name_arabic: data.name_arabic || '',
      description: data.description || '',
      description_arabic: data.description_arabic || '',
      section: data.section || '',
      section_arabic: data.section_arabic || '',
      base_price: data.base_price || 0,
      calories: data.calories || 0,
      protein_g: data.protein_g || 0,
      carbs_g: data.carbs_g || 0,
      fat_g: data.fat_g || 0,
      weight: data.weight || 0,
      ingredients: data.ingredients || '',
      ingredients_arabic: data.ingredients_arabic || '',
      image_url: data.image_url || '',
      is_available: data.is_available ?? true,
      is_featured: data.is_featured ?? false,
      is_vegetarian: data.is_vegetarian ?? false,
      is_vegan: data.is_vegan ?? false,
      is_gluten_free: data.is_gluten_free ?? false,
      is_selective: data.is_selective ?? false,
      allergy_ids: allergyIds,
      item_ids: itemIds,
    };

    setFormData(newFormData);
    //console.log('Form data set:', newFormData);
    
    // Set image preview
    if (data.image_url) {
      setImagePreview(data.image_url);
    }
  }, []);

  // Update selected items when mealItemIds or items change
  useEffect(() => {
    if (mealItemIds.length > 0 && items.length > 0) {
      //console.log('Meal item IDs from API:', mealItemIds);
      const preSelectedItems = items.filter(item => mealItemIds.includes(item.id));
      //console.log('Pre-selected items:', preSelectedItems);
      setSelectedItems(preSelectedItems);
      
      // Update form data with the item IDs
      setFormData(prev => ({
        ...prev,
        item_ids: mealItemIds
      }));
    }
  }, [mealItemIds, items]);

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData) {
      //console.log('useEffect triggered - initializing form');
      //console.log('Initial data:', initialData);
      initializeFormData(initialData);
    }
  }, [initialData, initializeFormData]);

  // Cleanup image preview URLs
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);


  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleNumberChange = useCallback((field, value) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value === '' ? '' : parseFloat(value) || 0 
    }));
  }, []);

  const handleSwitchChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAllergyToggle = useCallback((allergyId) => {
    setFormData(prev => ({
      ...prev,
      allergy_ids: prev.allergy_ids.includes(allergyId)
        ? prev.allergy_ids.filter(id => id !== allergyId)
        : [...prev.allergy_ids, allergyId]
    }));
  }, []);

  const handleItemToggle = useCallback((item) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected.id === item.id);
      const newSelectedItems = isSelected
        ? prev.filter(selected => selected.id !== item.id)
        : [...prev, item];
      
      // Update form data with just the IDs
      setFormData(formPrev => ({
        ...formPrev,
        item_ids: newSelectedItems.map(item => item.id)
      }));
      
      return newSelectedItems;
    });
  }, []);

  const removeSelectedItem = useCallback((itemId) => {
    setSelectedItems(prev => {
      const newSelectedItems = prev.filter(item => item.id !== itemId);
      
      setFormData(formPrev => ({
        ...formPrev,
        item_ids: newSelectedItems.map(item => item.id)
      }));
      
      return newSelectedItems;
    });
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          status: 'warning',
          duration: 3000,
        });
        return;
      }
      
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setFormData(prev => ({ ...prev, image_url: previewUrl }));
    }
  }, [imagePreview, toast]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Missing required field',
        description: 'Meal name is required',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (!formData.base_price || formData.base_price <= 0) {
      toast({
        title: 'Invalid price',
        description: 'Please enter a valid price',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    if (formData.is_selective && formData.item_ids.length === 0) {
      toast({
        title: 'Missing items',
        description: 'Selective meals must have at least one item',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    const cleanedData = {
      ...formData,
      base_price: parseFloat(formData.base_price) || 0,
      calories: parseFloat(formData.calories) || 0,
      protein_g: parseFloat(formData.protein_g) || 0,
      carbs_g: parseFloat(formData.carbs_g) || 0,
      fat_g: parseFloat(formData.fat_g) || 0,
      weight: parseFloat(formData.weight) || 0,
    };

    onSubmit(cleanedData);
  }, [formData, onSubmit, toast]);

  const FormSection = useCallback(({ title, children, ...props }) => (
    <Card variant="outline" {...props}>
      <CardBody>
        <Heading size="md" mb={4} color="brand.600">
          {title}
        </Heading>
        {children}
      </CardBody>
    </Card>
  ), []);

  // Show loading state while fetching meal items
  if (isEdit && loadingMealItems) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Loading meal details...</Text>
      </Box>
    );
  }

  return (
    <Box as="form" onSubmit={handleSubmit} maxW="6xl" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" color="brand.700" mb={2}>
            {isEdit ? 'Edit Meal' : 'Create New Meal'}
          </Heading>
          <Text color="gray.600">
            {isEdit ? 'Update meal details and properties' : 'Add a new meal to your menu'}
          </Text>
        </Box>

        {/* Image Upload */}
        <FormSection title="Meal Image">
          <Grid templateColumns={{ base: '1fr', md: '200px 1fr' }} gap={6} alignItems="center">
            <Box
              border="2px dashed"
              borderColor={imagePreview ? 'transparent' : 'gray.300'}
              borderRadius="lg"
              overflow="hidden"
              bg={imagePreview ? 'transparent' : 'gray.50'}
              w="200px"
              h="150px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {imagePreview ? (
                <Image 
                  src={imagePreview} 
                  alt="Meal preview" 
                  w="100%"
                  h="100%"
                  objectFit="cover"
                />
              ) : (
                <Text color="gray.500" textAlign="center">
                  No image
                </Text>
              )}
            </Box>
            
            <VStack align="start" spacing={3}>
              <Button 
                as="label"
                colorScheme="brand"
                cursor="pointer"
                size="sm"
              >
                Choose Image
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  position="absolute"
                  top={0}
                  left={0}
                  opacity={0}
                  width="100%"
                  height="100%"
                  cursor="pointer"
                />
              </Button>
              <Text fontSize="sm" color="gray.500">
                JPEG, PNG or WebP (Max 5MB)
              </Text>
            </VStack>
          </Grid>
        </FormSection>

        {/* Basic Information */}
        <FormSection title="Basic Information">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Name (English)</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter meal name"
                focusBorderColor="brand.500"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel fontWeight="medium">Name (Arabic)</FormLabel>
              <Input
                value={formData.name_arabic}
                onChange={(e) => handleChange('name_arabic', e.target.value)}
                placeholder="أدخل اسم الوجبة"
                focusBorderColor="brand.500"
                dir="rtl"
              />
            </FormControl>

            <FormControl>
              <FormLabel fontWeight="medium">Section (English)</FormLabel>
              <Input
                value={formData.section}
                onChange={(e) => handleChange('section', e.target.value)}
                placeholder="e.g., Main Course, Appetizer"
                focusBorderColor="brand.500"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel fontWeight="medium">Section (Arabic)</FormLabel>
              <Input
                value={formData.section_arabic}
                onChange={(e) => handleChange('section_arabic', e.target.value)}
                placeholder="مثلاً: الطبق الرئيسي، المقبلات"
                focusBorderColor="brand.500"
                dir="rtl"
              />
            </FormControl>
          </SimpleGrid>
        </FormSection>

        {/* Description */}
        <FormSection title="Description">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel fontWeight="medium">Description (English)</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the meal..."
                rows={3}
                focusBorderColor="brand.500"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel fontWeight="medium">Description (Arabic)</FormLabel>
              <Textarea
                value={formData.description_arabic}
                onChange={(e) => handleChange('description_arabic', e.target.value)}
                placeholder="صف الوجبة..."
                rows={3}
                focusBorderColor="brand.500"
                dir="rtl"
              />
            </FormControl>
          </SimpleGrid>
        </FormSection>

        {/* Ingredients */}
        <FormSection title="Ingredients">
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl>
              <FormLabel fontWeight="medium">Ingredients (English)</FormLabel>
              <Textarea
                value={formData.ingredients}
                onChange={(e) => handleChange('ingredients', e.target.value)}
                placeholder="List ingredients separated by commas"
                rows={3}
                focusBorderColor="brand.500"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel fontWeight="medium">Ingredients (Arabic)</FormLabel>
              <Textarea
                value={formData.ingredients_arabic}
                onChange={(e) => handleChange('ingredients_arabic', e.target.value)}
                placeholder="قائمة المكونات مفصولة بفواصل"
                rows={3}
                focusBorderColor="brand.500"
                dir="rtl"
              />
            </FormControl>
          </SimpleGrid>
        </FormSection>

        {/* Nutritional Information */}
        <FormSection title="Nutritional Information">
          <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Price (SAR)</FormLabel>
              <NumberInput 
                value={formData.base_price}
                onChange={(value) => handleNumberChange('base_price', value)}
                min={0}
                precision={2}
                keepWithinRange={false}
                clampValueOnBlur={false}
              >
                <NumberInputField focusBorderColor="brand.500" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel fontWeight="medium">Calories</FormLabel>
              <NumberInput 
                value={formData.calories}
                onChange={(value) => handleNumberChange('calories', value)}
                min={0}
                keepWithinRange={false}
                clampValueOnBlur={false}
              >
                <NumberInputField focusBorderColor="brand.500" />
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel fontWeight="medium">Protein (g)</FormLabel>
              <NumberInput 
                value={formData.protein_g}
                onChange={(value) => handleNumberChange('protein_g', value)}
                min={0}
                keepWithinRange={false}
                clampValueOnBlur={false}
              >
                <NumberInputField focusBorderColor="brand.500" />
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel fontWeight="medium">Carbs (g)</FormLabel>
              <NumberInput 
                value={formData.carbs_g}
                onChange={(value) => handleNumberChange('carbs_g', value)}
                min={0}
                keepWithinRange={false}
                clampValueOnBlur={false}
              >
                <NumberInputField focusBorderColor="brand.500" />
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel fontWeight="medium">Weight (g)</FormLabel>
              <NumberInput 
                value={formData.weight}
                onChange={(value) => handleNumberChange('weight', value)}
                min={0}
                keepWithinRange={false}
                clampValueOnBlur={false}
              >
                <NumberInputField focusBorderColor="brand.500" />
              </NumberInput>
            </FormControl>
          </SimpleGrid>
        </FormSection>

        {/* Meal Type & Items */}
        <FormSection title="Meal Type & Items">
          <VStack align="stretch" spacing={4}>
            {/* Selective Meal Toggle */}
            <FormControl display="flex" alignItems="center" justifyContent="space-between">
              <FormLabel mb="0" fontWeight="medium">Selective Meal (Build Your Own)</FormLabel>
              <Switch
                isChecked={formData.is_selective}
                onChange={(e) => handleSwitchChange('is_selective', e.target.checked)}
                colorScheme="brand"
              />
            </FormControl>

            {/* Show items selection only if selective */}
            {formData.is_selective && (
              <>
                <Divider />
                
                {/* Selected Items */}
                {selectedItems.length > 0 && (
                  <Box>
                    <FormLabel fontWeight="medium">Selected Items:</FormLabel>
                    <Wrap spacing={2}>
                      {selectedItems.map(item => (
                        <WrapItem key={item.id}>
                          <Tag size="md" colorScheme="brand" borderRadius="full">
                            <TagLabel>{item.name}</TagLabel>
                            <TagCloseButton onClick={() => removeSelectedItem(item.id)} />
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                )}

                {/* Available Items */}
                <Box>
                  <FormLabel fontWeight="medium">Available Items:</FormLabel>
                  <Box 
                    borderWidth="1px" 
                    borderRadius="lg" 
                    p={4} 
                    bg="gray.50"
                    maxH="200px"
                    overflowY="auto"
                  >
                    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={2}>
                      {items.map(item => (
                        <Checkbox
                          key={item.id}
                          isChecked={selectedItems.some(selected => selected.id === item.id)}
                          onChange={() => handleItemToggle(item)}
                          colorScheme="brand"
                        >
                          <Text fontSize="sm">{item.name} - SAR {item.price}</Text>
                        </Checkbox>
                      ))}
                    </SimpleGrid>
                  </Box>
                </Box>
              </>
            )}
          </VStack>
        </FormSection>

        {/* Allergies & Dietary */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Allergies */}
          <FormSection title="Allergies">
            <Box 
              borderWidth="1px" 
              borderRadius="lg" 
              p={4} 
              bg="gray.50"
              maxH="300px"
              overflowY="auto"
            >
              <SimpleGrid columns={1} spacing={3}>
                {allergies.map(allergy => (
                  <Checkbox
                    key={allergy.id}
                    isChecked={formData.allergy_ids.includes(allergy.id)}
                    onChange={() => handleAllergyToggle(allergy.id)}
                    colorScheme="red"
                    size="lg"
                  >
                    <Text fontWeight="medium">{allergy.name}</Text>
                  </Checkbox>
                ))}
              </SimpleGrid>
            </Box>
          </FormSection>

          {/* Availability & Dietary Options */}
          <FormSection title="Availability & Options">
            <VStack spacing={4} align="stretch">
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb="0" fontWeight="medium">Available for Order</FormLabel>
                <Switch
                  isChecked={formData.is_available}
                  onChange={(e) => handleSwitchChange('is_available', e.target.checked)}
                  colorScheme="brand"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb="0" fontWeight="medium">Featured Meal</FormLabel>
                <Switch
                  isChecked={formData.is_featured}
                  onChange={(e) => handleSwitchChange('is_featured', e.target.checked)}
                  colorScheme="brand"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb="0" fontWeight="medium">Vegetarian</FormLabel>
                <Switch
                  isChecked={formData.is_vegetarian}
                  onChange={(e) => handleSwitchChange('is_vegetarian', e.target.checked)}
                  colorScheme="green"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb="0" fontWeight="medium">Vegan</FormLabel>
                <Switch
                  isChecked={formData.is_vegan}
                  onChange={(e) => handleSwitchChange('is_vegan', e.target.checked)}
                  colorScheme="green"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb="0" fontWeight="medium">Gluten Free</FormLabel>
                <Switch
                  isChecked={formData.is_gluten_free}
                  onChange={(e) => handleSwitchChange('is_gluten_free', e.target.checked)}
                  colorScheme="orange"
                />
              </FormControl>
            </VStack>
          </FormSection>
        </SimpleGrid>

        {/* Action Buttons */}
        <Card>
          <CardBody>
            <Flex justify="flex-end" gap={3}>
              <Button 
                onClick={onCancel}
                variant="outline" 
                size="lg"
                minW="120px"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="brand"
                isLoading={isLoading}
                loadingText={isEdit ? "Saving..." : "Creating..."}
                size="lg"
                minW="120px"
              >
                {isEdit ? "Update Meal" : "Create Meal"}
              </Button>
            </Flex>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default MealsForm;