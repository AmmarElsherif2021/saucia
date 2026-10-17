import { describe, expect, it } from 'vitest';
import { BMICalculator } from './BMICalculator';

describe('BMICalculator', () => {
  it('calculates BMI to one decimal place', () => {
    expect(BMICalculator.calculate(70, 175)).toBe(22.9);
    expect(BMICalculator.calculate(100, 175)).toBe(32.7);
  });

  it('classifies WHO categories', () => {
    expect(BMICalculator.categorize(18.49)).toBe('underweight');
    expect(BMICalculator.categorize(18.5)).toBe('normal');
    expect(BMICalculator.categorize(24.99)).toBe('normal');
    expect(BMICalculator.categorize(25)).toBe('overweight');
    expect(BMICalculator.categorize(29.99)).toBe('overweight');
    expect(BMICalculator.categorize(30)).toBe('obese');
  });

  it('evaluates value and category together', () => {
    expect(BMICalculator.evaluate(70, 175)).toEqual({
      bmi: 22.9,
      category: 'normal',
    });
  });

  it('rejects non-positive or non-finite measurements', () => {
    expect(() => BMICalculator.calculate(0, 175)).toThrow(RangeError);
    expect(() => BMICalculator.calculate(70, 0)).toThrow(RangeError);
    expect(() => BMICalculator.calculate(Number.NaN, 175)).toThrow(RangeError);
  });
});
