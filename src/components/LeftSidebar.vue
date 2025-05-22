//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// LeftSidebar.vue // // Left slide in menu bar with nav buttons // // Author:
Tavis Hord - tavis@sideburn.com // Created 11/12/24
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
<template>
  <q-item
    clickable
    :active="isActive"
    active-class="text-orange"
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
import { useRoute } from "vue-router";

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
    const route = useRoute();

    const isInternalLink = computed(() => {
      return props.link && props.link.startsWith("/");
    });

    const isActive = computed(() => {
      return props.link === route.path;
    });

    return {
      isInternalLink,
      isActive,
    };
  },
});
</script>
