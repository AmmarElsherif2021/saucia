import { Box, Heading, Text } from "@chakra-ui/react";

const StylizedBox = ({ colorScheme,children }) => {
  return (
    <Box p="20px" my="20px" borderRadius="30px" bg={`${colorScheme}.300`}>
      {children}
    </Box>
  );
};

export const AboutPage = () => {
  return (
    <div>
      <StylizedBox colorScheme={"brand"}>
        <Heading as="h1" size="lg" mb="4">
          About Us
        </Heading>
        <Text>
          Welcome to our Healthy Salad Store App! We are dedicated to providing
          fresh, nutritious, and delicious salads to help you maintain a healthy
          lifestyle.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
          Pellentesque porta consequat tincidunt. 
          Nunc et felis mi. Maecenas et hendrerit elit, 
          non sagittis dui. Ut non mauris in nibh fringilla accumsan.
           Suspendisse iaculis laoreet varius. Maecenas bibendum, 
           neque volutpat posuere tristique, dui purus semper lorem,
        </Text>
      </StylizedBox>
      <StylizedBox colorScheme={"warning"}>
        <Heading as="h2" size="md" mb="4">
          Our Mission
        </Heading>
        <Text>
          Our mission is to make healthy eating accessible and enjoyable for
          everyone. We believe in the power of wholesome ingredients and
          sustainable practices.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
          Pellentesque porta consequat tincidunt. 
          Nunc et felis mi. Maecenas et hendrerit elit, 
          non sagittis dui. Ut non mauris in nibh fringilla accumsan.
           Suspendisse iaculis laoreet varius. Maecenas bibendum, 
           neque volutpat posuere tristique, dui purus semper lorem, 
        </Text>
      </StylizedBox>
      <StylizedBox colorScheme={"info"}>
        <Heading as="h2" size="md" mb="4">
          Why Choose Us?
        </Heading>
        <Text>
          We offer a wide variety of salads made from the freshest ingredients,
          customizable to your taste and dietary needs. Your health is our
          priority!
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
          Pellentesque porta consequat tincidunt. 
          Nunc et felis mi. Maecenas et hendrerit elit, 
          non sagittis dui. Ut non mauris in nibh fringilla accumsan.
           Suspendisse iaculis laoreet varius. Maecenas bibendum, 
           neque volutpat posuere tristique, dui purus semper lorem,
        </Text>
      </StylizedBox>
    </div>
  );
};
