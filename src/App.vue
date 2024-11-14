<template>
  <router-view />
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
});
</script>

<style lang="sass">
.no-text-select
  user-select: none /* All modern browsers disable text select*/
  -webkit-user-select: none /* Safari */ç
  cursor: default
</style>
