/**
  ============== Canonical order-status registry and transition rules ============
 
 = This module is the single owner of order-status values and of the legal movesbetween them. 
   Wire formats, Zod schemas, HTTP handlers and database mappers
   may project these values, BUT THEY MUST NEVER REDEFINE THEM.
 
= Revise (`docs/adr/saucia-phase2.md`, Task 1.2) and the v1 order tracker for investigating exact definitions.
 */
export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 ======== Data-driven state machine ===========
 
 = Cancellation is allowed until the order reaches a terminal state; the
 = preparing row intentionally follows the ADR, which permits only the
 * forward move to `out_for_delivery`.
 */
export const ORDER_STATUS_TRANSITIONS: Readonly<
  Record<OrderStatus, readonly OrderStatus[]>
> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};


// ================== Transition guard: Approve if this move may happen or not ==================
 
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from].includes(to);
}

// is terminal status?
export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[status].length === 0;
}
