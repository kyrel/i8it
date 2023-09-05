<template>
  <h1>I have eaten</h1>
  <form @submit.prevent="handleSubmit">
    <Autocomplete
      :search="search"
      :getResultValue="(res: any)=>res.name"
      placeholder="Type product name"
      aria-label="Product name"
      :debounce-time="200"
      @select="onSelectProduct"
      ref="productList"
    />
    <label>
      Amount
      <input type="text" v-model="amount" />
    </label>
    <label>
      Date
      <input type="date" v-model="date" />
    </label>
    <label>
      Time
      <input type="text" v-model="time" />
    </label>
    <fieldset>
      <legend>Nutrition facts</legend>
      <label class="nutrition-fact">
        Calories
        <input type="text" class="nutrition-fact__input" v-model="calories" />
      </label>
      <label class="nutrition-fact">
        Fats
        <input type="text" class="nutrition-fact__input" v-model="fats" />
      </label>
      <label class="nutrition-fact">
        Carbs
        <input type="text" class="nutrition-fact__input" v-model="carbs" />
      </label>
      <label class="nutrition-fact">
        Proteins
        <input type="text" class="nutrition-fact__input" v-model="proteins" />
      </label>
      <div v-if="!productId && productName">A new product will be created</div>
    </fieldset>
    <button type="submit">Add</button>
  </form>
  <table v-if="dateForTotals">
    <caption>
      <button type="button" @click="prevDayForTotals">&lt;</button>
      Totals for
      {{
        dateForTotals
      }}
      <button type="button" @click="nextDayForTotals">&gt;</button>
    </caption>
    <tbody>
      <tr>
        <th>KCal: {{ totals.calories.toFixed(1) }}</th>
        <th>Fats: {{ totals.fats.toFixed(1) }} g</th>
        <th>Carbs: {{ totals.carbs.toFixed(1) }} g</th>
        <th>Proteins: {{ totals.proteins.toFixed(1) }} g</th>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import Autocomplete from "~/components/Autocomplete/Autocomplete.vue";
import dayjs from "dayjs";

definePageMeta({
  middleware: ["auth"],
});

//const willCreateNewProduct = ref(true);
const productList = ref<InstanceType<typeof Autocomplete> | null>(null);
const amount = ref("");
const calories = ref("");
const fats = ref("");
const carbs = ref("");
const proteins = ref("");
const date = ref("");
const time = ref("");
const productName = ref("");
const productId = ref(undefined as undefined | number);
const dateForTotals = ref("");
const { totals, refresh: refreshDiaryForDay } = await useDiaryForDay(
  dateForTotals
);

onMounted(() => {
  dateForTotals.value = dayjs().format("YYYY-MM-DD");
});

async function search(input: string) {
  return await $fetch(`/api/products/search?id=1`, {
    params: { pattern: input },
  });
}

function onSelectProduct(name: string, product: any) {
  if (product) {
    calories.value = product.caloriesPer100g.toString(); //TODO: decimals are in fact strings
    fats.value = product.fatsPer100g.toString();
    carbs.value = product.carbsPer100g.toString();
    proteins.value = product.proteinsPer100g.toString();
    productId.value = product.id;
  } else {
    calories.value = ""; //TODO: this behavior will change
    fats.value = "";
    carbs.value = "";
    proteins.value = "";
    productId.value = undefined;
  }
  productName.value = name;
}

async function handleSubmit() {
  await $fetch("/api/food-diary/log", {
    method: "post",
    body: {
      productId: productId.value,
      productName: productName.value,
      date: date.value,
      time: time.value,
      amount: amount.value,
      caloriesPer100g: calories.value,
      fatsPer100g: fats.value,
      carbsPer100g: carbs.value,
      proteinsPer100g: proteins.value,
    },
  });
  if (dateForTotals.value == date.value) {
    //Force refresh daily data even if date has not changed
    await refreshDiaryForDay();
  }
  dateForTotals.value = date.value;
  productList.value!.reset();
  amount.value = "";
}

function prevDayForTotals() {
  dateForTotals.value = dayjs(dateForTotals.value)
    .subtract(1, "day")
    .format("YYYY-MM-DD");
}

function nextDayForTotals() {
  dateForTotals.value = dayjs(dateForTotals.value)
    .add(1, "day")
    .format("YYYY-MM-DD");
}
</script>

<style>
.nutrition-fact {
  margin-right: 15px;
}

.nutrition-fact__input {
  margin-left: 10px;
  width: 60px;
}
</style>
