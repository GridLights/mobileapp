<template>
  <router-view />
</template>

<script>
import { defineComponent } from "vue";
// import webSocketManager from "./utils/websocketmanager";

export default defineComponent({
  name: "App",
  // mounted() {
  //   const savedIp = localStorage.getItem("ipAddress");
  //   const wsUrl = savedIp ? `ws://${savedIp}:80/ws` : "ws://4.3.2.1:80/ws";

  //   console.log("initing");
  //   webSocketManager.init(wsUrl);
  // },
});
</script>

<style lang="sass">
.no-text-select
  user-select: none /* All modern browsers disable text select*/
  -webkit-user-select: none /* Safari */ç
  cursor: default
</style>
