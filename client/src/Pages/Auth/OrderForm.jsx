import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Flex,
  Box,
  Select,
  Text,
  VStack,
  Switch,
  } from '@chakra-ui/react'
  import { useState } from 'react'
  
  const OrderForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    userId: initialData.userId || '',
    planId: initialData.planId || '',
    meals: initialData.meals || [],
    total_amount: initialData.total_amount || 0,
    status: initialData.status || 'pending',
    payment_status: initialData.payment_status || 'unpaid',
    deliveryDate: initialData.deliveryDate || '',
    deliveryAddress: initialData.deliveryAddress || '',
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
      />
    </FormControl>
    
    <FormControl mb={4}>
      <FormLabel>Total Amount ($)</FormLabel>
      <Input
      type="number"
      name="total_amount"
      value={formData.total_amount}
      onChange={handleChange}
      min="0"
      step="0.01"
      />
    </FormControl>
    
    <FormControl mb={4}>
      <FormLabel>Order Status</FormLabel>
      <Select
      name="status"
      value={formData.status}
      onChange={handleChange}
      >
      <option value="pending">Pending</option>
      <option value="confirmed">Confirmed</option>
      <option value="preparing">Preparing</option>
      <option value="ready">Ready for Pickup</option>
      <option value="in-transit">In Transit</option>
      <option value="delivered">Delivered</option>
      <option value="cancelled">Cancelled</option>
      </Select>
    </FormControl>
    
    <FormControl mb={4}>
      <FormLabel>Payment Status</FormLabel>
      <Select
      name="payment_status"
      value={formData.payment_status}
      onChange={handleChange}
      >
      <option value="unpaid">Unpaid</option>
      <option value="paid">Paid</option>
      <option value="refunded">Refunded</option>
      </Select>
    </FormControl>
    
    <FormControl mb={4}>
      <FormLabel>Delivery Date</FormLabel>
      <Input
      type="datetime-local"
      name="deliveryDate"
      value={formData.deliveryDate}
      onChange={handleChange}
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
      Save Order
      </Button>
    </Flex>
    </form>
  )
  }
  
  export default OrderForm