/**
 * Module-local facade for the canonical order-status rules.
 *
 * The values and transitions live in `@saucia/domain`. This file exists only
 * so server code can keep a module-local import path; it must never grow a
 * second status list or a second transition table.
 */
export {
  ORDER_STATUSES,
  ORDER_STATUS_TRANSITIONS,
  canTransition,
  isTerminalOrderStatus,
  type OrderStatus,
} from '@saucia/domain';
