<template>
  home
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
