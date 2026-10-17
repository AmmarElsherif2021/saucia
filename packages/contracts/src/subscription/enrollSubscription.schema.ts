import {
  ACTIVITY_LEVELS,
  FITNESS_GOALS,
  GENDERS,
  isValidSaudiPhone,
} from '@saucia/domain';
import { z } from 'zod';

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const clockTime = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Wire version of the health profile used by the plan calculators.
 *
 * Field names are camelCase at the boundary; the adapter maps them to the
 * domain's `HealthProfile` (`weight_kg`, `height_cm`) when calling the
 * calculators.
 */
export const healthProfileSchema = z.object({
  age: z.number().int().min(13).max(120),
  gender: z.enum(GENDERS),
  weightKg: z.number().positive().max(500),
  heightCm: z.number().positive().max(300),
  activityLevel: z.enum(ACTIVITY_LEVELS),
  goal: z.enum(FITNESS_GOALS),
});

export const subscriptionMealSchema = z.object({
  mealId: z.string().uuid(),
  quantity: z.number().int().positive().max(99),
});

export const enrollSubscriptionSchema = z.object({
  planId: z.string().uuid(),
  deliveryAddressId: z.string().uuid(),
  startDate: z.string().regex(isoDate, 'startDate must be YYYY-MM-DD'),
  totalMeals: z.number().int().positive().max(365),
  preferredDeliveryTime: z
    .string()
    .regex(clockTime, 'preferredDeliveryTime must be HH:MM'),
  meals: z.array(subscriptionMealSchema).min(1).max(50),
  healthProfile: healthProfileSchema,
  autoRenewal: z.boolean().optional(),
  contactPhone: z
    .string()
    .refine(isValidSaudiPhone, 'contactPhone must be a Saudi mobile number')
    .optional(),
});

export type HealthProfileContract = z.infer<typeof healthProfileSchema>;
export type SubscriptionMeal = z.infer<typeof subscriptionMealSchema>;
export type EnrollSubscriptionRequest = z.infer<typeof enrollSubscriptionSchema>;
