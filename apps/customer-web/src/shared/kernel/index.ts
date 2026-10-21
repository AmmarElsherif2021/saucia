/**
 * Client-local error vocabulary.
 *
 * `Result` is deliberately NOT re-exported here: the server kernel
 * (`apps/server/src/kernel/Result.ts`) is the single owner of that contract.
 * A client-side duplicate is what this folder used to hold, and it was
 * removed on purpose (Project Bible, decision log 2026-10-20).
 *
 * If a client slice ever needs the same success/failure channel, extract
 * `packages/kernel` once — do not grow a second copy in `shared/`.
 */
export { AppError } from './AppError';
