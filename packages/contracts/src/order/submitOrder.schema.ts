import { z } from 'zod';

/**
 * One requested meal line.
 *
 * The client sends identifiers and quantities only. Prices are deliberately
 * absent: the server recomputes them from current data.
 */
export const submitOrderMealSchema = z.object({
  mealId: z.string().uuid(),
  quantity: z.number().int().positive().max(99),
  customizationNotes: z.string().trim().max(500).optional(),
});

export const submitOrderSchema = z.object({
  deliveryAddressId: z.string().uuid(),
  orderMeals: z.array(submitOrderMealSchema).min(1).max(50),
  clientInstructions: z.string().trim().max(500).optional(),
  scheduledDeliveryDate: z.string().datetime({ offset: true }).optional(),
});

export const submitOrderResponseSchema = z.object({
  orderId: z.string().uuid(),
  orderNumber: z.string().min(1),
  /** Server-computed total in minor units (cents). */
  totalAmount: z.number().int().nonnegative(),
  /** ISO 8601 timestamp with an offset. */
  estimatedDelivery: z.string().datetime({ offset: true }),
});

export type SubmitOrderMeal = z.infer<typeof submitOrderMealSchema>;
export type SubmitOrderRequest = z.infer<typeof submitOrderSchema>;
export type SubmitOrderResponse = z.infer<typeof submitOrderResponseSchema>;
