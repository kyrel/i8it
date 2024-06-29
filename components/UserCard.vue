<template>
  <div v-if="user">
    {{ user.email }}
    (<button @click="signOut">Sign Out</button>)
  </div>
</template>
<script setup lang="ts">
const authClient = useSupabaseClient();
const user = useSupabaseUser();

async function signOut() {
  const { error } = await authClient.auth.signOut();
  if (error) {
    return;
  }
  navigateTo("/login");
}
</script>
