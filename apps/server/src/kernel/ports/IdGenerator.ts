/** ID port; implementations live in `apps/server/src/platform`. */
export interface IdGenerator {
  generate(): string;
}
