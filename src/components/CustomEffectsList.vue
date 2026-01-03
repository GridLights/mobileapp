<!--
  CustomEffectsList.vue

  Example component demonstrating how to use custom WLED effects
  This can be integrated into any page to display and use custom effects
-->

<template>
  <div class="custom-effects-container">
    <div class="custom-effects-header">
      <h3>Custom Effects</h3>
      <q-btn
        flat
        dense
        icon="refresh"
        label="Re-analyze"
        @click="reanalyze"
        :loading="isLoading"
      />
    </div>

    <div v-if="error" class="error-message">
      <q-icon name="error" />
      <span>{{ error }}</span>
    </div>

    <div v-else-if="isLoading" class="loading-state">
      <q-spinner color="primary" size="40px" />
      <p>Analyzing device...</p>
    </div>

    <div v-else-if="!hasCustomEffects" class="no-effects">
      <q-icon name="info" size="32px" />
      <p>No custom effects found</p>
      <p class="sublabel">This device only has the default WLED effects</p>
    </div>

    <q-list v-else class="effects-list" bordered separator>
      <q-item
        v-for="effect in customEffects"
        :key="effect.id"
        clickable
        @click="applyEffect(effect)"
        :active="selectedEffectId === effect.id"
      >
        <q-item-section>
          <q-item-label>{{ effect.name }}</q-item-label>
          <q-item-label caption>Effect ID: {{ effect.id }}</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-badge color="primary" label="Custom" />
        </q-item-section>
      </q-item>
    </q-list>

    <div v-if="deviceInfo" class="device-info-footer">
      <q-separator />
      <div class="info-content">
        <div class="info-row">
          <span class="info-label">Device:</span>
          <span class="info-value">{{ deviceInfo.name }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Version:</span>
          <span class="info-value">{{ deviceInfo.version }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Total Effects:</span>
          <span class="info-value">{{ allEffects.length }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Custom Effects:</span>
          <span class="info-value">{{ customEffectCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useCurrentDeviceEffects } from "../utils/useWledEffects";
import webservices from "../webservices";

export default {
  name: "CustomEffectsList",

  setup() {
    const {
      customEffects,
      allEffects,
      deviceInfo,
      hasCustomEffects,
      customEffectCount,
      isLoading,
      error,
      analyzeDevice,
    } = useCurrentDeviceEffects();

    const selectedEffectId = ref(null);

    /**
     * Apply an effect to the WLED device
     */
    const applyEffect = (effect) => {
      // Use effect.id for UI selection (sequential ID)
      selectedEffectId.value = effect.id;

      // Use effect.effectId (or effect.id if effectId doesn't exist) for the actual WLED effect ID
      const wledEffectId =
        effect.effectId !== undefined ? effect.effectId : effect.id;

      console.log(
        `Applying custom effect: ${effect.name} (WLED Effect ID: ${wledEffectId})`
      );

      // Send command to WLED via WebSocket
      // seg must be an array containing segment objects
      // Use the actual WLED device effect ID
      webservices.sendCommandToWebSocket({
        seg: [{ fx: wledEffectId }],
      });
    };

    /**
     * Re-analyze the current device
     */
    const reanalyze = async () => {
      const savedIp = localStorage.getItem("ipAddress") || "4.3.2.1";
      try {
        await analyzeDevice(savedIp);
        console.log("Re-analysis complete");
      } catch (err) {
        console.error("Error during re-analysis:", err);
      }
    };

    return {
      customEffects,
      allEffects,
      deviceInfo,
      hasCustomEffects,
      customEffectCount,
      isLoading,
      error,
      selectedEffectId,
      applyEffect,
      reanalyze,
    };
  },
};
</script>

<style scoped>
.custom-effects-container {
  background-color: var(--controls-bg-color);
  border-radius: 8px;
  padding: 16px;
  max-width: 500px;
}

.custom-effects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.custom-effects-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--controls-label-color);
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #ffebee;
  border-radius: 4px;
  color: #c62828;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  gap: 16px;
}

.loading-state p {
  margin: 0;
  color: var(--controls-label-color);
}

.no-effects {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  text-align: center;
  color: var(--controls-icon-color);
}

.no-effects .q-icon {
  margin-bottom: 12px;
  opacity: 0.5;
}

.no-effects p {
  margin: 4px 0;
}

.no-effects .sublabel {
  font-size: 12px;
  opacity: 0.7;
}

.effects-list {
  background-color: var(--controls-input-field-bg-color);
  border-radius: 6px;
  overflow: hidden;
}

.effects-list .q-item {
  transition: background-color 0.2s ease;
}

.effects-list .q-item:hover {
  background-color: var(--controls-bg-color);
}

.effects-list .q-item.q-item--active {
  background-color: var(--controls-slider-bar--color);
}

.device-info-footer {
  margin-top: 16px;
}

.info-content {
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.info-label {
  color: var(--controls-icon-color);
  font-weight: 500;
}

.info-value {
  color: var(--controls-label-color);
  font-weight: 600;
}
</style>
