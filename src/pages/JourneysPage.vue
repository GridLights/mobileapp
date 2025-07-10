<template>
  <q-page class="no-text-select">
    <!-- Fixed Header Container -->
    <div class="header-container">
      <!-- Left Icon -->
      <!-- <div class="header-icon left-icon">
        <img src="../assets/star.svg" alt="Star" width="24" height="24" />
      </div> -->

      <!-- Center Text -->
      <div class="header-title">LIGHT JOURNEYS</div>

      <!-- Right Icon -->
      <div class="header-icon right-icon">
        <q-icon name="filter_list" size="24px" color="grey-7" />
      </div>
    </div>

    <!-- Scrollable Content Area -->
    <div class="content-area">
      <!-- journey content goes here -->
      <div class="content-padding">
        <SolExpansionItem
          title="Expand"
          icon="auto_awesome"
          :journey-active="true"
          caption="Expand your consciousness with flowing, ethereal light patterns that evolve from subtle beginnings to vibrant cosmic displays."
          description="Expand your consciousness with flowing, ethereal light patterns that evolve from subtle beginnings to vibrant cosmic displays."
          :journey-items="[
            {
              name: 'Awakening',
              duration: '5m',
              description: 'Gentle warm-up with soft breathing lights',
            },
            {
              name: 'Rising',
              duration: '10m',
              description: 'Building energy with dynamic patterns',
            },
            {
              name: 'Expansion',
              duration: '15m',
              description: 'Full immersion in cosmic light displays',
            },
          ]"
          @journey-start="handleJourneyStart"
        />
      </div>
      <div class="content-padding">
        <SolExpansionItem
          title="Relax"
          icon="waves"
          :journey-active="false"
          caption="Unwind with soothing ocean-inspired light patterns that promote deep relaxation and stress relief."
          description="Unwind with soothing ocean-inspired light patterns that promote deep relaxation and stress relief."
          :journey-items="[
            {
              name: 'Relax 1',
              duration: '1m',
              description: 'test 1 warm-up with soft breathing lights',
            },
            {
              name: 'Relax 2',
              duration: '2m',
              description: 'Test 2 energy with dynamic patterns',
            },
            {
              name: 'Relax 3',
              duration: '3m',
              description: 'Test 3 immersion in cosmic light displays',
            },
          ]"
          @journey-start="handleJourneyStart"
        />
      </div>
      <div class="content-padding">
        <SolExpansionItem
          title="Dreamscape"
          icon="dark_mode"
          :journey-active="false"
          caption="Drift into peaceful slumber with gentle , dream-like patterns that gradually fade to darkness."
          description="Drift into peaceful slumber with gentle , dream-like patterns that gradually fade to darkness."
          :journey-items="[
            {
              name: 'Dreamscape 1',
              duration: '1m',
              description: 'test 1 warm-up with soft breathing lights',
            },
            {
              name: 'Dreamscape 2',
              duration: '2m',
              description: 'Test 2 energy with dynamic patterns',
            },
            {
              name: 'Dreamscape 3',
              duration: '3m',
              description: 'Test 3 immersion in cosmic light displays',
            },
          ]"
          @journey-start="handleJourneyStart"
        />
      </div>
      <div class="content-padding">
        <SolExpansionItem
          title="Morning Rise"
          icon="wb_sunny"
          :journey-active="false"
          caption="Start your day right with sunrise inspired patterns that naturally boost alertness and energy."
          description="Start your day right with sunrise inspired patterns that naturally boost alertness and energy."
          :journey-items="[
            {
              name: 'Morning Rise 1',
              duration: '1m',
              description: 'test 1 warm-up with soft breathing lights',
            },
            {
              name: 'Morning Rise 2',
              duration: '2m',
              description: 'Test 2 energy with dynamic patterns',
            },
            {
              name: 'Morning Rise 3',
              duration: '3m',
              description: 'Test 3 immersion in cosmic light displays',
            },
          ]"
          @journey-start="handleJourneyStart"
        />
      </div>
      <div class="content-padding">
        <SolExpansionItem
          title="Activate"
          icon="bolt"
          :journey-active="false"
          caption="Energize your space with dynamic high-energy pattern designed to boost focus and motivation."
          description="Energize your space with dynamic high-energy pattern designed to boost focus and motivation."
          :journey-items="[
            {
              name: 'Activate 1',
              duration: '1m',
              description: 'test 1 warm-up with soft breathing lights',
            },
            {
              name: 'Activate 2',
              duration: '2m',
              description: 'Test 2 energy with dynamic patterns',
            },
            {
              name: 'Activate 3',
              duration: '3m',
              description: 'Test 3 immersion in cosmic light displays',
            },
          ]"
          @journey-start="handleJourneyStart"
        />
      </div>
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

  components: {
    SolExpansionItem,
  },

  methods: {
    handleJourneyStart(data) {
      // data = { item, index, journeyType }
      console.log("Started:", data.journeyType, data.item.title);
    },
  },

  setup() {
    const selectedItemId = ref(null);
    const activeTimeout = ref(null);
    const journey = ref([]);
    const isRunning = ref(false);

    onMounted(() => {
      resumeJourney();
    });

    const startJourney = () => {
      console.log("starting journey");
      if (isRunning.value) {
        console.log("cancelling journey");
        cancelJourney();
      }
      console.log(
        "Setting journey value to:",
        JSON.stringify(selectedItem.value.steps, null, 2)
      );
      journey.value = selectedItem.value.steps;
      localStorage.setItem("journey", JSON.stringify(journey.value));
      startNextEffect(0);
      isRunning.value = true;
    };

    const startNextEffect = (index) => {
      console.log(`Starting journey step #${index}`);
      if (index >= journey.value.length) {
        console.log("Finishing journey.");
        return;
      }

      const { effectId, duration, effectName } = journey.value[index];
      const durationInMilliseconds = duration * 60 * 1000;
      const endTime = Date.now() + durationInMilliseconds;
      localStorage.setItem("currentIndex", index);
      localStorage.setItem("endTime", endTime);

      setEffect(effectId, 50, webservices);

      console.log(`effect ${effectName} for ${duration} minute`);
      console.log(`endTime ${endTime}`);

      activeTimeout.value = setTimeout(() => {
        startNextEffect(index + 1);
      }, durationInMilliseconds);
    };

    const cancelJourney = () => {
      console.log("cancelling journey");
      if (activeTimeout.value) {
        clearTimeout(activeTimeout.value);
        activeTimeout.value = null;
      }
      isRunning.value = false;
    };

    const finishJourney = () => {
      cancelJourney();
      localStorage.removeItem("journey");
      localStorage.removeItem("currentIndex");
      localStorage.removeItem("endTime");
      console.log("Journey finished.");
    };

    const resumeJourney = () => {
      console.log("resuming journey");
      const savedJourney = localStorage.getItem("journey");
      const savedIndex = localStorage.getItem("currentIndex");
      const savedEndTime = localStorage.getItem("endTime");

      console.log(savedJourney);

      if (savedJourney && savedIndex !== null && savedEndTime) {
        console.log("found running journey");
        try {
          journey.value = JSON.parse(savedJourney);
        } catch (err) {
          console.log(err);
        }
        const index = parseInt(savedIndex, 10);
        const remainingTime = Math.max(0, savedEndTime - Date.now());

        console.log(`remaining time on step ${savedIndex}: ${remainingTime}`);

        if (remainingTime > 0) {
          const { effectId, effectName } = journey.value[index];
          console.log(
            `Resuming effect ${effectName} for remaining time: ${remainingTime}ms`
          );

          setEffect(effectId, 50, webservices);

          activeTimeout.value = setTimeout(() => {
            startNextEffect(index + 1);
          }, remainingTime);
        } else {
          startNextEffect(index + 1);
        }
      } else {
        console.log("no current journey");
      }
    };

    const expandJourneySteps = [
      {
        effectName: "Infinite",
        effectId: "12",
        duration: 1,
      },
      {
        effectName: "Aura",
        effectId: "49",
        duration: 1,
      },
      {
        effectName: "StarSpin",
        effectId: "42",
        duration: 1,
      },
    ];

    const relaxJourneySteps = [
      {
        effectName: "Calm",
        effectId: "88",
        duration: 10,
      },
      {
        effectName: "Sesh",
        effectId: "28",
        duration: 42,
      },
      {
        effectName: "ChillSpin",
        effectId: "54",
        duration: 30,
      },
    ];

    const activateJourneySteps = [
      {
        effectName: "Refresh",
        effectId: "152",
        duration: 33,
      },
      {
        effectName: "Revitalize",
        effectId: "182",
        duration: 69,
      },
      {
        effectName: "Renew",
        effectId: "112",
        duration: 22,
      },
    ];

    const journeyList = [
      {
        id: 1,
        label: "Expand",
        steps: expandJourneySteps,
      },
      {
        id: 2,
        label: "Relax",
        steps: relaxJourneySteps,
      },
      {
        id: 3,
        label: "Activate",
        steps: activateJourneySteps,
      },
    ];

    const selectedItem = computed(() =>
      journeyList.find((item) => item.id === selectedItemId.value)
    );

    const selectItem = (id) => {
      selectedItemId.value = id;
    };

    return {
      journeyList,
      selectedItemId,
      selectedItem,
      selectItem,
      startJourney,
    };
  },
};
</script>

<style scoped>
.q-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 90px); /* Account for bottom nav */
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

.journey-item {
  margin-bottom: 1rem;
  width: 300px;
}

.journey-line {
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace;
  font-size: 14px;
  white-space: pre-wrap;
  -webkit-font-smoothing: antialiased;
}

.journey-line:hover {
  background-color: #e0e0e0;
}

.selected-item {
  background-color: rgba(0, 0, 0, 0.1);
}

.selected-journey-details {
  margin-top: 20px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  width: 300px;
}

.step-item {
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.start-button {
  margin-top: 15px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.start-button:hover {
  background-color: #0056b3;
}
</style>
