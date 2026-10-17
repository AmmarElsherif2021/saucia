export const BMI_CATEGORIES = [
  'underweight',
  'normal',
  'overweight',
  'obese',
] as const;

export type BMICategory = (typeof BMI_CATEGORIES)[number];

export interface BMIResult {
  readonly bmi: number;
  readonly category: BMICategory;
}

function assertPositive(name: string, value: number): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive finite number`);
  }
}

/**
 * Body Mass Index, using WHO thresholds.
 *
 * `calculate` returns one decimal place for display; `evaluate` classifies the
 * unrounded value so a value such as 24.96 does not round into `overweight`.
 */
export class BMICalculator {
  private static raw(weightKg: number, heightCm: number): number {
    assertPositive('weightKg', weightKg);
    assertPositive('heightCm', heightCm);
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
  }

  static calculate(weightKg: number, heightCm: number): number {
    return Math.round(BMICalculator.raw(weightKg, heightCm) * 10) / 10;
  }

  static categorize(bmi: number): BMICategory {
    assertPositive('bmi', bmi);
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
  }

  static evaluate(weightKg: number, heightCm: number): BMIResult {
    const raw = BMICalculator.raw(weightKg, heightCm);
    return {
      bmi: Math.round(raw * 10) / 10,
      category: BMICalculator.categorize(raw),
    };
  }
}
