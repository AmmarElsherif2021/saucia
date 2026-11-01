import { z } from 'zod';
import { ALLERGENS, DIET_CLASSES } from '@saucia/domain';

export const dietClassSchema = z.enum(DIET_CLASSES);
export const allergenIdSchema = z.enum(ALLERGENS);

export const nutritionSummarySchema = z.object({
  diet: dietClassSchema,
  allergens: z.array(allergenIdSchema),
  kcal: z.number().nonnegative(),
  macrosG: z.object({
    protein: z.number().nonnegative(),
    carbs: z.number().nonnegative(),
    fat: z.number().nonnegative(),
  }),
  split: z.object({
    proteinPct: z.number().min(0).max(100),
    carbsPct: z.number().min(0).max(100),
    fatPct: z.number().min(0).max(100),
  }).nullable(), // null when energy is zero
});
export type NutritionSummary = z.infer<typeof nutritionSummarySchema>;