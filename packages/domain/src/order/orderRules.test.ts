import { describe, expect, it } from 'vitest';
import {
  ORDER_STATUSES,
  ORDER_STATUS_TRANSITIONS,
  canTransition,
  isTerminalOrderStatus,
  type OrderStatus,
} from './orderRules';

describe('order status registry', () => {
  it('spells each canonical status exactly once', () => {
    expect(ORDER_STATUSES).toEqual([
      'pending',
      'confirmed',
      'preparing',
      'out_for_delivery',
      'delivered',
      'cancelled',
    ]);
  });

  it('has a transition entry for every status', () => {
    expect(Object.keys(ORDER_STATUS_TRANSITIONS).sort()).toEqual(
      [...ORDER_STATUSES].sort(),
    );
  });

  it('allows the forward workflow', () => {
    expect(canTransition('pending', 'confirmed')).toBe(true);
    expect(canTransition('confirmed', 'preparing')).toBe(true);
    expect(canTransition('preparing', 'out_for_delivery')).toBe(true);
    expect(canTransition('out_for_delivery', 'delivered')).toBe(true);
  });

  it('rejects skipped and reopened states', () => {
    expect(canTransition('pending', 'delivered')).toBe(false);
    expect(canTransition('pending', 'preparing')).toBe(false);
    expect(canTransition('confirmed', 'out_for_delivery')).toBe(false);
    expect(canTransition('delivered', 'pending')).toBe(false);
    expect(canTransition('cancelled', 'confirmed')).toBe(false);
    expect(canTransition('pending', 'pending')).toBe(false);
  });

  it('treats delivered and cancelled as terminal', () => {
    expect(isTerminalOrderStatus('delivered')).toBe(true);
    expect(isTerminalOrderStatus('cancelled')).toBe(true);
    expect(isTerminalOrderStatus('pending')).toBe(false);
    expect(isTerminalOrderStatus('out_for_delivery')).toBe(false);
  });

  it('keeps the status type and the registry in sync', () => {
    const statuses: OrderStatus[] = [...ORDER_STATUSES];
    expect(statuses).toHaveLength(ORDER_STATUSES.length);
  });
});
