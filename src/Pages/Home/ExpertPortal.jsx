import { Box, Heading, Text, Button, VStack, Textarea } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const ExpertPortal = () => {
    const { t } = useTranslation();

    return (
        <Box p={8} maxW="800px" mx="auto">
            <Heading as="h1" size="xl" mb={4} textAlign="center">
                {t("expertPortal.title")}
            </Heading>
            <Text fontSize="lg" mb={6} textAlign="center">
                {t("expertPortal.description")}
            </Text>
            <VStack spacing={4} align="center">
                <Textarea
                    placeholder={t("expertPortal.textareaPlaceholder")}
                    size="lg"
                />
                <Button colorScheme="brand" size="lg">
                    {t("expertPortal.submitButton")}
                </Button>
            </VStack>
        </Box>
    );
};

export default ExpertPortal;