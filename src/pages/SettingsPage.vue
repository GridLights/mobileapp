<template>
  <q-page class="flex flex-col items-center">
    <div class="grid-container">
      <!-- Input Field with Label -->
      <div class="grid-item col-span-3 input-container">
        <label for="ipAddress" class="block text-center mb-2"
          >Enter IP Address</label
        >
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
      <div class="grid-item col-span-3 button-container mt-4">
        <q-btn label="Save" color="primary" @click="saveIpAddress" />
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref } from "vue";

export default {
  name: "SettingsPage",
  setup() {
    const ipAddress = ref("4.3.2.1");

    const saveIpAddress = () => {
      console.log("Saved IP Address: http://" + ipAddress.value);
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
