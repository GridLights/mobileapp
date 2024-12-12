<template>
  <q-page padding>
    <div class="q-pa-md">
      <h1 class="text-h4 q-mb-md">Journeys</h1>

      <q-list
        bordered
        class="rounded-borders q-mb-md"
        style="width: 100%; max-height: 200px; overflow-y: auto"
      >
        <q-item
          v-for="(item, index) in journeyItems"
          :key="index"
          clickable
          @click="selectItem(item.id)"
          :class="{
            'selected-item': selectedItemId === item.id,
          }"
        >
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </q-list>

      <q-card v-if="selectedItem" class="q-mb-md">
        <q-card-section>
          <div class="text-h5 q-mb-md">{{ selectedItem.label }}</div>
          <div class="journey-list">
            <div
              v-for="(line, index) in selectedItem.content"
              :key="index"
              class="journey-line"
            >
              • {{ line }}
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { ref, computed } from "vue";

export default {
  name: "JourneysPage",
  setup() {
    const selectedItemId = ref(null);

    const journeyItems = [
      {
        id: 1,
        label: "Expand",
        content: ["Expand One   - 10 minutes", "Expand Two   - 15 minutes"],
      },
      {
        id: 2,
        label: "Relax",
        content: [
          "Relax One   - 11 minutes",
          "Relax Two   - 420 minutes",
          "Relax Three - 777 minutes",
        ],
      },
      {
        id: 3,
        label: "Journey",
        content: ["Journey One - 10 minutes", "Journey Two - 15 minutes"],
      },
    ];

    const selectedItem = computed(() =>
      journeyItems.find((item) => item.id === selectedItemId.value)
    );

    const selectItem = (id) => {
      selectedItemId.value = id;
    };

    return {
      journeyItems,
      selectedItemId,
      selectedItem,
      selectItem,
    };
  },
};
</script>

<style scoped>
.selected-item {
  background-color: rgba(0, 0, 0, 0.1);
}

.journey-list {
  font-family: monospace;
  white-space: pre;
}

.journey-line {
  margin-bottom: 0.5rem;
}
</style>
