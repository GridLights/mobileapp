//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// MainLayout.vue
//
// Main application layout with page container
//
// Author: Tavis Hord - tavis@sideburn.com
// Created 11/12/24
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

<template>
  <q-layout view="lHh Lpr lff">
    <!-- <q-header class="bg-grey-8 safe-header">
      <q-toolbar class="q-py-sm">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="no-text-select"> Sol Spektrum </q-toolbar-title>

        <div class="logo-container no-text-select">
          <img :src="logoUrl" alt="Logo" class="logo-image" />
          <q-tooltip anchor="top left" self="bottom middle" :offset="[70, -40]">
            v1.0.9
          </q-tooltip>
        </div>
      </q-toolbar>
    </q-header> -->

    <!-- <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-item-label header> Menu </q-item-label>

        <LeftSidebar
          v-for="link in LeftSidebars"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer> -->

    <q-page-container class="q-pb-md">
      <router-view v-slot="{ Component }">
        <transition
          :enter-active-class="transitionClasses.enter"
          :leave-active-class="transitionClasses.leave"
          :duration="300"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

    <BottomTabBar :items="LeftSidebars" />
  </q-layout>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useRoute } from "vue-router";
import LeftSidebar from "src/components/LeftSidebar.vue";
import BottomTabBar from "components/BottomTabBar.vue";
//import logoUrl from "../assets/logo.png";

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
    caption: "Sliders and stuff",
    icon: "menu_open",
    link: "/randomizer",
  },
  {
    title: "Randomizer",
    caption: "Sliders and stuff",
    icon: "tune",
    link: "/randomizer",
  },
  // {
  //   title: "Settings",
  //   caption: "Settings Menu",
  //   icon: "settings",
  //   link: "/settings",
  // },
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
    LeftSidebar,
    BottomTabBar,
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
    });

    return {
      LeftSidebars: linksList,
      leftDrawerOpen,
      //logoUrl,
      transitionClasses,
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
