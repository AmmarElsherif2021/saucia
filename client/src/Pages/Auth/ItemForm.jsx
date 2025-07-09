import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Flex,
  Box,
  Divider,
  HStack,
  Text,
  VStack,
  Select,
  Switch,
  Textarea,
  Badge,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useAdminFunctions } from '../../Hooks/useAdminFunctions';

const ItemForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const { useGetAllAllergies } = useAdminFunctions();
  const { data: allergies  } = useGetAllAllergies();
  
  const [formData, setFormData] = useState({
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
    ...initialData
  });
   
  //Debug console
  useEffect(()=>{
    console.log("ItemForm initialData:", initialData);
    console.log("ItemForm formData:", formData);
  })
  const categories = [
    { en: 'protein', ar: 'بروتين' },
    { en: 'nuts', ar: 'مكسرات' },
    { en: 'vegetables', ar: 'خضروات' },
    { en: 'fruits', ar: 'فواكه' },
    { en: 'toppings', ar: 'اضافات' },
    { en: 'dressings', ar: 'الصلصات' },
    { en: 'cheese', ar: 'الأجبان' },
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
    onSubmit(formData); // Submit sanitized data
  };

  const toggleAllergen = (allergyId) => {
    setFormData(prev => {
      const currentIds = [...(prev?.allergy_ids || [])];
      const index = currentIds.indexOf(allergyId);
      
      if (index > -1) {
        currentIds.splice(index, 1);
      } else {
        currentIds.push(allergyId);
      }
      
      return { ...prev, allergy_ids: currentIds };
    });
  };

  // Fixed: Correct rendering function
  const renderSelectedAllergens = () => {
    const allergyIds = formData?.allergy_ids || [];
    
    return (
      <Wrap spacing={2} mt={2}>
        {allergyIds.map(id => {
          const allergy = allergies?.find(a => a.id === id);
          if (!allergy) return null;
          
          return (
            <WrapItem key={id}>
              <Tag colorScheme="blue" borderRadius="full">
                <TagLabel>{allergy.name} / {allergy.name_arabic}</TagLabel>
                <TagCloseButton onClick={() => toggleAllergen(id)} />
              </Tag>
            </WrapItem>
          );
        })}
      </Wrap>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
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
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Description (Arabic)</FormLabel>
        <Textarea
          name="description_arabic"
          value={formData.description_arabic}
          onChange={handleChange}
        />
      </FormControl>

      <FormControl mb={4}>
        <FormLabel>Category</FormLabel>
        <Select 
          name="category"
          value={formData.category}
          onChange={handleCategoryChange}
          required
        >
          <option value="">Select a category</option>
          {categories.map((category, index) => (
            <option key={index} value={category.en}>
              {category.en}
            </option>
          ))}
        </Select>
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Category (Arabic)</FormLabel>
        <Input
          type="text"
          name="category_arabic"
          value={formData.category_arabic}
          onChange={handleChange}
          readOnly={categories.some(c => c.ar === formData.category_arabic)}
        />
      </FormControl>

      <FormControl mb={4}>
        <FormLabel>Price</FormLabel>
        <Input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          min={0}
          step={0.01}
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Max Free Per Meal</FormLabel>
        <Input
          type="number"
          name="max_free_per_meal"
          value={formData.max_free_per_meal}
          onChange={handleChange}
          min={0}
        />
      </FormControl>
      
      <HStack spacing={4} mb={4}>
        <FormControl>
          <FormLabel>Calories (kcal)</FormLabel>
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
              variant={(formData?.allergy_ids || []).includes(allergy.id) 
                ? 'solid' 
                : 'outline'}
              colorScheme={(formData?.allergy_ids || []).includes(allergy.id) 
                ? 'blue' 
                : 'gray'}
              onClick={() => toggleAllergen(allergy.id)}
            >
              {allergy.name} / {allergy.name_arabic}
            </Button>
          ))}
          </Flex>
        </VStack>
      </FormControl>

      <FormControl mb={4} display="flex" alignItems="center">
        <FormLabel mb="0">Available</FormLabel>
        <Switch
          name="is_available"
          isChecked={formData.is_available}
          onChange={(e) => 
            setFormData(prev => ({ ...prev, is_available: e.target.checked }))
          }
          colorScheme="blue"
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

      <Flex justify="flex-end" gap={2} mt={6}>
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button type="submit" colorScheme="blue">
          Save
        </Button>
      </Flex>
    </form>
  );
}

export default ItemForm;