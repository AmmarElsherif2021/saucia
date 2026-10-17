const CENTS_PER_UNIT = 100;

/**
 Money value object:
    ----------------------------------------------------------------------
 - Amounts are stored as integer minor units (cents) so arithmetic never
 - accumulates floating-point drift. This type is transport-agnostic: wire
 - contracts decide whether cents travel as numbers or strings.
 */
export class Money {
  private constructor(private readonly cents: number) {}

  static fromCents(cents: number): Money {
    if (!Number.isSafeInteger(cents)) {
      throw new RangeError('Money amount must be a safe integer number of cents');
    }
    return new Money(cents);
  }

  static fromDollars(dollars: number): Money {
    if (!Number.isFinite(dollars)) {
      throw new RangeError('Money amount must be a finite number');
    }
    const scaled = dollars * CENTS_PER_UNIT;
    const cents =
      Math.sign(scaled) * Math.round(Math.abs(scaled) + Number.EPSILON);
    return Money.fromCents(cents);
  }

  static zero(): Money {
    return Money.fromCents(0);
  }

  get inCents(): number {
    return this.cents;
  }

  get inDollars(): number {
    return this.cents / CENTS_PER_UNIT;
  }

  add(other: Money): Money {
    return Money.fromCents(this.cents + other.inCents);
  }

  /** Subtraction never crosses zero; a discount larger than the balance is a bug. */
  subtract(other: Money): Money {
    const result = this.cents - other.inCents;
    if (result < 0) {
      throw new RangeError('Money subtraction would produce a negative amount');
    }
    return Money.fromCents(result);
  }

  /** Multiply by a whole number of units (quantity), never by a rate. */
  multiply(quantity: number): Money {
    if (!Number.isSafeInteger(quantity) || quantity < 0) {
      throw new RangeError('Money multiplier must be a non-negative safe integer');
    }
    return Money.fromCents(this.cents * quantity);
  }

  equals(other: Money): boolean {
    return this.cents === other.inCents;
  }

  isZero(): boolean {
    return this.cents === 0;
  }

  isNegative(): boolean {
    return this.cents < 0;
  }

  /** Fixed two-decimal rendering for logs and diagnostics; UI formatting stays client-side. */
  toString(): string {
    return this.inDollars.toFixed(2);
  }
}
