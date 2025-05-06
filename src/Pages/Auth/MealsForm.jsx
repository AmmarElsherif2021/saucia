import {
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  Flex,
  Box,
  Switch,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb
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
    rate: 4.5,
    featured: initialData.featured || false,
    offerRatio: initialData.offerRatio || 1,
    offerLimit: initialData.offerLimit || "",
    description: initialData.description || "",
    ingredients: initialData.ingredients || [],
    image: initialData.image || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIngredientChange = (index, value) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index] = value;
    setFormData((prev) => ({ ...prev, ingredients: updatedIngredients }));
  };

  const addIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, ""],
    }));
  };

  const removeIngredient = (index) => {
    const updatedIngredients = formData.ingredients.filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({ ...prev, ingredients: updatedIngredients }));
  };
   const handleSliderChange = (value) => {
    setFormData((prev) => ({ ...prev, offerRatio: value }));
  };

  const handleSwitchChange = (e) => {
    setFormData((prev) => ({ ...prev, featured: e.target.checked }));
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
        <FormLabel>Description</FormLabel>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Ingredients</FormLabel>
        {formData.ingredients.map((ingredient, index) => (
          <Flex key={index} mb={2} align="center">
            <Input
              type="text"
              value={ingredient}
              onChange={(e) => handleIngredientChange(index, e.target.value)}
              placeholder={`Ingredient ${index + 1}`}
            />
            <Button
              ml={2}
              onClick={() => removeIngredient(index)}
              colorScheme="red"
              size="sm"
            >
              Remove
            </Button>
          </Flex>
        ))}
        <Button onClick={addIngredient} colorScheme="green" size="sm">
          Add Ingredient
        </Button>
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
      <FormControl mb={4}>
        <FormLabel>Featured</FormLabel>
        <Switch
          isChecked={formData.featured}
          onChange={handleSwitchChange}
          colorScheme="teal"
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Offer Ratio</FormLabel>
        <Slider
          defaultValue={formData.offerRatio}
          min={0.1}
          max={1}
          step={0.05}
          onChange={handleSliderChange}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
        <Box mt={2}>Current Ratio: {formData.offerRatio.toFixed(2)}</Box>
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Offer Expiry Date</FormLabel>
        <Input
          type="datetime-local"
          name="offerLimit"
          value={formData.offerLimit}
          onChange={handleChange}
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