import { z } from 'zod';

export const macroSplitSchema = z.object({
  protein: z.number().int().nonnegative(),
  carbs: z.number().int().nonnegative(),
  fat: z.number().int().nonnegative(),
});

export const nutritionProfileSchema = z.object({
  bmr: z.number().int().positive(),
  tdee: z.number().int().positive(),
  targetCalories: z.number().int().nonnegative(),
  macros: macroSplitSchema,
});

export type MacroSplitContract = z.infer<typeof macroSplitSchema>;
export type NutritionProfileContract = z.infer<typeof nutritionProfileSchema>;
