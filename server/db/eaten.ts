import { Db } from "./Db";

export type EatenEntry = {
  id: number;
  userId: string;
  productId: number;
  productName: string;
  caloriesPer100g: number;
  fatsPer100g: number;
  carbsPer100g: number;
  proteinsPer100g: number;
  weight: number;
  date: Date;
  time: string;
  calories: number;
  fats: number;
  carbs: number;
  proteins: number;
};

export type EatenAddData = Omit<EatenEntry, "id">;

export type EatenSummary = Pick<
  EatenEntry,
  | "id"
  | "time"
  | "productName"
  | "weight"
  | "calories"
  | "fats"
  | "carbs"
  | "proteins"
>;

export class EatenRepository {
  private db: Db;
  constructor(db: Db) {
    this.db = db;
  }

  async log({
    userId,
    productId,
    productName,
    caloriesPer100g,
    fatsPer100g,
    carbsPer100g,
    proteinsPer100g,
    weight,
    date,
    time,
    calories,
    fats,
    carbs,
    proteins,
  }: EatenAddData): Promise<number> {
    return this.db.insertReturningId("eaten", {
      user_id: userId,
      product_id: productId,
      product_name: productName,
      calories_per_100_g: caloriesPer100g,
      fats_per_100_g: fatsPer100g,
      carbs_per_100_g: carbsPer100g,
      proteins_per_100_g: proteinsPer100g,
      //serving_name: servingName,
      //serving_weight: servingWeight,
      weight,
      date,
      time,
      calories,
      fats,
      carbs,
      proteins,
    });
  }

  async get({
    userId,
    date,
  }: {
    userId: string;
    date: Date;
  }): Promise<EatenSummary[]> {
    const queryText = `
      SELECT id, time, product_name as "productName", weight, calories, fats, carbs, proteins
      FROM eaten
      WHERE user_id = $1 AND date = $2
      ORDER BY time, id
    `;
    return this.db.many(queryText, [userId, date]);
  }
}
