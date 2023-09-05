import db from "../../db";
import {
  optionalNumber,
  requiredNumber,
  requiredString,
} from "../../utils/validate";
export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) throw createError({ status: 401 });
  const request = await readBody(event);
  let productId = optionalNumber(request, "productId", { moreThan: 0 });
  const productName = requiredString(request, "productName");
  const date = requiredString(request, "date");
  const time = requiredString(request, "time");
  const amount = requiredNumber(request, "amount", { moreThan: 0 });
  const caloriesPer100g = requiredNumber(request, "caloriesPer100g", {
    moreThanOrEqualTo: 0,
    lessOrEqualTo: 900,
  });
  const calories = (caloriesPer100g * amount) / 100;
  const fatsPer100g = requiredNumber(request, "fatsPer100g", {
    moreThanOrEqualTo: 0,
    lessOrEqualTo: 100,
  });
  const fats = (fatsPer100g * amount) / 100;
  const carbsPer100g = requiredNumber(request, "carbsPer100g", {
    moreThanOrEqualTo: 0,
    lessOrEqualTo: 100,
  });
  const carbs = (carbsPer100g * amount) / 100;
  const proteinsPer100g = requiredNumber(request, "proteinsPer100g", {
    moreThanOrEqualTo: 0,
    lessOrEqualTo: 100,
  });
  const proteins = (proteinsPer100g * amount) / 100;

  db.inTransaction(async (db) => {
    if (!productId) {
      productId = await db.products.add({
        createdByUserId: user.id,
        name: productName,
        caloriesPer100g,
        fatsPer100g,
        carbsPer100g,
        proteinsPer100g,
      });
    } else {
      //db.products.update({});
    }
    db.eaten.log({
      userId: user.id,
      productId,
      productName,
      date: new Date(date),
      time,
      weight: amount,
      caloriesPer100g,
      fatsPer100g,
      carbsPer100g,
      proteinsPer100g,
      calories,
      fats,
      carbs,
      proteins,
    });
  });
  event.node.res.end(); //TODO: send some response
});
