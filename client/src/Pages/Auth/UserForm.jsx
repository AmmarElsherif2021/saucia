import {
    FormControl,
    FormLabel,
    Input,
    Button,
    Flex,
    Box,
    Select,
    Switch,
    Textarea,
  } from '@chakra-ui/react'
  import { useState } from 'react'
  
  const UserForm = ({ onSubmit, onCancel, initialData = {} }) => {
    const [formData, setFormData] = useState({
      display_name: initialData.display_name || '',
      phone_number: initialData.phone_number || '',
      is_admin: initialData.is_admin || false,
      account_status: initialData.account_status || 'active',
      loyalty_points: initialData.loyalty_points || 0,
      notes: initialData.notes || '',
    })
  
    const handleChange = (e) => {
      const { name, value } = e.target
      setFormData(prev => ({ ...prev, [name]: value }))
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
            name="isAdmin"
            isChecked={formData.isAdmin}
            onChange={(e) => handleToggle('isAdmin', e.target.checked)}
            colorScheme="brand"
          />
        </FormControl>
        
        <FormControl mb={4}>
          <FormLabel>Account Status</FormLabel>
          <Select
            name="accountStatus"
            value={formData.accountStatus}
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
            name="loyaltyPoints"
            value={formData.loyaltyPoints}
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
                allergies: e.target.value.split(',').map(a => a.trim())
              }))
            }
          />
        </FormControl>
        
        <FormControl mb={4}>
          <FormLabel>Dietary Preferences</FormLabel>
          <Textarea
            placeholder="Enter dietary preferences, separated by commas"
            name="dietaryPreferences"
            value={formData.dietaryPreferences.join(', ')}
            onChange={(e) => 
              setFormData(prev => ({
                ...prev,
                dietaryPreferences: e.target.value.split(',').map(d => d.trim())
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