import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Flex,
  Box,
  VStack,
  HStack,
  Text,
  Select,
  Switch,
  Textarea,
  Stack,
  Checkbox,
  useToast,
  Grid,
  GridItem,
  Heading,
  Divider,
  useBreakpointValue,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useAdminFunctions } from '../../Hooks/useAdminFunctions';

const ItemForm = ({ onSubmit, onCancel, initialData = {}, isEdit = false }) => {
  const { useGetAllAllergies } = useAdminFunctions();
  const { data: allAllergies = [] } = useGetAllAllergies();
  const toast = useToast();
  
  const isMobile = useBreakpointValue({ base: true, md: false });
  const gridColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 });

  const [formData, setFormData] = useState(() => {
    const defaultData = {
      name: '',
      name_arabic: '',
      description: '',
      description_arabic: '',
      category: '',
      category_arabic: '',
      price: 0,
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      max_free_per_meal: 0,
      image_url: '',
      is_available: true,
      sort_order: 0,
      allergy_ids: [],
    };

    if (initialData.id) {
      const allergyIds = initialData.item_allergies 
        ? initialData.item_allergies.map(ia => ia.allergies.id) 
        : initialData.allergy_ids || [];

      return { 
        ...defaultData, 
        ...initialData,
        allergy_ids: allergyIds 
      };
    }
    return defaultData;
  });

  const categories = [
    { en: 'protein', ar: 'بروتين' },
    { en: 'nuts', ar: 'مكسرات' },
    { en: 'Vegetables', ar: 'خضروات' },
    { en: 'Fruits', ar: 'فواكه' },
    { en: 'toppings', ar: 'اضافات' },
    { en: 'dressings', ar: 'صوصات' },
    { en: 'Cheese', ar: 'الأجبان' },
    { en: 'greens', ar: 'الورقيات' },
    { en: 'salad-fruits', ar: 'سلطة الفواكه' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const categoryValue = e.target.value;
    const selectedCategory = categories.find(cat => cat.en === categoryValue);
    
    setFormData(prev => ({
      ...prev,
      category: categoryValue,
      category_arabic: selectedCategory ? selectedCategory.ar : ''
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanFormData = {...formData};
    delete cleanFormData.item_allergies; 
    delete cleanFormData.allergies; 
    onSubmit(cleanFormData);
  };

  const toggleAllergen = (allergyId) => {
    setFormData(prev => {
      const currentIds = [...(prev.allergy_ids || [])];
      const index = currentIds.indexOf(allergyId);
      
      if (index > -1) {
        currentIds.splice(index, 1);
      } else {
        currentIds.push(allergyId);
      }
      
      return { ...prev, allergy_ids: currentIds };
    });
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={2} color="gray.800">
            {isEdit ? 'Edit Item' : 'Create New Item'}
          </Heading>
          <Text color="gray.600" fontSize="sm">
            {isEdit ? 'Update item details and properties' : 'Add a new item to your menu'}
          </Text>
        </Box>

        {/* Basic Information Section */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4} color="gray.700">Basic Information</Heading>
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="medium">Name (English)</FormLabel>
                <Input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  placeholder="Enter item name"
                  focusBorderColor="blue.500"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel fontWeight="medium">Name (Arabic)</FormLabel>
                <Input
                  name="name_arabic"
                  value={formData.name_arabic}
                  onChange={handleChange}
                  placeholder="أدخل اسم العنصر"
                  focusBorderColor="blue.500"
                  dir="rtl"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="medium">Description (English)</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter item description"
                  rows={3}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="medium">Description (Arabic)</FormLabel>
                <Textarea
                  name="description_arabic"
                  value={formData.description_arabic}
                  onChange={handleChange}
                  placeholder="أدخل وصف العنصر"
                  rows={3}
                  dir="rtl"
                />
              </FormControl>
            </Grid>
          </CardBody>
        </Card>

        {/* Category & Pricing Section */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4} color="gray.700">Category & Pricing</Heading>
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }} gap={4}>
              <FormControl isRequired>
                <FormLabel fontWeight="medium">Category</FormLabel>
                <Select 
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  focusBorderColor="blue.500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category.en}>
                      {category.en}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="medium">Category (Arabic)</FormLabel>
                <Input
                  name="category_arabic"
                  value={formData.category_arabic}
                  onChange={handleChange}
                  readOnly
                  bg="gray.50"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="medium">Price (SAR)</FormLabel>
                <Input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                  focusBorderColor="blue.500"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="medium">Max Free Per Meal</FormLabel>
                <Input
                  type="number"
                  name="max_free_per_meal"
                  value={formData.max_free_per_meal}
                  onChange={handleChange}
                  min={0}
                  focusBorderColor="blue.500"
                />
              </FormControl>
            </Grid>
          </CardBody>
        </Card>

        {/* Nutritional Information Section */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4} color="gray.700">Nutritional Information</Heading>
            <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }} gap={4}>
              <FormControl>
                <FormLabel fontWeight="medium">Calories (kcal)</FormLabel>
                <Input 
                  type="number" 
                  name="calories" 
                  value={formData.calories} 
                  onChange={handleChange} 
                  min={0}
                  focusBorderColor="blue.500"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="medium">Protein (g)</FormLabel>
                <Input
                  type="number"
                  name="protein_g"
                  value={formData.protein_g}
                  onChange={handleChange}
                  min={0}
                  focusBorderColor="blue.500"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="medium">Carbs (g)</FormLabel>
                <Input
                  type="number"
                  name="carbs_g"
                  value={formData.carbs_g}
                  onChange={handleChange}
                  min={0}
                  focusBorderColor="blue.500"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="medium">Fat (g)</FormLabel>
                <Input
                  type="number"
                  name="fat_g"
                  value={formData.fat_g}
                  onChange={handleChange}
                  min={0}
                  focusBorderColor="blue.500"
                />
              </FormControl>
            </Grid>
          </CardBody>
        </Card>

        {/* Allergens Section */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4} color="gray.700">Associated Allergies</Heading>
            <Box 
              borderWidth="1px" 
              borderRadius="lg" 
              p={4} 
              bg="gray.50"
              maxH="300px"
              overflowY="auto"
            >
              <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr', lg: 'repeat(3, 1fr)' }} gap={3}>
                {allAllergies.length > 0 ? (
                  allAllergies.map(allergy => (
                    <Checkbox
                      key={allergy.id}
                      isChecked={formData.allergy_ids.includes(allergy.id)}
                      onChange={() => toggleAllergen(allergy.id)}
                      colorScheme="blue"
                      size="lg"
                      bg="white"
                      p={3}
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                    >
                      <Box ml={2}>
                        <Text fontWeight="medium">{allergy.name}</Text>
                        <Text fontSize="sm" color="gray.600">{allergy.name_arabic}</Text>
                      </Box>
                    </Checkbox>
                  ))
                ) : (
                  <Text color="gray.500" fontStyle="italic" gridColumn="1 / -1">
                    No allergies available
                  </Text>
                )}
              </Grid>
            </Box>
          </CardBody>
        </Card>

        {/* Availability & Image Section */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4} color="gray.700">Additional Settings</Heading>
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0" fontWeight="medium">Available</FormLabel>
                <Switch
                  name="is_available"
                  isChecked={formData.is_available}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, is_available: e.target.checked }))
                  }
                  colorScheme="green"
                  size="lg"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel fontWeight="medium">Image URL</FormLabel>
                <Input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  focusBorderColor="blue.500"
                />
              </FormControl>
            </Grid>
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
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            colorScheme="blue" 
            size="md"
            width={{ base: '100%', sm: 'auto' }}
          >
            {isEdit ? 'Update Item' : 'Create Item'}
          </Button>
        </Flex>
      </VStack>
    </Box>
  );
}

export default ItemForm;