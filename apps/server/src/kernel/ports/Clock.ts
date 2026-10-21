/** Time port; implementations live in `apps/server/src/platform`. */
export interface Clock {
  now(): Date;
}
