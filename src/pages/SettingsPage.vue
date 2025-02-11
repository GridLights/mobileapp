<template>
  <q-page padding>
    <div class="no-text-select q-pa-md safe-header">
      <h1 class="text-h4 q-mb-md">Settings</h1>
      <q-separator class="q-mb-lg"></q-separator>
      <p class="label-font">IP Address:</p>
      <q-input
        id="ipAddress"
        v-model="ipAddress"
        type="text"
        filled
        style="width: 100%"
        @update:model-value="validateIpAddress"
      >
        <template v-slot:prepend>
          <span>http://</span>
        </template>
      </q-input>
    </div>
    <!-- Save Button -->
    <div class="q-pl-md mt-4">
      <q-btn
        flat
        dark
        :ripple="false"
        class="custom-btn"
        :style="{ backgroundColor: '#5e5e5e' }"
        label="Save"
        @click="saveIpAddress"
      />
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from "vue";

export default {
  name: "SettingsPage",
  setup() {
    const ipAddress = ref("4.3.2.1");

    // Load IP Address from local storage on page reload
    onMounted(() => {
      const savedIp = localStorage.getItem("ipAddress");
      if (savedIp) {
        ipAddress.value = savedIp;
      }
    });

    const saveIpAddress = () => {
      console.log("Saved IP Address: http://" + ipAddress.value);
      localStorage.setItem("ipAddress", ipAddress.value);
    };

    const validateIpAddress = (value) => {
      const validIpPattern = /^\d{0,3}(\.\d{0,3}){0,3}$/;
      if (validIpPattern.test(value)) {
        ipAddress.value = value;
      }
    };

    return {
      ipAddress,
      saveIpAddress,
      validateIpAddress,
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

.grid-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
  width: 100%;
  max-width: 350px;
  margin: 0 auto;
}

.input-container {
  text-align: center;
}

.button-container {
  display: flex;
  justify-content: center;
}
</style>
