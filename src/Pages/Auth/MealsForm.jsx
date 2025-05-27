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
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  VStack,
  HStack,
  IconButton,
  Text,
  Divider,
} from '@chakra-ui/react'
import { useState } from 'react'
import { AddIcon, DeleteIcon } from '@chakra-ui/icons'

const MealForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    name_arabic: initialData?.name_arabic || '',
    section: initialData?.section || '',
    section_arabic: initialData?.section_arabic || '',
    price: Number(initialData?.price) || 0,
    kcal: Number(initialData?.kcal) || 0,
    protein: Number(initialData?.protein) || 0,
    carb: Number(initialData?.carb) || 0,
    policy: initialData?.policy || '',
    ingredients: initialData?.ingredients || '',
    ingredients_arabic: initialData?.ingredients_arabic || '',
    items: initialData?.items || [],
    image: initialData?.image || '',
    isPremium: Boolean(initialData?.isPremium) || false,
    plan: initialData?.plan || '',
    rate: 4.5,
    featured: Boolean(initialData?.featured) || false,
    offerRatio: Number(initialData?.offerRatio) || 1,
    offerLimit: initialData?.offerLimit || '',
    description: initialData?.description || '',
    allergens: Array.isArray(initialData?.allergens) ? initialData.allergens : [],
  })

  // Predefined allergens list based on the document
  const predefinedAllergens = [
    { en: "Milk and dairy products", ar: "الحليب ومنتجاته" },
    { en: "Gluten", ar: "الجلوتين" },
    { en: "Nuts and products", ar: "المكسرات ومنتجاتها" },
    { en: "Sesame seeds and products", ar: "بذور السمسم ومنتجاتها" },
    { en: "Fish and products", ar: "الأسماك ومنتجاتها" },
    { en: "Eggs and products", ar: "البيض ومنتجاته" },
    { en: "Soy", ar: "الصويا" },
    { en: "Crustaceans and products", ar: "القشريات ومنتجاتها" },
    { en: "Celery seeds and products", ar: "بذور الكرفس ومنتجاتها" },
    { en: "Mustard seeds and products", ar: "بذور الخردل ومنتجاتها" },
    { en: "Peanuts", ar: "فول سوداني" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSliderChange = (value) => {
    setFormData((prev) => ({ ...prev, offerRatio: value }))
  }

  const handleSwitchChange = (e) => {
    setFormData((prev) => ({ ...prev, featured: e.target.checked }))
  }

  const handleAllergenToggle = (allergen) => {
    setFormData((prev) => {
      const existingIndex = prev.allergens.findIndex(
        (a) => a.en === allergen.en && a.ar === allergen.ar
      )
      
      if (existingIndex >= 0) {
        // Remove allergen if it exists
        return {
          ...prev,
          allergens: prev.allergens.filter((_, index) => index !== existingIndex)
        }
      } else {
        // Add allergen if it doesn't exist
        return {
          ...prev,
          allergens: [...prev.allergens, allergen]
        }
      }
    })
  }

  const addCustomAllergen = () => {
    const newAllergen = { en: '', ar: '' }
    setFormData((prev) => ({
      ...prev,
      allergens: [...prev.allergens, newAllergen]
    }))
  }

  const updateCustomAllergen = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      allergens: prev.allergens.map((allergen, i) => 
        i === index ? { ...allergen, [field]: value } : allergen
      )
    }))
  }

  const removeCustomAllergen = (index) => {
    setFormData((prev) => ({
      ...prev,
      allergens: prev.allergens.filter((_, i) => i !== index)
    }))
  }

  const isAllergenSelected = (allergen) => {
    return formData.allergens.some(
      (a) => a.en === allergen.en && a.ar === allergen.ar
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Filter out empty custom allergens
    const filteredAllergens = formData.allergens.filter(
      (allergen) => allergen.en.trim() !== '' || allergen.ar.trim() !== ''
    )
    onSubmit({ ...formData, allergens: filteredAllergens })
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl mb={4}>
        <FormLabel>Name</FormLabel>
        <Input type="text" name="name" value={formData.name} onChange={handleChange} required />
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
        <FormLabel>Section</FormLabel>
        <Input type="text" name="section" value={formData.section} onChange={handleChange} />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Section (Arabic)</FormLabel>
        <Input
          type="text"
          name="section_arabic"
          value={formData.section_arabic}
          onChange={handleChange}
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Policy</FormLabel>
        <Textarea name="policy" value={formData.policy} onChange={handleChange} rows="3" />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Ingredients</FormLabel>
        <Textarea
          name="ingredients"
          value={formData?.ingredients}
          onChange={handleChange}
          rows="3"
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Ingredients (Arabic)</FormLabel>
        <Textarea
          name="ingredients_arabic"
          value={formData?.ingredients_arabic}
          onChange={handleChange}
          rows="3"
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Items</FormLabel>
        <Textarea
          name="items"
          value={formData.items.join(', ')}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              items: e.target.value.split(',').map((item) => item.trim()),
            }))
          }
          placeholder="Enter items separated by commas"
        />
      </FormControl>

      {/* Allergens Section */}
      <FormControl mb={4}>
        <FormLabel>Allergens</FormLabel>
        <VStack align="stretch" spacing={3}>
          <Text fontSize="sm" color="gray.600">
            Select from common allergens:
          </Text>
          <Box>
            {predefinedAllergens.map((allergen, index) => (
              <Button
                key={index}
                size="sm"
                variant={isAllergenSelected(allergen) ? "solid" : "outline"}
                colorScheme={isAllergenSelected(allergen) ? "brand" : "gray"}
                onClick={() => handleAllergenToggle(allergen)}
                m={1}
              >
                {allergen.en} / {allergen.ar}
              </Button>
            ))}
          </Box>
          
          <Divider />
          
          <HStack justify="space-between" align="center">
            <Text fontSize="sm" color="gray.600">
              Custom allergens:
            </Text>
            <IconButton
              icon={<AddIcon />}
              size="sm"
              onClick={addCustomAllergen}
              colorScheme="green"
              variant="outline"
            />
          </HStack>
          
          {formData.allergens
            .filter(allergen => 
              !predefinedAllergens.some(pa => pa.en === allergen.en && pa.ar === allergen.ar)
            )
            .map((allergen, index) => {
              const actualIndex = formData.allergens.findIndex(a => a === allergen)
              return (
                <HStack key={actualIndex} spacing={2}>
                  <Input
                    placeholder="English name"
                    value={allergen.en}
                    onChange={(e) => updateCustomAllergen(actualIndex, 'en', e.target.value)}
                    size="sm"
                  />
                  <Input
                    placeholder="Arabic name"
                    value={allergen.ar}
                    onChange={(e) => updateCustomAllergen(actualIndex, 'ar', e.target.value)}
                    size="sm"
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    size="sm"
                    onClick={() => removeCustomAllergen(actualIndex)}
                    colorScheme="red"
                    variant="outline"
                  />
                </HStack>
              )
            })}
        </VStack>
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Price</FormLabel>
        <Input type="number" name="price" value={formData.price} onChange={handleChange} required />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Premium</FormLabel>
        <Select name="isPremium" value={formData.isPremium} onChange={handleChange} required>
          <option value={false}>No</option>
          <option value={true}>Yes</option>
        </Select>
      </FormControl>
      
      {formData.isPremium ? (
        <FormControl mb={4}>
          <FormLabel>Plan</FormLabel>
          <Input type="text" name="plan" value={formData.plan} onChange={handleChange} />
        </FormControl>
      ) : (
        <></>
      )}
      
      <FormControl mb={4}>
        <FormLabel>Calories (kcal)</FormLabel>
        <Input type="number" name="kcal" value={formData.kcal} onChange={handleChange} />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Protein (g)</FormLabel>
        <Input type="number" name="protein" value={formData.protein} onChange={handleChange} />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Carbohydrates (g)</FormLabel>
        <Input type="number" name="carb" value={formData.carb} onChange={handleChange} />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Description</FormLabel>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Image Link</FormLabel>
        <Input
          type="url"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="Enter a valid URL"
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Featured</FormLabel>
        <Switch isChecked={formData.featured} onChange={handleSwitchChange} colorScheme="teal" />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Offer Ratio</FormLabel>
        <Slider
          defaultValue={formData.offerRatio}
          min={0.1}
          max={1}
          step={0.05}
          onChange={handleSliderChange}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
        <Box mt={2}>Current Ratio: {formData.offerRatio.toFixed(2)}</Box>
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Offer Expiry Date</FormLabel>
        <Input
          type="datetime-local"
          name="offerLimit"
          value={formData.offerLimit}
          onChange={handleChange}
        />
      </FormControl>
      
      <Flex justify="flex-end" gap={2}>
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button type="submit" colorScheme="brand">
          Save
        </Button>
      </Flex>
    </form>
  )
}

export default MealForm