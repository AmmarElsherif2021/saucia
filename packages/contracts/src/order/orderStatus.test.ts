import { describe, expect, it } from 'vitest';
import { ORDER_STATUSES as DOMAIN_STATUSES } from '@saucia/domain';
import {
  ORDER_STATUSES as CONTRACT_STATUSES,
  orderStatusSchema,
} from './orderStatus';

describe('order status contract', () => {
  it('exposes the domain registry by reference, not as a copy', () => {
    expect(CONTRACT_STATUSES).toBe(DOMAIN_STATUSES);
  });

  it('accepts every domain status', () => {
    for (const status of DOMAIN_STATUSES) {
      expect(orderStatusSchema.parse(status)).toBe(status);
    }
  });

  it('rejects unknown statuses', () => {
    expect(orderStatusSchema.safeParse('shipped').success).toBe(false);
    expect(orderStatusSchema.safeParse('').success).toBe(false);
  });
});
