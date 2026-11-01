//Returns allergen ids for one user only. 
export interface UserAllergyReader {
  allergensOf(userId: string): Promise<ReadonlySet<string>>;
}