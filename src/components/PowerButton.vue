<template>
  <button
    @click="togglePower"
    :disabled="disabled"
    :aria-label="isOn ? 'Turn off' : 'Turn on'"
  >
    <img
      :src="currentIcon"
      :alt="isOn ? 'Power On' : 'Power Off'"
      :width="size"
      :height="size"
    />
  </button>
</template>

<script>
import powerOnIcon from "../assets/powerOn.png";
import powerOffIcon from "../assets/powerOff.png";

export default {
  name: "PowerButton",
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    size: {
      type: [String, Number],
      default: 48,
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
      return this.isOn ? powerOnIcon : powerOffIcon;
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
button {
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

button:disabled {
  cursor: not-allowed;
}
</style>
