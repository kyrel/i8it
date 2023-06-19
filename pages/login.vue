<template>
  <h1>login</h1>
  <form @submit.prevent="signIn" v-if="!showOtpPrompt">
    <label for="emailInput">Email:</label>
    <input id="emailInput" v-model="email" />
    <br />
    <button type="submit">Sign In</button>
  </form>
  <form @submit.prevent="verifyOtp" v-if="showOtpPrompt">
    <label for="otpInput">Verification code:</label>
    <input id="otpInput" v-model="otp" />
    <br />
    <button type="submit">Verify</button>
  </form>
</template>

<script setup lang="ts">
const authClient = useSupabaseAuthClient();
const email = ref("");
const otp = ref("");
const showOtpPrompt = ref(false);

async function signIn() {
  const { error } = await authClient.auth.signInWithOtp({
    email: email.value,
  });
  if (error) {
    return;
  }
  showOtpPrompt.value = true;
}

async function verifyOtp() {
  const { error } = await authClient.auth.verifyOtp({
    type: "email",
    email: email.value,
    token: otp.value,
  });
  if (error) {
    return;
  }
  navigateTo("/");
}
</script>
