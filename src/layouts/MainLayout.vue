//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// MainLayout.vue
//
// Main application layout with page container
//
// Author: Tavis Hord - tavis@sideburn.com
// Created 11/12/24
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

<template>
  <q-layout view="lHh Lpr lFf" v-if="allPagesLoaded">
    <q-page-container class="q-pb-md">
      <!-- <router-view v-slot="{ Component }">
        <transition
          :enter-active-class="transitionClasses.enter"
          :leave-active-class="transitionClasses.leave"
          :duration="300"
        >
          <component :is="Component" />
        </transition>
      </router-view> -->
      <router-view />
    </q-page-container>
    <BottomTabBar :items="NavLinks" />
  </q-layout>
  <div v-else class="loading-container">
    <div class="loading-content">
      <q-spinner size="50px" color="primary" />
      <div class="loading-text">Loading...</div>
    </div>
  </div>

  <!-- Preload all pages (hidden) -->
  <div v-show="false" class="preload-container">
    <component
      v-for="route in preloadRoutes"
      :key="route.path"
      :is="route.component"
      @vue:mounted="onComponentLoaded"
    />
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useRoute } from "vue-router";
import BottomTabBar from "components/BottomTabBar.vue";

// Import all of the page components for preload
import IndexPage from "pages/IndexPage.vue";
import JourneysPage from "pages/JourneysPage.vue";
import SequencerPage from "pages/SequencerPage.vue";
import RandomizerPage from "pages/RandomizerPage.vue";

const linksList = [
  {
    title: "Home",
    caption: "Home Page",
    icon: "home",
    link: "/",
  },
  {
    title: "Journeys",
    caption: "Select a Journey",
    icon: "auto_awesome",
    link: "/journeys",
  },
  {
    title: "Sequencer",
    caption: "Sequencer",
    icon: "menu_open",
    link: "/sequencer",
  },
  {
    title: "Randomizer",
    caption: "Sliders and stuff",
    icon: "tune",
    link: "/randomizer",
  },
  {
    title: "Gridlights",
    caption: "Powered by Gridlights",
    icon: "code",
    link: "https://www.gridlights.co",
  },
];

export default defineComponent({
  name: "MainLayout",

  components: {
    BottomTabBar,
    IndexPage,
    JourneysPage,
    SequencerPage,
    RandomizerPage,
  },

  setup() {
    const $q = useQuasar();
    const leftDrawerOpen = ref(false);
    const route = useRoute();
    const lastPath = ref(route.path);
    const allPagesLoaded = ref(false);
    const loadedComponents = ref(new Set());

    // Define routes to preload
    const preloadRoutes = [
      { path: "/", component: IndexPage },
      { path: "/journeys", component: JourneysPage },
      { path: "/sequencer", component: SequencerPage },
      { path: "/randomizer", component: RandomizerPage },
    ];

    //transition classes based on navigation direction
    const transitionClasses = ref({
      enter: "animated slideInRight",
      leave: "animated slideOutLeft",
    });

    // Handle component loading
    const onComponentLoaded = () => {
      loadedComponents.value.add(Date.now()); // Use timestamp to ensure uniqueness

      // Check if all components are loaded
      if (loadedComponents.value.size >= preloadRoutes.length) {
        setTimeout(() => {
          allPagesLoaded.value = true;
        }, 100); // Small delay to ensure everything is settled
      }
    };

    // watch route changes to control slide direction
    watch(
      () => route.path,
      (newPath) => {
        const currentIndex = linksList.findIndex(
          (link) => link.link === newPath
        );
        const lastIndex = linksList.findIndex(
          (link) => link.link === lastPath.value
        );

        if (currentIndex > lastIndex) {
          // slide right
          transitionClasses.value = {
            enter: "animated slideInRight",
            leave: "animated slideOutLeft",
          };
        } else {
          // slide left
          transitionClasses.value = {
            enter: "animated slideInLeft",
            leave: "animated slideOutRight",
          };
        }

        lastPath.value = newPath;
      }
    );

    onMounted(() => {
      $q.dark.set(true);

      // Fallback: if components don't trigger mounted events, show after timeout
      setTimeout(() => {
        if (!allPagesLoaded.value) {
          allPagesLoaded.value = true;
        }
      }, 2000);
    });

    return {
      NavLinks: linksList,
      leftDrawerOpen,
      transitionClasses,
      allPagesLoaded,
      preloadRoutes,
      onComponentLoaded,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>

<style>
/* global styles to override Quasar defaults */
.q-header {
  height: auto !important;
}

.q-toolbar {
  min-height: 48px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

.q-toolbar__title {
  font-size: 18px;
}

.animated {
  animation-duration: 300ms;
  animation-fill-mode: both;
  position: absolute;
  width: 100%;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  overflow: hidden;
}

.slideInRight {
  animation-name: slideInRight;
  z-index: 1;
}

.slideOutLeft {
  animation-name: slideOutLeft;
  z-index: 0;
}

.slideInLeft {
  animation-name: slideInLeft;
  z-index: 1;
}

.slideOutRight {
  animation-name: slideOutRight;
  z-index: 0;
}

/* Loading container styles */
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #121212;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-text {
  color: #ffffff;
  font-size: 16px;
  opacity: 0.8;
}

.preload-container {
  position: absolute;
  top: -9999px;
  left: -9999px;
  opacity: 0;
  pointer-events: none;
}

/* Layout styles */
.q-page-container {
  position: relative;
  min-height: calc(100vh - 60px);
}

.q-layout {
  min-height: 100vh;
  min-height: -webkit-fill-available;
}

/* Force hardware acceleration for smoother animations */
.q-layout,
.q-page-container,
.animated {
  transform: translateZ(0);
  backface-visibility: hidden;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slideOutLeft {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
}
</style>

<style scoped>
.logo-container {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  max-width: 130%;
  max-height: 130%;
  margin-right: 20px;
  object-fit: contain;
}

.safe-header {
  padding-top: env(safe-area-inset-top);
}
</style>
