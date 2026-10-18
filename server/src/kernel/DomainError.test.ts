import { describe, expect, it } from 'vitest';
import { DomainError, isDomainError } from './DomainError';

describe('DomainError', () => {
  it('carries a stable code, message and details', () => {
    const error = new DomainError('ORDER_NOT_FOUND', 'Order not found', {
      orderId: 'order-1',
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainError);
    expect(error.name).toBe('DomainError');
    expect(error.code).toBe('ORDER_NOT_FOUND');
    expect(error.message).toBe('Order not found');
    expect(error.details).toEqual({ orderId: 'order-1' });
  });

  it('stays free of HTTP semantics', () => {
    const error = new DomainError('VALIDATION_ERROR', 'Invalid payload');

    expect('statusCode' in error).toBe(false);
    expect('status' in error).toBe(false);
    expect('headers' in error).toBe(false);
  });

  it('supports a narrowed code type', () => {
    const error = new DomainError<'INVALID_ORDER_STATUS'>(
      'INVALID_ORDER_STATUS',
      'Cannot transition',
    );

    expect(error.code).toBe('INVALID_ORDER_STATUS');
  });

  it('recognizes domain errors and ignores other errors', () => {
    expect(isDomainError(new DomainError('UNAUTHORIZED', 'No session'))).toBe(
      true,
    );
    expect(isDomainError(new Error('boom'))).toBe(false);
    expect(isDomainError({ code: 'UNAUTHORIZED' })).toBe(false);
  });
});
