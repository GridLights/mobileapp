<template>
  <q-page class="no-text-select">
    <!-- Fixed Header Container -->
    <div class="header-container">
      <!-- Left Icon -->
      <!-- <div class="header-icon left-icon">
        <img src="../assets/star.svg" alt="Star" width="24" height="24" />
      </div> -->

      <!-- Center Text -->
      <div class="header-title">SEQUENCER</div>

      <!-- Right Icon -->
      <!-- <div class="header-icon right-icon">
        <q-icon name="filter_list" size="24px" color="grey-7" />
      </div> -->
    </div>

    <!-- Scrollable Content Area -->
    <div class="content-area">
      <!-- content goes here wrapped in content-padding divs -->
      <div class="content-padding"></div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from "vue";

import setEffect from "../utils/utils";
import webservices from "../webservices";
import SolExpansionItem from "src/components/SolExpansionItem.vue";

export default {
  name: "JourneysPage",

  components: {},

  methods: {},

  setup() {
    const selectedItemId = ref(null);

    return {
      selectedItemId,
    };
  },
};
</script>

<style scoped>
.q-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 90px);
  overflow: hidden;
  position: relative;
}

.content-padding {
  margin-top: 10px;
  padding: 0 20px 0px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
