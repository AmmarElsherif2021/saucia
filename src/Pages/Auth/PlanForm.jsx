import { FormControl, FormLabel, Input, Button, Flex, IconButton } from '@chakra-ui/react'
import { useState } from 'react'
import { AddIcon, CloseIcon } from '@chakra-ui/icons'

const PlanForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    title_arabic: initialData.title_arabic || '',
    periods: Array.isArray(initialData.periods) ? initialData.periods : [],
    carb: Math.max(Number(initialData.carb) || 0),
    protein: Math.max(Number(initialData.protein) || 0),
    kcal: Math.max(Number(initialData.kcal) || 0),
    members: Array.isArray(initialData.members) ? initialData.members : [],
    avatar: initialData.avatar || '',
    carbMeals: Array.isArray(initialData.carbMeals) ? initialData.carbMeals : [],
    proteinMeals: Array.isArray(initialData.proteinMeals) ? initialData.proteinMeals : [],
    soaps: Array.isArray(initialData.soaps) ? initialData.soaps : [],
    snacks: Array.isArray(initialData.snacks) ? initialData.snacks : [],
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
      periods: formData.periods.filter((p) => p.trim()),
      members: formData.members.filter((m) => m.trim()),
      carbMeals: formData.carbMeals.filter((c) => c.trim()),
      proteinMeals: formData.proteinMeals.filter((p) => p.trim()),
      soaps: formData.soaps.filter((s) => s.trim()),
      snacks: formData.snacks.filter((sn) => sn.trim()),
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
          name: 'avatar',
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

      {/* Periods Section */}
      <FormControl mb={4}>
        <FormLabel>Periods</FormLabel>
        {formData.periods.map((period, index) => (
          <Flex key={index} mb={2} align="center">
            <Input
              type="text"
              value={period}
              onChange={(e) => handleArrayChange('periods', index, e.target.value)}
              placeholder={`Period ${index + 1}`}
            />
            <IconButton
              ml={2}
              icon={<CloseIcon />}
              size="sm"
              onClick={() => removeArrayItem('periods', index)}
              aria-label="Remove period"
            />
          </Flex>
        ))}
        <Button
          onClick={() => addArrayItem('periods')}
          leftIcon={<AddIcon />}
          mt={2}
          variant="outline"
        >
          Add Period
        </Button>
      </FormControl>
      {/* Added Meals section */}
      {[
        { name: 'carbMeals', label: 'Carb Meals' },
        { name: 'proteinMeals', label: 'Protein Meals' },
        { name: 'soaps', label: 'Soaps' },
        { name: 'snacks', label: 'Snacks' },
      ].map(({ name, label }) => (
        <FormControl key={name} mb={4}>
          <FormLabel>{label}</FormLabel>
          {formData[name].map((item, index) => (
            <Flex key={index} mb={2} align="center">
              <Input
                type="text"
                value={item}
                onChange={(e) => handleArrayChange(name, index, e.target.value)}
                placeholder={`${label} ${index + 1}`}
              />
              <IconButton
                ml={2}
                icon={<CloseIcon />}
                size="sm"
                onClick={() => removeArrayItem(name, index)}
                aria-label={`Remove ${label}`}
              />
            </Flex>
          ))}
          <Button
            onClick={() => addArrayItem(name)}
            leftIcon={<AddIcon />}
            mt={2}
            variant="outline"
          >
            Add {label}
          </Button>
        </FormControl>
      ))}
      {/* Members Section */}
      <FormControl mb={4}>
        <FormLabel>Member IDs</FormLabel>
        {formData.members.map((member, index) => (
          <Flex key={index} mb={2} align="center">
            <Input
              type="text"
              value={member}
              onChange={(e) => handleArrayChange('members', index, e.target.value)}
              placeholder={`Member ID ${index + 1}`}
            />
            <IconButton
              ml={2}
              icon={<CloseIcon />}
              size="sm"
              onClick={() => removeArrayItem('members', index)}
              aria-label="Remove member"
            />
          </Flex>
        ))}
        <Button
          onClick={() => addArrayItem('members')}
          leftIcon={<AddIcon />}
          mt={2}
          variant="outline"
        >
          Add Member
        </Button>
      </FormControl>

      <Flex justify="flex-end" gap={2} mt={6}>
        <Button onClick={onCancel} variant="outline" width="20%">
          Cancel
        </Button>
        <Button type="submit" colorScheme="blue" width="20%">
          Save Plan
        </Button>
      </Flex>
    </form>
  )
}

export default PlanForm
