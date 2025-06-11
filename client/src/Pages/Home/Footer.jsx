import {
  Box,
  Text,
  Heading,
  Link,
  List,
  ListItem,
  Input,
  Button,
  VStack,
  HStack,
  Stack,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useI18nContext } from '../../Contexts/I18nContext'

export const Footer = () => {
  const { t } = useTranslation()
  const { currentLanguage } = useI18nContext()
  const isArabic = currentLanguage === 'ar'
  const textAlign = isArabic ? 'right' : 'left'
  const direction = isArabic ? 'rtl' : 'ltr'
  const flexDirection = isArabic ? 'row-reverse' : 'row'
  const flexDirectionStack = isArabic ? 'column-reverse' : 'column'

  return (
    <Box as="footer" bg="gray.800" color="brand.400" py={10} px={6} dir={direction}>
      <VStack spacing={10} align="stretch">
        <Stack
          direction={{ base: 'column', md: flexDirection }}
          justify="space-between"
          align="flex-start"
          spacing={8}
        >
          {/* Contact Us Section */}
          <Box flex="1" textAlign={textAlign}>
            <Heading as="h3" size="md" mb={4} color="brand.400">
              {t('footer.contactUs')}
            </Heading>
            <Text color="brand.400" fontSize="sm" mb={1}>
              {t('footer.email')}: info@example.com
            </Text>
            <Text color="brand.400" fontSize="sm">
              {t('footer.phone')}: +1 (123) 456-7890
            </Text>
          </Box>

          {/* Follow Us Section */}
          <Box flex="1" textAlign={textAlign}>
            <Heading as="h3" size="md" mb={4} color="brand.400">
              {t('footer.followUs')}
            </Heading>
            <List spacing={2} fontSize="sm" pl={0}>
              <ListItem>
                <Link href="https://facebook.com" isExternal textAlign={textAlign} fontSize="sm">
                  Facebook
                </Link>
              </ListItem>
              <ListItem>
                <Link href="https://twitter.com" isExternal textAlign={textAlign} fontSize="sm">
                  Twitter
                </Link>
              </ListItem>
              <ListItem>
                <Link href="https://instagram.com" isExternal textAlign={textAlign} fontSize="sm">
                  Instagram
                </Link>
              </ListItem>
            </List>
          </Box>

          {/* Subscribe Section */}
          <Box flex="1" textAlign={textAlign}>
            <Heading as="h3" size="md" mb={4} color="brand.400">
              {t('footer.subscribe')}
            </Heading>
            <Text fontSize="sm" color="brand.400" mb={4}>
              {t('footer.getUpdates')}
            </Text>
            <HStack as="form" spacing={3} direction={flexDirection} alignItems="flex-start">
              <Input
                type="email"
                placeholder={t('footer.yourEmail')}
                size="md"
                bg="gray.800"
                borderColor="gray.700"
                _placeholder={{ color: 'gray.500' }}
                _focus={{ borderColor: 'brand.400' }}
                required
              />
              <Button
                type="submit"
                size="md"
                colorScheme="brand"
                alignSelf={isArabic ? 'flex-end' : 'flex-start'}
              >
                {t('footer.subscribe')}
              </Button>
            </HStack>
          </Box>
        </Stack>
      </VStack>
      <Box textAlign="center" py={4} mt={10}>
        <Text color="brand.400" fontSize="xs">
          &copy; {new Date().getFullYear()} {t('brandNames.saucia')}.{' '}
          {t('footer.allRightsReserved')} | <Link href="/terms">{t('footer.termsOfService')}</Link>{' '}
          | <Link href="/privacy">{t('footer.privacyPolicy')}</Link> |{' '}
          <Link href="/faqs">{t('footer.faqs')}</Link>
        </Text>
      </Box>
    </Box>
  )
}
