import React, { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Textarea,
  VStack,
  Checkbox,
} from '@chakra-ui/react'

const BodyHealthQuestions = ({ setApplicationPhase }) => {
  const [formData, setFormData] = useState({
 
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  return (
    <Box maxW="500px" mx="auto" mt="8" p="6" borderWidth="1px" borderRadius="lg" boxShadow="md">
      <form onSubmit={setApplicationPhase}>
        <VStack spacing="4">
         
        </VStack>
      </form>
    </Box>
  )
}

export default BodyHealthQuestions
