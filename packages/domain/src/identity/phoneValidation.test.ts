import { describe, expect, it } from 'vitest';
import {
  formatSaudiPhone,
  isValidSaudiPhone,
  maskSaudiPhone,
  normalizeSaudiPhone,
} from './phoneValidation';

describe('normalizeSaudiPhone', () => {
  it('normalizes local and international formats', () => {
    const expected = '+966551234567';
    expect(normalizeSaudiPhone('0551234567')).toBe(expected);
    expect(normalizeSaudiPhone('551234567')).toBe(expected);
    expect(normalizeSaudiPhone('+966551234567')).toBe(expected);
    expect(normalizeSaudiPhone('966551234567')).toBe(expected);
    expect(normalizeSaudiPhone('00966551234567')).toBe(expected);
    expect(normalizeSaudiPhone('+966 55 123 4567')).toBe(expected);
    expect(normalizeSaudiPhone('055-123-4567')).toBe(expected);
    expect(normalizeSaudiPhone('(055) 123 4567')).toBe(expected);
  });

  it('rejects non-Saudi or malformed numbers', () => {
    expect(normalizeSaudiPhone('')).toBeNull();
    expect(normalizeSaudiPhone('abc')).toBeNull();
    expect(normalizeSaudiPhone('041234567')).toBeNull();
    expect(normalizeSaudiPhone('055123456')).toBeNull();
    expect(normalizeSaudiPhone('05512345678')).toBeNull();
    expect(normalizeSaudiPhone('+15551234567')).toBeNull();
  });

  it('validates and formats without losing the country code', () => {
    expect(isValidSaudiPhone('0551234567')).toBe(true);
    expect(isValidSaudiPhone('123')).toBe(false);
    expect(formatSaudiPhone('0551234567')).toBe('+966551234567');
    expect(() => formatSaudiPhone('123')).toThrow(RangeError);
  });

  it('masks all but the last two digits for display', () => {
    expect(maskSaudiPhone('0551234567')).toBe('+9665******67');
    expect(maskSaudiPhone('123')).toBeNull();
  });
});
