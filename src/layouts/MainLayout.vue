//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// MainLayout.vue
//
// Main application layout with page container
//
// Author: Tavis Hord - tavis@sideburn.com
// Created 11/12/24
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container class="q-pb-md transition-container">
      <div class="transition-wrapper">
        <router-view v-slot="{ Component, route }">
          <transition
            :name="getTransitionName(route)"
            :mode="getTransitionName(route) ? null : 'out-in'"
          >
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </div>
    </q-page-container>

    <!-- Bottom navigation as a footer -->
    <q-footer>
      <BottomTabBar :items="NavLinks" class="stable-bottom-nav" />
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useRoute } from "vue-router";
import BottomTabBar from "components/BottomTabBar.vue";


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
  },

  data() {
    return {
      previousRoutePath: null,
    };
  },

  setup() {
    const $q = useQuasar();
    const leftDrawerOpen = ref(false);
    const route = useRoute();
    const lastPath = ref(route.path);
    //transition classes based on navigation direction
    const transitionClasses = ref({
      enter: "animated slideInRight",
      leave: "animated slideOutLeft",
    });

    // Get transition classes based on route
    const getTransitionClasses = (currentRoute) => {
      // Special handling for settings page
      if (currentRoute.path === "/settings") {
        // Going TO settings - slide in from right
        return {
          enter: "animated slideInRight",
          leave: "animated slideOutLeft",
        };
      } else if (lastPath.value === "/settings") {
        // Coming FROM settings - slide in from left
        return {
          enter: "animated slideInLeft",
          leave: "animated slideOutRight",
        };
      }

      // Use existing logic for main navigation pages
      return transitionClasses.value;
    };

    // watch route changes to control slide direction
    watch(
      () => route.path,
      (newPath) => {
        // Skip transition calculation for settings page (handled in getTransitionClasses)
        if (newPath === "/settings" || lastPath.value === "/settings") {
          lastPath.value = newPath;
          return;
        }

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
    });

    return {
      NavLinks: linksList,
      leftDrawerOpen,
      transitionClasses,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },

  watch: {
    $route(newRoute, oldRoute) {
      this.previousRoutePath = oldRoute ? oldRoute.path : null;
    },
  },

  methods: {
    getTransitionName(route) {
      const currentPath = this.previousRoutePath;
      const newPath = route.path;

      // Going TO settings from any page
      if (newPath === "/settings" && currentPath !== "/settings") {
        return "slide-left";
      }
      // Going FROM settings to any page
      if (currentPath === "/settings" && newPath !== "/settings") {
        return "slide-right";
      }

      return "";
    },
  },
});
</script>

<style>
/* Work with existing page structure */
.transition-container {
  position: relative;
  overflow: hidden;
  height: calc(
    100vh - 0px
  ); /* to eliminate white gap at bottom of content area*/
}

/* Wrapper to contain transitions */
.transition-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* Stable bottom navigation */
.stable-bottom-nav {
  position: relative;
  z-index: 1002 !important;
  background-color: inherit;
}

/* Slide transitions for settings - constrain within wrapper */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease-in-out;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.slide-left-enter-active {
  z-index: 2;
}

.slide-left-leave-active {
  z-index: 1;
}

.slide-right-enter-active {
  z-index: 2;
}

.slide-right-leave-active {
  z-index: 1;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-right-enter-from {
  transform: translateX(-100%);
}

.slide-right-leave-to {
  transform: translateX(100%);
}

/* Layout styles - work with existing page CSS */
.q-page-container {
  position: relative;
}

.q-layout {
  min-height: 100vh;
  min-height: -webkit-fill-available;
}

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

/* Layout styles - work with existing page CSS */
.q-page-container {
  position: relative;
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
