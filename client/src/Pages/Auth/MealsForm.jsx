// Enhanced MealsForm.jsx
import { useState, useEffect } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Select,
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
  Badge,
  Divider,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
} from '@chakra-ui/react';
import { useAdminFunctions } from '../../Hooks/useAdminFunctions';

const MealsForm = ({ initialData, onSubmit, isLoading, isEdit, onCancel }) => {
  const [formData, setFormData] = useState({
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
    weight:0,
    ingredients: '',
    ingredients_arabic: '',
    image_url: '',
    is_available: true,
    is_featured: false,
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    allergy_ids: [],
    item_ids: []
  });

  const { useGetAllItems, useGetAllAllergies } = useAdminFunctions();
  const { data: items = [] } = useGetAllItems();
  const { data: allergies = [] } = useGetAllAllergies();
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const toast = useToast();

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      const allergyIds = initialData.meal_allergies?.map(ma => ma.allergies?.id) || initialData.allergy_ids || [];
      const itemIds = initialData.meal_items?.[0]?.items || initialData.item_ids || [];
      
      setFormData(prev => ({
        ...prev,
        ...initialData,
        allergy_ids: allergyIds,
        item_ids: itemIds
      }));
      
      setSelectedItems(items.filter(item => itemIds.includes(item.id)));
      
      if (initialData.image_url) {
        setImagePreview(initialData.image_url);
      }
    }
  }, [initialData, items]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNumberChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleSwitchChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAllergyToggle = (allergyId) => {
    setFormData(prev => ({
      ...prev,
      allergy_ids: prev.allergy_ids.includes(allergyId)
        ? prev.allergy_ids.filter(id => id !== allergyId)
        : [...prev.allergy_ids, allergyId]
    }));
  };

  const handleItemToggle = (item) => {
    const newSelectedItems = selectedItems.some(selected => selected.id === item.id)
      ? selectedItems.filter(selected => selected.id !== item.id)
      : [...selectedItems, item];
    
    setSelectedItems(newSelectedItems);
    setFormData(prev => ({
      ...prev,
      item_ids: newSelectedItems.map(item => item.id)
    }));
  };

  const removeSelectedItem = (itemId) => {
    const newSelectedItems = selectedItems.filter(item => item.id !== itemId);
    setSelectedItems(newSelectedItems);
    setFormData(prev => ({
      ...prev,
      item_ids: newSelectedItems.map(item => item.id)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
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
      
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
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

    onSubmit(formData);
  };

  const FormSection = ({ title, children, ...props }) => (
    <Card variant="outline" {...props}>
      <CardBody>
        <Heading size="md" mb={4} color="brand.600">
          {title}
        </Heading>
        {children}
      </CardBody>
    </Card>
  );

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
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel fontWeight="medium">Price (SAR)</FormLabel>
              <NumberInput 
                value={formData.base_price}
                onChange={(v) => handleNumberChange('base_price', v)}
                min={0}
                precision={2}
              >
                <NumberInputField focusBorderColor="brand.500" />
                <NumberInputStepper>
                  {/* <NumberIncrementStepper />
                  <NumberDecrementStepper /> */}
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel fontWeight="medium">Calories</FormLabel>
              <NumberInput 
                value={formData.calories}
                onChange={(v) => handleNumberChange('calories', v)}
                min={0}
              >
                <NumberInputField focusBorderColor="brand.500" />
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel fontWeight="medium">Protein (g)</FormLabel>
              <NumberInput 
                value={formData.protein_g}
                onChange={(v) => handleNumberChange('protein_g', v)}
                min={0}
              >
                <NumberInputField focusBorderColor="brand.500" />
              </NumberInput>
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="medium">Weight(g)</FormLabel>
              <NumberInput 
                value={formData.weight}
                onChange={(v) => handleNumberChange('weight', v)}
                min={0}
              >
                <NumberInputField focusBorderColor="brand.500" />
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel fontWeight="medium">Carbs (g)</FormLabel>
              <NumberInput 
                value={formData.carbs_g}
                onChange={(v) => handleNumberChange('carbs_g', v)}
                min={0}
              >
                <NumberInputField focusBorderColor="brand.500" />
              </NumberInput>
            </FormControl>
          </SimpleGrid>
        </FormSection>

        {/* Meal Items */}
        <FormSection title="Meal Items">
          <VStack align="stretch" spacing={4}>
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