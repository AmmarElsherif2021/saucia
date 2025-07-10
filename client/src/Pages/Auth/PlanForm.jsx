import { FormControl, FormLabel, Input, Button, Flex, Switch, Textarea } from '@chakra-ui/react'
import { useState } from 'react'

const PlanForm = ({ onSubmit, onCancel, initialData = {} }) => {
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
    is_active: initialData.is_active ?? true
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name.startsWith('title') || name.startsWith('description')
          ? value
          : Math.max(Number(value), 0),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const processedData = {
      ...formData,
    }
    onSubmit(processedData)
  }

  return (
    <form onSubmit={handleSubmit}>
      {[
        { label: 'Title (English)', type: 'text', name: 'title', required: true },
        { label: 'Title (Arabic)', type: 'text', name: 'title_arabic', dir: 'rtl', required: true },
        { label: 'Carbohydrates (g)', type: 'number', name: 'carb', min: 0, required: true },
        { label: 'Protein (g)', type: 'number', name: 'protein', min: 0, required: true },
        { label: 'Calories (kcal)', type: 'number', name: 'kcal', min: 0, required: true },
        {
          label: 'Avatar URL',
          type: 'url',
          name: 'avatar_url',
          placeholder: 'https://example.com/image.jpg',
        },
      ].map((input, index) => (
        <FormControl key={index} mb={4} isRequired={input.required}>
          <FormLabel>{input.label}</FormLabel>
          <Input
            type={input.type}
            name={input.name}
            value={formData[input.name]}
            onChange={handleChange}
            min={input.min}
            placeholder={input.placeholder}
            dir={input.dir}
          />
        </FormControl>
      ))}

      <FormControl mb={4}>
        <FormLabel>Description (English)</FormLabel>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter description"
        />
      </FormControl>

      <FormControl mb={4}>
        <FormLabel>Description (Arabic)</FormLabel>
        <Textarea
          name="description_arabic"
          value={formData.description_arabic}
          onChange={handleChange}
          placeholder="أدخل الوصف"
          dir="rtl"
        />
      </FormControl>

      <FormControl mb={4} isRequired>
        <FormLabel>Price per Meal</FormLabel>
        <Input
          type="number"
          name="price_per_meal"
          value={formData.price_per_meal}
          onChange={handleChange}
          min={0}
          placeholder="Enter price per meal"
        />
      </FormControl>

      <FormControl display="flex" alignItems="center" mb={4}>
        <FormLabel htmlFor="is_active" mb="0">
          Active
        </FormLabel>
        <Switch
          id="is_active"
          name="is_active"
          isChecked={formData.is_active}
          onChange={handleChange}
        />
      </FormControl>

      <Flex justify="flex-end" gap={2} mt={6}>
        <Button onClick={onCancel} variant="outline" width="20%">
          Cancel
        </Button>
        <Button type="submit" colorScheme="brand" width="20%">
          Save Plan
        </Button>
      </Flex>
    </form>
  )
}

export default PlanForm