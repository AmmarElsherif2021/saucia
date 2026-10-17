import { describe, expect, it } from 'vitest';
import {
  ErrorCode,
  ERROR_CODES,
  errorResponseSchema,
  isErrorCode,
} from './errorCodes';

describe('error codes', () => {
  it('lists every enum member once', () => {
    expect(new Set(ERROR_CODES).size).toBe(ERROR_CODES.length);
    expect(ERROR_CODES).toContain(ErrorCode.FINANCIAL_MISMATCH);
  });

  it('recognizes known codes only', () => {
    expect(isErrorCode('ORDER_NOT_FOUND')).toBe(true);
    expect(isErrorCode('SOMETHING_ELSE')).toBe(false);
    expect(isErrorCode(null)).toBe(false);
  });

  it('validates the error response shape', () => {
    const result = errorResponseSchema.parse({
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Invalid payload',
      details: { field: 'orderMeals' },
    });
    expect(result.code).toBe(ErrorCode.VALIDATION_ERROR);
    expect(result.details).toEqual({ field: 'orderMeals' });
  });

  it('rejects a response without a message', () => {
    expect(
      errorResponseSchema.safeParse({ code: ErrorCode.INTERNAL_SERVER_ERROR })
        .success,
    ).toBe(false);
  });
});
