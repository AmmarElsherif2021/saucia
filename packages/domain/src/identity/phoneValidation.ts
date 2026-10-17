const SAUDI_COUNTRY_CODE = '+966';
const SAUDI_MOBILE_NATIONAL = /^5\d{8}$/;

/**
 * Normalize a Saudi mobile number to E.164 (`+9665XXXXXXXX`).
 *
 * Accepts the formats the legacy app and Saudi users actually type:
 * `05XXXXXXXX`, `5XXXXXXXX`, `+9665XXXXXXXX`, `9665XXXXXXXX`,
 * `009665XXXXXXXX`, with spaces, dashes or parentheses.
 *
 * Returns `null` when the input is not a Saudi mobile number.
 */
export function normalizeSaudiPhone(input: string): string | null {
  if (typeof input !== 'string') {
    return null;
  }

  const digits = input.replace(/\D/g, '');
  if (digits.length === 0) {
    return null;
  }

  let national = digits;

  if (national.startsWith('00966')) {
    national = national.slice(5);
  } else if (national.startsWith('966')) {
    national = national.slice(3);
  }

  if (national.startsWith('0')) {
    national = national.slice(1);
  }

  if (!SAUDI_MOBILE_NATIONAL.test(national)) {
    return null;
  }

  return `${SAUDI_COUNTRY_CODE}${national}`;
}

export function isValidSaudiPhone(input: string): boolean {
  return normalizeSaudiPhone(input) !== null;
}

/**
 * Normalize or throw. Use this at a boundary where a malformed phone is a
 * validation error rather than a boolean branch.
 */
export function formatSaudiPhone(input: string): string {
  const normalized = normalizeSaudiPhone(input);
  if (normalized === null) {
    throw new RangeError('Invalid Saudi mobile number');
  }
  return normalized;
}

/** Mask a number for display, keeping the country code and last two digits. */
export function maskSaudiPhone(input: string): string | null {
  const normalized = normalizeSaudiPhone(input);
  if (normalized === null) {
    return null;
  }
  const prefix = normalized.slice(0, 5);
  const suffix = normalized.slice(-2);
  const hidden = normalized.length - prefix.length - suffix.length;
  return `${prefix}${'*'.repeat(hidden)}${suffix}`;
}
