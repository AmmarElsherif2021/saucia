/**
 * Base error for expected business failures.
 *
 * The kernel deliberately carries no HTTP status, response body or framework
 * mapping: the delivery layer decides how a code becomes a transport response.
 *
 * `message` is a fixed, client-safe string. `internalMessage` carries the
 * detail worth logging and must never be forwarded to a client verbatim.
 *
 * `Code` stays generic so the error can move to `packages/kernel` later
 * without importing `@saucia/contracts`.
 */
export class DomainError<Code extends string = string> extends Error {
  readonly code: Code;
  readonly internalMessage: string;
  readonly details?: Record<string, unknown>;

  constructor(
    code: Code,
    internalMessage: string,
    details?: Record<string, unknown>,
  ) {
    // Deliberately generic: a domain failure must not leak internals.
    super('Domain error');
    this.name = 'DomainError';
    this.code = code;
    this.internalMessage = internalMessage;
    this.details = details;
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}
