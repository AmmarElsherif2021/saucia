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

const BodyHealthQuestions = ({setApplicationPhase}) => {
const [formData, setFormData] = useState({
    height: "",
    weight: "",
    exercise: "",
    target: "",
});

const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
};



return (
    <Box maxW="500px" mx="auto" mt="8" p="6" borderWidth="1px" borderRadius="lg" boxShadow="md">
        <form onSubmit={setApplicationPhase}>
            <VStack spacing="4">
           

                <FormControl isRequired>
                    <FormLabel>Height (in cm)</FormLabel>
                    <Input
                        type="number"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        placeholder="Enter your height"
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Weight (in kg)</FormLabel>
                    <Input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        placeholder="Enter your weight"
                    />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>I want to</FormLabel>
                    <Input
                        type="string"
                        name="target"
                        value={formData.target}
                        onChange={handleChange}
                        placeholder="eg: gain weight, lose weight, maintain weight"
                    />
                </FormControl>
              

                <FormControl isRequired>
                    <FormLabel>Do you exercise regularly?</FormLabel>
                    <RadioGroup
                        name="exercise"
                        onChange={(value) => setFormData({ ...formData, exercise: value })}
                        value={formData.exercise}
                    >
                        <Stack direction="row">
                            <Radio value="yes">Yes</Radio>
                            <Radio value="no">No</Radio>
                        </Stack>
                    </RadioGroup>
                </FormControl>

                <Button type="submit" colorScheme="brand" width="full" onClick={setApplicationPhase}>
                    Submit
                </Button>
            </VStack>
        </form>
    </Box>
);
};

export default BodyHealthQuestions;