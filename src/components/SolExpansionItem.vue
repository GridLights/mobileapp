<template>
  <div class="expand-container" :class="{ collapsed: !expanded }">
    <div
      class="header-section"
      :class="{ expanded }"
      @click="toggleMainExpansion"
    >
      <div class="icon-container">
        <q-icon :name="icon" size="24px" color="grey-7" />
      </div>
      <div class="title-section">
        <div class="title-area">
          <h2 class="main-title" :class="{ 'no-journey': !journeyActive }">
            {{ title }}
          </h2>
          <div v-if="journeyActive" class="journey-status">Journey Active</div>
        </div>
        <q-icon
          name="keyboard_arrow_up"
          size="24px"
          color="grey-7"
          :class="{ rotated: !expanded }"
          class="expand-arrow"
        />
      </div>
    </div>

    <!-- Caption shown when collapsed -->
    <div class="collapsed-caption" :class="{ visible: !expanded }">
      {{ caption }}
    </div>

    <!-- Collapsible content with proper animation -->
    <div class="collapsible-content" :class="{ expanded }">
      <!-- Description -->
      <div class="description-section">
        <h3 class="section-title">Description</h3>
        <p class="description-text">
          {{ description }}
        </p>
      </div>

      <!-- Timeline with Quasar expansion items -->
      <div class="timeline-section">
        <h3 class="section-title">Timeline</h3>

        <div class="timeline-items">
          <div
            v-for="(item, index) in timelineItems"
            :key="index"
            class="timeline-item"
          >
            <div class="timeline-number">{{ index + 1 }}.</div>
            <div class="timeline-content">
              <div class="custom-expansion">
                <div class="expansion-header-content">
                  <div class="header-info">
                    <span class="stage-name"
                      >{{ item.name }} {{ item.duration }}</span
                    >
                    <span class="stage-description">{{
                      item.description
                    }}</span>
                    <!-- <div style="font-size: 10px; color: red">
                      DEBUG: {{ JSON.stringify(item) }}
                    </div> -->
                  </div>
                  <q-btn
                    unelevated
                    color="black"
                    text-color="white"
                    label="Start Journey"
                    class="start-btn"
                    size="sm"
                    @click="startJourney(item)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";

export default {
  name: "SolExpansionItem",

  props: {
    title: {
      type: String,
      default: "Expand",
    },
    icon: {
      type: String,
      default: "auto_awesome",
    },
    caption: {
      type: String,
      default:
        "Expand your consciousness with flowing, ethereal light patterns that evolve from subtle beginnings to vibrant cosmic displays.",
    },
    description: {
      type: String,
      default:
        "Expand your consciousness with flowing, ethereal light patterns that evolve from subtle beginnings to vibrant cosmic displays.",
    },
    journeyActive: {
      type: Boolean,
      default: false,
    },
    journeyItems: {
      type: Array,
      default: () => [
        {
          name: "Awakening",
          duration: "5m",
          description: "Gentle warm-up with soft breathing lights",
        },
        {
          name: "Rising",
          duration: "5m",
          description: "Gentle warm-up with soft breathing lights",
        },
        {
          name: "Expansion",
          duration: "5m",
          description: "Gentle warm-up with soft breathing lights",
        },
      ],
    },
  },

  emits: ["journey-start"],

  setup(props, { emit }) {
    const expanded = ref(false); // Start collapsed to show caption

    // Convert journey items to timeline items (no expansion needed)
    const timelineItems = computed(() => {
      return props.journeyItems.map((item) => ({
        ...item,
      }));
    });

    const toggleMainExpansion = () => {
      expanded.value = !expanded.value;
    };

    const startJourney = (item) => {
      console.log("Starting journey:", item.name);

      // Emit event with item details
      emit("journey-start", {
        item: item,
        journeyType: props.title,
      });
    };

    return {
      expanded,
      timelineItems,
      toggleMainExpansion,
      startJourney,
    };
  },
};
</script>

<style scoped>
.expand-container {
  width: 100%;
  padding: 20px;
  padding-top: 0px;
  background: #f5f5f5;
  border-radius: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-sizing: border-box;
  transition: padding 0.3s ease;
}

.expand-container.collapsed {
  padding: 0px 20px;
  padding-bottom: 20px;
}

.header-section {
  display: flex;
  align-items: center;
  margin-top: 0px;
  margin-bottom: 24px;
  cursor: pointer;
  user-select: none;
  width: 100%;
  min-width: 300px;
}

.collapsed-caption {
  font-size: 14px;
  line-height: 1.4;
  color: #555;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
}

.collapsed-caption.visible {
  max-height: 100px;
  opacity: 1;
}

.header-section:hover {
  opacity: 0.8;
}

.icon-container {
  width: 48px;
  height: 48px;
  background: #d0d0d0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  margin-top: 20px;
}

.title-section {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.main-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
}

.main-title.no-journey {
  margin-bottom: -20px;
}

.journey-status {
  font-size: 12px;
  font-weight: 500;
  color: #555;
  background: rgba(0, 0, 0, 0.1);
  padding: 0px 8px;
  border-radius: 12px;
  margin-top: -12px;
  align-self: flex-start;
  width: fit-content;
}

.expand-arrow {
  transition: transform 0.3s ease;
}

.expand-arrow.rotated {
  transform: rotate(180deg);
}

/* Main collapsible content animation */
.collapsible-content {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  transition: max-height 0.4s ease, opacity 0.3s ease;
}

.collapsible-content.expanded {
  max-height: 1000px; /* Adjust based on your content */
  opacity: 1;
}

.description-section {
  margin-bottom: 4px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 10px 0;
  color: #1a1a1a;
}

.description-text {
  font-size: 14px;
  line-height: 1.5;
  color: #555;
}

.timeline-section {
  margin-bottom: 16px;
}

.timeline-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.timeline-number {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-top: 8px;
  min-width: 24px;
}

.timeline-content {
  flex: 1;
}

:deep(.custom-expansion) {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 16px;
}

.expansion-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.stage-name {
  font-size: 14px;
  font-weight: 400;
  color: #1a1a1a;
}

.stage-description {
  font-size: 12px;
  color: #555;
}
.start-btn {
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 500;
  text-transform: none;
  flex-shrink: 0;
  align-self: flex-start;
}

/* Remove expansion-related styles since we're not using expansion items */

/* Remove the conflicting transition override */
:deep(.q-expansion-item__container) {
  /* Let Quasar handle its own transitions */
}
</style>
