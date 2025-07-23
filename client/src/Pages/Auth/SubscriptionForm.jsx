import { useState, useEffect } from 'react';
import { 
  FormControl, FormLabel, Input, Button, Flex, Select,
  Checkbox, CheckboxGroup, Stack, SimpleGrid
} from '@chakra-ui/react';
import { useAdminFunctions } from '../../Hooks/useAdminFunctions';

const SubscriptionForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    ...initialData,
    meals: initialData.meals || [],
    additives: initialData.additives || []
  });
  
  const { useGetAllPlans, useGetAllMeals, useGetAllItems } = useAdminFunctions();
  const { data: plans = [] } = useGetAllPlans();
  const { data: meals = [] } = useGetAllMeals();
  const { data: items = [] } = useGetAllItems();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlanChange = (e) => {
    const planId = e.target.value;
    const selectedPlan = plans.find(p => p.id == planId);
    setFormData(prev => ({
      ...prev,
      planId,
      additives: selectedPlan?.additives || []
    }));
  };

  const handleMealChange = (dayIndex, mealId) => {
    setFormData(prev => {
      const newMeals = [...prev.meals];
      newMeals[dayIndex] = mealId;
      return { ...prev, meals: newMeals };
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }}>
      {/* Plan Selection */}
      <FormControl mb={4}>
        <FormLabel>Plan</FormLabel>
        <Select name="planId" value={formData.planId} onChange={handlePlanChange} required>
          <option value="">Select Plan</option>
          {plans.map(plan => (
            <option key={plan.id} value={plan.id}>
              {plan.title}
            </option>
          ))}
        </Select>
      </FormControl>

      {/* Meal Selection */}
      {formData.delivery_days?.map((day, index) => (
        <FormControl key={index} mb={4}>
          <FormLabel>Meal for {day}</FormLabel>
          <Select 
            value={formData.meals[index] || ''}
            onChange={(e) => handleMealChange(index, e.target.value)}
            required
          >
            <option value="">Select Meal</option>
            {meals.map(meal => (
              <option key={meal.id} value={meal.id}>
                {meal.name}
              </option>
            ))}
          </Select>
        </FormControl>
      ))}

      {/* Additives Selection */}
      <FormControl mb={4}>
        <FormLabel>Additives</FormLabel>
        <CheckboxGroup value={formData.additives} onChange={values => setFormData(prev => ({ ...prev, additives: values }))}>
          <Stack spacing={2}>
            {items.filter(item => formData.additives?.includes(item.id)).map(item => (
              <Checkbox key={item.id} value={item.id}>
                {item.name}
              </Checkbox>
            ))}
          </Stack>
        </CheckboxGroup>
      </FormControl>

      {/* Other fields... */}
      <Flex justify="flex-end" gap={2} mt={6}>
        <Button onClick={onCancel} variant="outline">Cancel</Button>
        <Button type="submit" colorScheme="brand">Save</Button>
      </Flex>
    </form>
  );
};
export default SubscriptionForm;