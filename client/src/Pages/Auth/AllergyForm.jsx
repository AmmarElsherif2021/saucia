import {
  FormControl, FormLabel, Input, Button, Flex, Select
} from '@chakra-ui/react'
import { useState } from 'react'

const AllergyForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    name_arabic: initialData.name_arabic || '',
    severity_level: initialData.severity_level || 'medium'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormControl mb={4}>
        <FormLabel>Name (English)</FormLabel>
        <Input
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Name (Arabic)</FormLabel>
        <Input
          name="name_arabic"
          value={formData.name_arabic}
          onChange={handleChange}
          required
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Severity Level</FormLabel>
        <Select
          name="severity_level"
          value={formData.severity_level}
          onChange={handleChange}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
      </FormControl>
      
      <Flex justify="flex-end" gap={2}>
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button type="submit" colorScheme="brand">
          Save Allergy
        </Button>
      </Flex>
    </form>
  )
}

export default AllergyForm