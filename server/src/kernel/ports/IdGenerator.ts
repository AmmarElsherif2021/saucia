/** ID port; implementations live in `server/src/platform`. */
export interface IdGenerator {
  generate(): string;
}
