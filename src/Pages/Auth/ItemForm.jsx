import { FormControl, FormLabel, Input, Button, Flex } from "@chakra-ui/react"; // Ensure Chakra UI is installed
import { useState } from "react";
// Form Component
const ItemForm = ({ onSubmit, onCancel, initialData = {} }) => {
    const [formData, setFormData] = useState({
        name: initialData.name || "",
        section: initialData.section || "",
        price: initialData.price || 0,
        free_count: initialData.free_count || 0,
        kcal: initialData.kcal || 0,
        protein: initialData.protein || 0,
        image: initialData.image || ""
    });

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormControl mb={4}>
                <FormLabel>Name</FormLabel>
                <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel>Section</FormLabel>
                <Input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    required
                />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel>Price</FormLabel>
                <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel>Free Count</FormLabel>
                <Input
                    type="number"
                    name="free_count"
                    value={formData.free_count}
                    onChange={handleChange}
                />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel>Calories (kcal)</FormLabel>
                <Input
                    type="number"
                    name="kcal"
                    value={formData.kcal}
                    onChange={handleChange}
                />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel>Protein (g)</FormLabel>
                <Input
                    type="number"
                    name="protein"
                    value={formData.protein}
                    onChange={handleChange}
                />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel>Image Link</FormLabel>
                <Input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="Enter a valid URL"
                />
            </FormControl>
            <Flex justify="flex-end" gap={2}>
                <Button onClick={onCancel} variant="outline">
                    Cancel
                </Button>
                <Button type="submit" colorScheme="blue">
                    Save
                </Button>
            </Flex>
        </form>
    );
};

export default ItemForm;

// Usage Example:
// Import the component and use it in your application
/*

const App = () => {
    const handleFormSubmit = (data) => {
        console.log("Form submitted with data:", data);
    };

    const handleCancel = () => {
        console.log("Form canceled");
    };

    return (
        <div>
            <h1>Item Form</h1>
            <ItemForm
                onSubmit={handleFormSubmit}
                onCancel={handleCancel}
                initialData={{
                    name: "Sample Item",
                    section: "Food",
                    price: 10,
                    free_count: 2,
                    kcal: 200,
                    protein: 10,
                }}
            />
        </div>
    );
};

export default App;
*/
