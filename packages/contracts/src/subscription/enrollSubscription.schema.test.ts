import { describe, expect, it } from 'vitest';
import { enrollSubscriptionSchema } from './enrollSubscription.schema';

const valid = {
  planId: '11111111-1111-4111-8111-111111111111',
  deliveryAddressId: '22222222-2222-4222-8222-222222222222',
  startDate: '2026-10-20',
  totalMeals: 20,
  preferredDeliveryTime: '12:00',
  meals: [
    {
      mealId: '33333333-3333-4333-8333-333333333333',
      quantity: 2,
    },
  ],
  healthProfile: {
    age: 30,
    gender: 'M',
    weightKg: 80,
    heightCm: 180,
    activityLevel: 'moderate',
    goal: 'maintain',
  },
  contactPhone: '0551234567',
};

describe('enrollSubscriptionSchema', () => {
  it('accepts a complete enrollment request', () => {
    const parsed = enrollSubscriptionSchema.parse(valid);
    expect(parsed.totalMeals).toBe(20);
    expect(parsed.healthProfile.gender).toBe('M');
    expect(parsed.contactPhone).toBe('0551234567');
  });

  it('accepts a normalized international phone', () => {
    const parsed = enrollSubscriptionSchema.parse({
      ...valid,
      contactPhone: '+966551234567',
    });
    expect(parsed.contactPhone).toBe('+966551234567');
  });

  it('rejects an invalid phone when one is supplied', () => {
    expect(
      enrollSubscriptionSchema.safeParse({ ...valid, contactPhone: '123' })
        .success,
    ).toBe(false);
  });

  it('rejects malformed dates and times', () => {
    expect(
      enrollSubscriptionSchema.safeParse({ ...valid, startDate: '20-10-2026' })
        .success,
    ).toBe(false);
    expect(
      enrollSubscriptionSchema.safeParse({
        ...valid,
        preferredDeliveryTime: '25:00',
      }).success,
    ).toBe(false);
  });

  it('rejects a health profile outside the domain vocabulary', () => {
    expect(
      enrollSubscriptionSchema.safeParse({
        ...valid,
        healthProfile: { ...valid.healthProfile, goal: 'bulk' },
      }).success,
    ).toBe(false);
    expect(
      enrollSubscriptionSchema.safeParse({ ...valid, healthProfile: undefined })
        .success,
    ).toBe(false);
  });

  it('rejects an empty meal list', () => {
    expect(
      enrollSubscriptionSchema.safeParse({ ...valid, meals: [] }).success,
    ).toBe(false);
  });
});
