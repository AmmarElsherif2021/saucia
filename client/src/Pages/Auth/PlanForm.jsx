import { FormControl, FormLabel, Input, Button, Flex, IconButton } from '@chakra-ui/react'
import { useState } from 'react'
import { AddIcon, CloseIcon } from '@chakra-ui/icons'

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
    //soaps: Array.isArray(initialData.soaps) ? initialData.soaps : [],
    //snacks: Array.isArray(initialData.snacks) ? initialData.snacks : [],
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name.startsWith('title') ? value : Math.max(Number(value), 0),
    }))
  }

  const handleArrayChange = (arrayName, index, value) => {
    const updatedArray = [...formData[arrayName]]
    updatedArray[index] = value
    setFormData((prev) => ({ ...prev, [arrayName]: updatedArray }))
  }

  const addArrayItem = (arrayName) => {
    setFormData((prev) => ({ ...prev, [arrayName]: [...prev[arrayName], ''] }))
  }

  const removeArrayItem = (arrayName, index) => {
    const updatedArray = formData[arrayName].filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, [arrayName]: updatedArray }))
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
        { label: 'Title (Arabic', type: 'text', name: 'title_arabic', dir: 'rtl', required: true },
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
 