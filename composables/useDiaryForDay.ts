export type DiaryEntry = {
  //TODO extract to types folder
  time: string;
  productName: string;
  weight: number;
  calories: number;
  fats: number;
  carbs: number;
  proteins: number;
};

export type DiaryTotals = Omit<DiaryEntry, "productName" | "weight" | "time">;

export async function useDiaryForDay(date: string | Ref<string>) {
  const { data: diary, refresh } = await useAsyncData(
    "food-diary",
    async () => {
      if (!unref(date)) return [];
      const headers = useRequestHeaders(["cookie"]);
      const result = await $fetch("/api/food-diary", {
        headers,
        params: { date: unref(date) },
        onRequest({ request, options }) {
          console.log("DOING REQUEST", unref(date));
        },
      });
      console.log("result is", result);
      return result;
    },
    {
      watch: isRef(date) ? [date] : undefined,
    }
  );

  /*const { data: diary, refresh } = await useFetch("/api/food-diary", {
    params: { date: date },
    key: "food-diary",
    onRequest({ request, options }) {
      console.log("DOING REQUEST", unref(date));
    },
  });*/
  console.log("DONE REQUEST");

  const diaryByTime = computed(() => {
    if (!diary.value) return [];
    const timeDictionary: Record<string, DiaryEntry[]> = {};
    for (const diaryEntry of diary.value) {
      if (!(diaryEntry.time in timeDictionary)) {
        timeDictionary[diaryEntry.time] = [];
      }
      timeDictionary[diaryEntry.time].push(diaryEntry);
    }
    const entries = Object.entries(timeDictionary);
    entries.sort((a, b) => a[0].localeCompare(b[0]));
    return entries.map(([time, entries]) => ({ time, entries }));
  });

  const totals = computed(() => {
    const empty: DiaryTotals = { calories: 0, fats: 0, carbs: 0, proteins: 0 };
    if (!diary.value) return empty;
    return diary.value.reduce(
      (acc, current) => ({
        calories: acc.calories + current.calories,
        fats: acc.fats + current.fats,
        carbs: acc.carbs + current.carbs,
        proteins: acc.proteins + current.proteins,
      }),
      empty
    );
  });

  return { diary, diaryByTime, totals, refresh };
}
