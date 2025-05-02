import React, { useState } from "react";
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
} from "@chakra-ui/react";

const CommonQuestions = ({setApplicationPhase}) => {
const [formData, setFormData] = useState({
    age: "",
    height: "",
    weight: "",
    gender: "",
    exercise: "",
    dietaryPreferences: "",
    allergies: "",
});

const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
};

const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
};

return (
    <Box maxW="500px" mx="auto" mt="8" p="6" borderWidth="1px" borderRadius="lg" boxShadow="md">
        <form onSubmit={handleSubmit}>
            <VStack spacing="4">
                <FormControl isRequired>
                    <FormLabel>Age</FormLabel>
                    <Input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Enter your age"
                    />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>Gender</FormLabel>
                    <RadioGroup
                        name="gender"
                        onChange={(value) => setFormData({ ...formData, gender: value })}
                        value={formData.gender}
                    >
                        <Stack direction="row">
                            <Radio value="male">Male</Radio>
                            <Radio value="female">Female</Radio>
                        </Stack>
                    </RadioGroup>
                </FormControl>


                <FormControl>
                    <FormLabel>Dietary Preferences</FormLabel>
                    <Textarea
                        name="dietaryPreferences"
                        value={formData.dietaryPreferences}
                        onChange={handleChange}
                        placeholder="E.g., vegetarian, vegan, keto, etc."
                    />
                </FormControl>

                <FormControl>
                    <FormLabel>Allergies</FormLabel>
                    <Textarea
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleChange}
                        placeholder="List any food allergies"
                    />
                </FormControl>

            <Button type={"button"} colorScheme="brand" width="full" onClick={setApplicationPhase}>
                    next
                </Button>
            </VStack>
        </form>
    </Box>
);
};

export default CommonQuestions;