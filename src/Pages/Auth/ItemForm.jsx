import { FormControl, FormLabel, Input, Button, Flex } from "@chakra-ui/react";
import { useState } from "react";

const ItemForm = ({ onSubmit, onCancel, initialData = {} }) => {
    const [formData, setFormData] = useState({
        name: initialData.name || "",
        name_arabic: initialData.name_arabic || "",
        section: initialData.section || "",
        section_arabic: initialData.section_arabic || "",
        addon_price: initialData.addon_price || 0,
        free_count: initialData.free_count || 0,
        item_kcal: initialData.item_kcal || 0,
        item_protein: initialData.item_protein || 0,
        image: initialData.image || ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

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
                <FormLabel>Name (Arabic)</FormLabel>
                <Input
                    type="text"
                    name="name_arabic"
                    value={formData.name_arabic}
                    onChange={handleChange}
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
                <FormLabel>Section (Arabic)</FormLabel>
                <Input
                    type="text"
                    name="section_arabic"
                    value={formData.section_arabic}
                    onChange={handleChange}
                />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel>Addon Price</FormLabel>
                <Input
                    type="number"
                    name="addon_price"
                    value={formData.addon_price}
                    onChange={handleChange}
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
                    name="item_kcal"
                    value={formData.item_kcal}
                    onChange={handleChange}
                />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel>Protein (g)</FormLabel>
                <Input
                    type="number"
                    name="item_protein"
                    value={formData.item_protein}
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
