import { describe, expect, it } from 'vitest';
import {
  submitOrderResponseSchema,
  submitOrderSchema,
} from './submitOrder.schema';

const addressId = '11111111-1111-4111-8111-111111111111';
const mealId = '22222222-2222-4222-8222-222222222222';

const valid = {
  deliveryAddressId: addressId,
  orderMeals: [{ mealId, quantity: 2 }],
  clientInstructions: 'Leave at the door',
};

describe('submitOrderSchema', () => {
  it('accepts a minimal valid request', () => {
    const parsed = submitOrderSchema.parse(valid);
    expect(parsed.deliveryAddressId).toBe(addressId);
    expect(parsed.orderMeals).toHaveLength(1);
    expect(parsed.orderMeals[0]?.quantity).toBe(2);
  });

  it('accepts an ISO scheduled delivery date', () => {
    const parsed = submitOrderSchema.parse({
      ...valid,
      scheduledDeliveryDate: '2026-10-18T12:00:00+03:00',
    });
    expect(parsed.scheduledDeliveryDate).toBe('2026-10-18T12:00:00+03:00');
  });

  it('rejects an empty meal list', () => {
    expect(
      submitOrderSchema.safeParse({ ...valid, orderMeals: [] }).success,
    ).toBe(false);
  });

  it('rejects invalid quantities and identifiers', () => {
    expect(
      submitOrderSchema.safeParse({
        ...valid,
        orderMeals: [{ mealId, quantity: 0 }],
      }).success,
    ).toBe(false);
    expect(
      submitOrderSchema.safeParse({
        ...valid,
        orderMeals: [{ mealId, quantity: 1.5 }],
      }).success,
    ).toBe(false);
    expect(
      submitOrderSchema.safeParse({ ...valid, deliveryAddressId: 'not-a-uuid' })
        .success,
    ).toBe(false);
  });

  it('strips client-supplied prices instead of trusting them', () => {
    const parsed = submitOrderSchema.parse({
      ...valid,
      orderMeals: [{ mealId, quantity: 1, unitPrice: 9999, totalPrice: 9999 }],
    });
    expect('unitPrice' in parsed.orderMeals[0]!).toBe(false);
    expect('totalPrice' in parsed.orderMeals[0]!).toBe(false);
  });
});

describe('submitOrderResponseSchema', () => {
  it('accepts a server response in cents', () => {
    const parsed = submitOrderResponseSchema.parse({
      orderId: '33333333-3333-4333-8333-333333333333',
      orderNumber: '#001001',
      totalAmount: 6750,
      estimatedDelivery: '2026-10-18T12:45:00+03:00',
    });
    expect(parsed.totalAmount).toBe(6750);
  });

  it('rejects fractional cents', () => {
    expect(
      submitOrderResponseSchema.safeParse({
        orderId: '33333333-3333-4333-8333-333333333333',
        orderNumber: '#001001',
        totalAmount: 67.5,
        estimatedDelivery: '2026-10-18T12:45:00+03:00',
      }).success,
    ).toBe(false);
  });
});
