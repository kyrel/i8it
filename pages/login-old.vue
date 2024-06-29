<template>
  <div class="login__container">
    <div class="login__card">
      <h1>login to i8it</h1>
      <form @submit.prevent="signIn" v-if="!showOtpPrompt">
        <label for="emailInput" class="login__label">Email:</label>
        <input
          ref="emailInput"
          type="email"
          class="login__input"
          id="emailInput"
          v-model="email"
          :disabled="isSigningIn"
        />
        <br />
        <button type="submit" :disabled="isSigningIn">Sign In</button>
      </form>
      <form @submit.prevent="verifyOtp" v-if="showOtpPrompt">
        <label for="otpInput" class="login__label">Verification code:</label>
        <input
          ref="otpInput"
          type="text"
          class="login__input"
          id="otpInput"
          v-model="otp"
          :disabled="isVerifying"
        />
        <br />
        <button type="submit" :disabled="isVerifying">Verify</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const emailInput = ref<null | HTMLInputElement>(null);
const otpInput = ref<null | HTMLInputElement>(null);
const authClient = useSupabaseAuthClient();
const email = ref("");
const otp = ref("");
const showOtpPrompt = ref(false);
const isSigningIn = ref(false);
const isVerifying = ref(false);

async function signIn() {
  if (isSigningIn.value) return;
  isSigningIn.value = true;
  const { error } = await authClient.auth.signInWithOtp({
    email: email.value,
  });
  isSigningIn.value = false;
  if (error) {
    return;
  }
  showOtpPrompt.value = true;
  await nextTick();
  otpInput.value!.focus();
}

async function verifyOtp() {
  if (isVerifying.value) return;
  isVerifying.value = true;
  const { error } = await authClient.auth.verifyOtp({
    type: "email",
    email: email.value,
    token: otp.value,
  });
  isVerifying.value = false;
  if (error) {
    return;
  }
  navigateTo("/");
}

onMounted(() => {
  emailInput.value!.focus();
});
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
