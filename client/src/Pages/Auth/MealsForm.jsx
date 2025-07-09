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
  useToast
} from '@chakra-ui/react';

const MealsForm = ({ initialData, onSubmit, isLoading, isEdit }) => {
  const [formData, setFormData] = useState(() => {
    const defaultData = {
      name: '',
      name_arabic: '',
      section: '',
      section_arabic: '',
      base_price: 0,    // changed from 'price'
      calories: 0,      // changed from 'kcal'
      protein_g: 0,     // changed from 'protein'
      carbs_g: 0,       // changed from 'carb'
      ingredients: '',
      ingredients_arabic: '',
      image_url: '',     // changed from 'image'
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
      } catch (error) {
        toast({
          title: 'Failed to fetch data',
          description: error.message,
          status: 'error'
        });
      }
    };
    
    fetchData();
  }, []);

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
      // Ensure items array exists
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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Transform items array to required format
    const formattedData = {
      ...formData,
      items: formData.items.map(item => ({
        id: item.id,
        is_included: item.is_included || false,
        max_quantity: item.max_quantity || 0
      }))
    };
    
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={4}>
        {/* Basic Fields */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <FormControl>
            <FormLabel>Name (English)</FormLabel>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </FormControl>
          
          <FormControl>
            <FormLabel>Name (Arabic)</FormLabel>
            <Input
              name="name_arabic"
              value={formData.name_arabic}
              onChange={handleChange}
              required
            />
          </FormControl>
        </SimpleGrid>

        {/* Nutritional Info - UPDATED FIELDS */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <FormControl>
            <FormLabel>Base Price (SAR)</FormLabel>
            <NumberInput 
              value={formData.base_price} 
              onChange={(v) => handleNumberChange('base_price', v)}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
          
          <FormControl>
            <FormLabel>Calories (kcal)</FormLabel>
            <NumberInput 
              value={formData.calories} 
              onChange={(v) => handleNumberChange('calories', v)}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
          
          <FormControl>
            <FormLabel>Protein (g)</FormLabel>
            <NumberInput 
              value={formData.protein_g} 
              onChange={(v) => handleNumberChange('protein_g', v)}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>

          {/* Add Carbs field if needed */}
          <FormControl>
            <FormLabel>Carbs (g)</FormLabel>
            <NumberInput 
              value={formData.carbs_g} 
              onChange={(v) => handleNumberChange('carbs_g', v)}
            >
              <NumberInputField />
            </NumberInput>
          </FormControl>
        </SimpleGrid>

        {/* Image URL - UPDATED FIELD */}
        <FormControl>
          <FormLabel>Image URL</FormLabel>
          <Input
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
          />
        </FormControl>
        {/* Items Selection */}
        <Box borderWidth="1px" borderRadius="lg" p={4}>
          <FormLabel>Items in Meal</FormLabel>
          <Stack spacing={3} mt={2}>
            {allItems.map(item => (
              <Box key={item.id} p={2} borderWidth="1px" borderRadius="md">
                <Checkbox
                  isChecked={formData?.items?.some(i => i.id === item.id)}
                  onChange={(e) => handleItemChange(item.id, 'is_included', e.target.checked)}
                >
                  {item.name} ({item.category})
                </Checkbox>
                
                {formData?.items?.some(i => i.id === item.id) && (
                  <FormControl mt={2} ml={6}>
                    <FormLabel fontSize="sm">Max Quantity</FormLabel>
                    <NumberInput
                      value={formData?.items?.find(i => i.id === item.id)?.max_quantity || 0}
                      onChange={(v) => handleItemChange(item.id, 'max_quantity', v)}
                      min={0}
                    >
                      <NumberInputField />
                    </NumberInput>
                  </FormControl>
                )}
              </Box>
            ))}
          </Stack>
        </Box>

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
          isLoading={isLoading}
          loadingText={isEdit ? "Updating..." : "Creating..."}
        >
          {isEdit ? "Update Meal" : "Create Meal"}
        </Button>
      </Stack>
    </form>
  );
};

export default MealsForm;