// MealsForm.jsx
import { supabase } from '../../../supabaseClient';
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
  Textarea,
  SimpleGrid,
  Box,
  Badge,
  useToast,
  Switch,
  Image,
  Flex,
  Text
} from '@chakra-ui/react';
import { uploadImage, deleteImage } from '../../API/imageUtils'; 

const MealsForm = ({ initialData, onSubmit, isLoading, isEdit }) => {
  const [formData, setFormData] = useState(() => {
    const defaultData = {
      name: '',
      name_arabic: '',
      section: '',
      section_arabic: '',
      base_price: 0, 
      calories: 0,
      protein_g: 0, 
      carbs_g: 0,
      ingredients: '',
      ingredients_arabic: '',
      is_available: true,
      image_url: '', 
      items: [],
      allergy_ids: [],
      dietary_preference_ids: []
    };
    
    return initialData 
      ? { ...defaultData, ...initialData } 
      : defaultData;
  });

  const [allItems, setAllItems] = useState([]);
  const [allAllergies, setAllAllergies] = useState([]);
  const [allDietaryPrefs, setAllDietaryPrefs] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  // Fetch all needed data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, allergiesRes, prefsRes] = await Promise.all([
          supabase.from('items').select('id, name, category'),
          supabase.from('allergies').select('id, name'),
          supabase.from('dietary_preferences').select('id, name')
        ]);
        
        setAllItems(itemsRes.data || []);
        setAllAllergies(allergiesRes.data || []);
        setAllDietaryPrefs(prefsRes.data || []);
        
        // Set initial image preview if editing
        if (initialData?.image_url) {
          setImagePreview(initialData.image_url);
        }
      } catch (error) {
        showToast('Failed to fetch data', error.message, 'error');
      }
    };
    
    fetchData();
  }, []);

  const showToast = (title, description, status) => {
    toast({
      title,
      description,
      status,
      duration: 5000,
      isClosable: true
    });
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle number inputs
  const handleNumberChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  // Handle item selection
  const handleItemChange = (itemId, field, value) => {
    setFormData(prev => {
      const currentItems = Array.isArray(prev.items) ? [...prev.items] : [];
      const index = currentItems.findIndex(i => i.id === itemId);
      
      if (index === -1) {
        currentItems.push({ id: itemId, [field]: value });
      } else {
        currentItems[index] = { ...currentItems[index], [field]: value };
      }
      
      return { ...prev, items: currentItems };
    });
  };

  // Handle multi-select changes
  const handleMultiSelect = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle switch change
  const handleSwitchChange = (e) => {
    setFormData(prev => ({ ...prev, is_available: e.target.checked }));
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Invalid file type', 'Please upload JPEG, PNG, or WebP images', 'error');
      return;
    }

    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showToast('File too large', 'Maximum image size is 5MB', 'error');
      return;
    }

    try {
      setIsUploading(true);
      setImageFile(file);
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      showToast('Image ready', 'Image will be saved when you submit the form', 'success');
    } catch (error) {
      showToast('Image upload failed', error.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let newImageUrl = formData.image_url;
      const oldImageUrl = formData.image_url;
      
      // Upload new image if exists
      if (imageFile) {
        setIsUploading(true);
        newImageUrl = await uploadImage(imageFile, 'meals');
      }
      
      // Prepare form data with image URL
      const formattedData = {
        ...formData,
        image_url: newImageUrl,
        items: formData.items.map(item => ({
          id: item.id,
          is_included: item.is_included || false,
          max_quantity: item.max_quantity || 0
        }))
      };
      
      // Submit form
      await onSubmit(formattedData);
      
      // Delete old image after successful update
      if (isEdit && imageFile && oldImageUrl && oldImageUrl !== newImageUrl) {
        await deleteImage(oldImageUrl, 'meals');
      }
      
      // Reset image state
      setImageFile(null);
    } catch (error) {
      showToast('Form submission failed', error.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={4}>
        {/* Image Upload Section */}
        <Box>
          <FormLabel>Meal Image</FormLabel>
          <Flex direction="column" align="center" gap={4}>
            {imagePreview && (
              <Image 
                src={imagePreview} 
                alt="Meal preview" 
                maxW="300px"
                maxH="200px"
                objectFit="contain"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.200"
              />
            )}
            
            <Box position="relative">
              <Button 
                as="label"
                colorScheme="blue"
                cursor="pointer"
                isLoading={isUploading}
                loadingText="Uploading..."
              >
                Choose Image
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
              JPEG, PNG or WebP (Max 5MB)
            </Text>
          </Flex>
        </Box>

        {/* Basic Fields */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl isRequired>
            <FormLabel>Name (English)</FormLabel>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </FormControl>
          
          <FormControl isRequired>
            <FormLabel>Name (Arabic)</FormLabel>
            <Input
              name="name_arabic"
              value={formData.name_arabic}
              onChange={handleChange}
            />
          </FormControl>
        </SimpleGrid>

        {/* Section Fields */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl>
            <FormLabel>Section (English)</FormLabel>
            <Input
              name="section"
              value={formData.section}
              onChange={handleChange}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Section (Arabic)</FormLabel>
            <Input
              name="section_arabic"
              value={formData.section_arabic}
              onChange={handleChange}
            />
          </FormControl>
        </SimpleGrid>

        {/* Ingredients Fields */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl>
            <FormLabel>Ingredients (English)</FormLabel>
            <Textarea
              name="ingredients"
              value={formData.ingredients}
              onChange={handleChange}
              placeholder="List ingredients in English"
              rows={3}
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Ingredients (Arabic)</FormLabel>
            <Textarea
              name="ingredients_arabic"
              value={formData.ingredients_arabic}
              onChange={handleChange}
              placeholder="List ingredients in Arabic"
              rows={3}
            />
          </FormControl>
        </SimpleGrid>

        {/* Is Available Switch */}
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="is-available-switch" mb="0">
            Is Available
          </FormLabel>
          <Switch
            id="is-available-switch"
            name="is_available"
            isChecked={formData.is_available}
            onChange={handleSwitchChange}
            colorScheme="green"
          />
        </FormControl>

        {/* Nutritional Info */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <FormControl>
            <FormLabel>Base Price (SAR)</FormLabel>
            <NumberInput 
              value={formData.base_price} 
              onChange={(v) => handleNumberChange('base_price', v)}
              min={0}
              precision={2}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
          
          <FormControl>
            <FormLabel>Calories (kcal)</FormLabel>
            <NumberInput 
              value={formData.calories} 
              onChange={(v) => handleNumberChange('calories', v)}
              min={0}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
          
          <FormControl>
            <FormLabel>Protein (g)</FormLabel>
            <NumberInput 
              value={formData.protein_g} 
              onChange={(v) => handleNumberChange('protein_g', v)}
              min={0}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
        </SimpleGrid>

        {/* Allergies Selection */}
        <Box borderWidth="1px" borderRadius="lg" p={4}>
          <FormLabel>Associated Allergies</FormLabel>
          <Stack spacing={2} mt={2}>
            {allAllergies?.map(allergy => (
              <Checkbox
                key={allergy.id}
                isChecked={formData?.allergy_ids?.includes(allergy.id)}
                onChange={(e) => {
                  const newIds = e.target.checked
                    ? [...formData.allergy_ids, allergy.id]
                    : formData.allergy_ids.filter(id => id !== allergy.id);
                  handleMultiSelect('allergy_ids', newIds);
                }}
              >
                {allergy.name}
              </Checkbox>
            ))}
          </Stack>
        </Box>

        {/* Dietary Preferences Selection */}
        <Box borderWidth="1px" borderRadius="lg" p={4}>
          <FormLabel>Dietary Preferences</FormLabel>
          <Stack spacing={2} mt={2}>
            {allDietaryPrefs.map(pref => (
              <Checkbox
                key={pref.id}
                isChecked={formData?.dietary_preference_ids?.includes(pref.id)}
                onChange={(e) => {
                  const newIds = e.target.checked
                    ? [...formData?.dietary_preference_ids, pref.id]
                    : formData?.dietary_preference_ids?.filter(id => id !== pref.id);
                  handleMultiSelect('dietary_preference_ids', newIds);
                }}
              >
                {pref.name}
              </Checkbox>
            ))}
          </Stack>
        </Box>

        {/* Submit Button */}
        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isLoading || isUploading}
          loadingText={isEdit ? "Saving..." : "Creating..."}
        >
          {isEdit ? "Update Meal" : "Create Meal"}
        </Button>
      </Stack>
    </form>
  );
};

export default MealsForm;