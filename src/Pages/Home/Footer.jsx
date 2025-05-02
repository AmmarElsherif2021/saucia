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
} from '@chakra-ui/react';

import { useI18nContext } from '../../Contexts/I18nContext';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
    const { t } = useTranslation()

    return (
        <Box as="footer" bg="gray.900" color="brand.400" py={10} px={6}>
            <VStack spacing={10} align="stretch">
                <Stack
                    direction={{ base: 'column', md: 'row' }}
                    justify="space-between"
                    align="flex-start"
                    spacing={8}
                >
                    {/* Contact Us Section */}
                    <Box flex="1" textAlign="left">
                        <Heading as="h3" size="md" mb={4} color="brand.400">
                            {t("footer.contactUs")} {/* Translate "Contact Us" */}
                        </Heading>
                        <Text color="brand.400" fontSize="sm" mb={1}>
                            {t("footer.email")}: info@example.com {/* Translate "Email" */}
                        </Text>
                        <Text color="brand.400" fontSize="sm">
                            {t("footer.phone")}: +1 (123) 456-7890 {/* Translate "Phone" */}
                        </Text>
                    </Box>

                    {/* Follow Us Section */}
                    <Box flex="1" textAlign="left">
                        <Heading as="h3" size="md" mb={4} color="brand.400">
                            {t("footer.followUs")} {/* Translate "Follow Us" */}
                        </Heading>
                        <List spacing={2} textAlign="left" fontSize="sm" pl={0}>
                            <ListItem>
                                <Link href="https://facebook.com" isExternal textAlign={"left"} fontSize="sm">
                                    Facebook
                                </Link>
                            </ListItem>
                            <ListItem>
                                <Link href="https://twitter.com" isExternal textAlign={"left"} fontSize="sm">
                                    Twitter
                                </Link>
                            </ListItem>
                            <ListItem>
                                <Link href="https://instagram.com" isExternal textAlign={"left"} fontSize="sm">
                                    Instagram
                                </Link>
                            </ListItem>
                        </List>
                    </Box>

                    {/* Subscribe Section */}
                    <Box flex="1" textAlign="left">
                        <Heading as="h3" size="md" mb={4} color="brand.400">
                            {t("footer.subscribe")} {/* Translate "Subscribe" */}
                        </Heading>
                        <Text fontSize="sm" color="brand.400" mb={4}>
                            {t("footer.getUpdates")} {/* Translate "Get updates and offers:" */}
                        </Text>
                        <HStack as="form" spacing={3}>
                            <Input
                                type="email"
                                placeholder={t("footer.yourEmail")} // Translate "Your email"
                                size="md"
                                bg="brand.900"
                                borderColor="gray.700"
                                _placeholder={{ color: 'gray.500' }}
                                _focus={{ borderColor: 'brand.400' }}
                                required
                            />
                            <Button type="submit" size="md" colorScheme="brand">
                                {t("footer.subscribe")} {/* Translate "Subscribe" */}
                            </Button>
                        </HStack>
                    </Box>
                </Stack>
            </VStack>
            <Box textAlign="center" py={4} mt={10}>
                <Text color="brand.400" fontSize="xs">
                    &copy; {new Date().getFullYear()} {t("brandNames.saucia")}. {t("footer.allRightsReserved")} |{' '}
                    <Link href="/terms">{t("footer.termsOfService")}</Link> |{' '}
                    <Link href="/privacy">{t("footer.privacyPolicy")}</Link> |{' '}
                    <Link href="/faqs">{t("footer.faqs")}</Link>
                </Text>
            </Box>
        </Box>
    );
};