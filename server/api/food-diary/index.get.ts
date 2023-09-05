import db from "../../db";
export default defineEventHandler(async (event) => {
  const user = event.context.user;
  console.log("In API handler", user); //User is null here if using fetch
  if (!user) throw createError({ status: 401 });
  const { date = "2023-06-27" } = getQuery(event);
  console.log("Performing query:", user.id, date);
  return db.eaten.get({ userId: user.id, date: new Date(date as string) });
});
