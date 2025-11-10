//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// SettingsPage.vue // // Application settings page // // Author: Tavis Hord -
tavis@sideburn.com
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

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
      <div class="content-padding">
        <!-- Network Connection Status -->
        <div class="settings-section">
          <div class="section-header">
            <q-icon name="wifi" size="20px" />
            <span>Network Connection</span>
          </div>

          <div class="setting-item">
            <div class="setting-label">Current Network Status</div>
            <div class="network-status">
              <div class="status-row">
                <q-icon
                  :name="connectionIcon"
                  size="16px"
                  :color="connectionStatus === 'online' ? 'green' : 'orange'"
                />
                <span class="status-text">{{ connectionStatusText }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- WLED Instance Search -->
        <div class="settings-section">
          <div class="section-header">
            <q-icon name="settings" size="20px" />
            <span>WLED Instance Search</span>
            <q-btn
              flat
              dense
              size="sm"
              icon="search"
              label="Search Devices"
              class="search-btn"
            />
          </div>

          <div class="setting-item">
            <div class="setting-label">Found 3 WLED device (s).</div>
            <div class="setting-sublabel">Tap to select</div>

            <div class="wled-devices-list">
              <div
                class="wled-device-item"
                v-for="device in wledDevices"
                :key="device.ip"
                :class="{ selected: device.selected }"
                @click="selectDevice(device)"
              >
                <div class="device-info">
                  <div class="device-name">{{ device.name }}</div>
                  <div class="device-ip">IP: {{ device.ip }}</div>
                </div>
                <q-icon
                  v-if="device.selected"
                  name="radio_button_checked"
                  size="20px"
                  color="black"
                />
                <q-icon
                  v-else
                  name="radio_button_unchecked"
                  size="20px"
                  color="grey-5"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Device Information -->
        <div class="settings-section">
          <div class="section-header">
            <q-icon name="info" size="20px" />
            <span>Device Information</span>
          </div>

          <div class="setting-item">
            <div class="setting-label">Device Name</div>
            <q-input
              v-model="deviceName"
              outlined
              dense
              class="device-input"
              placeholder="Enter device name"
            />
          </div>

          <div class="setting-item">
            <div class="setting-label">Device MAC</div>
            <div class="device-mac">{{ deviceMac }}</div>
          </div>
        </div>

        <!-- Firmware Update -->
        <div class="settings-section">
          <div class="section-header">
            <q-icon name="system_update" size="20px" />
            <span>Firmware Update</span>
          </div>

          <div class="setting-item">
            <div class="setting-label">Current WLED Firmware</div>
            <div class="firmware-info">
              <div class="firmware-version">WLED 0.14.1</div>
              <div class="app-version">App Version</div>
              <div class="version-number">v2.10</div>
            </div>
          </div>

          <div class="setting-item">
            <q-btn
              flat
              dense
              icon="refresh"
              label="Check For Updates"
              class="update-btn"
              @click="checkForUpdates"
            />
          </div>

          <div class="setting-item">
            <div class="setting-label">Upload Custom Firmware</div>
            <div class="upload-section">
              <q-btn
                flat
                dense
                icon="upload_file"
                label="Choose File"
                class="upload-btn"
                @click="chooseFile"
              />
              <span class="file-status">{{ fileStatus }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted, computed } from "vue";

export default {
  name: "SettingsPage",
  setup() {
    const ipAddress = ref("4.3.2.1");
    const deviceName = ref("Living Room Led Strip");
    const deviceMac = ref("IP: 192.168.1.101");
    const fileStatus = ref("No File Chosen");

    const connectionType = ref("unknown");
    const connectionStatus = ref("unknown");
    const effectiveType = ref("");

    const wledDevices = ref([
      { name: "Living Room Grid", ip: "192.168.1.101", selected: true },
      { name: "Kitchen Grid", ip: "192.168.1.101", selected: false },
      { name: "Main Area Grid", ip: "192.168.1.101", selected: false },
    ]);

    // Detect network connection type
    const detectConnectionType = () => {
      // Check if online
      connectionStatus.value = navigator.onLine ? "online" : "offline";

      // Try to get Network Information API (different browsers use different names)
      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection ||
        null;

      if (connection) {
        // Get connection type - prefer 'type' over 'effectiveType'
        // 'type' can be: "wifi", "cellular", "ethernet", "none", "unknown"
        // 'effectiveType' indicates speed: "4g", "3g", "slow-2g", "2g" (NOT connection type!)
        if (connection.type) {
          // Use the type directly if available
          connectionType.value = connection.type;
        } else {
          // If type is not available, we need to infer from other properties
          const isMobile =
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
              navigator.userAgent
            );

          if (connection.effectiveType) {
            const effType = connection.effectiveType.toLowerCase();
            // Only infer cellular if we're on mobile AND effectiveType suggests it
            if (
              isMobile &&
              (effType.includes("4g") ||
                effType.includes("3g") ||
                effType.includes("2g"))
            ) {
              connectionType.value = "cellular";
              effectiveType.value = connection.effectiveType;
            } else if (
              !isMobile &&
              connection.downlink &&
              connection.downlink > 10
            ) {
              // Desktop with fast connection likely means Ethernet
              connectionType.value = "ethernet";
              effectiveType.value = connection.effectiveType;
            } else {
              // Default to unknown if we can't determine
              connectionType.value = "unknown";
              effectiveType.value = connection.effectiveType;
            }
          } else {
            // No type or effectiveType - default to unknown
            connectionType.value = "unknown";
          }
        }

        // Store effectiveType if available
        if (connection.effectiveType) {
          effectiveType.value = connection.effectiveType;
        }

        // Listen for connection changes
        connection.addEventListener("change", () => {
          if (connection.type) {
            connectionType.value = connection.type;
          } else {
            // Re-run detection logic
            const isMobile =
              /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
              );

            if (connection.effectiveType) {
              const effType = connection.effectiveType.toLowerCase();
              if (
                isMobile &&
                (effType.includes("4g") ||
                  effType.includes("3g") ||
                  effType.includes("2g"))
              ) {
                connectionType.value = "cellular";
              } else if (
                !isMobile &&
                connection.downlink &&
                connection.downlink > 10
              ) {
                connectionType.value = "ethernet";
              } else {
                connectionType.value = "unknown";
              }
            }
          }

          if (connection.effectiveType) {
            effectiveType.value = connection.effectiveType;
          }
          connectionStatus.value = navigator.onLine ? "online" : "offline";
        });
      } else {
        // Fallback: try to detect based on online status and user agent
        const isMobile =
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          );

        if (!navigator.onLine) {
          connectionType.value = "none";
        } else {
          // If no API available, guess based on device type
          connectionType.value = isMobile ? "unknown" : "ethernet";
        }
      }

      // Listen for online/offline events
      const handleOnline = () => {
        connectionStatus.value = "online";
        // Re-detect connection type when coming back online
        const conn =
          navigator.connection ||
          navigator.mozConnection ||
          navigator.webkitConnection ||
          null;
        if (!conn) {
          connectionType.value = "unknown";
        }
      };

      const handleOffline = () => {
        connectionStatus.value = "offline";
        connectionType.value = "none";
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    };

    // Load IP Address from local storage on page reload
    onMounted(() => {
      const savedIp = localStorage.getItem("ipAddress");
      if (savedIp) {
        ipAddress.value = savedIp;
      }

      // Detect connection type on mount
      detectConnectionType();
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

    const selectDevice = (device) => {
      wledDevices.value.forEach((d) => (d.selected = false));
      device.selected = true;
    };

    const checkForUpdates = () => {
      console.log("Checking for updates...");
    };

    const chooseFile = () => {
      console.log("Choosing file...");
      // This would trigger a file picker
    };

    // Computed properties for connection display
    const connectionStatusText = computed(() => {
      if (connectionStatus.value === "offline") {
        return "No internet connection";
      }

      const typeMap = {
        wifi: "Connected via WiFi",
        cellular: `Connected via Cellular${
          effectiveType.value ? ` (${effectiveType.value})` : ""
        }`,
        ethernet: "Connected via Ethernet",
        none: "No network connection",
        unknown: "Connected (connection type unknown)",
      };

      return (
        typeMap[connectionType.value] || `Connected via ${connectionType.value}`
      );
    });

    const connectionIcon = computed(() => {
      const iconMap = {
        wifi: "wifi",
        cellular: "signal_cellular_alt",
        ethernet: "cable",
        none: "signal_wifi_off",
        unknown: "cloud",
      };
      return iconMap[connectionType.value] || "cloud";
    });

    return {
      ipAddress,
      deviceName,
      deviceMac,
      fileStatus,
      wledDevices,
      saveIpAddress,
      validateIpAddress,
      selectDevice,
      checkForUpdates,
      chooseFile,
      connectionType,
      connectionStatus,
      connectionStatusText,
      connectionIcon,
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

.q-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 90px);
  overflow: hidden;
  position: relative;
}

.content-area-settings {
  margin-top: 100px;
  margin-bottom: 10px;
  height: calc(100vh - 90px);
  overflow-y: auto;
}

.content-padding {
  margin-top: 10px;
  padding: 0 20px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-section {
  background-color: var(--controls-bg-color);
  border-radius: 8px;
  padding: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--controls-label-color);
  margin-bottom: 15px;
}

.section-header svg,
.section-header .q-icon {
  color: var(--controls-icon-color);
}

.search-btn,
.scan-btn {
  margin-left: auto;
  font-size: 12px;
  color: var(--controls-button--color);
}

.setting-item {
  margin-bottom: 15px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--controls-label-color);
  margin-bottom: 8px;
}

.setting-sublabel {
  font-size: 12px;
  color: var(--controls-icon-color);
  margin-bottom: 12px;
}

.network-status {
  background-color: var(--controls-input-field-bg-color);
  border-radius: 6px;
  padding: 12px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-text {
  flex: 1;
  font-size: 14px;
  color: var(--controls-label-color);
}

.disconnect-btn,
.connect-btn {
  font-size: 12px;
  color: var(--controls-icon-color);
}

.networks-list {
  background-color: var(--controls-input-field-bg-color);
  border-radius: 6px;
  padding: 8px;
  margin-top: 8px;
}

.network-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  margin-bottom: 4px;
  background-color: var(--controls-dropdown-menu--color);
  border-radius: 4px;
}

.network-item:last-child {
  margin-bottom: 0;
}

.network-item .q-icon {
  color: var(--controls-icon-color);
}

.network-name {
  flex: 1;
  font-size: 14px;
  color: var(--controls-label-color);
}

.network-type {
  font-size: 12px;
  color: var(--controls-icon-color);
}

.wled-devices-list {
  background-color: var(--controls-input-field-bg-color);
  border-radius: 6px;
  padding: 8px;
}

.wled-device-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 4px;
  background-color: var(--controls-dropdown-menu--color);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.wled-device-item:hover {
  background-color: var(--controls-bg-color);
}

.wled-device-item.selected {
  background-color: var(--controls-slider-bar--color);
}

.wled-device-item:last-child {
  margin-bottom: 0;
}

.device-info {
  flex: 1;
}

.device-name {
  font-size: 14px;
  color: var(--controls-label-color);
  font-weight: 500;
}

.device-ip {
  font-size: 12px;
  color: var(--controls-icon-color);
}

.device-input {
  margin-top: 4px;
}

.device-input :deep(.q-field__control) {
  background-color: var(--controls-input-field-bg-color) !important;
  border-radius: 4px;
}

.device-input :deep(.q-field__native) {
  color: var(--controls-label-color) !important;
}

.device-mac {
  font-size: 14px;
  color: var(--controls-icon-color);
  background-color: var(--controls-input-field-bg-color);
  padding: 8px 12px;
  border-radius: 4px;
}

.firmware-info {
  background-color: var(--controls-input-field-bg-color);
  border-radius: 6px;
  padding: 12px;
}

.firmware-version {
  font-size: 14px;
  color: var(--controls-label-color);
  font-weight: 500;
  margin-bottom: 8px;
}

.app-version {
  font-size: 12px;
  color: var(--controls-icon-color);
  margin-bottom: 4px;
}

.version-number {
  font-size: 14px;
  color: var(--controls-label-color);
}

.update-btn,
.upload-btn {
  font-size: 12px;
  color: var(--controls-button--color);
}

.upload-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.file-status {
  font-size: 12px;
  color: var(--controls-icon-color);
  flex: 1;
}
</style>
