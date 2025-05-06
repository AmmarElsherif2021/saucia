import { FormControl, FormLabel, Input, Button, Flex, IconButton } from "@chakra-ui/react";
import { useState } from "react";
import { AddIcon, CloseIcon } from "@chakra-ui/icons";

const PlanForm = ({ onSubmit, onCancel, initialData = {} }) => {
    const [formData, setFormData] = useState({
        title: initialData.title || "",
        period: initialData.period || 0,
        carb: initialData.carb || 0,
        protein: initialData.protein || 0,
        kcal: initialData.kcal || 0,
        members: Array.isArray(initialData.members) ? initialData.members : [],
        avatar: initialData.avatar || "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleMemberChange = (index, value) => {
        const updatedMembers = [...formData.members];
        updatedMembers[index] = value;
        setFormData((prev) => ({ ...prev, members: updatedMembers }));
    };

    const addMember = () => {
        setFormData((prev) => ({ ...prev, members: [...prev.members, ""] }));
    };

    const removeMember = (index) => {
        const updatedMembers = formData.members.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, members: updatedMembers }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const processedData = {
            ...formData,
            members: formData.members.filter((m) => m.trim()), // Remove empty members
        };
        onSubmit(processedData);
    };

    return (
        <form onSubmit={handleSubmit}>
            {[
                { label: "Title", type: "text", name: "title", placeholder: "", required: true },
                { label: "Period (days)", type: "number", name: "period", placeholder: "", required: true },
                { label: "Carb (g)", type: "number", name: "carb", placeholder: "", required: true },
                { label: "Protein (g)", type: "number", name: "protein", placeholder: "", required: true },
                { label: "Calories (kcal)", type: "number", name: "kcal", placeholder: "", required: true },
                { label: "Avatar Link", type: "url", name: "avatar", placeholder: "Enter a valid URL", required: false },
            ].map((input, index) => (
                <FormControl mb={4} key={index}>
                    <FormLabel>{input.label}</FormLabel>
                    <Input
                        type={input.type}
                        name={input.name}
                        value={formData[input.name]}
                        onChange={handleChange}
                        placeholder={input.placeholder}
                        required={input.required}
                    />
                </FormControl>
            ))}

            <FormControl mb={4}>
                <FormLabel>Members</FormLabel>
                {formData.members.map((member, index) => (
                    <Flex key={index} mb={2} align="center">
                        <Input
                            type="text"
                            value={member}
                            onChange={(e) => handleMemberChange(index, e.target.value)}
                            placeholder={`Member ${index + 1}`}
                        />
                        <IconButton
                            ml={2}
                            icon={<CloseIcon />}
                            size="sm"
                            onClick={() => removeMember(index)}
                            aria-label="Remove member"
                        />
                    </Flex>
                ))}
                <Button onClick={addMember} leftIcon={<AddIcon />} mt={2}>
                    Add Member
                </Button>
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