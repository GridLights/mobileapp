<template>
  <q-page padding class="settings-page">
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
        class="ip-input"
      >
        <template v-slot:prepend>
          <span class="ip-prefix">http://</span>
        </template>
      </q-input>

      <div style="height:12px"></div>

      <p class="label-font">LED Color Order:</p>
      <q-select
        v-model="colorOrder"
        :options="colorOptions"
        filled
        style="width: 100%"
        class="color-order-select"
        emit-value
        map-options
      />
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
    const colorOrder = ref("RGB");
    const colorOptions = [
      { label: "RGB", value: "RGB" },
      { label: "BRG", value: "BRG" },
    ];

    // Load settings from local storage on page reload
    onMounted(() => {
      const savedIp = localStorage.getItem("ipAddress");
      if (savedIp) {
        ipAddress.value = savedIp;
      }

      const savedOrder = localStorage.getItem("ledColorOrder");
      if (savedOrder) {
        colorOrder.value = savedOrder;
      }
    });

    const saveIpAddress = () => {
      console.log("Saved IP Address: http://" + ipAddress.value);
      localStorage.setItem("ipAddress", ipAddress.value);
      console.log("Saved LED color order:", colorOrder.value);
      localStorage.setItem("ledColorOrder", colorOrder.value);
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
      colorOrder,
      colorOptions,
    };
  },
};
</script>

<style scoped>
/* Match app background color */
.settings-page {
  background-color: #eee !important;
}

.q-page {
  background-color: #eee !important;
  color: #000000;
}

h1 {
  color: #000000 !important;
}

p {
  color: #000000 !important;
}

.label-font {
  color: #000000 !important;
}

/* IP prefix styling */
.ip-prefix {
  color: #000000 !important;
}

/* Input field styling - black text */
.ip-input .q-field__input {
  color: #000000 !important;
}

.ip-input .q-field__native {
  color: #000000 !important;
}

.ip-input .q-field__prepend {
  color: #000000 !important;
}

.q-input__control {
  color: #000000 !important;
}

.q-field__input {
  color: #000000 !important;
  caret-color: #000000 !important;
}

.q-field__native {
  color: #000000 !important;
}

.q-field--filled .q-field__control {
  color: #000000 !important;
}

.q-field--filled .q-field__native,
.q-field--filled .q-field__input {
  color: #000000 !important;
}

.q-field--filled .q-field__prepend {
  color: #000000 !important;
}

/* Deep styling for Quasar components */
::v-deep .q-field__input {
  color: #000000 !important;
}

::v-deep .q-field__native {
  color: #000000 !important;
}

::v-deep .q-field--filled .q-field__control:before {
  border-color: #ddd;
}

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

/* Color order select should match the input styling */
.color-order-select ::v-deep .q-field__input {
  color: #000000 !important;
}

.color-order-select ::v-deep .q-field__native {
  color: #000000 !important;
}
</style>
