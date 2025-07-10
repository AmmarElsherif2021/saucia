import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Flex,
  Select,
  Switch,
  Textarea,
} from '@chakra-ui/react'
import { useState } from 'react'

const UserForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    email: initialData.email || '',
    display_name: initialData.display_name || '',
    phone_number: initialData.phone_number || '',
    is_admin: initialData.is_admin || false,
    account_status: initialData.account_status || 'active',
    loyalty_points: initialData.loyalty_points || 0,
    allergies: initialData.allergies || [],
    dietary_preferences: initialData.dietary_preferences || [],
    notes: initialData.notes || '',
  })

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  const handleToggle = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormControl mb={4}>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Display Name</FormLabel>
        <Input
          name="display_name"
          value={formData.display_name}
          onChange={handleChange}
          required
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Phone Number</FormLabel>
        <Input
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
        />
      </FormControl>
      
      <FormControl mb={4} display="flex" alignItems="center">
        <FormLabel mb="0">Admin Status</FormLabel>
        <Switch
          name="is_admin"
          isChecked={formData.is_admin}
          onChange={(e) => handleToggle('is_admin', e.target.checked)}
          colorScheme="brand"
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Account Status</FormLabel>
        <Select
          name="account_status"
          value={formData.account_status}
          onChange={handleChange}
        >
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
        </Select>
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Loyalty Points</FormLabel>
        <Input
          type="number"
          name="loyalty_points"
          value={formData.loyalty_points}
          onChange={handleChange}
          min="0"
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Allergies</FormLabel>
        <Textarea
          placeholder="Enter allergies, separated by commas"
          name="allergies"
          value={formData.allergies.join(', ')}
          onChange={(e) =>
            setFormData(prev => ({
              ...prev,
              allergies: e.target.value
                .split(',')
                .map(a => a.trim())
                .filter(Boolean)
            }))
          }
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Dietary Preferences</FormLabel>
        <Textarea
          placeholder="Enter dietary preferences, separated by commas"
          name="dietary_preferences"
          value={formData.dietary_preferences.join(', ')}
          onChange={(e) =>
            setFormData(prev => ({
              ...prev,
              dietary_preferences: e.target.value
                .split(',')
                .map(d => d.trim())
                .filter(Boolean)
            }))
          }
        />
      </FormControl>
      
      <FormControl mb={4}>
        <FormLabel>Admin Notes</FormLabel>
        <Textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Internal notes about the user"
        />
      </FormControl>
      
      <Flex justify="flex-end" gap={2}>
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button type="submit" colorScheme="brand">
          Save User
        </Button>
      </Flex>
    </form>
  )
}

export default UserForm