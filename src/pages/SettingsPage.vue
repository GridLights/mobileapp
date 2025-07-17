<template>
  <q-page class="no-text-select">
    <!-- Fixed Header Container -->
    <div class="header-container">
      <!-- Left Icon - Back Arrow -->
      <div class="header-icon left-icon clickable" @click="goBack">
        <q-icon name="arrow_back" size="24px" />
      </div>

      <!-- Center Text -->
      <div class="header-title">SETTINGS</div>

      <!-- Right Icon - Empty for balance -->
      <div class="header-icon right-icon"></div>
    </div>

    <!-- Scrollable Content Area -->
    <div class="content-area-settings">
      <!-- content goes here wrapped in content-padding divs -->
      <div class="content-padding"></div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from "vue";

export default {
  name: "SettingsPage",
  setup() {
    const ipAddress = ref("4.3.2.1");

    // Load IP Address from local storage on page reload
    onMounted(() => {
      const savedIp = localStorage.getItem("ipAddress");
      if (savedIp) {
        ipAddress.value = savedIp;
      }
    });

    const saveIpAddress = () => {
      console.log("Saved IP Address: http://" + ipAddress.value);
      localStorage.setItem("ipAddress", ipAddress.value);
    };

    const validateIpAddress = (value) => {
      const validIpPattern = /^\d{0,3}(\.\d{0,3}){0,3}$/;
      if (validIpPattern.test(value)) {
        ipAddress.value = value;
      }
    };

    return {
      ipAddress,
      saveIpAddress,
      validateIpAddress,
    };
  },
  methods: {
    goBack() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.clickable {
  cursor: pointer;
  transition: opacity 0.2s ease;
  border-radius: 50%;
}

.clickable:hover {
  opacity: 0.7;
}

.content-area-settings {
  margin-top: 0px;
  margin-bottom: 10px;
  height: calc(100vh - 90px);
  overflow-y: auto;
}

.content-padding {
  margin-top: 10px;
  padding: 0 20px 20px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
