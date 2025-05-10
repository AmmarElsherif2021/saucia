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
    name: initialData?.name || "",
    name_arabic: initialData?.name_arabic || "",
    section: initialData?.section || "",
    section_arabic: initialData?.section_arabic || "",
    price: initialData?.price || 0,
    kcal: initialData?.kcal || 0,
    protein: initialData?.protein || 0,
    carb: initialData?.carb || 0,
    policy: initialData?.policy || "",
    ingredients: initialData?.ingredients || "",
    ingredients_arabic: initialData?.ingredients_arabic || "",
    items: initialData?.items || [],
    image: initialData?.image || "",
    isPremium: initialData?.isPremium || false,
    plan: initialData?.plan || "",
    rate: 4.5,
    featured: initialData?.featured || false,
    offerRatio: initialData?.offerRatio || 1,
    offerLimit: initialData?.offerLimit || "",
    description: initialData?.description || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        <FormLabel>Policy</FormLabel>
        <Textarea
          name="policy"
          value={formData.policy}
          onChange={handleChange}
          rows="3"
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Ingredients</FormLabel>
        <Textarea
          name="ingredients"
          value={formData?.ingredients}
          onChange={handleChange}
          rows="3"
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Ingredients (Arabic)</FormLabel>
        <Textarea
          name="ingredients_arabic"
          value={formData?.ingredients_arabic}
          onChange={handleChange}
          rows="3"
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Items</FormLabel>
        <Textarea
          name="items"
          value={formData.items.join(", ")}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              items: e.target.value.split(",").map((item) => item.trim()),
            }))
          }
          placeholder="Enter items separated by commas"
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
          <option value={false}>No</option>
          <option value={true}>Yes</option>
        </Select>
      </FormControl>
      {
        formData.isPremium ? 
         <FormControl mb={4}>
        <FormLabel>Plan</FormLabel>
        <Input
          type="text"
          name="plan"
          value={formData.plan}
          onChange={handleChange}
        />
      </FormControl>
      :
      <></>
      }
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
        <Textarea
          name="ingredients"
          value={formData.ingredients}
          onChange={handleChange}
          rows="3"
          placeholder="Enter ingredients as a comma-separated list"
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
