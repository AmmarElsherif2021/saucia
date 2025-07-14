import { Box, Heading, Text, Button, VStack, Textarea } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

const SupportPortal = () => {
  const { t } = useTranslation()

  return (
    <Box p={8} maxW="800px" mx="auto">
      <Heading as="h1" size="xl" mb={4} textAlign="center" color={'brand.800'}>
        {t('support.title')}
      </Heading>
      <Text fontSize="lg" mb={6} textAlign="center">
        {t('support.description')}
      </Text>
      <VStack spacing={4} align="center">
        <Textarea
          placeholder={t('support.textareaPlaceholder')}
          size="lg"
          variant={'unstyled'}
          sx={{ borderColor: 'brand.500', padding: 4 }}
        />
        <Button colorScheme="brand" size="lg">
          {t('support.submitButton')}
        </Button>
      </VStack>
    </Box>
  )
}

export default SupportPortal
