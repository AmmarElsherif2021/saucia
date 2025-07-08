import {
    FormControl,
    FormLabel,
    Input,
    Button,
    Flex,
    Box,
    Select,
    Text,
  } from '@chakra-ui/react'
  import { useState } from 'react'
  
  const SubscriptionForm = ({ onSubmit, onCancel, initialData = {} }) => {
    const [formData, setFormData] = useState({
      userId: initialData.userId || '',
      planId: initialData.planId || '',
      startDate: initialData.startDate || '',
      endDate: initialData.endDate || '',
      status: initialData.status || 'active',
      paymentStatus: initialData.paymentStatus || 'unpaid',
      deliveryDays: initialData.deliveryDays || [],
      deliveryAddress: initialData.deliveryAddress || '',
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
          <FormLabel>User ID</FormLabel>
          <Input
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            required
          />
        </FormControl>
        
        <FormControl mb={4}>
          <FormLabel>Plan ID</FormLabel>
          <Input
            name="planId"
            value={formData.planId}
            onChange={handleChange}
            required
          />
        </FormControl>
        
        <FormControl mb={4}>
          <FormLabel>Start Date</FormLabel>
          <Input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </FormControl>
        
        <FormControl mb={4}>
          <FormLabel>End Date</FormLabel>
          <Input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
          />
        </FormControl>
        
        <FormControl mb={4}>
          <FormLabel>Status</FormLabel>
          <Select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </Select>
        </FormControl>
        
        <FormControl mb={4}>
          <FormLabel>Payment Status</FormLabel>
          <Select
            name="paymentStatus"
            value={formData.paymentStatus}
            onChange={handleChange}
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="refunded">Refunded</option>
          </Select>
        </FormControl>
        
        <FormControl mb={4}>
          <FormLabel>Delivery Days</FormLabel>
          <Input
            placeholder="e.g., Monday, Wednesday, Friday"
            name="deliveryDays"
            value={formData.deliveryDays.join(', ')}
            onChange={(e) => 
              setFormData(prev => ({
                ...prev,
                deliveryDays: e.target.value.split(',').map(d => d.trim())
              }))
            }
          />
        </FormControl>
        
        <FormControl mb={4}>
          <FormLabel>Delivery Address</FormLabel>
          <Input
            name="deliveryAddress"
            value={formData.deliveryAddress}
            onChange={handleChange}
          />
        </FormControl>
        
        <Flex justify="flex-end" gap={2}>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button type="submit" colorScheme="brand">
            Save Subscription
          </Button>
        </Flex>
      </form>
    )
  }
  
  export default SubscriptionForm