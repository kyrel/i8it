import { Db } from "./Db";

export type Product = {
  id: number;
  name: string;
  createdByUserId: string;
  caloriesPer100g: number;
  fatsPer100g: number;
  carbsPer100g: number;
  proteinsPer100g: number;
  servingName?: string;
  servingWeight?: number;
};

export type ProductAddData = Omit<Product, "id">;

export class ProductRepository {
  private db: Db;
  constructor(db: Db) {
    this.db = db;
  }

  async add({
    name,
    createdByUserId,
    caloriesPer100g,
    fatsPer100g,
    carbsPer100g,
    proteinsPer100g,
    servingName,
    servingWeight,
  }: ProductAddData) {
    return this.db.insertReturningId("products", {
      name,
      created_by_user_id: createdByUserId,
      calories_per_100_g: caloriesPer100g,
      fats_per_100_g: fatsPer100g,
      carbs_per_100_g: carbsPer100g,
      proteins_per_100_g: proteinsPer100g,
      serving_name: servingName,
      serving_weight: servingWeight,
    });
  }

  async search({
    userId,
    pattern,
  }: {
    userId: string;
    pattern: string;
  }): Promise<Product[]> {
    const queryText = `
        SELECT
          id,
          name,
          calories_per_100_g as "caloriesPer100g",
          fats_per_100_g as "fatsPer100g",
          carbs_per_100_g as "carbsPer100g",
          proteins_per_100_g as "proteinsPer100g",
          serving_name as "servingName",
          serving_weight as "servingWeight"
        FROM products
        WHERE 
        
        unaccent(name) ILIKE '%' || $2 || '%'
        ORDER BY id DESC
        LIMIT 15
      `; //created_by_user_id = $1 AND

    return this.db.many(queryText, [userId, pattern]);
  }
}
