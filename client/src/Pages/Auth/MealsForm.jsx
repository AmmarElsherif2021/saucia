import {
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  Flex,
  Box,
  Switch,
  VStack,
  HStack,
  IconButton,
  Text,
  Divider,
  Badge,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'
import { useState, useEffect } from 'react'
import { useAdminFunctions } from '../../Hooks/useAdminFunctions'

const MealForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const { useGetAllAllergies,useGetAllItems,useGetMealDetails  } = useAdminFunctions();
  const { data: allergies = [] } = useGetAllAllergies();
const { data: allItems = [] } = useGetAllItems();
  const { data: fetchedMeal } = useGetMealDetails(initialData.id);
  
  // Fetch meal details if we're editing
  const [mealDetails, setMealDetails] = useState(null);
  const [selectedItems, setSelectedItems] = useState(initialData.items || []);
  // Add this handler
const handleItemToggle = (itemId) => {
  setSelectedItems(prev => {
    if (prev.includes(itemId)) {
      return prev.filter(id => id !== itemId);
    } else {
      return [...prev, itemId];
    }
  });
};


  useEffect(() => {
    if (fetchedMeal) {
      setMealDetails(fetchedMeal);
      
      // Set initial allergens from fetched data
      const initialAllergens = fetchedMeal.allergies?.map(a => a.id) || [];
      setSelectedAllergens(initialAllergens);
    }
  }, [fetchedMeal]);

  // Updated form structure matching meal schema
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    name_arabic: initialData.name_arabic || '',
    description: initialData.description || '',
    description_arabic: initialData.description_arabic || '',
    section: initialData.section || '',
    section_arabic: initialData.section_arabic || '',
    base_price: initialData.base_price ? Number(initialData.base_price) : 0,
    calories: initialData.calories ? Number(initialData.calories) : 0,
    protein_g: initialData.protein_g ? Number(initialData.protein_g) : 0,
    carbs_g: initialData.carbs_g ? Number(initialData.carbs_g) : 0,
    fat_g: initialData.fat_g ? Number(initialData.fat_g) : 0,
    fiber_g: initialData.fiber_g ? Number(initialData.fiber_g) : 0,
    sugar_g: initialData.sugar_g ? Number(initialData.sugar_g) : 0,
    sodium_mg: initialData.sodium_mg ? Number(initialData.sodium_mg) : 0,
    ingredients: initialData.ingredients || '',
    ingredients_arabic: initialData.ingredients_arabic || '',
    preparation_instructions: initialData.preparation_instructions || '',
    image_url: initialData.image_url || '',
    thumbnail_url: initialData.thumbnail_url || '',
    is_premium: initialData.is_premium ?? false,
    is_vegetarian: initialData.is_vegetarian ?? false,
    is_vegan: initialData.is_vegan ?? false,
    is_gluten_free: initialData.is_gluten_free ?? false,
    is_dairy_free: initialData.is_dairy_free ?? false,
    spice_level: initialData.spice_level ? Number(initialData.spice_level) : 0,
    prep_time_minutes: initialData.prep_time_minutes ? Number(initialData.prep_time_minutes) : 0,
    is_featured: initialData.is_featured ?? false,
    discount_percentage: initialData.discount_percentage ? Number(initialData.discount_percentage) : 0,
    discount_valid_until: initialData.discount_valid_until || '',
    is_available: initialData.is_available ?? true,
    items: initialData.items || [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  
  // Store selected allergens as IDs
  const [selectedAllergens, setSelectedAllergens] = useState([]);

  // Section options
  const sections = [
    { en: 'Juices', ar: 'العصائر' },
    { en: 'Our signature salad', ar: 'اختر من سلطاتنا' },
    { en: 'Soups', ar: 'الشوربات' },
    { en: 'Desserts', ar: 'الحلويات' },
    { en: 'Make your own fruit salad', ar: 'اصنع طبق سلطة الفاكهة الخاص بك' },
    { en: 'make your own salad', ar: 'اصنع طبق السلطة بنفسك' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSectionChange = (e) => {
    const sectionValue = e.target.value;
    const selectedSection = sections.find(sec => sec.en === sectionValue);
    
    setFormData(prev => ({
      ...prev,
      section: sectionValue,
      section_arabic: selectedSection ? selectedSection.ar : ''
    }));
  };

  const handleAllergenToggle = (allergyId) => {
    setSelectedAllergens(prev => {
      if (prev.includes(allergyId)) {
        return prev.filter(id => id !== allergyId);
      } else {
        return [...prev, allergyId];
      }
    });
  };

// Update submission data
const handleSubmit = (e) => {
  e.preventDefault();
  const submissionData = {
    ...formData,
    allergies: selectedAllergens,
    items: selectedItems || []
  };
  onSubmit(submissionData);
};

  // Render selected allergens as tags
  const renderSelectedAllergens = () => {
    return (
      <Wrap spacing={2} mt={2}>
        {selectedAllergens.map(id => {
          const allergy = allergies.find(a => a.id === id);
          if (!allergy) return null;
          
          return (
            <WrapItem key={id}>
              <Tag colorScheme="blue" borderRadius="full">
                <TagLabel>{allergy.name} / {allergy.name_arabic}</TagLabel>
                <TagCloseButton onClick={() => handleAllergenToggle(id)} />
              </Tag>
            </WrapItem>
          );
        })}
      </Wrap>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Basic Information */}
      <FormControl mb={4}>
        <FormLabel>Name (English)</FormLabel>
        <Input 
          type="text" 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Name (Arabic)</FormLabel>
        <Input
          type="text"
          name="name_arabic"
          value={formData.name_arabic}
          onChange={handleChange}
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Description (English)</FormLabel>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Description (Arabic)</FormLabel>
        <Textarea
          name="description_arabic"
          value={formData.description_arabic}
          onChange={handleChange}
          rows={3}
        />
      </FormControl>

      {/* Section */}
      <FormControl mb={4}>
        <FormLabel>Section</FormLabel>
        <Select 
          name="section"
          value={formData.section}
          onChange={handleSectionChange}
          required
        >
          <option value="">Select a section</option>
          {sections.map((section, index) => (
            <option key={index} value={section.en}>
              {section.en}
            </option>
          ))}
        </Select>
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Section (Arabic)</FormLabel>
        <Input
          type="text"
          name="section_arabic"
          value={formData.section_arabic}
          onChange={handleChange}
          readOnly={sections.some(s => s.ar === formData.section_arabic)}
        />
      </FormControl>

      {/* Ingredients */}
      <FormControl mb={4}>
        <FormLabel>Ingredients (English)</FormLabel>
        <Textarea
          name="ingredients"
          value={formData.ingredients}
          onChange={handleChange}
          rows={3}
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Ingredients (Arabic)</FormLabel>
        <Textarea
          name="ingredients_arabic"
          value={formData.ingredients_arabic}
          onChange={handleChange}
          rows={3}
        />
      </FormControl>
      <FormControl mb={4}>
  <FormLabel>Items</FormLabel>
  <Select 
    onChange={(e) => handleItemToggle(e.target.value)}
    placeholder="Select items"
  >
    {allItems.map(item => (
      <option key={item.id} value={item.id}>
        {item.name}
      </option>
    ))}
  </Select>
  
  <Wrap mt={2}>
    {selectedItems.map(id => {
      const item = allItems.find(i => i.id === id);
      return (
        <WrapItem key={id}>
          <Tag colorScheme="blue">
            <TagLabel>{item?.name}</TagLabel>
            <TagCloseButton onClick={() => handleItemToggle(id)} />
          </Tag>
        </WrapItem>
      );
    })}
    </Wrap>
    </FormControl>
      {/* Preparation */}
      <FormControl mb={4}>
        <FormLabel>Preparation Instructions</FormLabel>
        <Textarea
          name="preparation_instructions"
          value={formData.preparation_instructions}
          onChange={handleChange}
          rows={3}
        />
      </FormControl>

      {/* Pricing */}
      <FormControl mb={4}>
        <FormLabel>Base Price</FormLabel>
        <Input
          type="number"
          name="base_price"
          value={formData.base_price}
          onChange={handleChange}
          min={0}
          step={0.01}
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Discount Percentage</FormLabel>
        <Input
          type="number"
          name="discount_percentage"
          value={formData.discount_percentage}
          onChange={handleChange}
          min={0}
          max={100}
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Discount Valid Until</FormLabel>
        <Input
          type="datetime-local"
          name="discount_valid_until"
          value={formData.discount_valid_until}
          onChange={handleChange}
        />
      </FormControl>

      {/* Nutrition */}
      <HStack spacing={4} mb={4}>
        <FormControl>
          <FormLabel>Calories</FormLabel>
          <Input 
            type="number" 
            name="calories" 
            value={formData.calories} 
            onChange={handleChange} 
            min={0}
          />
        </FormControl>
        
        <FormControl>
          <FormLabel>Protein (g)</FormLabel>
          <Input
            type="number"
            name="protein_g"
            value={formData.protein_g}
            onChange={handleChange}
            min={0}
          />
        </FormControl>
      </HStack>
      
      <HStack spacing={4} mb={4}>
        <FormControl>
          <FormLabel>Carbs (g)</FormLabel>
          <Input
            type="number"
            name="carbs_g"
            value={formData.carbs_g}
            onChange={handleChange}
            min={0}
          />
        </FormControl>
        
        <FormControl>
          <FormLabel>Fat (g)</FormLabel>
          <Input
            type="number"
            name="fat_g"
            value={formData.fat_g}
            onChange={handleChange}
            min={0}
          />
        </FormControl>
      </HStack>
      
      <HStack spacing={4} mb={4}>
        <FormControl>
          <FormLabel>Fiber (g)</FormLabel>
          <Input
            type="number"
            name="fiber_g"
            value={formData.fiber_g}
            onChange={handleChange}
            min={0}
          />
        </FormControl>
        
        <FormControl>
          <FormLabel>Sugar (g)</FormLabel>
          <Input
            type="number"
            name="sugar_g"
            value={formData.sugar_g}
            onChange={handleChange}
            min={0}
          />
        </FormControl>
      </HStack>
      
      <FormControl mb={4}>
        <FormLabel>Sodium (mg)</FormLabel>
        <Input
          type="number"
          name="sodium_mg"
          value={formData.sodium_mg}
          onChange={handleChange}
          min={0}
        />
      </FormControl>

      {/* Dietary Flags */}
      <HStack spacing={4} mb={4}>
        <FormControl display="flex" alignItems="center">
          <Switch
            name="is_vegetarian"
            isChecked={formData.is_vegetarian}
            onChange={handleChange}
            colorScheme="green"
          />
          <FormLabel mb="0" ml={2}>Vegetarian</FormLabel>
        </FormControl>
        
        <FormControl display="flex" alignItems="center">
          <Switch
            name="is_vegan"
            isChecked={formData.is_vegan}
            onChange={handleChange}
            colorScheme="green"
          />
          <FormLabel mb="0" ml={2}>Vegan</FormLabel>
        </FormControl>
      </HStack>
      
      <HStack spacing={4} mb={4}>
        <FormControl display="flex" alignItems="center">
          <Switch
            name="is_gluten_free"
            isChecked={formData.is_gluten_free}
            onChange={handleChange}
            colorScheme="green"
          />
          <FormLabel mb="0" ml={2}>Gluten Free</FormLabel>
        </FormControl>
        
        <FormControl display="flex" alignItems="center">
          <Switch
            name="is_dairy_free"
            isChecked={formData.is_dairy_free}
            onChange={handleChange}
            colorScheme="green"
          />
          <FormLabel mb="0" ml={2}>Dairy Free</FormLabel>
        </FormControl>
      </HStack>

      {/* Allergens */}
      <FormControl mb={4}>
        <FormLabel>Allergens</FormLabel>
        <VStack align="stretch" spacing={2}>
          <Text fontSize="sm" color="gray.600">
            Select applicable allergens:
          </Text>
          
          {renderSelectedAllergens()}
          
          <Divider my={2} />
          
          <Flex wrap="wrap">
            {allergies.map(allergy => (
              <Button
                key={allergy.id}
                size="sm"
                m={1}
                variant={selectedAllergens.includes(allergy.id) ? 'solid' : 'outline'}
                colorScheme={selectedAllergens.includes(allergy.id) ? 'blue' : 'gray'}
                onClick={() => handleAllergenToggle(allergy.id)}
              >
                {allergy.name} / {allergy.name_arabic}
              </Button>
            ))}
          </Flex>
        </VStack>
      </FormControl>

      {/* Other Details */}
      <FormControl mb={4}>
        <FormLabel>Spice Level (0-5)</FormLabel>
        <Input
          type="number"
          name="spice_level"
          value={formData.spice_level}
          onChange={handleChange}
          min={0}
          max={5}
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Preparation Time (minutes)</FormLabel>
        <Input
          type="number"
          name="prep_time_minutes"
          value={formData.prep_time_minutes}
          onChange={handleChange}
          min={0}
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Image URL</FormLabel>
        <Input
          type="url"
          name="image_url"
          value={formData.image_url}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Thumbnail URL</FormLabel>
        <Input
          type="url"
          name="thumbnail_url"
          value={formData.thumbnail_url}
          onChange={handleChange}
          placeholder="https://example.com/thumbnail.jpg"
        />
      </FormControl>

      {/* Flags */}
      <HStack spacing={4} mb={4}>
        <FormControl display="flex" alignItems="center">
          <Switch
            name="is_premium"
            isChecked={formData.is_premium}
            onChange={handleChange}
            colorScheme="teal"
          />
          <FormLabel mb="0" ml={2}>Premium</FormLabel>
        </FormControl>
        
        <FormControl display="flex" alignItems="center">
          <Switch
            name="is_featured"
            isChecked={formData.is_featured}
            onChange={handleChange}
            colorScheme="teal"
          />
          <FormLabel mb="0" ml={2}>Featured</FormLabel>
        </FormControl>
        
        <FormControl display="flex" alignItems="center">
          <Switch
            name="is_available"
            isChecked={formData.is_available}
            onChange={handleChange}
            colorScheme="green"
          />
          <FormLabel mb="0" ml={2}>Available</FormLabel>
        </FormControl>
      </HStack>
      
      <FormControl mb={4}>
        <FormLabel>Sort Order</FormLabel>
        <Input
          type="number"
          name="sort_order"
          value={formData.sort_order}
          onChange={handleChange}
          min={0}
        />
      </FormControl>

      <Flex justify="flex-end" gap={2} mt={6}>
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button type="submit" colorScheme="blue">
          Save
        </Button>
      </Flex>
    </form>
  )
}

export default MealForm

//sort_order