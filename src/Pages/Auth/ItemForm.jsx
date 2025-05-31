import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Flex,
  Box,
  Divider,
  HStack,
  IconButton,
  Text,
  VStack,
  Select,
} from '@chakra-ui/react'
import { AddIcon, DeleteIcon } from '@chakra-ui/icons'
import { useState } from 'react'

const ItemForm = ({ onSubmit, onCancel, initialData = {} }) => {
  //const [isPremium, setIsPremium] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    name_arabic: initialData.name_arabic || '',
    //planId: initialData.planId || '',
    section: initialData.section || '',
    section_arabic: initialData.section_arabic || '',
    addon_price: Number(initialData.addon_price) || 0,
    free_count: Number(initialData.free_count) || 0,
    item_kcal: Number(initialData.item_kcal) || 0,
    item_protein: Number(initialData.item_protein) || 0,
    allergens: Array.isArray(initialData?.allergens) ? initialData.allergens : [],
    image: initialData.image || '',
  })
  // Predefined allergens list based on the document
  const predefinedAllergens = [
    { en: 'Milk and dairy products', ar: 'الحليب ومنتجاته' },
    { en: 'Gluten', ar: 'الجلوتين' },
    { en: 'Nuts and products', ar: 'المكسرات ومنتجاتها' },
    { en: 'Sesame seeds and products', ar: 'بذور السمسم ومنتجاتها' },
    { en: 'Fish and products', ar: 'الأسماك ومنتجاتها' },
    { en: 'Eggs and products', ar: 'البيض ومنتجاته' },
    { en: 'Soy', ar: 'الصويا' },
    { en: 'Crustaceans and products', ar: 'القشريات ومنتجاتها' },
    { en: 'Celery seeds and products', ar: 'بذور الكرفس ومنتجاتها' },
    { en: 'Mustard seeds and products', ar: 'بذور الخردل ومنتجاتها' },
    { en: 'Peanuts', ar: 'فول سوداني' },
  ]
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Filter out empty custom allergens
    const filteredAllergens = formData.allergens.filter(
      (allergen) => allergen.en.trim() !== '' || allergen.ar.trim() !== '',
    )
    onSubmit({ ...formData, allergens: filteredAllergens })
  }
  //Allergies
  const handleAllergenToggle = (allergen) => {
    setFormData((prev) => {
      const existingIndex = prev.allergens.findIndex(
        (a) => a.en === allergen.en && a.ar === allergen.ar,
      )

      if (existingIndex >= 0) {
        // Remove allergen if it exists
        return {
          ...prev,
          allergens: prev.allergens.filter((_, index) => index !== existingIndex),
        }
      } else {
        // Add allergen if it doesn't exist
        return {
          ...prev,
          allergens: [...prev.allergens, allergen],
        }
      }
    })
  }

  const addCustomAllergen = () => {
    const newAllergen = { en: '', ar: '' }
    setFormData((prev) => ({
      ...prev,
      allergens: [...prev.allergens, newAllergen],
    }))
  }

  const updateCustomAllergen = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      allergens: prev.allergens.map((allergen, i) =>
        i === index ? { ...allergen, [field]: value } : allergen,
      ),
    }))
  }

  const removeCustomAllergen = (index) => {
    setFormData((prev) => ({
      ...prev,
      allergens: prev.allergens.filter((_, i) => i !== index),
    }))
  }

  const isAllergenSelected = (allergen) => {
    return formData.allergens.some((a) => a.en === allergen.en && a.ar === allergen.ar)
  }

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

      {
        // <FormControl>
        //   <FormLabel>Switch to premium plan</FormLabel>
        // <Switch isChecked={isPremium} isDisabled={false} onChange={()=>setIsPremium(prev=>!prev)} colorScheme="brand" />
        // </FormControl>
      }
      <FormControl mb={4}>
        <FormLabel>Section</FormLabel>
        <Input
          type="text"
          name="section"
          value={formData.section}
          onChange={handleChange}
          required
        />
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
      {
        // !isPremium ? (
        //   <>
        //   </>
        // ) : (
        //   <FormControl>
        //     <FormLabel> Plan </FormLabel>
        //     <Select name="planId" value={formData.planId} onChange={handleChange}>
        //       <option value="mockPlan1">Mock Plan 1</option>
        //       <option value="mockPlan2">Mock Plan 2</option>
        //       <option value="mockPlan3">Mock Plan 3</option>
        //     </Select>
        //   </FormControl>
        // )
      }

      <FormControl mb={4}>
        <FormLabel>Addon Price</FormLabel>
        <Input
          type="number"
          name="addon_price"
          value={formData.addon_price}
          onChange={handleChange}
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Free Count</FormLabel>
        <Input
          type="number"
          name="free_count"
          value={formData.free_count}
          onChange={handleChange}
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Calories (kcal)</FormLabel>
        <Input type="number" name="item_kcal" value={formData.item_kcal} onChange={handleChange} />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Protein (g)</FormLabel>
        <Input
          type="number"
          name="item_protein"
          value={formData.item_protein}
          onChange={handleChange}
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
                variant={isAllergenSelected(allergen) ? 'solid' : 'outline'}
                colorScheme={isAllergenSelected(allergen) ? 'brand' : 'gray'}
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
            .filter(
              (allergen) =>
                !predefinedAllergens.some((pa) => pa.en === allergen.en && pa.ar === allergen.ar),
            )
            .map((allergen, index) => {
              const actualIndex = formData.allergens.findIndex((a) => a === allergen)
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
        <FormLabel>Image Link</FormLabel>
        <Input
          type="url"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="Enter a valid URL"
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

export default ItemForm
