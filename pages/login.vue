<template>
<h1>login</h1>
<form>
<label for="emailInput">Email:</label>
<input id="emailInput" v-model="email">
<br>
<button type="submit">Sign In</button>
</form>
</template>

<script setup lang="ts">
// import supabase from '~/infrastructure/supabase';

 const email = ref("");
  
// async function signIn() {
//   const { data, error } = await supabase.auth.signInWithOtp({
//     email: email.value,
//     /*options: {
//       emailRedirectTo: 'https://example.com/welcome'
//     }*/
//   });
// }
</script>