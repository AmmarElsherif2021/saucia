// nutritionCalculator.js - Scientific nutrition calculations

// Activity level multipliers for TDEE calculation
const ACTIVITY_MULTIPLIERS = {
  'sedentary': 1.2,
  'lightly_active': 1.375,
  'moderately_active': 1.55,
  'very_active': 1.725,
  'extremely_active': 1.9
};

// Goal-based calorie adjustments (percentage)
const GOAL_ADJUSTMENTS = {
  'weight-loss': -0.15,        // -15% deficit
  'weight-gain': 0.15,         // +15% surplus
  'muscle-gain': 0.10,         // +10% surplus
  'maintenance': 0,            // No adjustment
  'improve-fitness': -0.05     // Slight deficit
};

// Macronutrient ratios by goal (% of total calories)
const MACRO_RATIOS = {
  'weight-loss': { protein: 0.30, carbs: 0.40, fat: 0.30 },
  'weight-gain': { protein: 0.25, carbs: 0.50, fat: 0.25 },
  'muscle-gain': { protein: 0.30, carbs: 0.45, fat: 0.25 },
  'maintenance': { protein: 0.25, carbs: 0.50, fat: 0.25 },
  'improve-fitness': { protein: 0.30, carbs: 0.45, fat: 0.25 }
};

// Calorie per gram constants
const CALORIES_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9
};

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'male', 'female', or 'other'
 * @returns {number} BMR in kcal/day
 */
export const calculateBMR = (weight, height, age, gender) => {
  if (!weight || !height || !age) return null;
  
  // Base calculation: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y)
  const baseCalc = (10 * weight) + (6.25 * height) - (5 * age);
  
  // Gender-specific adjustment
  switch (gender) {
    case 'male':
      return baseCalc + 5;
    case 'female':
      return baseCalc - 161;
    case 'other':
      // Use average of male and female formulas
      return baseCalc - 78;
    default:
      // Default to female formula (more conservative)
      return baseCalc - 161;
  }
};

/**
 * Calculate Total Daily Energy Expenditure
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - Activity level key
 * @returns {number} TDEE in kcal/day
 */
export const calculateTDEE = (bmr, activityLevel) => {
  if (!bmr || !activityLevel) return null;
  
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return bmr * multiplier;
};

/**
 * Adjust TDEE based on fitness goal
 * @param {number} tdee - Total Daily Energy Expenditure
 * @param {string} fitnessGoal - Fitness goal key
 * @returns {number} Adjusted daily calorie target
 */
export const adjustForGoal = (tdee, fitnessGoal) => {
  if (!tdee || !fitnessGoal) return null;
  
  const adjustment = GOAL_ADJUSTMENTS[fitnessGoal] || 0;
  return Math.round(tdee * (1 + adjustment));
};

/**
 * Calculate macronutrient distribution in grams
 * @param {number} dailyCalories - Daily calorie target
 * @param {string} fitnessGoal - Fitness goal key
 * @returns {object} Macros in grams { protein, carbs, fat }
 */
export const calculateMacros = (dailyCalories, fitnessGoal) => {
  if (!dailyCalories || !fitnessGoal) return null;
  
  const ratios = MACRO_RATIOS[fitnessGoal] || MACRO_RATIOS['maintenance'];
  
  return {
    protein: Math.round((dailyCalories * ratios.protein) / CALORIES_PER_GRAM.protein),
    carbs: Math.round((dailyCalories * ratios.carbs) / CALORIES_PER_GRAM.carbs),
    fat: Math.round((dailyCalories * ratios.fat) / CALORIES_PER_GRAM.fat)
  };
};

/**
 * Complete nutrition calculation pipeline
 * @param {object} params - { weight, height, age, gender, activityLevel, fitnessGoal }
 * @returns {object} Complete nutrition profile or null
 */
export const calculateNutritionProfile = ({ weight, height, age, gender, activityLevel, fitnessGoal }) => {
  // Validate inputs
  if (!weight || !height || !age || !gender || !activityLevel || !fitnessGoal) {
    return null;
  }
  
  // Step 1: Calculate BMR
  const bmr = calculateBMR(weight, height, age, gender);
  if (!bmr) return null;
  
  // Step 2: Calculate TDEE
  const tdee = calculateTDEE(bmr, activityLevel);
  if (!tdee) return null;
  
  // Step 3: Adjust for goal
  const dailyCalories = adjustForGoal(tdee, fitnessGoal);
  if (!dailyCalories) return null;
  
  // Step 4: Calculate macros
  const macros = calculateMacros(dailyCalories, fitnessGoal);
  if (!macros) return null;
  
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    dailyCalories,
    macros,
    calculations: {
      activityMultiplier: ACTIVITY_MULTIPLIERS[activityLevel],
      goalAdjustment: GOAL_ADJUSTMENTS[fitnessGoal],
      macroRatios: MACRO_RATIOS[fitnessGoal]
    }
  };
};

/**
 * Validate if nutrition calculation is possible with given data
 * @param {object} formData - Form data object
 * @returns {boolean} True if all required fields are present
 */
export const canCalculateNutrition = (formData) => {
  return !!(
    formData.age &&
    formData.gender &&
    formData.healthProfile?.height &&
    formData.healthProfile?.weight &&
    formData.healthProfile?.activityLevel &&
    formData.healthProfile?.fitnessGoal
  );
};