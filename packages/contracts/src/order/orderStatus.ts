import { ORDER_STATUSES, type OrderStatus } from '@saucia/domain';
import { z } from 'zod';

/**
 * Wire-facing projection of the order-status registry.
 *
 * The values and transition rules live in `@saucia/domain`. This file only
 * turns the canonical list into a transport schema.
 */
export { ORDER_STATUSES, type OrderStatus };

export const orderStatusSchema = z.enum(ORDER_STATUSES);
