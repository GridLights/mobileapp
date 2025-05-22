//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// BottomTabBar.vue // // Bottom navigation tab bar for mobile view
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
<template>
  <q-footer class="bg-grey-8">
    <q-tabs
      modelValue="tab"
      class="text-white"
      active-color="amber-6"
      indicator-color="amber-"
      align="justify"
      narrow-indicator
    >
      <q-route-tab
        v-for="item in navigationItems"
        :key="item.title"
        :to="item.link"
        :icon="item.icon"
        :label="item.title"
        exact
        :ripple="false"
      />
    </q-tabs>
    <div class="safe-area-bottom" />
  </q-footer>
</template>

<script>
import { defineComponent, computed } from "vue";

export default defineComponent({
  name: "BottomTabBar",

  props: {
    items: {
      type: Array,
      required: true,
    },
  },

  setup(props) {
    // filter out web links for bottom button bar
    const navigationItems = computed(() => {
      return props.items.filter((item) => item.link.startsWith("/"));
    });

    return {
      navigationItems,
    };
  },
});
</script>

<style scoped>
:deep(.q-footer) {
  height: 52px !important;
}

:deep(.q-tabs) {
  height: 52px !important;
  min-height: 52px !important;
  padding-top: 4px !important; /* shift bottom buttons down */
}

:deep(.q-tab) {
  height: 48px !important;
  min-height: 48px !important;
  padding: 0 !important;
}

:deep(.q-tab__icon) {
  font-size: 20px;
}

:deep(.q-tab__label) {
  font-size: 11px;
  line-height: 1;
}

:deep(.q-tab--inactive) {
  opacity: 0.6;
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
