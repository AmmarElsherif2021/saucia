// dataIntegrityUtils.js
export const useDataIntegrity = () => {
  const logDataState = (componentName, data) => {
    console.group(`🔍 ${componentName} Data State`);
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        console.log(`${key}:`, value.length, 'items', value);
      } else if (typeof value === 'object' && value !== null) {
        console.log(`${key}:`, value);
      } else {
        console.log(`${key}:`, value);
      }
    });
    console.groupEnd();
  };

  const validateFormData = (formData, requiredFields = []) => {
    const errors = [];
    
    requiredFields.forEach(field => {
      if (!formData[field] && formData[field] !== 0) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const compareArrays = (arr1, arr2) => {
    return JSON.stringify([...arr1].sort()) === JSON.stringify([...arr2].sort());
  };

  return {
    logDataState,
    validateFormData,
    compareArrays
  };
};

// Shared form data structure
export const getInitialFormData = () => ({
  age: '',
  gender: '',
  healthProfile: {
    dietaryPreferences: [],
    allergies: [],
    height: '',
    weight: '',
    activityLevel: 'moderately-active',
    fitnessGoal: 'maintenance',
  },
});