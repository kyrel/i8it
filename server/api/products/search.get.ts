import db from "../../db";
export default defineEventHandler((event) => {
  const user = event.context.user;
  if (!user) throw createError({ status: 401 });
  const { pattern } = getQuery(event) ?? "";
  if (typeof pattern != "string") throw createError({ status: 400 });
  if (pattern.length < 1) return [];
  return db.products.search({ userId: user.id, pattern });
});
