/** Time port; implementations live in `server/src/platform`. */
export interface Clock {
  now(): Date;
}
