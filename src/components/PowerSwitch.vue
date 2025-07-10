<template>
  <button
    @click="togglePower"
    :disabled="disabled"
    :aria-label="isOn ? 'Turn off' : 'Turn on'"
    class="power-button"
    :class="{ 'power-on': isOn, 'power-off': !isOn }"
  >
    <q-icon :name="currentIcon" :size="iconSize" color="white" />
  </button>
</template>

<script>
export default {
  name: "PowerSwitch",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    size: {
      type: [String, Number],
      default: 32,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "toggle"],
  computed: {
    isOn() {
      return this.modelValue;
    },
    currentIcon() {
      // Using the same icon but different colors for on/off states
      return "power_settings_new";
    },
    iconSize() {
      // Convert size to appropriate format for q-icon (slightly smaller than button)
      const size =
        typeof this.size === "number"
          ? this.size * 0.6
          : parseInt(this.size) * 0.6;
      return `${size}px`;
    },
    buttonSize() {
      // Button size for the circular background
      return typeof this.size === "number" ? `${this.size}px` : this.size;
    },
  },
  methods: {
    togglePower() {
      if (this.disabled) return;

      const newValue = !this.isOn;
      this.$emit("update:modelValue", newValue);
      this.$emit("toggle", newValue);
    },
  },
};
</script>

<style scoped>
.power-button {
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: v-bind(buttonSize);
  height: v-bind(buttonSize);
  transition: all 0.3s ease;
}

.power-button.power-on {
  background-color: #4caf50; /* Green when on */
}

.power-button.power-off {
  background-color: #9e9e9e; /* Grey when off */
}

.power-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* .power-button:hover:not(:disabled) {
  transform: scale(1.05);
} */
</style>
