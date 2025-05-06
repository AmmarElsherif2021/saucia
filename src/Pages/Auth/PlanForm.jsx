import { FormControl, FormLabel, Input, Button, Flex } from "@chakra-ui/react";
import { useState } from "react";

const PlanForm = ({ onSubmit, onCancel, initialData = {} }) => {
    const [formData, setFormData] = useState({
        title: initialData.title || "",
        period: initialData.period || 0,
        carb: initialData.carb || 0,
        protein: initialData.protein || 0,
        kcal: initialData.kcal || 0,
        members: Array.isArray(initialData.members) 
            ? initialData.members.join(", ") 
            : initialData.members || "",
        avatar: initialData.avatar ||""
    });
        
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const processedData = {
            ...formData,
            members: formData.members
                .split(",")
                .map((m) => m.trim())
                .filter((m) => m),
        };
        onSubmit(processedData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <FormControl mb={4}>
                <FormLabel>Title</FormLabel>
                <Input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel>Period (days)</FormLabel>
                <Input
                    type="number"
                    name="period"
                    value={formData.period}
                    onChange={handleChange}
                    required
                />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel>Carb (g)</FormLabel>
                <Input
                    type="number"
                    name="carb"
                    value={formData.carb}
                    onChange={handleChange}
                    required
                />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel>Protein (g)</FormLabel>
                <Input
                    type="number"
                    name="protein"
                    value={formData.protein}
                    onChange={handleChange}
                    required
                />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel>Calories (kcal)</FormLabel>
                <Input
                    type="number"
                    name="kcal"
                    value={formData.kcal}
                    onChange={handleChange}
                    required
                />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel>Members (comma-separated)</FormLabel>
                <Input
                    type="text"
                    name="members"
                    value={formData.members}
                    onChange={handleChange}
                    placeholder="e.g., user1, user2"
                />
            </FormControl>
            <FormControl mb={4}>
                <FormLabel>Avatar Link</FormLabel>
                <Input
                    type="url"
                    name="avatar"
                    value={formData.avatar}
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

export default PlanForm;