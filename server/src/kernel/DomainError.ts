/**
 * Base error for expected business failures.
 *
 * The kernel deliberately carries no HTTP status, response body or framework
 * mapping. The delivery layer decides how a code becomes a transport response.
 *
 * `Code` stays generic so the error can be moved to `packages/kernel` later
 * without importing `@saucia/contracts`.
 */
export class DomainError<Code extends string = string> extends Error {
  constructor(
    readonly code: Code,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'DomainError';
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}
