export {
  Ok,
  Err,
  Success,
  Failure,
  isSuccess,
  isFailure,
  type Result,
} from './Result';
export { DomainError, isDomainError } from './DomainError';
export type { Clock, IdGenerator, Logger } from './ports';
