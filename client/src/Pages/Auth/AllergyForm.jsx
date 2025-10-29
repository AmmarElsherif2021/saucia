import {
  FormControl, FormLabel, Input, Button, Flex, Select,
  Grid, GridItem, Box, Heading, VStack, useBreakpointValue
} from '@chakra-ui/react'
import { useState } from 'react'

const AllergyForm = ({ onSubmit, onCancel, initialData = {}, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    name_arabic: initialData.name_arabic || '',
    severity_level: initialData.severity_level || 2 
  });

  const isMobile = useBreakpointValue({ base: true, md: false });
  const gridTemplate = useBreakpointValue({ 
    base: '1fr', 
    md: '1fr 1fr',
    lg: '1fr 1fr 1fr' 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'severity_level' ? parseInt(value) : value 
    }));
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="md" mb={2} color="gray.700">
            {isEdit ? 'Edit Allergy' : 'Create New Allergy'}
          </Heading>
        </Box>

        <Grid 
          templateColumns={gridTemplate} 
          gap={4}
          width="100%"
        >
          <GridItem colSpan={isMobile ? 1 : 2}>
            <FormControl isRequired>
              <FormLabel fontWeight="medium" color="gray.700">
                Name (English)
              </FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter allergy name in English"
                size="md"
                focusBorderColor="blue.500"
              />
            </FormControl>
          </GridItem>
          
          <GridItem colSpan={isMobile ? 1 : 2}>
            <FormControl isRequired>
              <FormLabel fontWeight="medium" color="gray.700">
                Name (Arabic)
              </FormLabel>
              <Input
                name="name_arabic"
                value={formData.name_arabic}
                onChange={handleChange}
                placeholder="أدخل اسم الحساسية بالعربية"
                size="md"
                focusBorderColor="blue.500"
                dir="rtl"
              />
            </FormControl>
          </GridItem>
          
          <GridItem colSpan={isMobile ? 1 : 1}>
            <FormControl isRequired>
              <FormLabel fontWeight="medium" color="gray.700">
                Severity Level
              </FormLabel>
              <Select 
                name="severity_level" 
                value={formData.severity_level} 
                onChange={handleChange}
                size="md"
                focusBorderColor="blue.500"
              >
                <option value={1}>Low</option>
                <option value={2}>Medium</option>
                <option value={3}>High</option>
              </Select>
            </FormControl>
          </GridItem>
        </Grid>
        
        <Flex 
          justify="flex-end" 
          gap={3} 
          pt={4}
          borderTop="1px solid"
          borderColor="gray.100"
        >
          <Button 
            onClick={onCancel} 
            variant="outline" 
            size="md"
            width={{ base: '100%', sm: 'auto' }}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            colorScheme="blue" 
            size="md"
            width={{ base: '100%', sm: 'auto' }}
          >
            {isEdit ? 'Update Allergy' : 'Create Allergy'}
          </Button>
        </Flex>
      </VStack>
    </Box>
  )
}

export default AllergyForm