// This line has an error displayed by VS Code. It's a known Nuxt issue. A future update to Nuxt must solve that.
import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  // This is the slow method of getting the server user,
  // but the fast one (involving session) doesn't work after the session get expired
  // This code requires a revisit
  const client = serverSupabaseClient(event);
  const session = await client.auth.getSession();
  //console.log(session);
  const user = await serverSupabaseUser(event);
  event.context.user = user; //session.data.session?.user;
});
