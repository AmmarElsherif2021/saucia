import { describe, expect, it } from 'vitest';
import { DomainError, isDomainError } from './DomainError';

describe('DomainError', () => {
  it('carries a stable code, internal message and details', () => {
    const error = new DomainError('ORDER_NOT_FOUND', 'Order order-1 missing', {
      orderId: 'order-1',
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(DomainError);
    expect(error.name).toBe('DomainError');
    expect(error.code).toBe('ORDER_NOT_FOUND');
    expect(error.internalMessage).toBe('Order order-1 missing');
    expect(error.details).toEqual({ orderId: 'order-1' });
  });

  it('keeps the client-safe message generic', () => {
    const error = new DomainError(
      'FINANCIAL_MISMATCH',
      'expected 1000 cents but got 900',
    );

    expect(error.message).toBe('Domain error');
    expect(error.message).not.toContain('1000');
    expect(error.message).not.toContain('900');
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
