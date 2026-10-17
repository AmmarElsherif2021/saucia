/**
 * Canonical order-status registry and transition rules.
 *
 * This file is the single owner of order-status values and of the legal moves
 * between them. Wire formats, Zod schemas, HTTP handlers and database mappers
 * may project these values, but they must not redefine them.
 *
 * The status set and the forward workflow follow the v2 plan
 * (`docs/adr/saucia-phase2.md`, Task 1.2) and the v1 order tracker.
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
 * Data-driven state machine.
 *
 * Cancellation is allowed until the order reaches a terminal state; the
 * `preparing` row intentionally follows the ADR, which permits only the
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

/**
 * Pure guard: answers only "may this move happen?".
 *
 * Persistence-facing conditions (for example, "cancelled is terminal once a
 * delivery row exists") belong on the aggregate, not in this table.
 */
export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[from].includes(to);
}

/** True for statuses with no outgoing transitions. */
export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[status].length === 0;
}
