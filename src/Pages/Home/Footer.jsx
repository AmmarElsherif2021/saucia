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
    Divider,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Stack,
} from '@chakra-ui/react';

export const Footer = () => {
    return (
        <Box as="footer" bg="gray.900" color="brand.400" py={10} px={6}>
            <VStack spacing={10} align="stretch">
                <Stack
                    direction={{ base: 'column', md: 'row' }}
                    justify="space-between"
                    align="flex-start"
                    spacing={8}
                    
                >
                    <Box flex="1" textAlign="left">
                        <Heading as="h3" size="md" mb={4} color="brand.400">
                            Contact Us
                        </Heading>
                        <Text color="brand.400" fontSize="sm" mb={1}>Email: info@example.com</Text>
                        <Text color="brand.400" fontSize="sm">Phone: +1 (123) 456-7890</Text>
                    </Box>
                    <Box flex="1" textAlign="left" >
                        <Heading as="h3" size="md" mb={4} color="brand.400">
                            Follow Us
                        </Heading>
                        <List spacing={2} textAlign="left" fontSize="sm" pl={0}>
                            <ListItem>
                                <Link href="https://facebook.com" isExternal textAlign={"left"} fontSize="sm" >
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
                    <Box flex="1" textAlign="left">
                        <Heading as="h3" size="md" mb={4} color="brand.400">
                            Subscribe
                        </Heading>
                        <Text fontSize="sm" color="brand.400" mb={4}>
                            Get updates and offers:
                        </Text>
                        <HStack as="form" spacing={3}>
                            <Input
                                type="email"
                                placeholder="Your email"
                                size="md"
                                bg="gray.800"
                                borderColor="gray.700"
                                _placeholder={{ color: 'gray.500' }}
                                _focus={{ borderColor: 'brand.400' }}
                                required
                            />
                            <Button type="submit" size="md" colorScheme="teal">
                                Subscribe
                            </Button>
                        </HStack>
                    </Box>
                </Stack>
            </VStack>
            <Box textAlign="center" py={4} mt={10}>
                    <Text color="brand.400" fontSize="xs">
                        
                        &copy; {new Date().getFullYear()} Saucia. All rights reserved. |{' '}
                        <Link  href="/terms" >
                            Terms of Service
                        </Link>{' '}
                        |{' '}
                        <Link href="/privacy" >
                            Privacy Policy
                        </Link>
                        |{' '}
                        <Link href="/faqs">
                            FAQs
                        </Link>
                    </Text>
                </Box>
        </Box>
    );
};
