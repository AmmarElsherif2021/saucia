/**
 ==> Explicit success/failure channel used across server layers.
 
 * IMPORTANT: The kernel owns the shape only; it does not know about HTTP, Supabase or
  business errors. Use `Result<T, DomainError>` where a use case can fail.
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

export class Success<T> {
  // Label the kind of result so we can discriminate between success and failure.
  readonly kind = 'success' as const;
  

  constructor(readonly value: T) {}

  isSuccess(): this is Success<T> {
    return true;
  }

  isFailure(): this is Failure<unknown> {
    return false;
  }
}

export class Failure<E> {
  // Same labeling so we can discriminate between success and failure.
  readonly kind = 'failure' as const;

  constructor(readonly error: E) {}

  isSuccess(): this is Success<unknown> {
    return false;
  }

  isFailure(): this is Failure<E> {
    return true;
  }
}

// Factory functions for creating success and failure results.
export const Ok = <T, E = Error>(value: T): Result<T, E> => new Success(value);

export const Err = <E, T = never>(error: E): Result<T, E> => new Failure(error);

export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.kind === 'success';
}

export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result.kind === 'failure';
}
