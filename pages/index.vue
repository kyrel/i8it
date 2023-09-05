<template>
  <h1>home</h1>
  <br />
  <NuxtLink to="/eaten">I have eaten...</NuxtLink>
  <br />
  <NuxtLink to="/cooked">I have cooked...</NuxtLink>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["auth"],
});
</script>
