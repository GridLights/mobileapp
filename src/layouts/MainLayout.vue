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
    <q-header class="bg-grey-8 safe-header">
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

        <!-- make the logo a background image to try to prevent ios from zooming it on a tap when getting version -->
        <!-- so far not helping.... -->
        <div class="logo-container no-text-select">
          <img :src="logoUrl" alt="Logo" class="logo-image" />
          <q-tooltip anchor="top left" self="bottom middle" :offset="[70, -40]">
            v1.0.8
          </q-tooltip>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-item-label header> Menu </q-item-label>

        <LeftSidebar
          v-for="link in LeftSidebars"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import LeftSidebar from "src/components/LeftSidebar.vue";
import logoUrl from "../assets/logo.png";

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
    icon: "rule",
    link: "/journeys",
  },
  {
    title: "Settings",
    caption: "Settings Menu",
    icon: "settings",
    link: "/settings",
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
    LeftSidebar,
  },

  setup() {
    const $q = useQuasar();
    const leftDrawerOpen = ref(false);

    onMounted(() => {
      $q.dark.set(true);
    });

    return {
      LeftSidebars: linksList,
      leftDrawerOpen,
      logoUrl,
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
