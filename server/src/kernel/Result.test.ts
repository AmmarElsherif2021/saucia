import { describe, expect, it } from 'vitest';
import { DomainError } from './DomainError';
import {
  Err,
  Failure,
  Ok,
  Success,
  isFailure,
  isSuccess,
  type Result,
} from './Result';

describe('Result', () => {
  it('represents success', () => {
    const result = Ok(42);

    expect(result).toBeInstanceOf(Success);
    expect(result.kind).toBe('success');
    expect(result.isSuccess()).toBe(true);
    expect(result.isFailure()).toBe(false);
    expect(isSuccess(result)).toBe(true);
    expect(isFailure(result)).toBe(false);

    if (isSuccess(result)) {
      expect(result.value).toBe(42);
    }
  });

  it('represents failure without throwing', () => {
    const error = new DomainError('ORDER_NOT_FOUND', 'Order not found');
    const result = Err(error);

    expect(result).toBeInstanceOf(Failure);
    expect(result.kind).toBe('failure');
    expect(result.isFailure()).toBe(true);
    expect(result.isSuccess()).toBe(false);
    expect(isFailure(result)).toBe(true);
    expect(isSuccess(result)).toBe(false);

    if (isFailure(result)) {
      expect(result.error).toBe(error);
    }
  });

  it('supports a narrowed failure type', () => {
    const result: Result<number, DomainError> = Err(
      new DomainError('FINANCIAL_MISMATCH', 'Totals do not match'),
    );

    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.error.code).toBe('FINANCIAL_MISMATCH');
    }
  });
});
