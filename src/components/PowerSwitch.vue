<template>
  <div class="power-switch-wrapper" :class="connectionStateClass">
    <button
      @click="togglePower"
      :disabled="disabled"
      :aria-label="isOn ? 'Turn off' : 'Turn on'"
      class="power-button"
      :class="{ 'power-on': isOn, 'power-off': !isOn }"
    >
      <q-icon :name="currentIcon" :size="iconSize" color="white" />
    </button>
  </div>
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
    connectionState: {
      type: String,
      default: "disconnected",
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
    wrapperSize() {
      // Wrapper size includes the 3px ring on each side
      const size = typeof this.size === "number" ? this.size : parseInt(this.size);
      return `${size + 6}px`;
    },
    connectionStateClass() {
      return `connection-${this.connectionState}`;
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
.power-switch-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: v-bind(wrapperSize);
  height: v-bind(wrapperSize);
  border: 3px solid;
  transition: border-color 0.3s ease;
}

/* Connection state colors */
.power-switch-wrapper.connection-connected {
  border-color: #4caf50; /* Green */
}

.power-switch-wrapper.connection-connecting,
.power-switch-wrapper.connection-reconnecting {
  border-color: #ff9800; /* Orange */
  animation: pulse 1.5s infinite;
}

.power-switch-wrapper.connection-failed {
  border-color: #f44336; /* Red */
}

.power-switch-wrapper.connection-disconnected {
  border-color: #9e9e9e; /* Grey */
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

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
