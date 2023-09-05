<template>
  <h1>My diary</h1>
  <button type="button" @click="$router.push('2023-06-27')">&gt;</button>
  <table>
    <tbody>
      <template v-for="{ time, entries } in diaryByTime" :key="time">
        <tr>
          <th colspan="6">{{ time }}</th>
        </tr>
        <tr v-for="entry in entries">
          <td>{{ entry.productName }}</td>
          <td>{{ entry.weight.toFixed() }} g</td>
          <td>KCal: {{ entry.calories.toFixed(1) }}</td>
          <td>Fats: {{ entry.fats.toFixed(1) }} g</td>
          <td>Carbs: {{ entry.carbs.toFixed(1) }} g</td>
          <td>Proteins: {{ entry.proteins.toFixed(1) }} g</td>
        </tr>
      </template>
      <tr>
        <th colspan="2">Total</th>
        <th>KCal: {{ totals.calories.toFixed(1) }}</th>
        <th>Fats: {{ totals.fats.toFixed(1) }} g</th>
        <th>Carbs: {{ totals.carbs.toFixed(1) }} g</th>
        <th>Proteins: {{ totals.proteins.toFixed(1) }} g</th>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
definePageMeta({
  middleware: ["auth"],
});

const router = useRouter();
const route = useRoute();

const date = computed(() => {
  return route.params.date as string;
});

watchEffect(() => {
  if (!date.value) router.push(`/diary/${dayjs().format("YYYY-MM-DD")}`); //TODO: maybe do it in inline route middleware
});

const { diary, diaryByTime, totals } = await useDiaryForDay(date);
console.log("AFTER AWAIT COMPOSABLE");
</script>

<style scoped>
th {
  padding-top: 30px;
  text-align: left;
}
</style>
