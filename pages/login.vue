<template>
  <div class="login__container">
    <div class="login__card">
      <h1>login to i8it</h1>
      <button type="submit" @click="signIn" :disabled="isSigningIn">
        Sign In with GitHub
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const authClient = useSupabaseClient();
const isSigningIn = ref(false);

async function signIn() {
  if (isSigningIn.value) return;
  isSigningIn.value = true;
  const { error } = await authClient.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${window.location.protocol}//${window.location.host}/confirm`,
    },
  });
  isSigningIn.value = false;
  if (error) {
    return;
  }
}
</script>

<style>
.login__container {
  display: grid;
  place-items: center;
  height: 100vh;
}

.login__card {
  min-height: 200px;
  min-width: 300px;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid gray;
}

.login__label {
  display: block;
  margin-bottom: 7px;
}

.login__input {
  display: block;
  width: 100%;
}
</style>
