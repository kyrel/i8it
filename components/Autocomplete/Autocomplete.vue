<template>
  <div ref="rootElement">
    <div
      :class="baseClass"
      style="position: relative"
      :data-expanded="expanded"
      :data-loading="loading"
      :data-position="position"
    >
      <input
        ref="inputElement"
        :class="`${baseClass}-input`"
        :value="value"
        role="combobox"
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        :aria-owns="resultListId"
        :aria-expanded="expanded ? 'true' : 'false'"
        :aria-activedescendant="
          selectedIndex > -1 ? `${resultListId}-result-${selectedIndex}` : ''
        "
        v-bind="$attrs"
        @input="handleInput"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="hideResults"
      />
      <ul
        ref="resultListElement"
        :id="resultListId"
        :class="`${baseClass}-result-list`"
        role="listbox"
        style="position: absolute; z-index: 1; width: 100%"
        :style="{
          visibility: expanded ? 'visible' : 'hidden',
          pointerEvents: expanded ? 'auto' : 'none',
          top: position == 'below' ? '100%' : undefined,
          bottom: position == 'below' ? undefined : '100%',
        }"
        :aria-labelledby="
          resultListLabel?.startsWith('#')
            ? resultListLabel.substring(1)
            : undefined
        "
        :aria-label="
          resultListLabel && !resultListLabel.startsWith('#')
            ? resultListLabel
            : undefined
        "
        @mousedown="(ev) => ev.preventDefault()"
        @click="handleResultClick"
      >
        <template v-for="(result, index) in results">
          <slot name="result" :result="result" :index="index">
            <li
              :key="`${resultListId}-result-${index}`"
              :id="`${resultListId}-result-${index}`"
              :aria-selected="selectedIndex == index ? 'true' : undefined"
              :class="`${props.baseClass}-result`"
              :data-result-index="index"
              role="option"
            >
              {{ getResultValue(result) }}
            </li>
          </slot>
        </template>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
let idCounter = 0;
</script>

<script setup lang="ts">
import getRelativePosition from "./get-relative-position";
import debounce from "./debounce";

defineOptions({
  inheritAttrs: false,
});

type Props = {
  search: (input: string) => Promise<any[]> | any[];
  baseClass?: string;
  autoSelect?: boolean;
  getResultValue?: (result: any) => string;
  defaultValue?: string;
  debounceTime?: number;
  resultListLabel?: string;
};

const props = withDefaults(defineProps<Props>(), {
  baseClass: "autocomplete",
  autoSelect: false,
  getResultValue: (result: any) => result.toString(),
  defaultValue: "",
  debounceTime: 0,
});

const emit = defineEmits(["select", "update"]);

function onUpdate() {
  emit("update", results.value, selectedIndex.value);
}

let updateOnInput = (val: string) => updateResults(val);

if (props.debounceTime > 0) {
  updateOnInput = debounce(updateOnInput, props.debounceTime);
}

const resultListId = `autocomplete-result-list-${++idCounter}`;

const rootElement = ref(null as null | HTMLDivElement);
const inputElement = ref(null as null | HTMLInputElement);
const resultListElement = ref(null as null | HTMLUListElement);

const value = ref(props.defaultValue);
// watch(
//   () => props.defaultValue,
//   (newValue, oldValue) => {
//     if (newValue == oldValue) return;
//     value.value = newValue;
//     emit("select", value.value, undefined); //This might change in the future. Providing a new value may just open the popup
//     hideResults();
//   }
// );

function reset() {
  value.value = "";
  emit("select", value.value, undefined);
  hideResults();
}

defineExpose({
  reset,
});

const results = ref([] as any[]);
const selectedIndex = ref(-1);
const expanded = ref(false);
const loading = ref(false);
const position = ref("below");
const resetPosition = ref(true);

onMounted(() => {
  document.body.addEventListener("click", handleDocumentClick);
});

onBeforeUnmount(() => {
  document.body.removeEventListener("click", handleDocumentClick);
});

onUpdated(() => {
  if (!inputElement.value || !resultListElement.value) {
    return;
  }
  if (resetPosition.value && results.value.length > 0) {
    resetPosition.value = false;
    position.value = getRelativePosition(
      inputElement.value,
      resultListElement.value
    );
  }
  checkSelectedResultVisible(resultListElement.value);
});

// Make sure selected result isn't scrolled out of view
function checkSelectedResultVisible(resultsElement: HTMLElement) {
  const selectedResultElement = resultsElement.querySelector(
    `[data-result-index="${selectedIndex.value}"]`
  );
  if (!selectedResultElement) {
    return;
  }

  const resultsPosition = resultsElement.getBoundingClientRect();
  const selectedPosition = selectedResultElement.getBoundingClientRect();

  if (selectedPosition.top < resultsPosition.top) {
    // Element is above viewable area
    resultsElement.scrollTop -= resultsPosition.top - selectedPosition.top;
  } else if (selectedPosition.bottom > resultsPosition.bottom) {
    // Element is below viewable area
    resultsElement.scrollTop +=
      selectedPosition.bottom - resultsPosition.bottom;
  }
}

function handleDocumentClick(event: MouseEvent) {
  if (!rootElement.value!.contains(event.target as Element)) {
    hideResults();
  }
}

function handleInput(event: Event) {
  value.value = ((event as InputEvent).target as HTMLInputElement).value;
  emit("select", value.value, undefined);
  updateOnInput(value.value);
}

function handleKeyDown(event: KeyboardEvent) {
  const { key } = event;

  switch (key) {
    case "Up": // IE/Edge
    case "Down": // IE/Edge
    case "ArrowUp":
    case "ArrowDown": {
      event.preventDefault();
      handleArrows(
        key === "ArrowUp" || key === "Up"
          ? selectedIndex.value - 1
          : selectedIndex.value + 1
      );
      break;
    }
    //case "Tab": {
    //  selectResult();
    //  break;
    //}
    case "Enter": {
      //const isListItemSelected = !!(event.target as Element).getAttribute(
      //  "aria-activedescendant"
      //)?.length;
      if (expanded.value) {
        event.preventDefault();
        event.stopPropagation();
      }
      if (selectedIndex.value > -1) {
        selectResult();
      }
      break;
    }
    case "Esc": // IE/Edge
    case "Escape": {
      hideResults();
      break;
    }
  }
}

function handleArrows(selIndex: number) {
  // Loop selectedIndex back to first or last result if out of bounds
  const resultsCount = results.value.length;
  selectedIndex.value =
    ((selIndex % resultsCount) + resultsCount) % resultsCount;

  // Update results and aria attributes
  onUpdate();
}

function handleFocus(event: FocusEvent) {
  const { value } = event.target as HTMLInputElement;
  updateResults(value);
}

function handleResultClick(event: MouseEvent) {
  const target = event.target as Element;
  const result = target.closest("[data-result-index]");
  if (result) {
    selectedIndex.value = parseInt(
      (result as HTMLElement).dataset.resultIndex ?? "-1",
      10
    );
    selectResult();
  }
}

function selectResult() {
  const selectedResult = results.value[selectedIndex.value];
  if (selectedResult) {
    value.value = props.getResultValue(selectedResult);
  }
  emit("select", value.value, selectedResult);
  hideResults();
}

let searchCounter = 0;

function updateResults(value: string) {
  const currentSearch = ++searchCounter;
  loading.value = true;

  function onSearchResult(res: any[]) {
    if (currentSearch !== searchCounter) {
      return;
    }
    results.value = res;
    loading.value = false;
    if (results.value.length === 0) {
      hideResults();
      return;
    }
    selectedIndex.value = props.autoSelect ? 0 : -1;
    onUpdate();
    expanded.value = true;
  }

  const searchResponse = props.search(value);

  if ("then" in searchResponse) {
    searchResponse.then(onSearchResult);
  } else {
    onSearchResult(searchResponse);
  }
}

function hideResults() {
  selectedIndex.value = -1;
  results.value = [];
  onUpdate();
  expanded.value = false;
  resetPosition.value = true;
}
</script>

<style>
.autocomplete-input {
  border: 1px solid #eee;
  border-radius: 8px;
  width: 100%;
  padding: 12px 12px 12px 48px;
  box-sizing: border-box;
  position: relative;
  font-size: 16px;
  line-height: 1.5;
  flex: 1;
  background-color: #eee;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNjY2IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTEiIGN5PSIxMSIgcj0iOCIvPjxwYXRoIGQ9Ik0yMSAyMWwtNC00Ii8+PC9zdmc+");
  background-repeat: no-repeat;
  background-position: 12px center;
}

.autocomplete-input:focus,
.autocomplete-input[aria-expanded="true"] {
  border-color: rgba(0, 0, 0, 0.12);
  background-color: #fff;
  outline: none;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.16);
}

[data-position="below"] .autocomplete-input[aria-expanded="true"] {
  border-bottom-color: transparent;
  border-radius: 8px 8px 0 0;
}

[data-position="above"] .autocomplete-input[aria-expanded="true"] {
  border-top-color: transparent;
  border-radius: 0 0 8px 8px;
  z-index: 2;
}

/* Loading spinner */
.autocomplete[data-loading="true"]::after {
  content: "";
  border: 3px solid rgba(0, 0, 0, 0.12);
  border-right: 3px solid rgba(0, 0, 0, 0.48);
  border-radius: 100%;
  width: 20px;
  height: 20px;
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  animation: rotate 1s infinite linear;
}

.autocomplete-result-list {
  margin: 0;
  border: 1px solid rgba(0, 0, 0, 0.12);
  padding: 0;
  box-sizing: border-box;
  max-height: 296px;
  overflow-y: auto;
  background: #fff;
  list-style: none;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.16);
}

[data-position="below"] .autocomplete-result-list {
  margin-top: -1px;
  border-top-color: transparent;
  border-radius: 0 0 8px 8px;
  padding-bottom: 8px;
}

[data-position="above"] .autocomplete-result-list {
  margin-bottom: -1px;
  border-bottom-color: transparent;
  border-radius: 8px 8px 0 0;
  padding-top: 8px;
}

/* Single result item */
.autocomplete-result {
  cursor: default;
  padding: 12px 12px 12px 48px;
  background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjY2NjIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGNpcmNsZSBjeD0iMTEiIGN5PSIxMSIgcj0iOCIvPjxwYXRoIGQ9Ik0yMSAyMWwtNC00Ii8+PC9zdmc+");
  background-repeat: no-repeat;
  background-position: 12px center;
}

.autocomplete-result:hover,
.autocomplete-result[aria-selected="true"] {
  background-color: rgba(0, 0, 0, 0.06);
}

@keyframes rotate {
  from {
    transform: translateY(-50%) rotate(0deg);
  }
  to {
    transform: translateY(-50%) rotate(359deg);
  }
}
</style>
