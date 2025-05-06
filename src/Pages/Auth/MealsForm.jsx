import {
FormControl,
FormLabel,
Input,
Select,
Textarea,
Button,
Flex,
} from "@chakra-ui/react";
import { useState } from "react";
const MealForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    price: initialData.price || 0,
    isPremium: initialData.isPremium || "False",
    plan: initialData.plan || "",
    kcal: initialData.kcal || 0,
    protein: initialData.protein || 0,
    carb: initialData.carb || 0,
    ingredients: initialData.ingredients || "",
    image: initialData.ingredients || ""
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
        <FormLabel>Premium</FormLabel>
        <Select
          name="isPremium"
          value={formData.isPremium}
          onChange={handleChange}
          required
        >
          <option value="False">No</option>
          <option value="True">Yes</option>
        </Select>
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Plan</FormLabel>
        <Input
          type="text"
          name="plan"
          value={formData.plan}
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
        <FormLabel>Carbohydrates (g)</FormLabel>
        <Input
          type="number"
          name="carb"
          value={formData.carb}
          onChange={handleChange}
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Ingredients</FormLabel>
        <Textarea
          name="ingredients"
          value={formData.ingredients}
          onChange={handleChange}
          rows="3"
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

export default MealForm;

// Example usage:
// <MealForm
//   onSubmit={(data) => console.log("Form submitted with data:", data)}
//   onCancel={() => console.log("Form canceled")}
//   initialData={{
//     name: "Chicken Salad",
//     price: 12.99,
//     isPremium: "True",
//     plan: "Keto",
//     kcal: 350,
//     protein: 25,
//     carb: 10,
//     ingredients: "Chicken, lettuce, olive oil",
//   }}
// />
