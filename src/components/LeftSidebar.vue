//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// LeftSidebar.vue
//
// Left slide in menu bar with nav buttons
//
// Author: Tavis Hord - tavis@sideburn.com
// Created 11/12/24
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
<template>
  <q-item
    clickable
    :to="isInternalLink ? link : undefined"
    :href="!isInternalLink ? link : undefined"
    :target="!isInternalLink ? '_blank' : undefined"
  >
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { defineComponent, computed } from "vue";

export default defineComponent({
  name: "LeftSidebar",
  props: {
    title: {
      type: String,
      required: true,
    },

    caption: {
      type: String,
      default: "",
    },

    link: {
      type: String,
      default: "#",
    },

    icon: {
      type: String,
      default: "",
    },
  },

  setup(props) {
    const isInternalLink = computed(() => {
      return props.link && props.link.startsWith("/");
    });

    return {
      isInternalLink,
    };
  },
});
</script>
