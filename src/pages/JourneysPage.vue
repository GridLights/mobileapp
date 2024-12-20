<template>
  <q-page padding>
    <div class="q-pa-md">
      <h1 class="text-h4 q-mb-md">Journeys</h1>

      <q-list
        bordered
        class="rounded-borders q-mb-md"
        style="width: 100%; max-height: 200px; overflow-y: auto"
      >
        <q-item
          v-for="(item, index) in journeyList"
          :key="index"
          clickable
          @click="selectItem(item.id)"
          :class="{
            'selected-item': selectedItemId === item.id,
          }"
        >
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </q-list>

      <q-card v-if="selectedItem" class="q-mb-md">
        <q-card-section>
          <div class="text-h5 q-mb-md">{{ selectedItem.label }}</div>
          <div class="journey-list">
            <div
              v-for="(step, index) in selectedItem.steps"
              :key="index"
              class="journey-line"
            >
              •
              {{
                `Effect: ${step.effectName} - Duration: ${step.duration} minutes`
              }}
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Save Button -->
      <div class="grid-item col-span-3 button-container mt-4">
        <q-btn label="Start Journey" color="primary" @click="startJourney" />
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted } from "vue";

import setEffect from "../utils/utils";
import webservices from "../webservices";

// import {} from 'pages'

export default {
  name: "JourneysPage",
  setup() {
    const selectedItemId = ref(null);
    const activeTimeout = ref(null); // To track the active timeout
    const journey = ref([]);
    const isRunning = ref(false);

    onMounted(() => {
      resumeJourney();
    });

    const startJourney = () => {
      console.log("starting journey");
      if (isRunning.value) {
        console.log("cancelling journey");
        cancelJourney(); // Cancel any existing journey
      }
      // runSchedule(selectedItem?.value.content);
      console.log(
        "Setting journey value to:",
        JSON.stringify(selectedItem.value.steps, null, 2)
      );
      journey.value = selectedItem.value.steps;
      localStorage.setItem("journey", JSON.stringify(journey.value));
      startNextEffect(0);
      isRunning.value = true;
      // localStorage.setItem("ipAddress", ipAddress.value);
    };

    const startNextEffect = (index) => {
      console.log(`Starting journey step #${index}`);
      if (index >= journey.value.length) {
        console.log("Finishing journey.");
        // finishJourney();
        return; // End of journey
      }

      const { effectId, duration, effectName } = journey.value[index];
      const durationInMilliseconds = duration * 60 * 1000; // Convert minutes to milliseconds
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
          // Re-send the command for the current step
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

    // const updateScheduleData = ({schedule, effectId, remainingTime}) => {
    //   localStorage.setItem('schedule', JSON.stringify(schedule));
    //   localStorage.setItem('currentEffect', effectId);
    //   localStorage.setItem('remainingTime', remainingTime); // in milliseconds
    // }

    // const runSchedule = (journeySteps) => {
    //   let totalTime = 0;

    //   // Store the program in storage so refreshing doesn't re-set the schedule
    //   updateSchedule({schedule})

    //   journeySteps.forEach(({ effectId, duration }) => {
    //     setTimeout(
    //       () => setEffect(effectId, 50, webservices),
    //       totalTime * 60 * 1000
    //     ); // freqValue set to 50
    //     console.log(
    //       `Effect ${effectId} scheduled for ${totalTime} minutes from now.`
    //     );
    //     totalTime += duration;
    //   });

    //   console.log("Scheduled all effects");
    // };

    return {
      journeyList,
      selectedItemId,
      selectedItem,
      selectItem,
      startJourney,
      // runSchedule,
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
</style>
