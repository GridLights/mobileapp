<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-grey-8">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title> Sol Spektrum </q-toolbar-title>

        <q-img src="~/assets/logo.png" width="72px">
          <q-tooltip anchor="top left" self="bottom middle" :offset="[50, -10]">
            v1.0
          </q-tooltip>
        </q-img>
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

const linksList = [
  {
    title: "About",
    caption: "About us",
    icon: "info",
  },
  {
    title: "Gridlights",
    caption: "Powered by Gridlights",
    icon: "code",
    link: "https://www.gridlights.co",
  },
  {
    title: "Settings",
    caption: "User preferences",
    icon: "settings",
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
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>
