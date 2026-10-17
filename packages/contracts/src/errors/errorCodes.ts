import { z } from 'zod';

/**
 * Stable wire error codes.
 *
 * The server returns a code; the client maps it to a localized message. The
 * message itself is intentionally not part of the domain vocabulary.
 */
export enum ErrorCode {
  // Auth
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  PROFILE_INCOMPLETE = 'PROFILE_INCOMPLETE',

  // Order
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  INVALID_ORDER_STATUS = 'INVALID_ORDER_STATUS',
  FINANCIAL_MISMATCH = 'FINANCIAL_MISMATCH',
  MEAL_NOT_FOUND = 'MEAL_NOT_FOUND',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',

  // Subscription
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
  INVALID_HEALTH_PROFILE = 'INVALID_HEALTH_PROFILE',

  // Address
  ADDRESS_NOT_FOUND = 'ADDRESS_NOT_FOUND',
  DELIVERY_AREA_NOT_SUPPORTED = 'DELIVERY_AREA_NOT_SUPPORTED',

  // Generic
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export const ERROR_CODES = Object.values(ErrorCode) as ErrorCode[];

export const errorCodeSchema = z.nativeEnum(ErrorCode);

export const errorResponseSchema = z.object({
  code: errorCodeSchema,
  message: z.string().min(1),
  details: z.record(z.unknown()).optional(),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export function isErrorCode(value: unknown): value is ErrorCode {
  return errorCodeSchema.safeParse(value).success;
}
