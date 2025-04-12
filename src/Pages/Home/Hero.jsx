import { Box, Heading, Text } from '@chakra-ui/react';
export const Hero= () => {
  return (
    <Box
      bgImage="url('https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0')"
      bgSize="cover"
      bgPosition="center"
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="white"
    >
      <Box textAlign="center">
        <Heading as="h1" size="2xl" mb={4}>
          Welcome to Our Website
        </Heading>
        <Text fontSize="xl">
          Discover amazing content and connect with us.
        </Text>
      </Box>
    </Box>
  );
}